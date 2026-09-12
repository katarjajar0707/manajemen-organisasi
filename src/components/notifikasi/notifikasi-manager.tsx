'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, Bell, CalendarDays, CheckCheck, FileText, MessageSquare, Package, ReceiptText, ScrollText, Users, Wallet } from 'lucide-react';
import { markAllNotificationsAsRead, markNotificationAsRead, type AppNotification, type NotificationType } from '@/actions/notifikasi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const notificationStyle: Record<NotificationType, { label: string; icon: typeof Bell; className: string }> = {
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

function formatNotificationDate(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} jam lalu`;
  if (minutes < 7 * 24 * 60) return `${Math.floor(minutes / (24 * 60))} hari lalu`;

  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function NotifikasiManager({ initialNotifications }: { initialNotifications: AppNotification[] }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<'semua' | 'belum-dibaca'>('semua');
  const [isPending, startTransition] = useTransition();

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.dibaca).length, [notifications]);
  const visibleNotifications = useMemo(() => (filter === 'belum-dibaca' ? notifications.filter((notification) => !notification.dibaca) : notifications), [filter, notifications]);

  const handleOpen = (notification: AppNotification) => {
    startTransition(async () => {
      if (!notification.dibaca) {
        const result = await markNotificationAsRead(notification.id);
        if (result.success) {
          setNotifications((current) => current.map((item) => (item.id === notification.id ? { ...item, dibaca: true } : item)));
          window.dispatchEvent(new CustomEvent('notifications-read', { detail: { count: Math.max(unreadCount - 1, 0) } }));
        }
      }
      router.push(notification.href);
    });
  };

  const handleMarkAllRead = () => {
    const unreadIds = notifications.filter((notification) => !notification.dibaca).map((notification) => notification.id);
    if (unreadIds.length === 0) return;

    startTransition(async () => {
      const result = await markAllNotificationsAsRead(unreadIds);
      if (result.success) {
        setNotifications((current) => current.map((notification) => ({ ...notification, dibaca: true })));
        window.dispatchEvent(new CustomEvent('notifications-read', { detail: { count: 0 } }));
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bell className="h-4.5 w-4.5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Notifikasi</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">Pembaruan terbaru dari aktivitas organisasi.</p>
            </div>
          </div>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0 || isPending} className="gap-2 self-start sm:self-auto">
          <CheckCheck className="h-4 w-4" />
          Tandai semua dibaca
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Pusat aktivitas</CardTitle>
            <CardDescription className="mt-1">Kas, agenda, inventaris, pengumuman, dan data organisasi lain akan muncul di sini.</CardDescription>
          </div>
          <Badge variant={unreadCount > 0 ? 'default' : 'secondary'} className="w-fit">
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex gap-1 border-b border-border/60 px-4 py-3 sm:px-5">
            {[
              { value: 'semua', label: `Semua (${notifications.length})` },
              { value: 'belum-dibaca', label: `Belum dibaca (${unreadCount})` },
            ].map((item) => (
              <Button key={item.value} type="button" size="sm" variant={filter === item.value ? 'secondary' : 'ghost'} onClick={() => setFilter(item.value as 'semua' | 'belum-dibaca')} className="h-8">
                {item.label}
              </Button>
            ))}
          </div>

          {visibleNotifications.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Bell className="h-5 w-5" />
              </span>
              <p className="font-semibold">{filter === 'belum-dibaca' ? 'Tidak ada notifikasi baru' : 'Belum ada notifikasi'}</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">Notifikasi akan tercatat otomatis saat data organisasi ditambahkan.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {visibleNotifications.map((notification) => {
                const style = notificationStyle[notification.tipe];
                const Icon = style.icon;
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleOpen(notification)}
                    disabled={isPending}
                    className={cn('flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-5', !notification.dibaca && 'bg-primary/[0.035]')}
                  >
                    <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', style.className)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className={cn('text-sm', !notification.dibaca ? 'font-bold' : 'font-semibold')}>{notification.judul}</span>
                        {!notification.dibaca && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-label="Belum dibaca" />}
                      </span>
                      {notification.pesan && <span className="mt-0.5 block truncate text-sm text-muted-foreground">{notification.pesan}</span>}
                      <span className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{style.label}</span>
                        <span aria-hidden="true">•</span>
                        <span>{formatNotificationDate(notification.createdAt)}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
