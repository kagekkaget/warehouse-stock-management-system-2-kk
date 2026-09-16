export const runtime = "nodejs";

import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, stockMovements } from "@/db/schema";
import {
  ApiError,
  can,
  handleApiError,
  parseId,
  requireUser,
  toInt,
} from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    if (!can.adjustStock(user.role)) {
      throw new ApiError(403, "Anda tidak dapat mengubah stok.");
    }
    const { id } = await params;
    const pid = parseId(id);
    const body = await req.json().catch(() => null);
    const type = String(body?.type ?? "");
    if (type !== "masuk" && type !== "keluar") {
      throw new ApiError(400, "Jenis pergerakan harus masuk/keluar.");
    }
    const qty = toInt(body?.qty, "Jumlah", { min: 1 });
    const note = body?.note ? String(body.note).trim().slice(0, 300) : null;

    const rows = await db
      .select()
      .from(products)
      .where(eq(products.id, pid))
      .limit(1);
    const product = rows[0];
    if (!product) throw new ApiError(404, "Produk tidak ditemukan.");
    if (type === "keluar" && qty > product.stock) {
      throw new ApiError(
        400,
        `Stok tidak cukup. Tersedia ${product.stock} ${product.unit}.`
      );
    }

    const delta = type === "masuk" ? qty : -qty;
    await db
      .update(products)
      .set({ stock: sql`${products.stock} + ${delta}`, updatedAt: new Date() })
      .where(eq(products.id, pid));
    await db.insert(stockMovements).values({
      productId: pid,
      type,
      qty,
      note,
      userId: user.id,
    });

    return Response.json({ ok: true, data: { stock: product.stock + delta } });
  } catch (err) {
    return handleApiError(err);
  }
}
