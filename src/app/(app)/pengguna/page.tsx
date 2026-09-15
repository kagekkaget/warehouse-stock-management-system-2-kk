import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { can, getSessionUser } from "@/lib/auth";
import { UsersManager } from "@/components/users-manager";

export const metadata = { title: "Pengguna — GudangKu" };

export default async function PenggunaPage() {
  const user = (await getSessionUser())!;
  if (!can.manageUsers(user.role)) redirect("/");

  const list = await db.select().from(users).orderBy(asc(users.createdAt));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Pengguna</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Halaman khusus pemilik untuk mengelola akun tim dan hak akses.
        </p>
      </header>
      <UsersManager
        list={list.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt.toISOString(),
        }))}
        selfId={user.id}
      />
    </div>
  );
}
