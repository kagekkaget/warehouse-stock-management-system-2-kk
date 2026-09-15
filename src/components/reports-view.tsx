"use client";

import Link from "next/link";
import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReportResult } from "@/lib/reports";
import { formatDate } from "@/lib/format";
import { IconDownload, IconReport } from "./icons";
import { Btn, EmptyState, TextInput, toast } from "./ui";

export type TabKey = "inventory" | "sales" | "waste";

const TABS: { key: TabKey; label: string; desc: string }[] = [
  {
    key: "inventory",
    label: "Inventaris",
    desc: "Posisi stok, nilai persediaan, dan status tiap produk.",
  },
  {
    key: "sales",
    label: "Penjualan",
    desc: "Rekap pesanan pelanggan beserta status pembayaran.",
  },
  {
    key: "waste",
    label: "Limbah / Susut",
    desc: "Produk terbuang dan estimasi kerugian untuk evaluasi.",
  },
];

export function ReportsView({
  tab,
  from,
  to,
  report,
  canExport,
}: {
  tab: TabKey;
  from: string;
  to: string;
  report: ReportResult;
  canExport: boolean;
}) {
  const [pdfBusy, setPdfBusy] = useState(false);

  const hasPeriod = tab !== "inventory";
  const periodText = hasPeriod
    ? `Periode ${from ? formatDate(from) : "awal"} – ${to ? formatDate(to) : "sekarang"}`
    : `Per tanggal ${formatDate(new Date())}`;

  const csvHref = `/api/reports/export?type=${tab}${
    hasPeriod ? `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}` : ""
  }`;

  async function exportPDF() {
    setPdfBusy(true);
    try {
      const landscape = report.headers.length > 7;
      const doc = new jsPDF({ orientation: landscape ? "landscape" : "portrait" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(report.title, 14, 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90);
      doc.text(`GudangKu · ${periodText}`, 14, 21);

      autoTable(doc, {
        startY: 26,
        head: [report.headers],
        body: report.rows.map((r) => r.map(String)),
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [34, 107, 80], fontSize: 7.5 },
        alternateRowStyles: { fillColor: [246, 245, 240] },
      });

      const finalY =
        (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
          ?.finalY ?? 30;
      let y = finalY + 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30);
      doc.text("Ringkasan", 14, y);
      doc.setFont("helvetica", "normal");
      report.summary.forEach((s, i) => {
        doc.text(`${s.label}: ${s.value}`, 14, y + 5 + i * 5);
      });

      doc.save(`${report.title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
      toast("PDF berhasil diunduh.");
    } catch {
      toast("Gagal membuat PDF. Coba lagi.", "error");
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/laporan?tab=${t.key}&from=${from}&to=${to}`}
            className={`rounded-xl border px-4 py-3 transition-colors ${
              tab === t.key
                ? "border-primary bg-primary-soft"
                : "border-line bg-card hover:bg-line-soft"
            }`}
          >
            <p
              className={`font-display text-sm font-bold ${
                tab === t.key ? "text-primary-strong" : "text-ink"
              }`}
            >
              {t.label}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-ink-soft">
              {t.desc}
            </p>
          </Link>
        ))}
      </div>

      {/* Period + export */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4 shadow-sm">
        {hasPeriod ? (
          <form
            method="GET"
            action="/laporan"
            className="flex flex-wrap items-end gap-2"
          >
            <input type="hidden" name="tab" value={tab} />
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold text-ink-soft">
                Dari Tanggal
              </span>
              <TextInput type="date" name="from" defaultValue={from} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold text-ink-soft">
                Sampai Tanggal
              </span>
              <TextInput type="date" name="to" defaultValue={to} />
            </label>
            <Btn type="submit" variant="subtle">
              Terapkan
            </Btn>
          </form>
        ) : (
          <p className="pb-2 text-xs text-ink-soft">
            Laporan inventaris menampilkan kondisi stok terkini.
          </p>
        )}

        <div className="ml-auto flex gap-2">
          {canExport ? (
            <>
              <a href={csvHref}>
                <Btn variant="subtle" type="button">
                  <IconDownload size={15} /> CSV
                </Btn>
              </a>
              <Btn onClick={exportPDF} disabled={pdfBusy}>
                <IconDownload size={15} /> {pdfBusy ? "Membuat PDF…" : "PDF"}
              </Btn>
            </>
          ) : (
            <p className="pb-2 text-xs font-semibold text-warn">
              Ekspor hanya untuk Pemilik / Manajer.
            </p>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {report.summary.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-line bg-card px-4 py-3 shadow-sm"
          >
            <p className="text-[11px] font-bold text-ink-faint">{s.label}</p>
            <p className="tnum mt-1 font-display text-sm font-bold text-ink">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      {report.rows.length === 0 ? (
        <EmptyState
          icon={<IconReport size={20} />}
          title="Tidak ada data pada periode ini"
          body="Coba ubah rentang tanggal atau catat transaksi terlebih dahulu."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="sticky top-0">
                <tr className="border-b border-line bg-surface text-left text-[11px] font-bold tracking-wide text-ink-faint uppercase">
                  {report.headers.map((h) => (
                    <th key={h} className="px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.rows.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-line-soft last:border-0 hover:bg-surface"
                  >
                    {r.map((c, j) => (
                      <td
                        key={j}
                        className={`px-4 py-2.5 text-[13px] ${
                          j === r.length - 1
                            ? "tnum text-right font-semibold text-ink"
                            : "text-ink-soft"
                        }`}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
