-- Keep the avatar URL synchronized between profiles and its mirrored anggota row.
-- The application sync uses the same UUID for both rows.

UPDATE public.anggota AS anggota
SET foto_url = profiles.foto_url
FROM public.profiles AS profiles
WHERE anggota.id = profiles.id
  AND anggota.foto_url IS DISTINCT FROM profiles.foto_url;

CREATE OR REPLACE FUNCTION public.sync_profile_avatar_to_anggota()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.anggota
  SET foto_url = NEW.foto_url
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_avatar_sync ON public.profiles;

CREATE TRIGGER profiles_avatar_sync
AFTER UPDATE OF foto_url ON public.profiles
FOR EACH ROW
WHEN (OLD.foto_url IS DISTINCT FROM NEW.foto_url)
EXECUTE FUNCTION public.sync_profile_avatar_to_anggota();
