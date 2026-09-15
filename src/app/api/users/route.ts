import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  ApiError,
  can,
  handleApiError,
  hashPassword,
  requireUser,
} from "@/lib/auth";

const ROLES = ["owner", "manager", "staff"];

export async function POST(req: Request) {
  try {
    const actor = await requireUser();
    if (!can.manageUsers(actor.role)) {
      throw new ApiError(403, "Hanya pemilik yang dapat mengelola pengguna.");
    }
    const body = await req.json().catch(() => null);
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const role = String(body?.role ?? "staff");

    if (!name) throw new ApiError(400, "Nama wajib diisi.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(400, "Format email tidak valid.");
    }
    if (password.length < 6) {
      throw new ApiError(400, "Kata sandi minimal 6 karakter.");
    }
    if (!ROLES.includes(role)) throw new ApiError(400, "Peran tidak valid.");

    const dup = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (dup.length) throw new ApiError(409, "Email sudah terdaftar.");

    const inserted = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash: hashPassword(password),
        role: role as "owner" | "manager" | "staff",
      })
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    return Response.json({ ok: true, data: inserted[0] }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
