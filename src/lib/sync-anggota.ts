import { createAdminClient } from '@/lib/supabase/server';

/**
 * Membuat atau memperbarui baris anggota untuk setiap profil pengguna.
 * Anggota manual yang tidak memiliki profil tetap dipertahankan.
 */
export async function syncProfilesToAnggota() {
  const supabase = await createAdminClient();

  const [{ data: profiles, error: profilesError }, { data: periode }] = await Promise.all([
    supabase.from('profiles').select('id, nama, role, bagian_id, foto_url'),
    supabase.from('periode_kepengurusan').select('id').eq('is_aktif', true).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  if (profilesError) throw profilesError;
  if (!profiles?.length || !periode?.id) return;

  const { data: existingAnggota, error: anggotaError } = await supabase.from('anggota').select('id, kontak, rt_rw, periode_id');
  if (anggotaError) throw anggotaError;

  const existingMap = new Map((existingAnggota || []).map((anggota) => [anggota.id, anggota]));

  for (const profile of profiles) {
    const existing = existingMap.get(profile.id);
    const payload = {
      id: profile.id,
      nama: profile.nama || 'Pengurus',
      kontak: existing?.kontak || '-',
      rt_rw: existing?.rt_rw || 'RT 01 / RW 05',
      jabatan: profile.role === 'ketua' ? 'Ketua' : profile.role === 'admin' ? 'Administrator' : 'Anggota',
      periode_id: existing?.periode_id || periode.id,
      bagian_id: profile.bagian_id || null,
      status: 'Aktif',
      ...(profile.foto_url ? { foto_url: profile.foto_url } : {}),
    };

    const { error } = await supabase.from('anggota').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  }
}
