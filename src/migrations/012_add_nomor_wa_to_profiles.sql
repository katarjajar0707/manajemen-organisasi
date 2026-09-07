-- ==============================================================================
-- Migration: 012_add_nomor_wa_to_profiles.sql
-- Description: Menambahkan kolom nomor_wa ke tabel public.profiles untuk
--              sinkronisasi kontak mandiri WhatsApp setiap pengguna.
-- ==============================================================================

-- 1. Tambah kolom nomor_wa jika belum ada
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nomor_wa TEXT;

-- 2. Sinkronkan nilai awal nomor_wa dari tabel anggota jika tersedia
UPDATE public.profiles p
SET nomor_wa = a.kontak
FROM public.anggota a
WHERE p.id = a.id
  AND (p.nomor_wa IS NULL OR p.nomor_wa = '')
  AND a.kontak IS NOT NULL 
  AND a.kontak <> '-';
