'use client';

import { usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_COPY: Record<string, { title: string; description: string; mode: 'table' | 'cards' | 'dashboard' }> = {
  '/dashboard': { title: 'Dashboard', description: 'Ringkasan aktivitas dan informasi organisasi.', mode: 'dashboard' },
  '/anggota': { title: 'Data Anggota Karang Taruna', description: 'Database keanggotaan warga pemuda.', mode: 'table' },
  '/bagian': { title: 'Bagian Organisasi', description: 'Daftar bagian dan divisi organisasi.', mode: 'cards' },
  '/kegiatan': { title: 'Kegiatan Organisasi', description: 'Kelola agenda dan kegiatan organisasi.', mode: 'cards' },
  '/diskusi': { title: 'Diskusi', description: 'Kelola diskusi dan komunikasi organisasi.', mode: 'cards' },
  '/inventaris': { title: 'Inventaris', description: 'Kelola inventaris organisasi.', mode: 'cards' },
  '/arsip': { title: 'Arsip & Surat', description: 'Kelola arsip dan surat organisasi.', mode: 'cards' },
  '/surat': { title: 'Surat', description: 'Kelola template dan administrasi surat.', mode: 'cards' },
  '/pengumuman': { title: 'Pengumuman', description: 'Kelola pengumuman organisasi.', mode: 'cards' },
  '/aspirasi': { title: 'Kanal Aspirasi & Masukan Warga', description: 'Daftar aspirasi dan masukan warga.', mode: 'table' },
  '/pengguna': { title: 'Manajemen Pengguna', description: 'Kelola akun dan akses pengguna.', mode: 'table' },
  '/akses': { title: 'Manajemen Akses', description: 'Kelola akses pengguna organisasi.', mode: 'table' },
  '/struktur': { title: 'Struktur Organisasi', description: 'Kelola struktur dan agenda organisasi.', mode: 'cards' },
  '/struktur/agenda': { title: 'Agenda Organisasi', description: 'Kelola agenda organisasi.', mode: 'cards' },
  '/keuangan': { title: 'Catatan Keuangan', description: 'Kelola transaksi dan keuangan organisasi.', mode: 'table' },
  '/catatan': { title: 'Catatan', description: 'Kelola catatan internal bagian Anda.', mode: 'cards' },
  '/profil': { title: 'Profil', description: 'Kelola profil pengguna.', mode: 'table' },
  '/pengaturan': { title: 'Pengaturan', description: 'Kelola pengaturan sistem organisasi.', mode: 'table' },
};

function getPageCopy(pathname: string) {
  const directMatch = PAGE_COPY[pathname];
  if (directMatch) return directMatch;
  const matchedPath = Object.keys(PAGE_COPY)
    .filter((path) => path !== '/dashboard' && pathname.startsWith(`${path}/`))
    .sort((left, right) => right.length - left.length)[0];
  return matchedPath ? PAGE_COPY[matchedPath] : PAGE_COPY['/dashboard'];
}

function LoadingTable() {
  return (
    <Card className="overflow-hidden border shadow-xs">
      <CardHeader className="border-b bg-muted/20 p-4 sm:p-5">
        <CardTitle className="text-base font-semibold">Data</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Detail</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tanggal</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {Array.from({ length: 6 }, (_, row) => (
                <tr key={row}>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-3.5 w-40" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-3.5 w-24" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingCards() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <Card key={index} className="border shadow-xs">
          <CardHeader className="space-y-2 pb-3">
            <CardTitle className="text-sm font-semibold">Informasi</CardTitle>
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
  );
}

function LoadingDashboard() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index} className="border shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Statistik</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <LoadingCards />
    </>
  );
}

export function AdminPageLoading() {
  const copy = getPageCopy(usePathname());

  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{copy.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.description}</p>
        </div>
        <div className="h-9 w-28 rounded-lg border border-border/60 bg-card" />
      </div>
      <div className="flex min-h-12 flex-col gap-3 rounded-xl border border-border/60 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-lg bg-muted/40" />
          <div className="h-8 w-20 rounded-lg bg-muted/40" />
        </div>
        <div className="h-8 w-full rounded-md bg-muted/40 sm:w-56" />
      </div>
      {copy.mode === 'table' ? <LoadingTable /> : copy.mode === 'dashboard' ? <LoadingDashboard /> : <LoadingCards />}
    </div>
  );
}
