'use client';

import { useMemo, useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { markAllNotificationsAsRead, markNotificationAsRead, getNotifikasi, type AppNotification } from '@/actions/notifikasi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatNotificationDate, notificationStyle } from '@/components/notifikasi/notification-presentation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';

export function NotifikasiManager({ initialNotifications }: { initialNotifications: AppNotification[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<'semua' | 'belum-dibaca'>('semua');
  const [isPending, startTransition] = useTransition();

  // Query sinkronisasi dengan TanStack Query
  const { data: queryNotifications } = useQuery({
    queryKey: ['notifications', 'page'],
    queryFn: () => getNotifikasi(100),
    initialData: initialNotifications.length > 0 ? initialNotifications : undefined,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  useEffect(() => {
    if (queryNotifications) {
      setNotifications(queryNotifications);
    }
  }, [queryNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.dibaca).length,
    [notifications]
  );

  const visibleNotifications = useMemo(
    () => (filter === 'belum-dibaca' ? notifications.filter((notification) => !notification.dibaca) : notifications),
    [filter, notifications]
  );

  // Dengarkan event sinkronisasi lokal dan tab
  useEffect(() => {
    const handleReadEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ count: number }>).detail;
      if (typeof detail?.count === 'number') {
        if (detail.count === 0) {
          setNotifications((current) => current.map((item) => ({ ...item, dibaca: true })));
        }
      }
    };
    window.addEventListener('notifications-read', handleReadEvent);
    return () => window.removeEventListener('notifications-read', handleReadEvent);
  }, []);

  // Realtime Supabase listener
  useEffect(() => {
    const supabase = createSupabaseClient();
    const channel = supabase
      .channel('notifikasi-page')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifikasi' }, () => {
        void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifikasi_status' }, () => {
        void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleOpen = (notification: AppNotification) => {
    if (!notification.dibaca) {
      // Optimistic update instan
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? { ...item, dibaca: true } : item))
      );
      const nextCount = Math.max(unreadCount - 1, 0);
      window.dispatchEvent(new CustomEvent('notifications-read', { detail: { count: nextCount } }));
      queryClient.setQueryData(['notifications', 'unread-count'], nextCount);
      queryClient.setQueryData<AppNotification[]>(['notifications', 5], (current = []) =>
        current.map((item) => (item.id === notification.id ? { ...item, dibaca: true } : item))
      );

      void markNotificationAsRead(notification.id).then(() => {
        void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });
    }

    router.push(notification.href);
  };

  const handleMarkAllRead = () => {
    // 1. Optimistic update instan pada UI halaman & header
    setNotifications((current) => current.map((notification) => ({ ...notification, dibaca: true })));
    window.dispatchEvent(new CustomEvent('notifications-read', { detail: { count: 0 } }));
    queryClient.setQueryData(['notifications', 'unread-count'], 0);
    queryClient.setQueryData<AppNotification[]>(['notifications', 5], (current = []) =>
      current.map((notification) => ({ ...notification, dibaca: true }))
    );

    // 2. Kirim update ke server
    startTransition(async () => {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        void queryClient.invalidateQueries({ queryKey: ['notifications'] });
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

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || isPending}
          className="gap-2 self-start sm:self-auto cursor-pointer"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
          <span>Tandai semua dibaca</span>
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
              <Button
                key={item.value}
                type="button"
                size="sm"
                variant={filter === item.value ? 'secondary' : 'ghost'}
                onClick={() => setFilter(item.value as 'semua' | 'belum-dibaca')}
                className="h-8"
              >
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
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-5 cursor-pointer',
                      !notification.dibaca && 'bg-primary/[0.035]'
                    )}
                  >
                    <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', style.className)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className={cn('text-sm', !notification.dibaca ? 'font-bold text-foreground' : 'font-semibold text-foreground/90')}>
                          {notification.judul}
                        </span>
                        {!notification.dibaca && (
                          <span className="h-2 w-2 rounded-full bg-primary ring-2 ring-primary/20" aria-label="Belum dibaca" />
                        )}
                      </span>
                      {notification.pesan && (
                        <span className="mt-0.5 block truncate text-sm text-muted-foreground">{notification.pesan}</span>
                      )}
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
