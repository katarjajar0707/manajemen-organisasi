'use client';

import { useState, useEffect } from 'react';
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
import { Calendar as CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { KegiatanData } from '@/actions/kegiatan';

export interface KegiatanFormData {
  judul: string;
  deskripsi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  lokasi: string;
  targetRab: number;
}

interface KegiatanFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial: Partial<KegiatanData> | null;
  isPending: boolean;
  errorMessage: string | null;
  isAdminOrKetua?: boolean;
  onClose: () => void;
  onSave: (data: KegiatanFormData) => void;
}

export function KegiatanFormDialog({
  open,
  mode,
  initial,
  isPending,
  errorMessage,
  isAdminOrKetua = false,
  onClose,
  onSave,
}: KegiatanFormDialogProps) {
  const emptyForm: KegiatanFormData = {
    judul: '',
    deskripsi: '',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalSelesai: new Date().toISOString().split('T')[0],
    lokasi: 'Balai Warga RW 05',
    targetRab: 0,
  };

  const [form, setForm] = useState<KegiatanFormData>(emptyForm);
  const [rabDisplay, setRabDisplay] = useState('');

  useEffect(() => {
    if (open) {
      if (initial) {
        const rab = initial.targetRab ? Number(initial.targetRab) : 0;
        setForm({
          judul: initial.judul || '',
          deskripsi: initial.deskripsi || '',
          tanggalMulai: initial.tanggalMulai || emptyForm.tanggalMulai,
          tanggalSelesai: initial.tanggalSelesai || initial.tanggalMulai || emptyForm.tanggalSelesai,
          lokasi: initial.lokasi || 'Balai Warga RW 05',
          targetRab: rab,
        });
        setRabDisplay(rab > 0 ? new Intl.NumberFormat('id-ID').format(rab) : '');
      } else {
        setForm(emptyForm);
        setRabDisplay('');
      }
    }
  }, [open, initial]);

  const handleSave = () => {
    if (!form.judul || !form.tanggalMulai) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <span>{mode === 'create' ? 'Tambah Jadwal Kegiatan Baru' : 'Edit Jadwal Kegiatan'}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Jadwal ini akan otomatis tampil di kalender organisasi dan dashboard transparansi warga.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-3.5 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Judul Kegiatan *</Label>
            <Input
              placeholder="Contoh: Kerja Bakti Lingkungan RW 05"
              value={form.judul}
              onChange={(e) => setForm((p) => ({ ...p, judul: e.target.value }))}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Deskripsi Kegiatan *</Label>
            <Textarea
              placeholder="Jelaskan tujuan kegiatan, susunan acara, dan imbauan..."
              rows={3}
              value={form.deskripsi}
              onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
              className="text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tanggal Mulai *</Label>
              <Input
                type="date"
                value={form.tanggalMulai}
                onChange={(e) => setForm((p) => ({ ...p, tanggalMulai: e.target.value }))}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tanggal Selesai</Label>
              <Input
                type="date"
                value={form.tanggalSelesai}
                onChange={(e) => setForm((p) => ({ ...p, tanggalSelesai: e.target.value }))}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Lokasi Kegiatan</Label>
            <Input
              placeholder="Contoh: Balai Warga & Lapangan RW 05"
              value={form.lokasi}
              onChange={(e) => setForm((p) => ({ ...p, lokasi: e.target.value }))}
              className="text-xs"
            />
          </div>

          {/* Target RAB (Rencana Anggaran Biaya) */}
          {isAdminOrKetua ? (
            <div className="space-y-1.5 pt-1 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Target RAB (Rp)</Label>
                <span className="text-[10px] text-muted-foreground font-mono">Khusus Admin & Ketua</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-medium">Rp</span>
                <Input
                  type="text"
                  placeholder="0"
                  value={rabDisplay}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val) {
                      const num = parseInt(val, 10);
                      setRabDisplay(new Intl.NumberFormat('id-ID').format(num));
                      setForm((p) => ({ ...p, targetRab: num }));
                    } else {
                      setRabDisplay('');
                      setForm((p) => ({ ...p, targetRab: 0 }));
                    }
                  }}
                  className="pl-9 text-xs font-mono"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Target rencana anggaran biaya (RAB) kas untuk agenda ini. Akan dipantau realisasinya di modul Keuangan.
              </p>
            </div>
          ) : (
            form.targetRab > 0 && (
              <div className="p-2.5 rounded-lg bg-muted/40 border text-xs space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Target RAB Terdaftar:</span>
                <p className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                  Rp {new Intl.NumberFormat('id-ID').format(form.targetRab)}
                </p>
                <p className="text-[10px] text-muted-foreground">Hanya Admin dan Ketua yang berwenang mengubah nominal Target RAB.</p>
              </div>
            )
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button
            size="sm"
            className="text-xs bg-primary hover:bg-primary/90 gap-1.5"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{mode === 'create' ? 'Simpan Jadwal' : 'Perbarui Jadwal'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
