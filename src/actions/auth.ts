"use server";

import { createClient } from "@/lib/supabase/server";
import { getPengaturanSistem } from "@/actions/pengaturan";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let redirectPath = '/dashboard';

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    // Tidak menghalangi login bila migration audit belum diterapkan. Kebijakan
    // INSERT membatasi record agar pengguna hanya dapat mencatat dirinya sendiri.
    const { error: loginHistoryError } = await supabase
      .from('login_history')
      .insert({ user_id: data.user.id, auth_method: 'password' });
    if (loginHistoryError) {
      console.warn('[auth-login] Login history was not recorded:', loginHistoryError.message);
    }

    const settings = await getPengaturanSistem();
    if (settings.keamanan.modeMaintenance) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        redirectPath = '/maintenance';
      }
    }

  } catch (error) {
    console.error('[auth-login] Failed to sign in', {
      message: error instanceof Error ? error.message : String(error),
    });
    return { error: 'Layanan masuk sedang tidak tersedia. Silakan coba lagi beberapa saat lagi.' };
  }

  revalidatePath('/', 'layout');
  redirect(redirectPath);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  revalidatePath("/", "layout");
  redirect("/login");
}
