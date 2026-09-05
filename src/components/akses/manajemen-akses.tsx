"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  KeyRound,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Lock,
  Users,
  Building2,
  Wallet,
  Calendar,
  Megaphone,
  MessagesSquare,
  Package,
  FileText,
  Archive,
  Sliders,
  Check,
  Eye,
  Info,
  Layers,
  LayoutGrid,
  X,
} from "lucide-react";

// Tipe Definisi Role
export type KatarRole =
  | "admin"
  | "ketua"
  | "sekretaris"
  | "bendahara"
  | "koordinator"
  | "anggota";

export interface RoleInfo {
  id: KatarRole;
  name: string;
  badge: string;
  deskripsi: string;
  userCount: number;
  color: string;
}

export const ROLES_LIST: RoleInfo[] = [
  {
    id: "admin",
    name: "Administrator",
    badge: "Superuser",
    deskripsi: "Akses penuh ke seluruh sistem, basis data, dan konfigurasi.",
    userCount: 2,
    color: "text-primary border-primary/30 bg-primary/10",
  },
  {
    id: "ketua",
    name: "Ketua & Wakil",
    badge: "Pimpinan",
    deskripsi: "Persetujuan kegiatan, evaluasi kas, inventaris, dan surat.",
    userCount: 2,
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    id: "sekretaris",
    name: "Sekretaris",
    badge: "Administrasi",
    deskripsi: "Kelola template surat, arsip dokumen, notulen, dan kegiatan.",
    userCount: 2,
    color: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  },
  {
    id: "bendahara",
    name: "Bendahara",
    badge: "Keuangan",
    deskripsi: "Kelola pencatatan kas masuk, kas keluar, dan laporan saldo.",
    userCount: 2,
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    id: "koordinator",
    name: "Koordinator Seksi",
    badge: "Divisi / Bagian",
    deskripsi: "Kelola kegiatan seksi, inventaris seksi, dan catatan bagian.",
    userCount: 5,
    color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  },
  {
    id: "anggota",
    name: "Anggota Aktif",
    badge: "Umum",
    deskripsi: "Lihat agenda, papan diskusi, voting, dan pengumuman.",
    userCount: 38,
    color: "text-zinc-400 border-zinc-700 bg-zinc-800/30",
  },
];

function AccessToggle({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={checked ? "Nonaktifkan akses" : "Aktifkan akses"}
        className="h-5 w-9 data-[state=checked]:bg-emerald-500"
      />
      <Badge
        variant={checked ? "default" : "secondary"}
        className={`min-w-10 justify-center px-1.5 py-0 text-[10px] font-mono ${
          checked
            ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {checked ? "ON" : "OFF"}
      </Badge>
    </div>
  );
}

export interface ModulePermission {
  id: string;
  nama: string;
  kategori: "Utama" | "Organisasi" | "Administrasi";
  path: string;
  iconName: string;
  deskripsi: string;
  // Akses per role: true = ON (boleh), false = OFF (dilarang)
  access: Record<KatarRole, boolean>;
}

// Data Default Hak Akses
const INITIAL_PERMISSIONS: ModulePermission[] = [
  {
    id: "dashboard",
    nama: "Dashboard Internal",
    kategori: "Utama",
    path: "/dashboard",
    iconName: "LayoutDashboard",
    deskripsi: "Ringkasan metrik statistik, pengumuman terbaru, dan jadwal kegiatan terdekat.",
    access: {
      admin: true,
      ketua: true,
      sekretaris: true,
      bendahara: true,
      koordinator: true,
      anggota: true,
    },
  },
  {
    id: "keuangan",
    nama: "Catatan Kas & Keuangan",
    kategori: "Organisasi",
    path: "/bagian/bendahara",
    iconName: "Wallet",
    deskripsi: "Buku kas masuk, kas keluar, upload nota/bukti transaksi, dan rekap saldo.",
    access: {
      admin: true,
      ketua: true,
      sekretaris: false,
      bendahara: true,
      koordinator: false,
      anggota: false,
    },
  },
  {
    id: "anggota",
    nama: "Database Anggota",
    kategori: "Organisasi",
    path: "/anggota",
    iconName: "Users",
    deskripsi: "Daftar pengurus dan anggota karang taruna, kontak telepon, dan alamat RT/RW.",
    access: {
      admin: true,
      ketua: true,
      sekretaris: true,
      bendahara: true,
      koordinator: true,
      anggota: true,
    },
  },
  {
    id: "struktur",
    nama: "Struktur & Bagan Organisasi",
    kategori: "Organisasi",
    path: "/struktur",
    iconName: "FolderKanban",
    deskripsi: "Bagan susunan kepengurusan per periode dan kepengurusan agenda khusus.",
    access: {
      admin: true,
      ketua: true,
      sekretaris: true,
      bendahara: true,
      koordinator: true,
      anggota: true,
    },
  },
  {
    id: "kegiatan",
    nama: "Kalender Kegiatan & Dokumentasi",
    kategori: "Organisasi",
    path: "/kegiatan",
    iconName: "Calendar",
    deskripsi: "Jadwal program kerja, rapat panitia, dan galeri dokumentasi foto kegiatan.",
    access: {
      admin: true,
      ketua: true,
      sekretaris: true,
      bendahara: true,
      koordinator: true,
      anggota: true,
    },
  },
  {
    id: "pengumuman",
    nama: "Broadcast Pengumuman",
    kategori: "Organisasi",
    path: "/pengumuman",
    iconName: "Megaphone",
    deskripsi: "Pemberitahuan resmi pengurus yang disiarkan ke seluruh anggota atau bagian.",
    access: {
      admin: true,
      ketua: true,
      sekretaris: true,
      bendahara: false,
      koordinator: false,
      anggota: false,
    },
  },
  {
    id: "diskusi",
    nama: "Papan Diskusi & Usulan",
    kategori: "Organisasi",
    path: "/diskusi",
    iconName: "MessagesSquare",
    deskripsi: "Ruang tukar pikiran, urun rembuk usulan program, dan voting gagasan.",
    access: {
      admin: true,
      ketua: true,
      sekretaris: true,
      bendahara: true,
      koordinator: true,
      anggota: true,
    },
  },
  {
    id: "inventaris",
    nama: "Inventaris & Pinjam Aset",
    kategori: "Organisasi",
    path: "/inventaris",
    iconName: "Package",
    deskripsi: "Pencatatan aset fisik organisasi, kontrol kondisi, dan form sirkulasi pinjam-pakai.",
    access: {
      admin: true,
      ketua: true,
      sekretaris: true,
      bendahara: false,
      koordinator: true,
      anggota: false,
    },
  },
  {
    id: "surat",
    nama: "Template Surat & Administrasi",
    kategori: "Administrasi",
    path: "/surat",
    iconName: "FileText",
    deskripsi: "Pembuatan surat undangan, permohonan izin balai, dan template proposal kegiatan.",
    access: {
      admin: true,
      ketua: true,
      sekretaris: true,
      bendahara: false,
      koordinator: false,
      anggota: false,
    },
  },
  {
    id: "arsip",
    nama: "Arsip Dokumen SK & LPJ",
    kategori: "Administrasi",
    path: "/arsip",
    iconName: "Archive",
    deskripsi: "Penyimpanan berkas SK kepengurusan, LPJ kegiatan, dan dokumen legalitas.",
    access: {
      admin: true,
      ketua: true,
      sekretaris: true,
      bendahara: true,
      koordinator: false,
      anggota: false,
    },
  },
  {
    id: "bagian",
    nama: "Kelola Bagian & Seksi",
    kategori: "Administrasi",
    path: "/bagian",
    iconName: "Building2",
    deskripsi: "Pengaturan daftar divisi organisasi, slug URL, dan deskripsi tugas pokok seksi.",
    access: {
      admin: true,
      ketua: true,
      sekretaris: false,
      bendahara: false,
      koordinator: false,
      anggota: false,
    },
  },
  {
    id: "pengguna",
    nama: "Manajemen Pengguna & Akun",
    kategori: "Administrasi",
    path: "/pengguna",
    iconName: "ShieldCheck",
    deskripsi: "Pemberian akun login pengurus, ubah peranan (role), dan reset password.",
    access: {
      admin: true,
      ketua: false,
      sekretaris: false,
      bendahara: false,
      koordinator: false,
      anggota: false,
    },
  },
  {
    id: "akses",
    nama: "Manajemen Hak Akses",
    kategori: "Administrasi",
    path: "/akses",
    iconName: "KeyRound",
    deskripsi: "Kontrol matriks perizinan On/Off tiap menu dan modul aplikasi.",
    access: {
      admin: true,
      ketua: false,
      sekretaris: false,
      bendahara: false,
      koordinator: false,
      anggota: false,
    },
  },
  {
    id: "pengaturan",
    nama: "Pengaturan Sistem & Backup",
    kategori: "Administrasi",
    path: "/pengaturan",
    iconName: "Sliders",
    deskripsi: "Konfigurasi profil organisasi, kebijakan operasional, dan cadangan basis data.",
    access: {
      admin: true,
      ketua: false,
      sekretaris: false,
      bendahara: false,
      koordinator: false,
      anggota: false,
    },
  },
];

export function ManajemenAkses() {
  const [permissions, setPermissions] = useState<ModulePermission[]>(INITIAL_PERMISSIONS);
  const [initialSnapshot, setInitialSnapshot] = useState<ModulePermission[]>(INITIAL_PERMISSIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategori, setSelectedKategori] = useState<string>("all");
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<KatarRole>("ketua");

  // Notification Toast
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

  // Dialog State
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);

  // Cek apakah ada perubahan belum disimpan
  const hasChanges = useMemo(() => {
    return JSON.stringify(permissions) !== JSON.stringify(initialSnapshot);
  }, [permissions, initialSnapshot]);

  // Hitung jumlah perubahan
  const changeCount = useMemo(() => {
    let count = 0;
    permissions.forEach((perm, idx) => {
      const snap = initialSnapshot[idx];
      if (!snap) return;
      (Object.keys(perm.access) as KatarRole[]).forEach((r) => {
        if (perm.access[r] !== snap.access[r]) count++;
      });
    });
    return count;
  }, [permissions, initialSnapshot]);

  // Filter Modul
  const filteredPermissions = useMemo(() => {
    return permissions.filter((perm) => {
      const matchSearch =
        perm.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perm.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perm.path.toLowerCase().includes(searchQuery.toLowerCase());
      const matchKategori =
        selectedKategori === "all" || perm.kategori === selectedKategori;
      return matchSearch && matchKategori;
    });
  }, [permissions, searchQuery, selectedKategori]);

  // Handler toggle switch On/Off
  const handleToggleAccess = (moduleId: string, role: KatarRole) => {
    // Admin selalu terkunci ON untuk mencegah lockout sistem
    if (role === "admin") {
      triggerToast("Hak akses Administrator terkunci (selalu aktif) untuk mencegah penguncian sistem.", "warning");
      return;
    }

    setPermissions((prev) =>
      prev.map((perm) => {
        if (perm.id === moduleId) {
          return {
            ...perm,
            access: {
              ...perm.access,
              [role]: !perm.access[role],
            },
          };
        }
        return perm;
      })
    );
  };

  // Toggle semua menu untuk role tertentu (On All / Off All)
  const handleToggleAllForRole = (role: KatarRole, state: boolean) => {
    if (role === "admin") return;
    setPermissions((prev) =>
      prev.map((perm) => ({
        ...perm,
        access: {
          ...perm.access,
          [role]: state,
        },
      }))
    );
    triggerToast(
      `Semua modul untuk peran ${role.toUpperCase()} telah diubah menjadi ${state ? "AKTIF (ON)" : "NONAKTIF (OFF)"}.`,
      "info"
    );
  };

  // Simpan perubahan
  const handleSaveAll = () => {
    setInitialSnapshot(permissions);
    setIsSaveConfirmOpen(false);
    triggerToast("Hak akses dan izin menu berhasil diperbarui dan diterapkan ke seluruh pengguna!", "success");
  };

  // Reset perubahan ke snapshot terakhir
  const handleCancelChanges = () => {
    setPermissions(initialSnapshot);
    triggerToast("Perubahan yang belum disimpan telah dibatalkan.", "info");
  };

  // Reset ke Standar Bawaan Karang Taruna
  const handleConfirmResetDefaults = () => {
    setPermissions(INITIAL_PERMISSIONS);
    setInitialSnapshot(INITIAL_PERMISSIONS);
    setIsResetDialogOpen(false);
    triggerToast("Hak akses telah dikembalikan ke konfigurasi standar organisasi.", "success");
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Toast Notification Banner */}
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
            {notification.type === "info" && <Info className="h-4 w-4 text-sky-400" />}
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

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Manajemen Hak Akses (RBAC)</h1>
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10 text-xs font-semibold gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Khusus Administrator
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Atur visibilitas halaman dan izin operasional menu untuk setiap peran pengguna (Ketua, Sekretaris, Bendahara, Koordinator, dan Anggota).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetDialogOpen(true)}
            className="gap-1.5 h-8 text-xs flex-1 sm:flex-initial"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Standar</span>
          </Button>
          {hasChanges && (
            <Button
              size="sm"
              onClick={() => setIsSaveConfirmOpen(true)}
              className="gap-1.5 h-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm text-xs font-semibold flex-1 sm:flex-initial"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Simpan ({changeCount})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Floating Unsaved Changes Alert */}
      {hasChanges && (
        <div className="p-3 px-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              Ada <strong>{changeCount}</strong> pengaturan hak akses yang telah Anda ubah dan belum disimpan ke sistem.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelChanges}
              className="h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-transparent"
            >
              Batalkan
            </Button>
            <Button
              size="sm"
              onClick={() => setIsSaveConfirmOpen(true)}
              className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
            >
              <Save className="h-3 w-3" />
              Simpan Sekarang
            </Button>
          </div>
        </div>
      )}

      {/* Role Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ROLES_LIST.map((role) => {
          const isCurrentSelected = selectedRoleDetail === role.id;
          return (
            <div
              key={role.id}
              onClick={() => setSelectedRoleDetail(role.id)}
              className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 ${
                isCurrentSelected
                  ? "bg-card border-primary ring-1 ring-primary/40 shadow-sm"
                  : "bg-card/40 border-border/70 hover:border-border hover:bg-card/70"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold text-xs text-foreground truncate">{role.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${role.color}`}>
                  {role.badge}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">{role.deskripsi}</p>
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/40 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {role.userCount} User
                </span>
                {role.id === "admin" ? (
                  <span className="text-primary font-medium flex items-center gap-0.5">
                    <Lock className="h-2.5 w-2.5" /> Penuh
                  </span>
                ) : (
                  <span className="text-foreground/70 font-mono">
                    {permissions.filter((p) => p.access[role.id]).length}/{permissions.length} On
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs Tampilan: Matriks Lengkap vs Fokus Per Role */}
      <Tabs defaultValue="matriks" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList className="bg-muted/60 p-1 rounded-lg">
            <TabsTrigger value="matriks" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <LayoutGrid className="h-4 w-4" />
              <span>Tabel Matriks Hak Akses (On/Off)</span>
            </TabsTrigger>
            <TabsTrigger value="per-role" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Layers className="h-4 w-4" />
              <span>Detail Fokus Per Peran</span>
            </TabsTrigger>
          </TabsList>

          {/* Search & Filter */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="Cari modul atau rute"
                placeholder="Cari modul / rute..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full pl-9 pr-9 text-xs bg-background/80"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Hapus pencarian"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1 rounded-lg border border-border/50 bg-muted/40 p-1 text-[11px] w-full lg:w-auto">
              {(["all", "Utama", "Organisasi", "Administrasi"] as const).map((kat) => (
                <Button
                  key={kat}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedKategori(kat)}
                  className={`h-7 flex-1 px-2.5 text-center text-[11px] font-normal sm:flex-none sm:min-w-17.5 ${
                    selectedKategori === kat
                      ? "bg-background text-foreground font-medium shadow-sm hover:bg-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {kat === "all" ? "Semua" : kat}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAMPILAN 1: MATRIKS LENGKAP ROLE VS MENU (ON/OFF)         */}
        {/* ========================================================= */}
        <TabsContent value="matriks" className="space-y-4 mt-0">
          <Card>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-primary" />
                    Matriks Perizinan Menu & Halaman
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Klik tombol On/Off pada perpotongan baris menu dan kolom peran untuk mengaktifkan atau menonaktifkan hak akses.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="min-w-[200px] w-[240px]">Halaman / Modul</TableHead>
                      <TableHead className="w-[110px] text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-primary">Admin</span>
                          <span className="text-[10px] text-muted-foreground">(Kunci ON)</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-[110px] text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-amber-400">Ketua</span>
                          <div className="flex gap-1 mt-0.5">
                            <button
                              onClick={() => handleToggleAllForRole("ketua", true)}
                              className="text-[9px] text-muted-foreground hover:text-emerald-400 underline"
                              title="Aktifkan semua"
                            >
                              All On
                            </button>
                            <span className="text-[9px] text-muted-foreground">·</span>
                            <button
                              onClick={() => handleToggleAllForRole("ketua", false)}
                              className="text-[9px] text-muted-foreground hover:text-destructive underline"
                              title="Matikan semua"
                            >
                              Off
                            </button>
                          </div>
                        </div>
                      </TableHead>
                      <TableHead className="w-[110px] text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-sky-400">Sekretaris</span>
                          <div className="flex gap-1 mt-0.5">
                            <button
                              onClick={() => handleToggleAllForRole("sekretaris", true)}
                              className="text-[9px] text-muted-foreground hover:text-emerald-400 underline"
                            >
                              All On
                            </button>
                            <span className="text-[9px] text-muted-foreground">·</span>
                            <button
                              onClick={() => handleToggleAllForRole("sekretaris", false)}
                              className="text-[9px] text-muted-foreground hover:text-destructive underline"
                            >
                              Off
                            </button>
                          </div>
                        </div>
                      </TableHead>
                      <TableHead className="w-[110px] text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-emerald-400">Bendahara</span>
                          <div className="flex gap-1 mt-0.5">
                            <button
                              onClick={() => handleToggleAllForRole("bendahara", true)}
                              className="text-[9px] text-muted-foreground hover:text-emerald-400 underline"
                            >
                              All On
                            </button>
                            <span className="text-[9px] text-muted-foreground">·</span>
                            <button
                              onClick={() => handleToggleAllForRole("bendahara", false)}
                              className="text-[9px] text-muted-foreground hover:text-destructive underline"
                            >
                              Off
                            </button>
                          </div>
                        </div>
                      </TableHead>
                      <TableHead className="w-[110px] text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-purple-400">Koordinator</span>
                          <div className="flex gap-1 mt-0.5">
                            <button
                              onClick={() => handleToggleAllForRole("koordinator", true)}
                              className="text-[9px] text-muted-foreground hover:text-emerald-400 underline"
                            >
                              All On
                            </button>
                            <span className="text-[9px] text-muted-foreground">·</span>
                            <button
                              onClick={() => handleToggleAllForRole("koordinator", false)}
                              className="text-[9px] text-muted-foreground hover:text-destructive underline"
                            >
                              Off
                            </button>
                          </div>
                        </div>
                      </TableHead>
                      <TableHead className="w-[110px] text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-zinc-400">Anggota</span>
                          <div className="flex gap-1 mt-0.5">
                            <button
                              onClick={() => handleToggleAllForRole("anggota", true)}
                              className="text-[9px] text-muted-foreground hover:text-emerald-400 underline"
                            >
                              All On
                            </button>
                            <span className="text-[9px] text-muted-foreground">·</span>
                            <button
                              onClick={() => handleToggleAllForRole("anggota", false)}
                              className="text-[9px] text-muted-foreground hover:text-destructive underline"
                            >
                              Off
                            </button>
                          </div>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPermissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                          Tidak ditemukan modul dengan kata kunci pencarian tersebut.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPermissions.map((perm) => (
                        <TableRow key={perm.id} className="hover:bg-muted/30 transition-colors">
                          {/* Nama Modul & Path */}
                          <TableCell>
                            <div>
                              <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                                <span>{perm.nama}</span>
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                  {perm.kategori}
                                </Badge>
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                {perm.path}
                              </div>
                              <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                {perm.deskripsi}
                              </div>
                            </div>
                          </TableCell>

                          {/* 1. Admin (Always Locked ON) */}
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <div
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20"
                                title="Akses Admin Penuh (Terkunci)"
                              >
                                <Lock className="h-3 w-3" />
                                <span>ON</span>
                              </div>
                            </div>
                          </TableCell>

                          {/* 2. Ketua */}
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <AccessToggle checked={perm.access.ketua} onCheckedChange={() => handleToggleAccess(perm.id, "ketua")} />
                            </div>
                          </TableCell>

                          {/* 3. Sekretaris */}
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <AccessToggle checked={perm.access.sekretaris} onCheckedChange={() => handleToggleAccess(perm.id, "sekretaris")} />
                            </div>
                          </TableCell>

                          {/* 4. Bendahara */}
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <AccessToggle checked={perm.access.bendahara} onCheckedChange={() => handleToggleAccess(perm.id, "bendahara")} />
                            </div>
                          </TableCell>

                          {/* 5. Koordinator */}
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <AccessToggle checked={perm.access.koordinator} onCheckedChange={() => handleToggleAccess(perm.id, "koordinator")} />
                            </div>
                          </TableCell>

                          {/* 6. Anggota */}
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <AccessToggle checked={perm.access.anggota} onCheckedChange={() => handleToggleAccess(perm.id, "anggota")} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAMPILAN 2: DETAIL FOKUS PER ROLE                         */}
        {/* ========================================================= */}
        <TabsContent value="per-role" className="space-y-4 mt-0">
          <Card>
            <CardHeader className="p-4 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">
                      Izin Akses Peran:{" "}
                      <span className="text-primary font-bold">
                        {ROLES_LIST.find((r) => r.id === selectedRoleDetail)?.name}
                      </span>
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {ROLES_LIST.find((r) => r.id === selectedRoleDetail)?.userCount} Pengguna Aktif
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-0.5">
                    {ROLES_LIST.find((r) => r.id === selectedRoleDetail)?.deskripsi}
                  </CardDescription>
                </div>

                {selectedRoleDetail !== "admin" && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                      onClick={() => handleToggleAllForRole(selectedRoleDetail, false)}
                    >
                      Matikan Semua (OFF)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/30"
                      onClick={() => handleToggleAllForRole(selectedRoleDetail, true)}
                    >
                      Aktifkan Semua (ON)
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredPermissions.map((perm) => {
                  const isAllowed = perm.access[selectedRoleDetail];
                  const isAdmin = selectedRoleDetail === "admin";

                  return (
                    <div
                      key={perm.id}
                      className={`p-3.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                        isAllowed
                          ? "bg-card/90 border-border/90"
                          : "bg-card/20 border-border/40 opacity-70"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-foreground truncate">
                            {perm.nama}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {perm.path}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {perm.deskripsi}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isAdmin ? (
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/30">
                            <Lock className="h-3 w-3" />
                            <span>Terkunci ON</span>
                          </div>
                        ) : (
                          <AccessToggle
                              checked={isAllowed}
                              onCheckedChange={() => handleToggleAccess(perm.id, selectedRoleDetail)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========================================================= */}
      {/* DIALOG 1: KONFIRMASI SIMPAN PERUBAHAN                     */}
      {/* ========================================================= */}
      <Dialog open={isSaveConfirmOpen} onOpenChange={setIsSaveConfirmOpen}>
        <DialogContent className="sm:max-w-[440px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
              <Save className="h-5 w-5" />
            </div>
            <DialogTitle>Terapkan Hak Akses Baru?</DialogTitle>
            <DialogDescription>
              Terdapat <strong>{changeCount} perubahan hak akses</strong> yang akan langsung berdampak pada menu dan halaman yang dapat dibuka oleh pengurus sesuai peran masing-masing.
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 bg-muted/40 rounded-lg border border-border/50 text-xs space-y-1 text-muted-foreground">
            <p className="font-medium text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Sesi pengguna yang aktif akan diperbarui otomatis.
            </p>
            <p>Pengguna tanpa izin akan dialihkan ke halaman dashboard dengan notifikasi pembatasan akses.</p>
          </div>
          <DialogFooter className="pt-2 gap-2">
            <Button variant="outline" onClick={() => setIsSaveConfirmOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveAll} className="bg-primary text-primary-foreground">
              Terapkan Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* DIALOG 2: RESET KE STANDAR BAWAAN                        */}
      {/* ========================================================= */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-[420px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
              <RotateCcw className="h-5 w-5" />
            </div>
            <DialogTitle>Reset ke Konfigurasi Standar?</DialogTitle>
            <DialogDescription>
              Tindakan ini akan mengembalikan seluruh matriks hak akses ke standar rekomendasi organisasi Karang Taruna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2 gap-2">
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
              Batal
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmResetDefaults}
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              Reset ke Standar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
