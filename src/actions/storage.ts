'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';

/**
 * Memastikan bucket 'lampiran' sudah dibuat di Supabase Storage.
 * Jika belum ada, fungsi ini akan membuatnya secara otomatis menggunakan Service Role (Admin).
 */
async function ensureLampiranBucket(supabaseAdmin: Awaited<ReturnType<typeof createAdminClient>>) {
  try {
    const { data: bucket, error } = await supabaseAdmin.storage.getBucket('lampiran');
    if (error || !bucket) {
      const { error: createError } = await supabaseAdmin.storage.createBucket('lampiran', {
        public: true,
        fileSizeLimit: 10485760, // 10MB limit
      });
      if (createError && !createError.message?.toLowerCase().includes('already exists')) {
        console.warn("Peringatan saat membuat bucket 'lampiran':", createError.message);
      }
    }
  } catch (err) {
    console.warn("Gagal memeriksa atau membuat bucket 'lampiran':", err);
  }
}

export async function uploadLampiran(file: File, folder: string = 'umum'): Promise<{ url?: string; error?: string }> {
  try {
    if (!file) {
      return { error: 'File tidak ditemukan.' };
    }

    const supabase = await createClient();

    // Pastikan user sudah login
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'Anda harus login untuk mengunggah file.' };
    }

    const adminSupabase = await createAdminClient();

    // Pastikan bucket sudah tersedia
    await ensureLampiranBucket(adminSupabase);

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 30);
    const uniqueId = `${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const fileName = `${cleanFileName}_${uniqueId}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload menggunakan admin client agar terhindar dari kendala RLS storage
    const { error } = await adminSupabase.storage.from('lampiran').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('Supabase storage error:', error);
      return { error: `Gagal upload lampiran: ${error.message}` };
    }

    // Dapatkan URL publik
    const {
      data: { publicUrl },
    } = adminSupabase.storage.from('lampiran').getPublicUrl(filePath);

    return { url: publicUrl };
  } catch (err: unknown) {
    console.error('Upload error:', err);
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan internal saat mengunggah file.';
    return { error: message };
  }
}

export async function deleteLampiranByUrl(url: string | null | undefined): Promise<{ error?: string }> {
  if (!url) return {};

  const marker = '/storage/v1/object/public/lampiran/';
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return {};

  const filePath = decodeURIComponent(url.slice(markerIndex + marker.length).split('?')[0]);
  if (!filePath) return {};

  try {
    const adminSupabase = await createAdminClient();
    const { error } = await adminSupabase.storage.from('lampiran').remove([filePath]);
    return error ? { error: error.message } : {};
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Gagal menghapus lampiran lama.' };
  }
}
