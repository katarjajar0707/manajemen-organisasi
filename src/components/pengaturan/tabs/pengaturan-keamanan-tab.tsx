'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Lock, Save, Loader2 } from 'lucide-react';
import { KeamananSistem, updatePengaturanKeamanan } from '@/actions/pengaturan';

interface PengaturanKeamananTabProps {
  keamanan: KeamananSistem;
  setKeamanan: React.Dispatch<React.SetStateAction<KeamananSistem>>;
  onToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export function PengaturanKeamananTab({
  keamanan,
  setKeamanan,
  onToast,
}: PengaturanKeamananTabProps) {
  const [isSavingKeamanan, setIsSavingKeamanan] = useState(false);

  const handleSaveKeamanan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingKeamanan(true);
    try {
      const res = await updatePengaturanKeamanan(keamanan);
      if (res.success) {
        onToast('Konfigurasi hak akses & keamanan sistem berhasil disimpan ke database!', 'success');
      } else {
        onToast(res.error || 'Gagal menyimpan keamanan.', 'warning');
      }
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : 'Terjadi kesalahan server.', 'warning');
    } finally {
      setIsSavingKeamanan(false);
    }
  };

  return (
    <form onSubmit={handleSaveKeamanan} className="space-y-5">
      {/* Pendaftaran & Registrasi Pengguna */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400" />
            Kebijakan Pendaftaran Akun Pengurus
          </CardTitle>
          <CardDescription>Kontrol bagaimana akun anggota baru dapat bergabung ke dalam sistem internal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5 max-w-md">
            <Label htmlFor="mode-reg" className="text-xs">
              Metode Penambahan Pengguna
            </Label>
            <Select
              value={keamanan.modePendaftaran}
              onValueChange={(val) => setKeamanan({ ...keamanan, modePendaftaran: val })}
            >
              <SelectTrigger id="mode-reg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invite_only">Hanya Melalui Undangan / Dibuat oleh Admin</SelectItem>
                <SelectItem value="approval_required">Pendaftaran Terbuka (Wajib Verifikasi & Persetujuan Admin)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Metode &apos;Hanya Melalui Undangan&apos; paling direkomendasikan untuk menjaga kerahasiaan catatan internal.
            </p>
          </div>

          <div className="space-y-1.5 max-w-xs">
            <Label htmlFor="session-timeout" className="text-xs">
              Batas Waktu Sesi Login (Inactivity Timeout)
            </Label>
            <Select
              value={keamanan.sessionTimeoutMinutes}
              onValueChange={(val) => setKeamanan({ ...keamanan, sessionTimeoutMinutes: val })}
            >
              <SelectTrigger id="session-timeout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="720">12 Jam</SelectItem>
                <SelectItem value="1440">24 Jam</SelectItem>
                <SelectItem value="10080">7 Hari (Standar)</SelectItem>
                <SelectItem value="43200">1 Bulan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Portal Publik & Transparansi Warga */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-sky-400" />
            Visibilitas & Portal Publik Warga
          </CardTitle>
          <CardDescription>Atur informasi organisasi yang dapat diakses oleh warga masyarakat umum tanpa perlu login.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <Label className="text-sm font-medium">Aktifkan Halaman Publik Utama (Landing Page)</Label>
              <p className="text-xs text-muted-foreground">Warga dapat membuka rute umum `/` untuk melihat profil karang taruna dan agenda kegiatan.</p>
            </div>
            <Switch
              checked={keamanan.portalPublikAktif}
              onCheckedChange={(val) => setKeamanan({ ...keamanan, portalPublikAktif: val })}
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="space-y-0.5 pr-4">
              <Label className="text-sm font-medium">Publikasikan Ringkasan Kas & Transparansi Keuangan</Label>
              <p className="text-xs text-muted-foreground">Warga dapat melihat total saldo kas dan rekap pemasukan/pengeluaran kegiatan di portal publik.</p>
            </div>
            <Switch
              checked={keamanan.transparansiKasPublik}
              onCheckedChange={(val) => setKeamanan({ ...keamanan, transparansiKasPublik: val })}
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="space-y-0.5 pr-4">
              <Label className="text-sm font-medium text-amber-400">Mode Pemeliharaan (Maintenance Mode)</Label>
              <p className="text-xs text-muted-foreground">Hanya Administrator yang dapat login. Pengguna lain dan pengunjung publik akan melihat halaman pemeliharaan.</p>
            </div>
            <Switch
              checked={keamanan.modeMaintenance}
              onCheckedChange={(val) => setKeamanan({ ...keamanan, modeMaintenance: val })}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-border/50 pt-4">
          <Button type="submit" disabled={isSavingKeamanan} className="gap-2 bg-primary text-primary-foreground">
            {isSavingKeamanan ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSavingKeamanan ? 'Menyimpan ke Database...' : 'Simpan Konfigurasi Keamanan'}</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
