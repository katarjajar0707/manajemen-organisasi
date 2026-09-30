'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, User } from 'lucide-react';
import { PeminjamanRecord } from '@/actions/inventaris';
import { InventarisTableRowsSkeleton } from './inventaris-skeletons';

interface RiwayatTableProps {
  riwayat: PeminjamanRecord[];
  dataReady: boolean;
}

export function RiwayatTable({ riwayat, dataReady }: RiwayatTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Catatan Riwayat Peminjaman & Sirkulasi
        </CardTitle>
        <CardDescription>
          Log pencatatan siapa yang meminjam barang, tanggal pinjam, dan status pengembalian fisik.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile View for Riwayat Peminjaman (< md) */}
        <div className="md:hidden divide-y divide-border/60">
          {!dataReady ? (
            <div className="p-4 space-y-3">
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
              <div className="h-3 w-1/3 bg-muted animate-pulse rounded" />
            </div>
          ) : riwayat.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              Belum ada riwayat peminjaman barang tercatat.
            </div>
          ) : (
            riwayat.map((rec, index) => (
              <div
                key={rec.id}
                className={`p-3.5 space-y-2 transition-colors ${
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/60 dark:bg-muted/35'
                } hover:bg-primary/5 dark:hover:bg-primary/10`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-xs sm:text-sm text-foreground leading-snug break-words">
                      {rec.namaBarang || 'Barang Inventaris'}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                      <User className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground">{rec.peminjam}</span>
                      <span className="text-[11px] text-muted-foreground">({rec.jumlahPinjam} unit)</span>
                    </p>
                  </div>
                  <Badge
                    variant={rec.status === 'dipinjam' ? 'default' : 'outline'}
                    className={`text-[10px] shrink-0 ${
                      rec.status === 'dipinjam'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
                    }`}
                  >
                    {rec.status === 'dipinjam' ? 'Dipinjam' : 'Kembali'}
                  </Badge>
                </div>
                {rec.keterangan && (
                  <p className="text-[11px] text-muted-foreground bg-muted/30 p-1.5 rounded border border-border/40">
                    {rec.keterangan}
                  </p>
                )}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                  <span>Pinjam: {rec.tanggalPinjam}</span>
                  <span>Kembali: {rec.tanggalKembaliRencana}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Peminjam</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Tanggal Pinjam</TableHead>
                <TableHead>Rencana Kembali</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dicatat Oleh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!dataReady ? (
                <InventarisTableRowsSkeleton history />
              ) : riwayat.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-sm">
                    Belum ada riwayat peminjaman barang tercatat.
                  </TableCell>
                </TableRow>
              ) : (
                riwayat.map((rec) => (
                  <TableRow key={rec.id} className="odd:bg-muted/20 even:bg-background hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">{rec.namaBarang || 'Barang Inventaris'}</TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{rec.peminjam}</div>
                      {rec.keterangan && <div className="text-xs text-muted-foreground">{rec.keterangan}</div>}
                    </TableCell>
                    <TableCell>{rec.jumlahPinjam} unit</TableCell>
                    <TableCell className="text-xs">{rec.tanggalPinjam}</TableCell>
                    <TableCell className="text-xs">{rec.tanggalKembaliRencana}</TableCell>
                    <TableCell>
                      <Badge
                        variant={rec.status === 'dipinjam' ? 'default' : 'outline'}
                        className={`text-xs ${
                          rec.status === 'dipinjam'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                        }`}
                      >
                        {rec.status === 'dipinjam' ? 'Sedang Dipinjam' : 'Sudah Kembali'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{rec.dibuatOleh || 'Pengurus'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
