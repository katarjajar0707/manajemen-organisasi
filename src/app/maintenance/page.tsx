import type { Metadata } from 'next';
import Link from 'next/link';
import { Cog, ShieldCheck } from 'lucide-react';
import { getCachedPengaturanSistem } from '@/lib/cache/pengaturan';
import { Button } from '@/components/ui/button';
import { logout } from '@/actions/auth';

export const metadata: Metadata = {
  title: 'Sedang dalam Pemeliharaan',
  description: 'Sistem sedang menjalani pemeliharaan berkala.',
  robots: { index: false, follow: false },
};

export default async function MaintenancePage() {
  const settings = await getCachedPengaturanSistem();
  const orgName = settings.profil.nama || 'KartaTuju';

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <section className="w-full max-w-lg rounded-2xl border border-border/80 bg-background p-8 text-center shadow-lg sm:p-10">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <Cog aria-hidden="true" className="size-8" />
        </div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">{orgName}</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Sistem sedang dalam pemeliharaan</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Kami sedang melakukan penyesuaian agar layanan dapat kembali digunakan dengan lebih baik. Silakan coba lagi beberapa saat lagi.
        </p>
        <div className="mt-7 border-t pt-6">
          <p className="mb-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck aria-hidden="true" className="size-4" />
            Akses tetap tersedia untuk Administrator.
          </p>
          <Button asChild variant="outline">
            <Link href="/login">Masuk sebagai Administrator</Link>
          </Button>
          <form action={logout} className="mt-3">
            <button type="submit" className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Keluar dari akun saat ini
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
