-- ==============================================================================
-- Migration: 011_cleanup_dummy_data.sql
-- Description: Membersihkan seluruh data dummy / percobaan awal di database.
-- Aman: Mempertahankan akun pengguna asli di auth.users & public.profiles,
--       serta struktur master organisasi di public.bagian.
-- ==============================================================================

-- 1. Bersihkan Dokumentasi & Kalender Kegiatan Dummy
DELETE FROM public.dokumentasi_kegiatan;
DELETE FROM public.kalender_kegiatan;

-- 2. Bersihkan Transaksi Kas Masuk & Kas Keluar Dummy
DELETE FROM public.catatan_keuangan;

-- 3. Bersihkan Catatan Internal Divisi / Bagian
DELETE FROM public.catatan;

-- 4. Bersihkan Peminjaman & Inventaris Barang Dummy
DELETE FROM public.peminjaman_inventaris;
DELETE FROM public.inventaris;

-- 5. Bersihkan Forum Diskusi Dummy
DELETE FROM public.diskusi_balasan;
DELETE FROM public.diskusi_mention;
DELETE FROM public.diskusi;

-- 6. Bersihkan Pengumuman Dummy
DELETE FROM public.pengumuman;

-- 7. Bersihkan Arsip Dokumen Dummy
DELETE FROM public.arsip_dokumen;

-- 8. Bersihkan Anggota Dummy Seed
-- Hanya menghapus nama dummy seed dan yang tidak terafiliasi dengan akun profil terdaftar
DELETE FROM public.anggota 
WHERE LOWER(TRIM(nama)) IN (
    'ahmad zaki', 
    'siti rahma', 
    'dewi anggraini', 
    'rian pratama', 
    'fajar nugraha'
)
OR LOWER(TRIM(nama)) NOT IN (
    SELECT LOWER(TRIM(nama)) FROM public.profiles WHERE nama IS NOT NULL AND TRIM(nama) != ''
);

-- 9. Bersihkan Agenda Organisasi Dummy contoh awal
DELETE FROM public.agenda_organisasi 
WHERE nama_agenda ILIKE '%Kepengurusan Inti Karang Taruna%';
