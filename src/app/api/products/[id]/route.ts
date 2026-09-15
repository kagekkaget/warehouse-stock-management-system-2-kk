import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import {
  ApiError,
  can,
  handleApiError,
  optionalDate,
  parseId,
  requireUser,
  toInt,
} from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    if (!can.manageProducts(user.role)) {
      throw new ApiError(403, "Hanya pemilik/manajer yang dapat mengubah produk.");
    }
    const { id } = await params;
    const pid = parseId(id);
    const body = await req.json().catch(() => null);
    if (!body) throw new ApiError(400, "Data tidak valid.");

    const existing = await db.select().from(products).where(eq(products.id, pid)).limit(1);
    if (!existing.length) throw new ApiError(404, "Produk tidak ditemukan.");

    const name = body.name !== undefined ? String(body.name).trim() : existing[0].name;
    const sku =
      body.sku !== undefined
        ? String(body.sku).trim().toUpperCase()
        : existing[0].sku;
    if (!name) throw new ApiError(400, "Nama produk wajib diisi.");
    if (!sku) throw new ApiError(400, "Kode SKU wajib diisi.");

    const dup = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.sku, sku), ne(products.id, pid)))
      .limit(1);
    if (dup.length) throw new ApiError(409, `SKU "${sku}" sudah digunakan produk lain.`);

    const updated = await db
      .update(products)
      .set({
        name,
        sku,
        category:
          body.category !== undefined
            ? String(body.category).trim() || "Lainnya"
            : existing[0].category,
        unit:
          body.unit !== undefined
            ? String(body.unit).trim() || "pcs"
            : existing[0].unit,
        costPrice:
          body.costPrice !== undefined
            ? toInt(body.costPrice, "Harga beli", { min: 0 })
            : existing[0].costPrice,
        sellPrice:
          body.sellPrice !== undefined
            ? toInt(body.sellPrice, "Harga jual", { min: 0 })
            : existing[0].sellPrice,
        minStock:
          body.minStock !== undefined
            ? toInt(body.minStock, "Stok minimum", { min: 0 })
            : existing[0].minStock,
        expiryDate:
          body.expiryDate !== undefined
            ? optionalDate(body.expiryDate)
            : existing[0].expiryDate,
        supplier:
          body.supplier !== undefined
            ? body.supplier
              ? String(body.supplier).trim()
              : null
            : existing[0].supplier,
        updatedAt: new Date(),
      })
      .where(eq(products.id, pid))
      .returning();

    return Response.json({ ok: true, data: updated[0] });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    if (!can.manageProducts(user.role)) {
      throw new ApiError(403, "Hanya pemilik/manajer yang dapat menghapus produk.");
    }
    const { id } = await params;
    const pid = parseId(id);
    const deleted = await db
      .delete(products)
      .where(eq(products.id, pid))
      .returning({ id: products.id });
    if (!deleted.length) throw new ApiError(404, "Produk tidak ditemukan.");
    return Response.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
