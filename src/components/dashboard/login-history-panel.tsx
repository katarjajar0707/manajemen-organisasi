'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock3, Radio, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { getUserPresenceSnapshot, USER_PRESENCE_EVENT, type UserPresenceSnapshot } from '@/lib/user-presence';

export interface LoginHistoryItem {
  id: string;
  userId: string;
  loggedInAt: string;
  loggedOutAt?: string | null;
  lastSeenAt?: string | null;
  nama: string;
  username: string;
  email: string;
  role: 'admin' | 'ketua' | 'anggota';
  fotoUrl: string | null;
  bagianNama: string | null;
}

const roleLabel = { admin: 'Administrator', ketua: 'Ketua', anggota: 'Anggota' };

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
}

function formatLogin(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta', timeZoneName: 'short',
  }).format(new Date(value));
}

function formatFullDateTime(value?: string | null) {
  if (!value) return '';
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta', timeZoneName: 'short',
  }).format(new Date(value));
}

function relativeLogin(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} jam lalu`;
  return `${Math.floor(minutes / 1440)} hari lalu`;
}

function formatRelativeOff(value?: string | null) {
  if (!value) return 'off';
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return 'off baru saja';
  if (minutes < 60) return `off ${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `off ${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `off ${days} hr lalu`;
  return `off ${days} hari lalu`;
}

export function LoginHistoryPanel({ items }: { items: LoginHistoryItem[] }) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<UserPresenceSnapshot>(() => getUserPresenceSnapshot());
  const [sessionOffMap, setSessionOffMap] = useState<Record<string, string>>({});
  const prevOnlineRef = useRef<Set<string>>(new Set());

  // Pantau status Realtime Presence pengguna
  useEffect(() => {
    const handlePresenceUpdate = (event: Event) => {
      const nextSnapshot = (event as CustomEvent<UserPresenceSnapshot>).detail;
      setSnapshot(nextSnapshot);

      const currentOnline = new Set(
        Object.values(nextSnapshot.users)
          .flat()
          .map((u) => u.userId)
          .filter(Boolean)
      );

      // Catat waktu pengguna yang baru saja keluar (off) selama sesi halaman ini terbuka
      const nowIso = new Date().toISOString();
      const newlyOff: Record<string, string> = {};
      for (const prevId of prevOnlineRef.current) {
        if (!currentOnline.has(prevId)) {
          newlyOff[prevId] = nowIso;
        }
      }

      if (Object.keys(newlyOff).length > 0) {
        setSessionOffMap((prev) => ({ ...prev, ...newlyOff }));
      }

      prevOnlineRef.current = currentOnline;
    };

    const initialOnline = new Set(
      Object.values(snapshot.users)
        .flat()
        .map((u) => u.userId)
        .filter(Boolean)
    );
    prevOnlineRef.current = initialOnline;

    window.addEventListener(USER_PRESENCE_EVENT, handlePresenceUpdate);
    return () => {
      window.removeEventListener(USER_PRESENCE_EVENT, handlePresenceUpdate);
    };
  }, [snapshot.users]);

  // Pantau penambahan atau pembaruan riwayat login/logout
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('admin-login-history')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'login_history' }, () => router.refresh())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'login_history' }, () => router.refresh())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [router]);

  const isUserOnline = (userId: string) => {
    return Boolean(snapshot.users[userId]?.length);
  };

  const getUserOffTime = (item: LoginHistoryItem) => {
    // Jika tercatat off pada sesi aktif saat ini
    if (sessionOffMap[item.userId]) {
      return sessionOffMap[item.userId];
    }
    // Ambil waktu terbaru antara loggedOutAt, lastSeenAt, atau loggedInAt
    const candidates = [item.loggedOutAt, item.lastSeenAt, item.loggedInAt]
      .filter((t): t is string => Boolean(t))
      .map((t) => ({ time: t, ms: new Date(t).getTime() }))
      .filter((c) => !isNaN(c.ms));

    if (candidates.length === 0) return item.loggedInAt;
    candidates.sort((a, b) => b.ms - a.ms);
    return candidates[0].time;
  };

  return (
    <Card className="overflow-hidden border-violet-200/70 bg-gradient-to-br from-card via-card to-violet-500/5 shadow-sm dark:border-violet-900/50">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-violet-600" />Riwayat login pengguna</CardTitle>
            <CardDescription className="mt-1">20 login sukses terbaru dari seluruh akun.</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"><Radio className="h-3 w-3" />Live</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground"><ShieldCheck className="h-7 w-7 text-muted-foreground/60" />Belum ada riwayat login yang tercatat.</div>
        ) : (
          <div className="divide-y divide-border/60">
            {items.map((item) => {
              const online = isUserOnline(item.userId);
              const offTime = !online ? getUserOffTime(item) : null;

              return (
                <div key={item.id} className="flex gap-3 px-4 py-3.5 transition-colors hover:bg-muted/35 sm:items-center sm:px-5">
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={item.fotoUrl || undefined} alt={item.nama} />
                      <AvatarFallback>{initials(item.nama)}</AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-card ${
                        online ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="truncate text-sm font-semibold">{item.nama}</span>
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{roleLabel[item.role]}</Badge>
                      {online ? (
                        <Badge
                          variant="outline"
                          className="h-5 gap-1 border-emerald-500/30 bg-emerald-500/10 px-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                        >
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          online
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="h-5 gap-1 border-border/80 bg-muted/50 px-1.5 text-[10px] font-normal text-muted-foreground"
                          title={offTime ? `Terakhir off: ${formatFullDateTime(offTime)}` : undefined}
                        >
                          <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                          {formatRelativeOff(offTime)}
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">@{item.username} · {item.email || 'Email tidak tersedia'}{item.bagianNama ? ` · ${item.bagianNama}` : ''}</p>
                  </div>
                  <div className="min-w-0 text-right shrink-0">
                    <p className="text-xs font-medium text-foreground">{relativeLogin(item.loggedInAt)}</p>
                    <p className="mt-0.5 hidden max-w-56 truncate text-[11px] text-muted-foreground sm:block" title={formatLogin(item.loggedInAt)}>
                      {formatLogin(item.loggedInAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

