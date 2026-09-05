"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  ArrowRight,
  Users,
  Calendar,
  Building2,
  ShieldCheck,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";

export interface AgendaItem {
  id: string;
  nama: string;
  bagian: string;
  slug: string;
  periode: string;
  status: "Aktif" | "Persiapan" | "Selesai";
  totalAnggota: number;
  deskripsi: string;
  penanggungJawab: string;
}

export const INITIAL_DEPARTEMEN = [
  "Pengurus Harian",
  "Sekretariat",
  "Bendahara",
  "Acara & Kegiatan",
  "Sarana & Prasarana",
  "Humas & Publikasi",
  "Lingkungan Hidup",
  "Olahraga & Seni",
];

export const INITIAL_AGENDAS: AgendaItem[] = [
  {
    id: "1",
    nama: "Kepengurusan Inti Karang Taruna RW 05",
    bagian: "Pengurus Harian",
    slug: "utama",
    periode: "2025 – 2027",
    status: "Aktif",
    totalAnggota: 24,
    deskripsi: "Struktur organisasi induk karang taruna tingkat RW periode kerja 2 tahun.",
    penanggungJawab: "Azzam Azhari (Ketua)",
  },
  {
    id: "2",
    nama: "Kepanitiaan Peringatan HUT RI ke-81",
    bagian: "Acara & Kegiatan",
    slug: "acara",
    periode: "Juli – Agustus 2026",
    status: "Aktif",
    totalAnggota: 15,
    deskripsi: "Panitia khusus penyelenggaraan karnaval, panggung gembira, dan aneka lomba 17-an.",
    penanggungJawab: "Rian Pratama (Koordinator Acara)",
  },
  {
    id: "3",
    nama: "Panitia Ramadhan & Bakti Sosial Berkah",
    bagian: "Humas & Publikasi",
    slug: "humas",
    periode: "Februari – Maret 2026",
    status: "Selesai",
    totalAnggota: 18,
    deskripsi: "Kepanitiaan safari tarawih, buka puasa bersama anak yatim, dan pembagian paket sembako.",
    penanggungJawab: "Ahmad Zaki (Wakil Ketua)",
  },
  {
    id: "4",
    nama: "Panitia Turnamen Futsal Pemuda Antar RT",
    bagian: "Olahraga & Seni",
    slug: "olahraga",
    periode: "Mei 2026",
    status: "Persiapan",
    totalAnggota: 10,
    deskripsi: "Komite pelaksana turnamen futsal persahabatan pemuda RW 05.",
    penanggungJawab: "Fajar Nugraha",
  },
];

export function StrukturManager() {
  const [agendas, setAgendas] = useState<AgendaItem[]>(INITIAL_AGENDAS);
  const [departemens, setDepartemens] = useState<string[]>(INITIAL_DEPARTEMEN);
  const [filterStatus, setFilterStatus] = useState<"semua" | "Aktif" | "Persiapan" | "Selesai">("semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog Agenda
  const [isAgendaDialogOpen, setIsAgendaDialogOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<AgendaItem | null>(null);
  const [namaAgenda, setNamaAgenda] = useState("");
  const [bagianAgenda, setBagianAgenda] = useState(INITIAL_DEPARTEMEN[0]);
  const [periodeAgenda, setPeriodeAgenda] = useState("");
  const [statusAgenda, setStatusAgenda] = useState<"Aktif" | "Persiapan" | "Selesai">("Aktif");
  const [deskripsiAgenda, setDeskripsiAgenda] = useState("");
  const [pjAgenda, setPjAgenda] = useState("");

  // Dialog Departemen Baru
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptPj, setNewDeptPj] = useState("");

  // Delete Dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleOpenCreateAgenda = () => {
    setEditingAgenda(null);
    setNamaAgenda("");
    setBagianAgenda(departemens[0] || "Pengurus Harian");
    setPeriodeAgenda("");
    setStatusAgenda("Aktif");
    setDeskripsiAgenda("");
    setPjAgenda("");
    setIsAgendaDialogOpen(true);
  };

  const handleOpenEditAgenda = (agenda: AgendaItem) => {
    setEditingAgenda(agenda);
    setNamaAgenda(agenda.nama);
    setBagianAgenda(agenda.bagian);
    setPeriodeAgenda(agenda.periode);
    setStatusAgenda(agenda.status);
    setDeskripsiAgenda(agenda.deskripsi);
    setPjAgenda(agenda.penanggungJawab);
    setIsAgendaDialogOpen(true);
  };

  const handleSaveAgenda = () => {
    if (!namaAgenda.trim() || !periodeAgenda.trim()) return;

    if (editingAgenda) {
      setAgendas((prev) =>
        prev.map((item) =>
          item.id === editingAgenda.id
            ? {
                ...item,
                nama: namaAgenda,
                bagian: bagianAgenda,
                periode: periodeAgenda,
                status: statusAgenda,
                deskripsi: deskripsiAgenda,
                penanggungJawab: pjAgenda || item.penanggungJawab,
              }
            : item
        )
      );
    } else {
      const slug = bagianAgenda.toLowerCase().replace(/[^a-z0-9]/g, "-") || "umum";
      const newAgenda: AgendaItem = {
        id: Date.now().toString(),
        nama: namaAgenda,
        bagian: bagianAgenda,
        slug,
        periode: periodeAgenda,
        status: statusAgenda,
        totalAnggota: 1,
        deskripsi: deskripsiAgenda,
        penanggungJawab: pjAgenda || "Azzam Azhari",
      };
      setAgendas([newAgenda, ...agendas]);
    }

    setIsAgendaDialogOpen(false);
  };

  const handleSaveDepartment = () => {
    if (!newDeptName.trim()) return;
    const trimmed = newDeptName.trim();
    if (!departemens.includes(trimmed)) {
      setDepartemens([...departemens, trimmed]);
    }
    setNewDeptName("");
    setNewDeptPj("");
    setIsDeptDialogOpen(false);
  };

  const handleDeleteAgenda = () => {
    if (deleteId) {
      setAgendas((prev) => prev.filter((a) => a.id !== deleteId));
      setDeleteId(null);
    }
  };

  const filteredAgendas = agendas.filter((ag) => {
    if (filterStatus !== "semua" && ag.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNama = ag.nama.toLowerCase().includes(q);
      const matchBagian = ag.bagian.toLowerCase().includes(q);
      const matchPeriode = ag.periode.toLowerCase().includes(q);
      if (!matchNama && !matchBagian && !matchPeriode) return false;
    }
    return true;
  });

  const totalAnggotaAll = agendas.reduce((acc, curr) => acc + curr.totalAnggota, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Struktur Organisasi (Multi-Agenda)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola bagan kepengurusan dinamis, kepanitiaan event, dan integrasi departemen/seksi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 shadow-xs flex-1 sm:flex-initial text-xs h-8"
            onClick={() => setIsDeptDialogOpen(true)}
          >
            <Building2 className="h-4 w-4 text-primary" />
            <span>Tambah Departemen</span>
          </Button>
          <Button
            size="sm"
            className="gap-1.5 shadow-sm bg-primary hover:bg-primary/90 flex-1 sm:flex-initial text-xs h-8"
            onClick={handleOpenCreateAgenda}
          >
            <Plus className="h-4 w-4" />
            <span>Buat Agenda</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-card/70 border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Agenda Terdaftar</p>
              <h3 className="text-2xl font-bold mt-1">{agendas.length}</h3>
              <p className="text-[11px] text-emerald-500 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3" />
                {agendas.filter((a) => a.status === "Aktif").length} Agenda Aktif
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FolderKanban className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Anggota Ditugaskan</p>
              <h3 className="text-2xl font-bold mt-1">{totalAnggotaAll}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Tersebar di berbagai kepanitiaan</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Departemen / Seksi</p>
              <h3 className="text-2xl font-bold mt-1">{departemens.length}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Terhubung otomatis ke agenda</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(["semua", "Aktif", "Persiapan", "Selesai"] as const).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={filterStatus === status ? "default" : "ghost"}
              className="text-xs h-8 px-3 rounded-lg capitalize"
              onClick={() => setFilterStatus(status)}
            >
              {status === "semua" ? `Semua (${agendas.length})` : `${status} (${agendas.filter((a) => a.status === status).length})`}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Cari nama agenda atau periode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-muted/30"
          />
        </div>
      </div>

      {/* Agenda Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAgendas.map((item) => (
          <Card
            key={item.id}
            className="hover:shadow-md transition-all flex flex-col justify-between border group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant={
                    item.status === "Aktif"
                      ? "default"
                      : item.status === "Persiapan"
                      ? "outline"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {item.status}
                </Badge>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    {item.totalAnggota} Anggota
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEditAgenda(item)}>
                        <Edit className="h-3.5 w-3.5 mr-2" />
                        <span>Edit Agenda</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(item.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        <span>Hapus Agenda</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardTitle className="text-base sm:text-lg mt-2 group-hover:text-primary transition-colors leading-snug">
                {item.nama}
              </CardTitle>

              <CardDescription className="text-xs leading-relaxed line-clamp-2 mt-1">
                {item.deskripsi}
              </CardDescription>

              <div className="space-y-1 pt-2 border-t mt-3 text-xs text-muted-foreground">
                <p className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Bagian: <span className="font-medium text-foreground">{item.bagian}</span>
                </p>
                <p className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  Periode: <span className="font-medium text-foreground">{item.periode}</span>
                </p>
                <p className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  PJ: <span className="font-medium text-foreground">{item.penanggungJawab}</span>
                </p>
              </div>
            </CardHeader>

            <CardContent className="pt-0 pb-4">
              <Link href={`/struktur/${item.slug}/agenda/${item.id}`}>
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs group-hover:border-primary group-hover:text-primary">
                  <span>Buka Bagan & Kelola Anggota</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog Buat / Edit Agenda */}
      <Dialog open={isAgendaDialogOpen} onOpenChange={setIsAgendaDialogOpen}>
        <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              <span>{editingAgenda ? "Edit Agenda Organisasi" : "Buat Agenda / Kepanitiaan Baru"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Agenda ini akan otomatis terhubung dengan struktur bagan kepengurusan dan modul terkait.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Agenda / Kepanitiaan</Label>
              <Input
                value={namaAgenda}
                onChange={(e) => setNamaAgenda(e.target.value)}
                placeholder="Contoh: Kepanitiaan Peringatan HUT RI ke-81"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Bagian / Departemen Induk</Label>
                <Select value={bagianAgenda} onValueChange={setBagianAgenda}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departemens.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Status Agenda</Label>
                <Select
                  value={statusAgenda}
                  onValueChange={(v: "Aktif" | "Persiapan" | "Selesai") => setStatusAgenda(v)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif Berjalan</SelectItem>
                    <SelectItem value="Persiapan">Tahap Persiapan</SelectItem>
                    <SelectItem value="Selesai">Selesai / Arsip</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Periode Waktu Pelaksanaan</Label>
                <Input
                  value={periodeAgenda}
                  onChange={(e) => setPeriodeAgenda(e.target.value)}
                  placeholder="Contoh: Juli – Agustus 2026"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Koordinator / Penanggung Jawab</Label>
                <Input
                  value={pjAgenda}
                  onChange={(e) => setPjAgenda(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Deskripsi Singkat / Tujuan Kegiatan</Label>
              <Textarea
                value={deskripsiAgenda}
                onChange={(e) => setDeskripsiAgenda(e.target.value)}
                placeholder="Jelaskan ruang lingkup dan sasaran kepanitiaan ini..."
                rows={3}
                className="text-xs leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsAgendaDialogOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSaveAgenda} disabled={!namaAgenda.trim() || !periodeAgenda.trim()}>
              {editingAgenda ? "Simpan Perubahan" : "Buat Agenda"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Tambah Departemen Baru */}
      <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span>Tambah Departemen / Seksi Baru</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Departemen baru akan langsung terintegrasi dan dapat dipilih pada semua agenda kerja.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Departemen / Seksi</Label>
              <Input
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="Contoh: Media Kreatif & Dokumentasi"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Penanggung Jawab Divisi (Opsional)</Label>
              <Input
                value={newDeptPj}
                onChange={(e) => setNewDeptPj(e.target.value)}
                placeholder="Contoh: Farhan Maulana"
                className="text-xs"
              />
            </div>

            <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Departemen yang sudah ada:
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {departemens.map((d) => (
                  <Badge key={d} variant="secondary" className="text-[10px]">
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsDeptDialogOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSaveDepartment} disabled={!newDeptName.trim()}>
              Simpan Departemen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Hapus Agenda</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus agenda ini? Susunan bagan yang terkait akan ikut terhapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteAgenda}>
              Hapus Permanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
