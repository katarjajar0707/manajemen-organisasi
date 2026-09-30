'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar, FileText, Sliders } from 'lucide-react';
import { OperasionalKebijakan, updatePengaturanOperasional } from '@/actions/pengaturan';

interface PengaturanOperasionalTabProps {
  operasional: OperasionalKebijakan;
  setOperasional: React.Dispatch<React.SetStateAction<OperasionalKebijakan>>;
  onToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export function PengaturanOperasionalTab({
  operasional,
  setOperasional,
  onToast,
}: PengaturanOperasionalTabProps) {
  const [isSavingOperasional, setIsSavingOperasional] = useState(false);

  const handleSaveOperasional = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingOperasional(true);
    try {
      const res = await updatePengaturanOperasional(operasional);
      if (res.success) {
        onToast('Kebijakan operasional & periode organisasi berhasil disimpan ke database!', 'success');
      } else {
        onToast(res.error || 'Gagal menyimpan operasional.', 'warning');
      }
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : 'Terjadi kesalahan server.', 'warning');
    } finally {
      setIsSavingOperasional(false);
    }
  };

  return (
    <form onSubmit={handleSaveOperasional} className="space-y-5">
      {/* Periode Kepengurusan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-400" />
            Masa Bakti & Periode Kepengurusan Aktif
          </CardTitle>
          <CardDescription>Semua data anggota, laporan keuangan, dan kegiatan akan tertaut ke periode aktif ini.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nama-periode" className="text-xs">
                Nama Periode
              </Label>
              <Input
                id="nama-periode"
                value={operasional.periodeAktif}
                onChange={(e) => setOperasional({ ...operasional, periodeAktif: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tgl-mulai" className="text-xs">
                Tanggal Pelantikan / Mulai
              </Label>
              <Input
                id="tgl-mulai"
                type="date"
                value={operasional.tglMulaiPeriode}
                onChange={(e) => setOperasional({ ...operasional, tglMulaiPeriode: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tgl-selesai" className="text-xs">
                Estimasi Selesai Masa Bakti
              </Label>
              <Input
                id="tgl-selesai"
                type="date"
                value={operasional.tglSelesaiPeriode}
                onChange={(e) => setOperasional({ ...operasional, tglSelesaiPeriode: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Administrasi Surat & Format Penomoran */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Format Penomoran Surat Otomatis
          </CardTitle>
          <CardDescription>Penomoran surat masuk, surat keluar, dan proposal akan mengikuti skema pola penomoran ini.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5 max-w-md">
            <Label htmlFor="format-surat" className="text-xs">
              Pola Format Nomor
            </Label>
            <Input
              id="format-surat"
              value={operasional.formatNomorSurat}
              onChange={(e) => setOperasional({ ...operasional, formatNomorSurat: e.target.value })}
            />
            <p className="text-[11px] text-muted-foreground">
              Variabel yang tersedia: <code className="text-primary font-mono">&#123;NOMOR&#125;</code> (3 digit otomatis),{' '}
              <code className="text-primary font-mono">&#123;BULAN&#125;</code> (Romawi),{' '}
              <code className="text-primary font-mono">&#123;TAHUN&#125;</code>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Kebijakan Inventaris & Keuangan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sliders className="h-4 w-4 text-amber-400" />
            Batasan Operasional Inventaris & Kas
          </CardTitle>
          <CardDescription>Aturan kendali mutu untuk peminjaman aset fisik dan pencatatan kas keluar bendahara.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="max-hari-pinjam" className="text-xs">
                Batas Maksimal Hari Peminjaman Inventaris
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="max-hari-pinjam"
                  type="number"
                  min="1"
                  max="30"
                  className="w-28"
                  value={operasional.maxHariPinjamInventaris}
                  onChange={(e) => setOperasional({ ...operasional, maxHariPinjamInventaris: e.target.value })}
                />
                <span className="text-xs text-muted-foreground">Hari berturut-turut</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="max-tanpa-nota" className="text-xs">
                Batas Kas Keluar Tanpa Nota Fisik (Petty Cash)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Rp</span>
                <Input
                  id="max-tanpa-nota"
                  type="number"
                  step="5000"
                  className="w-40"
                  value={operasional.maxPengeluaranTanpaNota}
                  onChange={(e) => setOperasional({ ...operasional, maxPengeluaranTanpaNota: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <Label className="text-sm font-medium">Wajib Persetujuan Ketua untuk Peminjaman Elektronik/Tenda</Label>
                <p className="text-xs text-muted-foreground">Peminjaman aset bernilai tinggi harus mendapatkan approval tertulis dari Ketua Karang Taruna.</p>
              </div>
              <Switch
                checked={operasional.wajibPersetujuanKetua}
                onCheckedChange={(val) => setOperasional({ ...operasional, wajibPersetujuanKetua: val })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <Label className="text-sm font-medium">Peringatan Pengeluaran Kas Diatas Ambang Batas</Label>
                <p className="text-xs text-muted-foreground">Kirim notifikasi broadcast ke Ketua & Admin jika bendahara mencatat pengeluaran lebih dari batas yang ditentukan.</p>
              </div>
              <Switch
                checked={operasional.notifPengeluaranBesar}
                onCheckedChange={(val) => setOperasional({ ...operasional, notifPengeluaranBesar: val })}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-border/50 pt-4">
          <Button type="submit" loading={isSavingOperasional} className="gap-2 bg-primary text-primary-foreground">
            <span>Simpan Kebijakan Operasional</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
