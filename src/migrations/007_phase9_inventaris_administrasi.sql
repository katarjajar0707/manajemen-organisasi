-- 007_phase9_inventaris_administrasi.sql
-- Migration Fase 9: Backend Inventaris & Administrasi
-- Tabel: inventaris, peminjaman_inventaris, template_surat, arsip_dokumen

-- 1. Tambah Nilai Enum Tambahan jika Diperlukan
DO $$
BEGIN
    BEGIN
        ALTER TYPE kategori_arsip ADD VALUE IF NOT EXISTS 'notulensi';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER TYPE jenis_surat ADD VALUE IF NOT EXISTS 'keterangan';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END
$$;

-- 2. Penyesuaian Kolom Tabel Inventaris
ALTER TABLE public.inventaris
    ADD COLUMN IF NOT EXISTS kategori TEXT DEFAULT 'Lainnya' NOT NULL,
    ADD COLUMN IF NOT EXISTS satuan TEXT DEFAULT 'Unit' NOT NULL,
    ADD COLUMN IF NOT EXISTS lokasi TEXT DEFAULT 'Sekretariat',
    ADD COLUMN IF NOT EXISTS keterangan TEXT;

-- 3. Penyesuaian Kolom Tabel Peminjaman Inventaris
ALTER TABLE public.peminjaman_inventaris
    ADD COLUMN IF NOT EXISTS jumlah_pinjam INTEGER DEFAULT 1 NOT NULL,
    ADD COLUMN IF NOT EXISTS keterangan TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now() NOT NULL;

-- 4. Penyesuaian Kolom Tabel Template Surat
ALTER TABLE public.template_surat
    ADD COLUMN IF NOT EXISTS ringkasan TEXT,
    ADD COLUMN IF NOT EXISTS kode_format TEXT,
    ADD COLUMN IF NOT EXISTS dibuat_oleh UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now() NOT NULL;

-- 5. Penyesuaian Kolom Tabel Arsip Dokumen
ALTER TABLE public.arsip_dokumen
    ADD COLUMN IF NOT EXISTS nomor_surat TEXT,
    ADD COLUMN IF NOT EXISTS file_type TEXT,
    ADD COLUMN IF NOT EXISTS file_size TEXT,
    ADD COLUMN IF NOT EXISTS deskripsi TEXT;

-- 6. Aktifkan Row Level Security (RLS)
ALTER TABLE public.inventaris ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peminjaman_inventaris ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arsip_dokumen ENABLE ROW LEVEL SECURITY;

-- 7. Policies untuk INVENTARIS
DROP POLICY IF EXISTS inventaris_select_policy ON public.inventaris;
DROP POLICY IF EXISTS inventaris_insert_policy ON public.inventaris;
DROP POLICY IF EXISTS inventaris_update_policy ON public.inventaris;
DROP POLICY IF EXISTS inventaris_delete_policy ON public.inventaris;

-- Semua anggota terautentikasi dapat melihat inventaris
CREATE POLICY inventaris_select_policy
    ON public.inventaris
    FOR SELECT
    TO authenticated
    USING (true);

-- Semua user terautentikasi dapat menambah inventaris
CREATE POLICY inventaris_insert_policy
    ON public.inventaris
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- User terautentikasi dapat memperbarui inventaris
CREATE POLICY inventaris_update_policy
    ON public.inventaris
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Hanya Admin atau Ketua yang dapat menghapus data inventaris
CREATE POLICY inventaris_delete_policy
    ON public.inventaris
    FOR DELETE
    TO authenticated
    USING (public.is_admin_or_ketua());


-- 8. Policies untuk PEMINJAMAN INVENTARIS
DROP POLICY IF EXISTS peminjaman_select_policy ON public.peminjaman_inventaris;
DROP POLICY IF EXISTS peminjaman_insert_policy ON public.peminjaman_inventaris;
DROP POLICY IF EXISTS peminjaman_update_policy ON public.peminjaman_inventaris;
DROP POLICY IF EXISTS peminjaman_delete_policy ON public.peminjaman_inventaris;

-- Semua anggota dapat melihat riwayat peminjaman
CREATE POLICY peminjaman_select_policy
    ON public.peminjaman_inventaris
    FOR SELECT
    TO authenticated
    USING (true);

-- Anggota dapat mencatat peminjaman baru
CREATE POLICY peminjaman_insert_policy
    ON public.peminjaman_inventaris
    FOR INSERT
    TO authenticated
    WITH CHECK (dibuat_oleh = auth.uid() OR public.is_admin_or_ketua());

-- Anggota dapat mengubah status pengembalian
CREATE POLICY peminjaman_update_policy
    ON public.peminjaman_inventaris
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Admin, Ketua, atau pembuat data dapat menghapus catatan pinjam
CREATE POLICY peminjaman_delete_policy
    ON public.peminjaman_inventaris
    FOR DELETE
    TO authenticated
    USING (dibuat_oleh = auth.uid() OR public.is_admin_or_ketua());


-- 9. Policies untuk TEMPLATE SURAT
DROP POLICY IF EXISTS template_surat_select_policy ON public.template_surat;
DROP POLICY IF EXISTS template_surat_insert_policy ON public.template_surat;
DROP POLICY IF EXISTS template_surat_update_policy ON public.template_surat;
DROP POLICY IF EXISTS template_surat_delete_policy ON public.template_surat;

-- Semua user terautentikasi dapat melihat template surat
CREATE POLICY template_surat_select_policy
    ON public.template_surat
    FOR SELECT
    TO authenticated
    USING (true);

-- User terautentikasi dapat membuat template surat
CREATE POLICY template_surat_insert_policy
    ON public.template_surat
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- User terautentikasi dapat mengupdate template surat
CREATE POLICY template_surat_update_policy
    ON public.template_surat
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Admin atau Ketua yang dapat menghapus template
CREATE POLICY template_surat_delete_policy
    ON public.template_surat
    FOR DELETE
    TO authenticated
    USING (public.is_admin_or_ketua() OR dibuat_oleh = auth.uid());


-- 10. Policies untuk ARSIP DOKUMEN
DROP POLICY IF EXISTS arsip_dokumen_select_policy ON public.arsip_dokumen;
DROP POLICY IF EXISTS arsip_dokumen_insert_policy ON public.arsip_dokumen;
DROP POLICY IF EXISTS arsip_dokumen_update_policy ON public.arsip_dokumen;
DROP POLICY IF EXISTS arsip_dokumen_delete_policy ON public.arsip_dokumen;

-- Semua anggota terautentikasi dapat melihat arsip dokumen
CREATE POLICY arsip_dokumen_select_policy
    ON public.arsip_dokumen
    FOR SELECT
    TO authenticated
    USING (true);

-- Anggota dapat mengunggah arsip dokumen
CREATE POLICY arsip_dokumen_insert_policy
    ON public.arsip_dokumen
    FOR INSERT
    TO authenticated
    WITH CHECK (dibuat_oleh = auth.uid() OR public.is_admin_or_ketua());

-- Pembuat dokumen atau Admin/Ketua dapat memperbarui arsip dokumen
CREATE POLICY arsip_dokumen_update_policy
    ON public.arsip_dokumen
    FOR UPDATE
    TO authenticated
    USING (dibuat_oleh = auth.uid() OR public.is_admin_or_ketua())
    WITH CHECK (dibuat_oleh = auth.uid() OR public.is_admin_or_ketua());

-- Pembuat dokumen atau Admin/Ketua dapat menghapus arsip dokumen
CREATE POLICY arsip_dokumen_delete_policy
    ON public.arsip_dokumen
    FOR DELETE
    TO authenticated
    USING (dibuat_oleh = auth.uid() OR public.is_admin_or_ketua());


-- 11. Initial Data Sample untuk Template Surat jika Kosong
INSERT INTO public.template_surat (nama_template, jenis, ringkasan, kode_format, isi_template)
SELECT 
    'Surat Undangan Rapat Warga / Pemuda',
    'undangan'::jenis_surat,
    'Template resmi undangan pertemuan rutin atau rapat koordinasi kepanitiaan.',
    'UND-KT/RW05',
    'Nomor: {{nomor}}
Lampiran: -
Perihal: Undangan Pertemuan {{perihal}}

Kepada Yth.
Bapak/Ibu/Saudara/i: {{penerima}}
di Tempat

Dengan hormat,
Sehubungan dengan rencana pelaksanaan {{perihal}}, kami mengundang Bapak/Ibu/Saudara/i untuk hadir pada rapat koordinasi yang akan dilaksanakan pada:

Hari / Tanggal : {{tanggal}}
Waktu          : {{waktu}} WIB
Tempat         : {{tempat}}
Agenda         : {{agenda}}

Mengingat pentingnya acara ini, kehadiran tepat waktu sangat kami harapkan. Demikian surat undangan ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.

Hormat kami,
Pengurus Karang Taruna RW 05

( {{penandatangan}} )'
WHERE NOT EXISTS (SELECT 1 FROM public.template_surat LIMIT 1);
