# 03 — Fitur & User Stories

## 4.1 Manajemen Bagian (Admin/Ketua)
- Sebagai admin, saya bisa **tambah, edit, hapus** bagian organisasi.
- Setiap bagian otomatis punya halaman catatan sendiri.

## 4.2 Catatan Umum per Bagian (Sekretaris, Ketua, Humas, Acara, Kominfo, bagian lain)
- CRUD catatan: judul, isi. Tanggal **otomatis** terisi sesuai hari input — tidak ada field/label tanggal di form.
- Lampiran opsional: gambar, PDF, atau file lain, upload ke Supabase Storage.
- List catatan dengan pencarian & filter tanggal.
- Tampilan kartu sederhana (mobile-friendly), bukan tabel padat.
- *Catatan ini bersifat privat per bagian — beda dari "Catatan Umum lintas departemen" di 4.7 yang tampil di papan diskusi.*

## 4.3 Catatan Keuangan (Bendahara)
- Tambah **uang masuk**: judul, keterangan, jumlah, lampiran opsional. Tanggal otomatis (tanpa field tanggal).
- Tambah **uang keluar**: judul (alasan), keterangan, jumlah, **lampiran wajib** (upload ke Supabase Storage). Tanggal otomatis.
- **Relasi ke kegiatan**: transaksi keuangan bisa dikaitkan ke kegiatan tertentu untuk pelacakan realisasi RAB.
- Ringkasan saldo: total masuk, total keluar, saldo akhir — ditampilkan di atas (card summary), agar cepat dibaca.
- Riwayat transaksi dalam bentuk list/kartu, bisa difilter per bulan & jenis (masuk/keluar).
- Tabel `catatan_keuangan` di-publish ke **Supabase Realtime** untuk update dashboard secara langsung.

### 4.3.1 Preview Lampiran (berlaku untuk catatan & pengeluaran)
- Lampiran ditampilkan sebagai **thumbnail kecil** di kartu catatan/transaksi.
- Klik thumbnail → buka **modal preview diperbesar**.
- Modal punya tombol **✕ (tutup)** dan tombol **download**.
- Untuk file non-gambar (PDF, dll), thumbnail berupa ikon tipe file; modal preview PDF atau tombol download langsung jika tipe file tidak bisa di-preview di browser.

## 4.4 Manajemen Anggota
- CRUD data anggota: nama, kontak, RT/RW, jabatan, foto (opsional).
- Anggota terhubung ke periode aktif dalam sebuah agenda organisasi.
- Foto profil di-sinkronkan otomatis dari `profiles` via trigger database.

## 4.5 Struktur Organisasi Multi-Agenda
- **Kelola Agenda Organisasi**: Ketua/Admin bisa membuat **agenda baru** per bagian (mis. "Kepengurusan Utama", "Panitia HUT RI 2026") — anggota biasa tidak bisa membuat agenda baru, hanya melihat.
- Setiap agenda punya **periode kepengurusan sendiri** — bisa lebih dari satu periode berjalan bergantian, tiap agenda punya satu periode aktif.
- **Bagan struktur organisasi**: menampilkan anggota per periode aktif dalam agenda tertentu, dikelompokkan per jabatan, dalam bentuk kartu/pohon jabatan sederhana.
- Struktur historis (agenda & periode lama) tetap tersimpan dan bisa dilihat kembali.
- **Detail struktur keseluruhan** (semua bagian, semua agenda aktif) bisa dilihat oleh **semua role & semua departemen**.

## 4.6 Kegiatan & Acara
- **Kalender/jadwal kegiatan**: CRUD jadwal (judul, deskripsi, tanggal mulai–selesai, lokasi, bagian penanggung jawab, **target RAB**). Tampilan kalender bulanan + list agenda mendatang.
- **Target RAB**: admin/ketua bisa menetapkan target anggaran per kegiatan. Realisasi dihitung otomatis dari `catatan_keuangan` yang terhubung ke kegiatan.
- *Tidak ada fitur presensi kehadiran* — cukup jadwal & info kegiatan.
- **Dokumentasi kegiatan**: galeri foto per acara, upload banyak foto sekaligus + caption. Preview foto pakai komponen modal yang sama seperti 4.3.1.

## 4.7 Komunikasi & Informasi (Papan Diskusi + Catatan Umum)
- **Papan diskusi**: satu halaman, bisa dilihat **semua role & semua departemen**.
- Di papan diskusi ini juga tersedia menu **"Catatan Umum"** — semua departemen bisa menulis catatan yang ingin dibagikan lintas bagian.
- **Tag @departemen**: saat menulis diskusi/catatan umum, user bisa ketik `@` lalu pilih nama bagian (mis. `@Bendahara`, `@Acara`) untuk **mention** bagian tersebut. Bagian yang di-mention muncul sebagai badge/notifikasi.
- Anggota bisa balas/berkomentar di setiap topik diskusi maupun catatan umum.
- **Pengumuman/broadcast**: admin/ketua/bagian tertentu bisa buat pengumuman untuk semua anggota atau bagian tertentu saja. Tampil di dashboard sebagai notifikasi/banner (satu arah, bukan diskusi dua arah).

## 4.8 Inventaris
- CRUD data barang/aset (nama, jumlah, kondisi, foto).
- **Pinjam-pakai**: catat siapa yang meminjam, tanggal pinjam (otomatis), rencana tanggal kembali, dan status (dipinjam/dikembalikan).
- List barang menampilkan status terkini (tersedia/sedang dipinjam).

## 4.9 Surat & Administrasi
- **Template surat**: kelola template (surat keluar, surat masuk, proposal kegiatan, undangan) — admin/sekretaris bisa isi ulang template untuk surat baru.
- **Arsip dokumen**: upload & kelola dokumen penting (SK kepengurusan, proposal, LPJ), dikategorikan dan bisa dikaitkan ke agenda organisasi tertentu.
- Pencarian arsip berdasarkan judul/kategori.

## 4.10 Laporan & Transparansi
- **Dashboard publik** (bisa diakses tanpa login, read-only): ringkasan total kas, jumlah anggota aktif, dan kegiatan terakhir/mendatang.
- **Halaman laporan keuangan publik** (`/laporan-keuangan`): detail arus kas yang bisa diakses publik, bisa di-toggle dari pengaturan sistem.
- **Halaman kontak** (`/kontak`): informasi sekretariat, alamat, media sosial, dan formulir aspirasi warga.
- Data bersifat ringkasan saja demi menjaga privasi.
- Portal publik bisa diaktifkan/nonaktifkan dari pengaturan sistem.

## 4.11 Halaman Profil Dinamis
- Setiap user (semua role) punya halaman profil sendiri, bisa diakses & diedit kapan saja.
- **Foto profil**: upload foto baru, ada **preview** sebelum disimpan. Mendukung konversi HEIC ke JPEG otomatis (via `heic2any`).
- **Edit username**, **bio** (deskripsi singkat), dan **nomor WhatsApp**.
- **Kartu lanyard digital**: user bisa generate dan download kartu identitas anggota dalam format gambar (disimpan di bucket Storage `lanyard-cards`).
- **Role tidak bisa diubah** dari halaman profil — hanya admin yang bisa mengubah role lewat menu manajemen user.
- Menampilkan ringkasan bagian/jabatan user saat ini (read-only di halaman profil).

## 4.12 Autentikasi & Akses
- Login via Supabase Auth (email/password).
- **Riwayat login** dicatat otomatis di tabel `login_history` dan ditampilkan di dashboard admin.
- **User presence tracking**: melacak status online/offline user via `last_seen_at` di `profiles` dan API `/api/presence`.
- **Anggota bagian:** hanya bisa lihat & CRUD catatan di bagiannya sendiri (RLS policy per `bagian_id`).
- **Ketua & Admin:** bisa memantau dan CRUD penuh ke **semua** bagian.
- **Manajemen user** (buat/hapus akun, atur role, assign ke bagian) hanya menu admin.

## 4.13 Pusat Notifikasi
- Notifikasi **dibuat otomatis** via database trigger setiap ada INSERT pada 11 tabel utama.
- Notifikasi muncul di **header** aplikasi (bell icon) dengan jumlah belum dibaca.
- Dropdown notifikasi menampilkan 5 notifikasi terbaru, dengan link ke halaman terkait.
- Halaman `/notifikasi` menampilkan seluruh riwayat notifikasi.
- Status baca dilacak per user di tabel `notifikasi_status`.
- RLS: notifikasi spesifik per bagian hanya bisa dilihat oleh user di bagian tersebut.
- Di-publish ke **Supabase Realtime** agar notifikasi baru langsung muncul.

## 4.14 Pengaturan Sistem (Admin)
- Halaman pengaturan terpusat (`/pengaturan`) — **hanya admin** yang bisa mengakses.
- **Profil Organisasi**: nama, wilayah, alamat, kontak, media sosial, logo.
- **Operasional & Kebijakan**: periode aktif, format nomor surat, batas peminjaman inventaris, kebijakan nota/persetujuan, threshold notifikasi pengeluaran besar.
- **Akses & Keamanan**: mode pendaftaran, session timeout, toggle portal publik, transparansi kas, mode maintenance.
- **Statistik database** dan **log audit terbaru** ditampilkan di halaman pengaturan.

## 4.15 Aspirasi Warga (Publik → Internal)
- Warga bisa mengirim aspirasi/saran dari halaman publik (kontak).
- Aspirasi masuk ke halaman internal `/aspirasi` yang bisa dilihat oleh admin/ketua.
- Data aspirasi menggunakan tabel `diskusi` dengan Supabase Realtime.

## 4.16 Desain / UX
- **PWA (Progressive Web App)**: aplikasi bisa di-install di perangkat mobile.
- Responsive di semua device (desktop, tablet, HP) — prioritas mobile-first.
- Navigasi: **bottom-nav** di mobile, **sidebar** di desktop, **mobile nav** (hamburger menu).
- **Header** dengan avatar user, notifikasi bell, pencarian global, dan tema toggle.
- **Pencarian global**: dialog pencarian lintas modul.
- **Color theme switcher**: mendukung dark mode dan pilihan tema warna.
- **Dashboard per role**: tampilan dashboard berbeda untuk `admin`, `ketua`, dan `anggota`.
- Bahasa & istilah sehari-hari.
- Komponen konsisten pakai Shadcn.
- **Animasi & visual**: Three.js/R3F untuk elemen interaktif, GSAP untuk animasi halus.
