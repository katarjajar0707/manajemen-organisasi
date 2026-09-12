import { Archive, Bell, CalendarDays, FileText, MessageSquare, Package, ReceiptText, ScrollText, Users, Wallet } from 'lucide-react';
import type { NotificationType } from '@/actions/notifikasi';

export const notificationStyle: Record<NotificationType, { label: string; icon: typeof Bell; className: string }> = {
  keuangan: { label: 'Keuangan', icon: Wallet, className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  kegiatan: { label: 'Kegiatan', icon: CalendarDays, className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  inventaris: { label: 'Inventaris', icon: Package, className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  peminjaman: { label: 'Peminjaman', icon: ReceiptText, className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
  pengumuman: { label: 'Pengumuman', icon: Bell, className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  diskusi: { label: 'Diskusi', icon: MessageSquare, className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  arsip: { label: 'Arsip', icon: Archive, className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' },
  agenda: { label: 'Agenda', icon: CalendarDays, className: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400' },
  anggota: { label: 'Anggota', icon: Users, className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  catatan: { label: 'Catatan', icon: ScrollText, className: 'bg-teal-500/10 text-teal-700 dark:text-teal-400' },
  surat: { label: 'Surat', icon: FileText, className: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400' },
};

export function formatNotificationDate(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} jam lalu`;
  if (minutes < 7 * 24 * 60) return `${Math.floor(minutes / (24 * 60))} hari lalu`;

  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
