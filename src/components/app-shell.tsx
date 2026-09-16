"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ROLE_LABEL, type Role } from "@/lib/roles";
import { apiFetch } from "@/lib/fetch";
import {
  IconBox,
  IconBrand,
  IconCart,
  IconDashboard,
  IconLogout,
  IconMenu,
  IconReport,
  IconUserCog,
  IconUsers,
  IconWifi,
  IconWifiOff,
  IconX,
} from "./icons";
import { Toaster, toast } from "./ui";

type NavItem = { href: string; label: string; icon: ReactNode; show: boolean };

export function AppShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: Role };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [online, setOnline] = useState(() => {
    try {
      return navigator.onLine;
    } catch {
      return true;
    }
  });
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const up = () => {
      setOnline(true);
      toast("Koneksi pulih — data kembali tersinkron.", "success");
    };
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  const nav: NavItem[] = [
    {
      href: "/",
      label: "Dasbor",
      icon: <IconDashboard size={17} />,
      show: true,
    },
    { href: "/produk", label: "Produk & Stok", icon: <IconBox size={17} />, show: true },
    {
      href: "/pesanan",
      label: "Pesanan",
      icon: <IconCart size={17} />,
      show: true,
    },
    {
      href: "/pelanggan",
      label: "Pelanggan",
      icon: <IconUsers size={17} />,
      show: true,
    },
    {
      href: "/laporan",
      label: "Laporan",
      icon: <IconReport size={17} />,
      show: true,
    },
    {
      href: "/pengguna",
      label: "Pengguna",
      icon: <IconUserCog size={17} />,
      show: user.role === "owner",
    },
  ];

  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function logout() {
    setLoggingOut(true);
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
          <IconBrand size={20} />
        </span>
        <div>
          <p className="font-display text-[15px] leading-tight font-bold text-white">
            GudangKu
          </p>
          <p className="text-[10px] font-semibold tracking-wide text-night-text">
            LAPORAN STOK GUDANG
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav
          .filter((n) => n.show)
          .map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                active(n.href)
                  ? "bg-primary text-white"
                  : "text-night-text hover:bg-night-soft hover:text-white"
              }`}
            >
              {n.icon}
              {n.label}
            </Link>
          ))}
      </nav>
      <div className="border-t border-night-line px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-night-soft text-xs font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-white">
              {user.name}
            </p>
            <p className="text-[11px] text-night-text">
              {ROLE_LABEL[user.role]}
            </p>
          </div>
          <button
            onClick={logout}
            disabled={loggingOut}
            title="Keluar"
            className="rounded-lg p-2 text-night-text transition-colors hover:bg-night-soft hover:text-white disabled:opacity-50"
          >
            <IconLogout size={17} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Toaster />
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 bg-night lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="fade-in absolute inset-0 bg-night/60"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu"
          />
          <aside className="modal-in absolute inset-y-0 left-0 w-64 bg-night shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-3 rounded-md p-1.5 text-night-text hover:text-white"
              aria-label="Tutup menu"
            >
              <IconX size={16} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur sm:px-6">
          <button
            className="rounded-lg p-2 text-ink-soft hover:bg-line-soft lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu"
          >
            <IconMenu size={18} />
          </button>
          <div
            className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
              online
                ? "bg-primary-soft text-primary-strong"
                : "bg-warn-soft text-warn"
            }`}
            title={online ? "Terhubung ke server" : "Tidak ada koneksi"}
          >
            {online ? <IconWifi size={13} /> : <IconWifiOff size={13} />}
            {online ? "Online" : "Offline"}
          </div>
        </header>

        {!online && (
          <div className="border-b border-warn/20 bg-warn-soft px-4 py-2 text-xs font-semibold text-warn sm:px-6">
            Anda sedang offline. Perubahan data memerlukan koneksi internet —
            data akan otomatis tersinkron saat koneksi pulih.
          </div>
        )}

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
