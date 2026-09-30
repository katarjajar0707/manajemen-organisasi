# 04 — Non-Functional Requirements

## 5. Non-Functional Requirements

### Keamanan
- **Row Level Security (RLS)** Supabase — anggota dibatasi ke `bagian_id` sendiri untuk data privat (catatan, keuangan).
- Data lintas bagian (diskusi/catatan umum, struktur organisasi, dashboard publik) sengaja dibuka lewat policy terpisah.
- Dashboard publik (4.10) diakses via view/RPC khusus yang hanya expose data ringkasan, bukan tabel mentah.

### Performa
- **Pagination/infinite scroll** untuk daftar catatan, agenda, diskusi, dan arsip yang panjang.
- **Server-side caching** (`unstable_cache`) untuk data pengaturan, transparansi, dan daftar bagian.
- **React Query** untuk client-side caching dan data fetching.

### Realtime
- Supabase Realtime di-publish untuk tabel:
  - `diskusi` — update papan diskusi
  - `catatan_keuangan` — update dashboard keuangan
  - `notifikasi` — notifikasi langsung
  - `login_history` — panel riwayat login admin
- Memungkinkan update dashboard tanpa refresh halaman.

### Backup
- **Soft delete** (bukan hard delete) agar data bisa dipulihkan (`deleted_at` pada tabel catatan & keuangan).

### Storage
- File (bukti nota, lampiran catatan, foto dokumentasi, foto profil, kartu lanyard, arsip dokumen) disimpan di **Supabase Storage** bucket privat, akses via **signed URL**.
- Kecuali aset yang memang untuk ditampilkan di dashboard publik.
- Bucket `lanyard-cards` bersifat **publik** — file hanya bisa diunggah oleh pemilik folder (RLS per `auth.uid()`).

### Keep-alive
- **Vercel Cron** (`/api/keep-alive`) berjalan setiap 5 hari untuk mencegah Supabase project di-pause (free tier).

### Health Check
- Endpoint `/api/health` untuk monitoring status aplikasi.

### PWA
- Aplikasi bisa di-install sebagai Progressive Web App via `@ducanh2912/next-pwa`.
- Cache hanya untuk aset statis, bukan halaman App Router (menghindari replay stale session).
