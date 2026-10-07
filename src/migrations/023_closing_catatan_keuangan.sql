-- 023_closing_catatan_keuangan.sql
-- Migration untuk fitur Closing Catatan Keuangan dan Riwayat Closing

-- 1. Tabel closing_keuangan
CREATE TABLE IF NOT EXISTS public.closing_keuangan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_closing TEXT NOT NULL UNIQUE,
    judul TEXT NOT NULL,
    bagian_id UUID NOT NULL REFERENCES public.bagian(id) ON DELETE CASCADE,
    tanggal_closing DATE NOT NULL DEFAULT CURRENT_DATE,
    tanggal_mulai DATE,
    tanggal_selesai DATE,
    saldo_awal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_masuk NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_keluar NUMERIC(15, 2) NOT NULL DEFAULT 0,
    saldo_akhir NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_transaksi INTEGER NOT NULL DEFAULT 0,
    catatan TEXT,
    status TEXT NOT NULL DEFAULT 'closed' CHECK (status IN ('closed', 'reopened')),
    dibuat_oleh UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tambah kolom closing_id pada catatan_keuangan
ALTER TABLE public.catatan_keuangan
    ADD COLUMN IF NOT EXISTS closing_id UUID REFERENCES public.closing_keuangan(id) ON DELETE SET NULL;

-- 3. Indexes untuk optimasi query
CREATE INDEX IF NOT EXISTS idx_catatan_keuangan_closing_id
    ON public.catatan_keuangan(closing_id);

CREATE INDEX IF NOT EXISTS idx_closing_keuangan_bagian_id
    ON public.closing_keuangan(bagian_id);

CREATE INDEX IF NOT EXISTS idx_closing_keuangan_created_at
    ON public.closing_keuangan(created_at DESC);

-- 4. Row Level Security (RLS) pada tabel closing_keuangan
ALTER TABLE public.closing_keuangan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS closing_keuangan_select_policy ON public.closing_keuangan;
CREATE POLICY closing_keuangan_select_policy
    ON public.closing_keuangan
    FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS closing_keuangan_insert_policy ON public.closing_keuangan;
CREATE POLICY closing_keuangan_insert_policy
    ON public.closing_keuangan
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.current_user_role() IN ('admin', 'ketua')
        OR bagian_id = public.current_user_bagian_id()
    );

DROP POLICY IF EXISTS closing_keuangan_update_policy ON public.closing_keuangan;
CREATE POLICY closing_keuangan_update_policy
    ON public.closing_keuangan
    FOR UPDATE
    TO authenticated
    USING (
        public.current_user_role() IN ('admin', 'ketua')
        OR dibuat_oleh = auth.uid()
    )
    WITH CHECK (
        public.current_user_role() IN ('admin', 'ketua')
        OR dibuat_oleh = auth.uid()
    );

DROP POLICY IF EXISTS closing_keuangan_delete_policy ON public.closing_keuangan;
CREATE POLICY closing_keuangan_delete_policy
    ON public.closing_keuangan
    FOR DELETE
    TO authenticated
    USING (
        public.current_user_role() IN ('admin', 'ketua')
    );

-- 5. Tambahkan closing_keuangan ke publikasi realtime jika ada
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.closing_keuangan;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
