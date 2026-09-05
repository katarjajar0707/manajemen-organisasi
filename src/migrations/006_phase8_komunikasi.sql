-- 006_phase8_komunikasi.sql
-- Migration Fase 8: Backend Komunikasi & Papan Diskusi Lintas Bagian
-- Tabel: pengumuman, diskusi, diskusi_balasan, diskusi_mention

-- 1. Penyesuaian Kolom jika diperlukan
ALTER TABLE public.diskusi 
    ALTER COLUMN bagian_pembuat_id DROP NOT NULL;

ALTER TABLE public.diskusi 
    ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false NOT NULL;

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diskusi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diskusi_balasan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diskusi_mention ENABLE ROW LEVEL SECURITY;

-- 3. Policies untuk PENGUMUMAN (Broadcast Internal)
DROP POLICY IF EXISTS pengumuman_select_policy ON public.pengumuman;
DROP POLICY IF EXISTS pengumuman_insert_policy ON public.pengumuman;
DROP POLICY IF EXISTS pengumuman_update_policy ON public.pengumuman;
DROP POLICY IF EXISTS pengumuman_delete_policy ON public.pengumuman;

-- Semua anggota dapat melihat pengumuman umum, atau pengumuman yang ditujukan ke bagiannya.
-- Admin & Ketua dapat melihat semua pengumuman.
CREATE POLICY pengumuman_select_policy
    ON public.pengumuman
    FOR SELECT
    TO authenticated
    USING (
        target = 'semua'
        OR bagian_id IS NULL
        OR bagian_id = public.current_user_bagian_id()
        OR public.is_admin_or_ketua()
        OR dibuat_oleh = auth.uid()
    );

-- Admin & Ketua dapat membuat pengumuman untuk siapa saja.
-- Anggota dapat membuat pengumuman untuk bagiannya sendiri.
CREATE POLICY pengumuman_insert_policy
    ON public.pengumuman
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin_or_ketua()
        OR (target = 'bagian_tertentu' AND bagian_id = public.current_user_bagian_id())
    );

CREATE POLICY pengumuman_update_policy
    ON public.pengumuman
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

CREATE POLICY pengumuman_delete_policy
    ON public.pengumuman
    FOR DELETE
    TO authenticated
    USING (
        dibuat_oleh = auth.uid()
        OR public.is_admin_or_ketua()
    );

-- 4. Policies untuk DISKUSI (Papan Diskusi & Catatan Umum)
-- PRD 4.7: Papan diskusi & Catatan Umum terbuka dan bisa dilihat SEMUA role & SEMUA bagian.
DROP POLICY IF EXISTS diskusi_select_policy ON public.diskusi;
DROP POLICY IF EXISTS diskusi_insert_policy ON public.diskusi;
DROP POLICY IF EXISTS diskusi_update_policy ON public.diskusi;
DROP POLICY IF EXISTS diskusi_delete_policy ON public.diskusi;

CREATE POLICY diskusi_select_policy
    ON public.diskusi
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY diskusi_insert_policy
    ON public.diskusi
    FOR INSERT
    TO authenticated
    WITH CHECK (
        dibuat_oleh = auth.uid()
    );

CREATE POLICY diskusi_update_policy
    ON public.diskusi
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

CREATE POLICY diskusi_delete_policy
    ON public.diskusi
    FOR DELETE
    TO authenticated
    USING (
        dibuat_oleh = auth.uid()
        OR public.is_admin_or_ketua()
    );

-- 5. Policies untuk DISKUSI_BALASAN (Komentar dalam Diskusi)
DROP POLICY IF EXISTS diskusi_balasan_select_policy ON public.diskusi_balasan;
DROP POLICY IF EXISTS diskusi_balasan_insert_policy ON public.diskusi_balasan;
DROP POLICY IF EXISTS diskusi_balasan_update_policy ON public.diskusi_balasan;
DROP POLICY IF EXISTS diskusi_balasan_delete_policy ON public.diskusi_balasan;

CREATE POLICY diskusi_balasan_select_policy
    ON public.diskusi_balasan
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY diskusi_balasan_insert_policy
    ON public.diskusi_balasan
    FOR INSERT
    TO authenticated
    WITH CHECK (
        dibuat_oleh = auth.uid()
    );

CREATE POLICY diskusi_balasan_update_policy
    ON public.diskusi_balasan
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

CREATE POLICY diskusi_balasan_delete_policy
    ON public.diskusi_balasan
    FOR DELETE
    TO authenticated
    USING (
        dibuat_oleh = auth.uid()
        OR public.is_admin_or_ketua()
    );

-- 6. Policies untuk DISKUSI_MENTION (@Departemen Tag)
DROP POLICY IF EXISTS diskusi_mention_select_policy ON public.diskusi_mention;
DROP POLICY IF EXISTS diskusi_mention_insert_policy ON public.diskusi_mention;
DROP POLICY IF EXISTS diskusi_mention_delete_policy ON public.diskusi_mention;

CREATE POLICY diskusi_mention_select_policy
    ON public.diskusi_mention
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY diskusi_mention_insert_policy
    ON public.diskusi_mention
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.diskusi d
            WHERE d.id = diskusi_id
            AND (d.dibuat_oleh = auth.uid() OR public.is_admin_or_ketua())
        )
    );

CREATE POLICY diskusi_mention_delete_policy
    ON public.diskusi_mention
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.diskusi d
            WHERE d.id = diskusi_id
            AND (d.dibuat_oleh = auth.uid() OR public.is_admin_or_ketua())
        )
    );
