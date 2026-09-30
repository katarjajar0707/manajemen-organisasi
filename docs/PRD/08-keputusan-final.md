# 08 — Keputusan Final

## 8. Keputusan (Final)

- Tanpa approval untuk catatan keuangan — langsung tersimpan.
- Tanpa laporan bulanan otomatis.
- 1 user hanya terikat ke 1 bagian, kecuali role ketua/admin yang punya akses lintas bagian.
- Manajemen user (akun, role, assign bagian) eksklusif untuk admin.
- Tanpa fitur presensi kehadiran pada kalender kegiatan.
- Dashboard transparansi hanya menampilkan data ringkasan, bukan detail transaksi, dan bisa diakses tanpa login.
- Papan diskusi & catatan umum bisa dilihat semua role/departemen (berbeda dari catatan biasa yang privat per bagian).
- Hanya role `ketua` & `admin` yang bisa membuat **agenda organisasi baru**; anggota biasa hanya bisa melihat.
- Role user **tidak bisa diubah sendiri** lewat halaman profil — perubahan role eksklusif lewat menu admin.
- Target RAB kegiatan hanya bisa diisi/diubah oleh admin/ketua — trigger database mencegah perubahan oleh role lain.
- Notifikasi dibuat otomatis via trigger, bukan manual — menjamin semua perubahan data tercatat.
- Portal publik dan transparansi kas bisa di-toggle on/off dari pengaturan sistem.
- Aplikasi di-deploy sebagai PWA untuk pengalaman mobile yang lebih baik.
- Supabase Realtime digunakan untuk update langsung pada dashboard (diskusi, keuangan, notifikasi, login history).
