'use server';

import { createClient, createAdminClient, getProfile } from '@/lib/supabase/server';
import { deleteLampiranByUrl, uploadLampiran } from './storage';
import { revalidatePath } from 'next/cache';
import { invalidatePublicTransparencyCache } from '@/lib/cache/transparansi';
import { getCachedBagianBySlug } from '@/lib/cache/bagian';
import { type BendaharaSaldo, type ClosingKeuangan, type ClosingPreviewData, type Transaksi, normalizeTransaction } from '@/constants/keuangan';

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

export async function getKeuanganSaldoAgregat(bagianId: string): Promise<BendaharaSaldo> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('catatan_keuangan')
    .select('jenis, jumlah, closing_id')
    .eq('bagian_id', bagianId)
    .is('deleted_at', null);

  if (error || !data) {
    if (error) console.error('Error fetching aggregate saldo:', error);
    return { masuk: 0, keluar: 0, sisa: 0, masukAktif: 0, keluarAktif: 0, sisaAktif: 0 };
  }

  let totalMasuk = 0;
  let totalKeluar = 0;
  let masukAktif = 0;
  let keluarAktif = 0;

  data.forEach((row: { jenis: string; jumlah: number | string; closing_id?: string | null }) => {
    const val = Number(row.jumlah) || 0;
    if (row.jenis === 'masuk') {
      totalMasuk += val;
      if (!row.closing_id) masukAktif += val;
    } else if (row.jenis === 'keluar') {
      totalKeluar += val;
      if (!row.closing_id) keluarAktif += val;
    }
  });

  return {
    masuk: totalMasuk,
    keluar: totalKeluar,
    sisa: totalMasuk - totalKeluar,
    masukAktif,
    keluarAktif,
    sisaAktif: masukAktif - keluarAktif,
  };
}

export async function getKeuanganList(bagianSlug: string = 'bendahara') {
  const access = await getKeuanganReadAccess(bagianSlug);
  if ('error' in access) {
    return { bagianId: null, list: [], saldo: { masuk: 0, keluar: 0, sisa: 0 }, error: access.error };
  }

  const supabase = await createClient();
  const { bagian } = access;

  const [listRes, aggregateSaldo] = await Promise.all([
    supabase
      .from('catatan_keuangan')
      .select(
        `
        id,
        judul,
        keterangan,
        jenis,
        jumlah,
        tanggal,
        created_at,
        lampiran_url,
        kegiatan_id,
        bagian_id,
        closing_id,
        dibuat_oleh,
        author:profiles!catatan_keuangan_dibuat_oleh_fkey (
          nama,
          role
        )
      `,
      )
      .eq('bagian_id', bagian.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(200),
    getKeuanganSaldoAgregat(bagian.id),
  ]);

  if (listRes.error) {
    console.error(
      'Error fetching keuangan list:',
      'message:', listRes.error.message,
      '| code:', listRes.error.code,
      '| details:', listRes.error.details,
      '| hint:', listRes.error.hint,
    );
    return { bagianId: bagian.id, list: [], saldo: aggregateSaldo, error: listRes.error.message };
  }

  // Ambil metadata closing untuk transaksi yang sudah di-closing
  const rawData = listRes.data || [];
  const closingIds = Array.from(new Set(rawData.map((trx: any) => trx.closing_id).filter(Boolean)));
  const closingMap = new Map<string, { id: string; nomor_closing: string; judul: string }>();

  if (closingIds.length > 0) {
    const { data: closings } = await supabase
      .from('closing_keuangan')
      .select('id, nomor_closing, judul')
      .in('id', closingIds);
    (closings || []).forEach((c: any) => closingMap.set(c.id, c));
  }

  // Parse kategori and clean keterangan per transaction
  const parsedList = rawData.map((trx: any) => {
    let kategori = 'Kas General';
    let displayKeterangan = trx.keterangan || '';

    const match = (trx.keterangan || '').match(/^\[Kategori:\s*([^\]]+)\]/i);
    if (match) {
      kategori = match[1].trim();
      displayKeterangan = (trx.keterangan || '').replace(/^\[Kategori:\s*[^\]]+\]\s*/i, '').trim();
    }

    const closing = trx.closing_id ? closingMap.get(trx.closing_id) || null : null;

    return {
      ...trx,
      kategori,
      displayKeterangan,
      closing,
    };
  });

  return {
    bagianId: bagian.id,
    list: parsedList,
    saldo: aggregateSaldo,
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
    const { data: existing, error: findError } = await adminSupabase
      .from('catatan_keuangan')
      .select('id, dibuat_oleh, bagian_id, lampiran_url, closing_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (findError || !existing) {
      return { error: 'Transaksi tidak ditemukan.' };
    }

    if (existing.bagian_id !== bagian.id) {
      return { error: 'Anda tidak memiliki izin untuk mengubah transaksi ini.' };
    }

    // Proteksi audit closing: hanya role Admin yang boleh mengedit transaksi yang sudah di-closing
    if (existing.closing_id) {
      const userRole = (access.profile?.role || '').toLowerCase().trim();
      if (userRole !== 'admin') {
        return { error: 'Transaksi ini telah ter-closing (tutup buku). Hanya role Admin yang dapat mengedit transaksi ini.' };
      }
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

    // Jika transaksi yang diedit terikat pada closing, sinkronkan rekap closing
    if (existing.closing_id) {
      await syncClosingSummary(existing.closing_id, adminSupabase);
    }

    try {
      revalidatePath('/keuangan');
      revalidatePath('/dashboard');
      invalidatePublicTransparencyCache();
    } catch (revalidateErr) {
      console.warn('Revalidation warning in updateTransaksi:', revalidateErr);
    }

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
    const { data: existing, error: findError } = await adminSupabase
      .from('catatan_keuangan')
      .select('id, dibuat_oleh, bagian_id, closing_id')
      .eq('id', id)
      .single();

    if (findError || !existing) {
      return { error: 'Transaksi tidak ditemukan.' };
    }

    if (existing.bagian_id !== bagian.id) {
      return { error: 'Anda tidak memiliki izin untuk menghapus transaksi ini.' };
    }

    // Proteksi audit closing: anggota dan ketua tidak bisa menghapus transaksi yang sudah di-closing
    if (existing.closing_id) {
      const userRole = (access.profile?.role || '').toLowerCase().trim();
      if (userRole !== 'admin') {
        return { error: 'Transaksi ini telah ter-closing (tutup buku) dan tidak dapat dihapus oleh Anggota maupun Ketua.' };
      }
    }

    // Soft delete
    const { error } = await adminSupabase.from('catatan_keuangan').update({ deleted_at: new Date().toISOString() }).eq('id', id);

    if (error) {
      return { error: error.message };
    }

    // Jika transaksi yang dihapus terikat pada closing, sinkronkan rekap closing
    if (existing.closing_id) {
      await syncClosingSummary(existing.closing_id, adminSupabase);
    }

    try {
      revalidatePath('/keuangan');
      revalidatePath('/dashboard');
      invalidatePublicTransparencyCache();
    } catch (revalidateErr) {
      console.warn('Revalidation warning in deleteTransaksi:', revalidateErr);
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan internal.';
    return { error: message };
  }
}

/**
 * Helper untuk menyelaraskan ringkasan total pada closing jika admin mengubah/menghapus transaksi di dalamnya
 */
async function syncClosingSummary(closingId: string, adminSupabase: any) {
  try {
    const { data: trxList } = await adminSupabase
      .from('catatan_keuangan')
      .select('jenis, jumlah')
      .eq('closing_id', closingId)
      .is('deleted_at', null);

    let total_masuk = 0;
    let total_keluar = 0;
    (trxList || []).forEach((t: any) => {
      const amt = Number(t.jumlah) || 0;
      if (t.jenis === 'masuk') total_masuk += amt;
      else if (t.jenis === 'keluar') total_keluar += amt;
    });

    const { data: closing } = await adminSupabase
      .from('closing_keuangan')
      .select('saldo_awal')
      .eq('id', closingId)
      .single();

    const saldo_awal = Number(closing?.saldo_awal) || 0;
    const saldo_akhir = saldo_awal + total_masuk - total_keluar;

    await adminSupabase
      .from('closing_keuangan')
      .update({
        total_masuk,
        total_keluar,
        saldo_akhir,
        total_transaksi: (trxList || []).length,
      })
      .eq('id', closingId);
  } catch (syncErr) {
    console.error('Error syncing closing summary:', syncErr);
  }
}

/**
 * Mengambil daftar riwayat closing keuangan
 */
export async function getClosingKeuanganList(bagianSlug: string = 'bendahara'): Promise<ClosingKeuangan[]> {
  const access = await getKeuanganReadAccess(bagianSlug);
  if ('error' in access) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('closing_keuangan')
    .select(`
      id,
      nomor_closing,
      judul,
      bagian_id,
      tanggal_closing,
      tanggal_mulai,
      tanggal_selesai,
      saldo_awal,
      total_masuk,
      total_keluar,
      saldo_akhir,
      total_transaksi,
      catatan,
      status,
      dibuat_oleh,
      created_at,
      author:profiles!closing_keuangan_dibuat_oleh_fkey (
        nama,
        role
      )
    `)
    .eq('bagian_id', access.bagian.id)
    .eq('status', 'closed')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching closing_keuangan list:', error);
    return [];
  }

  return (data || []).map((c: any) => ({
    ...c,
    saldo_awal: Number(c.saldo_awal) || 0,
    total_masuk: Number(c.total_masuk) || 0,
    total_keluar: Number(c.total_keluar) || 0,
    saldo_akhir: Number(c.saldo_akhir) || 0,
    total_transaksi: Number(c.total_transaksi) || 0,
    author: Array.isArray(c.author) ? c.author[0] : c.author,
  }));
}

/**
 * Menghitung pratinjau kalkulasi transaksi yang akan di-closing
 */
export async function getClosingPreview(
  bagianSlug: string = 'bendahara',
  cutOffDate?: string,
): Promise<ClosingPreviewData & { error?: string }> {
  const access = await getKeuanganReadAccess(bagianSlug);
  if ('error' in access) {
    return {
      saldo_awal: 0,
      total_masuk: 0,
      total_keluar: 0,
      saldo_akhir: 0,
      total_transaksi: 0,
      tanggal_mulai: null,
      tanggal_selesai: null,
      transaksi_list: [],
      error: access.error,
    };
  }

  const supabase = await createClient();
  const bagianId = access.bagian.id;

  // 1. Ambil closing terakhir untuk menentukan saldo awal
  const { data: lastClosing } = await supabase
    .from('closing_keuangan')
    .select('id, saldo_akhir, tanggal_closing, tanggal_selesai')
    .eq('bagian_id', bagianId)
    .eq('status', 'closed')
    .order('tanggal_closing', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const saldo_awal = Number(lastClosing?.saldo_akhir) || 0;

  // 2. Query transaksi yang belum closing (closing_id IS NULL)
  let query = supabase
    .from('catatan_keuangan')
    .select(`
      id,
      judul,
      keterangan,
      jenis,
      jumlah,
      tanggal,
      created_at,
      lampiran_url,
      kegiatan_id,
      bagian_id,
      closing_id,
      dibuat_oleh,
      author:profiles!catatan_keuangan_dibuat_oleh_fkey (
        nama,
        role
      )
    `)
    .eq('bagian_id', bagianId)
    .is('deleted_at', null)
    .is('closing_id', null)
    .order('tanggal', { ascending: true })
    .order('created_at', { ascending: true });

  if (cutOffDate) {
    query = query.lte('tanggal', cutOffDate);
  }

  const { data: rawList, error } = await query;
  if (error) {
    console.error('Error fetching unclosed transactions for preview:', error);
    return {
      saldo_awal,
      total_masuk: 0,
      total_keluar: 0,
      saldo_akhir: saldo_awal,
      total_transaksi: 0,
      tanggal_mulai: null,
      tanggal_selesai: null,
      transaksi_list: [],
      error: error.message,
    };
  }

  const normalizedList = (rawList || []).map((t: any) => normalizeTransaction(t));

  let total_masuk = 0;
  let total_keluar = 0;
  let minDate: string | null = null;
  let maxDate: string | null = null;

  normalizedList.forEach((t) => {
    const amt = Number(t.jumlah) || 0;
    if (t.jenis === 'masuk') total_masuk += amt;
    else if (t.jenis === 'keluar') total_keluar += amt;

    const tgl = (t.tanggal || t.created_at || '').slice(0, 10);
    if (tgl) {
      if (!minDate || tgl < minDate) minDate = tgl;
      if (!maxDate || tgl > maxDate) maxDate = tgl;
    }
  });

  const saldo_akhir = saldo_awal + total_masuk - total_keluar;

  return {
    saldo_awal,
    total_masuk,
    total_keluar,
    saldo_akhir,
    total_transaksi: normalizedList.length,
    tanggal_mulai: minDate || lastClosing?.tanggal_selesai || null,
    tanggal_selesai: cutOffDate || maxDate || new Date().toISOString().slice(0, 10),
    transaksi_list: normalizedList,
  };
}

/**
 * Menjalankan penutupan buku kas (closing) dan mengunci transaksi terkait
 */
export async function executeClosingKeuangan(formData: FormData, bagianSlug: string = 'bendahara') {
  try {
    const access = await getKeuanganManageAccess(bagianSlug);
    if ('error' in access) return access;
    const { profile, bagian } = access;

    const judul = (formData.get('judul') as string)?.trim();
    const cutOffDate = (formData.get('tanggal_selesai') as string)?.trim() || new Date().toISOString().slice(0, 10);
    const catatan = (formData.get('catatan') as string)?.trim() || null;

    if (!judul) {
      return { error: 'Judul closing wajib diisi.' };
    }

    // Ambil preview transaksi yang belum closing
    const preview = await getClosingPreview(bagianSlug, cutOffDate);
    if (preview.error) return { error: preview.error };

    if (preview.transaksi_list.length === 0) {
      return { error: 'Tidak ada transaksi yang belum di-closing pada periode/cut-off yang dipilih.' };
    }

    const adminSupabase = await createAdminClient();

    // Buat nomor closing unik format CLS-YYYYMM-XXXX
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const { count } = await adminSupabase
      .from('closing_keuangan')
      .select('id', { count: 'exact', head: true })
      .eq('bagian_id', bagian.id);

    const seq = String((count || 0) + 1).padStart(4, '0');
    const nomor_closing = `CLS-${yearMonth}-${seq}`;

    // Insert record closing_keuangan
    const { data: newClosing, error: insertError } = await adminSupabase
      .from('closing_keuangan')
      .insert({
        nomor_closing,
        judul,
        bagian_id: bagian.id,
        tanggal_closing: now.toISOString().slice(0, 10),
        tanggal_mulai: preview.tanggal_mulai,
        tanggal_selesai: cutOffDate,
        saldo_awal: preview.saldo_awal,
        total_masuk: preview.total_masuk,
        total_keluar: preview.total_keluar,
        saldo_akhir: preview.saldo_akhir,
        total_transaksi: preview.total_transaksi,
        catatan,
        status: 'closed',
        dibuat_oleh: profile.id,
      })
      .select('id')
      .single();

    if (insertError || !newClosing) {
      console.error('Error creating closing_keuangan:', insertError);
      return { error: insertError?.message || 'Gagal menyimpan penutupan buku.' };
    }

    // Tautkan transaksi yang di-closing
    const trxIds = preview.transaksi_list.map((t) => t.id);
    const { error: updateTrxError } = await adminSupabase
      .from('catatan_keuangan')
      .update({ closing_id: newClosing.id })
      .in('id', trxIds);

    if (updateTrxError) {
      console.error('Error linking transactions to closing:', updateTrxError);
      await adminSupabase.from('closing_keuangan').delete().eq('id', newClosing.id);
      return { error: 'Gagal menautkan transaksi ke closing: ' + updateTrxError.message };
    }

    revalidatePath('/keuangan');
    revalidatePath('/dashboard');
    revalidatePath('/');
    revalidatePath('/laporan-keuangan');
    invalidatePublicTransparencyCache();

    return { success: true, closingId: newClosing.id };
  } catch (err: unknown) {
    console.error('executeClosingKeuangan exception:', err);
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan internal.' };
  }
}

/**
 * Mengambil detail closing beserta seluruh transaksi yang tersimpan di dalamnya
 */
export async function getClosingDetail(
  closingId: string,
  bagianSlug: string = 'bendahara',
): Promise<{ closing: ClosingKeuangan; transaksi: Transaksi[] } | { error: string }> {
  const access = await getKeuanganReadAccess(bagianSlug);
  if ('error' in access && access.error) return { error: access.error };

  const supabase = await createClient();

  const [closingRes, trxRes] = await Promise.all([
    supabase
      .from('closing_keuangan')
      .select(`
        id,
        nomor_closing,
        judul,
        bagian_id,
        tanggal_closing,
        tanggal_mulai,
        tanggal_selesai,
        saldo_awal,
        total_masuk,
        total_keluar,
        saldo_akhir,
        total_transaksi,
        catatan,
        status,
        dibuat_oleh,
        created_at,
        author:profiles!closing_keuangan_dibuat_oleh_fkey (
          nama,
          role
        )
      `)
      .eq('id', closingId)
      .single(),
    supabase
      .from('catatan_keuangan')
      .select(`
        id,
        judul,
        keterangan,
        jenis,
        jumlah,
        tanggal,
        created_at,
        lampiran_url,
        kegiatan_id,
        bagian_id,
        closing_id,
        dibuat_oleh,
        author:profiles!catatan_keuangan_dibuat_oleh_fkey (
          nama,
          role
        )
      `)
      .eq('closing_id', closingId)
      .is('deleted_at', null)
      .order('tanggal', { ascending: true })
      .order('created_at', { ascending: true }),
  ]);

  if (closingRes.error || !closingRes.data) {
    return { error: 'Data closing tidak ditemukan.' };
  }

  const rawClosing = closingRes.data as any;
  const closing: ClosingKeuangan = {
    ...rawClosing,
    saldo_awal: Number(rawClosing.saldo_awal) || 0,
    total_masuk: Number(rawClosing.total_masuk) || 0,
    total_keluar: Number(rawClosing.total_keluar) || 0,
    saldo_akhir: Number(rawClosing.saldo_akhir) || 0,
    total_transaksi: Number(rawClosing.total_transaksi) || 0,
    author: Array.isArray(rawClosing.author) ? rawClosing.author[0] : rawClosing.author,
  };

  const transaksi: Transaksi[] = (trxRes.data || []).map((t: any) => normalizeTransaction(t));

  return { closing, transaksi };
}

/**
 * Membuka kembali (reopen) closing kas terakhir (khusus role Admin atau Ketua)
 */
export async function reopenClosingKeuangan(
  closingId: string,
  bagianSlug: string = 'bendahara',
): Promise<{ success?: boolean; error?: string }> {
  try {
    const access = await getKeuanganManageAccess(bagianSlug);
    if ('error' in access && access.error) return { error: access.error };
    const { profile, bagian } = access;

    if (profile.role !== 'admin' && profile.role !== 'ketua') {
      return { error: 'Hanya Admin atau Ketua yang berhak membuka kembali (reopen) penutupan buku.' };
    }

    const adminSupabase = await createAdminClient();

    // Pastikan closing ini adalah closing terakhir yang aktif
    const { data: latestClosing } = await adminSupabase
      .from('closing_keuangan')
      .select('id, nomor_closing, status')
      .eq('bagian_id', bagian.id)
      .eq('status', 'closed')
      .order('tanggal_closing', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestClosing || latestClosing.id !== closingId) {
      return { error: 'Hanya periode closing terakhir yang dapat dibuka kembali untuk menjaga urutan saldo.' };
    }

    // Lepas relasi closing_id pada transaksi
    const { error: unlinkError } = await adminSupabase
      .from('catatan_keuangan')
      .update({ closing_id: null })
      .eq('closing_id', closingId);

    if (unlinkError) {
      return { error: 'Gagal melepaskan transaksi dari closing: ' + unlinkError.message };
    }

    // Ubah status closing_keuangan menjadi 'reopened'
    const { error: updateClosingError } = await adminSupabase
      .from('closing_keuangan')
      .update({ status: 'reopened' })
      .eq('id', closingId);

    if (updateClosingError) {
      return { error: updateClosingError.message };
    }

    revalidatePath('/keuangan');
    revalidatePath('/dashboard');
    revalidatePath('/');
    revalidatePath('/laporan-keuangan');
    invalidatePublicTransparencyCache();

    return { success: true };
  } catch (err: unknown) {
    console.error('reopenClosingKeuangan exception:', err);
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan internal.' };
  }
}

