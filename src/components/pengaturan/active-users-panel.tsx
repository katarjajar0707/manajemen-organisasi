'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, CircleAlert, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PreviewImage } from '@/components/common/preview-image';
import { getUserPresenceSnapshot, PresenceUser, USER_PRESENCE_EVENT, type UserPresenceSnapshot } from '@/lib/user-presence';

function roleLabel(role: string) {
  return role === 'admin' ? 'Administrator' : role === 'ketua' ? 'Ketua' : 'Anggota';
}

function pageLabel(pathname?: string) {
  if (!pathname || pathname === '/dashboard') return 'Dashboard';
  return pathname === '/pengaturan' ? 'Pengaturan Sistem' : pathname.slice(1).replaceAll('/', ' › ');
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function ActiveUsersPanel() {
  const [snapshot, setSnapshot] = useState<UserPresenceSnapshot>(() => getUserPresenceSnapshot());

  useEffect(() => {
    const handlePresenceUpdate = (event: Event) => setSnapshot((event as CustomEvent<UserPresenceSnapshot>).detail);
    window.addEventListener(USER_PRESENCE_EVENT, handlePresenceUpdate);

    return () => {
      window.removeEventListener(USER_PRESENCE_EVENT, handlePresenceUpdate);
    };
  }, []);

  const activeUsers = useMemo(() => {
    const latestByUser = new Map<string, PresenceUser>();

    Object.values(snapshot.users)
      .flat()
      .forEach((user) => {
        if (!user.userId) return;
        const previous = latestByUser.get(user.userId);
        if (!previous || (user.aktifSejak || '') > (previous.aktifSejak || '')) latestByUser.set(user.userId, user);
      });

    return [...latestByUser.values()].sort((left, right) => left.nama.localeCompare(right.nama, 'id'));
  }, [snapshot.users]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              Pengguna yang Sedang Aktif
            </CardTitle>
            <CardDescription className="mt-0.5">Status live pengguna yang sedang membuka portal pengurus.</CardDescription>
          </div>
          <Badge variant="outline" className="shrink-0 gap-1.5 text-xs">
            <span className={`size-1.5 rounded-full ${snapshot.connectionState === 'connected' ? 'bg-emerald-500 animate-pulse' : snapshot.connectionState === 'error' ? 'bg-destructive' : 'bg-muted-foreground'}`} />
            {snapshot.connectionState === 'connected' ? `${activeUsers.length} aktif` : snapshot.connectionState === 'error' ? 'Terputus' : 'Menghubungkan'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {snapshot.connectionState === 'error' ? (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            <CircleAlert className="h-4 w-4 shrink-0" />
            Status pengguna aktif belum dapat disinkronkan. Periksa koneksi realtime Supabase.
          </div>
        ) : activeUsers.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {activeUsers.map((user) => (
              <div key={user.userId} className="flex min-w-0 items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                {user.fotoUrl ? (
                  <PreviewImage src={user.fotoUrl} alt={user.nama} className="size-9 shrink-0 rounded-full border border-border object-cover" />
                ) : (
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {initials(user.nama)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{user.nama}</p>
                  <p className="truncate text-xs text-muted-foreground">Membuka: {pageLabel(user.halaman)}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px]">{roleLabel(user.role)}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/70 p-4 text-xs text-muted-foreground">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Belum ada pengguna aktif yang terdeteksi.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
