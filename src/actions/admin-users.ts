"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  const supabase = await createAdminClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, nama, username, role, bagian_id, bagian:bagian_id(id, nama)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return profiles || [];
}

export async function createUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nama = formData.get("nama") as string;
  const role = formData.get("role") as string;
  const bagian_id = formData.get("bagian_id") as string;

  if (!email || !password || !nama || !role) {
    return { error: "Semua kolom wajib diisi (kecuali bagian jika Admin)" };
  }

  try {
    const supabase = await createAdminClient();

    // 1. Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nama,
      },
    });

    if (authError || !authData.user) {
      return { error: authError?.message || "Gagal membuat akun auth." };
    }

    const userId = authData.user.id;

    // 2. The trigger `handle_new_user` will automatically create a profile for this user.
    // However, it creates it with default 'anggota' role and no bagian_id.
    // We need to update the newly created profile with the requested role and bagian_id.
    
    // We update using the admin client, so RLS is bypassed or we satisfy the admin policies.
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role: role,
        bagian_id: bagian_id || null,
      })
      .eq("id", userId);

    if (profileError) {
      return { error: "Akun auth dibuat, tetapi gagal mengupdate role/bagian: " + profileError.message };
    }

    revalidatePath("/pengguna");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal." };
  }
}

export async function updateUser(userId: string, formData: FormData) {
  const role = formData.get("role") as string;
  const bagian_id = formData.get("bagian_id") as string;

  try {
    const supabase = await createAdminClient();
    
    const { error } = await supabase
      .from("profiles")
      .update({
        role: role,
        bagian_id: bagian_id || null,
      })
      .eq("id", userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/pengguna");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal." };
  }
}

export async function deleteUser(userId: string) {
  try {
    const supabase = await createAdminClient();
    
    // Deleting from auth.users will cascade to public.profiles due to FK ON DELETE CASCADE
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/pengguna");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal." };
  }
}
