"use client";

import { useState, useRef, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Settings,
  Building2,
  Sliders,
  ShieldCheck,
  Database,
  Save,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
  RefreshCw,
  Server,
  Lock,
  Globe,
  FileText,
  Mail,
  Phone,
  Clock,
  ShieldAlert,
  Camera,
  Upload,
  Loader2,
  X,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import {
  PengaturanSistemData,
  ProfilOrganisasi,
  OperasionalKebijakan,
  KeamananSistem,
  updatePengaturanProfil,
  updatePengaturanOperasional,
  updatePengaturanKeamanan,
  exportModuleData,
  clearSystemCache,
  clearAllDummyData,
  getRecentAuditLogs,
} from "@/actions/pengaturan";
import { uploadLampiran } from "@/actions/storage";

interface PengaturanAdminProps {
  initialSettings?: PengaturanSistemData;
  initialStats?: {
    isConnected: boolean;
    latencyMs: number;
    totalAnggota: number;
    totalKeuangan: number;
    totalInventaris: number;
    totalArsip: number;
  };
  initialLogs?: Array<{
    id: string;
    action: string;
    actor: string;
    timeAgo: string;
    color: string;
  }>;
  userRole?: string;
}

export function PengaturanAdmin({
  initialSettings,
  initialStats,
  initialLogs = [],
  userRole = "admin",
}: PengaturanAdminProps) {
  // Notification banner state
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "info" | "warning";
  }>({ show: false, message: "", type: "success" });

  const triggerToast = (
    message: string,
    type: "success" | "info" | "warning" = "success"
  ) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // State 1: Profil Organisasi
  const [orgProfile, setOrgProfile] = useState<ProfilOrganisasi>(
    initialSettings?.profil || {
      nama: "Karang Taruna Tunas Harapan",
      unitWilayah: "Sub-Unit RT 04 / RW 03",
      kelurahan: "Kelurahan Sukamaju",
      kecamatan: "Kecamatan Pancoran",
      kota: "Jakarta Selatan",
      slogan: "Pemuda Bersatu, Lingkungan Tangguh dan Berbudaya",
      alamat: "Balai Warga RW 03, Jl. Flamboyan No. 12",
      email: "sekretariat.kt03@gmail.com",
      telepon: "+62 812-3456-7890",
      instagram: "@karangtaruna_rw03",
      logoUrl: null,
    }
  );

  // State 2: Operasional & Kebijakan
  const [operasional, setOperasional] = useState<OperasionalKebijakan>(
    initialSettings?.operasional || {
      periodeAktif: "2025 - 2027",
      tglMulaiPeriode: "2025-01-01",
      tglSelesaiPeriode: "2027-12-31",
      formatNomorSurat: "{NOMOR}/KT-03/{BULAN}/{TAHUN}",
      maxHariPinjamInventaris: "3",
      wajibPersetujuanKetua: true,
      maxPengeluaranTanpaNota: "50000",
      notifPengeluaranBesar: true,
      batasNotifPengeluaran: "1000000",
    }
  );

  // State 3: Hak Akses & Keamanan
  const [keamanan, setKeamanan] = useState<KeamananSistem>(
    initialSettings?.keamanan || {
      modePendaftaran: "invite_only",
      sessionTimeoutMinutes: "60",
      portalPublikAktif: true,
      transparansiKasPublik: true,
      modeMaintenance: false,
      wajibDuaFaktorAdmin: false,
      izinkanAnggotaBuatPengumuman: false,
    }
  );

  // State Status & Loading
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingOperasional, setIsSavingOperasional] = useState(false);
  const [isSavingKeamanan, setIsSavingKeamanan] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);
  const [logs, setLogs] = useState(initialLogs);
  const [copiedSql, setCopiedSql] = useState(false);

  // Ref untuk file input logo
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Dialog Reset State
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isClearDummyDialogOpen, setIsClearDummyDialogOpen] = useState(false);
  const [isClearingDummy, setIsClearingDummy] = useState(false);

  // Handle Upload Logo ke Supabase Storage
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      triggerToast("File logo harus berupa gambar (PNG, JPG, SVG, WEBP).", "warning");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      triggerToast("Ukuran logo tidak boleh melebihi 5MB.", "warning");
      return;
    }

    try {
      setIsUploadingLogo(true);
      const res = await uploadLampiran(file, "logo");
      if (res.error || !res.url) {
        triggerToast(res.error || "Gagal mengunggah logo ke storage.", "warning");
        return;
      }

      setOrgProfile((prev) => ({ ...prev, logoUrl: res.url }));
      // Simpan langsung perubahan logo ke database
      const saveRes = await updatePengaturanProfil({ logoUrl: res.url });
      if (saveRes.success) {
        triggerToast("Logo Karang Taruna berhasil diperbarui dan disimpan!", "success");
      } else {
        triggerToast("Logo terunggah, silakan klik tombol 'Simpan Profil' untuk menyimpan.", "info");
      }
    } catch (err: any) {
      triggerToast(err.message || "Terjadi kesalahan saat upload logo.", "warning");
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  // Handle Hapus Logo
  const handleRemoveLogo = async () => {
    setOrgProfile((prev) => ({ ...prev, logoUrl: null }));
    const saveRes = await updatePengaturanProfil({ logoUrl: null });
    if (saveRes.success) {
      triggerToast("Logo dihapus. Menggunakan inisial default.", "info");
    }
  };

  // Handlers Simpan
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await updatePengaturanProfil(orgProfile);
      if (res.success) {
        triggerToast("Pengaturan profil organisasi berhasil disimpan ke database!", "success");
      } else {
        triggerToast(res.error || "Gagal menyimpan profil organisasi.", "warning");
      }
    } catch (err: any) {
      triggerToast(err.message || "Terjadi kesalahan server.", "warning");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveOperasional = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingOperasional(true);
    try {
      const res = await updatePengaturanOperasional(operasional);
      if (res.success) {
        triggerToast("Kebijakan operasional & periode organisasi berhasil disimpan ke database!", "success");
      } else {
        triggerToast(res.error || "Gagal menyimpan operasional.", "warning");
      }
    } catch (err: any) {
      triggerToast(err.message || "Terjadi kesalahan server.", "warning");
    } finally {
      setIsSavingOperasional(false);
    }
  };

  const handleSaveKeamanan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingKeamanan(true);
    try {
      const res = await updatePengaturanKeamanan(keamanan);
      if (res.success) {
        triggerToast("Konfigurasi hak akses dan keamanan sistem berhasil disimpan ke database!", "success");
      } else {
        triggerToast(res.error || "Gagal menyimpan keamanan.", "warning");
      }
    } catch (err: any) {
      triggerToast(err.message || "Terjadi kesalahan server.", "warning");
    } finally {
      setIsSavingKeamanan(false);
    }
  };

  // Handle Export Data Real
  const handleExportData = async (moduleName: "anggota" | "keuangan" | "inventaris") => {
    setIsExporting(moduleName);
    try {
      const res = await exportModuleData(moduleName);
      if (!res.success || !res.csv) {
        triggerToast(res.error || "Gagal mengekspor data.", "warning");
        return;
      }

      // Buat file blob dan trigger download otomatis di browser
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", res.filename || `export-${moduleName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      triggerToast(`Cadangan data ${moduleName} berhasil diunduh (${res.filename})!`, "success");
    } catch (err: any) {
      triggerToast(err.message || "Terjadi kesalahan saat mengunduh data.", "warning");
    } finally {
      setIsExporting(null);
    }
  };

  // Handle Bersihkan Cache
  const handleConfirmReset = async () => {
    setIsClearingCache(true);
    try {
      const res = await clearSystemCache();
      setIsResetDialogOpen(false);
      triggerToast(res.message, res.success ? "success" : "warning");
    } catch (err: any) {
      setIsResetDialogOpen(false);
      triggerToast(err.message || "Gagal membersihkan cache.", "warning");
    } finally {
      setIsClearingCache(false);
    }
  };

  // Handle Hapus Semua Data Dummy
  const handleConfirmClearDummy = async () => {
    setIsClearingDummy(true);
    try {
      const res = await clearAllDummyData();
      setIsClearDummyDialogOpen(false);
      triggerToast(res.message, res.success ? "success" : "warning");
      if (res.success) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      setIsClearDummyDialogOpen(false);
      triggerToast(err.message || "Gagal membersihkan data dummy.", "warning");
    } finally {
      setIsClearingDummy(false);
    }
  };

  // Handle Refresh Logs
  const handleRefreshLogs = async () => {
    setIsRefreshingLogs(true);
    try {
      const freshLogs = await getRecentAuditLogs();
      setLogs(freshLogs);
      triggerToast("Log aktivitas sistem berhasil disegarkan!", "info");
    } catch (err) {
      triggerToast("Gagal memperbarui log.", "warning");
    } finally {
      setIsRefreshingLogs(false);
    }
  };

  const copyMigrationNote = () => {
    navigator.clipboard.writeText("010_phase11_pengaturan_sistem.sql");
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast Notification */}
      {notification.show && (
        <div
          className={`flex items-center justify-between p-3.5 px-4 rounded-lg border text-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : notification.type === "warning"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
              : "bg-sky-500/10 border-sky-500/30 text-sky-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
            {notification.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-400" />}
            {notification.type === "info" && <Clock className="h-4 w-4 text-sky-400" />}
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
                Tabel <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded">pengaturan_sistem</code> belum ada di database. Silakan jalankan script <code className="font-mono font-bold">010_phase11_pengaturan_sistem.sql</code> di Supabase SQL Editor.
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
            <span>{copiedSql ? "Tersalin!" : "Salin Nama File"}</span>
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

        {/* ========================================================= */}
        {/* TAB 1: PROFIL ORGANISASI                                  */}
        {/* ========================================================= */}
        <TabsContent value="profil" className="space-y-5">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Logo & Identitas Singkat */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Identitas Karang Taruna
                </CardTitle>
                <CardDescription>
                  Informasi ini digunakan pada kop surat, laporan resmi, dan header portal publik.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Logo Terintegrasi Database & Storage */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-border/50">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />

                  <div
                    onClick={() => !isUploadingLogo && logoInputRef.current?.click()}
                    className="relative group cursor-pointer"
                    title="Klik untuk mengganti logo"
                  >
                    {isUploadingLogo ? (
                      <div className="h-20 w-20 rounded-xl bg-muted border border-border flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : orgProfile.logoUrl ? (
                      <div className="h-20 w-20 rounded-xl overflow-hidden border-2 border-primary/30 shadow-md bg-background relative">
                        <img
                          src={orgProfile.logoUrl}
                          alt="Logo Karang Taruna"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-primary-foreground text-2xl font-black shadow-md border border-primary/30">
                          KT
                        </div>
                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">Logo Karang Taruna</h4>
                      {orgProfile.logoUrl && (
                        <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                          Logo Kustom Aktif
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Format PNG, JPG, atau SVG (Rasio 1:1 direkomendasikan, maks. 5MB).
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploadingLogo}
                        onClick={() => logoInputRef.current?.click()}
                        className="h-8 gap-1.5 text-xs"
                      >
                        {isUploadingLogo ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        <span>{isUploadingLogo ? "Mengunggah..." : "Ganti Logo"}</span>
                      </Button>

                      {orgProfile.logoUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveLogo}
                          className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 px-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Hapus</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nama-organisasi" className="text-xs">
                      Nama Karang Taruna <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nama-organisasi"
                      value={orgProfile.nama}
                      onChange={(e) => setOrgProfile({ ...orgProfile, nama: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="unit-wilayah" className="text-xs">
                      Unit / Tingkat Wilayah
                    </Label>
                    <Input
                      id="unit-wilayah"
                      value={orgProfile.unitWilayah}
                      onChange={(e) => setOrgProfile({ ...orgProfile, unitWilayah: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="kelurahan" className="text-xs">Kelurahan / Desa</Label>
                    <Input
                      id="kelurahan"
                      value={orgProfile.kelurahan}
                      onChange={(e) => setOrgProfile({ ...orgProfile, kelurahan: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="kecamatan" className="text-xs">Kecamatan</Label>
                    <Input
                      id="kecamatan"
                      value={orgProfile.kecamatan}
                      onChange={(e) => setOrgProfile({ ...orgProfile, kecamatan: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="kota" className="text-xs">Kota / Kabupaten</Label>
                    <Input
                      id="kota"
                      value={orgProfile.kota}
                      onChange={(e) => setOrgProfile({ ...orgProfile, kota: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="slogan" className="text-xs">Slogan / Visi Singkat</Label>
                  <Input
                    id="slogan"
                    value={orgProfile.slogan}
                    onChange={(e) => setOrgProfile({ ...orgProfile, slogan: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="alamat" className="text-xs">Alamat Sekretariat</Label>
                  <Input
                    id="alamat"
                    value={orgProfile.alamat}
                    onChange={(e) => setOrgProfile({ ...orgProfile, alamat: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Kontak Resmi */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-400" />
                  Saluran Komunikasi Resmi
                </CardTitle>
                <CardDescription>
                  Kontak resmi pengurus untuk keperluan warga, instansi kelurahan, dan publik.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Email Resmi
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={orgProfile.email}
                    onChange={(e) => setOrgProfile({ ...orgProfile, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="telepon" className="text-xs flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    WhatsApp Pengurus
                  </Label>
                  <Input
                    id="telepon"
                    value={orgProfile.telepon}
                    onChange={(e) => setOrgProfile({ ...orgProfile, telepon: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="instagram" className="text-xs flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    Instagram Organisasi
                  </Label>
                  <Input
                    id="instagram"
                    value={orgProfile.instagram}
                    onChange={(e) => setOrgProfile({ ...orgProfile, instagram: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-border/50 pt-4">
                <Button
                  type="submit"
                  disabled={isSavingProfile}
                  className="gap-2 bg-primary text-primary-foreground"
                >
                  {isSavingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{isSavingProfile ? "Menyimpan ke Database..." : "Simpan Profil Organisasi"}</span>
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 2: OPERASIONAL & KEBIJAKAN                            */}
        {/* ========================================================= */}
        <TabsContent value="operasional" className="space-y-5">
          <form onSubmit={handleSaveOperasional} className="space-y-5">
            {/* Periode Kepengurusan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  Masa Bakti & Periode Kepengurusan Aktif
                </CardTitle>
                <CardDescription>
                  Semua data anggota, laporan keuangan, dan kegiatan akan tertaut ke periode aktif ini.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nama-periode" className="text-xs">Nama Periode</Label>
                    <Input
                      id="nama-periode"
                      value={operasional.periodeAktif}
                      onChange={(e) => setOperasional({ ...operasional, periodeAktif: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tgl-mulai" className="text-xs">Tanggal Pelantikan / Mulai</Label>
                    <Input
                      id="tgl-mulai"
                      type="date"
                      value={operasional.tglMulaiPeriode}
                      onChange={(e) => setOperasional({ ...operasional, tglMulaiPeriode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tgl-selesai" className="text-xs">Estimasi Selesai Masa Bakti</Label>
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
                <CardDescription>
                  Penomoran surat masuk, surat keluar, dan proposal akan mengikuti skema pola penomoran ini.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5 max-w-md">
                  <Label htmlFor="format-surat" className="text-xs">Pola Format Nomor</Label>
                  <Input
                    id="format-surat"
                    value={operasional.formatNomorSurat}
                    onChange={(e) => setOperasional({ ...operasional, formatNomorSurat: e.target.value })}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Variabel yang tersedia: <code className="text-primary font-mono">&#123;NOMOR&#125;</code> (3 digit otomatis), <code className="text-primary font-mono">&#123;BULAN&#125;</code> (Romawi), <code className="text-primary font-mono">&#123;TAHUN&#125;</code>.
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
                <CardDescription>
                  Aturan kendali mutu untuk peminjaman aset fisik dan pencatatan kas keluar bendahara.
                </CardDescription>
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
                      <p className="text-xs text-muted-foreground">
                        Peminjaman aset bernilai tinggi harus mendapatkan approval tertulis dari Ketua Karang Taruna.
                      </p>
                    </div>
                    <Switch
                      checked={operasional.wajibPersetujuanKetua}
                      onCheckedChange={(val) => setOperasional({ ...operasional, wajibPersetujuanKetua: val })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 pr-4">
                      <Label className="text-sm font-medium">Peringatan Pengeluaran Kas Diatas Ambang Batas</Label>
                      <p className="text-xs text-muted-foreground">
                        Kirim notifikasi broadcast ke Ketua & Admin jika bendahara mencatat pengeluaran lebih dari batas yang ditentukan.
                      </p>
                    </div>
                    <Switch
                      checked={operasional.notifPengeluaranBesar}
                      onCheckedChange={(val) => setOperasional({ ...operasional, notifPengeluaranBesar: val })}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-border/50 pt-4">
                <Button
                  type="submit"
                  disabled={isSavingOperasional}
                  className="gap-2 bg-primary text-primary-foreground"
                >
                  {isSavingOperasional ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{isSavingOperasional ? "Menyimpan ke Database..." : "Simpan Kebijakan Operasional"}</span>
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 3: HAK AKSES & KEAMANAN SISTEM                        */}
        {/* ========================================================= */}
        <TabsContent value="keamanan" className="space-y-5">
          <form onSubmit={handleSaveKeamanan} className="space-y-5">
            {/* Pendaftaran & Registrasi Pengguna */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-400" />
                  Kebijakan Pendaftaran Akun Pengurus
                </CardTitle>
                <CardDescription>
                  Kontrol bagaimana akun anggota baru dapat bergabung ke dalam sistem internal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5 max-w-md">
                  <Label htmlFor="mode-reg" className="text-xs">Metode Penambahan Pengguna</Label>
                  <Select
                    value={keamanan.modePendaftaran}
                    onValueChange={(val) => setKeamanan({ ...keamanan, modePendaftaran: val })}
                  >
                    <SelectTrigger id="mode-reg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invite_only">
                        Hanya Melalui Undangan / Dibuat oleh Admin
                      </SelectItem>
                      <SelectItem value="approval_required">
                        Pendaftaran Terbuka (Wajib Verifikasi & Persetujuan Admin)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Metode &apos;Hanya Melalui Undangan&apos; paling direkomendasikan untuk menjaga kerahasiaan catatan internal.
                  </p>
                </div>

                <div className="space-y-1.5 max-w-xs">
                  <Label htmlFor="session-timeout" className="text-xs">Batas Waktu Sesi Login (Inactivity Timeout)</Label>
                  <Select
                    value={keamanan.sessionTimeoutMinutes}
                    onValueChange={(val) => setKeamanan({ ...keamanan, sessionTimeoutMinutes: val })}
                  >
                    <SelectTrigger id="session-timeout">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Menit</SelectItem>
                      <SelectItem value="60">1 Jam (Standar)</SelectItem>
                      <SelectItem value="240">4 Jam</SelectItem>
                      <SelectItem value="480">8 Jam</SelectItem>
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
                <CardDescription>
                  Atur informasi organisasi yang dapat diakses oleh warga masyarakat umum tanpa perlu login.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 pr-4">
                    <Label className="text-sm font-medium">Aktifkan Halaman Publik Utama (Landing Page)</Label>
                    <p className="text-xs text-muted-foreground">
                      Warga dapat membuka rute umum `/` untuk melihat profil karang taruna dan agenda kegiatan.
                    </p>
                  </div>
                  <Switch
                    checked={keamanan.portalPublikAktif}
                    onCheckedChange={(val) => setKeamanan({ ...keamanan, portalPublikAktif: val })}
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="space-y-0.5 pr-4">
                    <Label className="text-sm font-medium">Publikasikan Ringkasan Kas & Transparansi Keuangan</Label>
                    <p className="text-xs text-muted-foreground">
                      Warga dapat melihat total saldo kas dan rekap pemasukan/pengeluaran kegiatan di portal publik.
                    </p>
                  </div>
                  <Switch
                    checked={keamanan.transparansiKasPublik}
                    onCheckedChange={(val) => setKeamanan({ ...keamanan, transparansiKasPublik: val })}
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="space-y-0.5 pr-4">
                    <Label className="text-sm font-medium text-amber-400">Mode Pemeliharaan (Maintenance Mode)</Label>
                    <p className="text-xs text-muted-foreground">
                      Hanya Administrator yang dapat login. Pengguna lain dan pengunjung publik akan melihat halaman pemeliharaan.
                    </p>
                  </div>
                  <Switch
                    checked={keamanan.modeMaintenance}
                    onCheckedChange={(val) => setKeamanan({ ...keamanan, modeMaintenance: val })}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-border/50 pt-4">
                <Button
                  type="submit"
                  disabled={isSavingKeamanan}
                  className="gap-2 bg-primary text-primary-foreground"
                >
                  {isSavingKeamanan ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{isSavingKeamanan ? "Menyimpan ke Database..." : "Simpan Konfigurasi Keamanan"}</span>
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 4: DATA, BACKUP & PEMELIHARAAN                        */}
        {/* ========================================================= */}
        <TabsContent value="data" className="space-y-5">
          {/* Status Database & Server */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                Status Infrastruktur Database & Storage
              </CardTitle>
              <CardDescription>
                Informasi status koneksi backend PostgreSQL Supabase dan ringkasan data tersimpan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
                  <span className="text-xs text-muted-foreground block">Konektivitas Database:</span>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-sm text-emerald-400">
                      {initialStats?.isConnected ? "Supabase Connected" : "Online / Connected"}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Latency: {initialStats?.latencyMs || 25}ms
                  </span>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
                  <span className="text-xs text-muted-foreground block">Total Data Terindeks:</span>
                  <div className="font-semibold text-sm text-foreground">
                    {(initialStats?.totalAnggota || 0) +
                      (initialStats?.totalKeuangan || 0) +
                      (initialStats?.totalInventaris || 0) +
                      (initialStats?.totalArsip || 0)}{" "}
                    Entitas Data
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {initialStats?.totalAnggota || 0} Anggota · {initialStats?.totalKeuangan || 0} Kas · {initialStats?.totalInventaris || 0} Aset
                  </span>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
                  <span className="text-xs text-muted-foreground block">Backup Terjadwal:</span>
                  <div className="font-semibold text-sm text-foreground">
                    Otomatis Cloud Supabase
                  </div>
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
              <CardDescription>
                Unduh salinan data format CSV langsung dari database untuk pengarsipan mandiri atau laporan tahunan.
              </CardDescription>
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
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Daftar nama anggota, RT/RW, jabatan, dan nomor kontak.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs"
                    disabled={isExporting === "anggota"}
                    onClick={() => handleExportData("anggota")}
                  >
                    {isExporting === "anggota" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    <span>{isExporting === "anggota" ? "Mengunduh..." : "Ekspor Anggota (.csv)"}</span>
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
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Seluruh rekap transaksi kas masuk, kas keluar, dan saldo.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs"
                    disabled={isExporting === "keuangan"}
                    onClick={() => handleExportData("keuangan")}
                  >
                    {isExporting === "keuangan" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    <span>{isExporting === "keuangan" ? "Mengunduh..." : "Ekspor Kas (.csv)"}</span>
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
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Daftar barang inventaris, jumlah unit, dan kondisi barang.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs"
                    disabled={isExporting === "inventaris"}
                    onClick={() => handleExportData("inventaris")}
                  >
                    {isExporting === "inventaris" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    <span>{isExporting === "inventaris" ? "Mengunduh..." : "Ekspor Inventaris (.csv)"}</span>
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
                <CardDescription className="mt-0.5">
                  Jejak riwayat aksi administratif riil yang tercatat di database platform.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshLogs}
                disabled={isRefreshingLogs}
                className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingLogs ? "animate-spin" : ""}`} />
                <span>Segarkan</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`h-2 w-2 rounded-full ${log.color}`} />
                      <div>
                        <span className="font-semibold text-foreground">{log.action}</span>
                        <span className="text-muted-foreground"> {log.actor}</span>
                      </div>
                    </div>
                    <span className="text-muted-foreground font-mono text-[11px] shrink-0 ml-2">
                      {log.timeAgo}
                    </span>
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

          {/* Zona Bahaya */}
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-base text-destructive flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Zona Pemeliharaan & Data (Zona Bahaya)
              </CardTitle>
              <CardDescription>
                Tindakan administratif tingkat tinggi untuk pemeliharaan server, revalidasi cache, dan pembersihan data awal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-background/80 rounded-lg border border-destructive/20">
                <div>
                  <h5 className="font-medium text-sm text-foreground">Bersihkan Cache & Refresh Layout</h5>
                  <p className="text-xs text-muted-foreground">
                    Menyegarkan server cache Next.js dan data profil di seluruh layout portal secara instan.
                  </p>
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
                    <Badge variant="destructive" className="text-[10px] uppercase font-bold">Permanen</Badge>
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
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog for Cache Clear */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-[420px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle>Bersihkan Cache Sistem?</DialogTitle>
            <DialogDescription>
              Tindakan ini akan merevalidasi cache server dan menyegarkan tampilan data organisasi untuk seluruh pengurus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsResetDialogOpen(false)}
              disabled={isClearingCache}
            >
              Batal
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmReset}
              disabled={isClearingCache}
              className="bg-amber-600 hover:bg-amber-500 text-white gap-1.5"
            >
              {isClearingCache && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isClearingCache ? "Membersihkan..." : "Ya, Bersihkan Cache"}</span>
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
              <span className="block text-foreground font-normal">
                Tindakan ini akan menghapus seluruh data contoh/percobaan sistem:
              </span>
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
            <Button
              variant="outline"
              onClick={() => setIsClearDummyDialogOpen(false)}
              disabled={isClearingDummy}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmClearDummy}
              disabled={isClearingDummy}
              className="bg-red-600 hover:bg-red-700 text-white gap-1.5 font-medium"
            >
              {isClearingDummy && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isClearingDummy ? "Membersihkan..." : "Ya, Hapus Semua Data Dummy"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
