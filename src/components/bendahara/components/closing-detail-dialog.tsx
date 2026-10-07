'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  BookCheck,
  FileDown,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  FileText,
  Loader2,
  Calendar,
  User,
  Search,
  Receipt,
  X,
  Pencil,
} from 'lucide-react';
import { getClosingDetail } from '@/actions/keuangan';
import { exportClosingBeritaAcaraPdf } from '../utils/export-pdf';
import { cn, isImageUrl } from '@/lib/utils';
import { PreviewImage } from '@/components/common/preview-image';
import type { ClosingKeuangan, Transaksi } from '@/constants/keuangan';
import { toast } from 'sonner';

interface ClosingDetailDialogProps {
  closingId: string | null;
  onOpenChange: (open: boolean) => void;
  formatRupiah: (angka: number | string) => string;
  orgName?: string;
  onPreviewImage: (url: string) => void;
  userRole?: string;
  onEditTransaksi?: (trx: Transaksi) => void;
}

export function ClosingDetailDialog({
  closingId,
  onOpenChange,
  formatRupiah,
  orgName = 'Karang Taruna',
  onPreviewImage,
  userRole,
  onEditTransaksi,
}: ClosingDetailDialogProps) {
  const [closing, setClosing] = useState<ClosingKeuangan | null>(null);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJenis, setFilterJenis] = useState<'semua' | 'masuk' | 'keluar'>('semua');

  useEffect(() => {
    if (!closingId) {
      setClosing(null);
      setTransaksiList([]);
      setSearchQuery('');
      setFilterJenis('semua');
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    getClosingDetail(closingId, 'bendahara')
      .then((res) => {
        if (!isMounted) return;
        if ('error' in res && res.error) {
          toast.error(res.error);
        } else if ('closing' in res) {
          setClosing(res.closing);
          setTransaksiList(res.transaksi);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching closing detail:', err);
        toast.error('Gagal mengambil rincian closing.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [closingId]);

  const filteredTransaksi = useMemo(() => {
    return transaksiList.filter((item) => {
      if (filterJenis !== 'semua' && item.jenis !== filterJenis) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.judul.toLowerCase().includes(q) ||
        (item.displayKeterangan || '').toLowerCase().includes(q) ||
        (item.keterangan || '').toLowerCase().includes(q) ||
        (item.kategori || '').toLowerCase().includes(q) ||
        (item.author?.nama || '').toLowerCase().includes(q)
      );
    });
  }, [transaksiList, filterJenis, searchQuery]);

  const handleExportPdf = () => {
    if (!closing) return;
    exportClosingBeritaAcaraPdf({
      closing,
      transaksiList,
      orgName,
      formatRupiah,
    });
  };

  return (
    <Dialog open={!!closingId} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-4xl max-h-[92vh] sm:max-h-[88vh] p-3.5 sm:p-6 overflow-hidden flex flex-col gap-0 rounded-2xl sm:rounded-xl">
        {/* Header - Mobile First */}
        <DialogHeader className="border-b pb-3 shrink-0 pr-6 sm:pr-8 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5 sm:mt-0">
                <BookCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <DialogTitle className="text-base sm:text-lg font-bold truncate">
                    {closing?.judul || 'Rincian Penutupan Buku Kas'}
                  </DialogTitle>
                  {closing && (
                    <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 bg-muted/80">
                      {closing.nomor_closing}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-none">
                  Arsip resmi rekonsiliasi kas dan mutasi keuangan yang telah ditutup.
                </DialogDescription>
              </div>
            </div>

            {closing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                className="w-full sm:w-auto h-8 gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/10 shrink-0 font-medium"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>Cetak Berita Acara PDF</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Body Content - Scrollable */}
        <div className="overflow-y-auto flex-1 py-3 sm:py-4 space-y-3.5 sm:space-y-4 pr-1 sm:pr-1.5">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-muted-foreground text-xs">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <span>Memuat arsip transaksi penutupan buku...</span>
            </div>
          ) : !closing ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Data closing tidak ditemukan.
            </div>
          ) : (
            <>
              {/* Summary Cards: 4 Kolom di Desktop, 2x2 di Mobile */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="p-2.5 sm:p-3 rounded-xl border border-border/80 bg-muted/30">
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">Saldo Awal</div>
                  <div className="text-xs sm:text-sm font-bold font-mono text-foreground mt-0.5 truncate">
                    {formatRupiah(closing.saldo_awal)}
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="text-[10px] uppercase font-semibold text-emerald-600 flex items-center gap-1">
                    <ArrowDownLeft className="h-3 w-3 shrink-0" />
                    <span>Pemasukan</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold font-mono text-emerald-600 mt-0.5 truncate">
                    +{formatRupiah(closing.total_masuk)}
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl border border-rose-500/20 bg-rose-500/5">
                  <div className="text-[10px] uppercase font-semibold text-rose-600 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3 shrink-0" />
                    <span>Pengeluaran</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold font-mono text-rose-600 mt-0.5 truncate">
                    -{formatRupiah(closing.total_keluar)}
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl border border-primary/30 bg-primary/10">
                  <div className="text-[10px] uppercase font-semibold text-primary">Saldo Akhir Kas</div>
                  <div className="text-xs sm:text-sm font-bold font-mono text-primary mt-0.5 truncate">
                    {formatRupiah(closing.saldo_akhir)}
                  </div>
                </div>
              </div>

              {/* Sub-info bar: Responsive Flex Grid */}
              <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5 sm:p-3 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-[11px] sm:text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      Periode:{' '}
                      <strong className="text-foreground font-medium">
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
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      Oleh: <strong className="text-foreground font-medium">{closing.author?.nama || 'Bendahara'}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {closing.total_transaksi} Mutasi Terarsip
                  </Badge>
                  <Badge
                    variant={closing.status === 'closed' ? 'default' : 'outline'}
                    className={
                      closing.status === 'closed'
                        ? 'bg-emerald-600 hover:bg-emerald-600 text-white text-[10px]'
                        : 'text-amber-600 border-amber-500/30 text-[10px]'
                    }
                  >
                    {closing.status === 'closed' ? 'Final Sah' : 'Reopened'}
                  </Badge>
                </div>
              </div>

              {/* Catatan Berita Acara (Jika ada) */}
              {closing.catatan && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-300 text-xs">
                  <span className="font-semibold block mb-0.5 text-[11px] uppercase tracking-wider">
                    Catatan Berita Acara Closing:
                  </span>
                  <p className="whitespace-pre-line text-xs leading-relaxed">{closing.catatan}</p>
                </div>
              )}

              {/* Toolbar Pencarian & Filter di Dalam Modal */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFilterJenis('semua')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer',
                      filterJenis === 'semua'
                        ? 'bg-primary text-primary-foreground shadow-2xs'
                        : 'bg-muted/60 text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Semua ({transaksiList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterJenis('masuk')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer',
                      filterJenis === 'masuk'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-muted/60 text-muted-foreground hover:text-emerald-600',
                    )}
                  >
                    <ArrowDownLeft className="h-3 w-3" />
                    Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterJenis('keluar')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer',
                      filterJenis === 'keluar'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-muted/60 text-muted-foreground hover:text-rose-600',
                    )}
                  >
                    <ArrowUpRight className="h-3 w-3" />
                    Keluar
                  </button>
                </div>

                <div className="relative flex-1 sm:max-w-xs">
                  <Input
                    placeholder="Cari transaksi closing..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 text-xs pl-8 pr-7"
                  />
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* LIST TRANSAKSI */}
              <div className="space-y-2">
                {/* 1. Mobile View (Card List - sangat rapi di HP) */}
                <div className="block sm:hidden space-y-2">
                  {filteredTransaksi.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground rounded-xl border border-dashed">
                      Tidak ada transaksi yang cocok.
                    </div>
                  ) : (
                    filteredTransaksi.map((trx, idx) => (
                      <div
                        key={trx.id || idx}
                        className="p-3 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-all space-y-2"
                      >
                        {/* Top: Jenis badge & Tanggal */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">
                            {new Date(trx.tanggal || trx.created_at || '').toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {trx.kategori && trx.kategori !== 'Kas General' && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0">
                                {trx.kategori}
                              </Badge>
                            )}
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-[10px] px-1.5 py-0 font-medium',
                                trx.jenis === 'masuk'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
                              )}
                            >
                              {trx.jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
                            </Badge>
                          </div>
                        </div>

                        {/* Middle: Judul & Keterangan */}
                        <div>
                          <h4 className="font-semibold text-xs text-foreground leading-snug">{trx.judul}</h4>
                          {(trx.displayKeterangan || trx.keterangan) && (
                            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                              {trx.displayKeterangan || trx.keterangan}
                            </p>
                          )}
                        </div>

                        {/* Bottom: Nominal & Tombol Bukti Nota */}
                        <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                          <div className="text-[10px] text-muted-foreground">
                            Oleh: <span className="text-foreground">{trx.author?.nama || '-'}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'font-bold font-mono text-xs sm:text-sm',
                                trx.jenis === 'masuk' ? 'text-emerald-600' : 'text-rose-600',
                              )}
                            >
                              {trx.jenis === 'masuk' ? '+' : '-'}
                              {formatRupiah(trx.jumlah)}
                            </span>

                            {trx.lampiran_url && (
                              <button
                                type="button"
                                onClick={() => onPreviewImage(trx.lampiran_url!)}
                                className="h-7 px-2 rounded-lg border bg-muted/50 hover:bg-muted text-primary text-[10px] font-medium flex items-center gap-1 transition-colors"
                                title="Lihat nota"
                              >
                                <Receipt className="h-3 w-3" />
                                <span>Nota</span>
                              </button>
                            )}

                            {userRole === 'admin' && onEditTransaksi && (
                              <button
                                type="button"
                                onClick={() => {
                                  onOpenChange(false);
                                  onEditTransaksi(trx);
                                }}
                                className="h-7 px-2 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-medium flex items-center gap-1 transition-colors"
                                title="Edit Transaksi (Admin)"
                              >
                                <Pencil className="h-3 w-3" />
                                <span>Edit</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 2. Desktop / Tablet View (Tabel Bersih) */}
                <div className="hidden sm:block rounded-xl border border-border/80 overflow-hidden">
                  <div className="overflow-x-auto max-h-[380px]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/70 text-muted-foreground uppercase text-[10px] sticky top-0 border-b z-10 backdrop-blur-xs">
                        <tr>
                          <th className="px-3.5 py-2.5 font-medium">Tanggal</th>
                          <th className="px-3.5 py-2.5 font-medium">Uraian / Keterangan</th>
                          <th className="px-3.5 py-2.5 font-medium text-right">Jumlah</th>
                          <th className="px-3.5 py-2.5 font-medium text-center">Jenis</th>
                          <th className="px-3.5 py-2.5 font-medium text-center">Bukti Nota</th>
                          {userRole === 'admin' && onEditTransaksi && (
                            <th className="px-3.5 py-2.5 font-medium text-center">Aksi</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredTransaksi.length === 0 ? (
                          <tr>
                            <td colSpan={userRole === 'admin' && onEditTransaksi ? 6 : 5} className="px-3.5 py-8 text-center text-muted-foreground">
                              Tidak ada transaksi yang cocok dengan pencarian/filter.
                            </td>
                          </tr>
                        ) : (
                          filteredTransaksi.map((trx) => (
                            <tr key={trx.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-3.5 py-2.5 whitespace-nowrap text-muted-foreground font-mono">
                                {new Date(trx.tanggal || trx.created_at || '').toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>
                              <td className="px-3.5 py-2.5">
                                <div className="font-semibold text-foreground">{trx.judul}</div>
                                {trx.kategori && trx.kategori !== 'Kas General' && (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 mt-0.5 font-normal">
                                    {trx.kategori}
                                  </Badge>
                                )}
                                {(trx.displayKeterangan || trx.keterangan) && (
                                  <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                    {trx.displayKeterangan || trx.keterangan}
                                  </div>
                                )}
                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                  Pencatat: {trx.author?.nama || 'Unknown'}
                                </div>
                              </td>
                              <td
                                className={cn(
                                  'px-3.5 py-2.5 text-right font-bold font-mono whitespace-nowrap text-xs',
                                  trx.jenis === 'masuk' ? 'text-emerald-600' : 'text-rose-600',
                                )}
                              >
                                {trx.jenis === 'masuk' ? '+' : '-'}
                                {formatRupiah(trx.jumlah)}
                              </td>
                              <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    'text-[10px] px-1.5 py-0 font-medium',
                                    trx.jenis === 'masuk'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
                                  )}
                                >
                                  {trx.jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
                                </Badge>
                              </td>
                              <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                                {trx.lampiran_url ? (
                                  <button
                                    type="button"
                                    onClick={() => onPreviewImage(trx.lampiran_url!)}
                                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg border bg-muted/40 hover:bg-muted hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs"
                                    title="Klik untuk melihat bukti nota"
                                  >
                                    {isImageUrl(trx.lampiran_url) ? (
                                      <PreviewImage
                                        src={trx.lampiran_url}
                                        alt={trx.judul || 'Bukti'}
                                        className="h-full w-full object-cover rounded-lg"
                                      />
                                    ) : (
                                      <FileText className="h-4 w-4 text-primary" />
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              {userRole === 'admin' && onEditTransaksi && (
                                <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onOpenChange(false);
                                      onEditTransaksi(trx);
                                    }}
                                    className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-xs font-medium gap-1 transition-all cursor-pointer shadow-2xs"
                                    title="Edit transaksi ini (Audit Admin)"
                                  >
                                    <Pencil className="h-3 w-3" />
                                    <span>Edit</span>
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-3 flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] text-muted-foreground">
            Menampilkan {filteredTransaksi.length} dari {transaksiList.length} transaksi
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 px-4"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
