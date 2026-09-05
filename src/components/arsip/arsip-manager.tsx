"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
} from "lucide-react";

export interface ArsipItem {
  id: string;
  judul: string;
  nomorSurat: string;
  kategori: "sk" | "proposal" | "lpj" | "notulensi" | "lainnya";
  fileType: "PDF" | "DOCX" | "XLSX";
  size: string;
  tanggal: string;
  agendaTerkait: string;
  uploader: string;
  deskripsi: string;
}

const INITIAL_ARCHIVES: ArsipItem[] = [
  {
    id: "1",
    judul: "Surat Keputusan (SK) Pengurus Karang Taruna RW 05 Periode 2025–2027",
    nomorSurat: "001/SK-KT/I/2025",
    kategori: "sk",
    fileType: "PDF",
    size: "2.4 MB",
    tanggal: "15 Jan 2025",
    agendaTerkait: "Kepengurusan Inti Karang Taruna RW 05",
    uploader: "Dewi (Sekretariat)",
    deskripsi: "SK resmi pengukuhan kepengurusan karang taruna ditandatangani oleh Ketua RW 05 dan Lurah.",
  },
  {
    id: "2",
    judul: "Laporan Pertanggungjawaban (LPJ) Keuangan Panitia HUT RI ke-80",
    nomorSurat: "014/LPJ-PAN/VIII/2025",
    kategori: "lpj",
    fileType: "PDF",
    size: "4.1 MB",
    tanggal: "30 Agu 2025",
    agendaTerkait: "Kepanitiaan Peringatan HUT RI ke-80",
    uploader: "Rian (Acara)",
    deskripsi: "Rekapitulasi anggaran, bukti nota pengeluaran, dan dokumentasi hasil lomba 17 Agustus.",
  },
  {
    id: "3",
    judul: "Proposal Kegiatan Bakti Sosial & Safari Tarawih Ramadan 1447H",
    nomorSurat: "005/PROP-KT/III/2026",
    kategori: "proposal",
    fileType: "DOCX",
    size: "1.2 MB",
    tanggal: "10 Mar 2026",
    agendaTerkait: "Panitia Ramadhan & Bakti Sosial Berkah",
    uploader: "Ahmad Zaki",
    deskripsi: "Rancangan anggaran dan permohonan donasi paket sembako untuk santunan 50 anak yatim & dhuafa.",
  },
  {
    id: "4",
    judul: "Notulensi Rapat Kerja Pleno Awal Tahun 2026",
    nomorSurat: "002/NOT-PLENO/I/2026",
    kategori: "notulensi",
    fileType: "PDF",
    size: "850 KB",
    tanggal: "08 Jan 2026",
    agendaTerkait: "Kepengurusan Inti Karang Taruna RW 05",
    uploader: "Dewi (Sekretariat)",
    deskripsi: "Notulen lengkap pembahasan program kerja seksi olahraga, lingkungan, dan kesepakatan kas bulanan.",
  },
  {
    id: "5",
    judul: "Rekap Inventarisasi Sarana Olahraga & Lapangan Pemuda",
    nomorSurat: "003/INV-OR/II/2026",
    kategori: "lainnya",
    fileType: "XLSX",
    size: "620 KB",
    tanggal: "14 Feb 2026",
    agendaTerkait: "Panitia Turnamen Futsal Pemuda Antar RT",
    uploader: "Fajar Nugraha",
    deskripsi: "Tabel kondisi bola, jaring gawang, rompi, dan peralatan lapangan bulutangkis balai warga.",
  },
];

const AGENDA_OPTIONS = [
  "Umum / Organisasi",
  "Kepengurusan Inti Karang Taruna RW 05",
  "Kepanitiaan Peringatan HUT RI ke-81",
  "Panitia Ramadhan & Bakti Sosial Berkah",
  "Panitia Turnamen Futsal Pemuda Antar RT",
];

export function ArsipManager() {
  const [archives, setArchives] = useState<ArsipItem[]>(INITIAL_ARCHIVES);
  const [activeCategory, setActiveCategory] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAgenda, setFilterAgenda] = useState("all");

  // Dialog State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingArsip, setEditingArsip] = useState<ArsipItem | null>(null);
  const [previewArsip, setPreviewArsip] = useState<ArsipItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form Fields
  const [judul, setJudul] = useState("");
  const [nomorSurat, setNomorSurat] = useState("");
  const [kategori, setKategori] = useState<"sk" | "proposal" | "lpj" | "notulensi" | "lainnya">("proposal");
  const [fileType, setFileType] = useState<"PDF" | "DOCX" | "XLSX">("PDF");
  const [agendaTerkait, setAgendaTerkait] = useState(AGENDA_OPTIONS[0]);
  const [deskripsi, setDeskripsi] = useState("");
  const [fileName, setFileName] = useState("dokumen-arsip.pdf");

  const handleOpenUpload = () => {
    setEditingArsip(null);
    setJudul("");
    setNomorSurat("");
    setKategori("proposal");
    setFileType("PDF");
    setAgendaTerkait(AGENDA_OPTIONS[0]);
    setDeskripsi("");
    setFileName("dokumen-arsip.pdf");
    setIsUploadOpen(true);
  };

  const handleOpenEdit = (item: ArsipItem) => {
    setEditingArsip(item);
    setJudul(item.judul);
    setNomorSurat(item.nomorSurat);
    setKategori(item.kategori);
    setFileType(item.fileType);
    setAgendaTerkait(item.agendaTerkait);
    setDeskripsi(item.deskripsi);
    setFileName(`${item.judul.slice(0, 20)}.${item.fileType.toLowerCase()}`);
    setIsUploadOpen(true);
  };

  const handleSave = () => {
    if (!judul.trim()) return;

    if (editingArsip) {
      setArchives((prev) =>
        prev.map((a) =>
          a.id === editingArsip.id
            ? {
                ...a,
                judul,
                nomorSurat: nomorSurat || "N/A",
                kategori,
                fileType,
                agendaTerkait,
                deskripsi,
              }
            : a
        )
      );
    } else {
      const newArsip: ArsipItem = {
        id: Date.now().toString(),
        judul,
        nomorSurat: nomorSurat || "N/A",
        kategori,
        fileType,
        size: "1.5 MB",
        tanggal: "Hari ini",
        agendaTerkait,
        uploader: "Azzam Azhari (Ketua)",
        deskripsi,
      };
      setArchives([newArsip, ...archives]);
    }

    setIsUploadOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      setArchives((prev) => prev.filter((a) => a.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleDownload = (item: ArsipItem) => {
    // Mock download action
    alert(`Mengunduh file: ${item.judul} (${item.fileType})`);
  };

  const filteredArchives = archives.filter((item) => {
    if (activeCategory !== "semua" && item.kategori !== activeCategory) return false;
    if (filterAgenda !== "all" && item.agendaTerkait !== filterAgenda) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchJudul = item.judul.toLowerCase().includes(q);
      const matchNo = item.nomorSurat.toLowerCase().includes(q);
      const matchDesc = item.deskripsi.toLowerCase().includes(q);
      const matchAgenda = item.agendaTerkait.toLowerCase().includes(q);
      if (!matchJudul && !matchNo && !matchDesc && !matchAgenda) return false;
    }
    return true;
  });

  const getFileIcon = (type: "PDF" | "DOCX" | "XLSX") => {
    if (type === "PDF") return <FileCheck className="h-5 w-5 text-rose-500" />;
    if (type === "DOCX") return <FileText className="h-5 w-5 text-blue-500" />;
    return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
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
              <p className="text-xs text-muted-foreground font-medium">Ruang Penyimpanan Terpakai</p>
              <h3 className="text-2xl font-bold mt-0.5">9.17 MB</h3>
              <p className="text-[11px] text-emerald-500 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3" />
                Kuota Aman (1 GB Tersedia)
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <HardDrive className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Kategori Terbanyak</p>
              <h3 className="text-2xl font-bold mt-0.5">Surat Keputusan (SK)</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Dokumen legalitas organisasi</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <FileCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card border rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "semua", label: "Semua" },
            { id: "sk", label: "SK Resmi" },
            { id: "proposal", label: "Proposal" },
            { id: "lpj", label: "LPJ" },
            { id: "notulensi", label: "Notulensi" },
            { id: "lainnya", label: "Lainnya" },
          ].map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={activeCategory === cat.id ? "default" : "ghost"}
              className="text-xs h-8 px-3 rounded-lg capitalize"
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.id === "semua"
                ? `Semua (${archives.length})`
                : `${cat.label} (${archives.filter((a) => a.kategori === cat.id).length})`}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari judul dokumen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-muted/30 w-full"
            />
          </div>
          <Select value={filterAgenda} onValueChange={setFilterAgenda}>
            <SelectTrigger className="h-8 text-xs w-[130px] shrink-0">
              <SelectValue placeholder="Semua Agenda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Agenda</SelectItem>
              {AGENDA_OPTIONS.map((ag) => (
                <SelectItem key={ag} value={ag}>
                  {ag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Archives List */}
      <div className="space-y-3">
        {filteredArchives.length === 0 ? (
          <Card className="border-dashed py-12 text-center">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Archive className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold">Tidak Ada Berkas Ditemukan</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Silakan ubah kata kunci pencarian atau unggah dokumen pertama Anda.
              </p>
              <Button size="sm" onClick={handleOpenUpload} className="mt-2">
                Upload Arsip Sekarang
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredArchives.map((item) => (
            <Card key={item.id} className="hover:shadow-sm hover:border-primary/30 transition-all">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-muted/50 border shrink-0 mt-0.5">
                    {getFileIcon(item.fileType)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-sm sm:text-base leading-snug hover:text-primary transition-colors cursor-pointer" onClick={() => setPreviewArsip(item)}>
                        {item.judul}
                      </h4>
                      {getKategoriBadge(item.kategori)}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {item.deskripsi}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground pt-0.5">
                      <span>No: <strong className="text-foreground font-mono">{item.nomorSurat}</strong></span>
                      <span>• Format: <strong className="text-foreground">{item.fileType}</strong></span>
                      <span>• Ukuran: <strong className="text-foreground">{item.size}</strong></span>
                      <span>• Diunggah: <strong className="text-foreground">{item.tanggal}</strong></span>
                      <span>• Agenda: <strong className="text-primary">{item.agendaTerkait}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-8"
                    onClick={() => setPreviewArsip(item)}
                  >
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Detail</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-8 text-primary hover:text-primary"
                    onClick={() => handleDownload(item)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Unduh</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(item)}>
                        <Edit className="h-3.5 w-3.5 mr-2" />
                        <span>Edit Informasi</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(item.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        <span>Hapus Arsip</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Upload / Edit Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <span>{editingArsip ? "Edit Berkas Arsip" : "Unggah Dokumen Organisasi Baru"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Pastikan berkas telah disetujui atau ditandatangani oleh pihak berwenang sebelum diarsipkan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Judul Lengkap Dokumen</Label>
              <Input
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: Surat Keputusan Pembentukan Panitia 17 Agustus 2026"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nomor Surat / Arsip</Label>
                <Input
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                  placeholder="Contoh: 004/SK-KT/VII/2026"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Kategori Dokumen</Label>
                <Select
                  value={kategori}
                  onValueChange={(val: "sk" | "proposal" | "lpj" | "notulensi" | "lainnya") => setKategori(val)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sk">Surat Keputusan (SK)</SelectItem>
                    <SelectItem value="proposal">Proposal Kegiatan</SelectItem>
                    <SelectItem value="lpj">Laporan Pertanggungjawaban (LPJ)</SelectItem>
                    <SelectItem value="notulensi">Notulensi Rapat</SelectItem>
                    <SelectItem value="lainnya">Dokumen Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Terkait Agenda Organisasi</Label>
                <Select value={agendaTerkait} onValueChange={setAgendaTerkait}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENDA_OPTIONS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Format Berkas</Label>
                <Select
                  value={fileType}
                  onValueChange={(val: "PDF" | "DOCX" | "XLSX") => setFileType(val)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF (.pdf)</SelectItem>
                    <SelectItem value="DOCX">Microsoft Word (.docx)</SelectItem>
                    <SelectItem value="XLSX">Microsoft Excel (.xlsx)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Pilih File Berkas</Label>
              <div className="border-2 border-dashed rounded-xl p-4 text-center hover:bg-muted/30 transition-colors cursor-pointer">
                <File className="h-6 w-6 text-muted-foreground mx-auto mb-1.5" />
                <p className="text-xs font-medium text-foreground">{fileName}</p>
                <p className="text-[11px] text-muted-foreground">Klik untuk ganti file (Maksimal 25MB)</p>
                <input
                  type="file"
                  className="hidden"
                  id="archive-file-input"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFileName(f.name);
                  }}
                />
                <label
                  htmlFor="archive-file-input"
                  className="inline-block mt-2 px-3 py-1 bg-muted hover:bg-muted/80 rounded-md text-[11px] font-medium cursor-pointer"
                >
                  Pilih dari Komputer
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Catatan Ringkas / Keterangan</Label>
              <Textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Rincian catatan tentang isi berkas ini..."
                rows={2}
                className="text-xs leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!judul.trim()}>
              {editingArsip ? "Simpan Perubahan" : "Unggah Berkas"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Detail Modal */}
      <Dialog open={!!previewArsip} onOpenChange={(open) => !open && setPreviewArsip(null)}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          {previewArsip && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {getFileIcon(previewArsip.fileType)}
                  {getKategoriBadge(previewArsip.kategori)}
                </div>
                <DialogTitle className="text-base mt-2 leading-snug">
                  {previewArsip.judul}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Nomor Arsip: <strong className="font-mono text-foreground">{previewArsip.nomorSurat}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs">
                <div className="p-3 bg-muted/40 rounded-xl space-y-1.5">
                  <p className="text-muted-foreground">Deskripsi / Ringkasan Dokumen:</p>
                  <p className="text-foreground leading-relaxed">{previewArsip.deskripsi || "Tidak ada catatan tambahan."}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <p>Ukuran: <strong className="text-foreground">{previewArsip.size}</strong></p>
                  <p>Format: <strong className="text-foreground">{previewArsip.fileType}</strong></p>
                  <p>Tanggal Upload: <strong className="text-foreground">{previewArsip.tanggal}</strong></p>
                  <p>Diunggah Oleh: <strong className="text-foreground">{previewArsip.uploader}</strong></p>
                </div>

                <div className="p-2 border rounded-lg text-[11px] flex items-center justify-between">
                  <span className="text-muted-foreground">Terkait Agenda:</span>
                  <Badge variant="outline" className="text-[10px] text-primary">{previewArsip.agendaTerkait}</Badge>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" size="sm" onClick={() => setPreviewArsip(null)}>
                  Tutup
                </Button>
                <Button size="sm" className="gap-1.5" onClick={() => handleDownload(previewArsip)}>
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh Dokumen</span>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Hapus Berkas Arsip</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus berkas arsip ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Hapus Berkas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
