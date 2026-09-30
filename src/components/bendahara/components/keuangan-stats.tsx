import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingDown, TrendingUp } from 'lucide-react';
import type { BendaharaSaldo } from '@/constants/keuangan';

interface KeuanganStatsProps {
  saldo: BendaharaSaldo;
  dataReady: boolean;
  formatRupiah: (angka: number | string) => string;
}

export function KeuanganStats({ saldo, dataReady, formatRupiah }: KeuanganStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      <Card className="col-span-2 bg-blue-50/70 border-blue-200 dark:from-blue-950/40 dark:to-indigo-950/20 dark:border-blue-900/40 dark:bg-card shadow-xs sm:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-foreground dark:text-blue-300 flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-500/10 text-blue-950 dark:text-blue-400">
              <Wallet className="h-4 w-4" />
            </span>
            <span>Total Saldo Aktif</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div suppressHydrationWarning className="text-2xl font-extrabold tabular-nums text-foreground dark:text-blue-300">
            {dataReady ? formatRupiah(saldo.sisa) : <span className="inline-block h-7 w-36 animate-pulse rounded bg-muted" />}
          </div>
          <p className="text-xs text-muted-foreground dark:text-blue-400/80 font-medium mt-1">Kas Umum Keseluruhan</p>
        </CardContent>
      </Card>

      <Card className="bg-emerald-50/70 border-emerald-200 dark:from-emerald-950/40 dark:to-green-950/20 dark:border-emerald-900/40 dark:bg-card shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold text-slate-900 dark:text-emerald-300 flex items-center gap-2 sm:text-sm">
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </span>
            <span>Total Pemasukan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div suppressHydrationWarning className="text-lg font-extrabold tabular-nums text-emerald-800 dark:text-emerald-300 sm:text-2xl">
            {dataReady ? formatRupiah(saldo.masuk) : <span className="inline-block h-7 w-32 animate-pulse rounded bg-muted" />}
          </div>
          <p className="text-[10px] text-slate-700 dark:text-emerald-400/80 font-medium mt-1 sm:text-xs">Akumulasi Dana Masuk</p>
        </CardContent>
      </Card>

      <Card className="bg-rose-50/70 border-rose-200 dark:from-rose-950/40 dark:to-red-950/20 dark:border-rose-900/40 dark:bg-card shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold text-slate-900 dark:text-rose-300 flex items-center gap-2 sm:text-sm">
            <span className="p-1 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400">
              <TrendingDown className="h-4 w-4" />
            </span>
            <span>Total Pengeluaran</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div suppressHydrationWarning className="text-lg font-extrabold tabular-nums text-rose-800 dark:text-rose-300 sm:text-2xl">
            {dataReady ? formatRupiah(saldo.keluar) : <span className="inline-block h-7 w-32 animate-pulse rounded bg-muted" />}
          </div>
          <p className="text-[10px] text-slate-700 dark:text-rose-400/80 font-medium mt-1 sm:text-xs">Akumulasi Dana Keluar</p>
        </CardContent>
      </Card>
    </div>
  );
}
