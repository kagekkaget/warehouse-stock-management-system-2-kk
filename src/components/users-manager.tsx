"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROLE_LABEL, type Role } from "@/lib/roles";
import { deleteReq, postJSON, putJSON } from "@/lib/fetch";
import { formatDateTime } from "@/lib/format";
import { IconPencil, IconPlus, IconTrash, IconUserCog } from "./icons";
import {
  Badge,
  Btn,
  ConfirmDialog,
  EmptyState,
  Field,
  Modal,
  Select,
  TextInput,
  toast,
} from "./ui";

export type UserRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

const ROLE_CLS: Record<string, string> = {
  owner: "bg-primary-soft text-primary-strong",
  manager: "bg-teal-soft text-teal",
  staff: "bg-line-soft text-ink-soft",
};

export function UsersManager({
  list,
  selfId,
}: {
  list: UserRow[];
  selfId: number;
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState<null | { user?: UserRow }>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    const res = await deleteReq(`/api/users/${deleteTarget.id}`);
    setBusy(false);
    if (!res.ok) return toast(res.error, "error");
    toast(`Pengguna "${deleteTarget.name}" dihapus.`);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          Kelola akun tim gudang Anda dan atur hak aksesnya.
        </p>
        <Btn onClick={() => setFormOpen({})}>
          <IconPlus size={15} /> Tambah Pengguna
        </Btn>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<IconUserCog size={20} />}
          title="Belum ada pengguna"
          body="Tambahkan anggota tim untuk ikut mengelola gudang."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-line bg-surface text-left text-[11px] font-bold tracking-wide text-ink-faint uppercase">
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Peran</th>
                  <th className="px-4 py-3">Terdaftar</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-line-soft last:border-0 hover:bg-surface"
                  >
                    <td className="px-4 py-3 font-bold text-ink">
                      {u.name}
                      {u.id === selfId ? (
                        <span className="ml-2 text-[10px] font-bold text-ink-faint">
                          (Anda)
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge cls={ROLE_CLS[u.role] ?? ""}>
                        {ROLE_LABEL[u.role as Role] ?? u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-soft">
                      {formatDateTime(new Date(u.createdAt))}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          title="Ubah pengguna"
                          onClick={() => setFormOpen({ user: u })}
                          className="rounded-md p-1.5 text-ink-soft hover:bg-line-soft"
                        >
                          <IconPencil size={15} />
                        </button>
                        {u.id !== selfId && (
                          <button
                            title="Hapus pengguna"
                            onClick={() => setDeleteTarget(u)}
                            className="rounded-md p-1.5 text-danger hover:bg-danger-soft"
                          >
                            <IconTrash size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {formOpen && (
        <UserFormModal user={formOpen.user} onClose={() => setFormOpen(null)} />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus pengguna?"
        body={`Akun "${deleteTarget?.name}" akan dihapus dan sesi miliknya akan berakhir.`}
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function UserFormModal({
  user,
  onClose,
}: {
  user?: UserRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState(user?.role ?? "staff");
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = user
      ? await putJSON(`/api/users/${user.id}`, {
          name,
          role,
          password: password || undefined,
        })
      : await postJSON("/api/users", { name, email, role, password });
    setBusy(false);
    if (!res.ok) return toast(res.error, "error");
    toast(user ? "Pengguna diperbarui." : "Pengguna baru ditambahkan.");
    onClose();
    router.refresh();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={user ? "Ubah Pengguna" : "Tambah Pengguna"}
      subtitle="Peran menentukan halaman dan aksi yang dapat diakses."
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nama Lengkap *">
          <TextInput required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Email *">
          <TextInput
            type="email"
            required
            disabled={!!user}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@toko.co.id"
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Peran">
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="owner">Pemilik — akses penuh</option>
              <option value="manager">Manajer — operasional & laporan</option>
              <option value="staff">Staf — stok & transaksi harian</option>
            </Select>
          </Field>
          <Field
            label={user ? "Kata Sandi Baru" : "Kata Sandi *"}
            hint={user ? "Kosongkan jika tidak diubah." : "Minimal 6 karakter."}
          >
            <TextInput
              type="password"
              required={!user}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        </div>
        <div className="flex justify-end gap-2">
          <Btn type="button" variant="subtle" onClick={onClose} disabled={busy}>
            Batal
          </Btn>
          <Btn type="submit" disabled={busy}>
            {busy ? "Menyimpan…" : user ? "Simpan Perubahan" : "Tambah Pengguna"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
