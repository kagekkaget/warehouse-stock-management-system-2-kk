export const runtime = "nodejs";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import {
  ApiError,
  can,
  handleApiError,
  parseId,
  requireUser,
} from "@/lib/auth";

const PAYMENTS = ["lunas", "belum_bayar", "dp"];
const STATUSES = ["diproses", "selesai", "dibatalkan"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    if (!can.updateOrder(user.role)) {
      throw new ApiError(403, "Anda tidak dapat mengubah pesanan.");
    }
    const { id } = await params;
    const oid = parseId(id);
    const body = await req.json().catch(() => null);

    const patch: Record<string, unknown> = {};
    if (body?.paymentStatus !== undefined) {
      if (!PAYMENTS.includes(String(body.paymentStatus))) {
        throw new ApiError(400, "Status pembayaran tidak valid.");
      }
      patch.paymentStatus = String(body.paymentStatus);
    }
    if (body?.status !== undefined) {
      if (!STATUSES.includes(String(body.status))) {
        throw new ApiError(400, "Status pesanan tidak valid.");
      }
      patch.status = String(body.status);
    }
    if (!Object.keys(patch).length) {
      throw new ApiError(400, "Tidak ada perubahan.");
    }

    const updated = await db
      .update(orders)
      .set(patch)
      .where(eq(orders.id, oid))
      .returning();
    if (!updated.length) throw new ApiError(404, "Pesanan tidak ditemukan.");
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
    if (!can.deleteOrder(user.role)) {
      throw new ApiError(403, "Hanya pemilik/manajer yang dapat menghapus pesanan.");
    }
    const { id } = await params;
    const oid = parseId(id);
    const deleted = await db
      .delete(orders)
      .where(eq(orders.id, oid))
      .returning({ id: orders.id });
    if (!deleted.length) throw new ApiError(404, "Pesanan tidak ditemukan.");
    return Response.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
