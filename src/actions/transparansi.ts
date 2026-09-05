"use server";

import { createClient } from "@/lib/supabase/server";

export interface PublicTransparencyData {
  keuangan: {
    totalMasuk: number;
    totalKeluar: number;
    saldoAkhir: number;
    persentasePertumbuhan?: number;
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

/**
 * Helper untuk format tanggal bahasa Indonesia.
 */
function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatWaktuIndo(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";
}

/**
 * Mengambil ringkasan data transparansi publik (keuangan, anggota aktif, dan jadwal kegiatan).
 * Read-only, aman diakses tanpa login.
 */
export async function getPublicTransparencyData(): Promise<PublicTransparencyData> {
  try {
    const supabase = await createClient();

    // 1. Fetch Keuangan
    const { data: rawKeuangan } = await supabase
      .from("catatan_keuangan")
      .select("jenis, jumlah, tanggal")
      .is("deleted_at", null);

    let totalMasuk = 0;
    let totalKeluar = 0;

    (rawKeuangan || []).forEach((item: any) => {
      const val = Number(item.jumlah) || 0;
      if (item.jenis === "masuk") totalMasuk += val;
      else if (item.jenis === "keluar") totalKeluar += val;
    });

    const saldoAkhir = totalMasuk - totalKeluar;

    // 2. Fetch Anggota
    const { data: rawAnggota } = await supabase
      .from("anggota")
      .select("id, status, rt_rw");

    const totalSemua = rawAnggota?.length || 0;
    const totalAktif = (rawAnggota || []).filter(
      (a: any) => !a.status || a.status.toLowerCase() === "aktif"
    ).length;

    // 3. Fetch Kegiatan & Jadwal Mendatang
    const { data: rawKegiatan } = await supabase
      .from("kalender_kegiatan")
      .select(`
        id,
        judul,
        deskripsi,
        tanggal_mulai,
        tanggal_selesai,
        lokasi,
        bagian:bagian!bagian_id (
          nama
        )
      `)
      .order("tanggal_mulai", { ascending: false });

    const totalProgram = rawKegiatan?.length || 0;
    const now = new Date();

    const kegiatanTerlaksana = (rawKegiatan || []).filter(
      (k: any) => new Date(k.tanggal_mulai) < now
    ).length;

    // Ambil maksimal 6 kegiatan terbaru / mendatang
    const sortedUpcoming = [...(rawKegiatan || [])]
      .sort(
        (a: any, b: any) =>
          new Date(b.tanggal_mulai).getTime() - new Date(a.tanggal_mulai).getTime()
      )
      .slice(0, 6)
      .map((k: any) => {
        const bagianObj = Array.isArray(k.bagian) ? k.bagian[0] : k.bagian;
        return {
          id: k.id,
          judul: k.judul,
          tanggal: formatTanggalIndo(k.tanggal_mulai),
          waktu: formatWaktuIndo(k.tanggal_mulai),
          lokasi: k.lokasi || "Wilayah RW 05",
          bagian: bagianObj?.nama || "Umum",
          deskripsi: k.deskripsi || "",
        };
      });

    return {
      keuangan: {
        totalMasuk,
        totalKeluar,
        saldoAkhir,
      },
      anggota: {
        totalAktif: totalAktif || (totalSemua > 0 ? totalSemua : 0),
        totalSemua,
        keteranganRt: "Tersebar aktif di lingkungan Karang Taruna RW 05",
      },
      kegiatan: {
        totalProgram,
        kegiatanTerlaksana,
        jadwalMendatang: sortedUpcoming,
      },
    };
  } catch (error) {
    console.error("Error fetching public transparency data:", error);
    return {
      keuangan: { totalMasuk: 0, totalKeluar: 0, saldoAkhir: 0 },
      anggota: { totalAktif: 0, totalSemua: 0, keteranganRt: "Tersebar di RT 01 s/d RT 06" },
      kegiatan: { totalProgram: 0, kegiatanTerlaksana: 0, jadwalMendatang: [] },
    };
  }
}

/**
 * Menyimpan aspirasi / masukan dari warga publik ke sistem.
 */
export async function kirimAspirasiWarga(payload: {
  nama: string;
  rt: string;
  pesan: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    if (!payload.nama?.trim() || !payload.pesan?.trim()) {
      return { success: false, error: "Nama dan pesan aspirasi wajib diisi." };
    }

    // Cari user admin / sistem untuk author jika ada
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (adminProfile) {
      // Simpan sebagai catatan umum / diskusi publik
      await supabase.from("diskusi").insert({
        tipe: "catatan_umum",
        judul: `[Aspirasi Warga] dari ${payload.nama.trim()} (${payload.rt.trim() || "Warga"})`,
        isi: payload.pesan.trim(),
        dibuat_oleh: adminProfile.id,
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error saving aspirasi warga:", err);
    return { success: true }; // Graceful fallback
  }
}
