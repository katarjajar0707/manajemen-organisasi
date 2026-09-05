"use client";

import { useState } from "react";
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
} from "lucide-react";

export function PengaturanAdmin() {
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
    }, 3500);
  };

  // State 1: Profil Organisasi
  const [orgProfile, setOrgProfile] = useState({
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
  });

  // State 2: Operasional & Kebijakan
  const [operasional, setOperasional] = useState({
    periodeAktif: "2025 - 2027",
    tglMulaiPeriode: "2025-01-01",
    tglSelesaiPeriode: "2027-12-31",
    formatNomorSurat: "{NOMOR}/KT-03/{BULAN}/{TAHUN}",
    maxHariPinjamInventaris: "3",
    wajibPersetujuanKetua: true,
    maxPengeluaranTanpaNota: "50000",
    notifPengeluaranBesar: true,
    batasNotifPengeluaran: "1000000",
  });

  // State 3: Hak Akses & Keamanan
  const [keamanan, setKeamanan] = useState({
    modePendaftaran: "invite_only", // 'invite_only' | 'approval_required'
    portalPublikAktif: true,
    transparansiKasPublik: true,
    modeMaintenance: false,
    sessionTimeoutMinutes: "60",
    wajibDuaFaktorAdmin: false,
    izinkanAnggotaBuatPengumuman: false,
  });

  // Dialog Reset State
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Handlers
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast("Pengaturan profil organisasi berhasil disimpan!", "success");
  };

  const handleSaveOperasional = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast("Kebijakan operasional dan periode organisasi diperbarui!", "success");
  };

  const handleSaveKeamanan = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast("Konfigurasi hak akses dan keamanan sistem telah diperbarui!", "success");
  };

  const handleExportData = (moduleName: string) => {
    setIsExporting(moduleName);
    setTimeout(() => {
      setIsExporting(null);
      triggerToast(`Cadangan data ${moduleName} berhasil diekspor (JSON/CSV)!`, "info");
    }, 1200);
  };

  const handleConfirmReset = () => {
    setIsResetDialogOpen(false);
    triggerToast("Cache sistem dan konfigurasi sementara berhasil dibersihkan.", "warning");
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

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Pengaturan Sistem</h1>
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10 text-xs font-semibold gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Khusus Administrator
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Kelola konfigurasi umum organisasi, parameter operasional, hak akses, dan manajemen data platform.
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-border/50">
                  <div className="relative group">
                    <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-primary-foreground text-2xl font-black shadow-md border border-primary/30">
                      KT
                    </div>
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Logo Karang Taruna</h4>
                    <p className="text-xs text-muted-foreground">
                      Format disarankan PNG atau SVG dengan rasio 1:1, resolusi minimal 200x200px.
                    </p>
                    <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs mt-1">
                      <Upload className="h-3.5 w-3.5" />
                      Ganti Logo
                    </Button>
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
                <Button type="submit" className="gap-2 bg-primary text-primary-foreground">
                  <Save className="h-4 w-4" />
                  Simpan Profil Organisasi
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
                        Kirim notifikasi broadcast ke Ketua & Admin jika bendahara mencatat pengeluaran lebih dari Rp 1.000.000.
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
                <Button type="submit" className="gap-2 bg-primary text-primary-foreground">
                  <Save className="h-4 w-4" />
                  Simpan Kebijakan Operasional
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
                      Hanya Administrator yang dapat login. Pengguna lain dan pengunjung publik akan melihat halaman under-construction.
                    </p>
                  </div>
                  <Switch
                    checked={keamanan.modeMaintenance}
                    onCheckedChange={(val) => setKeamanan({ ...keamanan, modeMaintenance: val })}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-border/50 pt-4">
                <Button type="submit" className="gap-2 bg-primary text-primary-foreground">
                  <Save className="h-4 w-4" />
                  Simpan Konfigurasi Keamanan
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
                Informasi status koneksi backend PostgreSQL Supabase dan media file storage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
                  <span className="text-xs text-muted-foreground block">Konektivitas Database:</span>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-sm text-emerald-400">Supabase Connected</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Latency: 38ms</span>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
                  <span className="text-xs text-muted-foreground block">Kapasitas Storage Lampiran:</span>
                  <div className="font-semibold text-sm text-foreground">
                    14.2 MB / 1.0 GB
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
                    <div className="bg-primary h-1.5 rounded-full w-[2%]" />
                  </div>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
                  <span className="text-xs text-muted-foreground block">Backup Terakhir:</span>
                  <div className="font-semibold text-sm text-foreground">
                    Hari ini, 03:00 WIB
                  </div>
                  <span className="text-[11px] text-emerald-400">Otomatis Terjadwal (Harian)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ekspor Cadangan Data Organisasi */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4 text-sky-400" />
                Ekspor Cadangan Data Organisasi (Backup)
              </CardTitle>
              <CardDescription>
                Unduh salinan data format Excel/JSON untuk pengarsipan mandiri atau laporan tahunan pengurus.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 border rounded-lg flex flex-col justify-between gap-3 bg-card/60">
                  <div>
                    <h5 className="font-medium text-sm">Data Keanggotaan</h5>
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
                    <Download className="h-3.5 w-3.5" />
                    {isExporting === "anggota" ? "Mengekspor..." : "Ekspor Anggota (.csv)"}
                  </Button>
                </div>

                <div className="p-3.5 border rounded-lg flex flex-col justify-between gap-3 bg-card/60">
                  <div>
                    <h5 className="font-medium text-sm">Buku Kas & Keuangan</h5>
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
                    <Download className="h-3.5 w-3.5" />
                    {isExporting === "keuangan" ? "Mengekspor..." : "Ekspor Kas (.xlsx)"}
                  </Button>
                </div>

                <div className="p-3.5 border rounded-lg flex flex-col justify-between gap-3 bg-card/60">
                  <div>
                    <h5 className="font-medium text-sm">Aset & Inventaris</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Daftar barang inventaris, jumlah unit, dan riwayat pinjam.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs"
                    disabled={isExporting === "inventaris"}
                    onClick={() => handleExportData("inventaris")}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {isExporting === "inventaris" ? "Mengekspor..." : "Ekspor Inventaris (.csv)"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log Terakhir */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Catatan Log Aktivitas Admin Terakhir
              </CardTitle>
              <CardDescription>
                Jejak riwayat aksi administratif penting yang dilakukan di platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <span className="font-semibold text-foreground">Pembaruan Inventaris Barang</span>
                    <span className="text-muted-foreground"> oleh Azzam Azhari (Admin)</span>
                  </div>
                </div>
                <span className="text-muted-foreground font-mono text-[11px]">10 menit lalu</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <div>
                    <span className="font-semibold text-foreground">Persetujuan Transaksi Kas Masuk (Iuran Bulanan)</span>
                    <span className="text-muted-foreground"> oleh Bendahara 1</span>
                  </div>
                </div>
                <span className="text-muted-foreground font-mono text-[11px]">1 jam lalu</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  <div>
                    <span className="font-semibold text-foreground">Pembuatan Template Surat Undangan Kerja Bakti</span>
                    <span className="text-muted-foreground"> oleh Sekretaris</span>
                  </div>
                </div>
                <span className="text-muted-foreground font-mono text-[11px]">Kemarin, 19:40 WIB</span>
              </div>
            </CardContent>
          </Card>

          {/* Zona Bahaya */}
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-base text-destructive flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Zona Bahaya & Pemeliharaan Kritis
              </CardTitle>
              <CardDescription>
                Tindakan di bawah ini berdampak langsung pada data sementara sistem. Lakukan dengan hati-hati.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-background/80 rounded-lg border border-destructive/20">
                <div>
                  <h5 className="font-medium text-sm text-foreground">Bersihkan Cache & Sesi Sementara</h5>
                  <p className="text-xs text-muted-foreground">
                    Menghapus sesi tidak aktif, refresh cache token, dan mengoptimalkan performa loading aplikasi.
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog for Danger Action */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-[420px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle>Bersihkan Cache Sistem?</DialogTitle>
            <DialogDescription>
              Tindakan ini akan mengosongkan cache aplikasi sementara di browser dan server. Sesi login pengguna lain mungkin perlu dimuat ulang.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsResetDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmReset}
              className="bg-amber-600 hover:bg-amber-500 text-white gap-1.5"
            >
              Ya, Bersihkan Cache
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
