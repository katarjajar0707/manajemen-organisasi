"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadLampiran } from "./storage";
import { revalidatePath } from "next/cache";

export async function getCatatanList(bagianSlug: string) {
  const supabase = await createClient();

  // Get bagian ID
  const { data: bagian } = await supabase
    .from("bagian")
    .select("id")
    .eq("slug", bagianSlug)
    .single();

  if (!bagian) {
    return [];
  }

  const { data: catatanList, error } = await supabase
    .from("catatan")
    .select(`
      *,
      author:profiles!catatan_dibuat_oleh_fkey (
        nama,
        role
      )
    `)
    .eq("bagian_id", bagian.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching catatan:", error);
    return [];
  }

  return catatanList || [];
}

export async function createCatatan(formData: FormData, bagianSlug: string) {
  try {
    const judul = formData.get("judul") as string;
    const isi = formData.get("isi") as string;
    const file = formData.get("lampiran") as File | null;

    if (!judul || !isi) {
      return { error: "Judul dan isi catatan wajib diisi." };
    }

    const supabase = await createClient();

    // Get current user profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthenticated" };

    // Get bagian
    const { data: bagian } = await supabase
      .from("bagian")
      .select("id")
      .eq("slug", bagianSlug)
      .single();

    if (!bagian) return { error: "Bagian tidak ditemukan." };

    let lampiran_url = null;
    if (file && file.size > 0) {
      const uploadRes = await uploadLampiran(file, `catatan/${bagianSlug}`);
      if (uploadRes.error) {
        return { error: uploadRes.error };
      }
      lampiran_url = uploadRes.url;
    }

    const { error } = await supabase.from("catatan").insert({
      bagian_id: bagian.id,
      judul,
      isi,
      lampiran_url,
      dibuat_oleh: user.id,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/bagian/${bagianSlug}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal." };
  }
}

export async function updateCatatan(id: string, formData: FormData, bagianSlug: string) {
  try {
    const judul = formData.get("judul") as string;
    const isi = formData.get("isi") as string;
    const file = formData.get("lampiran") as File | null;
    const removeLampiran = formData.get("removeLampiran") === "true";

    if (!judul || !isi) {
      return { error: "Judul dan isi catatan wajib diisi." };
    }

    const supabase = await createClient();
    
    // Authorization check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthenticated" };

    const { data: existingCatatan } = await supabase
      .from("catatan")
      .select("dibuat_oleh, lampiran_url")
      .eq("id", id)
      .single();

    if (!existingCatatan) return { error: "Catatan tidak ditemukan." };
    
    // Note: RLS should also handle this, but we check here too.
    if (existingCatatan.dibuat_oleh !== user.id) {
       // Allow if user is admin or ketua
       const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
       if (!profile || (profile.role !== "admin" && profile.role !== "ketua")) {
         return { error: "Anda tidak berhak mengedit catatan ini." };
       }
    }

    let lampiran_url = existingCatatan.lampiran_url;
    
    if (removeLampiran) {
      lampiran_url = null;
    } else if (file && file.size > 0) {
      const uploadRes = await uploadLampiran(file, `catatan/${bagianSlug}`);
      if (uploadRes.error) {
        return { error: uploadRes.error };
      }
      lampiran_url = uploadRes.url;
    }

    const { error } = await supabase
      .from("catatan")
      .update({
        judul,
        isi,
        lampiran_url,
      })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/bagian/${bagianSlug}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal." };
  }
}

export async function deleteCatatan(id: string, bagianSlug: string) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("catatan")
      .update({ deleted_at: new Date().toISOString() }) // soft delete
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/bagian/${bagianSlug}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal." };
  }
}
