import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  ApiError,
  can,
  handleApiError,
  hashPassword,
  parseId,
  requireUser,
} from "@/lib/auth";

const ROLES = ["owner", "manager", "staff"];

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireUser();
    if (!can.manageUsers(actor.role)) {
      throw new ApiError(403, "Hanya pemilik yang dapat mengelola pengguna.");
    }
    const { id } = await params;
    const uid = parseId(id);
    const body = await req.json().catch(() => null);

    const existing = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    if (!existing.length) throw new ApiError(404, "Pengguna tidak ditemukan.");

    const patch: Record<string, unknown> = {};
    if (body?.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) throw new ApiError(400, "Nama wajib diisi.");
      patch.name = name;
    }
    if (body?.role !== undefined) {
      if (!ROLES.includes(String(body.role))) {
        throw new ApiError(400, "Peran tidak valid.");
      }
      if (uid === actor.id && String(body.role) !== "owner") {
        throw new ApiError(400, "Anda tidak dapat menurunkan peran akun sendiri.");
      }
      patch.role = String(body.role);
    }
    if (body?.password) {
      const password = String(body.password);
      if (password.length < 6) {
        throw new ApiError(400, "Kata sandi minimal 6 karakter.");
      }
      patch.passwordHash = hashPassword(password);
    }

    if (!Object.keys(patch).length) throw new ApiError(400, "Tidak ada perubahan.");

    const updated = await db
      .update(users)
      .set(patch)
      .where(eq(users.id, uid))
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role });
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
    const actor = await requireUser();
    if (!can.manageUsers(actor.role)) {
      throw new ApiError(403, "Hanya pemilik yang dapat mengelola pengguna.");
    }
    const { id } = await params;
    const uid = parseId(id);
    if (uid === actor.id) {
      throw new ApiError(400, "Anda tidak dapat menghapus akun sendiri.");
    }
    const owners = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "owner"));
    const target = owners.find((o) => o.id === uid);
    if (target && owners.length <= 1) {
      throw new ApiError(400, "Tidak dapat menghapus pemilik terakhir.");
    }
    const deleted = await db
      .delete(users)
      .where(eq(users.id, uid))
      .returning({ id: users.id });
    if (!deleted.length) throw new ApiError(404, "Pengguna tidak ditemukan.");
    return Response.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
