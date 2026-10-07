'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Boxes, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface InventarisStatsProps {
  dataReady: boolean;
  stats: {
    totalJenis: number;
    totalUnit: number;
    kondisiBaik: number;
    kondisiRusak: number;
    dipinjam: number;
  };
}

export function InventarisStats({ dataReady, stats }: InventarisStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <Card className="bg-card/50 border-border/80">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Inventaris</p>
            <div className="flex items-baseline gap-1 mt-1">
              {dataReady ? (
                <span className="text-2xl font-bold text-foreground">{stats.totalJenis}</span>
              ) : (
                <span aria-hidden="true" className="inline-block h-8 w-12 motion-safe:animate-pulse rounded bg-muted" />
              )}
              <span className="text-xs text-muted-foreground">
                jenis ({dataReady ? `${stats.totalUnit} unit` : '...'} )
              </span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Boxes className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/80">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Kondisi Baik</p>
            <div className="flex items-baseline gap-1 mt-1">
              {dataReady ? (
                <span className="text-2xl font-bold text-emerald-400">{stats.kondisiBaik}</span>
              ) : (
                <span aria-hidden="true" className="inline-block h-8 w-12 motion-safe:animate-pulse rounded bg-muted" />
              )}
              <span className="text-xs text-muted-foreground">jenis</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/80">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Perlu Perbaikan</p>
            <div className="flex items-baseline gap-1 mt-1">
              {dataReady ? (
                <span className="text-2xl font-bold text-amber-400">{stats.kondisiRusak}</span>
              ) : (
                <span aria-hidden="true" className="inline-block h-8 w-12 motion-safe:animate-pulse rounded bg-muted" />
              )}
              <span className="text-xs text-muted-foreground">jenis</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/80">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Sedang Dipinjam</p>
            <div className="flex items-baseline gap-1 mt-1">
              {dataReady ? (
                <span className="text-2xl font-bold text-sky-400">{stats.dipinjam}</span>
              ) : (
                <span aria-hidden="true" className="inline-block h-8 w-12 motion-safe:animate-pulse rounded bg-muted" />
              )}
              <span className="text-xs text-muted-foreground">barang</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Clock className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
