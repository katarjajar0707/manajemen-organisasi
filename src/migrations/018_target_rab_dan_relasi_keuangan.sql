-- 018_target_rab_dan_relasi_keuangan.sql
-- Migration untuk penambahan Target RAB pada Kegiatan dan relasi ke Catatan Keuangan

-- 1. Kolom baru pada kalender_kegiatan
ALTER TABLE public.kalender_kegiatan
  ADD COLUMN IF NOT EXISTS target_rab NUMERIC(15,2) DEFAULT 0 NOT NULL;

-- 2. Kolom baru pada catatan_keuangan
ALTER TABLE public.catatan_keuangan
  ADD COLUMN IF NOT EXISTS kegiatan_id UUID REFERENCES public.kalender_kegiatan(id) ON DELETE SET NULL;

-- 3. Index untuk performa query relasi keuangan ke kegiatan
CREATE INDEX IF NOT EXISTS idx_catatan_keuangan_kegiatan_id
  ON public.catatan_keuangan(kegiatan_id) WHERE deleted_at IS NULL;

-- 4. Trigger agar target_rab tidak bisa diubah oleh role selain admin/ketua
CREATE OR REPLACE FUNCTION public.enforce_target_rab_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin_or_ketua() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.target_rab := 0;
    ELSIF TG_OP = 'UPDATE' THEN
      NEW.target_rab := OLD.target_rab;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_target_rab_role ON public.kalender_kegiatan;
CREATE TRIGGER trg_enforce_target_rab_role
  BEFORE INSERT OR UPDATE ON public.kalender_kegiatan
  FOR EACH ROW EXECUTE FUNCTION public.enforce_target_rab_role();
