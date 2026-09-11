-- Catatan hanya dapat dibaca dan dikelola oleh anggota dari bagian yang sama.
-- Peran admin dan ketua tidak lagi menjadi pengecualian untuk catatan internal.

DROP POLICY IF EXISTS catatan_select_policy ON public.catatan;
CREATE POLICY catatan_select_policy
    ON public.catatan
    FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NULL
        AND bagian_id = public.current_user_bagian_id()
    );

DROP POLICY IF EXISTS catatan_insert_policy ON public.catatan;
CREATE POLICY catatan_insert_policy
    ON public.catatan
    FOR INSERT
    TO authenticated
    WITH CHECK (
        dibuat_oleh = auth.uid()
        AND bagian_id = public.current_user_bagian_id()
    );

DROP POLICY IF EXISTS catatan_update_policy ON public.catatan;
CREATE POLICY catatan_update_policy
    ON public.catatan
    FOR UPDATE
    TO authenticated
    USING (
        deleted_at IS NULL
        AND bagian_id = public.current_user_bagian_id()
    )
    WITH CHECK (
        bagian_id = public.current_user_bagian_id()
    );

DROP POLICY IF EXISTS catatan_delete_policy ON public.catatan;
CREATE POLICY catatan_delete_policy
    ON public.catatan
    FOR DELETE
    TO authenticated
    USING (
        deleted_at IS NULL
        AND bagian_id = public.current_user_bagian_id()
    );
