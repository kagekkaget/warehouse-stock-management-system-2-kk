import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, stockMovements } from "@/db/schema";
import {
  ApiError,
  can,
  handleApiError,
  optionalDate,
  requireUser,
  toInt,
} from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!can.manageProducts(user.role)) {
      throw new ApiError(403, "Hanya pemilik/manajer yang dapat menambah produk.");
    }
    const body = await req.json().catch(() => null);
    if (!body) throw new ApiError(400, "Data tidak valid.");

    const name = String(body.name ?? "").trim();
    const sku = String(body.sku ?? "").trim().toUpperCase();
    if (!name) throw new ApiError(400, "Nama produk wajib diisi.");
    if (!sku) throw new ApiError(400, "Kode SKU wajib diisi.");

    const dup = await db.select({ id: products.id }).from(products).where(eq(products.sku, sku)).limit(1);
    if (dup.length) throw new ApiError(409, `SKU "${sku}" sudah digunakan produk lain.`);

    const costPrice = toInt(body.costPrice ?? 0, "Harga beli", { min: 0 });
    const sellPrice = toInt(body.sellPrice ?? 0, "Harga jual", { min: 0 });
    const stock = toInt(body.stock ?? 0, "Stok awal", { min: 0 });
    const minStock = toInt(body.minStock ?? 5, "Stok minimum", { min: 0 });
    const expiryDate = optionalDate(body.expiryDate);

    const inserted = await db
      .insert(products)
      .values({
        name,
        sku,
        category: String(body.category ?? "Lainnya").trim() || "Lainnya",
        unit: String(body.unit ?? "pcs").trim() || "pcs",
        costPrice,
        sellPrice,
        stock,
        minStock,
        expiryDate,
        supplier: body.supplier ? String(body.supplier).trim() : null,
      })
      .returning();

    if (stock > 0) {
      await db.insert(stockMovements).values({
        productId: inserted[0].id,
        type: "masuk",
        qty: stock,
        note: "Stok awal",
        userId: user.id,
      });
    }

    return Response.json({ ok: true, data: inserted[0] }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
