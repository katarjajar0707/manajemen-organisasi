"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface KegiatanData {
  id: string;
  judul: string;
  deskripsi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  waktuMulai: string;
  waktuSelesai: string;
  lokasi: string;
  bagianId: string | null;
  bagianNama: string;
  penanggungJawab: string;
  totalFoto: number;
  status: "Mendatang" | "Berlangsung" | "Selesai";
  dibuatOleh: string;
  createdAt: string;
}

/**
 * Helper untuk menentukan status kegiatan berdasarkan rentang tanggal/waktu.
 */
function calculateStatus(mulaiIso: string, selesaiIso: string | null): "Mendatang" | "Berlangsung" | "Selesai" {
  const now = new Date();
  const mulai = new Date(mulaiIso);
  const selesai = selesaiIso ? new Date(selesaiIso) : new Date(mulai.getTime() + 4 * 60 * 60 * 1000);

  if (now < mulai) {
    return "Mendatang";
  } else if (now >= mulai && now <= selesai) {
    return "Berlangsung";
  } else {
    return "Selesai";
  }
}

/**
 * Mengambil daftar seluruh kegiatan dari database.
 */
export async function getKegiatanList(filters?: {
  search?: string;
  status?: string;
  bagianId?: string;
}): Promise<KegiatanData[]> {
  const supabase = await createClient();

  let query = supabase
    .from("kalender_kegiatan")
    .select(`
      *,
      bagian:bagian_id (
        id,
        nama,
        slug
      ),
      author:dibuat_oleh (
        id,
        nama,
        role
      ),
      dokumentasi_kegiatan (
        id
      )
    `)
    .order("tanggal_mulai", { ascending: false });

  if (filters?.bagianId && filters.bagianId !== "semua") {
    query = query.eq("bagian_id", filters.bagianId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching kegiatan:", error);
    return [];
  }

  if (!data) return [];

  const items: KegiatanData[] = data.map((item: any) => {
    const bagianObj = Array.isArray(item.bagian) ? item.bagian[0] : item.bagian;
    const authorObj = Array.isArray(item.author) ? item.author[0] : item.author;

    const mulaiDate = new Date(item.tanggal_mulai);
    const selesaiDate = item.tanggal_selesai ? new Date(item.tanggal_selesai) : null;

    const tanggalMulaiStr = mulaiDate.toISOString().split("T")[0];
    const tanggalSelesaiStr = selesaiDate ? selesaiDate.toISOString().split("T")[0] : tanggalMulaiStr;

    const waktuMulaiStr = mulaiDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
    const waktuSelesaiStr = selesaiDate
      ? selesaiDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":")
      : "Selesai";

    const status = calculateStatus(item.tanggal_mulai, item.tanggal_selesai);
    const totalFoto = Array.isArray(item.dokumentasi_kegiatan) ? item.dokumentasi_kegiatan.length : 0;

    const pjText = bagianObj?.nama
      ? bagianObj.nama
      : authorObj?.nama
      ? `${authorObj.nama} (${authorObj.role})`
      : "Pengurus Karang Taruna";

    return {
      id: item.id,
      judul: item.judul,
      deskripsi: item.deskripsi,
      tanggalMulai: tanggalMulaiStr,
      tanggalSelesai: tanggalSelesaiStr,
      waktuMulai: waktuMulaiStr,
      waktuSelesai: waktuSelesaiStr,
      lokasi: item.lokasi || "Balai Warga RW 05",
      bagianId: item.bagian_id,
      bagianNama: bagianObj?.nama || "Umum",
      penanggungJawab: pjText,
      totalFoto,
      status,
      dibuatOleh: item.dibuat_oleh,
      createdAt: item.created_at,
    };
  });

  if (filters?.status && filters.status !== "semua") {
    return items.filter((k) => k.status === filters.status);
  }

  return items;
}

/**
 * Mengambil detail kegiatan tunggal beserta seluruh foto dokumentasinya.
 */
export async function getKegiatanById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kalender_kegiatan")
    .select(`
      *,
      bagian:bagian_id (
        id,
        nama,
        slug
      ),
      author:dibuat_oleh (
        id,
        nama,
        role
      ),
      dokumentasi_kegiatan (
        id,
        foto_url,
        caption,
        created_at
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching kegiatan by id:", error);
    return null;
  }

  const bagianObj = Array.isArray(data.bagian) ? data.bagian[0] : data.bagian;
  const authorObj = Array.isArray(data.author) ? data.author[0] : data.author;

  const mulaiDate = new Date(data.tanggal_mulai);
  const selesaiDate = data.tanggal_selesai ? new Date(data.tanggal_selesai) : null;

  return {
    ...data,
    bagian: bagianObj,
    author: authorObj,
    tanggalMulai: mulaiDate.toISOString().split("T")[0],
    tanggalSelesai: selesaiDate ? selesaiDate.toISOString().split("T")[0] : mulaiDate.toISOString().split("T")[0],
    waktuMulai: mulaiDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":"),
    waktuSelesai: selesaiDate
      ? selesaiDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":")
      : "Selesai",
    status: calculateStatus(data.tanggal_mulai, data.tanggal_selesai),
    dokumentasi_kegiatan: (data.dokumentasi_kegiatan || []).sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  };
}

/**
 * Membuat jadwal kegiatan baru.
 */
export async function createKegiatan(formData: FormData) {
  try {
    const profile = await getProfile();
    if (!profile) return { error: "Silakan login terlebih dahulu." };

    const judul = formData.get("judul") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const tanggalMulai = formData.get("tanggal_mulai") as string;
    const tanggalSelesai = (formData.get("tanggal_selesai") as string) || tanggalMulai;
    const waktuMulai = (formData.get("waktu_mulai") as string) || "08:00";
    const waktuSelesai = (formData.get("waktu_selesai") as string) || "12:00";
    const lokasi = formData.get("lokasi") as string;
    const bagian_id = (formData.get("bagian_id") as string) || null;

    if (!judul || !deskripsi || !tanggalMulai) {
      return { error: "Judul, deskripsi, dan tanggal mulai kegiatan wajib diisi." };
    }

    const startIso = new Date(`${tanggalMulai}T${waktuMulai}:00`).toISOString();
    const endIso = new Date(`${tanggalSelesai}T${waktuSelesai}:00`).toISOString();

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("kalender_kegiatan")
      .insert({
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
        tanggal_mulai: startIso,
        tanggal_selesai: endIso,
        lokasi: lokasi ? lokasi.trim() : null,
        bagian_id: bagian_id || null,
        dibuat_oleh: profile.id,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/kegiatan");
    return { success: true, kegiatan: data };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan sistem." };
  }
}

/**
 * Memperbarui data jadwal kegiatan.
 */
export async function updateKegiatan(id: string, formData: FormData) {
  try {
    const profile = await getProfile();
    if (!profile) return { error: "Silakan login terlebih dahulu." };

    const judul = formData.get("judul") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const tanggalMulai = formData.get("tanggal_mulai") as string;
    const tanggalSelesai = (formData.get("tanggal_selesai") as string) || tanggalMulai;
    const waktuMulai = (formData.get("waktu_mulai") as string) || "08:00";
    const waktuSelesai = (formData.get("waktu_selesai") as string) || "12:00";
    const lokasi = formData.get("lokasi") as string;
    const bagian_id = (formData.get("bagian_id") as string) || null;

    if (!judul || !deskripsi || !tanggalMulai) {
      return { error: "Judul, deskripsi, dan tanggal mulai kegiatan wajib diisi." };
    }

    const startIso = new Date(`${tanggalMulai}T${waktuMulai}:00`).toISOString();
    const endIso = new Date(`${tanggalSelesai}T${waktuSelesai}:00`).toISOString();

    const supabase = await createClient();
    const { error } = await supabase
      .from("kalender_kegiatan")
      .update({
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
        tanggal_mulai: startIso,
        tanggal_selesai: endIso,
        lokasi: lokasi ? lokasi.trim() : null,
        bagian_id: bagian_id || null,
      })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/kegiatan");
    revalidatePath(`/kegiatan/${id}/dokumentasi`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan sistem." };
  }
}

/**
 * Menghapus jadwal kegiatan (cascade menghapus foto dokumentasi).
 */
export async function deleteKegiatan(id: string) {
  try {
    const profile = await getProfile();
    if (!profile) return { error: "Silakan login terlebih dahulu." };

    const supabase = await createClient();
    const { error } = await supabase
      .from("kalender_kegiatan")
      .delete()
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/kegiatan");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan sistem." };
  }
}
