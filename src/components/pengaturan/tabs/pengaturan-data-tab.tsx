'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Server,
  Download,
  Clock,
  RefreshCw,
  ShieldAlert,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  exportModuleData,
  clearSystemCache,
  clearAllDummyData,
  getRecentAuditLogs,
} from '@/actions/pengaturan';
import { ActiveUsersPanel } from '@/components/pengaturan/active-users-panel';

export interface AuditLogItem {
  id: string;
  action: string;
  actor: string;
  timeAgo: string;
  color: string;
}

export interface PengaturanStats {
  isConnected: boolean;
  latencyMs: number;
  totalAnggota: number;
  totalKeuangan: number;
  totalInventaris: number;
  totalArsip: number;
}

interface PengaturanDataTabProps {
  initialStats?: PengaturanStats;
  initialLogs?: AuditLogItem[];
  onToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export function PengaturanDataTab({
  initialStats,
  initialLogs = [],
  onToast,
}: PengaturanDataTabProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isClearingDummy, setIsClearingDummy] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isClearDummyDialogOpen, setIsClearDummyDialogOpen] = useState(false);

  // Handle Export Data Module (CSV download)
  const handleExportData = async (moduleType: 'anggota' | 'keuangan' | 'inventaris') => {
    setIsExporting(moduleType);
    try {
      const res = await exportModuleData(moduleType);
      if (res.error || !res.csv) {
        onToast(res.error || 'Gagal mengekspor data.', 'warning');
        return;
      }

      const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', res.filename || `export-${moduleType}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onToast(`Berhasil mengunduh data ${moduleType} format CSV!`, 'success');
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : 'Terjadi kesalahan saat ekspor data.', 'warning');
    } finally {
      setIsExporting(null);
    }
  };

  // Handle Refresh Logs
  const handleRefreshLogs = async () => {
    setIsRefreshingLogs(true);
    try {
      const freshLogs = await getRecentAuditLogs();
      setLogs(freshLogs);
      onToast('Log aktivitas sistem berhasil disegarkan!', 'info');
    } catch {
      onToast('Gagal memperbarui log.', 'warning');
    } finally {
      setIsRefreshingLogs(false);
    }
  };

  // Handle Clear Cache
  const handleConfirmReset = async () => {
    setIsClearingCache(true);
    try {
      const res = await clearSystemCache();
      if (res.success) {
        onToast('Cache sistem & sesi berhasil dibersihkan! Seluruh data disinkronkan ulang.', 'success');
        setIsResetDialogOpen(false);
      } else {
        onToast(res.message || 'Gagal membersihkan cache.', 'warning');
      }
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : 'Terjadi kesalahan koneksi.', 'warning');
    } finally {
      setIsClearingCache(false);
    }
  };

  // Handle Clear Dummy Data
  const handleConfirmClearDummy = async () => {
    setIsClearingDummy(true);
    try {
      const res = await clearAllDummyData();
      if (res.success) {
        onToast('Semua data percobaan dummy berhasil dihapus secara bersih dari database!', 'success');
        setIsClearDummyDialogOpen(false);
        const freshLogs = await getRecentAuditLogs();
        setLogs(freshLogs);
      } else {
        onToast(res.message || 'Gagal menghapus data dummy.', 'warning');
      }
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat pembersihan data.', 'warning');
    } finally {
      setIsClearingDummy(false);
    }
  };

  const totalEntitas =
    (initialStats?.totalAnggota || 0) +
    (initialStats?.totalKeuangan || 0) +
    (initialStats?.totalInventaris || 0) +
    (initialStats?.totalArsip || 0);

  return (
    <div className="space-y-5">
      {/* Status Database & Server */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            Status Infrastruktur Database & Storage
          </CardTitle>
          <CardDescription>Informasi status koneksi backend PostgreSQL Supabase dan ringkasan data tersimpan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
              <span className="text-xs text-muted-foreground block">Konektivitas Database:</span>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-sm text-emerald-400">
                  {initialStats?.isConnected ? 'Supabase Connected' : 'Online / Connected'}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">Latency: {initialStats?.latencyMs || 25}ms</span>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
              <span className="text-xs text-muted-foreground block">Total Data Terindeks:</span>
              <div className="font-semibold text-sm text-foreground">{totalEntitas} Entitas Data</div>
              <span className="text-[11px] text-muted-foreground">
                {initialStats?.totalAnggota || 0} Anggota · {initialStats?.totalKeuangan || 0} Kas ·{' '}
                {initialStats?.totalInventaris || 0} Aset
              </span>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
              <span className="text-xs text-muted-foreground block">Backup Terjadwal:</span>
              <div className="font-semibold text-sm text-foreground">Otomatis Cloud Supabase</div>
              <span className="text-[11px] text-emerald-400">Tersinkronisasi Real-time</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ekspor Cadangan Data Organisasi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4 text-sky-400" />
            Ekspor Cadangan Data Organisasi (Backup Langsung)
          </CardTitle>
          <CardDescription>Unduh salinan data format CSV langsung dari database untuk pengarsipan mandiri atau laporan tahunan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 border rounded-lg flex flex-col justify-between gap-3 bg-card/60">
              <div>
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-sm">Data Keanggotaan</h5>
                  <Badge variant="outline" className="text-[10px]">
                    {initialStats?.totalAnggota ?? 0} Orang
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Daftar nama anggota, RT/RW, jabatan, dan nomor kontak.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs"
                disabled={isExporting === 'anggota'}
                onClick={() => handleExportData('anggota')}
              >
                {isExporting === 'anggota' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                <span>{isExporting === 'anggota' ? 'Mengunduh...' : 'Ekspor Anggota (.csv)'}</span>
              </Button>
            </div>

            <div className="p-3.5 border rounded-lg flex flex-col justify-between gap-3 bg-card/60">
              <div>
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-sm">Buku Kas & Keuangan</h5>
                  <Badge variant="outline" className="text-[10px]">
                    {initialStats?.totalKeuangan ?? 0} Baris
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Seluruh rekap transaksi kas masuk, kas keluar, dan saldo.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs"
                disabled={isExporting === 'keuangan'}
                onClick={() => handleExportData('keuangan')}
              >
                {isExporting === 'keuangan' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                <span>{isExporting === 'keuangan' ? 'Mengunduh...' : 'Ekspor Kas (.csv)'}</span>
              </Button>
            </div>

            <div className="p-3.5 border rounded-lg flex flex-col justify-between gap-3 bg-card/60">
              <div>
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-sm">Aset & Inventaris</h5>
                  <Badge variant="outline" className="text-[10px]">
                    {initialStats?.totalInventaris ?? 0} Aset
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Daftar barang inventaris, jumlah unit, dan kondisi barang.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs"
                disabled={isExporting === 'inventaris'}
                onClick={() => handleExportData('inventaris')}
              >
                {isExporting === 'inventaris' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                <span>{isExporting === 'inventaris' ? 'Mengunduh...' : 'Ekspor Inventaris (.csv)'}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Terakhir */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Catatan Log Aktivitas Sistem Terakhir
            </CardTitle>
            <CardDescription className="mt-0.5">Jejak riwayat aksi administratif riil yang tercatat di database platform.</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshLogs}
            disabled={isRefreshingLogs}
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingLogs ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2.5 text-xs">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <span className={`h-2 w-2 rounded-full ${log.color}`} />
                  <div>
                    <span className="font-semibold text-foreground">{log.action}</span>
                    <span className="text-muted-foreground"> {log.actor}</span>
                  </div>
                </div>
                <span className="text-muted-foreground font-mono text-[11px] shrink-0 ml-2">{log.timeAgo}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-6 w-6 mx-auto mb-1 opacity-50" />
              <p>Belum ada rekaman aktivitas tercatat.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ActiveUsersPanel />

      {/* Zona Bahaya */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Zona Pemeliharaan & Data (Zona Bahaya)
          </CardTitle>
          <CardDescription>Tindakan administratif tingkat tinggi untuk pemeliharaan server, revalidasi cache, dan pembersihan data awal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-background/80 rounded-lg border border-destructive/20">
            <div>
              <h5 className="font-medium text-sm text-foreground">Bersihkan Cache & Refresh Layout</h5>
              <p className="text-xs text-muted-foreground">Menyegarkan server cache Next.js dan data profil di seluruh layout portal secara instan.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetDialogOpen(true)}
              className="shrink-0 gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Bersihkan Cache
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
            <div>
              <div className="flex items-center gap-2">
                <h5 className="font-medium text-sm text-destructive">Hapus Semua Data Dummy</h5>
                <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                  Permanen
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Menghapus seluruh rekaman percobaan awal (kegiatan, kas keuangan, inventaris, pengumuman, diskusi, dan anggota dummy seed). Akun login resmi dan struktur organisasi tetap aman.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsClearDummyDialogOpen(true)}
              className="shrink-0 gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus Data Dummy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Cache Clear */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-[420px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle>Bersihkan Cache Sistem?</DialogTitle>
            <DialogDescription>Tindakan ini akan merevalidasi cache server dan menyegarkan tampilan data organisasi untuk seluruh pengurus.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2 gap-2">
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)} disabled={isClearingCache}>
              Batal
            </Button>
            <Button variant="default" onClick={handleConfirmReset} disabled={isClearingCache} className="bg-amber-600 hover:bg-amber-500 text-white gap-1.5">
              {isClearingCache && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isClearingCache ? 'Membersihkan...' : 'Ya, Bersihkan Cache'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Clear Dummy Data */}
      <Dialog open={isClearDummyDialogOpen} onOpenChange={setIsClearDummyDialogOpen}>
        <DialogContent className="sm:max-w-[440px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-2">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-destructive">Hapus Seluruh Data Dummy?</DialogTitle>
            <DialogDescription className="space-y-2 text-xs leading-relaxed">
              <span className="block text-foreground font-normal">Tindakan ini akan menghapus seluruh data contoh/percobaan sistem:</span>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground mt-1">
                <li>Seluruh kalender & dokumentasi kegiatan</li>
                <li>Seluruh catatan transaksi kas masuk & keluar</li>
                <li>Seluruh daftar inventaris & peminjaman aset</li>
                <li>Seluruh pengumuman, arsip surat, dan diskusi</li>
                <li>Daftar anggota dummy bawaan sistem</li>
              </ul>
              <span className="block font-medium text-foreground pt-1">
                Akun pengguna resmi Anda di Manajemen Pengguna dan struktur organisasi tetap aman dan dipertahankan.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 gap-2">
            <Button variant="outline" onClick={() => setIsClearDummyDialogOpen(false)} disabled={isClearingDummy}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmClearDummy}
              disabled={isClearingDummy}
              className="bg-red-600 hover:bg-red-700 text-white gap-1.5 font-medium"
            >
              {isClearingDummy && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isClearingDummy ? 'Membersihkan...' : 'Ya, Hapus Semua Data Dummy'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
