-- Enable realtime delivery for public aspiration submissions.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'diskusi'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.diskusi;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'catatan_keuangan'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.catatan_keuangan;
  END IF;
END
$$;