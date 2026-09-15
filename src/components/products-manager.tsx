"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { deleteReq, postJSON, putJSON } from "@/lib/fetch";
import {
  expiryChip,
  productStockState,
  rupiah,
  STOCK_STATE_META,
} from "@/lib/format";
import {
  IconAlert,
  IconArrowDown,
  IconBox,
  IconLeaf,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
} from "./icons";
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

export type ProductRow = {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  expiryDate: string | null;
  supplier: string | null;
};

const CATEGORIES = [
  "Sembako",
  "Minuman",
  "Makanan Ringan",
  "Perawatan & Kebersihan",
  "Lainnya",
];
const UNITS = ["pcs", "bungkus", "kg", "liter", "botol", "dus", "karton"];

type FormState = {
  name: string;
  sku: string;
  category: string;
  unit: string;
  costPrice: string;
  sellPrice: string;
  stock: string;
  minStock: string;
  expiryDate: string;
  supplier: string;
};

const emptyForm: FormState = {
  name: "",
  sku: "",
  category: "Sembako",
  unit: "pcs",
  costPrice: "",
  sellPrice: "",
  stock: "0",
  minStock: "5",
  expiryDate: "",
  supplier: "",
};

export function ProductsManager({
  products,
  canManage,
}: {
  products: ProductRow[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState<null | { product?: ProductRow }>(null);
  const [stockTarget, setStockTarget] = useState<ProductRow | null>(null);
  const [wasteTarget, setWasteTarget] = useState<ProductRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const [busy, setBusy] = useState(false);

  const counts = useMemo(() => {
    const c = { all: products.length, menipis: 0, hampir: 0, kedaluwarsa: 0 };
    for (const p of products) {
      const s = productStockState(p);
      if (s === "menipis" || s === "habis") c.menipis += 1;
      if (s === "hampir-kedaluwarsa") c.hampir += 1;
      if (s === "kedaluwarsa") c.kedaluwarsa += 1;
    }
    return c;
  }, [products]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) => {
      const s = productStockState(p);
      if (filter === "menipis" && s !== "menipis" && s !== "habis") return false;
      if (filter === "hampir" && s !== "hampir-kedaluwarsa") return false;
      if (filter === "kedaluwarsa" && s !== "kedaluwarsa") return false;
      if (!term) return true;
      return [p.name, p.sku, p.category, p.supplier ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [products, q, filter]);

  const filterTabs = [
    { key: "all", label: "Semua", count: counts.all },
    { key: "menipis", label: "Stok Menipis", count: counts.menipis },
    { key: "hampir", label: "Segera Kedaluwarsa", count: counts.hampir },
    { key: "kedaluwarsa", label: "Kedaluwarsa", count: counts.kedaluwarsa },
  ];

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    const res = await deleteReq(`/api/products/${deleteTarget.id}`);
    setBusy(false);
    if (!res.ok) return toast(res.error, "error");
    toast(`Produk "${deleteTarget.name}" dihapus.`);
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
            placeholder="Cari nama, SKU, kategori…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {canManage && (
          <Btn onClick={() => setFormOpen({})} className="ml-auto">
            <IconPlus size={15} /> Tambah Produk
          </Btn>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filterTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              filter === t.key
                ? "bg-night text-white"
                : "bg-card text-ink-soft ring-1 ring-line hover:bg-line-soft"
            }`}
          >
            {t.label} <span className="tnum">({t.count})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<IconBox size={20} />}
          title="Tidak ada produk yang cocok"
          body="Ubah kata kunci pencarian atau tambah produk baru untuk mulai memantau stok."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead>
                <tr className="border-b border-line bg-surface text-left text-[11px] font-bold tracking-wide text-ink-faint uppercase">
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3 text-right">Stok</th>
                  <th className="px-4 py-3 text-right">Harga Jual</th>
                  <th className="px-4 py-3">Kedaluwarsa</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const state = productStockState(p);
                  const meta = STOCK_STATE_META[state];
                  const chip = expiryChip(p.expiryDate);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-line-soft last:border-0 hover:bg-surface"
                    >
                      <td className="px-4 py-3">
                        <p className="font-bold text-ink">{p.name}</p>
                        <p className="text-xs text-ink-faint">
                          {p.sku}
                          {p.supplier ? ` · ${p.supplier}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{p.category}</td>
                      <td className="tnum px-4 py-3 text-right">
                        <span
                          className={`font-bold ${
                            p.stock <= p.minStock ? "text-danger" : "text-ink"
                          }`}
                        >
                          {p.stock}
                        </span>{" "}
                        <span className="text-xs text-ink-faint">{p.unit}</span>
                        <p className="text-[10px] text-ink-faint">
                          min. {p.minStock}
                        </p>
                      </td>
                      <td className="tnum px-4 py-3 text-right text-ink">
                        {rupiah(p.sellPrice)}
                      </td>
                      <td className="px-4 py-3">
                        {chip ? (
                          <span className={`text-xs font-semibold ${chip.cls}`}>
                            {chip.text}
                          </span>
                        ) : (
                          <span className="text-xs text-ink-faint">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge cls={meta.cls}>
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            title="Penyesuaian stok"
                            onClick={() => setStockTarget(p)}
                            className="rounded-md p-1.5 text-teal transition-colors hover:bg-teal-soft"
                          >
                            <IconArrowDown size={15} />
                          </button>
                          <button
                            title="Catat limbah/susut"
                            onClick={() => setWasteTarget(p)}
                            className="rounded-md p-1.5 text-warn transition-colors hover:bg-warn-soft"
                          >
                            <IconLeaf size={15} />
                          </button>
                          {canManage && (
                            <>
                              <button
                                title="Ubah produk"
                                onClick={() => setFormOpen({ product: p })}
                                className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-line-soft"
                              >
                                <IconPencil size={15} />
                              </button>
                              <button
                                title="Hapus produk"
                                onClick={() => setDeleteTarget(p)}
                                className="rounded-md p-1.5 text-danger transition-colors hover:bg-danger-soft"
                              >
                                <IconTrash size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {formOpen && (
        <ProductFormModal
          product={formOpen.product}
          onClose={() => setFormOpen(null)}
        />
      )}
      {stockTarget && (
        <StockModal product={stockTarget} onClose={() => setStockTarget(null)} />
      )}
      {wasteTarget && (
        <WasteModal product={wasteTarget} onClose={() => setWasteTarget(null)} />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus produk?"
        body={`Produk "${deleteTarget?.name}" beserta riwayat pergerakannya akan dihapus permanen. Riwayat penjualan tetap tersimpan.`}
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function ProductFormModal({
  product,
  onClose,
}: {
  product?: ProductRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>(
    product
      ? {
          name: product.name,
          sku: product.sku,
          category: product.category,
          unit: product.unit,
          costPrice: String(product.costPrice),
          sellPrice: String(product.sellPrice),
          stock: String(product.stock),
          minStock: String(product.minStock),
          expiryDate: product.expiryDate ?? "",
          supplier: product.supplier ?? "",
        }
      : emptyForm
  );

  const set = (k: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload: Record<string, unknown> = {
      name: form.name,
      sku: form.sku,
      category: form.category,
      unit: form.unit,
      costPrice: Number(form.costPrice || 0),
      sellPrice: Number(form.sellPrice || 0),
      minStock: Number(form.minStock || 0),
      expiryDate: form.expiryDate || null,
      supplier: form.supplier || null,
    };
    if (!product) payload.stock = Number(form.stock || 0);
    const res = product
      ? await putJSON(`/api/products/${product.id}`, payload)
      : await postJSON("/api/products", payload);
    setBusy(false);
    if (!res.ok) return toast(res.error, "error");
    toast(product ? "Produk berhasil diperbarui." : "Produk baru berhasil ditambahkan.");
    onClose();
    router.refresh();
  }

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={product ? "Ubah Produk" : "Tambah Produk"}
      subtitle={
        product
          ? `SKU ${product.sku} · stok saat ini ${product.stock} ${product.unit}`
          : "Lengkapi data produk untuk mulai memantau stok dan masa kedaluwarsa."
      }
    >
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Nama Produk *">
            <TextInput
              required
              value={form.name}
              onChange={set("name")}
              placeholder="cth. Beras Premium 5kg"
            />
          </Field>
        </div>
        <Field label="Kode SKU *">
          <TextInput
            required
            value={form.sku}
            onChange={set("sku")}
            placeholder="cth. SMB-BRS-5"
          />
        </Field>
        <Field label="Kategori">
          <Select value={form.category} onChange={set("category")}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Satuan">
          <Select value={form.unit} onChange={set("unit")}>
            {UNITS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </Select>
        </Field>
        <Field label="Pemasok">
          <TextInput
            value={form.supplier}
            onChange={set("supplier")}
            placeholder="cth. CV Sumber Pangan"
          />
        </Field>
        <Field label="Harga Beli (Rp)">
          <TextInput
            type="number"
            min={0}
            required
            value={form.costPrice}
            onChange={set("costPrice")}
          />
        </Field>
        <Field label="Harga Jual (Rp)">
          <TextInput
            type="number"
            min={0}
            required
            value={form.sellPrice}
            onChange={set("sellPrice")}
          />
        </Field>
        {!product && (
          <Field label="Stok Awal" hint="Perubahan stok berikutnya lewat menu penyesuaian stok.">
            <TextInput
              type="number"
              min={0}
              value={form.stock}
              onChange={set("stock")}
            />
          </Field>
        )}
        <Field label="Stok Minimum" hint="Notifikasi muncul saat stok ≤ angka ini.">
          <TextInput
            type="number"
            min={0}
            value={form.minStock}
            onChange={set("minStock")}
          />
        </Field>
        <Field label="Tanggal Kedaluwarsa" hint="Opsional — kosongkan jika tidak ada.">
          <TextInput type="date" value={form.expiryDate} onChange={set("expiryDate")} />
        </Field>
        <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
          <Btn type="button" variant="subtle" onClick={onClose} disabled={busy}>
            Batal
          </Btn>
          <Btn type="submit" disabled={busy}>
            {busy ? "Menyimpan…" : product ? "Simpan Perubahan" : "Tambah Produk"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

function StockModal({
  product,
  onClose,
}: {
  product: ProductRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [type, setType] = useState<"masuk" | "keluar">("masuk");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await postJSON(`/api/products/${product.id}/stock`, {
      type,
      qty: Number(qty),
      note: note || null,
    });
    setBusy(false);
    if (!res.ok) return toast(res.error, "error");
    toast(
      type === "masuk"
        ? `Stok "${product.name}" bertambah ${qty} ${product.unit}.`
        : `Stok "${product.name}" berkurang ${qty} ${product.unit}.`
    );
    onClose();
    router.refresh();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Penyesuaian Stok"
      subtitle={`${product.name} · stok saat ini ${product.stock} ${product.unit}`}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { v: "masuk", label: "Barang Masuk", desc: "Restok / penerimaan" },
              { v: "keluar", label: "Barang Keluar", desc: "Selain penjualan" },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setType(o.v)}
              className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                type === o.v
                  ? "border-primary bg-primary-soft"
                  : "border-line bg-card hover:bg-line-soft"
              }`}
            >
              <p className={`text-sm font-bold ${type === o.v ? "text-primary-strong" : "text-ink"}`}>
                {o.label}
              </p>
              <p className="text-[11px] text-ink-faint">{o.desc}</p>
            </button>
          ))}
        </div>
        <Field label={`Jumlah (${product.unit})`}>
          <TextInput
            type="number"
            min={1}
            max={type === "keluar" ? product.stock : undefined}
            required
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </Field>
        <Field label="Catatan">
          <TextArea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="cth. Restok dari CV Sumber Pangan"
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Btn type="button" variant="subtle" onClick={onClose} disabled={busy}>
            Batal
          </Btn>
          <Btn type="submit" disabled={busy}>
            {busy ? "Menyimpan…" : "Simpan Stok"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

function WasteModal({
  product,
  onClose,
}: {
  product: ProductRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [qty, setQty] = useState("1");
  const [reason, setReason] = useState("kedaluwarsa");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const n = Number(qty || 0);
  const estLoss = n * product.costPrice;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await postJSON("/api/waste", {
      productId: product.id,
      qty: n,
      reason,
      note: note || null,
    });
    setBusy(false);
    if (!res.ok) return toast(res.error, "error");
    toast("Limbah tercatat dan stok dikurangi.");
    onClose();
    router.refresh();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Catat Limbah / Susut"
      subtitle={`${product.name} · stok ${product.stock} ${product.unit}`}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg bg-warn-soft px-3 py-2.5 text-xs font-semibold text-warn">
          <IconAlert size={14} className="mt-0.5 shrink-0" />
          Produk yang dicatat akan dikurangi dari stok dan masuk laporan limbah
          untuk evaluasi.
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={`Jumlah (${product.unit})`}>
            <TextInput
              type="number"
              min={1}
              max={product.stock}
              required
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </Field>
          <Field label="Alasan">
            <Select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="kedaluwarsa">Kedaluwarsa</option>
              <option value="rusak">Rusak / Pecah</option>
              <option value="lainnya">Lainnya</option>
            </Select>
          </Field>
        </div>
        <Field label="Catatan">
          <TextArea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="cth. 3 bungkus roti lewat masa ED"
          />
        </Field>
        <p className="tnum rounded-lg bg-surface px-3 py-2 text-xs font-semibold text-ink-soft ring-1 ring-line">
          Estimasi kerugian: <span className="text-danger">{rupiah(estLoss)}</span>
        </p>
        <div className="flex justify-end gap-2">
          <Btn type="button" variant="subtle" onClick={onClose} disabled={busy}>
            Batal
          </Btn>
          <Btn type="submit" variant="warn" disabled={busy}>
            {busy ? "Mencatat…" : "Catat Limbah"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
