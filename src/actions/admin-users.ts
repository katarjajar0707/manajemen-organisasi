'use server';

import { createAdminClient, getProfile } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { syncProfilesToAnggota } from '@/lib/sync-anggota';

async function requireAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return { authorized: false, error: 'Akses ditolak: Hanya Administrator yang berhak mengelola data akun pengguna lain.' };
  }
  return { authorized: true, profile };
}

export async function getUsers() {
  const supabase = await createAdminClient();
  // Jalankan sinkronisasi background jika ada profile belum tersinkron
  syncProfilesToAnggota().catch((error) => console.error('Error syncing profiles to anggota:', error));

  const { data: profiles, error } = await supabase.from('profiles').select('id, nama, username, foto_url, role, bagian_id, created_at, bagian:bagian_id(id, nama)').order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  // Ambil foto profil dari tabel anggota jika ada fallback
  const { data: anggotaPhotos } = await supabase.from('anggota').select('id, foto_url');
  const anggotaPhotoMap = new Map<string, string>();
  if (anggotaPhotos) {
    for (const a of anggotaPhotos) {
      if (a.foto_url) anggotaPhotoMap.set(a.id, a.foto_url);
    }
  }

  // Try fetching nomor_wa separately (column mungkin belum ada di DB)
  const waMap = new Map<string, string>();
  try {
    const { data: waData } = await supabase.from('profiles').select('id, nomor_wa');
    if (waData) {
      for (const w of waData) {
        waMap.set(w.id, (w as any).nomor_wa || '');
      }
    }
  } catch {
    // Column belum ada, skip
  }

  // Fetch emails from auth.users for each profile
  const { data: authListData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = new Map<string, string>();
  if (authListData?.users) {
    for (const u of authListData.users) {
      emailMap.set(u.id, u.email || '');
    }
  }

  // Normalize bagian from array (Supabase FK join) to single object
  const normalized = (profiles || []).map((p: any) => ({
    ...p,
    foto_url: p.foto_url || anggotaPhotoMap.get(p.id) || null,
    nomor_wa: waMap.get(p.id) || '',
    email: emailMap.get(p.id) || '',
    bagian: Array.isArray(p.bagian) ? p.bagian[0] || null : p.bagian || null,
  }));

  return normalized;
}

export async function createUser(formData: FormData) {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return { error: authCheck.error };
  }

  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;
  const nama = (formData.get('nama') as string)?.trim();
  const role = formData.get('role') as string;
  const bagian_id = (formData.get('bagian_id') as string)?.trim() || null;
  const kontak = (formData.get('kontak') as string)?.trim() || '-';
  const rt_rw = (formData.get('rt_rw') as string)?.trim() || 'RT 01 / RW 05';
  const jabatanInput = (formData.get('jabatan') as string)?.trim();
  const jabatan = jabatanInput || (role === 'ketua' ? 'Ketua' : role === 'admin' ? 'Administrator' : 'Anggota');

  if (!email || !password || !nama || !role) {
    return { error: 'Nama, email, password, dan role wajib diisi.' };
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
      return { error: authError?.message || 'Gagal membuat akun auth.' };
    }

    const userId = authData.user.id;

    // 2. Update profile with role and bagian_id
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: role,
        bagian_id: bagian_id || null,
      })
      .eq('id', userId);

    if (profileError) {
      return { error: 'Akun auth dibuat, tetapi gagal mengupdate role/bagian: ' + profileError.message };
    }

    // 3. Otomatis sinkronisasi ke tabel anggota agar langsung tertera di tabel anggota & profil
    await syncProfilesToAnggota();
    await supabase.from('anggota').update({ kontak, rt_rw, jabatan }).eq('id', userId);

    revalidatePath('/pengguna');
    revalidatePath('/profil');
    revalidatePath('/anggota');
    revalidatePath('/struktur');
    revalidatePath('/dashboard');
    revalidatePath('/');

    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan internal.' };
  }
}

export async function updateUser(userId: string, formData: FormData) {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return { error: authCheck.error };
  }

  const nama = (formData.get('nama') as string)?.trim();
  const username = (formData.get('username') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const nomor_wa = (formData.get('nomor_wa') as string)?.trim();
  const role = formData.get('role') as string;
  const bagian_id = (formData.get('bagian_id') as string)?.trim() || null;
  const kontak = (formData.get('kontak') as string)?.trim();
  const rt_rw = (formData.get('rt_rw') as string)?.trim();
  const jabatan = (formData.get('jabatan') as string)?.trim();

  try {
    const supabase = await createAdminClient();

    // Update email via auth admin API if provided
    if (email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
        email,
      });
      if (authError) {
        return { error: 'Gagal mengupdate email: ' + authError.message };
      }
    }

    const profileUpdate: any = {
      role: role,
      bagian_id: bagian_id || null,
    };
    if (nama) profileUpdate.nama = nama;
    if (username) profileUpdate.username = username;
    if (nomor_wa !== undefined && nomor_wa !== null) profileUpdate.nomor_wa = nomor_wa;

    let { error } = await supabase.from('profiles').update(profileUpdate).eq('id', userId);

    if (error && error.message?.includes('nomor_wa')) {
      delete profileUpdate.nomor_wa;
      const retry = await supabase.from('profiles').update(profileUpdate).eq('id', userId);
      error = retry.error;
    }

    if (error) {
      return { error: error.message };
    }

    // Sinkronkan ke tabel anggota
    const anggotaUpdate: any = {
      bagian_id: bagian_id || null,
    };
    if (nama) anggotaUpdate.nama = nama;
    if (jabatan) anggotaUpdate.jabatan = jabatan;
    if (kontak || nomor_wa) anggotaUpdate.kontak = kontak || nomor_wa;
    if (rt_rw) anggotaUpdate.rt_rw = rt_rw;

    await supabase.from('anggota').update(anggotaUpdate).eq('id', userId);
    await syncProfilesToAnggota();

    revalidatePath('/pengguna');
    revalidatePath('/profil');
    revalidatePath('/anggota');
    revalidatePath('/struktur');
    revalidatePath('/dashboard');
    revalidatePath('/');

    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan internal.' };
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
    await supabase.from('anggota').delete().eq('id', userId);

    // Deleting from auth.users will cascade to public.profiles due to FK ON DELETE CASCADE
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/pengguna');
    revalidatePath('/profil');
    revalidatePath('/anggota');
    revalidatePath('/struktur');
    revalidatePath('/dashboard');
    revalidatePath('/');

    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan internal.' };
  }
}
