"use client";

import { useState, useTransition, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Archive,
  Upload,
  Download,
  Search,
  FileCheck,
  FileText,
  FileSpreadsheet,
  FolderArchive,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  Calendar,
  Layers,
  HardDrive,
  File,
  CheckCircle2,
  Check,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  ArsipItem,
  KategoriArsip,
  createArsip,
  updateArsip,
  deleteArsip,
} from "@/actions/arsip";
import { uploadLampiran } from "@/actions/storage";

interface ArsipManagerProps {
  initialArchives?: ArsipItem[];
  agendaList?: { id: string; nama: string }[];
  userRole?: string;
  currentUserId?: string;
}

export function ArsipManager({
  initialArchives = [],
  agendaList = [],
  userRole = "anggota",
  currentUserId,
}: ArsipManagerProps) {
  const [archives, setArchives] = useState<ArsipItem[]>(initialArchives);
  const [activeCategory, setActiveCategory] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAgenda, setFilterAgenda] = useState("all");
  const [isPending, startTransition] = useTransition();

  // Toast Notification
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "info" | "warning";
  }>({ show: false, message: "", type: "success" });

  const triggerNotification = (
    message: string,
    type: "success" | "info" | "warning" = "success"
  ) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  // Dialog State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingArsip, setEditingArsip] = useState<ArsipItem | null>(null);
  const [previewArsip, setPreviewArsip] = useState<ArsipItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form Fields
  const [judul, setJudul] = useState("");
  const [nomorSurat, setNomorSurat] = useState("");
  const [kategori, setKategori] = useState<KategoriArsip>("proposal");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("PDF");
  const [fileSize, setFileSize] = useState("1 MB");
  const [agendaId, setAgendaId] = useState<string>("none");
  const [deskripsi, setDeskripsi] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setSelectedFileName(file.name);

      // Extract size
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr = `${sizeMb} MB`;
      setFileSize(sizeStr);

      // Extract type
      let ext = file.name.split(".").pop()?.toUpperCase() || "PDF";
      if (ext === "DOC" || ext === "DOCX") ext = "DOCX";
      else if (ext === "XLS" || ext === "XLSX" || ext === "CSV") ext = "XLSX";
      setFileType(ext);

      const res = await uploadLampiran(file, "arsip");
      if (res.error || !res.url) {
        triggerNotification(res.error || "Gagal mengunggah berkas.", "warning");
      } else {
        setFileUrl(res.url);
        triggerNotification("Berkas berhasil diunggah ke storage!", "success");
      }
    } catch (err: any) {
      triggerNotification(err.message || "Gagal mengunggah berkas.", "warning");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenUpload = () => {
    setEditingArsip(null);
    setJudul("");
    setNomorSurat("");
    setKategori("proposal");
    setFileUrl("");
    setFileType("PDF");
    setFileSize("1 MB");
    setAgendaId("none");
    setDeskripsi("");
    setSelectedFileName("");
    setIsUploadOpen(true);
  };

  const handleOpenEdit = (item: ArsipItem) => {
    setEditingArsip(item);
    setJudul(item.judul);
    setNomorSurat(item.nomorSurat === "-" ? "" : item.nomorSurat);
    setKategori(item.kategori);
    setFileUrl(item.fileUrl);
    setFileType(item.fileType);
    setFileSize(item.size);
    setAgendaId(item.agendaOrganisasiId || "none");
    setDeskripsi(item.deskripsi);
    setSelectedFileName("Berkas Terlampir");
    setIsUploadOpen(true);
  };

  const handleSave = () => {
    if (!judul.trim()) {
      triggerNotification("Judul arsip dokumen wajib diisi.", "warning");
      return;
    }

    if (!fileUrl.trim()) {
      triggerNotification("File dokumen wajib diunggah terlebih dahulu.", "warning");
      return;
    }

    startTransition(async () => {
      const selectedAgendaId = agendaId === "none" ? null : agendaId;

      if (editingArsip) {
        const res = await updateArsip(editingArsip.id, {
          judul,
          nomorSurat,
          kategori,
          fileUrl,
          fileType,
          fileSize,
          agendaOrganisasiId: selectedAgendaId,
          deskripsi,
        });

        if (res.success) {
          const agendaObj = agendaList.find((a) => a.id === selectedAgendaId);
          setArchives((prev) =>
            prev.map((a) =>
              a.id === editingArsip.id
                ? {
                    ...a,
                    judul,
                    nomorSurat: nomorSurat || "-",
                    kategori,
                    fileUrl,
                    fileType,
                    size: fileSize,
                    agendaOrganisasiId: selectedAgendaId,
                    agendaTerkait: agendaObj?.nama || "Umum / Organisasi",
                    deskripsi,
                  }
                : a
            )
          );
          setIsUploadOpen(false);
          triggerNotification("Data arsip dokumen berhasil diperbarui!", "success");
        } else {
          triggerNotification(res.error || "Gagal memperbarui arsip.", "warning");
        }
      } else {
        const res = await createArsip({
          judul,
          nomorSurat,
          kategori,
          fileUrl,
          fileType,
          fileSize,
          agendaOrganisasiId: selectedAgendaId,
          deskripsi,
        });

        if (res.success && res.data) {
          setArchives([res.data, ...archives]);
          setIsUploadOpen(false);
          triggerNotification("Dokumen berhasil diarsipkan ke sistem!", "success");
        } else {
          triggerNotification(res.error || "Gagal mengarsipkan dokumen.", "warning");
        }
      }
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;

    startTransition(async () => {
      const res = await deleteArsip(deleteId);
      if (res.success) {
        setArchives((prev) => prev.filter((a) => a.id !== deleteId));
        setDeleteId(null);
        triggerNotification("Arsip dokumen berhasil dihapus.", "info");
      } else {
        triggerNotification(res.error || "Gagal menghapus arsip.", "warning");
      }
    });
  };

  const handleDownload = (item: ArsipItem) => {
    if (item.fileUrl) {
      window.open(item.fileUrl, "_blank");
    }
  };

  const filteredArchives = archives.filter((item) => {
    if (activeCategory !== "semua" && item.kategori !== activeCategory) return false;
    if (filterAgenda !== "all" && item.agendaOrganisasiId !== filterAgenda) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchJudul = item.judul.toLowerCase().includes(q);
      const matchNo = item.nomorSurat.toLowerCase().includes(q);
      const matchDesc = item.deskripsi.toLowerCase().includes(q);
      const matchAgenda = item.agendaTerkait?.toLowerCase().includes(q);
      if (!matchJudul && !matchNo && !matchDesc && !matchAgenda) return false;
    }
    return true;
  });

  const getFileIcon = (type: string) => {
    if (type === "PDF") return <FileCheck className="h-5 w-5 text-rose-500" />;
    if (type === "DOCX" || type === "DOC") return <FileText className="h-5 w-5 text-blue-500" />;
    if (type === "XLSX" || type === "XLS" || type === "CSV") return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    return <File className="h-5 w-5 text-purple-500" />;
  };

  const getKategoriBadge = (kat: string) => {
    switch (kat) {
      case "sk":
        return <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] uppercase font-bold">SK Resmi</Badge>;
      case "lpj":
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] uppercase font-bold">LPJ</Badge>;
      case "proposal":
        return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] uppercase font-bold">Proposal</Badge>;
      case "notulensi":
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] uppercase font-bold">Notulensi</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] uppercase">Lainnya</Badge>;
    }
  };

  return (
    <div className="space-y-6">
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
            {notification.type === "success" && <Check className="h-4 w-4 text-emerald-400" />}
            {notification.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-400" />}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Arsip Dokumen Organisasi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penyimpanan digital terpusat untuk SK, Proposal kegiatan, LPJ keuangan, dan notulensi rapat.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            className="gap-2 shadow-sm bg-primary hover:bg-primary/90 text-xs h-8 w-full sm:w-auto"
            onClick={handleOpenUpload}
          >
            <Upload className="h-4 w-4" />
            <span>Upload Berkas Arsip</span>
          </Button>
        </div>
      </div>

      {/* Mini Storage Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-card/70 border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Dokumen Disimpan</p>
              <h3 className="text-2xl font-bold mt-0.5">{archives.length} Berkas</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Tersinkronisasi ke cloud</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FolderArchive className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Kategori SK & LPJ</p>
              <h3 className="text-2xl font-bold mt-0.5">
                {archives.filter((a) => a.kategori === "sk" || a.kategori === "lpj").length} Dokumen
              </h3>
              <p className="text-[11px] text-emerald-500 font-medium mt-0.5">Legalitas & Akuntabilitas</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <HardDrive className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Proposal & Kegiatan</p>
              <h3 className="text-2xl font-bold mt-0.5">
                {archives.filter((a) => a.kategori === "proposal" || a.kategori === "notulensi").length} Dokumen
              </h3>
              <p className="text-[11px] text-blue-500 font-medium mt-0.5">Perencanaan & Risalah</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Archive className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-muted/30 p-2.5 rounded-xl border">
        {/* Kategori Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: "semua", label: "Semua" },
            { id: "sk", label: "SK Kepengurusan" },
            { id: "proposal", label: "Proposal" },
            { id: "lpj", label: "LPJ Keuangan" },
            { id: "notulensi", label: "Notulensi" },
            { id: "lainnya", label: "Lainnya" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                activeCategory === tab.id
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Agenda & Search */}
        <div className="flex items-center gap-2">
          {agendaList.length > 0 && (
            <Select value={filterAgenda} onValueChange={setFilterAgenda}>
              <SelectTrigger className="w-44 h-8 text-xs bg-background">
                <SelectValue placeholder="Filter Agenda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Agenda</SelectItem>
                {agendaList.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari judul / no. surat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>
        </div>
      </div>

      {/* Grid Arsip Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredArchives.map((item) => (
          <Card key={item.id} className="flex flex-col justify-between hover:border-primary/40 transition-all group">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-muted/60 border group-hover:bg-primary/5 transition-colors">
                    {getFileIcon(item.fileType)}
                  </div>
                  <div>
                    {getKategoriBadge(item.kategori)}
                    <span className="text-[11px] font-mono text-muted-foreground block mt-0.5">
                      No: {item.nomorSurat}
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-xs">
                    <DropdownMenuItem onClick={() => setPreviewArsip(item)} className="gap-2 cursor-pointer">
                      <Eye className="h-3.5 w-3.5" />
                      Lihat Rincian
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(item)} className="gap-2 cursor-pointer">
                      <Download className="h-3.5 w-3.5" />
                      Buka Dokumen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenEdit(item)} className="gap-2 cursor-pointer">
                      <Edit className="h-3.5 w-3.5" />
                      Edit Info
                    </DropdownMenuItem>
                    {(userRole === "admin" || userRole === "ketua") && (
                      <DropdownMenuItem
                        onClick={() => setDeleteId(item.id)}
                        className="gap-2 text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus Arsip
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardTitle className="text-sm font-semibold leading-snug mt-2 line-clamp-2">
                {item.judul}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-2 mt-1">
                {item.deskripsi || "Dokumen resmi tersimpan dalam repositori arsip Karang Taruna."}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-1">
              <div className="bg-muted/30 p-2 rounded-lg border border-border/50 text-[11px] space-y-1 mt-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    Agenda:
                  </span>
                  <span className="font-medium text-foreground truncate max-w-[140px]" title={item.agendaTerkait}>
                    {item.agendaTerkait}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Tanggal:
                  </span>
                  <span>{item.tanggal}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/40 text-[11px] text-muted-foreground mt-2">
              <span>Oleh: <strong className="text-foreground">{item.uploader}</strong></span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(item)}
                className="h-7 text-xs gap-1 hover:text-primary px-2"
              >
                <Download className="h-3.5 w-3.5" />
                Buka
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredArchives.length === 0 && (
        <div className="text-center py-12 border border-dashed rounded-xl bg-card/30">
          <FolderArchive className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-sm font-semibold">Tidak ada arsip dokumen ditemukan</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Silakan unggah dokumen atau sesuaikan filter pencarian.
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. DIALOG UPLOAD / EDIT ARSIP                             */}
      {/* ========================================================= */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingArsip ? "Edit Rincian Arsip Dokumen" : "Unggah Dokumen Arsip Baru"}
            </DialogTitle>
            <DialogDescription>
              Dokumen yang diunggah akan tersimpan di cloud storage dan dapat diakses oleh pengurus.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Judul Dokumen <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Contoh: Surat Keputusan Pengurus 2026-2028"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Nomor Surat / Dokumen</Label>
                <Input
                  placeholder="001/SK-KT/I/2026"
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Kategori Arsip</Label>
                <Select value={kategori} onValueChange={(val: any) => setKategori(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sk">SK Resmi</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="lpj">LPJ Keuangan</SelectItem>
                    <SelectItem value="notulensi">Notulensi Rapat</SelectItem>
                    <SelectItem value="lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Agenda Terkait */}
            <div className="space-y-1">
              <Label className="text-xs">Terkait Agenda Organisasi (Opsional)</Label>
              <Select value={agendaId} onValueChange={setAgendaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Agenda Organisasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Umum / Tanpa Agenda Tertentu</SelectItem>
                  {agendaList.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload Component */}
            <div className="space-y-1.5">
              <Label className="text-xs">Berkas Lampiran Dokumen <span className="text-destructive">*</span></Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-muted/20"
              >
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Sedang mengunggah berkas ke Supabase storage...</span>
                  </div>
                ) : fileUrl ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{selectedFileName || "Berkas terpilih"} ({fileSize})</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                    <p className="text-xs font-medium">Klik untuk memilih file dokumen</p>
                    <p className="text-[11px] text-muted-foreground">Mendukung PDF, Word (DOCX), Excel (XLSX), Gambar</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Keterangan / Ringkasan Isi</Label>
              <Textarea
                rows={2}
                placeholder="Rincian singkat isi dan tujuan arsip dokumen..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsUploadOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isPending || isUploading}>
              {isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              {editingArsip ? "Simpan Perubahan" : "Unggah & Arsipkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 2. DIALOG PREVIEW ARSIP                                   */}
      {/* ========================================================= */}
      <Dialog open={!!previewArsip} onOpenChange={(open) => !open && setPreviewArsip(null)}>
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderArchive className="h-5 w-5 text-primary" />
              Detail Berkas Arsip
            </DialogTitle>
          </DialogHeader>

          {previewArsip && (
            <div className="space-y-3.5 py-2 text-xs">
              <div className="p-3 bg-muted/40 rounded-lg border space-y-1.5">
                <h4 className="font-bold text-sm text-foreground">{previewArsip.judul}</h4>
                <div className="flex items-center gap-2">
                  {getKategoriBadge(previewArsip.kategori)}
                  <span className="font-mono text-muted-foreground">No: {previewArsip.nomorSurat}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div className="p-2 rounded bg-muted/20 border">
                  <span>Tipe File:</span>
                  <strong className="block text-foreground mt-0.5">{previewArsip.fileType} ({previewArsip.size})</strong>
                </div>
                <div className="p-2 rounded bg-muted/20 border">
                  <span>Tanggal Input:</span>
                  <strong className="block text-foreground mt-0.5">{previewArsip.tanggal}</strong>
                </div>
              </div>

              <div className="p-2.5 rounded bg-muted/20 border text-muted-foreground space-y-1">
                <span>Agenda Organisasi:</span>
                <strong className="block text-foreground">{previewArsip.agendaTerkait}</strong>
              </div>

              {previewArsip.deskripsi && (
                <div className="p-2.5 rounded bg-muted/20 border text-muted-foreground space-y-1">
                  <span>Keterangan:</span>
                  <p className="text-foreground">{previewArsip.deskripsi}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPreviewArsip(null)}>
              Tutup
            </Button>
            {previewArsip?.fileUrl && (
              <Button onClick={() => handleDownload(previewArsip)} className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                Buka / Download File
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 3. DIALOG DELETE CONFIRMATION                             */}
      {/* ========================================================= */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Hapus Berkas Arsip?
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus arsip dokumen ini dari repositori?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-3">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isPending}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              Hapus Berkas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
