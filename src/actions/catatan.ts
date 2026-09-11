'use server';

import { createClient, getProfile } from '@/lib/supabase/server';
import { uploadLampiran } from './storage';
import { revalidatePath } from 'next/cache';
import { getCachedBagianBySlug } from '@/lib/cache/bagian';

const SUPERVISOR_ROLES = new Set(['admin', 'ketua']);

async function getCatatanAccess(bagianSlug: string) {
  const [profile, bagian] = await Promise.all([getProfile(), getCachedBagianBySlug(bagianSlug)]);

  if (!profile) return { error: 'Anda harus login terlebih dahulu.' } as const;
  if (!bagian) return { error: 'Bagian tidak ditemukan.' } as const;

  const canManage = SUPERVISOR_ROLES.has(profile.role) || profile.bagian_id === bagian.id;
  if (!canManage) return { error: 'Catatan hanya dapat dikelola oleh anggota bagian yang bersangkutan.' } as const;

  return { profile, bagian } as const;
}

function revalidateCatatanPaths(bagianSlug: string) {
  revalidatePath(`/bagian/${bagianSlug}`);
  if (bagianSlug === 'bendahara') revalidatePath('/bagian/bendahara');
}

export async function getCatatanList(bagianSlug: string) {
  const access = await getCatatanAccess(bagianSlug);
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
}

export async function createCatatan(formData: FormData, bagianSlug: string) {
  try {
    const judul = (formData.get('judul') as string)?.trim();
    const isi = (formData.get('isi') as string)?.trim();
    const file = formData.get('lampiran') as File | null;

    if (!judul || !isi) return { error: 'Judul dan isi catatan wajib diisi.' };

    const access = await getCatatanAccess(bagianSlug);
    if ('error' in access) return access;

    let lampiran_url: string | null = null;
    if (file && file.size > 0) {
      const uploadRes = await uploadLampiran(file, `catatan/${bagianSlug}`);
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

    revalidateCatatanPaths(bagianSlug);
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan internal.' };
  }
}

export async function updateCatatan(id: string, formData: FormData, bagianSlug: string) {
  try {
    const judul = (formData.get('judul') as string)?.trim();
    const isi = (formData.get('isi') as string)?.trim();
    const file = formData.get('lampiran') as File | null;
    const removeLampiran = formData.get('removeLampiran') === 'true';

    if (!judul || !isi) return { error: 'Judul dan isi catatan wajib diisi.' };

    const access = await getCatatanAccess(bagianSlug);
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
      const uploadRes = await uploadLampiran(file, `catatan/${bagianSlug}`);
      if (uploadRes.error) return { error: uploadRes.error };
      lampiran_url = uploadRes.url || lampiran_url;
    }

    const { error } = await supabase
      .from('catatan')
      .update({ judul, isi, lampiran_url })
      .eq('id', id)
      .eq('bagian_id', access.bagian.id);

    if (error) return { error: error.message };

    revalidateCatatanPaths(bagianSlug);
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan internal.' };
  }
}

export async function deleteCatatan(id: string, bagianSlug: string) {
  try {
    const access = await getCatatanAccess(bagianSlug);
    if ('error' in access) return access;

    const supabase = await createClient();
    const { error } = await supabase
      .from('catatan')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('bagian_id', access.bagian.id)
      .is('deleted_at', null);

    if (error) return { error: error.message };

    revalidateCatatanPaths(bagianSlug);
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan internal.' };
  }
}
