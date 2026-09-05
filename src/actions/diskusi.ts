"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface DiskusiMentionItem {
  id: string;
  bagianId: string;
  bagianNama: string;
  bagianSlug: string;
}

export interface DiskusiItem {
  id: string;
  tipe: "diskusi" | "catatan_umum";
  judul: string;
  isi: string | null;
  bagianPembuatId: string | null;
  bagianPembuatNama: string;
  bagianPembuatSlug: string;
  dibuatOleh: string;
  authorName: string;
  authorAvatar: string | null;
  authorRole: string;
  isPinned: boolean;
  createdAt: string;
  balasanCount: number;
  mentions: DiskusiMentionItem[];
}

export interface DiskusiBalasanItem {
  id: string;
  diskusiId: string;
  isi: string;
  dibuatOleh: string;
  authorName: string;
  authorAvatar: string | null;
  authorRole: string;
  authorBagian?: string;
  createdAt: string;
}

/**
 * Mengambil seluruh topik diskusi / catatan umum dengan filter opsional.
 * Sesuai PRD 4.7: Terbuka untuk semua role & semua bagian.
 */
export async function getDiskusis(filters?: {
  tipe?: "diskusi" | "catatan_umum" | "semua";
  search?: string;
  bagianId?: string;
}): Promise<DiskusiItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("diskusi")
    .select(`
      *,
      bagian_pembuat:bagian!bagian_pembuat_id (
        id,
        nama,
        slug
      ),
      author:profiles!dibuat_oleh (
        id,
        nama,
        foto_url,
        role
      ),
      diskusi_balasan (
        id
      ),
      diskusi_mention (
        id,
        bagian:bagian!bagian_ditag_id (
          id,
          nama,
          slug
        )
      )
    `)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters?.tipe && filters.tipe !== "semua") {
    query = query.eq("tipe", filters.tipe);
  }

  if (filters?.search && filters.search.trim() !== "") {
    query = query.or(`judul.ilike.%${filters.search.trim()}%,isi.ilike.%${filters.search.trim()}%`);
  }

  if (filters?.bagianId) {
    query = query.eq("bagian_pembuat_id", filters.bagianId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching diskusis:", JSON.stringify(error, null, 2));
    return [];
  }

  if (!data) return [];

  return data.map((item) => {
    const rawMentions = Array.isArray(item.diskusi_mention) ? item.diskusi_mention : [];
    const mentions: DiskusiMentionItem[] = rawMentions
      .filter((m: any) => Boolean(m?.bagian))
      .map((m: any) => ({
        id: m.id,
        bagianId: m.bagian.id,
        bagianNama: m.bagian.nama,
        bagianSlug: m.bagian.slug,
      }));

    return {
      id: item.id,
      tipe: item.tipe,
      judul: item.judul,
      isi: item.isi,
      bagianPembuatId: item.bagian_pembuat_id,
      bagianPembuatNama: item.bagian_pembuat?.nama || "Umum",
      bagianPembuatSlug: item.bagian_pembuat?.slug || "",
      dibuatOleh: item.dibuat_oleh,
      authorName: item.author?.nama || "Anggota",
      authorAvatar: item.author?.foto_url || null,
      authorRole: item.author?.role || "anggota",
      isPinned: Boolean(item.is_pinned),
      createdAt: item.created_at,
      balasanCount: Array.isArray(item.diskusi_balasan) ? item.diskusi_balasan.length : 0,
      mentions,
    };
  });
}

/**
 * Mengambil detail satu topik diskusi beserta relasi mention.
 */
export async function getDiskusiById(id: string): Promise<DiskusiItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("diskusi")
    .select(`
      *,
      bagian_pembuat:bagian!bagian_pembuat_id (
        id,
        nama,
        slug
      ),
      author:profiles!dibuat_oleh (
        id,
        nama,
        foto_url,
        role
      ),
      diskusi_balasan (
        id
      ),
      diskusi_mention (
        id,
        bagian:bagian!bagian_ditag_id (
          id,
          nama,
          slug
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching diskusi by ID:", JSON.stringify(error, null, 2));
    return null;
  }

  const rawMentions = Array.isArray(data.diskusi_mention) ? data.diskusi_mention : [];
  const mentions: DiskusiMentionItem[] = rawMentions
    .filter((m: any) => Boolean(m?.bagian))
    .map((m: any) => ({
      id: m.id,
      bagianId: m.bagian.id,
      bagianNama: m.bagian.nama,
      bagianSlug: m.bagian.slug,
    }));

  return {
    id: data.id,
    tipe: data.tipe,
    judul: data.judul,
    isi: data.isi,
    bagianPembuatId: data.bagian_pembuat_id,
    bagianPembuatNama: data.bagian_pembuat?.nama || "Umum",
    bagianPembuatSlug: data.bagian_pembuat?.slug || "",
    dibuatOleh: data.dibuat_oleh,
    authorName: data.author?.nama || "Anggota",
    authorAvatar: data.author?.foto_url || null,
    authorRole: data.author?.role || "anggota",
    isPinned: Boolean(data.is_pinned),
    createdAt: data.created_at,
    balasanCount: Array.isArray(data.diskusi_balasan) ? data.diskusi_balasan.length : 0,
    mentions,
  };
}

/**
 * Membuat topik diskusi atau catatan umum baru beserta mention departemen.
 */
export async function createDiskusi(payload: {
  tipe: "diskusi" | "catatan_umum";
  judul: string;
  isi?: string;
  bagianPembuatId?: string | null;
  mentionBagianIds?: string[];
}): Promise<{ success: boolean; data?: DiskusiItem; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    if (!payload.judul || payload.judul.trim() === "") {
      return { success: false, error: "Judul diskusi / catatan wajib diisi." };
    }

    const bagianPembuat = payload.bagianPembuatId !== undefined ? payload.bagianPembuatId : profile.bagian_id;

    // 1. Insert topik diskusi
    const { data: insertedDiskusi, error: insertError } = await supabase
      .from("diskusi")
      .insert({
        tipe: payload.tipe,
        judul: payload.judul.trim(),
        isi: payload.isi?.trim() || null,
        bagian_pembuat_id: bagianPembuat || null,
        dibuat_oleh: profile.id,
      })
      .select()
      .single();

    if (insertError || !insertedDiskusi) {
      console.error("Error creating diskusi:", JSON.stringify(insertError, null, 2));
      return { success: false, error: insertError?.message || "Gagal membuat topik diskusi." };
    }

    // 2. Insert mention jika ada
    if (payload.mentionBagianIds && payload.mentionBagianIds.length > 0) {
      const mentionRows = payload.mentionBagianIds.map((bagianId) => ({
        diskusi_id: insertedDiskusi.id,
        bagian_ditag_id: bagianId,
      }));

      const { error: mentionError } = await supabase.from("diskusi_mention").insert(mentionRows);
      if (mentionError) {
        console.error("Error creating diskusi mentions:", mentionError);
      }
    }

    revalidatePath("/diskusi");
    revalidatePath("/dashboard");

    const fullDiskusi = await getDiskusiById(insertedDiskusi.id);
    return { success: true, data: fullDiskusi || undefined };
  } catch (err: any) {
    console.error("Unexpected error creating diskusi:", err);
    return { success: false, error: err?.message || "Terjadi kesalahan internal." };
  }
}

/**
 * Mengubah topik diskusi atau catatan umum.
 */
export async function updateDiskusi(
  id: string,
  payload: {
    tipe?: "diskusi" | "catatan_umum";
    judul?: string;
    isi?: string;
    mentionBagianIds?: string[];
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    const updateData: Record<string, any> = {};
    if (payload.tipe) updateData.tipe = payload.tipe;
    if (payload.judul !== undefined) updateData.judul = payload.judul.trim();
    if (payload.isi !== undefined) updateData.isi = payload.isi?.trim() || null;

    const { error: updateError } = await supabase
      .from("diskusi")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error("Error updating diskusi:", updateError);
      return { success: false, error: updateError.message };
    }

    // Update mentions jika diberikan
    if (payload.mentionBagianIds !== undefined) {
      await supabase.from("diskusi_mention").delete().eq("diskusi_id", id);

      if (payload.mentionBagianIds.length > 0) {
        const mentionRows = payload.mentionBagianIds.map((bagianId) => ({
          diskusi_id: id,
          bagian_ditag_id: bagianId,
        }));
        await supabase.from("diskusi_mention").insert(mentionRows);
      }
    }

    revalidatePath("/diskusi");
    revalidatePath(`/diskusi/${id}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error updating diskusi:", err);
    return { success: false, error: err?.message || "Terjadi kesalahan internal." };
  }
}

/**
 * Menghapus topik diskusi.
 */
export async function deleteDiskusi(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    const { error } = await supabase.from("diskusi").delete().eq("id", id);

    if (error) {
      console.error("Error deleting diskusi:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/diskusi");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error deleting diskusi:", err);
    return { success: false, error: err?.message || "Terjadi kesalahan internal." };
  }
}

/**
 * Toggle status PIN diskusi (hanya Admin/Ketua).
 */
export async function togglePinDiskusi(
  id: string,
  isPinned: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile || (profile.role !== "admin" && profile.role !== "ketua")) {
      return { success: false, error: "Hanya Admin atau Ketua yang dapat menyematkan topik." };
    }

    const { error } = await supabase
      .from("diskusi")
      .update({ is_pinned: isPinned })
      .eq("id", id);

    if (error) {
      console.error("Error pinning diskusi:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/diskusi");
    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error toggling pin:", err);
    return { success: false, error: err?.message || "Terjadi kesalahan internal." };
  }
}

/**
 * Mengambil daftar balasan/komentar dalam satu topik diskusi.
 */
export async function getDiskusiBalasans(diskusiId: string): Promise<DiskusiBalasanItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("diskusi_balasan")
    .select(`
      *,
      author:profiles!dibuat_oleh (
        id,
        nama,
        foto_url,
        role,
        bagian:bagian!bagian_id (
          id,
          nama
        )
      )
    `)
    .eq("diskusi_id", diskusiId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching diskusi balasans:", JSON.stringify(error, null, 2));
    return [];
  }

  if (!data) return [];

  return data.map((item) => ({
    id: item.id,
    diskusiId: item.diskusi_id,
    isi: item.isi,
    dibuatOleh: item.dibuat_oleh,
    authorName: item.author?.nama || "Anggota",
    authorAvatar: item.author?.foto_url || null,
    authorRole: item.author?.role || "anggota",
    authorBagian: item.author?.bagian?.nama || "Pengurus",
    createdAt: item.created_at,
  }));
}

/**
 * Mengirim balasan/komentar baru ke suatu topik diskusi.
 */
export async function createDiskusiBalasan(
  diskusiId: string,
  isi: string
): Promise<{ success: boolean; data?: DiskusiBalasanItem; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    if (!isi || isi.trim() === "") {
      return { success: false, error: "Isi balasan tidak boleh kosong." };
    }

    const { data: insertedBalasan, error } = await supabase
      .from("diskusi_balasan")
      .insert({
        diskusi_id: diskusiId,
        isi: isi.trim(),
        dibuat_oleh: profile.id,
      })
      .select(`
        *,
        author:profiles!dibuat_oleh (
          id,
          nama,
          foto_url,
          role,
          bagian:bagian!bagian_id (
            id,
            nama
          )
        )
      `)
      .single();

    if (error || !insertedBalasan) {
      console.error("Error creating diskusi balasan:", JSON.stringify(error, null, 2));
      return { success: false, error: error?.message || "Gagal mengirim balasan." };
    }

    revalidatePath(`/diskusi/${diskusiId}`);
    revalidatePath("/diskusi");

    return {
      success: true,
      data: {
        id: insertedBalasan.id,
        diskusiId: insertedBalasan.diskusi_id,
        isi: insertedBalasan.isi,
        dibuatOleh: insertedBalasan.dibuat_oleh,
        authorName: insertedBalasan.author?.nama || profile.nama || "Anggota",
        authorAvatar: insertedBalasan.author?.foto_url || profile.foto_url || null,
        authorRole: insertedBalasan.author?.role || profile.role || "anggota",
        authorBagian: insertedBalasan.author?.bagian?.nama || "Pengurus",
        createdAt: insertedBalasan.created_at,
      },
    };
  } catch (err: any) {
    console.error("Unexpected error creating balasan:", err);
    return { success: false, error: err?.message || "Terjadi kesalahan internal." };
  }
}

/**
 * Menghapus balasan komentar.
 */
export async function deleteDiskusiBalasan(
  id: string,
  diskusiId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const profile = await getProfile();

    if (!profile) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    const { error } = await supabase.from("diskusi_balasan").delete().eq("id", id);

    if (error) {
      console.error("Error deleting balasan:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/diskusi/${diskusiId}`);
    revalidatePath("/diskusi");

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error deleting balasan:", err);
    return { success: false, error: err?.message || "Terjadi kesalahan internal." };
  }
}
