'use server';

import { createAdminClient, createClient, createPublicClient } from '@/lib/supabase/server';

export interface PublicTransparencyData {
  keuangan: {
    totalMasuk: number;
    totalKeluar: number;
    saldoAkhir: number;
    persentasePertumbuhan?: number;
    trenBulanan: {
      label: string;
      masuk: number;
      keluar: number;
      saldo: number;
    }[];
    trenMingguan: {
      label: string;
      masuk: number;
      keluar: number;
      saldo: number;
    }[];
    trenTahunan: {
      label: string;
      masuk: number;
      keluar: number;
      saldo: number;
    }[];
  };
  anggota: {
    totalAktif: number;
    totalSemua: number;
    keteranganRt: string;
  };
  kegiatan: {
    totalProgram: number;
    kegiatanTerlaksana: number;
    jadwalMendatang: {
      id: string;
      judul: string;
      tanggal: string;
      waktu: string;
      lokasi: string;
      bagian: string;
      deskripsi: string;
    }[];
  };
}

export interface PublicKeuanganTransaksi {
  id: string;
  judul: string;
  keterangan: string;
  kategori: string;
  jenis: 'masuk' | 'keluar';
  jumlah: number;
  tanggal: string;
}

export interface PublicKeuanganReportData {
  transaksi: PublicKeuanganTransaksi[];
  kategori: string[];
  saldo: {
    masuk: number;
    keluar: number;
    sisa: number;
  };
}

/**
 * Helper untuk format tanggal bahasa Indonesia.
 */
function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatWaktuIndo(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return (
    d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB'
  );
}

type RentangKeuangan = 'mingguan' | 'bulanan' | 'tahunan';

type TransaksiKeuanganRingkas = {
  jenis: string | null;
  jumlah: number | string | null;
  tanggal: string | null;
};

function buatTrenKeuangan(rawKeuangan: TransaksiKeuanganRingkas[], rentang: RentangKeuangan, now: Date) {
  const jumlahTitik = rentang === 'mingguan' ? 7 : rentang === 'bulanan' ? 6 : 5;
  const buckets = Array.from({ length: jumlahTitik }, (_, index) => {
    const date = new Date(now);
    if (rentang === 'mingguan') date.setDate(now.getDate() - (jumlahTitik - 1 - index));
    if (rentang === 'bulanan') date.setMonth(now.getMonth() - (jumlahTitik - 1 - index), 1);
    if (rentang === 'tahunan') date.setFullYear(now.getFullYear() - (jumlahTitik - 1 - index), 0, 1);

    const key = rentang === 'mingguan'
      ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      : rentang === 'bulanan'
        ? `${date.getFullYear()}-${date.getMonth()}`
        : String(date.getFullYear());
    const label = rentang === 'mingguan'
      ? date.toLocaleDateString('id-ID', { weekday: 'short' })
      : rentang === 'bulanan'
        ? date.toLocaleDateString('id-ID', { month: 'short' })
        : String(date.getFullYear());

    return { key, label, masuk: 0, keluar: 0 };
  });
  const bucketByKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  rawKeuangan.forEach((item) => {
    const date = item.tanggal ? new Date(item.tanggal) : null;
    if (!date || Number.isNaN(date.getTime())) return;
    const key = rentang === 'mingguan'
      ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      : rentang === 'bulanan'
        ? `${date.getFullYear()}-${date.getMonth()}`
        : String(date.getFullYear());
    const bucket = bucketByKey.get(key);
    if (!bucket) return;
    if (item.jenis === 'masuk') bucket.masuk += Number(item.jumlah) || 0;
    if (item.jenis === 'keluar') bucket.keluar += Number(item.jumlah) || 0;
  });

  let saldoBerjalan = 0;
  return buckets.map((bucket) => {
    saldoBerjalan += bucket.masuk - bucket.keluar;
    return { label: bucket.label, masuk: bucket.masuk, keluar: bucket.keluar, saldo: saldoBerjalan };
  });
}

/**
 * Mengambil rincian transaksi untuk halaman laporan keuangan publik.
 * Data ini hanya bersifat baca-saja dan mengikuti kebijakan RLS publik.
 */
export async function getPublicKeuanganReport(): Promise<PublicKeuanganReportData> {
  const emptyReport: PublicKeuanganReportData = {
    transaksi: [],
    kategori: [],
    saldo: { masuk: 0, keluar: 0, sisa: 0 },
  };

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('catatan_keuangan')
      .select('id, judul, keterangan, jenis, jumlah, tanggal, created_at')
      .is('deleted_at', null)
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public financial report:', error);
      return emptyReport;
    }

    type RawTransaksiPublik = {
      id: string;
      judul: string | null;
      keterangan: string | null;
      jenis: 'masuk' | 'keluar';
      jumlah: number | string | null;
      tanggal: string | null;
    };

    const transaksi = ((data || []) as RawTransaksiPublik[]).map((item) => {
      const kategoriMatch = item.keterangan?.match(/^\[Kategori:\s*([^\]]+)\]/i);
      const kategori = kategoriMatch?.[1]?.trim() || 'Kas General';
      const keterangan = (item.keterangan || '').replace(/^\[Kategori:\s*[^\]]+\]\s*/i, '').trim();

      return {
        id: item.id,
        judul: item.judul || 'Transaksi',
        keterangan,
        kategori,
        jenis: item.jenis,
        jumlah: Number(item.jumlah) || 0,
        tanggal: item.tanggal || '',
      };
    });

    const masuk = transaksi.filter((item) => item.jenis === 'masuk').reduce((total, item) => total + item.jumlah, 0);
    const keluar = transaksi.filter((item) => item.jenis === 'keluar').reduce((total, item) => total + item.jumlah, 0);
    const kategori = Array.from(new Set(transaksi.map((item) => item.kategori))).sort((a, b) => a.localeCompare(b, 'id'));

    return { transaksi, kategori, saldo: { masuk, keluar, sisa: masuk - keluar } };
  } catch (error) {
    console.error('getPublicKeuanganReport exception:', error);
    return emptyReport;
  }
}

/**
 * Mengambil ringkasan data transparansi publik (keuangan, anggota aktif, dan jadwal kegiatan).
 * Read-only, aman diakses tanpa login.
 */
export async function getPublicTransparencyData(): Promise<PublicTransparencyData> {
  try {
    const supabase = createPublicClient();

    // 1. Fetch Keuangan
    const { data: rawKeuangan } = await supabase.from('catatan_keuangan').select('jenis, jumlah, tanggal').is('deleted_at', null);

    let totalMasuk = 0;
    let totalKeluar = 0;

    (rawKeuangan || []).forEach((item: any) => {
      const val = Number(item.jumlah) || 0;
      if (item.jenis === 'masuk') totalMasuk += val;
      else if (item.jenis === 'keluar') totalKeluar += val;
    });

    const saldoAkhir = totalMasuk - totalKeluar;
    const now = new Date();
    const transaksiKeuangan = (rawKeuangan || []) as TransaksiKeuanganRingkas[];
    const trenMingguan = buatTrenKeuangan(transaksiKeuangan, 'mingguan', now);
    const trenBulanan = buatTrenKeuangan(transaksiKeuangan, 'bulanan', now);
    const trenTahunan = buatTrenKeuangan(transaksiKeuangan, 'tahunan', now);

    // 2. Fetch Anggota
    const { data: rawAnggota } = await supabase.from('anggota').select('id, status, rt_rw');

    const totalSemua = rawAnggota?.length || 0;
    const totalAktif = (rawAnggota || []).filter((a: any) => !a.status || a.status.toLowerCase() === 'aktif').length;

    // 3. Fetch Kegiatan & Jadwal Mendatang
    const { data: rawKegiatan } = await supabase
      .from('kalender_kegiatan')
      .select(
        `
        id,
        judul,
        deskripsi,
        tanggal_mulai,
        tanggal_selesai,
        lokasi,
        bagian:bagian!bagian_id (
          nama
        )
      `,
      )
      .order('tanggal_mulai', { ascending: false });

    const totalProgram = rawKegiatan?.length || 0;
    const kegiatanTerlaksana = (rawKegiatan || []).filter((k: any) => new Date(k.tanggal_mulai) < now).length;

    // Ambil maksimal 6 kegiatan terbaru / mendatang
    const sortedUpcoming = [...(rawKegiatan || [])]
      .sort((a: any, b: any) => new Date(b.tanggal_mulai).getTime() - new Date(a.tanggal_mulai).getTime())
      .slice(0, 6)
      .map((k: any) => {
        const bagianObj = Array.isArray(k.bagian) ? k.bagian[0] : k.bagian;
        return {
          id: k.id,
          judul: k.judul,
          tanggal: formatTanggalIndo(k.tanggal_mulai),
          waktu: formatWaktuIndo(k.tanggal_mulai),
          lokasi: k.lokasi || 'Wilayah RW 05',
          bagian: bagianObj?.nama || 'Umum',
          deskripsi: k.deskripsi || '',
        };
      });

    return {
      keuangan: {
        totalMasuk,
        totalKeluar,
        saldoAkhir,
        trenMingguan,
        trenBulanan,
        trenTahunan,
      },
      anggota: {
        totalAktif: totalAktif || (totalSemua > 0 ? totalSemua : 0),
        totalSemua,
        keteranganRt: 'Tersebar aktif di lingkungan Karang Taruna RW 05',
      },
      kegiatan: {
        totalProgram,
        kegiatanTerlaksana,
        jadwalMendatang: sortedUpcoming,
      },
    };
  } catch (error) {
    console.error('Error fetching public transparency data:', error);
    return {
      keuangan: { totalMasuk: 0, totalKeluar: 0, saldoAkhir: 0, trenMingguan: [], trenBulanan: [], trenTahunan: [] },
      anggota: { totalAktif: 0, totalSemua: 0, keteranganRt: 'Tersebar di RT 01 s/d RT 06' },
      kegiatan: { totalProgram: 0, kegiatanTerlaksana: 0, jadwalMendatang: [] },
    };
  }
}

/**
 * Menyimpan aspirasi / masukan dari warga publik ke sistem.
 */
export async function kirimAspirasiWarga(payload: { nama: string; rt: string; pesan: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createAdminClient();

    if (!payload.nama?.trim() || !payload.pesan?.trim()) {
      return { success: false, error: 'Nama dan pesan aspirasi wajib diisi.' };
    }

    // Cari user admin / sistem untuk author jika ada
    const { data: adminProfile } = await supabase.from('profiles').select('id').eq('role', 'admin').limit(1).single();

    if (!adminProfile) return { success: false, error: 'Profil admin untuk penerima aspirasi belum tersedia.' };

    // Simpan sebagai catatan umum / diskusi publik agar ikut dipantau Realtime.
    const { error: insertError } = await supabase.from('diskusi').insert({
      tipe: 'catatan_umum',
      judul: `[Aspirasi Warga] dari ${payload.nama.trim()} (${payload.rt.trim() || 'Warga'})`,
      isi: payload.pesan.trim(),
      dibuat_oleh: adminProfile.id,
    });

    if (insertError) return { success: false, error: 'Gagal menyimpan aspirasi warga.' };

    return { success: true };
  } catch (err: any) {
    console.error('Error saving aspirasi warga:', err);
    return { success: false, error: 'Gagal menyimpan aspirasi warga.' };
  }
}

export interface AspirasiWargaItem {
  id: string;
  nama: string;
  rt: string;
  pesan: string;
  createdAt: string;
}

export async function getAspirasiWarga(): Promise<AspirasiWargaItem[]> {
  try {
    const supabase = await createClient();
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) return [];

    const { data: currentProfile } = await supabase.from('profiles').select('role').eq('id', profile.user.id).single();
    if (!currentProfile || !['admin', 'ketua'].includes(currentProfile.role)) return [];

    const { data, error } = await supabase.from('diskusi').select('id, judul, isi, created_at').eq('tipe', 'catatan_umum').like('judul', '[Aspirasi Warga]%').order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching aspirasi warga:', error);
      return [];
    }

    return (data || []).map((item) => {
      const match = item.judul.match(/^\[Aspirasi Warga\] dari (.+) \((.+)\)$/);
      return {
        id: item.id,
        nama: match?.[1] || 'Warga',
        rt: match?.[2] || 'Warga',
        pesan: item.isi || '-',
        createdAt: item.created_at,
      };
    });
  } catch (error) {
    console.error('Error loading aspirasi warga:', error);
    return [];
  }
}
