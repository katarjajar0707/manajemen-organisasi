'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock3, Radio, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export interface LoginHistoryItem {
  id: string;
  userId: string;
  loggedInAt: string;
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

function relativeLogin(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} jam lalu`;
  return `${Math.floor(minutes / 1440)} hari lalu`;
}

export function LoginHistoryPanel({ items }: { items: LoginHistoryItem[] }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('admin-login-history')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'login_history' }, () => router.refresh())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [router]);

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
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 px-4 py-3.5 transition-colors hover:bg-muted/35 sm:items-center sm:px-5">
                <Avatar className="h-9 w-9"><AvatarImage src={item.fotoUrl || undefined} alt={item.nama} /><AvatarFallback>{initials(item.nama)}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1"><span className="truncate text-sm font-semibold">{item.nama}</span><Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{roleLabel[item.role]}</Badge></div>
                  <p className="truncate text-xs text-muted-foreground">@{item.username} · {item.email || 'Email tidak tersedia'}{item.bagianNama ? ` · ${item.bagianNama}` : ''}</p>
                </div>
                <div className="min-w-0 text-right"><p className="text-xs font-medium text-foreground">{relativeLogin(item.loggedInAt)}</p><p className="mt-0.5 hidden max-w-56 truncate text-[11px] text-muted-foreground sm:block">{formatLogin(item.loggedInAt)}</p></div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
