"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { deleteReq, patchJSON, postJSON } from "@/lib/fetch";
import {
  formatDateTime,
  ORDER_STATUS_CLS,
  ORDER_STATUS_LABEL,
  PAYMENT_CLS,
  PAYMENT_LABEL,
  rupiah,
} from "@/lib/format";
import { IconCart, IconPlus, IconTrash, IconX } from "./icons";
import {
  Badge,
  Btn,
  ConfirmDialog,
  EmptyState,
  Field,
  Modal,
  Select,
  TextArea,
  TextInput,
  toast,
} from "./ui";

export type OrderRow = {
  id: number;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerId: number;
  total: number;
  status: string;
  paymentStatus: string;
  itemCount: number;
};

export type ProductPick = {
  id: number;
  name: string;
  stock: number;
  sellPrice: number;
  unit: string;
};

type ItemLine = { productId: number; qty: number };

export function OrdersManager({
  orders,
  products,
  customers,
  canDelete,
  canCreate,
}: {
  orders: OrderRow[];
  products: ProductPick[];
  customers: { id: number; name: string }[];
  canDelete: boolean;
  canCreate: boolean;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OrderRow | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function patchOrder(id: number, patch: Record<string, string>, msg: string) {
    setBusyId(id);
    const res = await patchJSON(`/api/orders/${id}`, patch);
    setBusyId(null);
    if (!res.ok) return toast(res.error, "error");
    toast(msg);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    const res = await deleteReq(`/api/orders/${deleteTarget.id}`);
    setDeleteBusy(false);
    if (!res.ok) return toast(res.error, "error");
    toast(`Pesanan ${deleteTarget.orderNumber} dihapus. Stok tidak dikembalikan otomatis.`);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          {orders.length} pesanan tercatat. Stok otomatis berkurang saat
          pesanan dibuat.
        </p>
        {canCreate && (
          <Btn onClick={() => setCreateOpen(true)}>
            <IconPlus size={15} /> Buat Pesanan
          </Btn>
        )}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<IconCart size={20} />}
          title="Belum ada pesanan"
          body="Buat pesanan pertama untuk pelanggan Anda — stok gudang akan otomatis diperbarui."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-line bg-surface text-left text-[11px] font-bold tracking-wide text-ink-faint uppercase">
                  <th className="px-4 py-3">No. Pesanan</th>
                  <th className="px-4 py-3">Pelanggan</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3 text-right">Item</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Pembayaran</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-line-soft last:border-0 hover:bg-surface"
                  >
                    <td className="px-4 py-3 font-bold text-ink">
                      {o.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-ink">{o.customerName}</td>
                    <td className="px-4 py-3 text-xs text-ink-soft">
                      {formatDateTime(new Date(o.createdAt))}
                    </td>
                    <td className="tnum px-4 py-3 text-right text-ink-soft">
                      {o.itemCount}
                    </td>
                    <td className="tnum px-4 py-3 text-right font-bold text-ink">
                      {rupiah(o.total)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge cls={PAYMENT_CLS[o.paymentStatus] ?? ""}>
                        {PAYMENT_LABEL[o.paymentStatus] ?? o.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge cls={ORDER_STATUS_CLS[o.status] ?? ""}>
                        {ORDER_STATUS_LABEL[o.status] ?? o.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {o.paymentStatus !== "lunas" && (
                          <Btn
                            size="sm"
                            variant="subtle"
                            disabled={busyId === o.id}
                            onClick={() =>
                              patchOrder(
                                o.id,
                                { paymentStatus: "lunas" },
                                `${o.orderNumber} ditandai lunas.`
                              )
                            }
                          >
                            Tandai Lunas
                          </Btn>
                        )}
                        {o.status === "diproses" && (
                          <Btn
                            size="sm"
                            variant="subtle"
                            disabled={busyId === o.id}
                            onClick={() =>
                              patchOrder(
                                o.id,
                                { status: "selesai" },
                                `${o.orderNumber} selesai.`
                              )
                            }
                          >
                            Selesai
                          </Btn>
                        )}
                        {canDelete && (
                          <button
                            title="Hapus pesanan"
                            onClick={() => setDeleteTarget(o)}
                            className="rounded-md p-1.5 text-danger transition-colors hover:bg-danger-soft"
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

      {createOpen && (
        <CreateOrderModal
          products={products}
          customers={customers}
          onClose={() => setCreateOpen(false)}
        />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus pesanan?"
        body={`Pesanan ${deleteTarget?.orderNumber} akan dihapus dari riwayat. Stok tidak dikembalikan secara otomatis.`}
        busy={deleteBusy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function CreateOrderModal({
  products,
  customers,
  onClose,
}: {
  products: ProductPick[];
  customers: { id: number; name: string }[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState<number>(customers[0]?.id ?? 0);
  const [payment, setPayment] = useState("belum_bayar");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<ItemLine[]>([{ productId: 0, qty: 1 }]);
  const [busy, setBusy] = useState(false);

  const total = useMemo(
    () =>
      lines.reduce((sum, l) => {
        const p = products.find((x) => x.id === l.productId);
        return sum + (p ? p.sellPrice * l.qty : 0);
      }, 0),
    [lines, products]
  );

  const setLine = (i: number, patch: Partial<ItemLine>) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const items = lines.filter((l) => l.productId > 0 && l.qty > 0);
    if (!customerId) return toast("Pilih pelanggan terlebih dahulu.", "error");
    if (!items.length) return toast("Tambahkan minimal 1 item produk.", "error");
    setBusy(true);
    const res = await postJSON("/api/orders", {
      customerId,
      paymentStatus: payment,
      notes: notes || null,
      items,
    });
    setBusy(false);
    if (!res.ok) return toast(res.error, "error");
    toast("Pesanan berhasil dibuat dan stok diperbarui.");
    onClose();
    router.refresh();
  }

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title="Buat Pesanan Baru"
      subtitle="Stok produk otomatis dikurangi sesuai jumlah item."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Pelanggan *">
            <Select
              required
              value={customerId}
              onChange={(e) => setCustomerId(Number(e.target.value))}
            >
              <option value={0} disabled>
                Pilih pelanggan…
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status Pembayaran">
            <Select value={payment} onChange={(e) => setPayment(e.target.value)}>
              <option value="belum_bayar">Belum Bayar</option>
              <option value="dp">DP / Uang Muka</option>
              <option value="lunas">Lunas</option>
            </Select>
          </Field>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-bold text-ink-soft">Item Pesanan</p>
          <div className="space-y-2">
            {lines.map((l, i) => {
              const p = products.find((x) => x.id === l.productId);
              return (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <Select
                    className="min-w-0 flex-1 basis-52"
                    value={l.productId}
                    onChange={(e) => setLine(i, { productId: Number(e.target.value) })}
                  >
                    <option value={0} disabled>
                      Pilih produk…
                    </option>
                    {products.map((pr) => (
                      <option key={pr.id} value={pr.id} disabled={pr.stock <= 0}>
                        {pr.name} — stok {pr.stock} {pr.unit}
                        {pr.stock <= 0 ? " (habis)" : ""}
                      </option>
                    ))}
                  </Select>
                  <TextInput
                    type="number"
                    min={1}
                    max={p?.stock}
                    className="w-20"
                    value={l.qty}
                    onChange={(e) => setLine(i, { qty: Number(e.target.value) })}
                  />
                  <span className="tnum w-28 text-right text-xs font-semibold text-ink-soft">
                    {p ? rupiah(p.sellPrice * l.qty) : "—"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setLines((ls) =>
                        ls.length > 1 ? ls.filter((_, idx) => idx !== i) : ls
                      )
                    }
                    className="rounded-md p-1.5 text-ink-faint hover:bg-line-soft hover:text-danger"
                    title="Hapus baris"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              );
            })}
          </div>
          <Btn
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setLines((ls) => [...ls, { productId: 0, qty: 1 }])}
          >
            <IconPlus size={13} /> Tambah Item
          </Btn>
        </div>

        <Field label="Catatan">
          <TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="cth. Kirim sebelum Jumat"
          />
        </Field>

        <div className="flex items-center justify-between rounded-lg bg-night px-4 py-3">
          <span className="text-xs font-bold tracking-wide text-night-text uppercase">
            Total Pesanan
          </span>
          <span className="tnum font-display text-lg font-bold text-white">
            {rupiah(total)}
          </span>
        </div>

        <div className="flex justify-end gap-2">
          <Btn type="button" variant="subtle" onClick={onClose} disabled={busy}>
            Batal
          </Btn>
          <Btn type="submit" disabled={busy}>
            {busy ? "Menyimpan…" : "Simpan Pesanan"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
