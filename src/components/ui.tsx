"use client";

import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { IconAlert, IconCheck, IconX } from "./icons";

/* ---------------- Buttons ---------------- */

type BtnVariant = "primary" | "subtle" | "danger" | "ghost" | "warn";

const BTN_CLS: Record<BtnVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-strong focus-visible:ring-primary/40",
  subtle:
    "bg-card border border-line text-ink hover:bg-line-soft focus-visible:ring-primary/30",
  danger:
    "bg-danger text-white hover:bg-[#992e24] focus-visible:ring-danger/40",
  warn: "bg-warn text-white hover:bg-[#974507] focus-visible:ring-warn/40",
  ghost: "text-ink-soft hover:bg-line-soft focus-visible:ring-primary/30",
};

export function Btn({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: "sm" | "md";
}) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm"
      } ${BTN_CLS[variant]} ${className}`}
    />
  );
}

/* ---------------- Form fields ---------------- */

export const inputCls =
  "w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-ink-soft">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-1 block text-[11px] text-ink-faint">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${inputCls} appearance-none ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${inputCls} min-h-20 resize-y ${props.className ?? ""}`}
    />
  );
}

/* ---------------- Badge ---------------- */

export function Badge({
  children,
  cls = "bg-line-soft text-ink-soft",
}: {
  children: ReactNode;
  cls?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ${cls}`}
    >
      {children}
    </span>
  );
}

/* ---------------- Modal ---------------- */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-night/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-6">
      <button
        aria-label="Tutup"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`modal-in relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-surface shadow-2xl sm:rounded-xl ${
          wide ? "sm:max-w-3xl" : "sm:max-w-lg"
        }`}
      >
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-base font-bold text-ink">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-line-soft hover:text-ink"
            aria-label="Tutup dialog"
          >
            <IconX size={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Hapus",
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-ink-soft">{body}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Btn variant="subtle" onClick={onCancel} disabled={busy}>
          Batal
        </Btn>
        <Btn variant="danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Memproses…" : confirmLabel}
        </Btn>
      </div>
    </Modal>
  );
}

/* ---------------- Empty state ---------------- */

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
      {icon ? (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
          {icon}
        </div>
      ) : null}
      <p className="font-display text-sm font-bold text-ink">{title}</p>
      {body ? (
        <p className="mt-1 max-w-sm text-xs text-ink-soft">{body}</p>
      ) : null}
    </div>
  );
}

/* ---------------- Stat card ---------------- */

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "warn" | "danger" | "primary" | "teal";
}) {
  const tones: Record<string, string> = {
    default: "bg-line-soft text-ink-soft",
    primary: "bg-primary-soft text-primary-strong",
    warn: "bg-warn-soft text-warn",
    danger: "bg-danger-soft text-danger",
    teal: "bg-teal-soft text-teal",
  };
  return (
    <div className="rounded-xl border border-line bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-ink-soft">{label}</p>
        {icon ? (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="tnum mt-2 font-display text-xl font-bold text-ink">
        {value}
      </p>
      {sub ? <div className="mt-1 text-[11px] text-ink-faint">{sub}</div> : null}
    </div>
  );
}

/* ---------------- Toast ---------------- */

type Toast = { id: number; message: string; type: "success" | "error" };

let toastSeq = 0;

export function toast(message: string, type: Toast["type"] = "success") {
  window.dispatchEvent(
    new CustomEvent("app:toast", { detail: { id: ++toastSeq, message, type } })
  );
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const t = (e as CustomEvent<Toast>).detail;
      setItems((prev) => [...prev, t]);
      setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== t.id));
      }, 4000);
    };
    window.addEventListener("app:toast", handler);
    return () => window.removeEventListener("app:toast", handler);
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[80] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={`toast-in pointer-events-auto flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm font-semibold shadow-lg ${
            t.type === "success"
              ? "border-primary/25 bg-primary-soft text-primary-strong"
              : "border-danger/25 bg-danger-soft text-danger"
          }`}
        >
          <span className="mt-0.5 shrink-0">
            {t.type === "success" ? <IconCheck size={15} /> : <IconAlert size={15} />}
          </span>
          <span>{t.message}</span>
          <button
            className="ml-auto shrink-0 opacity-60 hover:opacity-100"
            onClick={() =>
              setItems((prev) => prev.filter((x) => x.id !== t.id))
            }
            aria-label="Tutup notifikasi"
          >
            <IconX size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Spinner ---------------- */

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z"
      />
    </svg>
  );
}
