"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadLampiran } from "./storage";
import { revalidatePath } from "next/cache";

/**
 * Mengambil profil pengguna yang sedang login beserta relasi bagian.
 */
export async function getMyProfile() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nama, username, foto_url, bio, role, created_at, bagian:bagian_id(id, nama, slug)")
    .eq("id", user.id)
    .single();

  // Gabungkan email dari auth.users ke respons
  if (profile) {
    // Supabase bisa mengembalikan bagian sebagai array — normalisasi ke objek tunggal
    const bagianRaw = profile.bagian;
    const bagian = Array.isArray(bagianRaw) ? bagianRaw[0] ?? null : bagianRaw ?? null;
    return { ...profile, bagian, email: user.email };
  }
  return null;
}

/**
 * Update profil pengguna (nama, username, bio).
 * Role bersifat read-only — tidak bisa diubah dari sini.
 */
export async function updateProfile(formData: FormData) {
  try {
    const nama = formData.get("nama") as string;
    const username = formData.get("username") as string;
    const bio = formData.get("bio") as string;

    if (!nama?.trim() || !username?.trim()) {
      return { error: "Nama dan username wajib diisi." };
    }

    // Validasi format username: hanya alfanumerik, underscore, titik
    const usernameRegex = /^[a-zA-Z0-9_.]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return { error: "Username hanya boleh berisi huruf, angka, underscore, atau titik (3-30 karakter)." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthenticated" };

    // Cek apakah username sudah dipakai user lain
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .single();

    if (existingUser) {
      return { error: "Username sudah digunakan oleh pengguna lain." };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        nama: nama.trim(),
        username: username.trim(),
        bio: bio?.trim() || null,
      })
      .eq("id", user.id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/profil");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal." };
  }
}

/**
 * Upload foto profil ke Supabase Storage bucket "lampiran" subfolder "avatar",
 * lalu simpan URL-nya ke kolom foto_url di tabel profiles.
 */
export async function updateAvatar(formData: FormData) {
  try {
    const file = formData.get("avatar") as File | null;

    if (!file || file.size === 0) {
      return { error: "File foto tidak ditemukan." };
    }

    // Validasi ukuran (maks 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { error: "Ukuran foto maksimal 2MB." };
    }

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return { error: "Format foto harus JPEG, PNG, WebP, atau GIF." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthenticated" };

    const uploadRes = await uploadLampiran(file, `avatar/${user.id}`);
    if (uploadRes.error) {
      return { error: uploadRes.error };
    }

    // Simpan URL ke profiles
    const { error } = await supabase
      .from("profiles")
      .update({ foto_url: uploadRes.url })
      .eq("id", user.id);

    if (error) {
      // Gagal simpan ke DB — seharusnya kita hapus file dari storage,
      // tapi untuk MVP ini kita log saja.
      console.error("Failed to save avatar URL to DB:", error);
      return { error: "Gagal menyimpan foto profil ke database." };
    }

    revalidatePath("/profil");
    return { success: true, url: uploadRes.url };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal." };
  }
}

/**
 * Ganti kata sandi pengguna via Supabase Auth.
 */
export async function changePassword(formData: FormData) {
  try {
    const newPassword = formData.get("newPassword") as string;

    if (!newPassword || newPassword.length < 6) {
      return { error: "Kata sandi baru minimal 6 karakter." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal." };
  }
}
