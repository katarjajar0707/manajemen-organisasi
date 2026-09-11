'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { PreviewImage } from '@/components/common/preview-image';
import { ArrowLeft, Lock, Mail, ShieldCheck, AlertCircle } from 'lucide-react';
import { login } from '@/actions/auth';
import type { PengaturanSistemData } from '@/actions/pengaturan';

function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return 'KT';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

export function LoginClient({ settings }: { settings?: PengaturanSistemData }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const orgName = settings?.profil.nama || 'Karang Taruna';
  const orgWilayah = [settings?.profil.unitWilayah, settings?.profil.kelurahan].filter(Boolean).join(' · ');

  async function handleLogin(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await login(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/30 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
      </div>
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md space-y-4">
        {settings?.keamanan.modeMaintenance && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            Mode pemeliharaan aktif. Hanya Administrator yang dapat masuk.
          </div>
        )}
        <div className="text-center space-y-1">
          {settings?.profil.logoUrl ? (
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden border border-border/80 bg-background mb-2 shadow-md">
              <PreviewImage src={settings.profil.logoUrl} alt={orgName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl mb-2 shadow-md">{getInitials(orgName)}</div>
          )}
          <h1 className="text-2xl font-bold tracking-tight">Portal Masuk Pengurus</h1>
          <p className="text-sm font-medium text-foreground">{orgName}</p>
          <p className="text-xs text-muted-foreground">{orgWilayah ? `${orgWilayah} · ` : ''}Kelola data, catatan, keuangan & struktur</p>
        </div>

        <Card className="shadow-lg border-border/80">
          <form id="login-form" action={handleLogin} autoComplete="on">
            <CardHeader>
              <CardTitle className="text-lg">Masuk ke Akun</CardTitle>
              <CardDescription>Gunakan email & password pengurus yang telah terdaftar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input id="email" name="email" type="email" autoComplete="username" placeholder="pengurus@karangtaruna.id" className="pl-9" required />
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" className="pl-9" required />
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="pt-2">
                <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90" size="lg" type="submit" disabled={isPending}>
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isPending ? 'Masuk...' : 'Masuk Sekarang'}</span>
                </Button>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-center text-muted-foreground justify-center border-t py-4">Akses dibatasi hanya untuk pengurus & anggota terdaftar {orgName}.</CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
