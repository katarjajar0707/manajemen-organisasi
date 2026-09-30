'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Sliders,
  ShieldCheck,
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import {
  PengaturanSistemData,
  ProfilOrganisasi,
  OperasionalKebijakan,
  KeamananSistem,
} from '@/actions/pengaturan';
import {
  DEFAULT_PROFIL_ORGANISASI,
  DEFAULT_OPERASIONAL,
  DEFAULT_KEAMANAN,
} from '@/constants/pengaturan';
import { PengaturanProfilTab } from './tabs/pengaturan-profil-tab';
import { PengaturanOperasionalTab } from './tabs/pengaturan-operasional-tab';
import { PengaturanKeamananTab } from './tabs/pengaturan-keamanan-tab';
import { PengaturanDataTab, AuditLogItem, PengaturanStats } from './tabs/pengaturan-data-tab';

interface PengaturanAdminProps {
  initialSettings?: PengaturanSistemData;
  initialStats?: PengaturanStats;
  initialLogs?: AuditLogItem[];
  userRole?: string;
}

export function PengaturanAdmin({
  initialSettings,
  initialStats,
  initialLogs = [],
}: PengaturanAdminProps) {
  // Notification banner state
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'info' | 'warning';
  }>({ show: false, message: '', type: 'success' });

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // State 1: Profil Organisasi
  const [orgProfile, setOrgProfile] = useState<ProfilOrganisasi>(
    initialSettings?.profil || DEFAULT_PROFIL_ORGANISASI
  );

  // State 2: Operasional & Kebijakan
  const [operasional, setOperasional] = useState<OperasionalKebijakan>(
    initialSettings?.operasional || DEFAULT_OPERASIONAL
  );

  // State 3: Hak Akses & Keamanan
  const [keamanan, setKeamanan] = useState<KeamananSistem>(
    initialSettings?.keamanan || DEFAULT_KEAMANAN
  );

  const [copiedSql, setCopiedSql] = useState(false);

  const copyMigrationNote = () => {
    navigator.clipboard.writeText('010_phase11_pengaturan_sistem.sql');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast Notification */}
      {notification.show && (
        <div
          className={`flex items-center justify-between p-3.5 px-4 rounded-lg border text-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : notification.type === 'warning'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-sky-500/10 border-sky-500/30 text-sky-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
            {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
            {notification.type === 'info' && <Clock className="h-4 w-4 text-sky-400" />}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification((prev) => ({ ...prev, show: false }))}
            className="text-muted-foreground hover:text-foreground text-xs ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Migration Notice if Table Not Yet Created */}
      {initialSettings?.tableExists === false && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold text-amber-300">Pemberitahuan Tabel Database:</span>
              <p className="text-amber-200/90 text-[11px] mt-0.5">
                Tabel <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded">pengaturan_sistem</code> belum ada di database. Silakan jalankan script{' '}
                <code className="font-mono font-bold">010_phase11_pengaturan_sistem.sql</code> di Supabase SQL Editor.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={copyMigrationNote}
            className="h-7 text-xs gap-1.5 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 shrink-0"
          >
            {copiedSql ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span>{copiedSql ? 'Tersalin!' : 'Salin Nama File'}</span>
          </Button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Pengaturan Sistem</h1>
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10 text-xs font-semibold gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Khusus Administrator & Ketua
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Kelola konfigurasi profil organisasi, parameter operasional, kebijakan akses, dan data backup platform.
          </p>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="profil" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 bg-muted/60 p-1 rounded-lg h-auto gap-1">
          <TabsTrigger value="profil" className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm py-2 px-1 sm:px-3">
            <Building2 className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary shrink-0" />
            <span className="truncate">Profil Organisasi</span>
          </TabsTrigger>
          <TabsTrigger value="operasional" className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm py-2 px-1 sm:px-3">
            <Sliders className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-emerald-400 shrink-0" />
            <span className="truncate">Operasional</span>
          </TabsTrigger>
          <TabsTrigger value="keamanan" className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm py-2 px-1 sm:px-3">
            <ShieldCheck className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-amber-400 shrink-0" />
            <span className="truncate">Akses & Keamanan</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm py-2 px-1 sm:px-3">
            <Database className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-sky-400 shrink-0" />
            <span className="truncate">Data & Backup</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PROFIL ORGANISASI */}
        <TabsContent value="profil" className="space-y-5">
          <PengaturanProfilTab
            orgProfile={orgProfile}
            setOrgProfile={setOrgProfile}
            onToast={triggerToast}
          />
        </TabsContent>

        {/* TAB 2: OPERASIONAL & KEBIJAKAN */}
        <TabsContent value="operasional" className="space-y-5">
          <PengaturanOperasionalTab
            operasional={operasional}
            setOperasional={setOperasional}
            onToast={triggerToast}
          />
        </TabsContent>

        {/* TAB 3: HAK AKSES & KEAMANAN SISTEM */}
        <TabsContent value="keamanan" className="space-y-5">
          <PengaturanKeamananTab
            keamanan={keamanan}
            setKeamanan={setKeamanan}
            onToast={triggerToast}
          />
        </TabsContent>

        {/* TAB 4: DATA, BACKUP & PEMELIHARAAN */}
        <TabsContent value="data" className="space-y-5">
          <PengaturanDataTab
            initialStats={initialStats}
            initialLogs={initialLogs}
            onToast={triggerToast}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
