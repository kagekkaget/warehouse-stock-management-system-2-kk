"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { deleteReq, postJSON, putJSON } from "@/lib/fetch";
import { rupiah } from "@/lib/format";
import { IconChevronRight, IconPencil, IconPlus, IconSearch, IconTrash, IconUsers } from "./icons";
import {
  Btn,
  ConfirmDialog,
  EmptyState,
  Field,
  Modal,
  TextArea,
  TextInput,
  toast,
} from "./ui";

export type CustomerRow = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  preferences: string | null;
  orderCount: number;
  totalSpend: number;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  preferences: string;
};

const emptyForm: FormState = {
  name: "",
  phone: "",
  email: "",
  address: "",
  preferences: "",
};

export function CustomersManager({
  customers,
  canEdit,
}: {
  customers: CustomerRow[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState<null | { customer?: CustomerRow }>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerRow | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((c) =>
      [c.name, c.phone, c.email ?? "", c.address ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [customers, q]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    const res = await deleteReq(`/api/customers/${deleteTarget.id}`);
    setBusy(false);
    if (!res.ok) return toast(res.error, "error");
    toast(`Pelanggan "${deleteTarget.name}" dihapus.`);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint">
            <IconSearch size={15} />
          </span>
          <TextInput
            className="pl-9"
            placeholder="Cari nama, telepon, alamat…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Btn onClick={() => setFormOpen({})} className="ml-auto">
          <IconPlus size={15} /> Tambah Pelanggan
        </Btn>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={20} />}
          title="Belum ada pelanggan"
          body="Tambahkan profil pelanggan untuk mulai mencatat pesanan dan riwayat transaksi."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="group rounded-xl border border-line bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/pelanggan/${c.id}`}
                  className="min-w-0 flex-1"
                >
                  <p className="flex items-center gap-1 font-display text-sm font-bold text-ink group-hover:text-primary-strong">
                    <span className="truncate">{c.name}</span>
                    <IconChevronRight size={13} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">{c.phone}</p>
                  {c.address ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-ink-faint">
                      {c.address}
                    </p>
                  ) : null}
                </Link>
                {canEdit && (
                  <div className="flex shrink-0 gap-1">
                    <button
                      title="Ubah pelanggan"
                      onClick={() => setFormOpen({ customer: c })}
                      className="rounded-md p-1.5 text-ink-soft hover:bg-line-soft"
                    >
                      <IconPencil size={15} />
                    </button>
                    <button
                      title="Hapus pelanggan"
                      onClick={() => setDeleteTarget(c)}
                      className="rounded-md p-1.5 text-danger hover:bg-danger-soft"
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-4 border-t border-line-soft pt-3 text-xs">
                <div>
                  <p className="text-ink-faint">Pesanan</p>
                  <p className="tnum font-bold text-ink">{c.orderCount}x</p>
                </div>
                <div>
                  <p className="text-ink-faint">Total Belanja</p>
                  <p className="tnum font-bold text-ink">{rupiah(c.totalSpend)}</p>
                </div>
                {c.preferences ? (
                  <p className="ml-auto max-w-[45%] truncate rounded-full bg-teal-soft px-2.5 py-1 text-[10px] font-bold text-teal" title={c.preferences}>
                    {c.preferences}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <CustomerFormModal
          customer={formOpen.customer}
          onClose={() => setFormOpen(null)}
        />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus pelanggan?"
        body={`Profil "${deleteTarget?.name}" akan dihapus. Pelanggan dengan riwayat pesanan tidak dapat dihapus.`}
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export function CustomerFormModal({
  customer,
  onClose,
}: {
  customer?: CustomerRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>(
    customer
      ? {
          name: customer.name,
          phone: customer.phone,
          email: customer.email ?? "",
          address: customer.address ?? "",
          preferences: customer.preferences ?? "",
        }
      : emptyForm
  );

  const set =
    (k: keyof FormState) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      address: form.address || null,
      preferences: form.preferences || null,
    };
    const res = customer
      ? await putJSON(`/api/customers/${customer.id}`, payload)
      : await postJSON("/api/customers", payload);
    setBusy(false);
    if (!res.ok) return toast(res.error, "error");
    toast(customer ? "Data pelanggan diperbarui." : "Pelanggan baru ditambahkan.");
    onClose();
    router.refresh();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={customer ? "Ubah Pelanggan" : "Tambah Pelanggan"}
      subtitle="Simpan profil, preferensi, dan kontak pelanggan toko Anda."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nama *">
            <TextInput required value={form.name} onChange={set("name")} placeholder="cth. Warung Bu Sri" />
          </Field>
          <Field label="No. Telepon / WA *">
            <TextInput required value={form.phone} onChange={set("phone")} placeholder="cth. 0812-3456-7890" />
          </Field>
        </div>
        <Field label="Email">
          <TextInput type="email" value={form.email} onChange={set("email")} placeholder="cth. busri@example.com" />
        </Field>
        <Field label="Alamat">
          <TextArea value={form.address} onChange={set("address")} placeholder="Alamat pengiriman / lokasi usaha" />
        </Field>
        <Field
          label="Preferensi"
          hint="cth. Langganan kopi kapal api, kirim tiap Senin, pembayaran tempo 3 hari."
        >
          <TextInput value={form.preferences} onChange={set("preferences")} />
        </Field>
        <div className="flex justify-end gap-2">
          <Btn type="button" variant="subtle" onClick={onClose} disabled={busy}>
            Batal
          </Btn>
          <Btn type="submit" disabled={busy}>
            {busy ? "Menyimpan…" : customer ? "Simpan Perubahan" : "Tambah Pelanggan"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
