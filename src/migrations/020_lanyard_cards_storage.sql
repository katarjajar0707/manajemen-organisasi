-- Kartu lanyard yang tampil publik, tetapi hanya dapat dikelola pemilik foldernya.
-- Jalankan melalui Supabase SQL Editor / migration runner, bukan dengan mengubah
-- tabel storage.objects secara langsung.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lanyard-cards',
  'lanyard-cards',
  true,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "lanyard cards owner select" ON storage.objects;
DROP POLICY IF EXISTS "lanyard cards owner insert" ON storage.objects;
DROP POLICY IF EXISTS "lanyard cards owner update" ON storage.objects;
DROP POLICY IF EXISTS "lanyard cards owner delete" ON storage.objects;

-- SELECT is also required by Storage when using upload(..., { upsert: true }).
CREATE POLICY "lanyard cards owner select"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'lanyard-cards'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
    AND storage.filename(name) = 'front.png'
  );

CREATE POLICY "lanyard cards owner insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'lanyard-cards'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
    AND storage.filename(name) = 'front.png'
    AND storage.extension(name) = 'png'
  );

CREATE POLICY "lanyard cards owner update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'lanyard-cards'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
    AND storage.filename(name) = 'front.png'
  )
  WITH CHECK (
    bucket_id = 'lanyard-cards'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
    AND storage.filename(name) = 'front.png'
    AND storage.extension(name) = 'png'
  );

CREATE POLICY "lanyard cards owner delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'lanyard-cards'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
    AND storage.filename(name) = 'front.png'
  );
