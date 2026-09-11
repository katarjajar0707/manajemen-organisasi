'use server';

import { createClient, getProfile } from '@/lib/supabase/server';
import { uploadLampiran } from './storage';
import { revalidatePath } from 'next/cache';

async function getCatatanAccess() {
  const profile = await getProfile();

  if (!profile) return { error: 'Anda harus login terlebih dahulu.' } as const;
  if (!profile.bagian) return { error: 'Akun Anda belum terhubung ke bagian organisasi.' } as const;

  return { profile, bagian: profile.bagian } as const;
}

function revalidateCatatanPaths() {
  revalidatePath('/catatan');
}

export async function getCatatanList() {
  try {
    const access = await getCatatanAccess();
    if ('error' in access) return [];

    const supabase = await createClient();
    const { data: catatanList, error } = await supabase
      .from('catatan')
      .select(
        `
        *,
        author:profiles!catatan_dibuat_oleh_fkey (
          nama,
          role
        )
      `,
      )
      .eq('bagian_id', access.bagian.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching catatan:', error);
      return [];
    }

    return catatanList || [];
  } catch (error) {
    // A data-source outage must not turn the entire protected route into a
    // React Server Component error. The manager can safely render its empty
    // state and data will return on the next request.
    console.error('Unexpected error fetching catatan:', error);
    return [];
  }
}

export async function createCatatan(formData: FormData) {
  try {
    const judul = (formData.get('judul') as string)?.trim();
    const isi = (formData.get('isi') as string)?.trim();
    const file = formData.get('lampiran') as File | null;

    if (!judul || !isi) return { error: 'Judul dan isi catatan wajib diisi.' };

    const access = await getCatatanAccess();
    if ('error' in access) return access;

    let lampiran_url: string | null = null;
    if (file && file.size > 0) {
      const uploadRes = await uploadLampiran(file, `catatan/${access.bagian.slug}`);
      if (uploadRes.error) return { error: uploadRes.error };
      lampiran_url = uploadRes.url || null;
    }

    const supabase = await createClient();
    const { error } = await supabase.from('catatan').insert({
      bagian_id: access.bagian.id,
      judul,
      isi,
      lampiran_url,
      dibuat_oleh: access.profile.id,
    });

    if (error) return { error: error.message };

    revalidateCatatanPaths();
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan internal.' };
  }
}

export async function updateCatatan(id: string, formData: FormData) {
  try {
    const judul = (formData.get('judul') as string)?.trim();
    const isi = (formData.get('isi') as string)?.trim();
    const file = formData.get('lampiran') as File | null;
    const removeLampiran = formData.get('removeLampiran') === 'true';

    if (!judul || !isi) return { error: 'Judul dan isi catatan wajib diisi.' };

    const access = await getCatatanAccess();
    if ('error' in access) return access;

    const supabase = await createClient();
    const { data: existingCatatan, error: findError } = await supabase
      .from('catatan')
      .select('id, bagian_id, lampiran_url')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (findError || !existingCatatan || existingCatatan.bagian_id !== access.bagian.id) {
      return { error: 'Catatan tidak ditemukan pada bagian ini.' };
    }

    let lampiran_url = existingCatatan.lampiran_url;
    if (removeLampiran) {
      lampiran_url = null;
    } else if (file && file.size > 0) {
      const uploadRes = await uploadLampiran(file, `catatan/${access.bagian.slug}`);
      if (uploadRes.error) return { error: uploadRes.error };
      lampiran_url = uploadRes.url || lampiran_url;
    }

    const { error } = await supabase
      .from('catatan')
      .update({ judul, isi, lampiran_url })
      .eq('id', id)
      .eq('bagian_id', access.bagian.id);

    if (error) return { error: error.message };

    revalidateCatatanPaths();
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan internal.' };
  }
}

export async function deleteCatatan(id: string) {
  try {
    const access = await getCatatanAccess();
    if ('error' in access) return access;

    const supabase = await createClient();
    const { error } = await supabase
      .from('catatan')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('bagian_id', access.bagian.id)
      .is('deleted_at', null);

    if (error) return { error: error.message };

    revalidateCatatanPaths();
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan internal.' };
  }
}
