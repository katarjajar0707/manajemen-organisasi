'use server';

import { createClient, getProfile } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type NotificationType =
  | 'keuangan'
  | 'kegiatan'
  | 'inventaris'
  | 'peminjaman'
  | 'pengumuman'
  | 'diskusi'
  | 'arsip'
  | 'agenda'
  | 'anggota'
  | 'catatan'
  | 'surat';

export interface AppNotification {
  id: string;
  tipe: NotificationType;
  judul: string;
  pesan: string | null;
  href: string;
  sumber: string;
  createdAt: string;
  dibaca: boolean;
}

export async function getNotifikasi(limit = 50): Promise<AppNotification[]> {
  const profile = await getProfile();
  if (!profile) return [];

  const supabase = await createClient();
  const [notificationsResult, readResult] = await Promise.all([
    supabase
      .from('notifikasi')
      .select('id, tipe, judul, pesan, href, sumber, created_at')
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase.from('notifikasi_status').select('notifikasi_id').eq('user_id', profile.id),
  ]);

  if (notificationsResult.error) {
    return [];
  }

  const readIds = new Set((readResult.data || []).map((item) => item.notifikasi_id));
  return (notificationsResult.data || []).map((item) => ({
    id: item.id,
    tipe: item.tipe as NotificationType,
    judul: item.judul,
    pesan: item.pesan,
    href: item.href,
    sumber: item.sumber,
    createdAt: item.created_at,
    dibaca: readIds.has(item.id),
  }));
}

export async function getUnreadNotificationCount(): Promise<number> {
  const profile = await getProfile();
  if (!profile) return 0;

  const supabase = await createClient();
  const [notifRes, readRes] = await Promise.all([
    supabase
      .from('notifikasi')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('notifikasi_status').select('notifikasi_id').eq('user_id', profile.id),
  ]);

  if (notifRes.error || !notifRes.data) return 0;
  const readIds = new Set((readRes.data || []).map((r) => r.notifikasi_id));
  return notifRes.data.filter((n) => !readIds.has(n.id)).length;
}

export async function markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
  const profile = await getProfile();
  if (!profile || !notificationId) return { success: false };

  const supabase = await createClient();
  const { error } = await supabase.from('notifikasi_status').upsert(
    { notifikasi_id: notificationId, user_id: profile.id, dibaca_at: new Date().toISOString() },
    { onConflict: 'notifikasi_id,user_id', ignoreDuplicates: true },
  );

  if (error) {
    console.error('markNotificationAsRead error:', error);
    return { success: false };
  }

  try {
    revalidatePath('/notifikasi');
    revalidatePath('/', 'layout');
  } catch {
    // ignore
  }

  return { success: true };
}

export async function markAllNotificationsAsRead(notificationIds?: string[]): Promise<{ success: boolean }> {
  const profile = await getProfile();
  if (!profile) return { success: false };

  const supabase = await createClient();

  let idsToMark = notificationIds && notificationIds.length > 0 ? notificationIds : undefined;

  // Jika tidak diberikan ID spesifik, ambil semua notifikasi yang belum dibaca
  if (!idsToMark || idsToMark.length === 0) {
    const { data: allNotif } = await supabase
      .from('notifikasi')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(100);
    idsToMark = (allNotif || []).map((n) => n.id);
  }

  if (idsToMark.length === 0) {
    try {
      revalidatePath('/notifikasi');
      revalidatePath('/', 'layout');
    } catch {}
    return { success: true };
  }

  const rows = idsToMark.map((notificationId) => ({
    notifikasi_id: notificationId,
    user_id: profile.id,
    dibaca_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('notifikasi_status').upsert(rows, {
    onConflict: 'notifikasi_id,user_id',
    ignoreDuplicates: true,
  });

  if (error) {
    console.error('markAllNotificationsAsRead error:', error);
    return { success: false };
  }

  try {
    revalidatePath('/notifikasi');
    revalidatePath('/', 'layout');
  } catch {
    // ignore
  }

  return { success: true };
}
