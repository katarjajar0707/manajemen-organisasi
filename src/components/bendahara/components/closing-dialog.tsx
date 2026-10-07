'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookCheck, Lock, ArrowDownLeft, ArrowUpRight, Wallet, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getClosingPreview, executeClosingKeuangan } from '@/actions/keuangan';
import type { ClosingPreviewData } from '@/constants/keuangan';

interface ClosingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatRupiah: (angka: number | string) => string;
  onSuccess: () => void;
}

export function ClosingDialog({ open, onOpenChange, formatRupiah, onSuccess }: ClosingDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [cutOffDate, setCutOffDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [judul, setJudul] = useState('');
  const [catatan, setCatatan] = useState('');
  const [preview, setPreview] = useState<ClosingPreviewData | null>(null);

  // Generate judul otomatis saat modal dibuka
  useEffect(() => {
    if (open) {
      const now = new Date();
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const bulan = monthNames[now.getMonth()];
      const tahun = now.getFullYear();
      setJudul(`Closing Buku Kas ${bulan} ${tahun}`);
      setCatatan('');
      setCutOffDate(now.toISOString().slice(0, 10));
    }
  }, [open]);

  // Muat preview closing saat modal dibuka atau cutOffDate berubah
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setIsLoadingPreview(true);

    getClosingPreview('bendahara', cutOffDate)
      .then((res) => {
        if (!isMounted) return;
        if (res.error) {
          toast.error(res.error);
        } else {
          setPreview(res);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching preview:', err);
        toast.error('Gagal menghitung pratinjau closing');
      })
      .finally(() => {
        if (isMounted) setIsLoadingPreview(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, cutOffDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) {
      toast.error('Judul penutupan buku wajib diisi.');
      return;
    }

    if (!preview || preview.total_transaksi === 0) {
      toast.error('Tidak ada transaksi yang belum di-closing pada tanggal cut-off ini.');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('judul', judul.trim());
      formData.append('tanggal_selesai', cutOffDate);
      if (catatan.trim()) {
        formData.append('catatan', catatan.trim());
      }

      const res = await executeClosingKeuangan(formData, 'bendahara');
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('Penutupan buku (closing) kas berhasil disimpan & transaksi telah dikunci.');
        onSuccess();
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BookCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Tutup Buku Kas Keuangan (Closing)</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Mengarsipkan riwayat transaksi aktif, merekap saldo akhir, dan mengunci transaksi untuk integritas audit.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Card Rekapitulasi Preview */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-primary" />
                Rekapitulasi Periode yang Akan Ditutup
              </span>
              {isLoadingPreview ? (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Menghitung...
                </div>
              ) : (
                <Badge variant="outline" className="text-[10px] font-mono">
                  {preview?.total_transaksi || 0} Transaksi Masuk Closing
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Saldo Awal */}
              <div className="p-2.5 rounded-lg bg-background border border-border/60">
                <div className="text-[10px] font-medium text-muted-foreground uppercase">Saldo Awal</div>
                <div className="text-xs sm:text-sm font-bold font-mono text-foreground mt-0.5">
                  {formatRupiah(preview?.saldo_awal || 0)}
                </div>
              </div>

              {/* Pemasukan */}
              <div className="p-2.5 rounded-lg bg-background border border-border/60">
                <div className="text-[10px] font-medium text-emerald-600 flex items-center gap-1 uppercase">
                  <ArrowDownLeft className="h-3 w-3" /> Pemasukan
                </div>
                <div className="text-xs sm:text-sm font-bold font-mono text-emerald-600 mt-0.5">
                  +{formatRupiah(preview?.total_masuk || 0)}
                </div>
              </div>

              {/* Pengeluaran */}
              <div className="p-2.5 rounded-lg bg-background border border-border/60">
                <div className="text-[10px] font-medium text-rose-600 flex items-center gap-1 uppercase">
                  <ArrowUpRight className="h-3 w-3" /> Pengeluaran
                </div>
                <div className="text-xs sm:text-sm font-bold font-mono text-rose-600 mt-0.5">
                  -{formatRupiah(preview?.total_keluar || 0)}
                </div>
              </div>

              {/* Saldo Akhir */}
              <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                <div className="text-[10px] font-medium text-primary uppercase">Saldo Akhir Sisa</div>
                <div className="text-xs sm:text-sm font-bold font-mono text-primary mt-0.5">
                  {formatRupiah(preview?.saldo_akhir || 0)}
                </div>
              </div>
            </div>

            {preview && preview.total_transaksi === 0 && !isLoadingPreview && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Belum ada transaksi aktif baru yang dapat di-closing pada rentang tanggal ini.</span>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="closing-cutoff" className="text-xs font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  Tanggal Cut-off (Sampai Tanggal)
                </Label>
                <Input
                  id="closing-cutoff"
                  type="date"
                  value={cutOffDate}
                  onChange={(e) => setCutOffDate(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="closing-judul" className="text-xs font-medium">
                  Judul Penutupan Kas <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="closing-judul"
                  placeholder="Contoh: Closing Kas September 2026"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="closing-catatan" className="text-xs font-medium">
                Catatan Berita Acara / Keterangan Closing (Opsional)
              </Label>
              <Textarea
                id="closing-catatan"
                placeholder="Catatan hasil rekonsiliasi kas, berita acara kas opname, atau catatan serah terima..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="text-xs min-h-[75px] resize-none"
              />
            </div>
          </div>

          {/* Notice Audit Lock */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/60 border text-[11px] text-muted-foreground">
            <Lock className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
            <p>
              <strong className="text-foreground">Perhatian:</strong> Setelah penutupan buku disimpan, riwayat transaksi di atas akan dikunci dan diarsipkan ke tab <strong>Riwayat Closing</strong>. Transaksi tidak dapat dihapus oleh Anggota maupun Ketua, dan hanya Admin yang diizinkan untuk mengedit apabila diperlukan.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || isLoadingPreview || !preview || preview.total_transaksi === 0}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyimpan Closing...
                </>
              ) : (
                <>
                  <BookCheck className="h-3.5 w-3.5" /> Konfirmasi Tutup Buku
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
