"use client";

import { useState } from "react";
import { Btn } from "./ui";
import { IconCoffee, IconCode, IconExternalLink, IconX } from "./icons";

const NOMINALS = [
  { amount: 6000, label: "Rp6.000" },
  { amount: 10000, label: "Rp10.000" },
  { amount: 20000, label: "Rp20.000" },
  { amount: 50000, label: "Rp50.000" },
  { amount: 100000, label: "Rp100.000" },
];

const TRAKTEER_URL = "https://trakteer.id/perpus_opera/";
const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${TRAKTEER_URL}`;


export function TrakteerWidget() {
  const [open, setOpen] = useState(false);
  const [selectedNominal, setSelectedNominal] = useState<number | null>(null);

  function openTrakteer(amount?: number) {
    let url = TRAKTEER_URL;
    if (amount) {
      url += `?amount=${amount}`;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-night px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-night-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        title="Traktir kopi"
      >
        <IconCoffee size={16} />
        <span className="hidden sm:inline">Web app ini gratis & bebas iklan. Kopi kecil, server tetap jalan</span>
        <span className="sm:hidden">Traktir kopi</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-night/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-6">
          <button
            aria-label="Tutup"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="modal-in relative flex w-full max-w-sm flex-col overflow-hidden rounded-t-2xl bg-surface shadow-2xl sm:rounded-xl">
            <div className="flex items-start justify-between border-b border-line px-5 py-4">
              <div>
                <h2 className="font-display text-base font-bold text-ink">
                  Traktir Kopi ☕
                </h2>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Web app ini gratis & bebas iklan. Dukung kami agar server tetap jalan.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-line-soft hover:text-ink"
                aria-label="Tutup dialog"
              >
                <IconX size={16} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4 space-y-4">
              {/* Nominal buttons */}
              <div>
                <p className="mb-2 text-[11px] font-bold text-ink-soft uppercase tracking-wide">
                  Pilih nominal
                </p>
                <div className="flex flex-wrap gap-2">
                  {NOMINALS.map((n) => (
                    <button
                      key={n.amount}
                      type="button"
                      onClick={() => {
                        setSelectedNominal(n.amount);
                        openTrakteer(n.amount);
                      }}
                      className={`rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                        selectedNominal === n.amount
                          ? "border-primary bg-primary-soft text-primary-strong"
                          : "border-line bg-card text-ink hover:bg-line-soft"
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-2 rounded-xl border border-line bg-card p-4">
                <img
                  src={QR_CODE_URL}
                  alt="QR Code Trakteer"
                  width={160}
                  height={160}
                  className="rounded-lg"
                />
                <p className="text-[11px] text-ink-faint">
                  Scan QR code atau klik tombol di bawah
                </p>
                <Btn
                  variant="subtle"
                  size="sm"
                  onClick={() => openTrakteer(selectedNominal ?? undefined)}
                >
                  <IconExternalLink size={14} /> Buka Trakteer
                </Btn>
              </div>

              {/* Source code download */}
              <div className="rounded-xl border border-line bg-card p-4">
                <p className="mb-2 text-[11px] font-bold text-ink-soft uppercase tracking-wide">
                  Source Code
                </p>
                <Btn
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    window.open(
                      "https://github.com/kagekkaget/warehouse-stock-management-system-2-kk",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  <IconCode size={14} /> Unduh Source Code Lengkap
                </Btn>
                <p className="mt-1 text-[10px] text-ink-faint text-center">
                  GitHub: kagekkaget/warehouse-stock-management-system-2-kk
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
