import { db } from "@/db";
import { customers } from "@/db/schema";
import {
  ApiError,
  can,
  handleApiError,
  requireUser,
} from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!can.createCustomer(user.role)) {
      throw new ApiError(403, "Anda tidak dapat menambah pelanggan.");
    }
    const body = await req.json().catch(() => null);
    const name = String(body?.name ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    if (!name) throw new ApiError(400, "Nama pelanggan wajib diisi.");
    if (!phone) throw new ApiError(400, "Nomor telepon wajib diisi.");

    const inserted = await db
      .insert(customers)
      .values({
        name,
        phone,
        email: body?.email ? String(body.email).trim() : null,
        address: body?.address ? String(body.address).trim() : null,
        preferences: body?.preferences ? String(body.preferences).trim() : null,
      })
      .returning();

    return Response.json({ ok: true, data: inserted[0] }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
