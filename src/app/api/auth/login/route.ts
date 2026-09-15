import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    if (!email || !password) {
      return Response.json(
        { error: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    const user = rows[0];
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return Response.json(
        { error: "Email atau kata sandi salah." },
        { status: 401 }
      );
    }
    await createSessionCookie(user.id);
    return Response.json({
      ok: true,
      data: { id: user.id, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("[login]", err);
    return Response.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
