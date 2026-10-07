/**
 * AdminPageLoading — fallback untuk grup route (admin)/loading.tsx
 *
 * Perubahan dari versi lama:
 * - Dihapus: `'use client'`, `usePathname()`, `PAGE_COPY` map.
 *   Alasan: loading.tsx adalah Server Component dan tidak perlu tahu pathname
 *   (itu info statis di tiap page.tsx masing-masing).
 * - Sekarang hanya merender skeleton konten (tabel/kartu/dashboard) tanpa
 *   menduplikasi header halaman (h1, deskripsi, tombol) yang seharusnya statis.
 * - Semua animasi pakai `motion-safe:` lewat primitif Skeleton.
 * - `aria-busy`, `aria-live`, `sr-only` untuk aksesibilitas.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingTable() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <span className="sr-only">Memuat data...</span>

      {/* Header halaman skeleton (judul + tombol) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 sm:h-8" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex min-h-12 flex-col gap-3 rounded-xl border border-border/60 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-full rounded-md sm:w-56" />
      </div>

      {/* Tabel skeleton */}
      <Card className="overflow-hidden border shadow-xs">
        <CardHeader className="border-b bg-muted/20 p-4 sm:p-5">
          <CardTitle className="text-base font-semibold">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  {['Nama', 'Detail', 'Status', 'Tanggal', 'Aksi'].map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {Array.from({ length: 6 }).map((_, row) => (
                  <tr key={row}>
                    <td className="px-4 py-3.5"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-3.5 w-40" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-3.5 w-24" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="ml-auto h-8 w-8 rounded-md" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="divide-y divide-border/60 md:hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2.5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3.5 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingCards() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <span className="sr-only">Memuat data...</span>

      {/* Header halaman skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 sm:h-8" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex min-h-12 flex-col gap-3 rounded-xl border border-border/60 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-full rounded-md sm:w-56" />
      </div>

      {/* Grid kartu */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="border shadow-xs">
            <CardHeader className="space-y-2 pb-3">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-3.5 w-full" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-3.5 w-3/5" />
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LoadingDashboard() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <span className="sr-only">Memuat dashboard...</span>

      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="border shadow-xs">
            <CardContent className="space-y-3 p-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-2 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="border shadow-xs">
            <CardHeader className="space-y-2 pb-3">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-3.5 w-full" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-3.5 w-3/5" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** Nilai yang diterima prop `mode`. */
export type AdminPageLoadingMode = 'table' | 'cards' | 'dashboard';

interface AdminPageLoadingProps {
  mode?: AdminPageLoadingMode;
}

/**
 * Skeleton fallback untuk seluruh konten halaman admin.
 * Dipanggil dari `(admin)/loading.tsx`.
 *
 * Prop `mode` menentukan tampilan skeleton:
 * - `'table'`     — untuk halaman data (anggota, keuangan, pengguna, aspirasi, profil, pengaturan)
 * - `'cards'`     — untuk halaman kartu (kegiatan, bagian, diskusi, inventaris, dll.)
 * - `'dashboard'` — untuk halaman dashboard
 *
 * Default: `'cards'` (paling umum).
 */
export function AdminPageLoading({ mode = 'cards' }: AdminPageLoadingProps) {
  if (mode === 'table') return <LoadingTable />;
  if (mode === 'dashboard') return <LoadingDashboard />;
  return <LoadingCards />;
}
