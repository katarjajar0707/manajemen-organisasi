"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface AgendaData {
  id: string;
  nama: string;
  bagian: string;
  bagianSlug: string;
  bagianId: string;
  periode: string;
  activePeriodeId: string | null;
  status: "Aktif" | "Persiapan" | "Selesai";
  totalAnggota: number;
  deskripsi: string;
  penanggungJawab: string;
  createdAt: string;
}

/**
 * Mengambil daftar agenda organisasi (semua atau per bagian).
 * Terbuka untuk semua role (PRD 4.5).
 */
export async function getAgendas(bagianSlug?: string): Promise<AgendaData[]> {
  const supabase = await createClient();

  let query = supabase
    .from("agenda_organisasi")
    .select(`
      id,
      nama_agenda,
      bagian_id,
      status,
      deskripsi,
      created_at,
      bagian:bagian!bagian_id (
        id,
        nama,
        slug
      ),
      author:profiles!dibuat_oleh (
        nama,
        role
      ),
      periode_kepengurusan (
        id,
        nama_periode,
        tanggal_mulai,
        tanggal_selesai,
        is_aktif,
        anggota (
          id
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (bagianSlug) {
    const { data: b } = await supabase
      .from("bagian")
      .select("id")
      .eq("slug", bagianSlug)
      .single();

    if (b) {
      query = query.eq("bagian_id", b.id);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching agendas:", error);
    return [];
  }

  if (!data) return [];

  return data.map((item: any) => {
    const periods = Array.isArray(item.periode_kepengurusan)
      ? item.periode_kepengurusan
      : [];
    const activePeriod = periods.find((p: any) => p.is_aktif) || periods[0] || null;

    let totalAnggota = 0;
    if (activePeriod && Array.isArray(activePeriod.anggota)) {
      totalAnggota = activePeriod.anggota.length;
    }

    const bagianObj = Array.isArray(item.bagian) ? item.bagian[0] : item.bagian;
    const authorObj = Array.isArray(item.author) ? item.author[0] : item.author;

    return {
      id: item.id,
      nama: item.nama_agenda,
      bagian: bagianObj?.nama || "Umum",
      bagianSlug: bagianObj?.slug || "umum",
      bagianId: item.bagian_id,
      periode: activePeriod ? activePeriod.nama_periode : "Belum ditentukan",
      activePeriodeId: activePeriod ? activePeriod.id : null,
      status: (item.status as any) || "Aktif",
      totalAnggota,
      deskripsi: item.deskripsi || "",
      penanggungJawab: authorObj?.nama ? `${authorObj.nama} (${authorObj.role})` : "Pengurus Harian",
      createdAt: item.created_at,
    };
  });
}

/**
 * Mengambil detail 1 agenda beserta seluruh periode kepengurusan dan anggota.
 */
export async function getAgendaById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agenda_organisasi")
    .select(`
      *,
      bagian:bagian!bagian_id (
        id,
        nama,
        slug
      ),
      author:profiles!dibuat_oleh (
        nama,
        role
      ),
      periode_kepengurusan (
        id,
        nama_periode,
        tanggal_mulai,
        tanggal_selesai,
        is_aktif,
        created_at,
        anggota (
          id,
          nama,
          kontak,
          rt_rw,
          jabatan,
          status,
          foto_url,
          created_at
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching agenda detail:", error);
    return null;
  }

  const bagianObj = Array.isArray(data.bagian) ? data.bagian[0] : data.bagian;
  const authorObj = Array.isArray(data.author) ? data.author[0] : data.author;

  return {
    ...data,
    bagian: bagianObj,
    author: authorObj,
    periode_kepengurusan: (data.periode_kepengurusan || []).sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  };
}

/**
 * Membuat agenda organisasi baru. Khusus role 'admin' atau 'ketua' (PRD 3.6 & 4.5).
 */
export async function createAgenda(formData: FormData) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return { error: "Silakan login terlebih dahulu." };
    }

    if (profile.role !== "admin" && profile.role !== "ketua") {
      return { error: "Hanya role Ketua atau Admin yang berhak membuat agenda organisasi baru." };
    }

    const nama_agenda = formData.get("nama_agenda") as string;
    const bagian_id = formData.get("bagian_id") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const nama_periode = (formData.get("nama_periode") as string) || "Periode 2025–2027";
    const tanggal_mulai = (formData.get("tanggal_mulai") as string) || new Date().toISOString().split("T")[0];
    const tanggal_selesai = (formData.get("tanggal_selesai") as string) || null;

    if (!nama_agenda || !bagian_id) {
      return { error: "Nama agenda dan bagian organisasi wajib diisi." };
    }

    const supabase = await createClient();

    // 1. Insert agenda
    const { data: agenda, error: agendaError } = await supabase
      .from("agenda_organisasi")
      .insert({
        nama_agenda: nama_agenda.trim(),
        bagian_id,
        deskripsi: deskripsi?.trim() || null,
        dibuat_oleh: profile.id,
        status: "Aktif",
      })
      .select()
      .single();

    if (agendaError || !agenda) {
      return { error: agendaError?.message || "Gagal membuat agenda organisasi." };
    }

    // 2. Insert periode aktif awal
    const { error: periodeError } = await supabase
      .from("periode_kepengurusan")
      .insert({
        agenda_organisasi_id: agenda.id,
        nama_periode: nama_periode.trim(),
        tanggal_mulai,
        tanggal_selesai: tanggal_selesai || null,
        is_aktif: true,
      });

    if (periodeError) {
      console.warn("Periode auto-creation warning:", periodeError);
    }

    revalidatePath("/struktur");
    revalidatePath(`/struktur/${bagian_id}/agenda`);
    revalidatePath("/bagian/bendahara");
    return { success: true, agendaId: agenda.id };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan sistem." };
  }
}

/**
 * Mengubah data agenda organisasi. Khusus role 'admin' atau 'ketua'.
 */
export async function updateAgenda(id: string, formData: FormData) {
  try {
    const profile = await getProfile();
    if (!profile) return { error: "Silakan login terlebih dahulu." };
    if (profile.role !== "admin" && profile.role !== "ketua") {
      return { error: "Hanya role Ketua atau Admin yang berhak mengubah agenda organisasi." };
    }

    const nama_agenda = formData.get("nama_agenda") as string;
    const bagian_id = formData.get("bagian_id") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const status = (formData.get("status") as string) || "Aktif";

    if (!nama_agenda) {
      return { error: "Nama agenda wajib diisi." };
    }

    const updatePayload: any = {
      nama_agenda: nama_agenda.trim(),
      deskripsi: deskripsi?.trim() || null,
      status,
    };

    if (bagian_id) {
      updatePayload.bagian_id = bagian_id;
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("agenda_organisasi")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/struktur");
    revalidatePath("/bagian/bendahara");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan sistem." };
  }
}

/**
 * Menghapus agenda organisasi. Khusus role 'admin' atau 'ketua'.
 */
export async function deleteAgenda(id: string) {
  try {
    const profile = await getProfile();
    if (!profile) return { error: "Silakan login terlebih dahulu." };
    if (profile.role !== "admin" && profile.role !== "ketua") {
      return { error: "Hanya role Ketua atau Admin yang berhak menghapus agenda organisasi." };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("agenda_organisasi")
      .delete()
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/struktur");
    revalidatePath("/bagian/bendahara");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan sistem." };
  }
}
