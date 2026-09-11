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

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
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
      return { error: 'Mode pemeliharaan sedang aktif. Hanya Administrator yang dapat masuk.' };
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  revalidatePath("/", "layout");
  redirect("/login");
}
