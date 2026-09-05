-- Phase 3: Supabase Auth, profiles, dan akses dasar berbasis role/bagian

-- Membuat profile otomatis ketika akun Supabase Auth dibuat.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    base_username TEXT;
    generated_username TEXT;
    suffix INTEGER := 0;
BEGIN
    base_username := lower(
        regexp_replace(
            coalesce(
                NEW.raw_user_meta_data ->> 'username',
                NEW.raw_user_meta_data ->> 'nama',
                split_part(coalesce(NEW.email, ''), '@', 1),
                'user'
            ),
            '[^a-zA-Z0-9_]+',
            '_',
            'g'
        )
    );

    IF base_username = '' THEN
        base_username := 'user';
    END IF;

    generated_username := left(base_username, 40);

    WHILE EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE username = generated_username
    ) LOOP
        suffix := suffix + 1;
        generated_username := left(base_username, 35) || '_' || suffix::TEXT;
    END LOOP;

    INSERT INTO public.profiles (id, nama, username, role)
    VALUES (
        NEW.id,
        coalesce(
            NEW.raw_user_meta_data ->> 'nama',
            NEW.raw_user_meta_data ->> 'full_name',
            split_part(coalesce(NEW.email, ''), '@', 1),
            'Anggota'
        ),
        generated_username,
        'anggota'
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Helper functions dipakai oleh policy RLS.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role
    FROM public.profiles
    WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_bagian_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT bagian_id
    FROM public.profiles
    WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_ketua()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT coalesce(public.current_user_role() IN ('admin', 'ketua'), false);
$$;

-- Anggota tidak boleh mengubah role, bagian, atau nama akunnya sendiri.
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF public.current_user_role() != 'admin' THEN
        IF NEW.role IS DISTINCT FROM OLD.role
            OR NEW.bagian_id IS DISTINCT FROM OLD.bagian_id THEN
            RAISE EXCEPTION 'Role dan bagian hanya dapat diubah oleh admin';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_fields ON public.profiles;

CREATE TRIGGER protect_profile_fields
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_fields();

-- RLS fondasi Phase 3.
ALTER TABLE public.bagian ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bagian_select_policy ON public.bagian;
DROP POLICY IF EXISTS bagian_admin_insert_policy ON public.bagian;
DROP POLICY IF EXISTS bagian_admin_update_policy ON public.bagian;
DROP POLICY IF EXISTS bagian_admin_delete_policy ON public.bagian;

CREATE POLICY bagian_select_policy
    ON public.bagian
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY bagian_admin_insert_policy
    ON public.bagian
    FOR INSERT
    TO authenticated
    WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY bagian_admin_update_policy
    ON public.bagian
    FOR UPDATE
    TO authenticated
    USING (public.current_user_role() = 'admin')
    WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY bagian_admin_delete_policy
    ON public.bagian
    FOR DELETE
    TO authenticated
    USING (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_policy ON public.profiles;

CREATE POLICY profiles_select_policy
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY profiles_insert_policy
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY profiles_update_policy
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (
        id = auth.uid()
        OR public.current_user_role() = 'admin'
    )
    WITH CHECK (
        id = auth.uid()
        OR public.current_user_role() = 'admin'
    );

CREATE POLICY profiles_delete_policy
    ON public.profiles
    FOR DELETE
    TO authenticated
    USING (public.current_user_role() = 'admin');
