"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import { uploadLampiran } from "./storage";
import { revalidatePath } from "next/cache";

export interface DokumentasiFotoItem {
  id: string;
  url: string;
  caption: string;
  uploadedBy: string;
  tanggal: string;
  createdAt: string;
}

/**
 * Mengambil seluruh foto dokumentasi untuk kegiatan tertentu.
 */
export async function getDokumentasiByKegiatanId(kegiatanId: string): Promise<DokumentasiFotoItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dokumentasi_kegiatan")
    .select(`
      *,
      kalender:kalender_kegiatan!kalender_id (
        id,
        judul,
        author:profiles!dibuat_oleh (
          nama,
          role
        )
      )
    `)
    .eq("kalender_id", kegiatanId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching dokumentasi:", error);
    return [];
  }

  if (!data) return [];

  return data.map((item: any) => {
    const kalender = Array.isArray(item.kalender) ? item.kalender[0] : item.kalender;
    const author = kalender ? (Array.isArray(kalender.author) ? kalender.author[0] : kalender.author) : null;

    const formattedDate = new Date(item.created_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return {
      id: item.id,
      url: item.foto_url,
      caption: item.caption || "Dokumentasi kegiatan",
      uploadedBy: author?.nama ? `${author.nama} (${author.role})` : "Pengurus",
      tanggal: formattedDate,
      createdAt: item.created_at,
    };
  });
}

/**
 * Mengunggah satu atau banyak foto dokumentasi sekaligus (multi-upload) ke Supabase Storage
 * dan menyimpannya ke tabel dokumentasi_kegiatan.
 */
export async function uploadDokumentasi(kegiatanId: string, formData: FormData) {
  try {
    const profile = await getProfile();
    if (!profile) return { error: "Silakan login terlebih dahulu." };

    const caption = (formData.get("caption") as string) || "Dokumentasi kegiatan";
    const files = formData.getAll("foto") as File[];

    if (!files || files.length === 0 || files.every((f) => f.size === 0)) {
      return { error: "Pilih setidaknya satu file foto untuk diunggah." };
    }

    const validFiles = files.filter((f) => f.size > 0);
    const uploadedRecords: any[] = [];
    const supabase = await createClient();

    for (const file of validFiles) {
      const uploadRes = await uploadLampiran(file, `kegiatan/${kegiatanId}`);
      if (uploadRes.error) {
        console.error("Gagal upload salah satu foto:", uploadRes.error);
        continue;
      }

      if (uploadRes.url) {
        const { data: inserted, error: insertError } = await supabase
          .from("dokumentasi_kegiatan")
          .insert({
            kalender_id: kegiatanId,
            foto_url: uploadRes.url,
            caption: caption.trim(),
          })
          .select()
          .single();

        if (!insertError && inserted) {
          uploadedRecords.push(inserted);
        }
      }
    }

    if (uploadedRecords.length === 0) {
      return { error: "Gagal mengunggah foto ke storage." };
    }

    revalidatePath(`/kegiatan/${kegiatanId}/dokumentasi`);
    revalidatePath("/kegiatan");
    return { success: true, uploadedCount: uploadedRecords.length };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan sistem." };
  }
}

/**
 * Memperbarui caption foto dokumentasi.
 */
export async function updateCaptionDokumentasi(id: string, kegiatanId: string, caption: string) {
  try {
    const profile = await getProfile();
    if (!profile) return { error: "Silakan login terlebih dahulu." };

    const supabase = await createClient();
    const { error } = await supabase
      .from("dokumentasi_kegiatan")
      .update({
        caption: caption.trim(),
      })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/kegiatan/${kegiatanId}/dokumentasi`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan sistem." };
  }
}

/**
 * Menghapus foto dokumentasi.
 */
export async function deleteDokumentasi(id: string, kegiatanId: string) {
  try {
    const profile = await getProfile();
    if (!profile) return { error: "Silakan login terlebih dahulu." };

    const supabase = await createClient();
    const { error } = await supabase
      .from("dokumentasi_kegiatan")
      .delete()
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/kegiatan/${kegiatanId}/dokumentasi`);
    revalidatePath("/kegiatan");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan sistem." };
  }
}
