# 05 — Sitemap & Alur Halaman

## 6. Alur Halaman (Sitemap)

Aplikasi menggunakan **Next.js App Router** dengan **route groups** untuk memisahkan layout publik, autentikasi, dan internal.

### 6.1 Halaman Publik — Route Group `(public)`
```
/                         → Dashboard publik/transparansi (total kas, jumlah anggota, kegiatan terakhir) - tanpa login
/kontak                   → Halaman kontak sekretariat + formulir aspirasi warga
/laporan-keuangan         → Laporan arus kas publik (bisa di-toggle dari pengaturan)
```

### 6.2 Autentikasi — Route Group `(auth)`
```
/login                    → Halaman login (email/password via Supabase Auth)
```

### 6.3 Halaman Internal — Route Group `(admin)`
```
/dashboard                → Dashboard internal per role (admin/ketua/anggota)
/profil                   → Halaman profil dinamis (foto + preview, username, bio, nomor WA, kartu lanyard)
/bagian                   → Kelola daftar bagian (admin)
/pengguna                 → Manajemen user & role (admin only)
/catatan                  → Halaman catatan per bagian (sesuai bagian_id user, atau semua untuk admin/ketua)
/keuangan                 → Halaman catatan keuangan (masuk/keluar, ringkasan saldo, relasi kegiatan)
/anggota                  → Data anggota + CRUD
/struktur                 → Struktur organisasi keseluruhan (semua bagian & agenda, dilihat semua role)
/struktur/[bagian]/agenda → Kelola agenda organisasi per bagian (buat agenda baru: ketua/admin)
/struktur/[bagian]/agenda/[id] → Periode & bagan kepengurusan dalam agenda tersebut
/kegiatan                 → Kalender & list kegiatan + target RAB
/kegiatan/[id]/dokumentasi → Galeri foto acara tersebut
/pengumuman               → List & buat pengumuman
/diskusi                  → Papan diskusi + catatan umum (lintas departemen, mention @bagian)
/diskusi/[id]             → Thread diskusi/catatan umum + balasan
/inventaris               → Data barang + status pinjam-pakai
/surat                    → Template surat
/arsip                    → Arsip dokumen (SK, proposal, LPJ)
/aspirasi                 → Kelola aspirasi warga masuk (admin/ketua)
/notifikasi               → Pusat notifikasi — riwayat lengkap
/pengaturan               → Pengaturan sistem (admin only)
```

### 6.4 API Routes
```
/api/health               → Health check endpoint
/api/keep-alive           → Vercel Cron — keep Supabase project alive (setiap 5 hari)
/api/presence             → User presence tracking (heartbeat)
```

### 6.5 Halaman Sistem
```
/maintenance              → Halaman mode pemeliharaan (ditampilkan saat mode_maintenance aktif)
```
