# 01 — Ringkasan & Tujuan

## 1. Ringkasan
Aplikasi web progresif (PWA) untuk mengelola seluruh aktivitas organisasi karang taruna: catatan per bagian, keuangan, data anggota, struktur organisasi multi-agenda, kegiatan & RAB, komunikasi internal, inventaris, surat-menyurat, pusat notifikasi, pengaturan sistem, hingga dashboard transparansi publik.

**Nama aplikasi:** KartaTuju

**Target pengguna:** Organisasi masyarakat (karang taruna) — UI harus sederhana, jelas, mudah dipakai warga dari berbagai usia.

**Tech stack:** Next.js 16 (App Router + Webpack), Supabase (DB + Auth + Storage + Realtime), Shadcn/ui, Tailwind CSS 4, React Query, Zustand, PWA (`@ducanh2912/next-pwa`), Three.js/R3F, GSAP, Vercel (deploy + cron).

---

## 2. Tujuan
- Satu tempat mencatat semua kegiatan organisasi per bagian.
- Setiap bagian bisa CRUD catatannya sendiri tanpa saling tabrak data.
- Struktur "bagian" fleksibel — bisa tambah bagian baru kapan saja (tidak hardcode).
- Bendahara punya modul khusus pencatatan keuangan (masuk/keluar + bukti nota), bisa dikaitkan ke kegiatan & RAB.
- Ketua dan Admin punya visibilitas penuh ke semua bagian; bagian lain terisolasi datanya.
- Data anggota, kegiatan, aset, dan surat-menyurat organisasi terkelola rapi dalam satu sistem.
- Struktur organisasi mendukung **banyak agenda** (bukan hanya satu struktur tetap) yang bisa berganti seiring waktu.
- Kondisi kas & aktivitas organisasi bisa diakses publik/warga sebagai bentuk transparansi.
- Warga bisa mengirim **aspirasi** langsung dari halaman publik.
- Seluruh aktivitas penting otomatis menghasilkan **notifikasi** di pusat notifikasi.
- Admin bisa mengatur konfigurasi organisasi lewat **pengaturan sistem** terpusat.
- Aplikasi bisa di-**install sebagai PWA** di perangkat mobile.
