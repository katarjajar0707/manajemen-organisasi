'use server';

import { createClient, getProfile } from '@/lib/supabase/server';

export type NotificationType = 'keuangan' | 'kegiatan' | 'inventaris' | 'peminjaman' | 'pengumuman' | 'diskusi' | 'arsip' | 'agenda' | 'anggota' | 'catatan' | 'surat';

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
    // Notifikasi tidak boleh menghalangi halaman lain saat migrasi belum
    // diterapkan atau cache schema Supabase masih diperbarui.
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
  const notifications = await getNotifikasi();
  return notifications.filter((notification) => !notification.dibaca).length;
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
    return { success: false };
  }

  return { success: true };
}

export async function markAllNotificationsAsRead(notificationIds: string[]): Promise<{ success: boolean }> {
  const profile = await getProfile();
  if (!profile || notificationIds.length === 0) return { success: !!profile };

  const supabase = await createClient();
  const { error } = await supabase.from('notifikasi_status').upsert(
    notificationIds.map((notificationId) => ({ notifikasi_id: notificationId, user_id: profile.id, dibaca_at: new Date().toISOString() })),
    { onConflict: 'notifikasi_id,user_id', ignoreDuplicates: true },
  );

  if (error) {
    return { success: false };
  }

  return { success: true };
}
