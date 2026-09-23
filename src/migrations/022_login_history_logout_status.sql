-- Migration: 022_login_history_logout_status.sql
-- Menambahkan kolom logged_out_at ke login_history dan last_seen_at ke profiles
-- untuk mendeteksi waktu terakhir pengguna offline/keluar.

ALTER TABLE public.login_history
  ADD COLUMN IF NOT EXISTS logged_out_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS login_history_logged_out_at_idx
  ON public.login_history (logged_out_at DESC);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS profiles_last_seen_at_idx
  ON public.profiles (last_seen_at DESC);

-- Izinkan semua pengguna terautentikasi (admin, ketua, anggota) melihat riwayat login di dashboard
DROP POLICY IF EXISTS login_history_admin_select ON public.login_history;
DROP POLICY IF EXISTS login_history_select ON public.login_history;

CREATE POLICY login_history_select
  ON public.login_history FOR SELECT TO authenticated
  USING (true);

-- Izinkan pengguna memperbarui waktu logout pada riwayat loginnnya sendiri
DROP POLICY IF EXISTS login_history_user_update ON public.login_history;

CREATE POLICY login_history_user_update
  ON public.login_history FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()) OR public.current_user_role() = 'admin')
  WITH CHECK (user_id = (select auth.uid()) OR public.current_user_role() = 'admin');
