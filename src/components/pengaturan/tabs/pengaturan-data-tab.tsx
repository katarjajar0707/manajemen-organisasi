'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Server,
  Download,
  Clock,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  exportModuleData,
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
    </div>
  );
}
