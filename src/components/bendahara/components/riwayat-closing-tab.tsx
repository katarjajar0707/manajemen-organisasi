'use client';

import { useState, useTransition, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookCheck,
  FileDown,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  RotateCcw,
  Calendar,
  User,
  AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { reopenClosingKeuangan } from '@/actions/keuangan';
import { exportClosingBeritaAcaraPdf } from '../utils/export-pdf';
import { ClosingDetailDialog } from './closing-detail-dialog';
import type { ClosingKeuangan, Transaksi } from '@/constants/keuangan';
import { toast } from 'sonner';

interface RiwayatClosingTabProps {
  closingList: ClosingKeuangan[];
  isLoading?: boolean;
  canManage?: boolean;
  userRole?: string;
  formatRupiah: (angka: number | string) => string;
  orgName?: string;
  onRefresh: () => void;
  onPreviewImage: (url: string) => void;
  onEditTransaksi?: (trx: Transaksi) => void;
}

export function RiwayatClosingTab({
  closingList = [],
  isLoading = false,
  userRole = 'anggota',
  formatRupiah,
  orgName = 'Karang Taruna',
  onRefresh,
  onPreviewImage,
  onEditTransaksi,
}: RiwayatClosingTabProps) {
  const [selectedClosingId, setSelectedClosingId] = useState<string | null>(null);
  const [reopenTarget, setReopenTarget] = useState<ClosingKeuangan | null>(null);
  const [isPending, startTransition] = useTransition();

  const canReopen = userRole === 'admin' || userRole === 'ketua';

  const handleConfirmReopen = () => {
    if (!reopenTarget) return;

    startTransition(async () => {
      const res = await reopenClosingKeuangan(reopenTarget.id, 'bendahara');
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Closing ${reopenTarget.nomor_closing} berhasil dibuka kembali. Transaksi telah dilepas status closing-nya.`);
        onRefresh();
      }
      setReopenTarget(null);
    });
  };

  // Hanya tampilkan riwayat tutup buku sah (status === 'closed')
  const validClosingList = useMemo(() => closingList.filter((c) => c.status === 'closed'), [closingList]);

  // Find latest closed closing (only the latest can be reopened to maintain cash balance chain)
  const latestClosedId = validClosingList.find((c) => c.status === 'closed')?.id;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookCheck className="h-5 w-5 text-primary" />
                  Arsip Riwayat Tutup Buku (Closing)
                </CardTitle>
                <Badge variant="outline" className="font-mono text-xs">
                  {validClosingList.length} arsip
                </Badge>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Daftar rekonsiliasi kas dan penutupan buku yang tersimpan secara permanen untuk audit keuangan.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Memuat arsip riwayat closing...</span>
            </div>
          ) : validClosingList.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-foreground">Belum Ada Riwayat Tutup Buku</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                  Saat periode kas berjalan selesai (misalnya akhir bulan atau akhir kepengurusan), lakukan Tutup Buku (Closing) agar mutasi kas tersimpan permanen.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {validClosingList.map((closing) => {
                const isLatestClosed = closing.id === latestClosedId && closing.status === 'closed';

                return (
                  <div
                    key={closing.id}
                    className="rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-all p-4 space-y-3.5 shadow-2xs"
                  >
                    {/* Header Item */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <Badge
                          variant="secondary"
                          className="font-mono text-[11px] bg-primary/10 text-primary border border-primary/20"
                        >
                          {closing.nomor_closing}
                        </Badge>
                        <h3 className="font-semibold text-sm sm:text-base text-foreground">
                          {closing.judul}
                        </h3>
                        <Badge
                          variant="default"
                          className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px]"
                        >
                          Tutup Buku Sah
                        </Badge>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-border/40">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none h-8 text-xs gap-1.5"
                          onClick={() => setSelectedClosingId(closing.id)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Rincian ({closing.total_transaksi})</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none h-8 text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                          onClick={() => setSelectedClosingId(closing.id)}
                        >
                          <FileDown className="h-3.5 w-3.5" />
                          <span>Cetak PDF</span>
                        </Button>

                        {canReopen && isLatestClosed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs gap-1 text-destructive hover:bg-destructive/10 shrink-0"
                            onClick={() => setReopenTarget(closing)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Buka Kembali</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Rekap Saldo Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-2.5 rounded-lg border bg-muted/20">
                        <div className="text-[10px] uppercase font-semibold text-muted-foreground">Saldo Awal</div>
                        <div className="text-xs sm:text-sm font-bold font-mono text-foreground mt-0.5">
                          {formatRupiah(closing.saldo_awal)}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
                        <div className="text-[10px] uppercase font-semibold text-emerald-600 flex items-center gap-1">
                          <ArrowDownLeft className="h-3 w-3" /> Pemasukan
                        </div>
                        <div className="text-xs sm:text-sm font-bold font-mono text-emerald-600 mt-0.5">
                          +{formatRupiah(closing.total_masuk)}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg border bg-rose-500/5 border-rose-500/20">
                        <div className="text-[10px] uppercase font-semibold text-rose-600 flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3" /> Pengeluaran
                        </div>
                        <div className="text-xs sm:text-sm font-bold font-mono text-rose-600 mt-0.5">
                          -{formatRupiah(closing.total_keluar)}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg border bg-primary/10 border-primary/30">
                        <div className="text-[10px] uppercase font-semibold text-primary">Saldo Akhir Sisa</div>
                        <div className="text-xs sm:text-sm font-bold font-mono text-primary mt-0.5">
                          {formatRupiah(closing.saldo_akhir)}
                        </div>
                      </div>
                    </div>

                    {/* Metadata Sub-bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-primary" />
                          Tanggal Tutup: {new Date(closing.tanggal_closing).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span>
                          Periode:{' '}
                          {closing.tanggal_mulai
                            ? new Date(closing.tanggal_mulai).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}{' '}
                          s.d.{' '}
                          {closing.tanggal_selesai
                            ? new Date(closing.tanggal_selesai).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-primary" />
                        <span>Penanggung Jawab: <strong className="text-foreground">{closing.author?.nama || 'Bendahara'}</strong></span>
                      </div>
                    </div>

                    {closing.catatan && (
                      <div className="text-xs p-2.5 rounded-lg bg-muted/40 border text-muted-foreground text-[11px]">
                        <span className="font-semibold text-foreground mr-1">Catatan:</span>
                        {closing.catatan}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Detail Rincian Closing */}
      <ClosingDetailDialog
        closingId={selectedClosingId}
        onOpenChange={(open) => !open && setSelectedClosingId(null)}
        formatRupiah={formatRupiah}
        orgName={orgName}
        onPreviewImage={onPreviewImage}
        userRole={userRole}
        onEditTransaksi={onEditTransaksi}
      />

      {/* Alert Konfirmasi Reopen */}
      <AlertDialog open={!!reopenTarget} onOpenChange={(open) => !open && setReopenTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertDialogTitle>Buka Kembali Tutup Buku?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs leading-relaxed">
              Anda akan membuka kembali closing <strong>{reopenTarget?.nomor_closing}</strong> ({reopenTarget?.judul}).
              Seluruh transaksi di dalam closing ini akan dilepaskan status terkuncinya dan kembali menjadi kas aktif berjalan. Tindakan ini hanya boleh dilakukan untuk koreksi pembukuan yang sah.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={handleConfirmReopen}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs"
            >
              {isPending ? 'Membuka Kembali...' : 'Ya, Buka Kembali Closing'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
