"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type JenisSurat = "undangan" | "proposal" | "keluar" | "masuk" | "keterangan";

export interface TemplateSurat {
  id: string;
  nama: string;
  jenis: JenisSurat;
  ringkasan: string;
  kodeFormat: string;
  isiTemplate: string;
  dibuatOleh?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Mengambil daftar seluruh template surat dari database.
 */
export async function getTemplateSuratList(filters?: {
  search?: string;
  jenis?: string;
}): Promise<TemplateSurat[]> {
  const supabase = await createClient();

  let query = supabase
    .from("template_surat")
    .select(`
      id,
      nama_template,
      jenis,
      ringkasan,
      kode_format,
      isi_template,
      created_at,
      updated_at,
      author:profiles!dibuat_oleh (
        nama
      )
    `)
    .order("created_at", { ascending: false });

  if (filters?.jenis && filters.jenis !== "all" && filters.jenis !== "semua") {
    query = query.eq("jenis", filters.jenis);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching template surat:", error);
    return [];
  }

  return (data || []).map((t: any) => ({
    id: t.id,
    nama: t.nama_template,
    jenis: t.jenis,
    ringkasan: t.ringkasan || "",
    kodeFormat: t.kode_format || "",
    isiTemplate: t.isi_template,
    dibuatOleh: t.author?.nama || "Admin/Sekretariat",
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }));
}

/**
 * Menambahkan template surat baru.
 */
export async function createTemplateSurat(payload: {
  nama: string;
  jenis: JenisSurat;
  ringkasan?: string;
  kodeFormat?: string;
  isiTemplate: string;
}): Promise<{ success: boolean; data?: TemplateSurat; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Unauthorized: Silakan login terlebih dahulu." };
    }

    if (!payload.nama?.trim()) {
      return { success: false, error: "Nama template surat wajib diisi." };
    }

    if (!payload.isiTemplate?.trim()) {
      return { success: false, error: "Isi template surat wajib diisi." };
    }

    const insertData: any = {
      nama_template: payload.nama.trim(),
      jenis: payload.jenis || "undangan",
      ringkasan: payload.ringkasan?.trim() || null,
      kode_format: payload.kodeFormat?.trim() || null,
      isi_template: payload.isiTemplate,
      dibuat_oleh: profile.id,
    };

    const { data, error } = await supabase
      .from("template_surat")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error creating template surat:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/surat");

    return {
      success: true,
      data: {
        id: data.id,
        nama: data.nama_template,
        jenis: data.jenis,
        ringkasan: data.ringkasan || "",
        kodeFormat: data.kode_format || "",
        isiTemplate: data.isi_template,
        createdAt: data.created_at,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan sistem." };
  }
}

/**
 * Mengubah data template surat.
 */
export async function updateTemplateSurat(
  id: string,
  payload: {
    nama?: string;
    jenis?: JenisSurat;
    ringkasan?: string;
    kodeFormat?: string;
    isiTemplate?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Unauthorized: Silakan login." };
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (payload.nama !== undefined) updateData.nama_template = payload.nama.trim();
    if (payload.jenis !== undefined) updateData.jenis = payload.jenis;
    if (payload.ringkasan !== undefined) updateData.ringkasan = payload.ringkasan?.trim() || null;
    if (payload.kodeFormat !== undefined) updateData.kode_format = payload.kodeFormat?.trim() || null;
    if (payload.isiTemplate !== undefined) updateData.isi_template = payload.isiTemplate;

    const { error } = await supabase
      .from("template_surat")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating template surat:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/surat");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan sistem." };
  }
}

/**
 * Menghapus template surat.
 */
export async function deleteTemplateSurat(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Unauthorized: Silakan login." };
    }

    const { error } = await supabase.from("template_surat").delete().eq("id", id);

    if (error) {
      console.error("Error deleting template surat:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/surat");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan sistem." };
  }
}
