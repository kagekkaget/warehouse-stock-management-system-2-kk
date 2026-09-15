import { can, getSessionUser } from "@/lib/auth";
import { addDaysISO } from "@/lib/format";
import {
  getInventoryReport,
  getSalesReport,
  getWasteReport,
} from "@/lib/reports";
import { ReportsView, type TabKey } from "@/components/reports-view";

export const metadata = { title: "Laporan — GudangKu" };

const TAB_KEYS: TabKey[] = ["inventory", "sales", "waste"];

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; from?: string; to?: string }>;
}) {
  const user = (await getSessionUser())!;
  const sp = await searchParams;
  const tab: TabKey = TAB_KEYS.includes(sp.tab as TabKey)
    ? (sp.tab as TabKey)
    : "inventory";
  const from = /^\d{4}-\d{2}-\d{2}$/.test(sp.from ?? "") ? sp.from! : addDaysISO(-30);
  const to = /^\d{4}-\d{2}-\d{2}$/.test(sp.to ?? "") ? sp.to! : addDaysISO(0);

  const report =
    tab === "inventory"
      ? await getInventoryReport()
      : tab === "sales"
        ? await getSalesReport(from, to)
        : await getWasteReport(from, to);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Laporan</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Analisis inventaris, penjualan, dan limbah — ekspor sebagai PDF atau
          CSV untuk dibagikan.
        </p>
      </header>
      <ReportsView
        tab={tab}
        from={from}
        to={to}
        report={report}
        canExport={can.exportReports(user.role)}
      />
    </div>
  );
}
