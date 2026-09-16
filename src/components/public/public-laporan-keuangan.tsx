'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, CircleDollarSign, Copy, FileText, Landmark, MessageCircle, Share2, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import FoldText from '@/components/public/fold-text';
import TextType from '@/components/public/text-type';
import type { PengaturanSistemData } from '@/actions/pengaturan';
import type { PublicKeuanganReportData } from '@/actions/transparansi';

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function formatTanggal(tanggal: string): string {
  if (!tanggal) return '-';
  return new Date(`${tanggal}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function PublicLaporanKeuangan({ settings, report }: { settings?: PengaturanSistemData; report?: PublicKeuanganReportData }) {
  const [kategoriAktif, setKategoriAktif] = useState('Semua');
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const orgName = settings?.profil.nama || 'Karang Taruna';
  const isAvailable = Boolean(report);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  const handleCopyUrl = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success('Tautan berhasil disalin ke clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Gagal menyalin tautan:', err);
      toast.error('Gagal menyalin tautan');
    }
  };

  const handleWhatsAppShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Laporan Transparansi Keuangan - ${orgName}\n\nLihat rincian arus kas dan laporan keuangan terbuka di tautan:\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Laporan Keuangan | ${orgName}`,
          text: `Informasi arus kas dan transparansi keuangan ${orgName}`,
          url: url,
        });
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('Gagal berbagi:', err);
      }
    }
  };

  const transaksi = useMemo(() => report?.transaksi.filter((item) => kategoriAktif === 'Semua' || item.kategori === kategoriAktif) || [], [kategoriAktif, report]);
  const ringkasan = useMemo(() => {
    const masuk = transaksi.filter((item) => item.jenis === 'masuk').reduce((total, item) => total + item.jumlah, 0);
    const keluar = transaksi.filter((item) => item.jenis === 'keluar').reduce((total, item) => total + item.jumlah, 0);
    return { masuk, keluar, sisa: masuk - keluar };
  }, [transaksi]);

  return (
    <div className="min-h-[calc(100vh-4.25rem)]">

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:space-y-8 sm:py-10 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <Landmark className="h-4 w-4" /> Transparansi publik
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              <FoldText
                text="Laporan Keuangan"
                splitBy="word"
                hinge="top"
                trigger="scroll"
                duration={0.6}
                stagger={0.09}
                ease="power3.out"
                perspective={700}
                creaseShading={0.5}
                color="currentColor"
              />
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground min-h-[2.5rem]">
              <TextType
                as="span"
                text={[
                  `Informasi arus kas ${orgName} yang disajikan secara terbuka. Halaman ini hanya untuk melihat data dan tidak menyediakan pengubahan transaksi.`,
                  "Data keuangan diperbarui secara real-time oleh bendahara dan tersedia untuk seluruh warga.",
                  "Transparansi adalah fondasi kepercayaan. Setiap rupiah tercatat dan dapat ditelusuri.",
                ]}
                typingSpeed={38}
                deletingSpeed={20}
                pauseDuration={2800}
                showCursor={true}
                cursorCharacter="|"
                cursorClassName="text-primary"
                startOnVisible={true}
                loop={true}
              />
            </p>
          </section>

          <div className="flex items-center gap-2 self-start sm:self-auto sm:pt-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="group flex items-center gap-2 rounded-xl border-border/80 bg-background/60 shadow-xs backdrop-blur-xs transition-all hover:border-primary/40 hover:bg-secondary"
                  title="Bagikan tautan halaman laporan keuangan"
                  aria-label="Bagikan tautan laporan keuangan"
                >
                  <Share2 className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
                  <span className="text-xs font-semibold">Bagikan</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/70 p-1.5 shadow-lg backdrop-blur-md">
                <DropdownMenuItem
                  onClick={handleCopyUrl}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors hover:bg-accent"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                  <span>{copied ? 'Tersalin ke Clipboard' : 'Salin Tautan Halaman'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleWhatsAppShare}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors hover:bg-accent"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-500" />
                  <span>Bagikan ke WhatsApp</span>
                </DropdownMenuItem>
                {canNativeShare && (
                  <DropdownMenuItem
                    onClick={handleNativeShare}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors hover:bg-accent"
                  >
                    <Share2 className="h-4 w-4 text-primary" />
                    <span>Bagikan via Aplikasi Lain...</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

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
