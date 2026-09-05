-- 010_phase11_pengaturan_sistem.sql
-- Migration untuk tabel pengaturan_sistem organisasi Karang Taruna
-- Menyimpan Profil Organisasi, Operasional, Kebijakan, dan Hak Akses

CREATE TABLE IF NOT EXISTS public.pengaturan_sistem (
    id TEXT PRIMARY KEY DEFAULT 'default',
    
    -- 1. Profil Organisasi
    nama TEXT NOT NULL DEFAULT 'Karang Taruna Tunas Harapan',
    unit_wilayah TEXT DEFAULT 'Sub-Unit RT 04 / RW 03',
    kelurahan TEXT DEFAULT 'Kelurahan Sukamaju',
    kecamatan TEXT DEFAULT 'Kecamatan Pancoran',
    kota TEXT DEFAULT 'Jakarta Selatan',
    slogan TEXT DEFAULT 'Pemuda Bersatu, Lingkungan Tangguh dan Berbudaya',
    alamat TEXT DEFAULT 'Balai Warga RW 03, Jl. Flamboyan No. 12',
    email TEXT DEFAULT 'sekretariat.kt03@gmail.com',
    telepon TEXT DEFAULT '+62 812-3456-7890',
    instagram TEXT DEFAULT '@karangtaruna_rw03',
    logo_url TEXT,

    -- 2. Operasional & Kebijakan
    periode_aktif TEXT DEFAULT '2025 - 2027',
    tgl_mulai_periode DATE DEFAULT '2025-01-01',
    tgl_selesai_periode DATE DEFAULT '2027-12-31',
    format_nomor_surat TEXT DEFAULT '{NOMOR}/KT-03/{BULAN}/{TAHUN}',
    max_hari_pinjam_inventaris INTEGER DEFAULT 3,
    wajib_persetujuan_ketua BOOLEAN DEFAULT true,
    max_pengeluaran_tanpa_nota NUMERIC DEFAULT 50000,
    notif_pengeluaran_besar BOOLEAN DEFAULT true,
    batas_notif_pengeluaran NUMERIC DEFAULT 1000000,

    -- 3. Akses & Keamanan
    mode_pendaftaran TEXT DEFAULT 'invite_only',
    session_timeout_minutes TEXT DEFAULT '60',
    portal_publik_aktif BOOLEAN DEFAULT true,
    transparansi_kas_publik BOOLEAN DEFAULT true,
    mode_maintenance BOOLEAN DEFAULT false,
    wajib_dua_faktor_admin BOOLEAN DEFAULT false,
    izinkan_anggota_buat_pengumuman BOOLEAN DEFAULT false,

    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.pengaturan_sistem ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: Semua orang (authenticated dan anonim) bisa membaca pengaturan sistem
DROP POLICY IF EXISTS pengaturan_sistem_select_policy ON public.pengaturan_sistem;
CREATE POLICY pengaturan_sistem_select_policy
    ON public.pengaturan_sistem
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- Policy WRITE: Khusus authenticated (Admin & Ketua)
DROP POLICY IF EXISTS pengaturan_sistem_write_policy ON public.pengaturan_sistem;
CREATE POLICY pengaturan_sistem_write_policy
    ON public.pengaturan_sistem
    FOR ALL
    TO authenticated
    USING (
        public.current_user_role() IN ('admin', 'ketua')
    )
    WITH CHECK (
        public.current_user_role() IN ('admin', 'ketua')
    );

-- Insert baris konfigurasi default bila belum ada
INSERT INTO public.pengaturan_sistem (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;
