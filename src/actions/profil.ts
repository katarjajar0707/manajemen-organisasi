'use server';

import { createClient } from '@/lib/supabase/server';
import { uploadLampiran } from './storage';
import { revalidatePath } from 'next/cache';
import { syncProfilesToAnggota } from '@/lib/sync-anggota';
import { isImageFile } from '@/lib/utils';

/**
 * Mengambil profil pengguna yang sedang login beserta relasi bagian & kontak WhatsApp.
 */
export async function getMyProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile } = await supabase.from('profiles').select('*, bagian:bagian_id(id, nama, slug)').eq('id', user.id).single();

  // Ambil kontak dari tabel anggota untuk memastikan nomor WhatsApp sinkron
  const { data: anggotaData } = await supabase.from('anggota').select('kontak').eq('id', user.id).maybeSingle();

  if (profile) {
    const bagianRaw = profile.bagian;
    const bagian = Array.isArray(bagianRaw) ? (bagianRaw[0] ?? null) : (bagianRaw ?? null);

    // Ambil nomor_wa dari kolom profile jika ada, fallback ke anggota.kontak
    const nomorWaFromDb = (profile as any).nomor_wa || (anggotaData?.kontak && anggotaData.kontak !== '-' ? anggotaData.kontak : '');

    return {
      ...profile,
      bagian,
      email: user.email,
      nomor_wa: nomorWaFromDb || '',
    };
  }
  return null;
}

/**
 * Update profil pengguna sendiri (Nama Lengkap, Username, Nomor WhatsApp, Password opsional).
 * Role dan Bagian bersifat terkunci — hanya admin yang bisa mengubahnya di Manajemen Pengguna.
 */
export async function updateMyProfile(formData: FormData) {
  try {
    const nama = (formData.get('nama') as string)?.trim();
    const username = (formData.get('username') as string)?.trim().toLowerCase();
    const nomorWa = (formData.get('nomor_wa') as string)?.trim() || '';
    const bio = (formData.get('bio') as string)?.trim() || '';
    const newPassword = (formData.get('newPassword') as string) || '';
    const confirmPassword = (formData.get('confirmPassword') as string) || '';

    // 1. Validasi Nama Lengkap
    if (!nama || nama.length < 2) {
      return { error: 'Nama lengkap wajib diisi minimal 2 karakter.' };
    }
    if (nama.length > 100) {
      return { error: 'Nama lengkap maksimal 100 karakter.' };
    }

    // 2. Validasi Username
    if (!username) {
      return { error: 'Username wajib diisi.' };
    }
    const usernameRegex = /^[a-zA-Z0-9_.]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return { error: 'Username hanya boleh berisi huruf, angka, underscore, atau titik (3-30 karakter).' };
    }

    // 3. Validasi Nomor WhatsApp (jika diisi)
    if (nomorWa) {
      const phoneRegex = /^[0-9+\s\-]{8,20}$/;
      if (!phoneRegex.test(nomorWa)) {
        return { error: 'Format nomor WhatsApp tidak valid. Gunakan angka, contoh: 08123456789 atau +628123456789.' };
      }
    }

    // 4. Validasi Kata Sandi Baru (jika diisi)
    if (newPassword) {
      if (newPassword.length < 6) {
        return { error: 'Kata sandi baru minimal 6 karakter.' };
      }
      if (newPassword !== confirmPassword) {
        return { error: 'Konfirmasi kata sandi baru tidak sesuai.' };
      }
    }

    // 5. Autentikasi Pengguna yang Sedang Login
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Sesi login tidak valid atau telah kedaluwarsa. Silakan login kembali.' };
    }

    // 6. Validasi Keunikan Username (tidak boleh dipakai pengguna lain)
    const { data: existingUser } = await supabase.from('profiles').select('id').eq('username', username).neq('id', user.id).maybeSingle();

    if (existingUser) {
      return { error: 'Username @' + username + ' sudah digunakan oleh pengguna lain.' };
    }

    // 7. Update Tabel profiles (Hanya record milik user.id)
    const profileUpdateData: Record<string, any> = {
      nama,
      username,
      bio: bio || null,
    };

    // Coba update dengan kolom nomor_wa
    let { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ ...profileUpdateData, nomor_wa: nomorWa || null })
      .eq('id', user.id);

    // Fallback jika kolom nomor_wa belum dieksekusi di skema Postgres Supabase
    if (updateProfileError && updateProfileError.message.includes('nomor_wa')) {
      const fallback = await supabase.from('profiles').update(profileUpdateData).eq('id', user.id);
      updateProfileError = fallback.error;
    }

    if (updateProfileError) {
      return { error: 'Gagal memperbarui profil: ' + updateProfileError.message };
    }

    // 8. Sinkronisasi ke tabel anggota setelah profil berhasil diperbarui.
    try {
      await syncProfilesToAnggota();
      await supabase
        .from('anggota')
        .update({ kontak: nomorWa || '-' })
        .eq('id', user.id);
    } catch (syncErr) {
      console.warn('Peringatan sinkronisasi profil ke anggota:', syncErr);
    }

    // 9. Update Kata Sandi & Metadata di Supabase Auth jika ada perubahan
    const authUpdatePayload: { password?: string; data?: { nama: string } } = {
      data: { nama },
    };
    if (newPassword) {
      authUpdatePayload.password = newPassword;
    }

    const { error: authError } = await supabase.auth.updateUser(authUpdatePayload);
    if (authError && newPassword) {
      return { error: `Profil berhasil diperbarui, namun penggantian kata sandi gagal: ${authError.message}` };
    }

    // 10. Revalidasi seluruh rute cache
    revalidatePath('/profil');
    revalidatePath('/dashboard');
    revalidatePath('/pengguna');
    revalidatePath('/anggota');
    revalidatePath('/struktur');
    revalidatePath('/', 'layout');

    return {
      success: true,
      message: newPassword ? 'Profil dan kata sandi berhasil diperbarui!' : 'Profil akun Anda berhasil diperbarui!',
      data: {
        nama,
        username,
        nomor_wa: nomorWa,
      },
    };
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan internal saat memperbarui profil.' };
  }
}

/**
 * Alias untuk kompatibilitas ke belakang
 */
export async function updateProfile(formData: FormData) {
  return updateMyProfile(formData);
}

/**
 * Upload foto profil ke Supabase Storage bucket "lampiran" subfolder "avatar",
 * lalu simpan URL-nya ke kolom foto_url di tabel profiles.
 */
export async function updateAvatar(formData: FormData) {
  try {
    const file = formData.get('avatar') as File | null;

    if (!file || file.size === 0) {
      return { error: 'File foto tidak ditemukan.' };
    }

    // Validasi ukuran (maks 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { error: 'Ukuran foto maksimal 10MB.' };
    }

    // Validasi tipe file
    if (!isImageFile(file)) {
      return { error: 'File profil harus berupa gambar.' };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthenticated' };

    const uploadRes = await uploadLampiran(file, `avatar/${user.id}`);
    if (uploadRes.error) {
      return { error: uploadRes.error };
    }

    // Simpan URL ke profiles
    const { error } = await supabase.from('profiles').update({ foto_url: uploadRes.url }).eq('id', user.id);

    if (error) {
      console.error('Failed to save avatar URL to DB:', error);
      return { error: 'Gagal menyimpan foto profil ke database.' };
    }

    // Sinkronkan juga ke tabel anggota jika user sudah terdaftar
    await supabase.from('anggota').update({ foto_url: uploadRes.url }).eq('id', user.id);

    revalidatePath('/profil');
    revalidatePath('/anggota');
    revalidatePath('/struktur');
    revalidatePath('/dashboard');
    revalidatePath('/', 'layout');
    return { success: true, url: uploadRes.url };
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan internal.' };
  }
}

export async function removeAvatar() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthenticated' };

    const { error } = await supabase.from('profiles').update({ foto_url: null }).eq('id', user.id);
    if (error) {
      console.error('Failed to remove avatar URL from DB:', error);
      return { error: 'Gagal menghapus foto profil.' };
    }

    await supabase.from('anggota').update({ foto_url: null }).eq('id', user.id);

    revalidatePath('/profil');
    revalidatePath('/anggota');
    revalidatePath('/struktur');
    revalidatePath('/dashboard');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan internal.' };
  }
}

/**
 * Ganti kata sandi pengguna via Supabase Auth.
 */
export async function changePassword(formData: FormData) {
  try {
    const newPassword = formData.get('newPassword') as string;

    if (!newPassword || newPassword.length < 6) {
      return { error: 'Kata sandi baru minimal 6 karakter.' };
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
    return { error: err.message || 'Terjadi kesalahan internal.' };
  }
}
