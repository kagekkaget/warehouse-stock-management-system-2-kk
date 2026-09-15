import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { compare, hashSync } from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

export type { Role } from "./roles";
export { can, ROLE_LABEL } from "./roles";
import type { Role } from "./roles";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export const COOKIE_NAME = "gk_session";
const SESSION_DAYS = 7;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function hashPassword(password: string) {
  return hashSync(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return compare(password, hash);
}

export async function createSessionCookie(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.insert(sessions).values({ token, userId, expiresAt });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  store.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.token, token));
    return null;
  }
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}

/**
 * Guard for API routes. Throws ApiError when unauthenticated/unauthorized.
 */
export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new ApiError(401, "Silakan masuk terlebih dahulu.");
  if (roles && !roles.includes(user.role)) {
    throw new ApiError(403, "Anda tidak memiliki akses untuk aksi ini.");
  }
  return user;
}

export function handleApiError(err: unknown): Response {
  if (err instanceof ApiError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  console.error("[api]", err);
  return Response.json(
    { error: "Terjadi kesalahan server. Silakan coba lagi." },
    { status: 500 }
  );
}

export function parseId(raw: string | string[] | undefined): number {
  const id = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "ID tidak valid.");
  }
  return id;
}

export function requireFields(
  body: Record<string, unknown>,
  fields: string[]
) {
  for (const f of fields) {
    const v = body[f];
    if (v === undefined || v === null || v === "") {
      throw new ApiError(400, `Kolom "${f}" wajib diisi.`);
    }
  }
}

export function toInt(
  v: unknown,
  field: string,
  opts: { min?: number } = {}
): number {
  const n = Number(v);
  if (!Number.isFinite(n)) {
    throw new ApiError(400, `Kolom "${field}" harus berupa angka.`);
  }
  const i = Math.trunc(n);
  if (opts.min !== undefined && i < opts.min) {
    throw new ApiError(400, `Kolom "${field}" minimal ${opts.min}.`);
  }
  return i;
}

export function optionalDate(v: unknown): string | null {
  if (v === undefined || v === null || v === "") return null;
  const s = String(v);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw new ApiError(400, "Format tanggal tidak valid (YYYY-MM-DD).");
  }
  return s;
}

export { and };
