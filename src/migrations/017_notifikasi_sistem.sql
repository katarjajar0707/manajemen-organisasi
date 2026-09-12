-- Pusat notifikasi untuk seluruh pengurus.
-- Baris notifikasi dibuat oleh trigger agar setiap sumber data selalu tercatat,
-- termasuk jika data ditambahkan dari halaman atau proses lain di masa depan.

CREATE TABLE IF NOT EXISTS public.notifikasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipe TEXT NOT NULL CHECK (tipe IN ('keuangan', 'kegiatan', 'inventaris', 'peminjaman', 'pengumuman', 'diskusi', 'arsip', 'agenda', 'anggota', 'catatan', 'surat')),
    judul TEXT NOT NULL,
    pesan TEXT,
    href TEXT NOT NULL,
    sumber TEXT NOT NULL,
    sumber_id UUID,
    bagian_id UUID REFERENCES public.bagian(id) ON DELETE CASCADE,
    dibuat_oleh UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifikasi_created_at_idx ON public.notifikasi (created_at DESC);
CREATE INDEX IF NOT EXISTS notifikasi_bagian_id_idx ON public.notifikasi (bagian_id);

CREATE TABLE IF NOT EXISTS public.notifikasi_status (
    notifikasi_id UUID NOT NULL REFERENCES public.notifikasi(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    dibaca_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (notifikasi_id, user_id)
);

CREATE INDEX IF NOT EXISTS notifikasi_status_user_id_idx ON public.notifikasi_status (user_id);

ALTER TABLE public.notifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifikasi_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifikasi_select_policy ON public.notifikasi;
CREATE POLICY notifikasi_select_policy
    ON public.notifikasi
    FOR SELECT
    TO authenticated
    USING (bagian_id IS NULL OR bagian_id = public.current_user_bagian_id());

DROP POLICY IF EXISTS notifikasi_status_select_policy ON public.notifikasi_status;
CREATE POLICY notifikasi_status_select_policy
    ON public.notifikasi_status
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS notifikasi_status_insert_policy ON public.notifikasi_status;
CREATE POLICY notifikasi_status_insert_policy
    ON public.notifikasi_status
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS notifikasi_status_update_policy ON public.notifikasi_status;
CREATE POLICY notifikasi_status_update_policy
    ON public.notifikasi_status
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.buat_notifikasi_sistem()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tipe TEXT;
    v_judul TEXT;
    v_pesan TEXT;
    v_href TEXT;
    v_bagian_id UUID := NULL;
    v_pembuat UUID := NULLIF(to_jsonb(NEW)->>'dibuat_oleh', '')::UUID;
BEGIN
    CASE TG_TABLE_NAME
        WHEN 'catatan_keuangan' THEN
            v_tipe := 'keuangan';
            v_judul := CASE WHEN NEW.jenis::TEXT = 'masuk' THEN 'Kas masuk dicatat' ELSE 'Kas keluar dicatat' END;
            v_pesan := COALESCE(NEW.judul, 'Transaksi kas baru') || ' · Rp ' || to_char(NEW.jumlah, 'FM999G999G999G999');
            v_href := '/keuangan';
        WHEN 'kalender_kegiatan' THEN
            v_tipe := 'kegiatan';
            v_judul := 'Agenda kegiatan baru dibuat';
            v_pesan := COALESCE(NEW.judul, 'Kegiatan baru');
            v_href := '/kegiatan';
        WHEN 'inventaris' THEN
            v_tipe := 'inventaris';
            v_judul := 'Inventaris baru ditambahkan';
            v_pesan := COALESCE(NEW.nama_barang, 'Barang inventaris baru');
            v_href := '/inventaris';
        WHEN 'peminjaman_inventaris' THEN
            v_tipe := 'peminjaman';
            v_judul := 'Peminjaman inventaris dicatat';
            v_pesan := 'Peminjam: ' || COALESCE(NEW.peminjam, 'Tidak diketahui');
            v_href := '/inventaris';
        WHEN 'pengumuman' THEN
            v_tipe := 'pengumuman';
            v_judul := 'Pengumuman baru diterbitkan';
            v_pesan := COALESCE(NEW.judul, 'Pengumuman baru');
            v_href := '/pengumuman';
            IF NEW.target::TEXT = 'bagian_tertentu' THEN
                v_bagian_id := NEW.bagian_id;
            END IF;
        WHEN 'diskusi' THEN
            v_tipe := 'diskusi';
            v_judul := 'Diskusi baru dibuat';
            v_pesan := COALESCE(NEW.judul, 'Topik diskusi baru');
            v_href := '/diskusi';
        WHEN 'arsip_dokumen' THEN
            v_tipe := 'arsip';
            v_judul := 'Arsip dokumen baru ditambahkan';
            v_pesan := COALESCE(NEW.judul, 'Dokumen baru');
            v_href := '/arsip';
        WHEN 'agenda_organisasi' THEN
            v_tipe := 'agenda';
            v_judul := 'Agenda organisasi baru dibuat';
            v_pesan := COALESCE(NEW.nama_agenda, 'Agenda baru');
            v_href := '/struktur';
        WHEN 'anggota' THEN
            v_tipe := 'anggota';
            v_judul := 'Data anggota baru ditambahkan';
            v_pesan := COALESCE(NEW.nama, 'Anggota baru');
            v_href := '/anggota';
        WHEN 'catatan' THEN
            v_tipe := 'catatan';
            v_judul := 'Catatan bagian baru dibuat';
            v_pesan := COALESCE(NEW.judul, 'Catatan baru');
            v_href := '/catatan';
            v_bagian_id := NEW.bagian_id;
        WHEN 'template_surat' THEN
            v_tipe := 'surat';
            v_judul := 'Template surat baru ditambahkan';
            v_pesan := COALESCE(NEW.nama_template, 'Template surat baru');
            v_href := '/surat';
        ELSE
            RETURN NEW;
    END CASE;

    INSERT INTO public.notifikasi (tipe, judul, pesan, href, sumber, sumber_id, bagian_id, dibuat_oleh)
    VALUES (v_tipe, v_judul, v_pesan, v_href, TG_TABLE_NAME, NEW.id, v_bagian_id, v_pembuat);

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifikasi_catatan_keuangan_insert ON public.catatan_keuangan;
CREATE TRIGGER notifikasi_catatan_keuangan_insert AFTER INSERT ON public.catatan_keuangan FOR EACH ROW EXECUTE FUNCTION public.buat_notifikasi_sistem();
DROP TRIGGER IF EXISTS notifikasi_kalender_kegiatan_insert ON public.kalender_kegiatan;
CREATE TRIGGER notifikasi_kalender_kegiatan_insert AFTER INSERT ON public.kalender_kegiatan FOR EACH ROW EXECUTE FUNCTION public.buat_notifikasi_sistem();
DROP TRIGGER IF EXISTS notifikasi_inventaris_insert ON public.inventaris;
CREATE TRIGGER notifikasi_inventaris_insert AFTER INSERT ON public.inventaris FOR EACH ROW EXECUTE FUNCTION public.buat_notifikasi_sistem();
DROP TRIGGER IF EXISTS notifikasi_peminjaman_inventaris_insert ON public.peminjaman_inventaris;
CREATE TRIGGER notifikasi_peminjaman_inventaris_insert AFTER INSERT ON public.peminjaman_inventaris FOR EACH ROW EXECUTE FUNCTION public.buat_notifikasi_sistem();
DROP TRIGGER IF EXISTS notifikasi_pengumuman_insert ON public.pengumuman;
CREATE TRIGGER notifikasi_pengumuman_insert AFTER INSERT ON public.pengumuman FOR EACH ROW EXECUTE FUNCTION public.buat_notifikasi_sistem();
DROP TRIGGER IF EXISTS notifikasi_diskusi_insert ON public.diskusi;
CREATE TRIGGER notifikasi_diskusi_insert AFTER INSERT ON public.diskusi FOR EACH ROW EXECUTE FUNCTION public.buat_notifikasi_sistem();
DROP TRIGGER IF EXISTS notifikasi_arsip_dokumen_insert ON public.arsip_dokumen;
CREATE TRIGGER notifikasi_arsip_dokumen_insert AFTER INSERT ON public.arsip_dokumen FOR EACH ROW EXECUTE FUNCTION public.buat_notifikasi_sistem();
DROP TRIGGER IF EXISTS notifikasi_agenda_organisasi_insert ON public.agenda_organisasi;
CREATE TRIGGER notifikasi_agenda_organisasi_insert AFTER INSERT ON public.agenda_organisasi FOR EACH ROW EXECUTE FUNCTION public.buat_notifikasi_sistem();
DROP TRIGGER IF EXISTS notifikasi_anggota_insert ON public.anggota;
CREATE TRIGGER notifikasi_anggota_insert AFTER INSERT ON public.anggota FOR EACH ROW EXECUTE FUNCTION public.buat_notifikasi_sistem();
DROP TRIGGER IF EXISTS notifikasi_catatan_insert ON public.catatan;
CREATE TRIGGER notifikasi_catatan_insert AFTER INSERT ON public.catatan FOR EACH ROW EXECUTE FUNCTION public.buat_notifikasi_sistem();
DROP TRIGGER IF EXISTS notifikasi_template_surat_insert ON public.template_surat;
CREATE TRIGGER notifikasi_template_surat_insert AFTER INSERT ON public.template_surat FOR EACH ROW EXECUTE FUNCTION public.buat_notifikasi_sistem();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifikasi'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifikasi;
    END IF;
END
$$;
