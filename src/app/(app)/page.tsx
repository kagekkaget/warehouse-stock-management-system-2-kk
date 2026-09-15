import Link from "next/link";
import { desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { orders, products, stockMovements, users, wasteLogs } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import {
  daysUntil,
  expiryChip,
  formatDateTime,
  rupiah,
  WASTE_REASON_LABEL,
} from "@/lib/format";
import {
  IconAlert,
  IconArrowDown,
  IconArrowUp,
  IconBox,
  IconClock,
  IconLeaf,
  IconMoney,
} from "@/components/icons";
import { Badge, StatCard } from "@/components/ui";

export const metadata = { title: "Dasbor — GudangKu" };

export default async function DashboardPage() {
  const user = (await getSessionUser())!;

  const allProducts = await db.select().from(products);
  const stockValue = allProducts.reduce((s, p) => s + p.stock * p.costPrice, 0);

  const lowProducts = allProducts
    .filter((p) => p.stock <= p.minStock)
    .sort((a, b) => a.stock - b.stock);

  const expiring = allProducts
    .filter((p) => p.expiryDate && daysUntil(p.expiryDate) <= 14)
    .sort(
      (a, b) => daysUntil(a.expiryDate!) - daysUntil(b.expiryDate!)
    );

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthOrders = await db
    .select({ total: orders.total, status: orders.status })
    .from(orders)
    .where(gte(orders.createdAt, monthStart));
  const monthRevenue = monthOrders
    .filter((o) => o.status !== "dibatalkan")
    .reduce((s, o) => s + o.total, 0);

  const movements = await db
    .select({
      id: stockMovements.id,
      type: stockMovements.type,
      qty: stockMovements.qty,
      note: stockMovements.note,
      createdAt: stockMovements.createdAt,
      productName: products.name,
      unit: products.unit,
      userName: users.name,
    })
    .from(stockMovements)
    .leftJoin(products, eq(stockMovements.productId, products.id))
    .leftJoin(users, eq(stockMovements.userId, users.id))
    .orderBy(desc(stockMovements.createdAt))
    .limit(8);

  const wastes = await db
    .select({
      id: wasteLogs.id,
      qty: wasteLogs.qty,
      reason: wasteLogs.reason,
      loss: wasteLogs.loss,
      createdAt: wasteLogs.createdAt,
      productName: products.name,
      unit: products.unit,
    })
    .from(wasteLogs)
    .leftJoin(products, eq(wasteLogs.productId, products.id))
    .orderBy(desc(wasteLogs.createdAt))
    .limit(5);

  const todayLong = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-ink-faint">{todayLong}</p>
        <h1 className="font-display text-2xl font-bold text-ink">
          Halo, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Ringkasan kondisi gudang Anda hari ini.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="Nilai Stok"
          value={rupiah(stockValue)}
          icon={<IconMoney size={16} />}
          tone="primary"
          sub={`${allProducts.length} jenis produk`}
        />
        <StatCard
          label="Jenis Produk"
          value={String(allProducts.length)}
          icon={<IconBox size={16} />}
        />
        <StatCard
          label="Stok Menipis"
          value={String(lowProducts.length)}
          icon={<IconAlert size={16} />}
          tone={lowProducts.length ? "warn" : "default"}
          sub="≤ stok minimum"
        />
        <StatCard
          label="Segera Kedaluwarsa"
          value={String(expiring.length)}
          icon={<IconClock size={16} />}
          tone={expiring.length ? "danger" : "default"}
          sub="≤ 14 hari ke depan"
        />
        <StatCard
          label="Omzet Bulan Ini"
          value={rupiah(monthRevenue)}
          icon={<IconMoney size={16} />}
          tone="teal"
          sub={`${monthOrders.length} pesanan`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Alerts column */}
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border border-line bg-card shadow-sm">
            <header className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold text-ink">
                <IconClock size={15} className="text-danger" />
                Peringatan Kedaluwarsa
              </h2>
              <Link
                href="/produk"
                className="text-xs font-bold text-primary hover:underline"
              >
                Kelola produk →
              </Link>
            </header>
            {expiring.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-ink-faint">
                Tidak ada produk yang mendekati masa kedaluwarsa. Kerja bagus!
              </p>
            ) : (
              <ul className="divide-y divide-line-soft">
                {expiring.slice(0, 6).map((p) => {
                  const chip = expiryChip(p.expiryDate);
                  const d = daysUntil(p.expiryDate!);
                  return (
                    <li key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          d < 0 ? "bg-danger" : "bg-warn"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-ink-faint">
                          Stok {p.stock} {p.unit} · ED{" "}
                          {new Date(p.expiryDate!).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <Badge
                        cls={
                          d < 0
                            ? "bg-danger-soft text-danger"
                            : "bg-warn-soft text-warn"
                        }
                      >
                        {d < 0
                          ? `Lewat ${Math.abs(d)} hari`
                          : d === 0
                            ? "Hari ini"
                            : `${d} hari lagi`}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-line bg-card shadow-sm">
            <header className="border-b border-line px-4 py-3">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold text-ink">
                <IconAlert size={15} className="text-warn" />
                Perlu Restok
              </h2>
            </header>
            {lowProducts.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-ink-faint">
                Semua stok berada di atas batas minimum.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-line bg-surface text-left text-[10px] font-bold tracking-wide text-ink-faint uppercase">
                      <th className="px-4 py-2">Produk</th>
                      <th className="px-4 py-2 text-right">Stok</th>
                      <th className="px-4 py-2 text-right">Min.</th>
                      <th className="px-4 py-2 text-right">Saran Restok</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowProducts.slice(0, 6).map((p) => (
                      <tr key={p.id} className="border-b border-line-soft last:border-0">
                        <td className="px-4 py-2.5">
                          <p className="font-bold text-ink">{p.name}</p>
                          <p className="text-[10px] text-ink-faint">
                            {p.supplier ?? "Pemasok belum diisi"}
                          </p>
                        </td>
                        <td className="tnum px-4 py-2.5 text-right font-bold text-danger">
                          {p.stock} {p.unit}
                        </td>
                        <td className="tnum px-4 py-2.5 text-right text-ink-soft">
                          {p.minStock}
                        </td>
                        <td className="tnum px-4 py-2.5 text-right font-semibold text-ink">
                          +{Math.max(p.minStock * 2 - p.stock, 1)} {p.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <section className="rounded-xl border border-line bg-card shadow-sm">
            <header className="border-b border-line px-4 py-3">
              <h2 className="font-display text-sm font-bold text-ink">
                Pergerakan Stok Terbaru
              </h2>
            </header>
            {movements.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-ink-faint">
                Belum ada pergerakan stok.
              </p>
            ) : (
              <ul className="divide-y divide-line-soft">
                {movements.map((m) => (
                  <li key={m.id} className="flex items-start gap-2.5 px-4 py-2.5">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                        m.type === "masuk"
                          ? "bg-primary-soft text-primary-strong"
                          : "bg-warn-soft text-warn"
                      }`}
                    >
                      {m.type === "masuk" ? (
                        <IconArrowDown size={13} />
                      ) : (
                        <IconArrowUp size={13} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-ink">
                        {m.productName ?? "—"}
                      </p>
                      <p className="truncate text-[11px] text-ink-faint">
                        {m.note ?? (m.type === "masuk" ? "Barang masuk" : "Barang keluar")}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={`tnum text-xs font-bold ${
                          m.type === "masuk" ? "text-primary-strong" : "text-warn"
                        }`}
                      >
                        {m.type === "masuk" ? "+" : "−"}
                        {m.qty} {m.unit ?? ""}
                      </p>
                      <p className="text-[10px] text-ink-faint">
                        {formatDateTime(m.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-line bg-card shadow-sm">
            <header className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold text-ink">
                <IconLeaf size={15} className="text-warn" />
                Susut Terbaru
              </h2>
              <Link
                href="/laporan?tab=waste"
                className="text-xs font-bold text-primary hover:underline"
              >
                Laporan →
              </Link>
            </header>
            {wastes.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-ink-faint">
                Belum ada catatan limbah. Pertahankan!
              </p>
            ) : (
              <ul className="divide-y divide-line-soft">
                {wastes.map((w) => (
                  <li key={w.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-ink">
                        {w.productName ?? "—"}
                      </p>
                      <p className="text-[11px] text-ink-faint">
                        {WASTE_REASON_LABEL[w.reason] ?? w.reason} ·{" "}
                        {formatDateTime(w.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="tnum text-xs font-bold text-ink">
                        {w.qty} {w.unit ?? ""}
                      </p>
                      <p className="tnum text-[10px] font-semibold text-danger">
                        −{rupiah(w.loss)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
