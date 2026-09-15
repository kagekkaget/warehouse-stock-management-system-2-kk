"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconAlert, IconBrand, IconCheck, IconClock, IconLeaf } from "@/components/icons";
import { Btn, Field, Spinner, TextInput } from "@/components/ui";
import { postJSON } from "@/lib/fetch";

const DEMO_ACCOUNTS = [
  { label: "Pemilik", email: "owner@gudangku.id", password: "owner123" },
  { label: "Manajer", email: "manager@gudangku.id", password: "manager123" },
  { label: "Staf", email: "staff@gudangku.id", password: "staff123" },
];

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await postJSON("/api/auth/login", { email, password });
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-night p-10 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <IconBrand size={22} />
          </span>
          <div>
            <p className="font-display text-lg leading-tight font-bold text-white">
              GudangKu
            </p>
            <p className="text-[10px] font-bold tracking-[0.18em] text-night-text">
              SISTEM LAPORAN STOK GUDANG
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-3xl leading-snug font-bold text-white">
            Stok terpantau,
            <br />
            limbah produk berkurang.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-night-text">
            Dirancang untuk pemilik toko kecil di Indonesia: pantau stok secara
            real-time, cegah barang kedaluwarsa, dan ambil keputusan restok
            berdasarkan data — bukan tebakan.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-night-text">
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-strong">
                <IconClock size={13} />
              </span>
              Peringatan otomatis untuk stok menipis & produk mendekati masa
              kedaluwarsa.
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-strong">
                <IconLeaf size={13} />
              </span>
              Pencatatan limbah & susut untuk menekan kerugian gudang.
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-strong">
                <IconCheck size={13} />
              </span>
              Laporan inventaris, penjualan, dan limbah — ekspor PDF & CSV.
            </li>
          </ul>
        </div>

        <p className="relative text-[11px] text-night-text/70">
          Data tersimpan aman di server dengan akses berbasis peran, sesuai
          prinsip perlindungan data (UU PDP No. 27/2022).
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-bg px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <IconBrand size={20} />
            </span>
            <p className="font-display text-base font-bold text-ink">GudangKu</p>
          </div>

          <h2 className="font-display text-xl font-bold text-ink">
            Masuk ke akun Anda
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Gunakan akun sesuai peran Anda di toko.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Email">
              <TextInput
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@toko.co.id"
              />
            </Field>
            <Field label="Kata Sandi">
              <TextInput
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-soft px-3 py-2.5 text-xs font-semibold text-danger">
                <IconAlert size={14} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <Btn type="submit" disabled={busy} className="w-full py-2.5">
              {busy ? (
                <>
                  <Spinner /> Memeriksa…
                </>
              ) : (
                "Masuk"
              )}
            </Btn>
          </form>

          <div className="mt-6 rounded-xl border border-line bg-card p-4 shadow-sm">
            <p className="text-[11px] font-bold tracking-wide text-ink-faint uppercase">
              Akun demo — klik untuk mengisi
            </p>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => {
                    setEmail(a.email);
                    setPassword(a.password);
                    setError(null);
                  }}
                  className="rounded-lg border border-line bg-surface px-2 py-2 text-center transition-colors hover:border-primary hover:bg-primary-soft"
                >
                  <span className="block text-xs font-bold text-ink">
                    {a.label}
                  </span>
                  <span className="block text-[10px] text-ink-faint">
                    {a.password}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
