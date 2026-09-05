"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Menambahkan periode kepengurusan baru di bawah sebuah agenda.
 * Khusus role 'admin' atau 'ketua'.
 */
export async function createPeriode(formData: FormData) {
  try {
    const profile = await getProfile();
    if (!profile) return { error: "Silakan login terlebih dahulu." };
    if (profile.role !== "admin" && profile.role !== "ketua") {
      return { error: "Hanya role Ketua atau Admin yang berhak menambahkan periode kepengurusan." };
    }

    const agenda_organisasi_id = formData.get("agenda_organisasi_id") as string;
    const nama_periode = formData.get("nama_periode") as string;
    const tanggal_mulai = formData.get("tanggal_mulai") as string;
    const tanggal_selesai = (formData.get("tanggal_selesai") as string) || null;
    const is_aktif = formData.get("is_aktif") === "true";

    if (!agenda_organisasi_id || !nama_periode || !tanggal_mulai) {
      return { error: "Agenda, nama periode, dan tanggal mulai wajib diisi." };
    }

    const supabase = await createClient();

    // Jika dijadikan periode aktif, nonaktifkan periode lain di agenda yang sama
    if (is_aktif) {
      await supabase
        .from("periode_kepengurusan")
        .update({ is_aktif: false })
        .eq("agenda_organisasi_id", agenda_organisasi_id);
    }

    const { data, error } = await supabase
      .from("periode_kepengurusan")
      .insert({
        agenda_organisasi_id,
        nama_periode: nama_periode.trim(),
        tanggal_mulai,
        tanggal_selesai: tanggal_selesai || null,
        is_aktif,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/struktur");
    return { success: true, periode: data };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan sistem." };
  }
}

/**
 * Mengubah status periode aktif pada sebuah agenda organisasi.
 */
export async function setActivePeriode(agendaId: string, periodeId: string) {
  try {
    const profile = await getProfile();
    if (!profile) return { error: "Silakan login terlebih dahulu." };
    if (profile.role !== "admin" && profile.role !== "ketua") {
      return { error: "Hanya role Ketua atau Admin yang berhak mengubah periode aktif." };
    }

    const supabase = await createClient();

    // 1. Nonaktifkan semua periode di agenda ini
    await supabase
      .from("periode_kepengurusan")
      .update({ is_aktif: false })
      .eq("agenda_organisasi_id", agendaId);

    // 2. Aktifkan periode target
    const { error } = await supabase
      .from("periode_kepengurusan")
      .update({ is_aktif: true })
      .eq("id", periodeId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/struktur");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan sistem." };
  }
}

/**
 * Menghapus periode kepengurusan.
 */
export async function deletePeriode(id: string, agendaId: string) {
  try {
    const profile = await getProfile();
    if (!profile) return { error: "Silakan login terlebih dahulu." };
    if (profile.role !== "admin" && profile.role !== "ketua") {
      return { error: "Hanya role Ketua atau Admin yang berhak menghapus periode kepengurusan." };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("periode_kepengurusan")
      .delete()
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/struktur");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan sistem." };
  }
}
