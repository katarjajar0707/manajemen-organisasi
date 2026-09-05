-- 001_initial_schema.sql
-- Inisialisasi skema dasar Sistem Kelola & Catatan Organisasi Karang Taruna

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'ketua', 'anggota');
CREATE TYPE jenis_keuangan AS ENUM ('masuk', 'keluar');
CREATE TYPE target_pengumuman AS ENUM ('semua', 'bagian_tertentu');
CREATE TYPE tipe_diskusi AS ENUM ('diskusi', 'catatan_umum');
CREATE TYPE kondisi_inventaris AS ENUM ('baik', 'rusak_ringan', 'rusak_berat');
CREATE TYPE status_peminjaman AS ENUM ('dipinjam', 'dikembalikan');
CREATE TYPE jenis_surat AS ENUM ('keluar', 'masuk', 'proposal', 'undangan');
CREATE TYPE kategori_arsip AS ENUM ('sk', 'proposal', 'lpj', 'lainnya');

-- 3.1 bagian
CREATE TABLE IF NOT EXISTS public.bagian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    deskripsi TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.4 profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    foto_url TEXT,
    bio TEXT,
    bagian_id UUID REFERENCES public.bagian(id) ON DELETE SET NULL,
    role user_role DEFAULT 'anggota' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.2 catatan
CREATE TABLE IF NOT EXISTS public.catatan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bagian_id UUID NOT NULL REFERENCES public.bagian(id) ON DELETE CASCADE,
    judul TEXT NOT NULL,
    isi TEXT NOT NULL,
    tanggal DATE DEFAULT CURRENT_DATE NOT NULL,
    lampiran_url TEXT,
    dibuat_oleh UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 3.3 catatan_keuangan
CREATE TABLE IF NOT EXISTS public.catatan_keuangan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bagian_id UUID NOT NULL REFERENCES public.bagian(id) ON DELETE CASCADE,
    jenis jenis_keuangan NOT NULL,
    judul TEXT NOT NULL,
    keterangan TEXT,
    jumlah NUMERIC(15, 2) NOT NULL,
    tanggal DATE DEFAULT CURRENT_DATE NOT NULL,
    lampiran_url TEXT,
    dibuat_oleh UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 3.6 agenda_organisasi
CREATE TABLE IF NOT EXISTS public.agenda_organisasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bagian_id UUID NOT NULL REFERENCES public.bagian(id) ON DELETE CASCADE,
    nama_agenda TEXT NOT NULL,
    deskripsi TEXT,
    dibuat_oleh UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.7 periode_kepengurusan
CREATE TABLE IF NOT EXISTS public.periode_kepengurusan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agenda_organisasi_id UUID NOT NULL REFERENCES public.agenda_organisasi(id) ON DELETE CASCADE,
    nama_periode TEXT NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE,
    is_aktif BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.5 anggota
CREATE TABLE IF NOT EXISTS public.anggota (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    kontak TEXT NOT NULL,
    rt_rw TEXT NOT NULL,
    jabatan TEXT NOT NULL,
    periode_id UUID NOT NULL REFERENCES public.periode_kepengurusan(id) ON DELETE CASCADE,
    foto_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.8 kalender_kegiatan
CREATE TABLE IF NOT EXISTS public.kalender_kegiatan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul TEXT NOT NULL,
    deskripsi TEXT NOT NULL,
    tanggal_mulai TIMESTAMPTZ NOT NULL,
    tanggal_selesai TIMESTAMPTZ,
    lokasi TEXT,
    bagian_id UUID REFERENCES public.bagian(id) ON DELETE SET NULL,
    dibuat_oleh UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.9 dokumentasi_kegiatan
CREATE TABLE IF NOT EXISTS public.dokumentasi_kegiatan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kalender_id UUID NOT NULL REFERENCES public.kalender_kegiatan(id) ON DELETE CASCADE,
    foto_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.10 pengumuman
CREATE TABLE IF NOT EXISTS public.pengumuman (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul TEXT NOT NULL,
    isi TEXT NOT NULL,
    target target_pengumuman DEFAULT 'semua' NOT NULL,
    bagian_id UUID REFERENCES public.bagian(id) ON DELETE SET NULL,
    dibuat_oleh UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.11 diskusi
CREATE TABLE IF NOT EXISTS public.diskusi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipe tipe_diskusi DEFAULT 'diskusi' NOT NULL,
    judul TEXT NOT NULL,
    isi TEXT,
    bagian_pembuat_id UUID NOT NULL REFERENCES public.bagian(id) ON DELETE CASCADE,
    dibuat_oleh UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.12 diskusi_balasan
CREATE TABLE IF NOT EXISTS public.diskusi_balasan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diskusi_id UUID NOT NULL REFERENCES public.diskusi(id) ON DELETE CASCADE,
    isi TEXT NOT NULL,
    dibuat_oleh UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.13 diskusi_mention
CREATE TABLE IF NOT EXISTS public.diskusi_mention (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diskusi_id UUID NOT NULL REFERENCES public.diskusi(id) ON DELETE CASCADE,
    bagian_ditag_id UUID NOT NULL REFERENCES public.bagian(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.14 inventaris
CREATE TABLE IF NOT EXISTS public.inventaris (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_barang TEXT NOT NULL,
    jumlah INTEGER DEFAULT 1 NOT NULL,
    kondisi kondisi_inventaris DEFAULT 'baik' NOT NULL,
    foto_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.15 peminjaman_inventaris
CREATE TABLE IF NOT EXISTS public.peminjaman_inventaris (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventaris_id UUID NOT NULL REFERENCES public.inventaris(id) ON DELETE CASCADE,
    peminjam TEXT NOT NULL,
    tanggal_pinjam DATE DEFAULT CURRENT_DATE NOT NULL,
    tanggal_kembali_rencana DATE NOT NULL,
    tanggal_kembali_aktual DATE,
    status status_peminjaman DEFAULT 'dipinjam' NOT NULL,
    dibuat_oleh UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT
);

-- 3.16 template_surat
CREATE TABLE IF NOT EXISTS public.template_surat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_template TEXT NOT NULL,
    jenis jenis_surat NOT NULL,
    isi_template TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.17 arsip_dokumen
CREATE TABLE IF NOT EXISTS public.arsip_dokumen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul TEXT NOT NULL,
    kategori kategori_arsip NOT NULL,
    file_url TEXT NOT NULL,
    agenda_organisasi_id UUID REFERENCES public.agenda_organisasi(id) ON DELETE SET NULL,
    dibuat_oleh UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
