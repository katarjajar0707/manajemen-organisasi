"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadLampiran(file: File, folder: string = "umum"): Promise<{ url?: string; error?: string }> {
  try {
    if (!file) {
      return { error: "File tidak ditemukan." };
    }

    const supabase = await createClient();

    // Pastikan user sudah login
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: "Anda harus login untuk mengunggah file." };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase
      .storage
      .from('lampiran')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Supabase storage error:", error);
      return { error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('lampiran')
      .getPublicUrl(filePath);

    return { url: publicUrl };
  } catch (err: any) {
    console.error("Upload error:", err);
    return { error: err.message || "Terjadi kesalahan internal saat mengunggah file." };
  }
}
