import type React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingDown, TrendingUp, AlertCircle, Paperclip, Target } from 'lucide-react';
import { isImageFile, isImageUrl } from '@/lib/utils';
import { PreviewImage } from '@/components/common/preview-image';
import type { KegiatanOption, TargetRabKegiatanItem } from '@/actions/keuangan';
import type { PengaturanSistemData } from '@/actions/pengaturan';

const idNumberFormatter = new Intl.NumberFormat('id-ID');

export interface RabPreviewInfo {
  target: number;
  currentRealisasi: number;
  currentPct: number;
  nominalNum: number;
  deltaPct: number;
  newRealisasi: number;
  newPct: number;
  visualWidth: number;
}

interface TransaksiFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jenis: 'masuk' | 'keluar';
  judul: string;
  setJudul: (val: string) => void;
  keterangan: string;
  setKeterangan: (val: string) => void;
  selectedKategori: string;
  setSelectedKategori: (val: string) => void;
  jumlah: string;
  setJumlah: (val: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  editingId: string | null;
  editingLampiranUrl: string | null;
  error: string | null;
  isPending: boolean;
  allCategories: string[];
  targetRabList: TargetRabKegiatanItem[];
  kegiatanOptions: KegiatanOption[];
  rabPreview: RabPreviewInfo | null;
  currentSettings?: PengaturanSistemData;
  formatRupiah: (val: number | string) => string;
  onSubmit: (e: React.FormEvent) => void;
  onPreviewImage: (url: string) => void;
}

export function TransaksiFormDialog({
  open,
  onOpenChange,
  jenis,
  judul,
  setJudul,
  keterangan,
  setKeterangan,
  selectedKategori,
  setSelectedKategori,
  jumlah,
  setJumlah,
  file,
  setFile,
  editingId,
  editingLampiranUrl,
  error,
  isPending,
  allCategories,
  targetRabList,
  kegiatanOptions,
  rabPreview,
  currentSettings,
  formatRupiah,
  onSubmit,
  onPreviewImage,
}: TransaksiFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-lg max-h-[calc(100dvh-1rem)] overflow-x-hidden overflow-y-auto p-4 sm:p-6">
        <form onSubmit={onSubmit} className="min-w-0">
          <DialogHeader className="min-w-0">
            <DialogTitle className="pr-8 text-base sm:text-lg flex items-center gap-2">
              {jenis === 'masuk' ? <TrendingUp className="h-5 w-5 text-emerald-600" /> : <TrendingDown className="h-5 w-5 text-rose-600" />}
              <span>{editingId ? 'Edit Transaksi' : jenis === 'masuk' ? 'Catat Kas Masuk' : 'Catat Kas Keluar'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Masukkan detail mutasi {jenis === 'masuk' ? 'pemasukan' : 'pengeluaran'} kas.
            </DialogDescription>
          </DialogHeader>

          <div className="min-w-0 space-y-4 py-4 sm:space-y-5">
            {error && (
              <div className="min-w-0 bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="min-w-0 wrap-break-word">{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Judul Transaksi</Label>
              <Input
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder={jenis === 'masuk' ? 'Cth: Iuran Bulanan Anggota' : 'Cth: Pembelian Konsumsi Rapat'}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Kategori / Agenda Acara</Label>
              <Select value={selectedKategori} onValueChange={setSelectedKategori}>
                <SelectTrigger className="min-w-0 text-xs">
                  <SelectValue placeholder="Pilih Kategori / Agenda" className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kas General">Kas General (Umum / Operasional)</SelectItem>
                  {allCategories.map((cat) => {
                    const matchRab =
                      targetRabList.find((k) => k.judul?.trim().toLowerCase() === cat.trim().toLowerCase()) ||
                      kegiatanOptions.find((k) => k.judul?.trim().toLowerCase() === cat.trim().toLowerCase());
                    const hasRab = matchRab && matchRab.target_rab > 0;
                    return (
                      <SelectItem key={cat} value={cat}>
                        Agenda: {cat} {hasRab ? `(Target RAB: ${formatRupiah(matchRab.target_rab)})` : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="wrap-break-word text-[11px] text-muted-foreground">Pilih agenda sesuai acara yang dibuat, atau pilih Kas General untuk transaksi umum.</p>

              {/* Dynamic Target RAB Progress & Contribution Preview */}
              {rabPreview && (
                <div className="rounded-lg border bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/50 p-2.5 space-y-2 mt-1.5">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="font-semibold text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Target RAB: {formatRupiah(rabPreview.target)}</span>
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono font-semibold px-2 py-0.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                    >
                      {rabPreview.nominalNum > 0
                        ? `${rabPreview.currentPct}% ➔ ${rabPreview.newPct}% (${jenis === 'masuk' ? '+' : '-'}${rabPreview.deltaPct}%)`
                        : `${rabPreview.currentPct}% Tercapai`}
                    </Badge>
                  </div>

                  <div className="w-full bg-emerald-200/50 dark:bg-emerald-950/60 rounded-full h-1.5 overflow-hidden border border-emerald-300/30 dark:border-emerald-800/30">
                    <div
                      className="h-full rounded-full transition-all duration-300 bg-emerald-600 dark:bg-emerald-400"
                      style={{ width: `${rabPreview.visualWidth}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground gap-2">
                    <span className="tabular-nums">Realisasi Saat Ini: {formatRupiah(rabPreview.currentRealisasi)}</span>
                    {rabPreview.nominalNum > 0 && (
                      <span className="font-semibold font-mono tabular-nums text-emerald-700 dark:text-emerald-300 truncate">
                        {jenis === 'masuk' ? '+' : '-'} {formatRupiah(rabPreview.nominalNum)} ({rabPreview.deltaPct}%)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Nominal (Rp)</Label>
              <Input
                value={jumlah}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val) {
                    setJumlah(idNumberFormatter.format(parseInt(val, 10)));
                  } else {
                    setJumlah('');
                  }
                }}
                placeholder="0"
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Keterangan Tambahan (Opsional)</Label>
              <Textarea value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Detail tambahan..." rows={2} className="text-xs" />
            </div>

            {jenis === 'keluar' &&
              currentSettings?.operasional &&
              (() => {
                const nominalVal = parseInt(jumlah.replace(/\./g, ''), 10) || 0;
                const batasNotif = parseFloat(currentSettings.operasional.batasNotifPengeluaran || '1000000') || 1000000;
                const isBesar = currentSettings.operasional.notifPengeluaranBesar && nominalVal >= batasNotif;
                const maxTanpaNota = parseFloat(currentSettings.operasional.maxPengeluaranTanpaNota || '50000') || 50000;

                return (
                  <div className="space-y-1.5 pt-1">
                    {isBesar && (
                      <div className="min-w-0 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                        <span className="min-w-0 wrap-break-word">
                          Perhatian: Nominal pengeluaran ini tergolong pengeluaran besar (mencapai batas Rp {new Intl.NumberFormat('id-ID').format(batasNotif)}). Pastikan telah berkoordinasi dan disetujui Ketua.
                        </span>
                      </div>
                    )}
                    <p className="wrap-break-word text-[11px] text-muted-foreground">
                      * Kebijakan operasional {currentSettings.profil.nama || 'organisasi'}: Pengeluaran kas di atas Rp {new Intl.NumberFormat('id-ID').format(maxTanpaNota)} wajib menyertakan lampiran nota fisik.
                    </p>
                  </div>
                );
              })()}

            <div className="space-y-1.5">
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start">
                {editingId && editingLampiranUrl && isImageUrl(editingLampiranUrl) && (
                  <button
                    type="button"
                    className="h-20 w-20 shrink-0 self-start overflow-hidden rounded-md border bg-muted sm:h-16 sm:w-16"
                    onClick={() => onPreviewImage(editingLampiranUrl)}
                    title="Lihat lampiran tersimpan"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <PreviewImage src={editingLampiranUrl} alt="Preview lampiran tersimpan" className="h-full w-full object-cover" />
                  </button>
                )}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Label className="text-xs">Lampiran (Nota/Bukti) {jenis === 'keluar' && <span className="text-destructive">* Wajib</span>}</Label>
                  <Input
                    id="lampiran-file"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="sr-only"
                    accept="image/*,.heic,.heif,.pdf"
                    required={jenis === 'keluar' && !editingId}
                  />
                  <label
                    htmlFor="lampiran-file"
                    className="flex min-h-9 w-full cursor-pointer flex-col items-start justify-center gap-0.5 rounded-md border border-input bg-background px-3 py-2 text-xs text-muted-foreground hover:bg-muted/50"
                  >
                    <Paperclip className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 max-w-full truncate font-medium text-foreground">
                      {file?.name || (editingLampiranUrl ? decodeURIComponent(editingLampiranUrl.split('/').pop()?.split('?')[0] || 'Lampiran tersimpan') : 'Belum ada file dipilih')}
                    </span>
                    <span className="text-[10px]">{editingId && editingLampiranUrl ? 'Upload untuk mengganti/edit file' : 'Upload file lampiran'}</span>
                  </label>
                </div>
              </div>
              {file && isImageFile(file) && (
                <div className="flex min-w-0 items-center gap-2.5 mt-2 p-2 bg-muted/40 border rounded-lg">
                  <div className="h-12 w-12 rounded-md overflow-hidden border bg-background shrink-0">
                    <PreviewImage file={file} alt="Preview Bukti" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="font-medium truncate text-foreground">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB (Siap diunggah)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-1 sm:gap-0 [&>button]:w-full sm:[&>button]:w-auto">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!judul || !jumlah || (jenis === 'keluar' && !file && !editingLampiranUrl)}
            >
              {editingId ? 'Simpan Perubahan' : 'Simpan Transaksi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
