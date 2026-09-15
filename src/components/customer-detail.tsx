"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteReq } from "@/lib/fetch";
import {
  formatDateTime,
  ORDER_STATUS_CLS,
  ORDER_STATUS_LABEL,
  PAYMENT_CLS,
  PAYMENT_LABEL,
  rupiah,
} from "@/lib/format";
import type { CustomerRow } from "./customers-manager";
import { CustomerFormModal } from "./customers-manager";
import { IconCart, IconPencil, IconPhone, IconTrash } from "./icons";
import { Badge, Btn, ConfirmDialog, EmptyState, toast } from "./ui";

export type DetailOrder = {
  id: number;
  orderNumber: string;
  createdAt: string;
  total: number;
  status: string;
  paymentStatus: string;
  notes: string | null;
  items: { productName: string; qty: number; subtotal: number }[];
};

export function CustomerDetail({
  customer,
  orders,
  canEdit,
  canDelete,
}: {
  customer: CustomerRow;
  orders: DetailOrder[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    const res = await deleteReq(`/api/customers/${customer.id}`);
    setBusy(false);
    if (!res.ok) return toast(res.error, "error");
    toast(`Pelanggan "${customer.name}" dihapus.`);
    router.push("/pelanggan");
    router.refresh();
  }

  const paidCount = orders.filter((o) => o.paymentStatus === "lunas").length;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-line bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-ink-faint">
              Profil Pelanggan
            </p>
            <h1 className="font-display text-xl font-bold text-ink">
              {customer.name}
            </h1>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <IconPhone size={14} /> {customer.phone}
              </span>
              {customer.email ? <span>{customer.email}</span> : null}
            </div>
            {customer.address ? (
              <p className="mt-1 text-sm text-ink-faint">{customer.address}</p>
            ) : null}
            {customer.preferences ? (
              <p className="mt-3 inline-block rounded-lg bg-teal-soft px-3 py-1.5 text-xs font-semibold text-teal">
                Preferensi: {customer.preferences}
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <Btn variant="subtle" onClick={() => setEditOpen(true)}>
                <IconPencil size={14} /> Ubah
              </Btn>
            )}
            {canDelete && (
              <Btn variant="danger" onClick={() => setDeleteOpen(true)}>
                <IconTrash size={14} /> Hapus
              </Btn>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line-soft pt-4">
          <div>
            <p className="text-[11px] font-bold text-ink-faint">Total Pesanan</p>
            <p className="tnum font-display text-lg font-bold text-ink">
              {orders.length}x
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-ink-faint">Total Belanja</p>
            <p className="tnum font-display text-lg font-bold text-ink">
              {rupiah(customer.totalSpend)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-ink-faint">Pembayaran Lunas</p>
            <p className="tnum font-display text-lg font-bold text-ink">
              {paidCount}/{orders.length}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-base font-bold text-ink">
          Riwayat Pesanan
        </h2>
        {orders.length === 0 ? (
          <EmptyState
            icon={<IconCart size={20} />}
            title="Belum ada pesanan"
            body={`Belum ada transaksi dari ${customer.name}. Buat pesanan dari menu Pesanan.`}
          />
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                className="rounded-xl border border-line bg-card p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-sm font-bold text-ink">
                    {o.orderNumber}
                  </p>
                  <Badge cls={ORDER_STATUS_CLS[o.status] ?? ""}>
                    {ORDER_STATUS_LABEL[o.status] ?? o.status}
                  </Badge>
                  <Badge cls={PAYMENT_CLS[o.paymentStatus] ?? ""}>
                    {PAYMENT_LABEL[o.paymentStatus] ?? o.paymentStatus}
                  </Badge>
                  <span className="ml-auto text-xs text-ink-faint">
                    {formatDateTime(new Date(o.createdAt))}
                  </span>
                </div>
                <ul className="mt-3 space-y-1 border-t border-line-soft pt-3">
                  {o.items.map((it, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-ink-soft">
                        {it.productName}{" "}
                        <span className="tnum text-ink-faint">× {it.qty}</span>
                      </span>
                      <span className="tnum font-semibold text-ink">
                        {rupiah(it.subtotal)}
                      </span>
                    </li>
                  ))}
                </ul>
                {o.notes ? (
                  <p className="mt-2 text-[11px] text-ink-faint italic">
                    Catatan: {o.notes}
                  </p>
                ) : null}
                <p className="tnum mt-2 border-t border-line-soft pt-2 text-right text-sm font-bold text-ink">
                  Total {rupiah(o.total)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-ink-faint">
        <Link href="/pelanggan" className="font-bold text-primary hover:underline">
          ← Kembali ke daftar pelanggan
        </Link>
      </p>

      {editOpen && (
        <CustomerFormModal customer={customer} onClose={() => setEditOpen(false)} />
      )}
      <ConfirmDialog
        open={deleteOpen}
        title="Hapus pelanggan?"
        body={`Profil "${customer.name}" akan dihapus permanen. Pelanggan dengan riwayat pesanan tidak dapat dihapus.`}
        busy={busy}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
