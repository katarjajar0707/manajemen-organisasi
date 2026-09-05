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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowRightLeft,
  Boxes,
  MapPin,
  Clock,
  User,
  Filter,
  RefreshCw,
  Check,
} from "lucide-react";

export type KondisiBarang = "baik" | "rusak_ringan" | "rusak_berat";
export type StatusBarang = "Tersedia" | "Dipinjam";
export type KategoriBarang =
  | "Elektronik & Sound"
  | "Tenda & Panggung"
  | "Meja & Kursi"
  | "Logistik & Kebersihan"
  | "Olahraga"
  | "Lainnya";

export interface ItemInventaris {
  id: string;
  nama: string;
  kategori: KategoriBarang;
  jumlah: number;
  satuan: string;
  kondisi: KondisiBarang;
  status: StatusBarang;
  lokasi: string;
  peminjam?: string;
  tglPinjam?: string;
  tglKembaliRencana?: string;
  keterangan?: string;
}

const INITIAL_DATA: ItemInventaris[] = [
  {
    id: "INV-001",
    nama: "Sound System Portable 12 Inch + 2 Mic Wireless",
    kategori: "Elektronik & Sound",
    jumlah: 2,
    satuan: "Unit",
    kondisi: "baik",
    status: "Tersedia",
    lokasi: "Ruang Sekretariat Katar",
    keterangan: "Termasuk kabel power dan receiver mic",
  },
  {
    id: "INV-002",
    nama: "Tenda Kerucut Lipat 3x3 Meter",
    kategori: "Tenda & Panggung",
    jumlah: 4,
    satuan: "Unit",
    kondisi: "baik",
    status: "Dipinjam",
    lokasi: "Gudang Balai RW 03",
    peminjam: "Pak RW (Hajatan Warga RT 02)",
    tglPinjam: "2026-09-03",
    tglKembaliRencana: "2026-09-07",
    keterangan: "Dipinjam 2 unit untuk acara syukuran",
  },
  {
    id: "INV-003",
    nama: "Kursi Plastik Hijau Sandaran",
    kategori: "Meja & Kursi",
    jumlah: 100,
    satuan: "Pcs",
    kondisi: "baik",
    status: "Tersedia",
    lokasi: "Gudang Balai RW 03",
    keterangan: "Bisa ditumpuk per 25 buah",
  },
  {
    id: "INV-004",
    nama: "Kabel Roll Ekstensi 25m Heavy Duty",
    kategori: "Elektronik & Sound",
    jumlah: 3,
    satuan: "Roll",
    kondisi: "rusak_ringan",
    status: "Tersedia",
    lokasi: "Ruang Sekretariat Katar",
    keterangan: "Satu colokan agak longgar, perlu disolder ulang",
  },
  {
    id: "INV-005",
    nama: "Proyektor Epson EB-X400 + Tripod Screen",
    kategori: "Elektronik & Sound",
    jumlah: 1,
    satuan: "Set",
    kondisi: "baik",
    status: "Dipinjam",
    lokasi: "Ruang Sekretariat Katar",
    peminjam: "Karang Taruna Sub-Unit 04 (Nonton Bareng)",
    tglPinjam: "2026-09-04",
    tglKembaliRencana: "2026-09-06",
    keterangan: "Termasuk kabel HDMI 10m",
  },
  {
    id: "INV-006",
    nama: "Dispenser Air Panas/Dingin Galon Bawah",
    kategori: "Logistik & Kebersihan",
    jumlah: 1,
    satuan: "Unit",
    kondisi: "baik",
    status: "Tersedia",
    lokasi: "Pantry Sekretariat",
    keterangan: "Dibersihkan rutin tiap 2 minggu",
  },
  {
    id: "INV-007",
    nama: "Set Meja Lipat Aluminium 120x60cm",
    kategori: "Meja & Kursi",
    jumlah: 6,
    satuan: "Unit",
    kondisi: "rusak_berat",
    status: "Tersedia",
    lokasi: "Gudang Belakang",
    keterangan: "2 unit patah engsel kaki, menunggu perbaikan",
  },
];

export function InventarisManager() {
  const [items, setItems] = useState<ItemInventaris[]>(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategori, setFilterKategori] = useState<string>("all");
  const [filterKondisi, setFilterKondisi] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Notification Toast State
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "info" | "warning";
  }>({ show: false, message: "", type: "success" });

  const triggerNotification = (message: string, type: "success" | "info" | "warning" = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPinjamOpen, setIsPinjamOpen] = useState(false);

  // Selected item for Edit, Detail, Delete, or Pinjam
  const [selectedItem, setSelectedItem] = useState<ItemInventaris | null>(null);

  // Form states for Create & Edit
  const [formData, setFormData] = useState<{
    nama: string;
    kategori: KategoriBarang;
    jumlah: number;
    satuan: string;
    kondisi: KondisiBarang;
    status: StatusBarang;
    lokasi: string;
    keterangan: string;
  }>({
    nama: "",
    kategori: "Elektronik & Sound",
    jumlah: 1,
    satuan: "Unit",
    kondisi: "baik",
    status: "Tersedia",
    lokasi: "Ruang Sekretariat Katar",
    keterangan: "",
  });

  // Form state for Peminjaman / Pengembalian
  const [pinjamForm, setPinjamForm] = useState({
    peminjam: "",
    tglPinjam: new Date().toISOString().split("T")[0],
    tglKembaliRencana: "",
    keterangan: "",
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const totalJenis = items.length;
    const totalUnit = items.reduce((acc, curr) => acc + curr.jumlah, 0);
    const kondisiBaik = items.filter((i) => i.kondisi === "baik").length;
    const kondisiRusak = items.filter((i) => i.kondisi !== "baik").length;
    const dipinjam = items.filter((i) => i.status === "Dipinjam").length;

    return { totalJenis, totalUnit, kondisiBaik, kondisiRusak, dipinjam };
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.peminjam && item.peminjam.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchKategori = filterKategori === "all" || item.kategori === filterKategori;
      const matchKondisi = filterKondisi === "all" || item.kondisi === filterKondisi;
      const matchStatus = filterStatus === "all" || item.status === filterStatus;

      return matchSearch && matchKategori && matchKondisi && matchStatus;
    });
  }, [items, searchQuery, filterKategori, filterKondisi, filterStatus]);

  // Handlers
  const handleOpenCreate = () => {
    setFormData({
      nama: "",
      kategori: "Elektronik & Sound",
      jumlah: 1,
      satuan: "Unit",
      kondisi: "baik",
      status: "Tersedia",
      lokasi: "Ruang Sekretariat Katar",
      keterangan: "",
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) return;

    const newItem: ItemInventaris = {
      id: `INV-${String(items.length + 1).padStart(3, "0")}`,
      nama: formData.nama,
      kategori: formData.kategori,
      jumlah: Number(formData.jumlah) || 1,
      satuan: formData.satuan || "Unit",
      kondisi: formData.kondisi,
      status: formData.status,
      lokasi: formData.lokasi || "Sekretariat",
      keterangan: formData.keterangan,
    };

    setItems([newItem, ...items]);
    setIsCreateOpen(false);
    triggerNotification(`Barang "${newItem.nama}" berhasil ditambahkan ke inventaris!`, "success");
  };

  const handleOpenEdit = (item: ItemInventaris) => {
    setSelectedItem(item);
    setFormData({
      nama: item.nama,
      kategori: item.kategori,
      jumlah: item.jumlah,
      satuan: item.satuan,
      kondisi: item.kondisi,
      status: item.status,
      lokasi: item.lokasi,
      keterangan: item.keterangan || "",
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !formData.nama.trim()) return;

    setItems((prev) =>
      prev.map((i) =>
        i.id === selectedItem.id
          ? {
              ...i,
              nama: formData.nama,
              kategori: formData.kategori,
              jumlah: Number(formData.jumlah) || 1,
              satuan: formData.satuan,
              kondisi: formData.kondisi,
              status: formData.status,
              lokasi: formData.lokasi,
              keterangan: formData.keterangan,
            }
          : i
      )
    );
    setIsEditOpen(false);
    triggerNotification(`Data barang "${formData.nama}" berhasil diperbarui!`, "success");
  };

  const handleOpenDetail = (item: ItemInventaris) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (item: ItemInventaris) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteSubmit = () => {
    if (!selectedItem) return;
    setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
    setIsDeleteOpen(false);
    triggerNotification(`Barang "${selectedItem.nama}" berhasil dihapus dari inventaris.`, "warning");
    setSelectedItem(null);
  };

  const handleOpenPinjam = (item: ItemInventaris) => {
    setSelectedItem(item);
    setPinjamForm({
      peminjam: item.peminjam || "",
      tglPinjam: item.tglPinjam || new Date().toISOString().split("T")[0],
      tglKembaliRencana: item.tglKembaliRencana || "",
      keterangan: item.keterangan || "",
    });
    setIsPinjamOpen(true);
  };

  const handlePinjamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (selectedItem.status === "Tersedia") {
      // Catat peminjaman
      if (!pinjamForm.peminjam.trim()) return;
      setItems((prev) =>
        prev.map((i) =>
          i.id === selectedItem.id
            ? {
                ...i,
                status: "Dipinjam",
                peminjam: pinjamForm.peminjam,
                tglPinjam: pinjamForm.tglPinjam,
                tglKembaliRencana: pinjamForm.tglKembaliRencana || "-",
                keterangan: pinjamForm.keterangan,
              }
            : i
        )
      );
      triggerNotification(`Peminjaman "${selectedItem.nama}" oleh ${pinjamForm.peminjam} tercatat.`, "info");
    } else {
      // Pengembalian barang
      setItems((prev) =>
        prev.map((i) =>
          i.id === selectedItem.id
            ? {
                ...i,
                status: "Tersedia",
                peminjam: undefined,
                tglPinjam: undefined,
                tglKembaliRencana: undefined,
              }
            : i
        )
      );
      triggerNotification(`Barang "${selectedItem.nama}" telah berhasil dikembalikan!`, "success");
    }
    setIsPinjamOpen(false);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterKategori("all");
    setFilterKondisi("all");
    setFilterStatus("all");
  };

  return (
    <div className="space-y-6">
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
            {notification.type === "success" && <Check className="h-4 w-4 text-emerald-400" />}
            {notification.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-400" />}
            {notification.type === "info" && <Clock className="h-4 w-4 text-sky-400" />}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification((prev) => ({ ...prev, show: false }))}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventaris & Aset Organisasi</h1>
          <p className="text-sm text-muted-foreground">
            Kelola data aset, status kepemilikan, kondisi fisik, dan sirkulasi pinjam-pakai barang.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={resetFilters}
            className="gap-1.5 h-8 text-xs flex-1 sm:flex-initial"
            title="Muat ulang dan reset filter"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5 h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm flex-1 sm:flex-initial"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Barang</span>
          </Button>
        </div>
      </div>

      {/* Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card className="bg-card/50 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Aset</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold">{stats.totalJenis}</span>
                <span className="text-xs text-muted-foreground">jenis ({stats.totalUnit} unit)</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Boxes className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Kondisi Baik</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-emerald-400">{stats.kondisiBaik}</span>
                <span className="text-xs text-muted-foreground">jenis</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Perlu Perbaikan</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-amber-400">{stats.kondisiRusak}</span>
                <span className="text-xs text-muted-foreground">jenis</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Sedang Dipinjam</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-sky-400">{stats.dipinjam}</span>
                <span className="text-xs text-muted-foreground">barang</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="bg-card/40 border-border/60">
        <CardContent className="p-3.5 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Input
                placeholder="Cari nama barang, kategori, lokasi, atau peminjam..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Select Kategori */}
            <div className="w-full md:w-48">
              <Select value={filterKategori} onValueChange={setFilterKategori}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="Elektronik & Sound">Elektronik & Sound</SelectItem>
                  <SelectItem value="Tenda & Panggung">Tenda & Panggung</SelectItem>
                  <SelectItem value="Meja & Kursi">Meja & Kursi</SelectItem>
                  <SelectItem value="Logistik & Kebersihan">Logistik & Kebersihan</SelectItem>
                  <SelectItem value="Olahraga">Olahraga</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Select Kondisi */}
            <div className="w-full md:w-40">
              <Select value={filterKondisi} onValueChange={setFilterKondisi}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Kondisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kondisi</SelectItem>
                  <SelectItem value="baik">Baik</SelectItem>
                  <SelectItem value="rusak_ringan">Rusak Ringan</SelectItem>
                  <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Select Status */}
            <div className="w-full md:w-40">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Status Pinjam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Tersedia">Tersedia</SelectItem>
                  <SelectItem value="Dipinjam">Dipinjam</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
            <span>
              Menampilkan <strong className="text-foreground">{filteredItems.length}</strong> dari {items.length} total barang
            </span>
            {(searchQuery || filterKategori !== "all" || filterKondisi !== "all" || filterStatus !== "all") && (
              <button
                onClick={resetFilters}
                className="text-primary hover:underline flex items-center gap-1 font-medium"
              >
                Hapus Semua Filter
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Daftar Inventaris Barang
              </CardTitle>
              <CardDescription>
                Daftar lengkap aset fisik karang taruna beserta kondisi dan hak pinjam.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card List (< md) */}
          <div className="md:hidden divide-y divide-border/60">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                Tidak ada data barang yang cocok dengan filter.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="p-3.5 space-y-2.5 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {item.id}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0">
                          {item.kategori}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-xs sm:text-sm text-foreground leading-snug break-words">
                        {item.nama}
                      </h4>
                    </div>

                    <Badge
                      variant={item.status === "Tersedia" ? "outline" : "info"}
                      className={`text-[10px] py-0 shrink-0 ${
                        item.status === "Tersedia"
                          ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                          : ""
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground p-2 rounded-lg bg-muted/40 border border-border/40">
                    <div>
                      <span className="text-[10px] text-muted-foreground/70 block">Kuantitas:</span>
                      <strong className="text-foreground font-semibold">{item.jumlah} {item.satuan}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground/70 block">Kondisi Fisik:</span>
                      <span className="capitalize font-medium text-foreground">{item.kondisi.replace("_", " ")}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-muted-foreground/70 block">Lokasi:</span>
                      <span className="flex items-center gap-1 text-foreground">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        <span className="truncate">{item.lokasi}</span>
                      </span>
                    </div>
                    {item.status === "Dipinjam" && item.peminjam && (
                      <div className="col-span-2 pt-1 border-t border-border/30 text-[10px] text-amber-500">
                        Dipinjam oleh: <strong>{item.peminjam}</strong> ({item.tglKembaliRencana})
                      </div>
                    )}
                  </div>

                  {/* Actions mobile */}
                  <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1">
                    {item.status === "Tersedia" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5 gap-1 border-primary/40 text-primary"
                        onClick={() => handleOpenPinjam(item)}
                      >
                        <ArrowRightLeft className="h-3 w-3" />
                        <span>Pinjam</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5 gap-1 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                        onClick={() => handleOpenPinjam(item)}
                      >
                        <Check className="h-3 w-3" />
                        <span>Kembalikan</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs px-2 gap-1"
                      onClick={() => handleOpenDetail(item)}
                    >
                      <Eye className="h-3 w-3" />
                      <span>Detail</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs px-2 gap-1"
                      onClick={() => handleOpenEdit(item)}
                    >
                      <Pencil className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleOpenDelete(item)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">Kode</TableHead>
                  <TableHead className="min-w-[220px]">Nama Barang</TableHead>
                  <TableHead className="w-[110px]">Jumlah</TableHead>
                  <TableHead className="w-[130px]">Kondisi</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="min-w-[160px]">Lokasi Penyimpanan</TableHead>
                  <TableHead className="min-w-[160px]">Peminjam / Info</TableHead>
                  <TableHead className="text-right w-[150px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Boxes className="h-8 w-8 text-muted-foreground/50" />
                        <p className="font-medium text-sm">Tidak ada data barang yang sesuai kriteria.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetFilters}
                          className="mt-1 text-xs"
                        >
                          Reset Filter
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {item.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm text-foreground line-clamp-1">
                            {item.nama}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/70" />
                            {item.kategori}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-foreground">{item.jumlah}</span>{" "}
                        <span className="text-xs text-muted-foreground">{item.satuan}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.kondisi === "baik"
                              ? "success"
                              : item.kondisi === "rusak_ringan"
                              ? "warning"
                              : "destructive"
                          }
                          className="text-xs capitalize font-medium"
                        >
                          {item.kondisi === "baik" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {item.kondisi === "rusak_ringan" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {item.kondisi === "rusak_berat" && <XCircle className="h-3 w-3 mr-1" />}
                          {item.kondisi.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.status === "Tersedia" ? "outline" : "info"}
                          className={`text-xs ${
                            item.status === "Tersedia"
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                              : ""
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                          <span className="truncate max-w-[140px]" title={item.lokasi}>
                            {item.lokasi}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.status === "Dipinjam" && item.peminjam ? (
                          <div>
                            <div className="text-xs font-medium text-foreground line-clamp-1" title={item.peminjam}>
                              {item.peminjam}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3 text-sky-400" />
                              Kembali: {item.tglKembaliRencana || "-"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Pinjam / Kembalikan Toggle */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${
                              item.status === "Tersedia"
                                ? "text-muted-foreground hover:text-sky-400"
                                : "text-sky-400 hover:text-emerald-400"
                            }`}
                            onClick={() => handleOpenPinjam(item)}
                            title={
                              item.status === "Tersedia"
                                ? "Pinjamkan Barang Ini"
                                : "Proses Pengembalian Barang"
                            }
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>

                          {/* View Detail */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenDetail(item)}
                            title="Lihat Detail Barang"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Data Barang"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleOpenDelete(item)}
                            title="Hapus Barang"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* ========================================================= */}
      {/* 1. DIALOG CREATE (TAMBAH BARANG)                          */}
      {/* ========================================================= */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[540px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Tambah Aset Barang Baru
            </DialogTitle>
            <DialogDescription>
              Isi data detail barang inventaris baru untuk didaftarkan ke sistem.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-nama" className="text-xs">
                Nama Barang <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-nama"
                placeholder="Contoh: Sound System Portable 12 Inch"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-kategori" className="text-xs">
                  Kategori
                </Label>
                <Select
                  value={formData.kategori}
                  onValueChange={(val: KategoriBarang) =>
                    setFormData({ ...formData, kategori: val })
                  }
                >
                  <SelectTrigger id="create-kategori">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Elektronik & Sound">Elektronik & Sound</SelectItem>
                    <SelectItem value="Tenda & Panggung">Tenda & Panggung</SelectItem>
                    <SelectItem value="Meja & Kursi">Meja & Kursi</SelectItem>
                    <SelectItem value="Logistik & Kebersihan">Logistik & Kebersihan</SelectItem>
                    <SelectItem value="Olahraga">Olahraga</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="create-jumlah" className="text-xs">
                    Jumlah
                  </Label>
                  <Input
                    id="create-jumlah"
                    type="number"
                    min="1"
                    value={formData.jumlah}
                    onChange={(e) =>
                      setFormData({ ...formData, jumlah: parseInt(e.target.value) || 1 })
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="create-satuan" className="text-xs">
                    Satuan
                  </Label>
                  <Input
                    id="create-satuan"
                    placeholder="Unit / Pcs"
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-kondisi" className="text-xs">
                  Kondisi Fisik
                </Label>
                <Select
                  value={formData.kondisi}
                  onValueChange={(val: KondisiBarang) =>
                    setFormData({ ...formData, kondisi: val })
                  }
                >
                  <SelectTrigger id="create-kondisi">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baik">Baik (Normal Operasional)</SelectItem>
                    <SelectItem value="rusak_ringan">Rusak Ringan (Masih Bisa Digunakan)</SelectItem>
                    <SelectItem value="rusak_berat">Rusak Berat (Tidak Berfungsi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-status" className="text-xs">
                  Status Ketersediaan
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: StatusBarang) =>
                    setFormData({ ...formData, status: val })
                  }
                >
                  <SelectTrigger id="create-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tersedia">Tersedia di Gudang</SelectItem>
                    <SelectItem value="Dipinjam">Sedang Dipinjam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-lokasi" className="text-xs">
                Lokasi Penyimpanan
              </Label>
              <Input
                id="create-lokasi"
                placeholder="Misal: Gudang Balai RW 03 / Lemari Sekretariat"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-keterangan" className="text-xs">
                Catatan / Spesifikasi Tambahan
              </Label>
              <Input
                id="create-keterangan"
                placeholder="Kelengkapan kabel, nomor seri, atau kondisi khusus..."
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground">
                Simpan Barang
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 2. DIALOG EDIT (UPDATE BARANG)                            */}
      {/* ========================================================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[540px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Data Barang ({selectedItem?.id})
            </DialogTitle>
            <DialogDescription>
              Perbarui informasi kuantitas, lokasi, dan kondisi fisik barang.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-nama" className="text-xs">
                Nama Barang <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-kategori" className="text-xs">
                  Kategori
                </Label>
                <Select
                  value={formData.kategori}
                  onValueChange={(val: KategoriBarang) =>
                    setFormData({ ...formData, kategori: val })
                  }
                >
                  <SelectTrigger id="edit-kategori">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Elektronik & Sound">Elektronik & Sound</SelectItem>
                    <SelectItem value="Tenda & Panggung">Tenda & Panggung</SelectItem>
                    <SelectItem value="Meja & Kursi">Meja & Kursi</SelectItem>
                    <SelectItem value="Logistik & Kebersihan">Logistik & Kebersihan</SelectItem>
                    <SelectItem value="Olahraga">Olahraga</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-jumlah" className="text-xs">
                    Jumlah
                  </Label>
                  <Input
                    id="edit-jumlah"
                    type="number"
                    min="1"
                    value={formData.jumlah}
                    onChange={(e) =>
                      setFormData({ ...formData, jumlah: parseInt(e.target.value) || 1 })
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-satuan" className="text-xs">
                    Satuan
                  </Label>
                  <Input
                    id="edit-satuan"
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-kondisi" className="text-xs">
                  Kondisi Fisik
                </Label>
                <Select
                  value={formData.kondisi}
                  onValueChange={(val: KondisiBarang) =>
                    setFormData({ ...formData, kondisi: val })
                  }
                >
                  <SelectTrigger id="edit-kondisi">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baik">Baik (Normal Operasional)</SelectItem>
                    <SelectItem value="rusak_ringan">Rusak Ringan</SelectItem>
                    <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-status" className="text-xs">
                  Status Ketersediaan
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: StatusBarang) =>
                    setFormData({ ...formData, status: val })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tersedia">Tersedia</SelectItem>
                    <SelectItem value="Dipinjam">Dipinjam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-lokasi" className="text-xs">
                Lokasi Penyimpanan
              </Label>
              <Input
                id="edit-lokasi"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-keterangan" className="text-xs">
                Catatan / Spesifikasi
              </Label>
              <Input
                id="edit-keterangan"
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground">
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 3. DIALOG DETAIL (READ BARANG)                            */}
      {/* ========================================================= */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[480px] w-[95vw] max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {selectedItem.id}
                  </Badge>
                  <Badge
                    variant={
                      selectedItem.kondisi === "baik"
                        ? "success"
                        : selectedItem.kondisi === "rusak_ringan"
                        ? "warning"
                        : "destructive"
                    }
                    className="capitalize text-xs"
                  >
                    {selectedItem.kondisi.replace("_", " ")}
                  </Badge>
                </div>
                <DialogTitle className="text-lg mt-1">{selectedItem.nama}</DialogTitle>
                <DialogDescription>{selectedItem.kategori}</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2 text-sm">
                <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg border border-border/50">
                  <div>
                    <span className="text-xs text-muted-foreground block">Jumlah Aset:</span>
                    <span className="font-semibold text-foreground">
                      {selectedItem.jumlah} {selectedItem.satuan}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Status Ketersediaan:</span>
                    <span
                      className={`font-semibold ${
                        selectedItem.status === "Tersedia" ? "text-emerald-400" : "text-sky-400"
                      }`}
                    >
                      {selectedItem.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-muted-foreground block">Lokasi Penyimpanan</span>
                      <span className="text-foreground">{selectedItem.lokasi}</span>
                    </div>
                  </div>

                  {selectedItem.status === "Dipinjam" && (
                    <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-lg space-y-1.5">
                      <span className="text-xs font-semibold text-sky-400 block flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" /> Informasi Peminjaman
                      </span>
                      <div className="text-xs space-y-1 text-muted-foreground">
                        <div>
                          Peminjam: <strong className="text-foreground">{selectedItem.peminjam}</strong>
                        </div>
                        <div>Tanggal Pinjam: {selectedItem.tglPinjam || "-"}</div>
                        <div>Target Kembali: {selectedItem.tglKembaliRencana || "-"}</div>
                      </div>
                    </div>
                  )}

                  {selectedItem.keterangan && (
                    <div className="pt-2 border-t border-border/40">
                      <span className="text-xs text-muted-foreground block mb-0.5">
                        Catatan Tambahan:
                      </span>
                      <p className="text-xs text-foreground/80 leading-relaxed bg-muted/30 p-2.5 rounded border border-border/40">
                        {selectedItem.keterangan}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Tutup
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenEdit(selectedItem);
                  }}
                  className="bg-primary text-primary-foreground gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Barang
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 4. DIALOG DELETE (DELETE BARANG)                          */}
      {/* ========================================================= */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[420px] w-[95vw] max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
                  <Trash2 className="h-5 w-5" />
                </div>
                <DialogTitle>Konfirmasi Hapus Barang</DialogTitle>
                <DialogDescription>
                  Apakah Anda yakin ingin menghapus barang inventaris berikut dari sistem? Tindakan ini tidak dapat dibatalkan.
                </DialogDescription>
              </DialogHeader>

              <div className="p-3 bg-muted/50 rounded-lg border border-border/60 text-sm">
                <div className="font-semibold text-foreground">{selectedItem.nama}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Kode: {selectedItem.id} • Kategori: {selectedItem.kategori}
                </div>
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteSubmit}
                  className="gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus Barang
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 5. DIALOG PINJAM / KEMBALIKAN                            */}
      {/* ========================================================= */}
      <Dialog open={isPinjamOpen} onOpenChange={setIsPinjamOpen}>
        <DialogContent className="sm:max-w-[480px] w-[95vw] max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-sky-400" />
                  {selectedItem.status === "Tersedia"
                    ? "Form Peminjaman Barang"
                    : "Konfirmasi Pengembalian Barang"}
                </DialogTitle>
                <DialogDescription>
                  {selectedItem.status === "Tersedia"
                    ? "Catat identitas peminjam dan batas waktu peminjaman aset."
                    : "Barang akan diubah statusnya menjadi Tersedia di gudang."}
                </DialogDescription>
              </DialogHeader>

              <div className="p-3 bg-muted/40 rounded-lg border border-border/50 text-xs mb-2">
                <div className="font-semibold text-sm text-foreground">{selectedItem.nama}</div>
                <div className="text-muted-foreground mt-0.5">
                  Jumlah: {selectedItem.jumlah} {selectedItem.satuan} • Lokasi: {selectedItem.lokasi}
                </div>
              </div>

              <form onSubmit={handlePinjamSubmit} className="space-y-3.5">
                {selectedItem.status === "Tersedia" ? (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="pinjam-nama" className="text-xs">
                        Nama Peminjam / Instansi / Warga <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="pinjam-nama"
                        placeholder="Contoh: Pak RT 04 / Panitia 17-an"
                        value={pinjamForm.peminjam}
                        onChange={(e) =>
                          setPinjamForm({ ...pinjamForm, peminjam: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="pinjam-tgl" className="text-xs">
                          Tanggal Pinjam
                        </Label>
                        <Input
                          id="pinjam-tgl"
                          type="date"
                          value={pinjamForm.tglPinjam}
                          onChange={(e) =>
                            setPinjamForm({ ...pinjamForm, tglPinjam: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pinjam-kembali" className="text-xs">
                          Rencana Kembali
                        </Label>
                        <Input
                          id="pinjam-kembali"
                          type="date"
                          value={pinjamForm.tglKembaliRencana}
                          onChange={(e) =>
                            setPinjamForm({
                              ...pinjamForm,
                              tglKembaliRencana: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="pinjam-keperluan" className="text-xs">
                        Keperluan / Keterangan Acara
                      </Label>
                      <Input
                        id="pinjam-keperluan"
                        placeholder="Contoh: Acara tirakatan warga RT 03"
                        value={pinjamForm.keterangan}
                        onChange={(e) =>
                          setPinjamForm({ ...pinjamForm, keterangan: e.target.value })
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-1 text-xs text-emerald-300">
                    <p className="font-medium">
                      Barang saat ini dipinjam oleh: <strong>{selectedItem.peminjam}</strong>
                    </p>
                    <p className="text-emerald-400/80">
                      Apakah barang sudah diperiksa dalam kondisi baik dan lengkap kembali di tempat penyimpanan?
                    </p>
                  </div>
                )}

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPinjamOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className={
                      selectedItem.status === "Tersedia"
                        ? "bg-sky-600 hover:bg-sky-500 text-white"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }
                  >
                    {selectedItem.status === "Tersedia"
                      ? "Catat Peminjaman"
                      : "Konfirmasi Pengembalian"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
