'use server';

import { createClient, createAdminClient, getProfile } from '@/lib/supabase/server';
import { deleteLampiranByUrl, uploadLampiran } from './storage';
import { revalidatePath } from 'next/cache';
import { invalidatePublicTransparencyCache } from '@/lib/cache/transparansi';
import { getCachedBagianBySlug } from '@/lib/cache/bagian';

async function getKeuanganReadAccess(bagianSlug: string) {
  if (bagianSlug !== 'bendahara') {
    return { error: 'Modul keuangan ini hanya tersedia untuk bagian Bendahara.' } as const;
  }

  const [profile, bagian] = await Promise.all([getProfile(), getCachedBagianBySlug('bendahara')]);
  if (!profile) return { error: 'Anda harus login terlebih dahulu.' } as const;
  if (!bagian) return { error: 'Bagian Bendahara tidak ditemukan.' } as const;

  return { profile, bagian } as const;
}

async function getKeuanganManageAccess(bagianSlug: string) {
  const access = await getKeuanganReadAccess(bagianSlug);
  if ('error' in access) return access;

  const canManage = access.profile.role === 'admin' || access.profile.role === 'ketua' || access.profile.bagian?.slug === 'bendahara';
  if (!canManage) {
    return { error: 'Hanya admin, ketua, atau anggota bagian Bendahara yang dapat mengubah transaksi.' } as const;
  }

  return access;
}

export interface KegiatanOption {
  id: string;
  judul: string;
  target_rab: number;
  tanggal_mulai: string;
}

export async function getKegiatanOptions(): Promise<KegiatanOption[]> {
  const supabase = await createClient();
  const { data: kegiatans, error } = await supabase
    .from('kalender_kegiatan')
    .select('id, judul, target_rab, tanggal_mulai')
    .order('tanggal_mulai', { ascending: false });

  if (error) {
    console.error('Error fetching kalender_kegiatan for options:', error);
    return [];
  }

  return (kegiatans || []).map((k: any) => ({
    id: k.id,
    judul: k.judul,
    target_rab: Number(k.target_rab) || 0,
    tanggal_mulai: k.tanggal_mulai,
  }));
}

export interface TargetRabKegiatanItem {
  id: string;
  judul: string;
  target_rab: number;
  realisasi: number;
  persentase: number;
  tanggal_mulai: string;
  lokasi: string | null;
  is_estimasi?: boolean;
}

export async function getTargetRabKegiatanList(bagianId?: string | null): Promise<TargetRabKegiatanItem[]> {
  const supabase = await createClient();

  // Ambil semua agenda kegiatan yang memiliki target RAB > 0 (kegiatan organisasi bersifat lintas bagian)
  const { data: kegiatans, error: kError } = await supabase
    .from('kalender_kegiatan')
    .select('id, judul, target_rab, tanggal_mulai, lokasi, bagian_id')
    .gt('target_rab', 0)
    .order('tanggal_mulai', { ascending: false });
  if (kError || !kegiatans || kegiatans.length === 0) {
    if (kError) console.error('Error fetching target rab kegiatan:', kError);
    return [];
  }

  const kegiatanIds = kegiatans.map((k) => k.id);

  let trxQuery = supabase
    .from('catatan_keuangan')
    .select('kegiatan_id, jumlah, keterangan, bagian_id')
    .eq('jenis', 'masuk')
    .is('deleted_at', null);

  if (bagianId) {
    trxQuery = trxQuery.eq('bagian_id', bagianId);
  }

  const { data: trxs, error: tError } = await trxQuery;
  if (tError) {
    console.error('Error fetching realisasi for target rab:', tError);
  }

  const realisasiMap: Record<string, number> = {};
  const hasFallbackMap: Record<string, boolean> = {};

  (trxs || []).forEach((trx: any) => {
    const nominal = Number(trx.jumlah) || 0;
    if (trx.kegiatan_id && kegiatanIds.includes(trx.kegiatan_id)) {
      realisasiMap[trx.kegiatan_id] = (realisasiMap[trx.kegiatan_id] || 0) + nominal;
    } else {
      const match = (trx.keterangan || '').match(/^\[Kategori:\s*([^\]]+)\]/i);
      if (match) {
        const catName = match[1].trim();
        const foundKegiatan = kegiatans.find((k) => {
          const titleMatch = k.judul?.trim().toLowerCase() === catName.toLowerCase();
          if (!titleMatch) return false;
          // Validasi ketat bagian_id agar tidak salah atribusi antar bagian
          if (k.bagian_id && trx.bagian_id && k.bagian_id !== trx.bagian_id) {
            return false;
          }
          return true;
        });

        if (foundKegiatan) {
          realisasiMap[foundKegiatan.id] = (realisasiMap[foundKegiatan.id] || 0) + nominal;
          hasFallbackMap[foundKegiatan.id] = true;
        }
      }
    }
  });

  return kegiatans.map((k: any) => {
    const target = Number(k.target_rab) || 0;
    const realisasi = realisasiMap[k.id] || 0;
    const persentase = target > 0 ? Math.round((realisasi / target) * 100) : 0;

    return {
      id: k.id,
      judul: k.judul,
      target_rab: target,
      realisasi,
      persentase,
      tanggal_mulai: k.tanggal_mulai,
      lokasi: k.lokasi || null,
      is_estimasi: Boolean(hasFallbackMap[k.id]),
    };
  });
}

/**
 * Mengambil daftar kegiatan langsung dari kalender_kegiatan (/kegiatan)
 * sehingga menu bar kategori di /keuangan sinkron 1:1 dengan data kegiatan.
 */
export async function getAgendaCategories(): Promise<string[]> {
  const supabase = await createClient();

  const { data: kegiatans, error } = await supabase.from('kalender_kegiatan').select('judul').order('tanggal_mulai', { ascending: false });

  if (error) {
    console.error('Error fetching kalender_kegiatan for categories:', error);
    return [];
  }

  const list: string[] = [];
  (kegiatans || []).forEach((k) => {
    const judul = k.judul?.trim();
    if (judul && !list.includes(judul)) {
      list.push(judul);
    }
  });

  return list;
}

export async function getKeuanganList(bagianSlug: string = 'bendahara') {
  const access = await getKeuanganReadAccess(bagianSlug);
  if ('error' in access) {
    return { bagianId: null, list: [], saldo: { masuk: 0, keluar: 0, sisa: 0 } };
  }

  const supabase = await createClient();
  const { bagian } = access;

  const { data: list, error } = await supabase
    .from('catatan_keuangan')
    .select(
      `
      *,
      author:profiles!catatan_keuangan_dibuat_oleh_fkey (
        nama,
        role
      )
    `,
    )
    .eq('bagian_id', bagian.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching keuangan:', error);
    return { bagianId: bagian.id, list: [], saldo: { masuk: 0, keluar: 0, sisa: 0 } };
  }

  // Parse kategori and clean keterangan per transaction
  const parsedList = (list || []).map((trx: any) => {
    let kategori = 'Kas General';
    let displayKeterangan = trx.keterangan || '';

    const match = (trx.keterangan || '').match(/^\[Kategori:\s*([^\]]+)\]/i);
    if (match) {
      kategori = match[1].trim();
      displayKeterangan = (trx.keterangan || '').replace(/^\[Kategori:\s*[^\]]+\]\s*/i, '').trim();
    } else if (trx.kategori) {
      kategori = trx.kategori;
    }

    return {
      ...trx,
      kategori,
      displayKeterangan,
    };
  });

  // Calculate aggregations (Semua transaksi terhitung sama masuk ke kas general)
  let totalMasuk = 0;
  let totalKeluar = 0;

  parsedList.forEach((trx) => {
    if (trx.jenis === 'masuk') {
      totalMasuk += Number(trx.jumlah);
    } else if (trx.jenis === 'keluar') {
      totalKeluar += Number(trx.jumlah);
    }
  });

  return {
    bagianId: bagian.id,
    list: parsedList,
    saldo: {
      masuk: totalMasuk,
      keluar: totalKeluar,
      sisa: totalMasuk - totalKeluar,
    },
  };
}

export async function createTransaksi(formData: FormData, bagianSlug: string = 'bendahara') {
  try {
    const access = await getKeuanganManageAccess(bagianSlug);
    if ('error' in access) return access;
    const { profile, bagian } = access;

    const jenis = formData.get('jenis') as 'masuk' | 'keluar';
    const judul = formData.get('judul') as string;
    const keterangan = formData.get('keterangan') as string;
    const kategori = (formData.get('kategori') as string)?.trim() || 'Kas General';
    const jumlahStr = (formData.get('jumlah') as string) || '';
    // Hilangkan titik pemisah ribuan locale ID dan normalisasi
    const cleanedJumlah = jumlahStr
      .replace(/\./g, '')
      .replace(/,/g, '.')
      .replace(/[^0-9.]/g, '');
    const jumlah = parseFloat(cleanedJumlah || '0');
    const file = formData.get('lampiran') as File | null;

    if (!jenis || !judul?.trim() || isNaN(jumlah) || jumlah <= 0) {
      return { error: 'Jenis, judul, dan nominal transaksi yang valid wajib diisi.' };
    }

    if (jenis === 'keluar' && (!file || file.size === 0)) {
      return { error: 'Nota/bukti lampiran WAJIB disertakan untuk transaksi pengeluaran (kas keluar).' };
    }

    const adminSupabase = await createAdminClient();

    let lampiran_url: string | null = null;
    if (file && file.size > 0) {
      const uploadRes = await uploadLampiran(file, `keuangan/${bagianSlug}`);
      if (uploadRes.error) {
        return { error: uploadRes.error };
      }
      lampiran_url = uploadRes.url || null;
    }

    // Format keterangan dengan tag [Kategori: ...] bila bukan Kas General
    let keteranganToSave = keterangan?.trim() || '';
    if (kategori && kategori !== 'Kas General' && kategori !== 'Kas General / Operasional') {
      keteranganToSave = `[Kategori: ${kategori}] ${keteranganToSave}`.trim();
    }

    const kegiatan_id_raw = formData.get('kegiatan_id') as string | null;
    const kegiatan_id = kegiatan_id_raw && kegiatan_id_raw !== 'none' && kegiatan_id_raw.trim() !== '' ? kegiatan_id_raw.trim() : null;

    // Insert menggunakan adminSupabase untuk mencegah kegagalan RLS
    const { error: insertError } = await adminSupabase.from('catatan_keuangan').insert({
      bagian_id: bagian.id,
      jenis,
      judul: judul.trim(),
      keterangan: keteranganToSave || null,
      jumlah,
      lampiran_url,
      dibuat_oleh: profile.id,
      kegiatan_id: kegiatan_id,
    });

    if (insertError) {
      console.error('Error inserting catatan_keuangan:', insertError);
      return { error: insertError.message };
    }

    revalidatePath('/keuangan');
    revalidatePath('/dashboard');
    revalidatePath('/');
    revalidatePath('/laporan-keuangan');
    invalidatePublicTransparencyCache();

    return { success: true };
  } catch (err: unknown) {
    console.error('createTransaksi exception:', err);
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan internal.';
    return { error: message };
  }
}

export async function updateTransaksi(id: string, formData: FormData, bagianSlug: string = 'bendahara') {
  try {
    const access = await getKeuanganManageAccess(bagianSlug);
    if ('error' in access) return access;
    const { bagian } = access;

    const jenis = formData.get('jenis') as 'masuk' | 'keluar';
    const judul = formData.get('judul') as string;
    const keterangan = formData.get('keterangan') as string;
    const kategori = (formData.get('kategori') as string)?.trim() || 'Kas General';
    const jumlahStr = (formData.get('jumlah') as string) || '';
    const cleanedJumlah = jumlahStr
      .replace(/\./g, '')
      .replace(/,/g, '.')
      .replace(/[^0-9.]/g, '');
    const jumlah = parseFloat(cleanedJumlah || '0');
    const file = formData.get('lampiran') as File | null;

    if (!['masuk', 'keluar'].includes(jenis) || !judul?.trim() || isNaN(jumlah) || jumlah <= 0) {
      return { error: 'Jenis, judul, dan nominal transaksi yang valid wajib diisi.' };
    }

    const adminSupabase = await createAdminClient();
    const { data: existing, error: findError } = await adminSupabase.from('catatan_keuangan').select('id, dibuat_oleh, bagian_id, lampiran_url').eq('id', id).is('deleted_at', null).single();

    if (findError || !existing) {
      return { error: 'Transaksi tidak ditemukan.' };
    }

    if (existing.bagian_id !== bagian.id) {
      return { error: 'Anda tidak memiliki izin untuk mengubah transaksi ini.' };
    }

    if (jenis === 'keluar' && !existing.lampiran_url && (!file || file.size === 0)) {
      return { error: 'Nota/bukti lampiran wajib disertakan untuk transaksi pengeluaran.' };
    }

    if (file && file.size > 10 * 1024 * 1024) {
      return { error: 'Ukuran berkas lampiran tidak boleh melebihi 10 MB.' };
    }

    let lampiran_url = existing.lampiran_url;
    if (file && file.size > 0) {
      const uploadRes = await uploadLampiran(file, `keuangan/${bagianSlug}`);
      if (uploadRes.error) {
        return { error: uploadRes.error };
      }
      lampiran_url = uploadRes.url || lampiran_url;
    }

    let keteranganToSave = keterangan?.trim() || '';
    if (kategori && kategori !== 'Kas General' && kategori !== 'Kas General / Operasional') {
      keteranganToSave = `[Kategori: ${kategori}] ${keteranganToSave}`.trim();
    }

    const kegiatan_id_raw = formData.get('kegiatan_id') as string | null;
    const kegiatan_id = kegiatan_id_raw && kegiatan_id_raw !== 'none' && kegiatan_id_raw.trim() !== '' ? kegiatan_id_raw.trim() : null;

    const { error: updateError } = await adminSupabase
      .from('catatan_keuangan')
      .update({
        jenis,
        judul: judul.trim(),
        keterangan: keteranganToSave || null,
        jumlah,
        lampiran_url,
        kegiatan_id: kegiatan_id,
      })
      .eq('id', id);

    if (updateError) {
      return { error: updateError.message };
    }

    if (file && file.size > 0 && existing.lampiran_url && existing.lampiran_url !== lampiran_url) {
      const deleteResult = await deleteLampiranByUrl(existing.lampiran_url);
      if (deleteResult.error) {
        console.warn('Lampiran lama tidak berhasil dihapus:', deleteResult.error);
      }
    }

    revalidatePath('/keuangan');
    revalidatePath('/dashboard');
    revalidatePath('/');
    revalidatePath('/laporan-keuangan');
    invalidatePublicTransparencyCache();

    return { success: true };
  } catch (err: unknown) {
    console.error('updateTransaksi exception:', err);
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan internal.';
    return { error: message };
  }
}

export async function deleteTransaksi(id: string, bagianSlug: string = 'bendahara') {
  try {
    const access = await getKeuanganManageAccess(bagianSlug);
    if ('error' in access) return access;
    const { bagian } = access;

    const adminSupabase = await createAdminClient();

    // Check existing transaction
    const { data: existing, error: findError } = await adminSupabase.from('catatan_keuangan').select('id, dibuat_oleh, bagian_id').eq('id', id).single();

    if (findError || !existing) {
      return { error: 'Transaksi tidak ditemukan.' };
    }

    if (existing.bagian_id !== bagian.id) {
      return { error: 'Anda tidak memiliki izin untuk menghapus transaksi ini.' };
    }

    // Soft delete
    const { error } = await adminSupabase.from('catatan_keuangan').update({ deleted_at: new Date().toISOString() }).eq('id', id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/keuangan');
    revalidatePath('/dashboard');
    revalidatePath('/');
    revalidatePath('/laporan-keuangan');
    invalidatePublicTransparencyCache();

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan internal.';
    return { error: message };
  }
}
