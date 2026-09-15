export function rupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export function compactNumber(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n || 0);
}

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const dt = typeof d === "string" ? parseISODate(d) ?? new Date(d) : d;
  return dt.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Parse "YYYY-MM-DD" as a local date (avoids UTC shift). */
export function parseISODate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function todayISO(): string {
  const d = new Date();
  return toISODate(d);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Days from today until the given ISO date. Negative = already past. */
export function daysUntil(iso: string): number {
  const target = parseISODate(iso);
  if (!target) return 0;
  const now = parseISODate(todayISO());
  if (!now) return 0;
  return Math.round(
    (target.getTime() - now.getTime()) / 86_400_000
  );
}

export type StockState =
  | "habis"
  | "menipis"
  | "kedaluwarsa"
  | "hampir-kedaluwarsa"
  | "aman";

export function productStockState(p: {
  stock: number;
  minStock: number;
  expiryDate: string | null;
}): StockState {
  if (p.expiryDate && daysUntil(p.expiryDate) < 0) return "kedaluwarsa";
  if (p.stock <= 0) return "habis";
  if (p.expiryDate && daysUntil(p.expiryDate) <= 14)
    return "hampir-kedaluwarsa";
  if (p.stock <= p.minStock) return "menipis";
  return "aman";
}

export const STOCK_STATE_META: Record<
  StockState,
  { label: string; cls: string; dot: string }
> = {
  aman: {
    label: "Aman",
    cls: "bg-primary-soft text-primary-strong",
    dot: "bg-primary",
  },
  menipis: {
    label: "Stok Menipis",
    cls: "bg-warn-soft text-warn",
    dot: "bg-warn",
  },
  habis: {
    label: "Habis",
    cls: "bg-danger-soft text-danger",
    dot: "bg-danger",
  },
  "hampir-kedaluwarsa": {
    label: "Segera Kedaluwarsa",
    cls: "bg-warn-soft text-warn",
    dot: "bg-warn",
  },
  kedaluwarsa: {
    label: "Kedaluwarsa",
    cls: "bg-danger-soft text-danger",
    dot: "bg-danger",
  },
};

export function expiryChip(expiryDate: string | null): {
  text: string;
  cls: string;
} | null {
  if (!expiryDate) return null;
  const d = daysUntil(expiryDate);
  if (d < 0)
    return {
      text: `Kedaluwarsa ${Math.abs(d)} hari lalu`,
      cls: "text-danger",
    };
  if (d === 0) return { text: "Kedaluwarsa hari ini", cls: "text-danger" };
  if (d <= 14) return { text: `${d} hari lagi`, cls: "text-warn" };
  return { text: formatDate(expiryDate), cls: "text-ink-soft" };
}

/* ---------------- CSV helpers ---------------- */

function csvCell(v: string | number): string {
  const s = String(v ?? "");
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCSV(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers, ...rows].map((r) =>
    r.map((c) => csvCell(c)).join(",")
  );
  // BOM so Excel renders UTF-8 correctly
  return "\uFEFF" + lines.join("\r\n");
}

export const PAYMENT_LABEL: Record<string, string> = {
  lunas: "Lunas",
  belum_bayar: "Belum Bayar",
  dp: "DP / Uang Muka",
};

export const PAYMENT_CLS: Record<string, string> = {
  lunas: "bg-primary-soft text-primary-strong",
  belum_bayar: "bg-danger-soft text-danger",
  dp: "bg-warn-soft text-warn",
};

export const ORDER_STATUS_LABEL: Record<string, string> = {
  diproses: "Diproses",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export const ORDER_STATUS_CLS: Record<string, string> = {
  diproses: "bg-teal-soft text-teal",
  selesai: "bg-primary-soft text-primary-strong",
  dibatalkan: "bg-line-soft text-ink-faint",
};

export const WASTE_REASON_LABEL: Record<string, string> = {
  kedaluwarsa: "Kedaluwarsa",
  rusak: "Rusak / Pecah",
  lainnya: "Lainnya",
};
