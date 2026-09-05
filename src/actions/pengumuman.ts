"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface PengumumanItem {
  id: string;
  judul: string;
  isi: string;
  target: "semua" | "bagian_tertentu";
  bagianId: string | null;
  bagianNama?: string;
  bagianSlug?: string;
  dibuatOleh: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string | null;
  createdAt: string;
}

/**
 * Mengambil daftar pengumuman yang dapat diakses oleh user saat ini.
 */
export async function getPengumumanList(): Promise<PengumumanItem[]> {
  const supabase = await createClient();
  const profile = await getProfile();

  let query = supabase
    .from("pengumuman")
    .select(`
      *,
      bagian:bagian!bagian_id (
        id,
        nama,
        slug
      ),
      author:profiles!dibuat_oleh (
        id,
        nama,
        role,
        foto_url
      )
    `)
    .order("created_at", { ascending: false });

  // Filter client-side / query-side if user profile is restricted (RLS already handles this, but query filtering is safe)
  if (profile && profile.role !== "admin" && profile.role !== "ketua") {
    if (profile.bagian_id) {
      query = query.or(`target.eq.semua,bagian_id.eq.${profile.bagian_id},dibuat_oleh.eq.${profile.id}`);
    } else {
      query = query.or(`target.eq.semua,dibuat_oleh.eq.${profile.id}`);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching pengumuman list:", JSON.stringify(error, null, 2));
    return [];
  }

  if (!data) return [];

  return data.map((item) => ({
    id: item.id,
    judul: item.judul,
    isi: item.isi,
    target: item.target,
    bagianId: item.bagian_id,
    bagianNama: item.bagian?.nama || (item.target === "semua" ? "Semua Anggota" : "Umum"),
    bagianSlug: item.bagian?.slug || "",
    dibuatOleh: item.dibuat_oleh,
    authorName: item.author?.nama || "Pengurus",
    authorRole: item.author?.role || "anggota",
    authorAvatar: item.author?.foto_url || null,
    createdAt: item.created_at,
  }));
}

/**
 * Membuat pengumuman / broadcast baru.
 */
export async function createPengumuman(payload: {
  judul: string;
  isi: string;
  target: "semua" | "bagian_tertentu";
  bagianId?: string | null;
}): Promise<{ success: boolean; data?: PengumumanItem; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    if (!payload.judul || payload.judul.trim() === "") {
      return { success: false, error: "Judul pengumuman wajib diisi." };
    }

    if (!payload.isi || payload.isi.trim() === "") {
      return { success: false, error: "Isi pengumuman wajib diisi." };
    }

    // Role check: Admin / Ketua can broadcast to all or specific. Anggota can broadcast to their own section.
    if (payload.target === "semua" && profile.role !== "admin" && profile.role !== "ketua") {
      return { success: false, error: "Hanya Admin dan Ketua yang dapat membuat pengumuman untuk Semua Anggota." };
    }

    const targetBagianId = payload.target === "bagian_tertentu" ? (payload.bagianId || profile.bagian_id || null) : null;

    const { data, error } = await supabase
      .from("pengumuman")
      .insert({
        judul: payload.judul.trim(),
        isi: payload.isi.trim(),
        target: payload.target,
        bagian_id: targetBagianId,
        dibuat_oleh: profile.id,
      })
      .select(`
        *,
        bagian:bagian!bagian_id (
          id,
          nama,
          slug
        ),
        author:profiles!dibuat_oleh (
          id,
          nama,
          role,
          foto_url
        )
      `)
      .single();

    if (error || !data) {
      console.error("Error creating pengumuman:", JSON.stringify(error, null, 2));
      return { success: false, error: error?.message || "Gagal membuat pengumuman." };
    }

    revalidatePath("/pengumuman");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        id: data.id,
        judul: data.judul,
        isi: data.isi,
        target: data.target,
        bagianId: data.bagian_id,
        bagianNama: data.bagian?.nama || (data.target === "semua" ? "Semua Anggota" : "Umum"),
        bagianSlug: data.bagian?.slug || "",
        dibuatOleh: data.dibuat_oleh,
        authorName: data.author?.nama || profile.nama || "Pengurus",
        authorRole: data.author?.role || profile.role || "anggota",
        authorAvatar: data.author?.foto_url || profile.foto_url || null,
        createdAt: data.created_at,
      },
    };
  } catch (err: any) {
    console.error("Unexpected error creating pengumuman:", err);
    return { success: false, error: err?.message || "Terjadi kesalahan internal." };
  }
}

/**
 * Mengubah pengumuman.
 */
export async function updatePengumuman(
  id: string,
  payload: {
    judul?: string;
    isi?: string;
    target?: "semua" | "bagian_tertentu";
    bagianId?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    const updateData: Record<string, any> = {};
    if (payload.judul !== undefined) updateData.judul = payload.judul.trim();
    if (payload.isi !== undefined) updateData.isi = payload.isi.trim();
    if (payload.target) {
      updateData.target = payload.target;
      updateData.bagian_id = payload.target === "bagian_tertentu" ? (payload.bagianId || null) : null;
    }

    const { error } = await supabase
      .from("pengumuman")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating pengumuman:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/pengumuman");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error updating pengumuman:", err);
    return { success: false, error: err?.message || "Terjadi kesalahan internal." };
  }
}

/**
 * Menghapus pengumuman.
 */
export async function deletePengumuman(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    const { error } = await supabase.from("pengumuman").delete().eq("id", id);

    if (error) {
      console.error("Error deleting pengumuman:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/pengumuman");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error deleting pengumuman:", err);
    return { success: false, error: err?.message || "Terjadi kesalahan internal." };
  }
}
