"use server";

import { createAdminClient, getProfile } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return { authorized: false, error: "Akses ditolak: Hanya Administrator yang berhak mengelola data akun pengguna lain." };
  }
  return { authorized: true, profile };
}

export async function syncProfilesToAnggota() {
  try {
    const supabase = await createAdminClient();
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nama, role, bagian_id");

    if (!profiles || profiles.length === 0) return;

    const { data: existingAnggota } = await supabase
      .from("anggota")
      .select("id");

    const existingIds = new Set((existingAnggota || []).map((a: any) => a.id));

    const toInsert = profiles
      .filter((p: any) => !existingIds.has(p.id))
      .map((p: any) => ({
        id: p.id,
        nama: p.nama || "Pengurus",
        kontak: "-",
        rt_rw: "RT 01 / RW 05",
        jabatan: p.role === "ketua" ? "Ketua" : p.role === "admin" ? "Administrator" : "Anggota",
        bagian_id: p.bagian_id || null,
        status: "Aktif",
      }));

    if (toInsert.length > 0) {
      await supabase.from("anggota").upsert(toInsert);
    }
  } catch (err) {
    console.error("Error syncing profiles to anggota:", err);
  }
}

export async function getUsers() {
  const supabase = await createAdminClient();
  // Jalankan sinkronisasi background jika ada profile belum tersinkron
  syncProfilesToAnggota().catch(() => {});

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, nama, username, role, bagian_id, created_at, bagian:bagian_id(id, nama)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  // Normalize bagian from array (Supabase FK join) to single object
  const normalized = (profiles || []).map((p: any) => ({
    ...p,
    bagian: Array.isArray(p.bagian) ? (p.bagian[0] || null) : (p.bagian || null),
  }));

  return normalized;
}

export async function createUser(formData: FormData) {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return { error: authCheck.error };
  }

  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const nama = (formData.get("nama") as string)?.trim();
  const role = formData.get("role") as string;
  const bagian_id = (formData.get("bagian_id") as string)?.trim() || null;
  const kontak = (formData.get("kontak") as string)?.trim() || "-";
  const rt_rw = (formData.get("rt_rw") as string)?.trim() || "RT 01 / RW 05";
  const jabatanInput = (formData.get("jabatan") as string)?.trim();
  const jabatan = jabatanInput || (role === "ketua" ? "Ketua" : role === "admin" ? "Administrator" : "Anggota");

  if (!email || !password || !nama || !role) {
    return { error: "Nama, email, password, dan role wajib diisi." };
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

    // 2. Update profile with role and bagian_id
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

    // 3. Otomatis sinkronisasi ke tabel anggota agar langsung tertera di tabel anggota & profil
    const { error: anggotaError } = await supabase
      .from("anggota")
      .upsert({
        id: userId,
        nama,
        kontak,
        rt_rw,
        jabatan,
        bagian_id: bagian_id || null,
        status: "Aktif",
      });

    if (anggotaError) {
      console.warn("Peringatan sinkronisasi anggota:", anggotaError.message);
    }

    revalidatePath("/pengguna");
    revalidatePath("/profil");
    revalidatePath("/anggota");
    revalidatePath("/struktur");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal." };
  }
}

export async function updateUser(userId: string, formData: FormData) {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return { error: authCheck.error };
  }

  const nama = (formData.get("nama") as string)?.trim();
  const role = formData.get("role") as string;
  const bagian_id = (formData.get("bagian_id") as string)?.trim() || null;
  const kontak = (formData.get("kontak") as string)?.trim();
  const rt_rw = (formData.get("rt_rw") as string)?.trim();
  const jabatan = (formData.get("jabatan") as string)?.trim();

  try {
    const supabase = await createAdminClient();
    
    const profileUpdate: any = {
      role: role,
      bagian_id: bagian_id || null,
    };
    if (nama) profileUpdate.nama = nama;

    const { error } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", userId);

    if (error) {
      return { error: error.message };
    }

    // Sinkronkan ke tabel anggota
    const anggotaUpdate: any = {
      bagian_id: bagian_id || null,
    };
    if (nama) anggotaUpdate.nama = nama;
    if (jabatan) anggotaUpdate.jabatan = jabatan;
    if (kontak) anggotaUpdate.kontak = kontak;
    if (rt_rw) anggotaUpdate.rt_rw = rt_rw;

    await supabase
      .from("anggota")
      .update(anggotaUpdate)
      .eq("id", userId);

    revalidatePath("/pengguna");
    revalidatePath("/profil");
    revalidatePath("/anggota");
    revalidatePath("/struktur");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal." };
  }
}

export async function deleteUser(userId: string) {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return { error: authCheck.error };
  }

  try {
    const supabase = await createAdminClient();
    
    // Hapus juga dari tabel anggota
    await supabase.from("anggota").delete().eq("id", userId);

    // Deleting from auth.users will cascade to public.profiles due to FK ON DELETE CASCADE
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/pengguna");
    revalidatePath("/profil");
    revalidatePath("/anggota");
    revalidatePath("/struktur");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal." };
  }
}
