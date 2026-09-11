-- Catatan adalah ruang kerja internal setiap bagian.
-- Anggota hanya dapat membaca dan mengelola catatan bagian mereka sendiri;
-- admin dan ketua tetap dapat melakukan pengawasan lintas bagian.

ALTER TABLE public.catatan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS catatan_select_policy ON public.catatan;
CREATE POLICY catatan_select_policy
    ON public.catatan
    FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NULL
        AND (
            public.is_admin_or_ketua()
            OR bagian_id = public.current_user_bagian_id()
        )
    );

DROP POLICY IF EXISTS catatan_insert_policy ON public.catatan;
CREATE POLICY catatan_insert_policy
    ON public.catatan
    FOR INSERT
    TO authenticated
    WITH CHECK (
        dibuat_oleh = auth.uid()
        AND (
            public.is_admin_or_ketua()
            OR bagian_id = public.current_user_bagian_id()
        )
    );

DROP POLICY IF EXISTS catatan_update_policy ON public.catatan;
CREATE POLICY catatan_update_policy
    ON public.catatan
    FOR UPDATE
    TO authenticated
    USING (
        deleted_at IS NULL
        AND (
            public.is_admin_or_ketua()
            OR bagian_id = public.current_user_bagian_id()
        )
    )
    WITH CHECK (
        public.is_admin_or_ketua()
        OR bagian_id = public.current_user_bagian_id()
    );

DROP POLICY IF EXISTS catatan_delete_policy ON public.catatan;
CREATE POLICY catatan_delete_policy
    ON public.catatan
    FOR DELETE
    TO authenticated
    USING (
        deleted_at IS NULL
        AND (
            public.is_admin_or_ketua()
            OR bagian_id = public.current_user_bagian_id()
        )
    );
