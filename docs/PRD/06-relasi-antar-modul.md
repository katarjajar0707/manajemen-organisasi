# 06 — Relasi Antar Modul

## Semua Relasi Terhubung

Ketika admin dan ketua membuat agenda organisasi maka otomatis terhubung ke inventaris, struktur organisasi, catatan, keuangan, kegiatan, komunikasi (diskusi/catatan umum/mention), surat, dan arsip. Dan juga otomatis terhubung ke inventaris, struktur organisasi, catatan, keuangan, kegiatan, komunikasi (diskusi/catatan umum/mention), surat, dan arsip.

Ketika admin menambahkan departemen atau jabatan maka otomatis terhubung ke inventaris, struktur organisasi, catatan, keuangan, kegiatan, komunikasi (diskusi/catatan umum/mention), surat, dan arsip. Dan juga otomatis terhubung halaman manajemen akses.

Setiap perubahan data pada 11 tabel utama otomatis membuat notifikasi via trigger `buat_notifikasi_sistem`.

### Diagram Relasi Utama

```
bagian ──┬── catatan (privat per bagian)
         ├── catatan_keuangan (Bendahara)
         ├── agenda_organisasi ── periode_kepengurusan ── anggota
         ├── kalender_kegiatan ──┬── dokumentasi_kegiatan
         │                      └── catatan_keuangan (via kegiatan_id / RAB)
         ├── pengumuman (target bagian_tertentu)
         ├── diskusi ──┬── diskusi_balasan
         │             └── diskusi_mention
         ├── inventaris ── peminjaman_inventaris
         ├── template_surat
         └── arsip_dokumen

profiles ── login_history
         ── notifikasi ── notifikasi_status
         ── anggota (sync avatar via trigger)

pengaturan_sistem (singleton)
```
