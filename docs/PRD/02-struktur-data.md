# 02 — Struktur Data (Entitas Utama)

## 3.1 `bagian` (departments)
Menyimpan daftar bagian organisasi — bisa CRUD (tambah/edit/hapus bagian baru selain default).

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| nama | text | contoh: "Bendahara", "Sekretaris", "Ketua", "Hubungan Masyarakat", "Acara", "Kominfo" |
| slug | text | untuk routing, auto-generate |
| deskripsi | text | opsional |
| created_at | timestamptz | |

## 3.2 `catatan` (generic notes — dipakai Sekretaris, Ketua, bagian umum)
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

## 3.3 `catatan_keuangan` (khusus Bendahara)
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
| kegiatan_id | uuid nullable | FK ke `kalender_kegiatan` — relasi opsional ke kegiatan terkait (untuk pelacakan RAB) |
| dibuat_oleh | uuid | FK ke `profiles` |
| created_at | timestamptz | |
| deleted_at | timestamptz nullable | soft delete |

## 3.4 `profiles`
Terhubung ke Supabase Auth. Ini juga jadi sumber data untuk halaman profil dinamis.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK, sama dengan auth.users.id |
| nama | text | nama lengkap |
| username | text unik | bisa diedit user sendiri di halaman profil |
| foto_url | text nullable | foto profil, upload ke Supabase Storage |
| bio | text nullable | deskripsi singkat, bisa diedit user sendiri |
| nomor_wa | text nullable | nomor WhatsApp, bisa diedit user sendiri |
| bagian_id | uuid nullable | bagian tempat user bertugas (null untuk admin murni) |
| role | enum | `admin` \| `ketua` \| `anggota` — **tidak bisa diubah oleh user sendiri**, hanya admin |
| last_seen_at | timestamptz nullable | waktu terakhir user aktif (diperbarui otomatis oleh presence tracker) |
| created_at | timestamptz | |

**Aturan role:**
- `admin` & `ketua`: bisa lihat + CRUD data **semua** bagian.
- `anggota`: hanya bisa CRUD data di `bagian_id` miliknya sendiri, tidak bisa melihat bagian lain sama sekali.
- Manajemen user (buat akun, ubah role, assign bagian) **hanya bisa dilakukan admin**.
- Setiap user (semua role) bisa edit profilnya sendiri: `username`, `foto_url`, `bio`, `nomor_wa` — kolom `role` di luar jangkauan edit user.

## 3.5 `anggota` (data keanggotaan organisasi)
Berbeda dari `profiles` (akun login) — ini data warga/anggota karang taruna, tidak semua anggota punya akun login. Foto profil di-sinkronkan dari `profiles` via trigger (`sync_profile_avatar_to_anggota`).

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| nama | text | |
| kontak | text | no. HP/WhatsApp |
| rt_rw | text | contoh: "RT 03/RW 05" |
| jabatan | text | contoh: "Anggota", "Kabid Acara" |
| periode_id | uuid | FK ke `periode_kepengurusan` |
| foto_url | text nullable | opsional, di-sync dari profiles jika ada |
| created_at | timestamptz | |

## 3.6 `agenda_organisasi` (struktur organisasi bisa punya banyak agenda)
Level baru di atas periode — satu bagian bisa punya banyak "agenda" (program/kepengurusan) yang berjalan atau berganti dari waktu ke waktu.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| bagian_id | uuid | FK ke `bagian` |
| nama_agenda | text | contoh: "Kepengurusan Utama", "Panitia HUT RI 2026" |
| deskripsi | text nullable | |
| dibuat_oleh | uuid | FK ke `profiles` — **hanya role `ketua`/`admin` yang boleh membuat agenda baru** |
| created_at | timestamptz | |

**Hierarki struktur organisasi:** `bagian` → `agenda_organisasi` → `periode_kepengurusan` → `anggota`.

## 3.7 `periode_kepengurusan` (periode di dalam satu agenda organisasi)
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

## 3.8 `kalender_kegiatan` (jadwal kegiatan)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| judul | text | |
| deskripsi | text | |
| tanggal_mulai | timestamptz | |
| tanggal_selesai | timestamptz nullable | |
| lokasi | text nullable | |
| bagian_id | uuid nullable | penanggung jawab acara (mis. bagian Acara) |
| target_rab | numeric(15,2) | target anggaran kegiatan (default 0), hanya bisa diisi/diubah oleh admin/ketua |
| dibuat_oleh | uuid | FK ke `profiles` |
| created_at | timestamptz | |

*Tidak ada fitur presensi kehadiran. RAB (Rencana Anggaran Biaya) dikaitkan via `catatan_keuangan.kegiatan_id`.*

## 3.9 `dokumentasi_kegiatan` (galeri foto per acara)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| kalender_id | uuid | FK ke `kalender_kegiatan` |
| foto_url | text | upload ke Supabase Storage |
| caption | text nullable | |
| created_at | timestamptz | |

## 3.10 `pengumuman` (broadcast internal)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| judul | text | |
| isi | text | |
| target | enum | `semua` \| `bagian_tertentu` |
| bagian_id | uuid nullable | jika target `bagian_tertentu` |
| dibuat_oleh | uuid | FK ke `profiles` |
| created_at | timestamptz | |

## 3.11 `diskusi` (papan diskusi — juga menaungi "catatan umum" lintas departemen)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| tipe | enum | `diskusi` \| `catatan_umum` |
| judul | text | topik diskusi / judul catatan umum |
| isi | text nullable | isi catatan umum (jika tipe `catatan_umum`) |
| bagian_pembuat_id | uuid | FK ke `bagian` — bagian penulis |
| dibuat_oleh | uuid | FK ke `profiles` |
| created_at | timestamptz | |

**Visibilitas:** seluruh entri `diskusi` (baik `diskusi` maupun `catatan_umum`) bisa dilihat **semua role & semua bagian**. Tabel ini di-publish ke **Supabase Realtime**.

## 3.12 `diskusi_balasan` (komentar/balasan dalam diskusi)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| diskusi_id | uuid | FK ke `diskusi` |
| isi | text | |
| dibuat_oleh | uuid | FK ke `profiles` |
| created_at | timestamptz | |

## 3.13 `diskusi_mention` (tag @departemen pada catatan umum/diskusi)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| diskusi_id | uuid | FK ke `diskusi` |
| bagian_ditag_id | uuid | FK ke `bagian` — departemen yang di-mention via "@" |
| created_at | timestamptz | |

## 3.14 `inventaris` (aset organisasi)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| nama_barang | text | contoh: "Sound System", "Tenda" |
| jumlah | integer | |
| kondisi | enum | `baik` \| `rusak_ringan` \| `rusak_berat` |
| foto_url | text nullable | |
| created_at | timestamptz | |

## 3.15 `peminjaman_inventaris` (status pinjam-pakai)
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

## 3.16 `template_surat`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| nama_template | text | contoh: "Surat Undangan", "Proposal Kegiatan" |
| jenis | enum | `keluar` \| `masuk` \| `proposal` \| `undangan` |
| isi_template | text | placeholder konten (bisa diisi ulang saat pakai) |
| created_at | timestamptz | |

## 3.17 `arsip_dokumen`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| judul | text | contoh: "SK Kepengurusan 2025", "LPJ Kegiatan HUT RI" |
| kategori | enum | `sk` \| `proposal` \| `lpj` \| `lainnya` |
| file_url | text | upload ke Supabase Storage |
| agenda_organisasi_id | uuid nullable | FK ke `agenda_organisasi`, jika relevan |
| dibuat_oleh | uuid | FK ke `profiles` |
| created_at | timestamptz | |

## 3.18 `pengaturan_sistem` (konfigurasi organisasi terpusat — singleton row)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | text | PK, default `'default'` (singleton) |
| — *Profil Organisasi* | | |
| nama | text | nama organisasi |
| unit_wilayah | text | sub-unit RT/RW |
| kelurahan | text | |
| kecamatan | text | |
| kota | text | |
| slogan | text | |
| alamat | text | alamat sekretariat |
| email | text | email resmi |
| telepon | text | no. telepon |
| instagram | text | handle Instagram |
| tiktok | text | handle TikTok |
| logo_url | text nullable | logo organisasi |
| — *Operasional & Kebijakan* | | |
| periode_aktif | text | contoh: "2025 - 2027" |
| tgl_mulai_periode | date | |
| tgl_selesai_periode | date | |
| format_nomor_surat | text | template nomor surat |
| max_hari_pinjam_inventaris | integer | batas hari peminjaman |
| wajib_persetujuan_ketua | boolean | |
| max_pengeluaran_tanpa_nota | numeric | |
| notif_pengeluaran_besar | boolean | |
| batas_notif_pengeluaran | numeric | |
| — *Akses & Keamanan* | | |
| mode_pendaftaran | text | `invite_only` dsb. |
| session_timeout_minutes | text | |
| portal_publik_aktif | boolean | toggle halaman publik |
| transparansi_kas_publik | boolean | toggle transparansi kas |
| mode_maintenance | boolean | mode pemeliharaan |
| wajib_dua_faktor_admin | boolean | |
| izinkan_anggota_buat_pengumuman | boolean | |
| updated_at | timestamptz | |

**Akses:** Semua orang (termasuk anonim) bisa **membaca** pengaturan; hanya `admin`/`ketua` yang bisa **mengubah**.

## 3.19 `notifikasi` (pusat notifikasi otomatis)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| tipe | text | `keuangan` \| `kegiatan` \| `inventaris` \| `peminjaman` \| `pengumuman` \| `diskusi` \| `arsip` \| `agenda` \| `anggota` \| `catatan` \| `surat` |
| judul | text | judul notifikasi |
| pesan | text nullable | detail notifikasi |
| href | text | link ke halaman terkait |
| sumber | text | nama tabel sumber (TG_TABLE_NAME) |
| sumber_id | uuid nullable | ID record sumber |
| bagian_id | uuid nullable | FK ke `bagian` |
| dibuat_oleh | uuid nullable | FK ke `profiles` |
| created_at | timestamptz | |

Notifikasi dibuat **otomatis via trigger** (`buat_notifikasi_sistem`) setiap INSERT pada 11 tabel: `catatan_keuangan`, `kalender_kegiatan`, `inventaris`, `peminjaman_inventaris`, `pengumuman`, `diskusi`, `arsip_dokumen`, `agenda_organisasi`, `anggota`, `catatan`, `template_surat`.

## 3.20 `notifikasi_status` (status baca per user)
| Kolom | Tipe | Keterangan |
|---|---|---|
| notifikasi_id | uuid | FK ke `notifikasi`, PK bersama |
| user_id | uuid | FK ke `profiles`, PK bersama |
| dibaca_at | timestamptz | waktu dibaca |

## 3.21 `login_history` (audit login)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK ke `profiles` |
| logged_in_at | timestamptz | waktu login |
| logged_out_at | timestamptz nullable | waktu logout |
| auth_method | text | `password` |

Ditampilkan di dashboard admin sebagai panel riwayat login. Di-publish ke Supabase Realtime.
