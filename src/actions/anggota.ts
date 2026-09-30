'use server';

import { createClient, getProfile } from '@/lib/supabase/server';
import { uploadLampiran } from './storage';
import { revalidatePath } from 'next/cache';
import { invalidatePublicTransparencyCache } from '@/lib/cache/transparansi';
import { syncProfilesToAnggota } from '@/lib/sync-anggota';
import { getCachedBagianOptions } from '@/lib/cache/bagian';

export interface AnggotaDetail {
  id: string;
  nama: string;
  jabatan: string;
  bagian: string;
  bagianId: string | null;
  rt_rw: string;
  kontak: string;
  nomor_wa: string;
  status: 'Aktif' | 'Alumni' | 'Cuti';
  foto_url: string | null;
  periode: string;
  periodeId: string | null;
  agendaId: string | null;
  agendaNama: string;
  tanggalBergabung: string;
  createdAt: string;
}

interface RawBagianRel {
  id: string;
  nama: string;
  slug?: string;
}

interface RawAgendaRel {
  id: string;
  nama_agenda: string;
  bagian?: RawBagianRel | RawBagianRel[] | null;
}

interface RawPeriodeRel {
  id: string;
  nama_periode: string;
  is_aktif?: boolean;
  agenda?: RawAgendaRel | RawAgendaRel[] | null;
}

interface RawAnggotaItem {
  id: string;
  nama: string;
  jabatan: string;
  rt_rw: string;
  kontak: string;
  status?: string | null;
  foto_url: string | null;
  periode_id: string | null;
  created_at: string;
  bagian?: RawBagianRel | RawBagianRel[] | null;
  periode?: RawPeriodeRel | RawPeriodeRel[] | null;
}

/**
 * Mengambil daftar seluruh anggota organisasi dari database.
 * Terbuka untuk semua pengguna.
 */
export async function getAnggotaList(filters?: { search?: string; rt_rw?: string; status?: string; bagianId?: string; periodeId?: string }): Promise<AnggotaDetail[]> {
  // Sinkronisasi pemeliharaan tidak boleh memblokir pembacaan daftar anggota.
  void syncProfilesToAnggota().catch((error) => {
    console.warn('Peringatan sinkronisasi profiles ke anggota:', error);
  });

  const supabase = await createClient();

  let query = supabase
    .from('anggota')
    .select(
      `
      *,
      bagian:bagian!bagian_id (
        id,
        nama,
        slug
      ),
      periode:periode_kepengurusan!periode_id (
        id,
        nama_periode,
        agenda:agenda_organisasi!agenda_organisasi_id (
          id,
          nama_agenda,
          bagian:bagian!bagian_id (
            id,
            nama,
            slug
          )
        )
      )
    `,
    )
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'semua') {
    query = query.eq('status', filters.status);
  }

  if (filters?.periodeId) {
    query = query.eq('periode_id', filters.periodeId);
  }

  if (filters?.bagianId && filters.bagianId !== 'semua') {
    query = query.eq('bagian_id', filters.bagianId);
  }

  const [{ data, error }, { data: profileAvatars }] = await Promise.all([query, supabase.from('profiles').select('id, foto_url, nomor_wa')]);

  if (error) {
    console.error('Error fetching anggota:', error);
    return [];
  }

  if (!data) return [];

  // Ambil foto profil dari tabel profiles untuk fallback sinkronisasi
  const avatarMap = new Map<string, string>();
  const whatsappMap = new Map<string, string>();
  if (profileAvatars) {
    for (const p of profileAvatars) {
      if (p.foto_url) avatarMap.set(p.id, p.foto_url);
      if (p.nomor_wa) whatsappMap.set(p.id, p.nomor_wa);
    }
  }

  return (data as unknown as RawAnggotaItem[]).map((m) => {
    const directBagian = Array.isArray(m.bagian) ? m.bagian[0] : m.bagian;
    const periodeObj = Array.isArray(m.periode) ? m.periode[0] : m.periode;
    const agendaObj = periodeObj ? (Array.isArray(periodeObj.agenda) ? periodeObj.agenda[0] : periodeObj.agenda) : null;
    const agendaBagian = agendaObj ? (Array.isArray(agendaObj.bagian) ? agendaObj.bagian[0] : agendaObj.bagian) : null;

    const finalBagianNama = directBagian?.nama || agendaBagian?.nama || 'Umum';
    const finalBagianId = directBagian?.id || agendaBagian?.id || null;

    const formattedDate = new Date(m.created_at).toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });

    return {
      id: m.id,
      nama: m.nama,
      jabatan: m.jabatan,
      bagian: finalBagianNama,
      bagianId: finalBagianId,
      rt_rw: m.rt_rw,
      kontak: m.kontak,
      nomor_wa: whatsappMap.get(m.id) || '',
      status: (m.status as 'Aktif' | 'Alumni' | 'Cuti') || 'Aktif',
      foto_url: m.foto_url || avatarMap.get(m.id) || null,
      periode: periodeObj ? periodeObj.nama_periode : 'Anggota Umum',
      periodeId: m.periode_id || null,
      agendaId: agendaObj ? agendaObj.id : null,
      agendaNama: agendaObj ? agendaObj.nama_agenda : '-',
      tanggalBergabung: formattedDate,
      createdAt: m.created_at,
    };
  });
}

/**
 * Mengambil metadata untuk form tambah/edit anggota (daftar bagian dan periode kepengurusan aktif).
 */
export async function getAnggotaFormMeta() {
  const supabase = await createClient();

  const [bagianRes, periodeRes] = await Promise.all([
    getCachedBagianOptions(),
    supabase
      .from('periode_kepengurusan')
      .select(
        `
        id,
        nama_periode,
        is_aktif,
        agenda:agenda_organisasi!agenda_organisasi_id (
          id,
          nama_agenda,
          bagian:bagian!bagian_id (
            id,
            nama
          )
        )
      `,
      )
      .order('created_at', { ascending: false }),
  ]);

  return {
    daftarBagian: bagianRes,
    daftarPeriode: ((periodeRes.data || []) as unknown as RawPeriodeRel[]).map((p) => {
      const agenda = Array.isArray(p.agenda) ? p.agenda[0] : p.agenda;
      const bagian = agenda ? (Array.isArray(agenda.bagian) ? agenda.bagian[0] : agenda.bagian) : null;
      return {
        id: p.id,
        nama: `${agenda ? agenda.nama_agenda : 'Agenda'} - ${p.nama_periode} ${p.is_aktif ? '(Aktif)' : ''}`,
        isAktif: Boolean(p.is_aktif),
        bagianId: bagian?.id || null,
      };
    }),
  };
}

/**
 * Menambah anggota baru. Khusus role 'admin' atau 'ketua' (atau user terotentikasi).
 */
export async function createAnggota(formData: FormData) {
  try {
    const profile = await getProfile();
    if (!profile) return { error: 'Silakan login terlebih dahulu.' };
    if (profile.role !== 'admin' && profile.role !== 'ketua') {
      return { error: 'Hanya role Ketua atau Admin yang berhak menambahkan data anggota.' };
    }

    const nama = formData.get('nama') as string;
    const kontak = formData.get('kontak') as string;
    const rt_rw = formData.get('rt_rw') as string;
    const jabatan = formData.get('jabatan') as string;
    const bagian_id = (formData.get('bagian_id') as string) || null;
    const periode_id = (formData.get('periode_id') as string) || null;
    const status = (formData.get('status') as string) || 'Aktif';
    const foto = formData.get('foto') as File | null;

    if (!nama || !kontak || !rt_rw || !jabatan) {
      return { error: 'Nama, kontak, RT/RW, dan jabatan wajib diisi.' };
    }

    let foto_url: string | null = null;
    if (foto && foto.size > 0) {
      const uploadRes = await uploadLampiran(foto, 'anggota');
      if (uploadRes.error) {
        return { error: uploadRes.error };
      }
      foto_url = uploadRes.url || null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('anggota')
      .insert({
        nama: nama.trim(),
        kontak: kontak.trim(),
        rt_rw: rt_rw.trim(),
        jabatan: jabatan.trim(),
        bagian_id: bagian_id || null,
        periode_id: periode_id || null,
        status,
        foto_url,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/anggota');
    revalidatePath('/struktur');
    revalidatePath('/dashboard');
    revalidatePath('/');
    invalidatePublicTransparencyCache();
    return { success: true, anggota: data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
    return { error: message };
  }
}

/**
 * Memperbarui data anggota.
 */
export async function updateAnggota(id: string, formData: FormData) {
  try {
    const profile = await getProfile();
    if (!profile) return { error: 'Silakan login terlebih dahulu.' };
    if (profile.role !== 'admin' && profile.role !== 'ketua') {
      return { error: 'Hanya role Ketua atau Admin yang berhak memperbarui data anggota.' };
    }

    const nama = formData.get('nama') as string;
    const kontak = formData.get('kontak') as string;
    const rt_rw = formData.get('rt_rw') as string;
    const jabatan = formData.get('jabatan') as string;
    const bagian_id = (formData.get('bagian_id') as string) || null;
    const periode_id = (formData.get('periode_id') as string) || null;
    const status = (formData.get('status') as string) || 'Aktif';
    const foto = formData.get('foto') as File | null;
    const removeFoto = formData.get('removeFoto') === 'true';

    if (!nama || !kontak || !rt_rw || !jabatan) {
      return { error: 'Nama, kontak, RT/RW, dan jabatan wajib diisi.' };
    }

    const updatePayload: Record<string, unknown> = {
      nama: nama.trim(),
      kontak: kontak.trim(),
      rt_rw: rt_rw.trim(),
      jabatan: jabatan.trim(),
      bagian_id: bagian_id || null,
      periode_id: periode_id || null,
      status,
    };

    if (removeFoto) {
      updatePayload.foto_url = null;
    } else if (foto && foto.size > 0) {
      const uploadRes = await uploadLampiran(foto, 'anggota');
      if (uploadRes.error) {
        return { error: uploadRes.error };
      }
      updatePayload.foto_url = uploadRes.url;
    }

    const supabase = await createClient();
    const { error } = await supabase.from('anggota').update(updatePayload).eq('id', id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/anggota');
    revalidatePath('/struktur');
    revalidatePath('/dashboard');
    revalidatePath('/');
    invalidatePublicTransparencyCache();
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
    return { error: message };
  }
}

/**
 * Menghapus data anggota.
 */
export async function deleteAnggota(id: string) {
  try {
    const profile = await getProfile();
    if (!profile) return { error: 'Silakan login terlebih dahulu.' };
    if (profile.role !== 'admin' && profile.role !== 'ketua') {
      return { error: 'Hanya role Ketua atau Admin yang berhak menghapus data anggota.' };
    }

    const supabase = await createClient();
    const { error } = await supabase.from('anggota').delete().eq('id', id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/anggota');
    revalidatePath('/struktur');
    revalidatePath('/dashboard');
    revalidatePath('/');
    invalidatePublicTransparencyCache();
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
    return { error: message };
  }
}
