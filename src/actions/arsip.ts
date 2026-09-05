"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type KategoriArsip = "sk" | "proposal" | "lpj" | "notulensi" | "lainnya";

export interface ArsipItem {
  id: string;
  judul: string;
  nomorSurat: string;
  kategori: KategoriArsip;
  fileUrl: string;
  fileType: string;
  size: string;
  tanggal: string;
  agendaOrganisasiId?: string | null;
  agendaTerkait?: string;
  uploader: string;
  deskripsi: string;
  createdAt: string;
}

/**
 * Mengambil daftar seluruh arsip dokumen dari database.
 */
export async function getArsipList(filters?: {
  search?: string;
  kategori?: string;
  agendaId?: string;
}): Promise<ArsipItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("arsip_dokumen")
    .select(`
      *,
      agenda:agenda_organisasi!agenda_organisasi_id (
        id,
        nama_agenda
      ),
      author:profiles!dibuat_oleh (
        id,
        nama,
        role
      )
    `)
    .order("created_at", { ascending: false });

  if (filters?.kategori && filters.kategori !== "all" && filters.kategori !== "semua") {
    query = query.eq("kategori", filters.kategori);
  }

  if (filters?.agendaId && filters.agendaId !== "all") {
    query = query.eq("agenda_organisasi_id", filters.agendaId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching arsip dokumen:", JSON.stringify(error, null, 2));
    return [];
  }

  return (data || []).map((doc: any) => {
    // Format tanggal cantik
    const d = new Date(doc.created_at);
    const formattedDate = d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    // Detect file type from URL or field
    let detectedType = doc.file_type || "PDF";
    if (doc.file_url) {
      const lower = doc.file_url.toLowerCase();
      if (lower.endsWith(".docx") || lower.endsWith(".doc")) detectedType = "DOCX";
      else if (lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".csv")) detectedType = "XLSX";
      else if (lower.endsWith(".pdf")) detectedType = "PDF";
      else if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp")) detectedType = "IMG";
    }

    const agendaObj = Array.isArray(doc.agenda) ? doc.agenda[0] : doc.agenda;
    const authorObj = Array.isArray(doc.author) ? doc.author[0] : doc.author;

    return {
      id: doc.id,
      judul: doc.judul,
      nomorSurat: doc.nomor_surat || "-",
      kategori: doc.kategori || "lainnya",
      fileUrl: doc.file_url,
      fileType: detectedType,
      size: doc.file_size || "Dokumen",
      tanggal: formattedDate,
      agendaOrganisasiId: doc.agenda_organisasi_id || null,
      agendaTerkait: agendaObj?.nama_agenda || "Umum / Organisasi",
      uploader: authorObj?.nama || "Pengurus",
      deskripsi: doc.deskripsi || "",
      createdAt: doc.created_at,
    };
  });
}

/**
 * Menambahkan arsip dokumen baru.
 */
export async function createArsip(payload: {
  judul: string;
  nomorSurat?: string;
  kategori: KategoriArsip;
  fileUrl: string;
  fileType?: string;
  fileSize?: string;
  agendaOrganisasiId?: string | null;
  deskripsi?: string;
}): Promise<{ success: boolean; data?: ArsipItem; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Unauthorized: Silakan login terlebih dahulu." };
    }

    if (!payload.judul?.trim()) {
      return { success: false, error: "Judul arsip dokumen wajib diisi." };
    }

    if (!payload.fileUrl?.trim()) {
      return { success: false, error: "File lampiran arsip wajib diunggah." };
    }

    const insertData: any = {
      judul: payload.judul.trim(),
      nomor_surat: payload.nomorSurat?.trim() || null,
      kategori: payload.kategori || "lainnya",
      file_url: payload.fileUrl.trim(),
      file_type: payload.fileType || "PDF",
      file_size: payload.fileSize || "1 MB",
      agenda_organisasi_id: payload.agendaOrganisasiId || null,
      deskripsi: payload.deskripsi?.trim() || null,
      dibuat_oleh: profile.id,
    };

    const { data, error } = await supabase
      .from("arsip_dokumen")
      .insert(insertData)
      .select(`
        *,
        agenda:agenda_organisasi!agenda_organisasi_id (
          id,
          nama_agenda
        ),
        author:profiles!dibuat_oleh (
          nama
        )
      `)
      .single();

    if (error) {
      console.error("Error creating arsip:", JSON.stringify(error, null, 2));
      return { success: false, error: error.message };
    }

    revalidatePath("/arsip");

    const d = new Date(data.created_at);
    const formattedDate = d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const agendaObj = Array.isArray(data.agenda) ? data.agenda[0] : data.agenda;
    const authorObj = Array.isArray(data.author) ? data.author[0] : data.author;

    return {
      success: true,
      data: {
        id: data.id,
        judul: data.judul,
        nomorSurat: data.nomor_surat || "-",
        kategori: data.kategori,
        fileUrl: data.file_url,
        fileType: data.file_type || "PDF",
        size: data.file_size || "Dokumen",
        tanggal: formattedDate,
        agendaOrganisasiId: data.agenda_organisasi_id,
        agendaTerkait: agendaObj?.nama_agenda || "Umum / Organisasi",
        uploader: authorObj?.nama || profile.nama,
        deskripsi: data.deskripsi || "",
        createdAt: data.created_at,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan sistem." };
  }
}

/**
 * Mengubah data arsip dokumen.
 */
export async function updateArsip(
  id: string,
  payload: {
    judul?: string;
    nomorSurat?: string;
    kategori?: KategoriArsip;
    fileUrl?: string;
    fileType?: string;
    fileSize?: string;
    agendaOrganisasiId?: string | null;
    deskripsi?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Unauthorized: Silakan login." };
    }

    const updateData: any = {};
    if (payload.judul !== undefined) updateData.judul = payload.judul.trim();
    if (payload.nomorSurat !== undefined) updateData.nomor_surat = payload.nomorSurat.trim();
    if (payload.kategori !== undefined) updateData.kategori = payload.kategori;
    if (payload.fileUrl !== undefined) updateData.file_url = payload.fileUrl;
    if (payload.fileType !== undefined) updateData.file_type = payload.fileType;
    if (payload.fileSize !== undefined) updateData.file_size = payload.fileSize;
    if (payload.agendaOrganisasiId !== undefined) updateData.agenda_organisasi_id = payload.agendaOrganisasiId;
    if (payload.deskripsi !== undefined) updateData.deskripsi = payload.deskripsi.trim();

    const { error } = await supabase
      .from("arsip_dokumen")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating arsip:", JSON.stringify(error, null, 2));
      return { success: false, error: error.message };
    }

    revalidatePath("/arsip");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan sistem." };
  }
}

/**
 * Menghapus arsip dokumen.
 */
export async function deleteArsip(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Unauthorized: Silakan login." };
    }

    const { error } = await supabase.from("arsip_dokumen").delete().eq("id", id);

    if (error) {
      console.error("Error deleting arsip:", JSON.stringify(error, null, 2));
      return { success: false, error: error.message };
    }

    revalidatePath("/arsip");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan sistem." };
  }
}
