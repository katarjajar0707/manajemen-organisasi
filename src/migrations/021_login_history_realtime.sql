-- Audit login ringan untuk dashboard administrator.
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  logged_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  auth_method TEXT NOT NULL DEFAULT 'password' CHECK (auth_method IN ('password'))
);

CREATE INDEX IF NOT EXISTS login_history_logged_in_at_idx
  ON public.login_history (logged_in_at DESC);

CREATE INDEX IF NOT EXISTS login_history_user_logged_in_at_idx
  ON public.login_history (user_id, logged_in_at DESC);

ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS login_history_admin_select ON public.login_history;
DROP POLICY IF EXISTS login_history_user_insert ON public.login_history;

CREATE POLICY login_history_admin_select
  ON public.login_history FOR SELECT TO authenticated
  USING (public.current_user_role() = 'admin');

CREATE POLICY login_history_user_insert
  ON public.login_history FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- PostgreSQL Realtime dipakai untuk menambahkan login baru ke dashboard admin.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'login_history'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.login_history;
  END IF;
END $$;
