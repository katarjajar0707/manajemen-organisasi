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

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const now = new Date().toISOString();
      // Perbarui waktu terakhir aktif di profil pengguna
      await supabase
        .from('profiles')
        .update({ last_seen_at: now })
        .eq('id', user.id);

      // Cari sesi login terakhir pengguna yang belum tercatat logout
      const { data: latestLogin } = await supabase
        .from('login_history')
        .select('id')
        .eq('user_id', user.id)
        .is('logged_out_at', null)
        .order('logged_in_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestLogin) {
        await supabase
          .from('login_history')
          .update({ logged_out_at: now })
          .eq('id', latestLogin.id);
      }
    }
  } catch (error) {
    console.warn('[auth-logout] Gagal mencatat waktu logout:', error);
  }

  await supabase.auth.signOut();
  
  revalidatePath("/", "layout");
  redirect("/login");
}
