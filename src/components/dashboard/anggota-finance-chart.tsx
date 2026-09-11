'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartNoAxesCombined } from 'lucide-react';
import type { PublicTransparencyData } from '@/actions/transparansi';

type RentangChart = 'mingguan' | 'bulanan' | 'tahunan';

const FILTERS: { id: RentangChart; label: string; description: string }[] = [
  { id: 'mingguan', label: 'Mingguan', description: '7 hari terakhir' },
  { id: 'bulanan', label: 'Bulanan', description: '6 bulan terakhir' },
  { id: 'tahunan', label: 'Tahunan', description: '5 tahun terakhir' },
];

function formatRupiah(amount: number): string {
  return `Rp ${Math.round(Number(amount) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

export function AnggotaFinanceChart({ data }: { data: PublicTransparencyData['keuangan'] }) {
  const [rentang, setRentang] = useState<RentangChart>('mingguan');
  const tren = rentang === 'mingguan' ? data.trenMingguan : rentang === 'tahunan' ? data.trenTahunan : data.trenBulanan;
  const filterAktif = FILTERS.find((filter) => filter.id === rentang)!;
  const maxValue = Math.max(...tren.flatMap((item) => [item.masuk, item.keluar]), 1);
  const totalMasuk = tren.reduce((total, item) => total + item.masuk, 0);
  const totalKeluar = tren.reduce((total, item) => total + item.keluar, 0);

  return (
    <Card className="mt-4 overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-base"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><ChartNoAxesCombined className="h-4 w-4" /></span>Arus Keuangan</CardTitle>
          <CardDescription className="mt-1 text-xs">Kas masuk dan keluar: {filterAktif.description}</CardDescription>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Masuk</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" />Keluar</span></div>
        </div>
        <Select value={rentang} onValueChange={(value) => setRentang(value as RentangChart)}>
          <SelectTrigger className="h-9 w-[124px] shrink-0 text-xs sm:w-[136px]" aria-label="Rentang statistik keuangan">
            <SelectValue placeholder="Pilih rentang" />
          </SelectTrigger>
          <SelectContent align="end">
            {FILTERS.map((filter) => <SelectItem key={filter.id} value={filter.id}>{filter.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-3 pb-4 pt-4 sm:px-5 sm:pb-5">
        <div className={`grid gap-1.5 sm:gap-3 ${tren.length === 5 ? 'grid-cols-5' : tren.length === 6 ? 'grid-cols-6' : 'grid-cols-7'}`} aria-label={`Grafik arus keuangan ${filterAktif.label.toLowerCase()}`}>
          {tren.map((item, index) => {
            const masukHeight = Math.max((item.masuk / maxValue) * 100, item.masuk > 0 ? 4 : 0);
            const keluarHeight = Math.max((item.keluar / maxValue) * 100, item.keluar > 0 ? 4 : 0);
            return (
              <div key={`${rentang}-${item.label}-${index}`} className="min-w-0 text-center">
                <div className="flex h-32 items-end justify-center gap-1 rounded-lg border border-border/60 bg-muted/20 px-1 pb-1.5 pt-3 sm:h-44 sm:gap-1.5 sm:px-2">
                  <div className="group relative flex h-full w-2.5 items-end sm:w-4"><div className="w-full rounded-t-sm bg-primary transition-all duration-500" style={{ height: `${masukHeight}%` }} /><span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-max -translate-x-1/2 rounded-md bg-popover px-2 py-1 text-[10px] text-popover-foreground shadow-md group-hover:block">Masuk: {formatRupiah(item.masuk)}</span></div>
                  <div className="group relative flex h-full w-2.5 items-end sm:w-4"><div className="w-full rounded-t-sm bg-destructive transition-all duration-500" style={{ height: `${keluarHeight}%` }} /><span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-max -translate-x-1/2 rounded-md bg-popover px-2 py-1 text-[10px] text-popover-foreground shadow-md group-hover:block">Keluar: {formatRupiah(item.keluar)}</span></div>
                </div>
                <p className="mt-2 truncate text-[10px] font-medium text-muted-foreground sm:text-xs">{item.label}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-3 divide-x divide-border/60 rounded-lg border border-border/60 bg-muted/20 py-2 text-center">
          <div><p className="text-[10px] text-muted-foreground">Kas Masuk</p><p className="mt-0.5 text-xs font-semibold text-primary sm:text-sm">{formatRupiah(totalMasuk)}</p></div>
          <div><p className="text-[10px] text-muted-foreground">Kas Keluar</p><p className="mt-0.5 text-xs font-semibold text-destructive sm:text-sm">{formatRupiah(totalKeluar)}</p></div>
          <div><p className="text-[10px] text-muted-foreground">Selisih</p><p className="mt-0.5 text-xs font-semibold sm:text-sm">{formatRupiah(totalMasuk - totalKeluar)}</p></div>
        </div>
      </CardContent>
    </Card>
  );
}
