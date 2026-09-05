-- 008_phase10_transparansi.sql
-- Migration Fase 10: Backend Transparansi Publik (Dashboard Publik)
-- Memastikan akses read-only yang aman untuk publik tanpa login

-- 1. Policies untuk Catatan Keuangan (Transparansi Publik)
ALTER TABLE public.catatan_keuangan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS catatan_keuangan_select_policy ON public.catatan_keuangan;

-- Izinkan publik (anon) dan authenticated membaca data ringkasan kas yang tidak dihapus
CREATE POLICY catatan_keuangan_select_policy
    ON public.catatan_keuangan
    FOR SELECT
    TO authenticated, anon
    USING (deleted_at IS NULL);

-- 2. Memastikan Anggota dapat dibaca oleh publik untuk metrik jumlah anggota aktif
DROP POLICY IF EXISTS anggota_select_policy ON public.anggota;

CREATE POLICY anggota_select_policy
    ON public.anggota
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- 3. Memastikan Kalender Kegiatan dapat dibaca oleh publik untuk jadwal agenda warga
DROP POLICY IF EXISTS kalender_kegiatan_select_policy ON public.kalender_kegiatan;

CREATE POLICY kalender_kegiatan_select_policy
    ON public.kalender_kegiatan
    FOR SELECT
    TO authenticated, anon
    USING (true);
