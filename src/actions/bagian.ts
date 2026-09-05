"use server";

import { createClient, createAdminClient, getProfile } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Bagian } from "@/types/database";

export interface BagianWithCount extends Bagian {
  member_count?: number;
}

/**
 * Fetches all bagian (departments), ordered alphabetically with member counts.
 */
export async function getBagianList(): Promise<BagianWithCount[]> {
  const supabase = await createClient();
  const { data: bagianList, error } = await supabase
    .from("bagian")
    .select("id, nama, slug, deskripsi, created_at")
    .order("nama", { ascending: true });

  if (error) {
    console.error("Error fetching bagian list:", error);
    return [];
  }

  // Count active members per bagian
  const { data: profiles } = await supabase
    .from("profiles")
    .select("bagian_id");

  const countMap: Record<string, number> = {};
  if (profiles) {
    profiles.forEach((p) => {
      if (p.bagian_id) {
        countMap[p.bagian_id] = (countMap[p.bagian_id] || 0) + 1;
      }
    });
  }

  return (bagianList as Bagian[] || []).map((b) => ({
    ...b,
    member_count: countMap[b.id] || 0,
  }));
}

/**
 * Helper to generate a URL-friendly slug from a name.
 */
function generateSlug(nama: string): string {
  return nama
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Create a new bagian (department).
 * Permitted roles: admin, ketua
 */
export async function createBagian(payload: {
  nama: string;
  deskripsi?: string;
}) {
  try {
    const profile = await getProfile();
    if (!profile) return { error: "Anda harus login terlebih dahulu." };

    if (profile.role !== "admin" && profile.role !== "ketua") {
      return { error: "Hanya admin atau ketua yang bisa menambahkan bagian." };
    }

    const nama = payload.nama.trim();
    if (!nama) return { error: "Nama bagian wajib diisi." };

    const slug = generateSlug(nama);
    if (!slug) return { error: "Nama bagian tidak valid untuk dijadikan slug." };

    const adminSupabase = await createAdminClient();

    // Check duplicate slug
    const { data: existing } = await adminSupabase
      .from("bagian")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return { error: `Bagian dengan slug "${slug}" sudah ada.` };
    }

    const { data, error } = await adminSupabase
      .from("bagian")
      .insert({
        nama,
        slug,
        deskripsi: payload.deskripsi?.trim() || null,
      })
      .select("id, nama, slug, deskripsi, created_at")
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/bagian");
    return { success: true, data: data as Bagian };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan internal.";
    return { error: message };
  }
}

/**
 * Update an existing bagian (department).
 * Permitted roles: admin, ketua
 */
export async function updateBagian(
  id: string,
  payload: { nama: string; deskripsi?: string }
) {
  try {
    const profile = await getProfile();
    if (!profile) return { error: "Anda harus login terlebih dahulu." };

    if (profile.role !== "admin" && profile.role !== "ketua") {
      return { error: "Hanya admin atau ketua yang bisa mengedit bagian." };
    }

    const nama = payload.nama.trim();
    if (!nama) return { error: "Nama bagian wajib diisi." };

    const slug = generateSlug(nama);
    if (!slug) return { error: "Nama bagian tidak valid untuk dijadikan slug." };

    const adminSupabase = await createAdminClient();

    // Check duplicate slug (excluding current id)
    const { data: existing } = await adminSupabase
      .from("bagian")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (existing) {
      return { error: `Bagian dengan slug "${slug}" sudah ada.` };
    }

    const { data, error } = await adminSupabase
      .from("bagian")
      .update({
        nama,
        slug,
        deskripsi: payload.deskripsi?.trim() || null,
      })
      .eq("id", id)
      .select("id, nama, slug, deskripsi, created_at")
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/bagian");
    return { success: true, data: data as Bagian };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan internal.";
    return { error: message };
  }
}

/**
 * Delete a bagian (department).
 * WARNING: This will cascade-delete all related data (catatan, etc.)
 * Permitted role: admin
 */
export async function deleteBagian(id: string) {
  try {
    const profile = await getProfile();
    if (!profile) return { error: "Anda harus login terlebih dahulu." };

    if (profile.role !== "admin") {
      return { error: "Hanya admin yang bisa menghapus bagian." };
    }

    const adminSupabase = await createAdminClient();

    // Prevent deleting core system bagian
    const { data: current } = await adminSupabase
      .from("bagian")
      .select("slug, nama")
      .eq("id", id)
      .single();

    if (current?.slug === "bendahara") {
      return {
        error: "Bagian 'Bendahara' adalah modul sistem keuangan utama dan tidak dapat dihapus.",
      };
    }

    // Check if any profiles are assigned to this bagian
    const { count } = await adminSupabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("bagian_id", id);

    if (count && count > 0) {
      return {
        error: `Tidak bisa menghapus bagian ini karena masih ada ${count} anggota yang terdaftar. Pindahkan anggota tersebut terlebih dahulu.`,
      };
    }

    const { error } = await adminSupabase.from("bagian").delete().eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/bagian");
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan internal.";
    return { error: message };
  }
}
