import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-background flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 text-center">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
        {/* Glow effect */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary sm:h-20 sm:w-20">
          <ShieldAlert className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>

        <div className="relative mt-6 space-y-3 sm:mt-8">
          <span className="inline-flex max-w-full items-center rounded-full border border-border/40 bg-secondary px-3 py-1 text-xs font-mono font-semibold text-muted-foreground">Error 404 • Not Found</span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Halaman Tidak Ditemukan</h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">Halaman atau data yang Anda cari tidak tersedia, telah dipindahkan, atau Anda tidak memiliki izin akses.</p>
        </div>

        <div className="relative mt-8 flex w-full flex-col gap-3 sm:flex-row">
          <Button asChild variant="default" className="w-full sm:min-w-0 sm:flex-1">
            <Link href="/dashboard" className="w-full">
              <Home className="h-4 w-4" />
              Ke Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:min-w-0 sm:flex-1">
            <Link href="/" className="w-full">
              <ArrowLeft className="h-4 w-4" />
              Portal Publik
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
