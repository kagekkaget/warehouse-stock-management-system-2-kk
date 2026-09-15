import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, wasteLogs } from "@/db/schema";
import {
  ApiError,
  can,
  handleApiError,
  requireUser,
  toInt,
} from "@/lib/auth";

const REASONS = ["kedaluwarsa", "rusak", "lainnya"];

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!can.recordWaste(user.role)) {
      throw new ApiError(403, "Anda tidak dapat mencatat limbah.");
    }
    const body = await req.json().catch(() => null);
    const productId = toInt(body?.productId, "Produk", { min: 1 });
    const qty = toInt(body?.qty, "Jumlah", { min: 1 });
    const reason = String(body?.reason ?? "");
    if (!REASONS.includes(reason)) {
      throw new ApiError(400, "Alasan limbah tidak valid.");
    }
    const note = body?.note ? String(body.note).trim().slice(0, 300) : null;

    const rows = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    const product = rows[0];
    if (!product) throw new ApiError(404, "Produk tidak ditemukan.");
    if (qty > product.stock) {
      throw new ApiError(
        400,
        `Jumlah melebihi stok tersedia (${product.stock} ${product.unit}).`
      );
    }

    const loss = qty * product.costPrice;
    await db.insert(wasteLogs).values({
      productId,
      qty,
      reason,
      note,
      loss,
      userId: user.id,
    });
    await db
      .update(products)
      .set({ stock: sql`${products.stock} - ${qty}`, updatedAt: new Date() })
      .where(eq(products.id, productId));

    return Response.json({ ok: true }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
