'use client';

import React, { useState, useEffect } from 'react';
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
import { ArrowRightLeft, Clock, Loader2 } from 'lucide-react';
import { ItemInventaris } from '@/actions/inventaris';
import type { PengaturanSistemData } from '@/actions/pengaturan';

export interface PinjamFormData {
  peminjam: string;
  tanggalPinjam: string;
  tanggalKembaliRencana: string;
  jumlahPinjam: number;
  keterangan: string;
}

interface InventarisPinjamDialogProps {
  open: boolean;
  item: ItemInventaris | null;
  settings?: PengaturanSistemData;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: PinjamFormData) => void;
  onReturn: () => void;
}

export function InventarisPinjamDialog({
  open,
  item,
  settings,
  isPending,
  onClose,
  onSubmit,
  onReturn,
}: InventarisPinjamDialogProps) {
  const [pinjamForm, setPinjamForm] = useState<PinjamFormData>({
    peminjam: '',
    tanggalPinjam: new Date().toISOString().split('T')[0],
    tanggalKembaliRencana: '',
    jumlahPinjam: 1,
    keterangan: '',
  });

  useEffect(() => {
    if (open) {
      setPinjamForm({
        peminjam: '',
        tanggalPinjam: new Date().toISOString().split('T')[0],
        tanggalKembaliRencana: '',
        jumlahPinjam: 1,
        keterangan: '',
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinjamForm.peminjam || !pinjamForm.tanggalKembaliRencana) return;
    onSubmit(pinjamForm);
  };

  const isTersedia = item?.status === 'Tersedia';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px] w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-sky-400" />
            {isTersedia ? 'Form Peminjaman Barang' : 'Konfirmasi Pengembalian Barang'}
          </DialogTitle>
          <DialogDescription>
            {isTersedia
              ? `Catat rincian warga/panitia yang meminjam "${item?.nama}".`
              : `Pastikan barang "${item?.nama}" telah dikembalikan dalam kondisi fisik yang baik.`}
          </DialogDescription>
        </DialogHeader>

        {item && isTersedia ? (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {settings?.operasional && (
              <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-700 dark:text-sky-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>Kebijakan Peminjaman {settings.profil.nama || 'Organisasi'}:</span>
                </div>
                <p>
                  • Batas maksimal peminjaman: <strong>{settings.operasional.maxHariPinjamInventaris} hari</strong>.
                </p>
                {settings.operasional.wajibPersetujuanKetua && (
                  <p>• Peminjaman aset wajib mendapatkan persetujuan / konfirmasi dari Ketua.</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="pinjam-nama" className="text-xs">
                Nama Peminjam / Acara <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pinjam-nama"
                placeholder="Contoh: Pak RT 03 / Panitia Acara Senam"
                value={pinjamForm.peminjam}
                onChange={(e) => setPinjamForm({ ...pinjamForm, peminjam: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pinjam-tgl-pinjam" className="text-xs">
                  Tanggal Pinjam (Otomatis)
                </Label>
                <Input
                  id="pinjam-tgl-pinjam"
                  type="date"
                  value={pinjamForm.tanggalPinjam}
                  onChange={(e) => setPinjamForm({ ...pinjamForm, tanggalPinjam: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pinjam-tgl-kembali" className="text-xs">
                  Rencana Tanggal Kembali <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pinjam-tgl-kembali"
                  type="date"
                  value={pinjamForm.tanggalKembaliRencana}
                  onChange={(e) => setPinjamForm({ ...pinjamForm, tanggalKembaliRencana: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pinjam-keterangan" className="text-xs">
                Keperluan / Catatan
              </Label>
              <Input
                id="pinjam-keterangan"
                placeholder="Contoh: Dipinjam untuk kegiatan syukuran warga"
                value={pinjamForm.keterangan}
                onChange={(e) => setPinjamForm({ ...pinjamForm, keterangan: e.target.value })}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending} className="bg-sky-600 hover:bg-sky-700">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Konfirmasi Pinjam
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4 py-2">
            <div className="p-3.5 rounded-lg bg-muted/50 border border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Peminjam:</span>
                <span className="font-semibold text-foreground">{item?.peminjam || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal Pinjam:</span>
                <span className="font-medium text-foreground">{item?.tglPinjam || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Kembali:</span>
                <span className="font-medium text-foreground">{item?.tglKembaliRencana || '-'}</span>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Batal
              </Button>
              <Button
                type="button"
                onClick={onReturn}
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Tandai Sudah Kembali
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
