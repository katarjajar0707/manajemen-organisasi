'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CircleDollarSign, FileText, Landmark, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { PwaInstallPrompt } from '@/components/common/pwa-install-prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PengaturanSistemData } from '@/actions/pengaturan';
import type { PublicKeuanganReportData } from '@/actions/transparansi';

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function formatTanggal(tanggal: string): string {
  if (!tanggal) return '-';
  return new Date(`${tanggal}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'KT';
}

export function PublicLaporanKeuangan({ settings, report }: { settings?: PengaturanSistemData; report?: PublicKeuanganReportData }) {
  const [kategoriAktif, setKategoriAktif] = useState('Semua');
  const orgName = settings?.profil.nama || 'Karang Taruna';
  const isAvailable = Boolean(report);
  const transaksi = useMemo(() => report?.transaksi.filter((item) => kategoriAktif === 'Semua' || item.kategori === kategoriAktif) || [], [kategoriAktif, report]);
  const ringkasan = useMemo(() => {
    const masuk = transaksi.filter((item) => item.jenis === 'masuk').reduce((total, item) => total + item.jumlah, 0);
    const keluar = transaksi.filter((item) => item.jenis === 'keluar').reduce((total, item) => total + item.jumlah, 0);
    return { masuk, keluar, sisa: masuk - keluar };
  }, [transaksi]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md md:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary font-extrabold text-primary-foreground shadow-sm">{getInitials(orgName)}</span>
          <span className="truncate text-sm font-bold tracking-tight sm:text-base">{orgName}</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link href="/" aria-label="Kembali ke beranda">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs sm:px-3"><ArrowLeft className="h-3.5 w-3.5" /><span className="hidden sm:inline">Beranda</span></Button>
          </Link>
          <ThemeToggle />
          <PwaInstallPrompt />
          <Link href="/login"><Button variant="default" size="sm" className="h-8 gap-1.5 text-xs"><span>Masuk</span><ArrowRight className="h-3.5 w-3.5" /></Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:space-y-8 sm:py-10 md:px-8">
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-primary"><Landmark className="h-4 w-4" /> Transparansi publik</div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Laporan Keuangan</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Informasi arus kas {orgName} yang disajikan secara terbuka. Halaman ini hanya untuk melihat data dan tidak menyediakan pengubahan transaksi.</p>
        </section>

        {!isAvailable ? (
          <Card className="mx-auto max-w-xl border-border/70 text-center shadow-sm"><CardContent className="space-y-4 p-8"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground"><FileText className="h-6 w-6" /></span><div className="space-y-1"><h2 className="font-bold">Laporan belum tersedia untuk publik</h2><p className="text-sm text-muted-foreground">Publikasi laporan keuangan saat ini dinonaktifkan oleh pengurus organisasi.</p></div><Link href="/"><Button variant="outline" size="sm">Kembali ke Beranda</Button></Link></CardContent></Card>
        ) : (
          <>
            <section className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              <SummaryCard title="Kas Masuk" amount={ringkasan.masuk} icon={<TrendingUp className="h-4 w-4" />} className="text-emerald-600 dark:text-emerald-400" />
              <SummaryCard title="Kas Keluar" amount={ringkasan.keluar} icon={<TrendingDown className="h-4 w-4" />} className="text-rose-600 dark:text-rose-400" />
              <SummaryCard title="Saldo Kas" amount={ringkasan.sisa} icon={<Wallet className="h-4 w-4" />} className="text-primary" />
            </section>

            <Card className="overflow-hidden border-border/70 shadow-sm">
              <CardHeader className="space-y-3 border-b border-border/60 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div><CardTitle className="flex items-center gap-2 text-base"><CircleDollarSign className="h-4 w-4 text-primary" /> Rincian Transaksi</CardTitle><CardDescription className="mt-1 text-xs">{transaksi.length} transaksi pada kategori yang dipilih.</CardDescription></div>
                  <Badge variant="outline" className="w-fit text-[10px] text-muted-foreground">Baca saja</Badge>
                </div>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filter kategori laporan keuangan">
                  <FilterButton active={kategoriAktif === 'Semua'} onClick={() => setKategoriAktif('Semua')}>Semua</FilterButton>
                  {(report?.kategori || []).map((kategori) => <FilterButton key={kategori} active={kategoriAktif === kategori} onClick={() => setKategoriAktif(kategori)}>{kategori}</FilterButton>)}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {transaksi.length === 0 ? <div className="p-10 text-center text-sm text-muted-foreground">Belum ada transaksi pada kategori ini.</div> : <>
                  <div className="divide-y md:hidden">{transaksi.map((item) => <article key={item.id} className="space-y-2 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-semibold">{item.judul}</p>{item.keterangan && <p className="mt-0.5 text-xs text-muted-foreground">{item.keterangan}</p>}</div><p className={`shrink-0 text-sm font-bold ${item.jenis === 'masuk' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{item.jenis === 'masuk' ? '+' : '-'}{formatRupiah(item.jumlah)}</p></div><div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground"><span>{formatTanggal(item.tanggal)}</span><Badge variant="outline" className="max-w-[55%] truncate text-[10px]">{item.kategori}</Badge></div></article>)}</div>
                  <div className="hidden overflow-x-auto md:block"><table className="w-full text-sm"><thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-3 font-semibold">Tanggal</th><th className="px-5 py-3 font-semibold">Uraian Transaksi</th><th className="px-5 py-3 font-semibold">Kategori</th><th className="px-5 py-3 font-semibold">Jenis</th><th className="px-5 py-3 text-right font-semibold">Nominal</th></tr></thead><tbody className="divide-y">{transaksi.map((item) => <tr key={item.id}><td className="whitespace-nowrap px-5 py-4 text-xs text-muted-foreground">{formatTanggal(item.tanggal)}</td><td className="px-5 py-4"><p className="font-semibold">{item.judul}</p>{item.keterangan && <p className="mt-0.5 max-w-md text-xs text-muted-foreground">{item.keterangan}</p>}</td><td className="px-5 py-4"><Badge variant="outline" className="text-[10px]">{item.kategori}</Badge></td><td className="px-5 py-4"><Badge className={item.jenis === 'masuk' ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-700 hover:bg-rose-500/10 dark:text-rose-400'}>{item.jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}</Badge></td><td className={`whitespace-nowrap px-5 py-4 text-right font-bold ${item.jenis === 'masuk' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{item.jenis === 'masuk' ? '+' : '-'}{formatRupiah(item.jumlah)}</td></tr>)}</tbody></table></div>
                </>}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ title, amount, icon, className }: { title: string; amount: number; icon: React.ReactNode; className: string }) {
  return <Card className="border-border/70 shadow-sm"><CardContent className="flex items-center gap-3 p-4 sm:p-5"><span className={`rounded-xl bg-muted p-2.5 ${className}`}>{icon}</span><div className="min-w-0"><p className="text-xs text-muted-foreground">{title}</p><p className={`mt-1 truncate text-lg font-bold sm:text-xl ${className}`}>{formatRupiah(amount)}</p></div></CardContent></Card>;
}

function FilterButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return <Button type="button" size="sm" variant={active ? 'default' : 'outline'} onClick={onClick} className="h-8 shrink-0 rounded-full px-3 text-xs" role="tab" aria-selected={active}>{children}</Button>;
}
