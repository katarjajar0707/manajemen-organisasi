# 07 — Roadmap Pengembangan

## 7. Fase Pengembangan (Roadmap)

1. **Fase 1 – Setup Proyek** ✅
   Init Next.js (App Router), install & konfigurasi Shadcn + Tailwind, buat project Supabase (belum diintegrasikan penuh), struktur folder, routing dasar sesuai sitemap.

2. **Fase 2 – UI Frontend (Data Dummy)** ✅
   Bangun seluruh tampilan & komponen untuk semua modul terlebih dahulu memakai data dummy/mock — catatan, keuangan, profil, struktur organisasi multi-agenda, kegiatan, komunikasi (diskusi/catatan umum/mention), inventaris, surat, arsip, dan dashboard publik. Fokus di layout, komponen Shadcn, dan responsive (mobile-first) sebelum ada data asli.

3. **Fase 3 – Backend Fondasi** ✅
   Integrasi Supabase Auth, skema DB inti (`bagian`, `profiles`), RLS dasar (anggota vs ketua/admin), menu manajemen user (admin).

4. **Fase 4 – Backend Catatan & Keuangan** ✅
   Sambungkan UI ke `catatan` (tanggal otomatis, lampiran opsional) dan `catatan_keuangan` (masuk/keluar, lampiran wajib untuk keluar), ringkasan saldo, komponen preview thumbnail + modal jadi fungsional.

5. **Fase 5 – Backend Profil** ✅
   Sambungkan halaman profil ke `profiles` — upload foto + preview, edit username & bio, role read-only.

6. **Fase 6 – Backend Struktur Organisasi Multi-Agenda** ✅
   CRUD `anggota`, `agenda_organisasi` (khusus ketua/admin), `periode_kepengurusan`, halaman struktur keseluruhan yang terbuka untuk semua role.

7. **Fase 7 – Backend Kegiatan** ✅
   `kalender_kegiatan`, `dokumentasi_kegiatan` (galeri foto memakai komponen preview yang sama).

8. **Fase 8 – Backend Komunikasi** ✅
   `pengumuman` (broadcast satu arah), `diskusi`/`catatan_umum` + `diskusi_balasan` + fitur mention `@bagian` (`diskusi_mention`).

9. **Fase 9 – Backend Inventaris & Administrasi** ✅
   `inventaris` + `peminjaman_inventaris`, `template_surat`, `arsip_dokumen`.

10. **Fase 10 – Backend Transparansi** ✅
    Sambungkan dashboard publik ke data ringkasan kas, anggota, dan kegiatan asli (menggantikan dummy).

11. **Fase 11 – Polish & Fitur Tambahan** ✅
    Filter/search lintas modul, review responsive, penghalusan UX mobile. Termasuk penambahan fitur baru:
    - Pengaturan sistem (`pengaturan_sistem`)
    - Pusat notifikasi (trigger otomatis `buat_notifikasi_sistem`)
    - Nomor WA di profil (`nomor_wa`)
    - Sinkronisasi avatar profiles → anggota
    - Kartu lanyard digital (bucket `lanyard-cards`)
    - Riwayat login (`login_history`) & user presence tracking (`last_seen_at`, `/api/presence`)
    - Target RAB kegiatan (`target_rab`)
    - Halaman laporan keuangan publik (`/laporan-keuangan`)
    - Halaman kontak publik (`/kontak`)
    - Aspirasi warga (`/aspirasi`)
    - Pencarian global (`global-search-dialog`)
    - Color theme switcher (dark mode + tema warna)
    - PWA (`@ducanh2912/next-pwa`)
    - API keep-alive (`/api/keep-alive`) & health check (`/api/health`)
    - Supabase Realtime untuk diskusi, keuangan, notifikasi, login history

12. **Fase 12 – QA & Release** 🔲 *Belum dimulai*
    Testing fungsional per role (admin/ketua/anggota), uji RLS (pastikan bagian & data privat tidak bocor, tapi data lintas bagian tetap terbuka sesuai desain), uji fitur mention & dashboard publik, bug fixing, deploy ke production.

---

### Daftar Migration Files (22 file)

| # | File | Deskripsi |
|---|---|---|
| 001 | `001_initial_schema.sql` | Skema awal (bagian, catatan, catatan_keuangan, profiles, anggota, dll) |
| 002 | `002_phase3_auth_rls.sql` | Auth & RLS dasar |
| 003 | `003_phase4_storage.sql` | Storage buckets |
| 004 | `004_phase6_struktur.sql` | Struktur organisasi (agenda, periode) |
| 005 | `005_phase7_kegiatan.sql` | Kegiatan & dokumentasi |
| 006 | `006_phase8_komunikasi.sql` | Diskusi, mention, pengumuman |
| 007 | `007_phase9_inventaris_administrasi.sql` | Inventaris, surat, arsip |
| 008 | `008_phase10_transparansi.sql` | Dashboard transparansi |
| 009 | `009_phase10_fix_keuangan_rls.sql` | Fix RLS keuangan |
| 010 | `010_phase11_pengaturan_sistem.sql` | Pengaturan sistem |
| 011 | `011_cleanup_dummy_data.sql` | Hapus data dummy |
| 012 | `012_add_nomor_wa_to_profiles.sql` | Nomor WA di profiles |
| 013 | `013_realtime_aspirasi.sql` | Realtime untuk diskusi & keuangan |
| 014 | `014_sync_profile_avatar_to_anggota.sql` | Sync avatar profiles → anggota |
| 015 | `015_bagian_catatan_rls.sql` | RLS catatan per bagian |
| 016 | `016_restrict_catatan_to_own_bagian.sql` | Batasi catatan ke bagian sendiri |
| 017 | `017_notifikasi_sistem.sql` | Pusat notifikasi + trigger otomatis |
| 018 | `018_target_rab_dan_relasi_keuangan.sql` | Target RAB & relasi keuangan ke kegiatan |
| 019 | `019_add_tiktok_to_pengaturan_sistem.sql` | Kolom TikTok di pengaturan |
| 020 | `020_lanyard_cards_storage.sql` | Bucket storage kartu lanyard |
| 021 | `021_login_history_realtime.sql` | Login history + realtime |
| 022 | `022_login_history_logout_status.sql` | Logout status & last_seen_at |
