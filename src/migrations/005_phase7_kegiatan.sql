-- 005_phase7_kegiatan.sql
-- Migration Fase 7: Backend Kegiatan & Dokumentasi Acara

-- 1. Aktifkan Row Level Security (RLS)
ALTER TABLE public.kalender_kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dokumentasi_kegiatan ENABLE ROW LEVEL SECURITY;

-- 2. Policies untuk kalender_kegiatan
DROP POLICY IF EXISTS kalender_kegiatan_select_policy ON public.kalender_kegiatan;
DROP POLICY IF EXISTS kalender_kegiatan_insert_policy ON public.kalender_kegiatan;
DROP POLICY IF EXISTS kalender_kegiatan_update_policy ON public.kalender_kegiatan;
DROP POLICY IF EXISTS kalender_kegiatan_delete_policy ON public.kalender_kegiatan;

-- Semua role dan publik (anon) dapat melihat jadwal kegiatan (PRD 4.6 & 4.10)
CREATE POLICY kalender_kegiatan_select_policy
    ON public.kalender_kegiatan
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- Pengurus (admin/ketua) atau anggota yang ditugaskan di bagian penanggung jawab dapat membuat jadwal
CREATE POLICY kalender_kegiatan_insert_policy
    ON public.kalender_kegiatan
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin_or_ketua()
        OR bagian_id IS NULL
        OR bagian_id = public.current_user_bagian_id()
    );

CREATE POLICY kalender_kegiatan_update_policy
    ON public.kalender_kegiatan
    FOR UPDATE
    TO authenticated
    USING (
        dibuat_oleh = auth.uid()
        OR public.is_admin_or_ketua()
    )
    WITH CHECK (
        dibuat_oleh = auth.uid()
        OR public.is_admin_or_ketua()
    );

CREATE POLICY kalender_kegiatan_delete_policy
    ON public.kalender_kegiatan
    FOR DELETE
    TO authenticated
    USING (
        dibuat_oleh = auth.uid()
        OR public.is_admin_or_ketua()
    );

-- 3. Policies untuk dokumentasi_kegiatan
DROP POLICY IF EXISTS dokumentasi_kegiatan_select_policy ON public.dokumentasi_kegiatan;
DROP POLICY IF EXISTS dokumentasi_kegiatan_insert_policy ON public.dokumentasi_kegiatan;
DROP POLICY IF EXISTS dokumentasi_kegiatan_update_policy ON public.dokumentasi_kegiatan;
DROP POLICY IF EXISTS dokumentasi_kegiatan_delete_policy ON public.dokumentasi_kegiatan;

CREATE POLICY dokumentasi_kegiatan_select_policy
    ON public.dokumentasi_kegiatan
    FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY dokumentasi_kegiatan_insert_policy
    ON public.dokumentasi_kegiatan
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY dokumentasi_kegiatan_update_policy
    ON public.dokumentasi_kegiatan
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY dokumentasi_kegiatan_delete_policy
    ON public.dokumentasi_kegiatan
    FOR DELETE
    TO authenticated
    USING (
        public.is_admin_or_ketua()
        OR EXISTS (
            SELECT 1 FROM public.kalender_kegiatan k
            WHERE k.id = dokumentasi_kegiatan.kalender_id
              AND k.dibuat_oleh = auth.uid()
        )
    );

-- 4. Seed data awal jika tabel kalender_kegiatan masih kosong
DO $$
DECLARE
    v_admin_id UUID;
    v_bagian_id UUID;
    v_kegiatan_id UUID;
BEGIN
    SELECT id INTO v_admin_id FROM public.profiles WHERE role IN ('admin', 'ketua') LIMIT 1;
    IF v_admin_id IS NULL THEN
        SELECT id INTO v_admin_id FROM public.profiles LIMIT 1;
    END IF;

    SELECT id INTO v_bagian_id FROM public.bagian ORDER BY created_at ASC LIMIT 1;

    IF v_admin_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.kalender_kegiatan LIMIT 1) THEN
            -- Kegiatan 1: Kerja Bakti
            INSERT INTO public.kalender_kegiatan (
                id,
                judul,
                deskripsi,
                tanggal_mulai,
                tanggal_selesai,
                lokasi,
                bagian_id,
                dibuat_oleh
            ) VALUES (
                gen_random_uuid(),
                'Kerja Bakti Lingkungan RW 05',
                'Pembersihan saluran air dan pengecatan gapura lingkungan serentak RT 01 - RT 06.',
                now() + interval '3 days',
                now() + interval '3 days' + interval '4 hours',
                'Balai Warga & Lapangan Utama RW 05',
                v_bagian_id,
                v_admin_id
            );

            -- Kegiatan 2: Peringatan Semarak HUT RI
            INSERT INTO public.kalender_kegiatan (
                id,
                judul,
                deskripsi,
                tanggal_mulai,
                tanggal_selesai,
                lokasi,
                bagian_id,
                dibuat_oleh
            ) VALUES (
                gen_random_uuid(),
                'Peringatan Semarak HUT RI ke-81',
                'Pentas seni budaya pemuda, aneka perlombaan anak & warga, serta bazar UMKM.',
                now() + interval '14 days',
                now() + interval '15 days',
                'Lapangan Serbaguna RW 05',
                v_bagian_id,
                v_admin_id
            );
        END IF;
    END IF;
END $$;
