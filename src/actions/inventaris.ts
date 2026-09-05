"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type KondisiBarang = "baik" | "rusak_ringan" | "rusak_berat";
export type StatusBarang = "Tersedia" | "Dipinjam";
export type KategoriBarang =
  | "Elektronik & Sound"
  | "Tenda & Panggung"
  | "Meja & Kursi"
  | "Logistik & Kebersihan"
  | "Olahraga"
  | "Lainnya";

export interface ItemInventaris {
  id: string;
  nama: string;
  kategori: string;
  jumlah: number;
  satuan: string;
  kondisi: KondisiBarang;
  status: StatusBarang;
  lokasi: string;
  fotoUrl?: string | null;
  keterangan?: string | null;
  peminjam?: string;
  tglPinjam?: string;
  tglKembaliRencana?: string;
  aktifPinjamId?: string;
  createdAt: string;
}

export interface PeminjamanRecord {
  id: string;
  inventarisId: string;
  namaBarang?: string;
  peminjam: string;
  tanggalPinjam: string;
  tanggalKembaliRencana: string;
  tanggalKembaliAktual?: string | null;
  status: "dipinjam" | "dikembalikan";
  jumlahPinjam: number;
  keterangan?: string | null;
  dibuatOleh?: string;
  createdAt: string;
}

/**
 * Mengambil daftar seluruh barang inventaris beserta status peminjaman aktif.
 */
export async function getInventarisList(filters?: {
  search?: string;
  kategori?: string;
  kondisi?: string;
  status?: string;
}): Promise<ItemInventaris[]> {
  const supabase = await createClient();

  const { data: rawItems, error } = await supabase
    .from("inventaris")
    .select(`
      *,
      peminjaman:peminjaman_inventaris (
        id,
        peminjam,
        tanggal_pinjam,
        tanggal_kembali_rencana,
        tanggal_kembali_aktual,
        status,
        jumlah_pinjam,
        keterangan,
        created_at
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching inventaris:", error);
    return [];
  }

  const items: ItemInventaris[] = (rawItems || []).map((item: any) => {
    // Cari peminjaman yang masih aktif ('dipinjam')
    const activeLoans = (item.peminjaman || []).filter(
      (p: any) => p.status === "dipinjam"
    );
    const latestLoan = activeLoans.length > 0 ? activeLoans[0] : null;

    const status: StatusBarang = latestLoan ? "Dipinjam" : "Tersedia";

    return {
      id: item.id,
      nama: item.nama_barang,
      kategori: item.kategori || "Lainnya",
      jumlah: Number(item.jumlah) || 1,
      satuan: item.satuan || "Unit",
      kondisi: item.kondisi || "baik",
      status,
      lokasi: item.lokasi || "Sekretariat",
      fotoUrl: item.foto_url || null,
      keterangan: item.keterangan || null,
      peminjam: latestLoan ? latestLoan.peminjam : undefined,
      tglPinjam: latestLoan ? latestLoan.tanggal_pinjam : undefined,
      tglKembaliRencana: latestLoan ? latestLoan.tanggal_kembali_rencana : undefined,
      aktifPinjamId: latestLoan ? latestLoan.id : undefined,
      createdAt: item.created_at,
    };
  });

  return items;
}

/**
 * Menambahkan data barang baru ke inventaris.
 */
export async function createInventaris(payload: {
  nama: string;
  kategori?: string;
  jumlah: number;
  satuan?: string;
  kondisi?: KondisiBarang;
  lokasi?: string;
  fotoUrl?: string | null;
  keterangan?: string;
}): Promise<{ success: boolean; data?: ItemInventaris; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Unauthorized: Silakan login terlebih dahulu." };
    }

    if (!payload.nama || payload.nama.trim() === "") {
      return { success: false, error: "Nama barang wajib diisi." };
    }

    const insertData: any = {
      nama_barang: payload.nama.trim(),
      jumlah: Number(payload.jumlah) || 1,
      kondisi: payload.kondisi || "baik",
      kategori: payload.kategori || "Lainnya",
      satuan: payload.satuan || "Unit",
      lokasi: payload.lokasi || "Sekretariat",
      foto_url: payload.fotoUrl || null,
      keterangan: payload.keterangan?.trim() || null,
    };

    const { data, error } = await supabase
      .from("inventaris")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error creating inventaris:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/inventaris");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        id: data.id,
        nama: data.nama_barang,
        kategori: data.kategori || "Lainnya",
        jumlah: data.jumlah,
        satuan: data.satuan || "Unit",
        kondisi: data.kondisi,
        status: "Tersedia",
        lokasi: data.lokasi,
        fotoUrl: data.foto_url,
        keterangan: data.keterangan,
        createdAt: data.created_at,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan sistem." };
  }
}

/**
 * Mengubah data barang inventaris.
 */
export async function updateInventaris(
  id: string,
  payload: {
    nama?: string;
    kategori?: string;
    jumlah?: number;
    satuan?: string;
    kondisi?: KondisiBarang;
    lokasi?: string;
    fotoUrl?: string | null;
    keterangan?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Unauthorized: Silakan login." };
    }

    const updateData: any = {};
    if (payload.nama !== undefined) updateData.nama_barang = payload.nama.trim();
    if (payload.kategori !== undefined) updateData.kategori = payload.kategori;
    if (payload.jumlah !== undefined) updateData.jumlah = Number(payload.jumlah);
    if (payload.satuan !== undefined) updateData.satuan = payload.satuan;
    if (payload.kondisi !== undefined) updateData.kondisi = payload.kondisi;
    if (payload.lokasi !== undefined) updateData.lokasi = payload.lokasi;
    if (payload.fotoUrl !== undefined) updateData.foto_url = payload.fotoUrl;
    if (payload.keterangan !== undefined) updateData.keterangan = payload.keterangan?.trim() || null;

    const { error } = await supabase
      .from("inventaris")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating inventaris:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/inventaris");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan sistem." };
  }
}

/**
 * Menghapus data barang inventaris (hanya admin/ketua).
 */
export async function deleteInventaris(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Unauthorized: Silakan login." };
    }

    if (profile.role !== "admin" && profile.role !== "ketua") {
      return { success: false, error: "Hanya Admin dan Ketua yang berhak menghapus data inventaris." };
    }

    const { error } = await supabase.from("inventaris").delete().eq("id", id);

    if (error) {
      console.error("Error deleting inventaris:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/inventaris");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan sistem." };
  }
}

/**
 * Mencatat peminjaman inventaris baru.
 */
export async function pinjamInventaris(payload: {
  inventarisId: string;
  peminjam: string;
  tanggalPinjam?: string;
  tanggalKembaliRencana: string;
  jumlahPinjam?: number;
  keterangan?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Unauthorized: Silakan login terlebih dahulu." };
    }

    if (!payload.peminjam?.trim()) {
      return { success: false, error: "Nama peminjam wajib diisi." };
    }

    if (!payload.tanggalKembaliRencana) {
      return { success: false, error: "Rencana tanggal pengembalian wajib diisi." };
    }

    const tglPinjam = payload.tanggalPinjam || new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("peminjaman_inventaris").insert({
      inventaris_id: payload.inventarisId,
      peminjam: payload.peminjam.trim(),
      tanggal_pinjam: tglPinjam,
      tanggal_kembali_rencana: payload.tanggalKembaliRencana,
      jumlah_pinjam: Number(payload.jumlahPinjam) || 1,
      keterangan: payload.keterangan?.trim() || null,
      status: "dipinjam",
      dibuat_oleh: profile.id,
    });

    if (error) {
      console.error("Error recording loan:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/inventaris");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan sistem." };
  }
}

/**
 * Mengubah status peminjaman menjadi 'dikembalikan'.
 */
export async function kembalikanInventaris(
  peminjamanId: string,
  tanggalKembaliAktual?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Unauthorized: Silakan login." };
    }

    const actualDate =
      tanggalKembaliAktual || new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("peminjaman_inventaris")
      .update({
        status: "dikembalikan",
        tanggal_kembali_aktual: actualDate,
      })
      .eq("id", peminjamanId);

    if (error) {
      console.error("Error returning loan item:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/inventaris");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan sistem." };
  }
}

/**
 * Mengambil riwayat peminjaman barang (opsional difilter per item inventaris).
 */
export async function getRiwayatPeminjaman(
  inventarisId?: string
): Promise<PeminjamanRecord[]> {
  const supabase = await createClient();

  let query = supabase
    .from("peminjaman_inventaris")
    .select(`
      *,
      inventaris:inventaris!inventaris_id (
        nama_barang
      ),
      author:profiles!dibuat_oleh (
        nama
      )
    `)
    .order("created_at", { ascending: false });

  if (inventarisId) {
    query = query.eq("inventaris_id", inventarisId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching loan history:", error);
    return [];
  }

  return (data || []).map((r: any) => ({
    id: r.id,
    inventarisId: r.inventaris_id,
    namaBarang: r.inventaris?.nama_barang,
    peminjam: r.peminjam,
    tanggalPinjam: r.tanggal_pinjam,
    tanggalKembaliRencana: r.tanggal_kembali_rencana,
    tanggalKembaliAktual: r.tanggal_kembali_aktual,
    status: r.status,
    jumlahPinjam: r.jumlah_pinjam || 1,
    keterangan: r.keterangan,
    dibuatOleh: r.author?.nama || "Pengurus",
    createdAt: r.created_at,
  }));
}
