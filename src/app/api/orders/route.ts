export const runtime = "nodejs";

import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { customers, orderItems, orders, products, stockMovements } from "@/db/schema";
import {
  ApiError,
  can,
  handleApiError,
  requireUser,
  toInt,
} from "@/lib/auth";

const PAYMENTS = ["lunas", "belum_bayar", "dp"];

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!can.createOrder(user.role)) {
      throw new ApiError(403, "Anda tidak dapat membuat pesanan.");
    }
    const body = await req.json().catch(() => null);
    const customerId = toInt(body?.customerId, "Pelanggan", { min: 1 });
    const paymentStatus = String(body?.paymentStatus ?? "belum_bayar");
    if (!PAYMENTS.includes(paymentStatus)) {
      throw new ApiError(400, "Status pembayaran tidak valid.");
    }
    const notes = body?.notes ? String(body.notes).trim().slice(0, 300) : null;
    const items: { productId: number; qty: number }[] = Array.isArray(body?.items)
      ? body.items.map((it: Record<string, unknown>) => ({
          productId: toInt(it.productId, "Produk", { min: 1 }),
          qty: toInt(it.qty, "Jumlah item", { min: 1 }),
        }))
      : [];
    if (!items.length) throw new ApiError(400, "Pesanan minimal berisi 1 item.");

    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);
    if (!customer.length) throw new ApiError(404, "Pelanggan tidak ditemukan.");

    const prods = await db
      .select()
      .from(products)
      .where(inArray(products.id, items.map((i) => i.productId)));
    const byId = new Map(prods.map((p) => [p.id, p]));

    // Merge duplicate lines
    const merged = new Map<number, number>();
    for (const it of items) {
      merged.set(it.productId, (merged.get(it.productId) ?? 0) + it.qty);
    }

    for (const [pid, qty] of merged) {
      const p = byId.get(pid);
      if (!p) throw new ApiError(404, `Produk #${pid} tidak ditemukan.`);
      if (qty > p.stock) {
        throw new ApiError(
          400,
          `Stok "${p.name}" tidak cukup (tersedia ${p.stock} ${p.unit}).`
        );
      }
    }

    const orderNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
    let total = 0;

    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(orders)
        .values({
          orderNumber,
          customerId,
          status: "diproses",
          paymentStatus,
          total: 0,
          notes,
          createdBy: user.id,
        })
        .returning();
      const order = inserted[0];

      for (const [pid, qty] of merged) {
        const p = byId.get(pid)!;
        const subtotal = p.sellPrice * qty;
        total += subtotal;
        await tx.insert(orderItems).values({
          orderId: order.id,
          productId: pid,
          productName: p.name,
          qty,
          price: p.sellPrice,
          subtotal,
        });
        await tx
          .update(products)
          .set({ stock: p.stock - qty, updatedAt: new Date() })
          .where(eq(products.id, pid));
        await tx.insert(stockMovements).values({
          productId: pid,
          type: "keluar",
          qty,
          note: `Penjualan ${orderNumber}`,
          userId: user.id,
        });
      }

      await tx
        .update(orders)
        .set({ total })
        .where(eq(orders.id, order.id));
    });

    return Response.json(
      { ok: true, data: { orderNumber, total } },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
