# PRD: Sistem Kelola & Catatan Organisasi

## 1. Ringkasan
Aplikasi web untuk mengelola seluruh aktivitas organisasi karang taruna: catatan per bagian, keuangan, data anggota, struktur organisasi multi-agenda, kegiatan, komunikasi internal, inventaris, surat-menyurat, hingga dashboard transparansi publik.

**Target pengguna:** Organisasi masyarakat (karang taruna) — UI harus sederhana, jelas, mudah dipakai warga dari berbagai usia.

**Tech stack:** Next.js (App Router), Supabase (DB + Auth + Storage), Shadcn/ui, Tailwind.

---

## 2. Tujuan
- Satu tempat mencatat semua kegiatan organisasi per bagian.
- Setiap bagian bisa CRUD catatannya sendiri tanpa saling tabrak data.
- Struktur "bagian" fleksibel — bisa tambah bagian baru kapan saja (tidak hardcode).
- Bendahara punya modul khusus pencatatan keuangan (masuk/keluar + bukti nota).
- Ketua dan Admin punya visibilitas penuh ke semua bagian; bagian lain terisolasi datanya.
- Data anggota, kegiatan, aset, dan surat-menyurat organisasi terkelola rapi dalam satu sistem.
- Struktur organisasi mendukung **banyak agenda** (bukan hanya satu struktur tetap) yang bisa berganti seiring waktu.
- Kondisi kas & aktivitas organisasi bisa diakses publik/warga sebagai bentuk transparansi.

---

## 3. Struktur Data (Entitas Utama)

### 3.1 `bagian` (departments)
Menyimpan daftar bagian organisasi — bisa CRUD (tambah/edit/hapus bagian baru selain default).

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| nama | text | contoh: "Bendahara", "Sekretaris", "Ketua", "Hubungan Masyarakat", "Acara", "Kominfo" |
| slug | text | untuk routing, auto-generate |
| deskripsi | text | opsional |
| created_at | timestamptz | |

### 3.2 `catatan` (generic notes — dipakai Sekretaris, Ketua, bagian umum)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| bagian_id | uuid | FK ke `bagian` |
| judul | text | |
| isi | text | rich text / textarea |
| tanggal | date | **otomatis** terisi `now()` saat data dibuat — tidak ada input/label tanggal di form |
| lampiran_url | text nullable | opsional — gambar, PDF, atau file lain, upload ke Supabase Storage |
| dibuat_oleh | uuid | FK ke `profiles` |
| created_at | timestamptz | |
| deleted_at | timestamptz nullable | soft delete |

### 3.3 `catatan_keuangan` (khusus Bendahara)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| bagian_id | uuid | FK ke `bagian` (Bendahara) |
| jenis | enum | `masuk` \| `keluar` |
| judul | text | contoh: "Donasi Bapak Ahmad", "Iuran Bulanan" |
| keterangan | text | detail tambahan |
| jumlah | numeric | nominal Rp |
| tanggal | date | **otomatis** terisi `now()` saat data dibuat — tidak ada input/label tanggal di form |
| lampiran_url | text nullable | bukti/nota — **wajib untuk jenis `keluar`**, opsional untuk `masuk` |
| dibuat_oleh | uuid | FK ke `profiles` |
| created_at | timestamptz | |
| deleted_at | timestamptz nullable | soft delete |

### 3.4 `profiles`
Terhubung ke Supabase Auth. Ini juga jadi sumber data untuk **halaman profil dinamis** (lihat 4.11).

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK, sama dengan auth.users.id |
| nama | text | nama lengkap |
| username | text unik | bisa diedit user sendiri di halaman profil |
| foto_url | text nullable | foto profil, upload ke Supabase Storage |
| bio | text nullable | deskripsi singkat, bisa diedit user sendiri |
| bagian_id | uuid nullable | bagian tempat user bertugas (null untuk admin murni) |
| role | enum | `admin` \| `ketua` \| `anggota` — **tidak bisa diubah oleh user sendiri**, hanya admin |
| created_at | timestamptz | |

**Aturan role:**
- `admin` & `ketua`: bisa lihat + CRUD data **semua** bagian.
- `anggota`: hanya bisa CRUD data di `bagian_id` miliknya sendiri, tidak bisa melihat bagian lain sama sekali.
- Manajemen user (buat akun, ubah role, assign bagian) **hanya bisa dilakukan admin**.
- Setiap user (semua role) bisa edit profilnya sendiri: `username`, `foto_url`, `bio` — kolom `role` di luar jangkauan edit user.

### 3.5 `anggota` (data keanggotaan organisasi)
Berbeda dari `profiles` (akun login) — ini data warga/anggota karang taruna, tidak semua anggota punya akun login.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| nama | text | |
| kontak | text | no. HP/WhatsApp |
| rt_rw | text | contoh: "RT 03/RW 05" |
| jabatan | text | contoh: "Anggota", "Kabid Acara" |
| periode_id | uuid | FK ke `periode_kepengurusan` |
| foto_url | text nullable | opsional |
| created_at | timestamptz | |

### 3.6 `agenda_organisasi` (struktur organisasi bisa punya banyak agenda)
Level baru di atas periode — satu bagian bisa punya banyak "agenda" (program/kepengurusan) yang berjalan atau berganti dari waktu ke waktu, bukan hanya satu struktur tetap.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| bagian_id | uuid | FK ke `bagian` |
| nama_agenda | text | contoh: "Kepengurusan Utama", "Panitia HUT RI 2026" |
| deskripsi | text nullable | |
| dibuat_oleh | uuid | FK ke `profiles` — **hanya role `ketua`/`admin` yang boleh membuat agenda baru** |
| created_at | timestamptz | |

**Hierarki struktur organisasi:** `bagian` → `agenda_organisasi` → `periode_kepengurusan` → `anggota`.

### 3.7 `periode_kepengurusan` (periode di dalam satu agenda organisasi)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| agenda_organisasi_id | uuid | FK ke `agenda_organisasi` |
| nama_periode | text | contoh: "Periode 2025–2027" |
| tanggal_mulai | date | |
| tanggal_selesai | date nullable | |
| is_aktif | boolean | hanya 1 periode aktif per agenda |
| created_at | timestamptz | |

Bagan kepengurusan ditampilkan dari data `anggota` yang terhubung ke `periode_id` aktif dalam agenda tertentu, dikelompokkan per `jabatan`.

### 3.8 `kalender_kegiatan` (jadwal kegiatan — berbeda dari "Nama Agenda" struktur organisasi di 3.6)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| judul | text | |
| deskripsi | text | |
| tanggal_mulai | timestamptz | |
| tanggal_selesai | timestamptz nullable | |
| lokasi | text nullable | |
| bagian_id | uuid nullable | penanggung jawab acara (mis. bagian Acara) |
| dibuat_oleh | uuid | FK ke `profiles` |
| created_at | timestamptz | |

*Catatan: tidak ada fitur presensi kehadiran — kalender kegiatan murni informasi jadwal.*

### 3.9 `dokumentasi_kegiatan` (galeri foto per acara)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| kalender_id | uuid | FK ke `kalender_kegiatan` |
| foto_url | text | upload ke Supabase Storage |
| caption | text nullable | |
| created_at | timestamptz | |

### 3.10 `pengumuman` (broadcast internal)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| judul | text | |
| isi | text | |
| target | enum | `semua` \| `bagian_tertentu` |
| bagian_id | uuid nullable | jika target `bagian_tertentu` |
| dibuat_oleh | uuid | FK ke `profiles` |
| created_at | timestamptz | |

### 3.11 `diskusi` (papan diskusi — juga menaungi "catatan umum" lintas departemen)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| tipe | enum | `diskusi` \| `catatan_umum` |
| judul | text | topik diskusi / judul catatan umum |
| isi | text nullable | isi catatan umum (jika tipe `catatan_umum`) |
| bagian_pembuat_id | uuid | FK ke `bagian` — bagian penulis |
| dibuat_oleh | uuid | FK ke `profiles` |
| created_at | timestamptz | |

**Visibilitas:** seluruh entri `diskusi` (baik `diskusi` maupun `catatan_umum`) bisa dilihat **semua role & semua bagian** — beda dari `catatan` biasa (3.2) yang privat per bagian.

### 3.12 `diskusi_balasan` (komentar/balasan dalam diskusi)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| diskusi_id | uuid | FK ke `diskusi` |
| isi | text | |
| dibuat_oleh | uuid | FK ke `profiles` |
| created_at | timestamptz | |

### 3.13 `diskusi_mention` (tag @departemen pada catatan umum/diskusi)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| diskusi_id | uuid | FK ke `diskusi` |
| bagian_ditag_id | uuid | FK ke `bagian` — departemen yang di-mention via "@" |
| created_at | timestamptz | |

### 3.14 `inventaris` (aset organisasi)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| nama_barang | text | contoh: "Sound System", "Tenda" |
| jumlah | integer | |
| kondisi | enum | `baik` \| `rusak_ringan` \| `rusak_berat` |
| foto_url | text nullable | |
| created_at | timestamptz | |

### 3.15 `peminjaman_inventaris` (status pinjam-pakai)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| inventaris_id | uuid | FK ke `inventaris` |
| peminjam | text | nama peminjam |
| tanggal_pinjam | date | otomatis saat input |
| tanggal_kembali_rencana | date | |
| tanggal_kembali_aktual | date nullable | diisi saat barang dikembalikan |
| status | enum | `dipinjam` \| `dikembalikan` |
| dibuat_oleh | uuid | FK ke `profiles` |

### 3.16 `template_surat`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| nama_template | text | contoh: "Surat Undangan", "Proposal Kegiatan" |
| jenis | enum | `keluar` \| `masuk` \| `proposal` \| `undangan` |
| isi_template | text | placeholder konten (bisa diisi ulang saat pakai) |
| created_at | timestamptz | |

### 3.17 `arsip_dokumen`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| judul | text | contoh: "SK Kepengurusan 2025", "LPJ Kegiatan HUT RI" |
| kategori | enum | `sk` \| `proposal` \| `lpj` \| `lainnya` |
| file_url | text | upload ke Supabase Storage |
| agenda_organisasi_id | uuid nullable | FK ke `agenda_organisasi`, jika relevan |
| dibuat_oleh | uuid | FK ke `profiles` |
| created_at | timestamptz | |

---

## 4. Fitur & User Stories

### 4.1 Manajemen Bagian (Admin/Ketua)
- Sebagai admin, saya bisa **tambah, edit, hapus** bagian organisasi.
- Setiap bagian otomatis punya halaman catatan sendiri.

### 4.2 Catatan Umum per Bagian (Sekretaris, Ketua, Humas, Acara, Kominfo, bagian lain)
- CRUD catatan: judul, isi. Tanggal **otomatis** terisi sesuai hari input — tidak ada field/label tanggal di form.
- Lampiran opsional: gambar, PDF, atau file lain, upload ke Supabase Storage.
- List catatan dengan pencarian & filter tanggal.
- Tampilan kartu sederhana (mobile-friendly), bukan tabel padat.
- *Catatan ini bersifat privat per bagian — beda dari "Catatan Umum lintas departemen" di 4.7 yang tampil di papan diskusi.*

### 4.3 Catatan Keuangan (Bendahara)
- Tambah **uang masuk**: judul, keterangan, jumlah, lampiran opsional. Tanggal otomatis (tanpa field tanggal).
- Tambah **uang keluar**: judul (alasan), keterangan, jumlah, **lampiran wajib** (upload ke Supabase Storage). Tanggal otomatis.
- Ringkasan saldo: total masuk, total keluar, saldo akhir — ditampilkan di atas (card summary), agar cepat dibaca.
- Riwayat transaksi dalam bentuk list/kartu, bisa difilter per bulan & jenis (masuk/keluar).

#### 4.3.1 Preview Lampiran (berlaku untuk catatan & pengeluaran)
- Lampiran ditampilkan sebagai **thumbnail kecil** di kartu catatan/transaksi.
- Klik thumbnail → buka **modal preview diperbesar**.
- Modal punya tombol **✕ (tutup)** dan tombol **download**.
- Untuk file non-gambar (PDF, dll), thumbnail berupa ikon tipe file; modal preview PDF atau tombol download langsung jika tipe file tidak bisa di-preview di browser.

### 4.4 Manajemen Anggota
- CRUD data anggota: nama, kontak, RT/RW, jabatan, foto (opsional).
- Anggota terhubung ke periode aktif dalam sebuah agenda organisasi (lihat 4.5).

### 4.5 Struktur Organisasi Multi-Agenda
- **Kelola Agenda Organisasi**: Ketua/Admin bisa membuat **agenda baru** per bagian (mis. "Kepengurusan Utama", "Panitia HUT RI 2026") — anggota biasa tidak bisa membuat agenda baru, hanya melihat.
- Setiap agenda punya **periode kepengurusan sendiri** — bisa lebih dari satu periode berjalan bergantian, tiap agenda punya satu periode aktif.
- **Bagan struktur organisasi**: menampilkan anggota per periode aktif dalam agenda tertentu, dikelompokkan per jabatan, dalam bentuk kartu/pohon jabatan sederhana.
- Struktur historis (agenda & periode lama) tetap tersimpan dan bisa dilihat kembali — mendukung organisasi yang strukturnya berubah-ubah dari waktu ke waktu.
- **Detail struktur keseluruhan** (semua bagian, semua agenda aktif) bisa dilihat oleh **semua role & semua departemen** — tidak dibatasi RLS per bagian seperti catatan biasa.

### 4.6 Kegiatan & Acara
- **Kalender/jadwal kegiatan**: CRUD jadwal (judul, deskripsi, tanggal mulai–selesai, lokasi, bagian penanggung jawab). Tampilan kalender bulanan + list agenda mendatang.
- *Tidak ada fitur presensi kehadiran* — cukup jadwal & info kegiatan.
- **Dokumentasi kegiatan**: galeri foto per acara, upload banyak foto sekaligus + caption. Preview foto pakai komponen modal yang sama seperti 4.3.1.

### 4.7 Komunikasi & Informasi (Papan Diskusi + Catatan Umum)
- **Papan diskusi**: satu halaman, bisa dilihat **semua role & semua departemen**.
- Di papan diskusi ini juga tersedia menu **"Catatan Umum"** — semua departemen bisa menulis catatan yang ingin dibagikan lintas bagian (bukan cuma diskusi tanya-jawab).
- **Tag @departemen**: saat menulis diskusi/catatan umum, user bisa ketik `@` lalu pilih nama bagian (mis. `@Bendahara`, `@Acara`) untuk **mention** bagian tersebut terkait catatan yang dibuat. Bagian yang di-mention muncul sebagai badge/notifikasi di papan diskusi mereka.
- Anggota bisa balas/berkomentar di setiap topik diskusi maupun catatan umum.
- **Pengumuman/broadcast**: admin/ketua/bagian tertentu bisa buat pengumuman untuk semua anggota atau bagian tertentu saja. Tampil di dashboard sebagai notifikasi/banner (terpisah dari papan diskusi — sifatnya satu arah, bukan diskusi dua arah).

### 4.8 Inventaris
- CRUD data barang/aset (nama, jumlah, kondisi, foto).
- **Pinjam-pakai**: catat siapa yang meminjam, tanggal pinjam (otomatis), rencana tanggal kembali, dan status (dipinjam/dikembalikan).
- List barang menampilkan status terkini (tersedia/sedang dipinjam) agar mudah dicek sebelum dipakai acara.

### 4.9 Surat & Administrasi
- **Template surat**: kelola template (surat keluar, surat masuk, proposal kegiatan, undangan) — admin/sekretaris bisa isi ulang template untuk surat baru.
- **Arsip dokumen**: upload & kelola dokumen penting (SK kepengurusan, proposal, LPJ), dikategorikan dan bisa dikaitkan ke agenda organisasi tertentu.
- Pencarian arsip berdasarkan judul/kategori.

### 4.10 Laporan & Transparansi
- **Dashboard publik** (bisa diakses tanpa login, read-only): ringkasan total kas, jumlah anggota aktif, dan kegiatan terakhir/mendatang.
- Data yang ditampilkan bersifat ringkasan saja (tidak menampilkan detail transaksi per item) demi menjaga privasi.

### 4.11 Halaman Profil Dinamis
- Setiap user (semua role) punya halaman profil sendiri, bisa diakses & diedit kapan saja.
- **Foto profil**: upload foto baru, ada **preview** sebelum disimpan.
- **Edit username** dan **bio** (deskripsi singkat).
- **Role tidak bisa diubah** dari halaman profil — hanya admin yang bisa mengubah role lewat menu manajemen user (4.12).
- Menampilkan ringkasan bagian/jabatan user saat ini (read-only di halaman profil).
- Ada tautan/bagian ke **"Struktur Organisasi Keseluruhan"** (lihat 4.5) — bisa dilihat semua departemen dari halaman profil maupun menu struktur.

### 4.12 Autentikasi & Akses
- Login via Supabase Auth (email/password).
- **Anggota bagian:** hanya bisa lihat & CRUD catatan di bagiannya sendiri (RLS policy per `bagian_id`). Bagian lain sama sekali tidak terlihat — kecuali data yang memang lintas bagian (papan diskusi, catatan umum, struktur organisasi keseluruhan, dashboard publik).
- **Ketua & Admin:** bisa memantau dan CRUD penuh ke **semua** bagian, serta satu-satunya role yang bisa membuat **agenda organisasi baru** (4.5).
- **Manajemen user** (buat/hapus akun, atur role, assign ke bagian) hanya menu admin, tidak muncul untuk role lain.
- Modul anggota, kegiatan, inventaris, surat, dan arsip mengikuti aturan akses yang sama: admin/ketua penuh, anggota terbatas sesuai relevansi bagiannya.

### 4.13 Desain / UX
- Responsive di semua device (desktop, tablet, HP), dibangun dengan Tailwind + Shadcn — tapi prioritas pengalaman utama tetap di mobile (mayoritas warga akses dari HP).
- Navigasi sederhana: bottom-nav di mobile, sidebar di desktop, berisi daftar bagian & modul sesuai akses user.
- Bahasa & istilah sehari-hari, mudah dipahami warga umum.
- Komponen konsisten pakai Shadcn (Card, Table, Dialog, Form, Badge untuk status masuk/keluar, kondisi barang, status pinjam, mention @departemen).

---

## 5. Non-Functional Requirements
- **Keamanan:** Row Level Security (RLS) Supabase — anggota dibatasi ke `bagian_id` sendiri untuk data privat (catatan, keuangan), tapi data lintas bagian (diskusi/catatan umum, struktur organisasi, dashboard publik) sengaja dibuka lewat policy terpisah. Dashboard publik (4.10) diakses via view/RPC khusus yang hanya expose data ringkasan, bukan tabel mentah.
- **Performa:** Pagination/infinite scroll untuk daftar catatan, agenda, diskusi, dan arsip yang panjang.
- **Backup:** Soft delete (bukan hard delete) agar data bisa dipulihkan.
- **Storage:** File (bukti nota, lampiran catatan, foto dokumentasi, foto profil, arsip dokumen) disimpan di Supabase Storage bucket privat, akses via signed URL — kecuali aset yang memang untuk ditampilkan di dashboard publik.

---

## 6. Alur Halaman (Sitemap)
```
/                        → Dashboard publik/transparansi (total kas, jumlah anggota, kegiatan terakhir) - tanpa login
/login
/dashboard               → Dashboard internal ringkas (sesuai akses: 1 bagian, atau semua bagian untuk ketua/admin)
/profil                  → Halaman profil dinamis (foto + preview, username, bio; role read-only)
/bagian                  → Kelola daftar bagian (admin)
/pengguna                → Manajemen user & role (admin only)
/bagian/[slug]           → Halaman catatan bagian (generic: sekretaris, ketua, humas, acara, kominfo, dll)
/bagian/bendahara        → Halaman khusus catatan keuangan
  ├── /masuk             → List & form uang masuk
  └── /keluar            → List & form uang keluar
/anggota                 → Data anggota + CRUD
/struktur                → Struktur organisasi keseluruhan (semua bagian & agenda, dilihat semua role)
/struktur/[bagian]/agenda → Kelola agenda organisasi per bagian (buat agenda baru: ketua/admin)
/struktur/[bagian]/agenda/[id] → Periode & bagan kepengurusan dalam agenda tersebut
/kegiatan                → Kalender & list kegiatan
/kegiatan/[id]/dokumentasi → Galeri foto acara tersebut
/pengumuman              → List & buat pengumuman
/diskusi                 → Papan diskusi + catatan umum (lintas departemen, mention @bagian)
/diskusi/[id]            → Thread diskusi/catatan umum + balasan
/inventaris              → Data barang + status pinjam-pakai
/surat                   → Template surat
/arsip                   → Arsip dokumen (SK, proposal, LPJ)
```

---

## Semua Relasi Terhubung
ketika admin dan ketua membuat agenda organisasi maka otomatis terhubung ke inventaris, struktur organisasi, catatan, keuangan, kegiatan, komunikasi (diskusi/catatan umum/mention), surat, dan arsip.Dan juga otomatis terhubung ke inventaris, struktur organisasi, catatan, keuangan, kegiatan, komunikasi (diskusi/catatan umum/mention), surat, dan arsip.

ketika admin menambahkan departement atau jabatan maka otomatis terhubung ke inventaris, struktur organisasi, catatan, keuangan, kegiatan, komunikasi (diskusi/catatan umum/mention), surat, dan arsip. dan juga otomatis terhubung halaman manajemen akses.



## 7. Fase Pengembangan (Roadmap)
1. **Fase 1 – Setup Proyek:** Init Next.js (App Router), install & konfigurasi Shadcn + Tailwind, buat project Supabase (belum diintegrasikan penuh), struktur folder, routing dasar sesuai sitemap (6).✅
2. **Fase 2 – UI Frontend (Data Dummy):** Bangun seluruh tampilan & komponen untuk semua modul terlebih dahulu memakai data dummy/mock — catatan, keuangan, profil, struktur organisasi multi-agenda, kegiatan, komunikasi (diskusi/catatan umum/mention), inventaris, surat, arsip, dan dashboard publik. Fokus di layout, komponen Shadcn, dan responsive (mobile-first) sebelum ada data asli. ✅
3. **Fase 3 – Backend Fondasi:** Integrasi Supabase Auth, skema DB inti (`bagian`, `profiles`), RLS dasar (anggota vs ketua/admin), menu manajemen user (admin).
4. **Fase 4 – Backend Catatan & Keuangan:** Sambungkan UI ke `catatan` (tanggal otomatis, lampiran opsional) dan `catatan_keuangan` (masuk/keluar, lampiran wajib untuk keluar), ringkasan saldo, komponen preview thumbnail + modal jadi fungsional.
5. **Fase 5 – Backend Profil:** Sambungkan halaman profil ke `profiles` — upload foto + preview, edit username & bio, role read-only.
6. **Fase 6 – Backend Struktur Organisasi Multi-Agenda:** CRUD `anggota`, `agenda_organisasi` (khusus ketua/admin), `periode_kepengurusan`, halaman struktur keseluruhan yang terbuka untuk semua role.
7. **Fase 7 – Backend Kegiatan:** `kalender_kegiatan`, `dokumentasi_kegiatan` (galeri foto memakai komponen preview yang sama).
8. **Fase 8 – Backend Komunikasi:** `pengumuman` (broadcast satu arah), `diskusi`/`catatan_umum` + `diskusi_balasan` + fitur mention `@bagian` (`diskusi_mention`).
9. **Fase 9 – Backend Inventaris & Administrasi:** `inventaris` + `peminjaman_inventaris`, `template_surat`, `arsip_dokumen`.
10. **Fase 10 – Backend Transparansi:** Sambungkan dashboard publik ke data ringkasan kas, anggota, dan kegiatan asli (menggantikan dummy).
11. **Fase 11 – Polish:** Filter/search lintas modul, review responsive di berbagai device dengan data asli, penghalusan UX mobile.
12. **Fase 12 – QA & Release:** Testing fungsional per role (admin/ketua/anggota), uji RLS (pastikan bagian & data privat tidak bocor, tapi data lintas bagian tetap terbuka sesuai desain), uji fitur mention & dashboard publik, bug fixing, deploy ke production.

---

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