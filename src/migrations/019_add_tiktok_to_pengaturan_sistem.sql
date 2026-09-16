-- 019_add_tiktok_to_pengaturan_sistem.sql
-- Menambahkan kolom tiktok pada tabel pengaturan_sistem organisasi
ALTER TABLE public.pengaturan_sistem
ADD COLUMN IF NOT EXISTS tiktok TEXT DEFAULT '';
