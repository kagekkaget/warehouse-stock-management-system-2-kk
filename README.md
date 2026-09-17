# GudangKu — Sistem Laporan Stok Gudang

Aplikasi web untuk manajemen stok gudang, pelacakan produk, pencatatan pesanan, dan laporan inventaris. Dirancang untuk pemilik toko kecil di Indonesia.

## Fitur Utama

- **Dashboard** — Ringkasan stok, peringatan kedaluwarsa, pergerakan stok, dan susut produk
- **Produk & Stok** — Kelola inventaris: tambah, ubah, hapus produk. Pantau stok minimum & masa kedaluwarsa
- **Pesanan** — Catat penjualan ke pelanggan. Stok gudang berkurang otomatis
- **Pelanggan** — Profil, preferensi, dan riwayat transaksi pelanggan
- **Laporan** — Laporan inventaris, penjualan, dan limbah. Ekspor CSV & PDF
- **Pengguna** — Kelola akun tim (hanya pemilik)
- **Trakteer Widget** — Dukung pengembangan via trakteer.id

## Tech Stack

| Teknologi | Versi | Keterangan |
|---|---|---|
| Next.js | 16.2.6 | App Router (Server Components + API Routes) |
| React | 19.2.6 | UI Library |
| TypeScript | 5.9.3 | Type Safety |
| Tailwind CSS | 4.1.17 | Styling |
| Drizzle ORM | 0.45.2 | Database Query Builder |
| PostgreSQL | — | Database (Neon serverless pooler) |
| pg | 8.20.0 | PostgreSQL Driver |
| bcryptjs | 3.0.3 | Password Hashing |
| jsPDF | 4.2.1 | PDF Export |
| jsPDF-Autotable | 5.0.8 | PDF Table Generation |

## Prerequisites

- Node.js 18+
- npm 10+
- PostgreSQL database (Neon, Supabase, atau lokal)

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/kagekkaget/warehouse-stock-management-system-2-kk.git
cd warehouse-stock-management-system-2-kk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

Salin file `.env.example` dan isi dengan kredensial database Anda:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

### 4. Setup Database

#### Neon (direkomendasikan untuk production)

1. Buat akun di [neon.tech](https://neon.tech)
2. Buat project baru
3. Copy connection string dari Neon Dashboard
4. Push schema ke Neon:

```bash
# Ganti DATABASE_URL dengan URL Neon Anda
DATABASE_URL="postgresql://user:password@host/database?sslmode=require" npx drizzle-kit push
```

5. Seed database dengan data contoh:

```bash
DATABASE_URL="postgresql://user:password@host/database?sslmode=require" npx tsx src/db/seed.ts
```

#### Lokal (PostgreSQL)

Pastikan PostgreSQL berjalan di `localhost:5432`. Edit `drizzle.config.json` jika berbeda:

```bash
npx drizzle-kit push
npx tsx src/db/seed.ts
```

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Demo Accounts

| Peran | Email | Kata Sandi |
|---|---|---|
| Pemilik | owner@gudangku.id | owner123 |
| Manajer | manager@gudangku.id | manager123 |
| Staf | staff@gudangku.id | staff123 |

## Deployment ke Vercel

### 1. Buat Project di Vercel

1. Buka [vercel.com](https://vercel.com)
2. Klik **Add New Project**
3. Import dari GitHub: `kagekkaget/warehouse-stock-management-system-2-kk`
4. Klik **Deploy**

### 2. Set Environment Variable

1. Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Tambahkan:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:***@ep-***.neon.tech/neondb?sslmode=require&channel_binding=require`
   - Pastikan **Production**, **Preview**, dan **Development** semua dicentang
3. Klik **Save**

### 3. Redeploy

Setelah menyimpan environment variable, Vercel akan otomatis me-deploy ulang.

### 4. Push Schema ke Production Database

Sebelum pertama kali gunakan, pastikan schema sudah ada di database production:

```bash
DATABASE_URL="your-production-url" npx drizzle-kit push
DATABASE_URL="your-production-url" npx tsx src/db/seed.ts
```

## Struktur Project

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (font, metadata)
│   ├── globals.css               # Tailwind CSS & custom styles
│   ├── login/                    # Halaman login
│   │   ├── page.tsx
│   │   └── login-form.tsx
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── logout/route.ts
│   │   ├── products/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/stock/route.ts
│   │   ├── customers/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── orders/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── users/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── reports/
│   │   │   └── export/route.ts
│   │   ├── waste/route.ts
│   │   └── health/route.ts
│   ├── (app)/                    # Route group — halaman utama (auth required)
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard
│   │   ├── produk/               # Produk & Stok
│   │   ├── pesanan/              # Pesanan
│   │   ├── pelanggan/            # Pelanggan
│   │   ├── pelanggan/[id]/       # Detail Pelanggan
│   │   ├── laporan/              # Laporan
│   │   └── pengguna/             # Pengguna
│   └── ...
├── components/                   # React Components
│   ├── app-shell.tsx             # Layout shell (sidebar, topbar)
│   ├── icons.tsx                 # SVG Icons
│   ├── ui.tsx                    # UI primitives (Button, Modal, Badge, etc.)
│   ├── products-manager.tsx      # Produk CRUD UI
│   ├── orders-manager.tsx        # Pesanan UI
│   ├── customers-manager.tsx     # Pelanggan UI
│   ├── customer-detail.tsx       # Detail Pelanggan
│   ├── reports-view.tsx          # Laporan view + export
│   ├── users-manager.tsx         # Pengguna UI
│   └── trakteer-widget.tsx       # Trakteer floating widget
├── db/                           # Database
│   ├── index.ts                  # DB connection (Pool + Drizzle)
│   ├── schema.ts                 # Drizzle schema
│   └── seed.ts                   # Seed data
└── lib/                          # Utilities
    ├── auth.ts                   # Auth, sessions, validation
    ├── roles.ts                  # Role & permission definitions
    ├── format.ts                 # Formatting helpers (rupiah, date, etc.)
    ├── fetch.ts                  # Client fetch wrapper
    └── reports.ts                # Report data queries
```

## Peran & Hak Akses

| Fitur | Pemilik | Manajer | Staf |
|---|---|---|---|
| Lihat Dashboard | ✅ | ✅ | ✅ |
| Kelola Produk | ✅ | ✅ | ❌ |
| Catat Pesanan | ✅ | ✅ | ✅ |
| Kelola Pelanggan | ✅ | ✅ | ❌ (tambah) |
| Lihat Laporan | ✅ | ✅ | ✅ |
| Ekspor Laporan | ✅ | ✅ | ❌ |
| Kelola Pengguna | ✅ | ❌ | ❌ |
| Catat Limbah | ✅ | ✅ | ✅ |
| Sesuaikan Stok | ✅ | ✅ | ✅ |

## Contoh Laporan

Setelah login, dashboard menampilkan:
- **Nilai Stok** total semua produk
- **Jenis Produk** yang terdaftar
- **Stok Menipis** produk di bawah minimum
- **Segera Kedaluwarsa** produk mendekati masa ED
- **Omzet Bulan Ini** dari pesanan yang selesai

## Trakteer

Aplikasi ini **gratis & bebas iklan**. Dukung pengembangan dengan traktir kopi:

- 🖱️ Klik widget **Traktir Kopi** di sudut kanan bawah layar
- 💳 Pilih nominal atau scan QR Code
- 🔗 Buka [trakteer.id/perpus_opera](https://trakteer.id/perpus_opera/)

## Kontribusi

Ini adalah proyek open source. Silakan:
- Clone repository
- Buat branch baru (`git checkout -b fitur/baru`)
- Commit perubahan
- Buat Pull Request

## Lisensi

Open Source oleh MZF - 2026

---

** GudangKu — Stok terpantau, limbah produk berkurang. **
