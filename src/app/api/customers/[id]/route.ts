import { eq } from "drizzle-orm";
import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { ApiError, can, handleApiError, parseId, requireUser } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    if (!can.editCustomer(user.role)) {
      throw new ApiError(403, "Hanya pemilik/manajer yang dapat mengubah pelanggan.");
    }
    const { id } = await params;
    const cid = parseId(id);
    const body = await req.json().catch(() => null);
    if (!body) throw new ApiError(400, "Data tidak valid.");

    const existing = await db
      .select()
      .from(customers)
      .where(eq(customers.id, cid))
      .limit(1);
    if (!existing.length) throw new ApiError(404, "Pelanggan tidak ditemukan.");

    const name = body.name !== undefined ? String(body.name).trim() : existing[0].name;
    const phone = body.phone !== undefined ? String(body.phone).trim() : existing[0].phone;
    if (!name) throw new ApiError(400, "Nama pelanggan wajib diisi.");
    if (!phone) throw new ApiError(400, "Nomor telepon wajib diisi.");

    const updated = await db
      .update(customers)
      .set({
        name,
        phone,
        email:
          body.email !== undefined
            ? body.email
              ? String(body.email).trim()
              : null
            : existing[0].email,
        address:
          body.address !== undefined
            ? body.address
              ? String(body.address).trim()
              : null
            : existing[0].address,
        preferences:
          body.preferences !== undefined
            ? body.preferences
              ? String(body.preferences).trim()
              : null
            : existing[0].preferences,
      })
      .where(eq(customers.id, cid))
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
    if (!can.deleteCustomer(user.role)) {
      throw new ApiError(403, "Hanya pemilik/manajer yang dapat menghapus pelanggan.");
    }
    const { id } = await params;
    const cid = parseId(id);

    const orderCount = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.customerId, cid))
      .limit(1);
    if (orderCount.length) {
      throw new ApiError(
        409,
        "Pelanggan memiliki riwayat pesanan. Hapus pesanan terkait terlebih dahulu."
      );
    }

    const deleted = await db
      .delete(customers)
      .where(eq(customers.id, cid))
      .returning({ id: customers.id });
    if (!deleted.length) throw new ApiError(404, "Pelanggan tidak ditemukan.");
    return Response.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
