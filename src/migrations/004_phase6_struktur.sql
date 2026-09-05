-- 004_phase6_struktur.sql
-- Migration Fase 6: Backend Struktur Organisasi Multi-Agenda & Keanggotaan

-- 1. Penyesuaian Kolom Tabel agenda_organisasi
ALTER TABLE public.agenda_organisasi 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Aktif';

-- 2. Penyesuaian Kolom Tabel anggota
ALTER TABLE public.anggota 
ALTER COLUMN periode_id DROP NOT NULL;

ALTER TABLE public.anggota 
ADD COLUMN IF NOT EXISTS bagian_id UUID REFERENCES public.bagian(id) ON DELETE SET NULL;

ALTER TABLE public.anggota 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Aktif';

-- 3. Trigger otomatis untuk memastikan hanya 1 periode aktif per agenda_organisasi
CREATE OR REPLACE FUNCTION public.handle_single_active_periode()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.is_aktif = true THEN
        UPDATE public.periode_kepengurusan
        SET is_aktif = false
        WHERE agenda_organisasi_id = NEW.agenda_organisasi_id
          AND id <> NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_single_active_periode ON public.periode_kepengurusan;

CREATE TRIGGER trg_single_active_periode
    BEFORE INSERT OR UPDATE OF is_aktif ON public.periode_kepengurusan
    FOR EACH ROW
    WHEN (NEW.is_aktif = true)
    EXECUTE FUNCTION public.handle_single_active_periode();

-- 4. Aktifkan Row Level Security (RLS)
ALTER TABLE public.agenda_organisasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periode_kepengurusan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anggota ENABLE ROW LEVEL SECURITY;

-- 5. Policies untuk agenda_organisasi
-- Sesuai PRD 4.5: Detail struktur keseluruhan bisa dilihat semua role & semua departemen
DROP POLICY IF EXISTS agenda_organisasi_select_policy ON public.agenda_organisasi;
DROP POLICY IF EXISTS agenda_organisasi_insert_policy ON public.agenda_organisasi;
DROP POLICY IF EXISTS agenda_organisasi_update_policy ON public.agenda_organisasi;
DROP POLICY IF EXISTS agenda_organisasi_delete_policy ON public.agenda_organisasi;

CREATE POLICY agenda_organisasi_select_policy
    ON public.agenda_organisasi
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- Khusus Ketua & Admin yang boleh membuat, mengubah, dan menghapus agenda (PRD 3.6 & 4.5)
CREATE POLICY agenda_organisasi_insert_policy
    ON public.agenda_organisasi
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin_or_ketua());

CREATE POLICY agenda_organisasi_update_policy
    ON public.agenda_organisasi
    FOR UPDATE
    TO authenticated
    USING (public.is_admin_or_ketua())
    WITH CHECK (public.is_admin_or_ketua());

CREATE POLICY agenda_organisasi_delete_policy
    ON public.agenda_organisasi
    FOR DELETE
    TO authenticated
    USING (public.is_admin_or_ketua());

-- 6. Policies untuk periode_kepengurusan
DROP POLICY IF EXISTS periode_kepengurusan_select_policy ON public.periode_kepengurusan;
DROP POLICY IF EXISTS periode_kepengurusan_insert_policy ON public.periode_kepengurusan;
DROP POLICY IF EXISTS periode_kepengurusan_update_policy ON public.periode_kepengurusan;
DROP POLICY IF EXISTS periode_kepengurusan_delete_policy ON public.periode_kepengurusan;

CREATE POLICY periode_kepengurusan_select_policy
    ON public.periode_kepengurusan
    FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY periode_kepengurusan_insert_policy
    ON public.periode_kepengurusan
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin_or_ketua());

CREATE POLICY periode_kepengurusan_update_policy
    ON public.periode_kepengurusan
    FOR UPDATE
    TO authenticated
    USING (public.is_admin_or_ketua())
    WITH CHECK (public.is_admin_or_ketua());

CREATE POLICY periode_kepengurusan_delete_policy
    ON public.periode_kepengurusan
    FOR DELETE
    TO authenticated
    USING (public.is_admin_or_ketua());

-- 7. Policies untuk anggota
DROP POLICY IF EXISTS anggota_select_policy ON public.anggota;
DROP POLICY IF EXISTS anggota_insert_policy ON public.anggota;
DROP POLICY IF EXISTS anggota_update_policy ON public.anggota;
DROP POLICY IF EXISTS anggota_delete_policy ON public.anggota;

CREATE POLICY anggota_select_policy
    ON public.anggota
    FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY anggota_insert_policy
    ON public.anggota
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin_or_ketua());

CREATE POLICY anggota_update_policy
    ON public.anggota
    FOR UPDATE
    TO authenticated
    USING (public.is_admin_or_ketua())
    WITH CHECK (public.is_admin_or_ketua());

CREATE POLICY anggota_delete_policy
    ON public.anggota
    FOR DELETE
    TO authenticated
    USING (public.is_admin_or_ketua());

-- 8. Data Inisial (Seed) jika tabel masih kosong
DO $$
DECLARE
    v_admin_id UUID;
    v_bagian_id UUID;
    v_agenda_id UUID;
    v_periode_id UUID;
BEGIN
    -- Dapatkan salah satu profile admin/ketua sebagai author
    SELECT id INTO v_admin_id FROM public.profiles WHERE role IN ('admin', 'ketua') LIMIT 1;
    IF v_admin_id IS NULL THEN
        SELECT id INTO v_admin_id FROM public.profiles LIMIT 1;
    END IF;

    -- Dapatkan salah satu bagian (misal ketua / sekretaris / bagian pertama)
    SELECT id INTO v_bagian_id FROM public.bagian ORDER BY created_at ASC LIMIT 1;

    IF v_admin_id IS NOT NULL AND v_bagian_id IS NOT NULL THEN
        -- Cek apakah sudah ada agenda
        IF NOT EXISTS (SELECT 1 FROM public.agenda_organisasi LIMIT 1) THEN
            INSERT INTO public.agenda_organisasi (
                id,
                bagian_id,
                nama_agenda,
                deskripsi,
                dibuat_oleh,
                status
            ) VALUES (
                gen_random_uuid(),
                v_bagian_id,
                'Kepengurusan Inti Karang Taruna',
                'Struktur organisasi induk karang taruna periode kerja 2 tahun.',
                v_admin_id,
                'Aktif'
            ) RETURNING id INTO v_agenda_id;

            -- Buat periode aktif awal
            INSERT INTO public.periode_kepengurusan (
                id,
                agenda_organisasi_id,
                nama_periode,
                tanggal_mulai,
                tanggal_selesai,
                is_aktif
            ) VALUES (
                gen_random_uuid(),
                v_agenda_id,
                'Periode 2025–2027',
                '2025-01-01',
                '2027-12-31',
                true
            ) RETURNING id INTO v_periode_id;

            -- Masukkan anggota contoh terhubung ke periode aktif
            INSERT INTO public.anggota (
                nama, kontak, rt_rw, jabatan, periode_id, bagian_id, status
            ) VALUES
                ('Ahmad Zaki', '0812-3456-7890', 'RT 03 / RW 05', 'Ketua Karang Taruna', v_periode_id, v_bagian_id, 'Aktif'),
                ('Siti Rahma', '0813-9876-5432', 'RT 02 / RW 05', 'Bendahara Umum', v_periode_id, v_bagian_id, 'Aktif'),
                ('Dewi Anggraini', '0878-5566-7788', 'RT 01 / RW 05', 'Sekretaris I', v_periode_id, v_bagian_id, 'Aktif'),
                ('Rian Pratama', '0857-1122-3344', 'RT 04 / RW 05', 'Koordinator Acara', v_periode_id, v_bagian_id, 'Aktif'),
                ('Fajar Nugraha', '0819-3344-5566', 'RT 05 / RW 05', 'Divisi Perlengkapan', v_periode_id, v_bagian_id, 'Aktif');
        END IF;
    END IF;
END $$;
