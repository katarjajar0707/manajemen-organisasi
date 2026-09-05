-- 009_phase10_fix_keuangan_rls.sql
-- Migration untuk melengkapi Row Level Security (RLS) pada tabel catatan_keuangan
-- Mengizinkan pengurus yang berwenang (admin, ketua, atau pengurus bendahara) untuk mencatat kas masuk/keluar

ALTER TABLE public.catatan_keuangan ENABLE ROW LEVEL SECURITY;

-- 1. Policy SELECT (sudah ada, diselaraskan agar lengkap)
DROP POLICY IF EXISTS catatan_keuangan_select_policy ON public.catatan_keuangan;
CREATE POLICY catatan_keuangan_select_policy
    ON public.catatan_keuangan
    FOR SELECT
    TO authenticated, anon
    USING (deleted_at IS NULL);

-- 2. Policy INSERT: Admin, Ketua, atau Anggota di bagian terkait dapat menambahkan catatan kas
DROP POLICY IF EXISTS catatan_keuangan_insert_policy ON public.catatan_keuangan;
CREATE POLICY catatan_keuangan_insert_policy
    ON public.catatan_keuangan
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.current_user_role() IN ('admin', 'ketua')
        OR bagian_id = public.current_user_bagian_id()
    );

-- 3. Policy UPDATE (untuk edit atau soft-delete): Admin, Ketua, atau pembuat catatan
DROP POLICY IF EXISTS catatan_keuangan_update_policy ON public.catatan_keuangan;
CREATE POLICY catatan_keuangan_update_policy
    ON public.catatan_keuangan
    FOR UPDATE
    TO authenticated
    USING (
        public.current_user_role() IN ('admin', 'ketua')
        OR bagian_id = public.current_user_bagian_id()
        OR dibuat_oleh = auth.uid()
    )
    WITH CHECK (
        public.current_user_role() IN ('admin', 'ketua')
        OR bagian_id = public.current_user_bagian_id()
        OR dibuat_oleh = auth.uid()
    );

-- 4. Policy DELETE: Admin atau Ketua
DROP POLICY IF EXISTS catatan_keuangan_delete_policy ON public.catatan_keuangan;
CREATE POLICY catatan_keuangan_delete_policy
    ON public.catatan_keuangan
    FOR DELETE
    TO authenticated
    USING (
        public.current_user_role() IN ('admin', 'ketua')
        OR bagian_id = public.current_user_bagian_id()
    );
