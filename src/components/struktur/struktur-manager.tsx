"use client";

import { useState, useTransition } from "react";
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
  Layers,
  Loader2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { AgendaData, createAgenda, updateAgenda, deleteAgenda } from "@/actions/agenda";

interface BagianOption {
  id: string;
  nama: string;
  slug: string;
}

interface StrukturManagerProps {
  initialAgendas?: AgendaData[];
  bagianList?: BagianOption[];
  userRole?: string;
}

export function StrukturManager({
  initialAgendas = [],
  bagianList = [],
  userRole = "anggota",
}: StrukturManagerProps) {
  const [agendas, setAgendas] = useState<AgendaData[]>(initialAgendas);
  const [filterStatus, setFilterStatus] = useState<"semua" | "Aktif" | "Persiapan" | "Selesai">("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dialog State
  const [isAgendaDialogOpen, setIsAgendaDialogOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<AgendaData | null>(null);
  const [namaAgenda, setNamaAgenda] = useState("");
  const [bagianId, setBagianId] = useState(bagianList[0]?.id || "");
  const [periodeAgenda, setPeriodeAgenda] = useState("");
  const [statusAgenda, setStatusAgenda] = useState<"Aktif" | "Persiapan" | "Selesai">("Aktif");
  const [deskripsiAgenda, setDeskripsiAgenda] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isAdminOrKetua = userRole === "admin" || userRole === "ketua";

  const handleOpenCreateAgenda = () => {
    setEditingAgenda(null);
    setNamaAgenda("");
    setBagianId(bagianList[0]?.id || "");
    setPeriodeAgenda("Periode 2025–2027");
    setStatusAgenda("Aktif");
    setDeskripsiAgenda("");
    setErrorMessage(null);
    setIsAgendaDialogOpen(true);
  };

  const handleOpenEditAgenda = (agenda: AgendaData) => {
    setEditingAgenda(agenda);
    setNamaAgenda(agenda.nama);
    setBagianId(agenda.bagianId);
    setPeriodeAgenda(agenda.periode);
    setStatusAgenda(agenda.status);
    setDeskripsiAgenda(agenda.deskripsi);
    setErrorMessage(null);
    setIsAgendaDialogOpen(true);
  };

  const handleSaveAgenda = () => {
    if (!namaAgenda.trim()) {
      setErrorMessage("Nama agenda wajib diisi.");
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("nama_agenda", namaAgenda);
      formData.set("bagian_id", bagianId);
      formData.set("deskripsi", deskripsiAgenda);
      formData.set("status", statusAgenda);

      if (editingAgenda) {
        const res = await updateAgenda(editingAgenda.id, formData);
        if (res.error) {
          setErrorMessage(res.error);
          return;
        }

        const selectedBagian = bagianList.find((b) => b.id === bagianId);
        setAgendas((prev) =>
          prev.map((item) =>
            item.id === editingAgenda.id
              ? {
                  ...item,
                  nama: namaAgenda,
                  bagian: selectedBagian?.nama || item.bagian,
                  bagianSlug: selectedBagian?.slug || item.bagianSlug,
                  bagianId,
                  status: statusAgenda,
                  deskripsi: deskripsiAgenda,
                }
              : item
          )
        );
      } else {
        formData.set("nama_periode", periodeAgenda || "Periode 2025–2027");
        const res = await createAgenda(formData);
        if (res.error) {
          setErrorMessage(res.error);
          return;
        }

        const selectedBagian = bagianList.find((b) => b.id === bagianId);
        const newAgenda: AgendaData = {
          id: res.agendaId || Date.now().toString(),
          nama: namaAgenda,
          bagian: selectedBagian?.nama || "Umum",
          bagianSlug: selectedBagian?.slug || "umum",
          bagianId,
          periode: periodeAgenda || "Periode 2025–2027",
          activePeriodeId: null,
          status: statusAgenda,
          totalAnggota: 0,
          deskripsi: deskripsiAgenda,
          penanggungJawab: `Pengurus (${userRole})`,
          createdAt: new Date().toISOString(),
        };
        setAgendas([newAgenda, ...agendas]);
      }

      setIsAgendaDialogOpen(false);
    });
  };

  const handleDeleteAgenda = () => {
    if (!deleteId) return;

    startTransition(async () => {
      const res = await deleteAgenda(deleteId);
      if (res.error) {
        alert(res.error);
        return;
      }
      setAgendas((prev) => prev.filter((a) => a.id !== deleteId));
      setDeleteId(null);
    });
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
            Daftar kepengurusan dan agenda panitia karang taruna. Terbuka untuk seluruh anggota dan pengurus.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {isAdminOrKetua ? (
            <Button
              size="sm"
              className="gap-1.5 shadow-sm bg-primary hover:bg-primary/90 flex-1 sm:flex-initial text-xs h-8"
              onClick={handleOpenCreateAgenda}
            >
              <Plus className="h-4 w-4" />
              <span>Buat Agenda Baru</span>
            </Button>
          ) : (
            <Badge variant="outline" className="text-xs py-1 px-2.5 gap-1.5 text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Pembuatan agenda khusus Ketua & Admin</span>
            </Badge>
          )}
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
              <p className="text-[11px] text-muted-foreground mt-0.5">Terdaftar dalam bagan periode</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Departemen / Bagian</p>
              <h3 className="text-2xl font-bold mt-1">{bagianList.length}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Bagian aktif dalam sistem</p>
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
            placeholder="Cari nama agenda atau bagian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-muted/30"
          />
        </div>
      </div>

      {/* Agenda Cards Grid */}
      {filteredAgendas.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card/40">
          <FolderKanban className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-semibold">Belum Ada Agenda Organisasi</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {isAdminOrKetua
              ? "Klik tombol 'Buat Agenda Baru' di atas untuk membuat kepanitiaan atau susunan pengurus."
              : "Belum ada agenda organisasi yang didaftarkan oleh pengurus."}
          </p>
        </div>
      ) : (
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
                    {isAdminOrKetua && (
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
                    )}
                  </div>
                </div>

                <CardTitle className="text-base sm:text-lg mt-2 group-hover:text-primary transition-colors leading-snug">
                  {item.nama}
                </CardTitle>

                <CardDescription className="text-xs leading-relaxed line-clamp-2 mt-1">
                  {item.deskripsi || "Tidak ada deskripsi tambahan."}
                </CardDescription>

                <div className="space-y-1 pt-2 border-t mt-3 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Bagian: <span className="font-medium text-foreground">{item.bagian}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Periode Aktif: <span className="font-medium text-foreground">{item.periode}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                    Dibuat: <span className="font-medium text-foreground">{item.penanggungJawab}</span>
                  </p>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-4">
                <Link href={`/struktur/${item.bagianSlug}/agenda/${item.id}`}>
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs group-hover:border-primary group-hover:text-primary">
                    <span>Buka Bagan & Kelola Anggota</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Buat / Edit Agenda */}
      <Dialog open={isAgendaDialogOpen} onOpenChange={setIsAgendaDialogOpen}>
        <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              <span>{editingAgenda ? "Edit Agenda Organisasi" : "Buat Agenda / Kepanitiaan Baru"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Agenda ini akan otomatis terhubung dengan struktur bagan kepengurusan dan data anggota.
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Agenda / Kepanitiaan *</Label>
              <Input
                value={namaAgenda}
                onChange={(e) => setNamaAgenda(e.target.value)}
                placeholder="Contoh: Kepanitiaan Peringatan HUT RI ke-81"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Bagian Organisasi *</Label>
                <Select value={bagianId} onValueChange={setBagianId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Pilih bagian..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bagianList.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.nama}
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

            {!editingAgenda && (
              <div className="space-y-1.5">
                <Label className="text-xs">Nama Periode Awal</Label>
                <Input
                  value={periodeAgenda}
                  onChange={(e) => setPeriodeAgenda(e.target.value)}
                  placeholder="Contoh: Periode 2025–2027 atau Juli - Agustus 2026"
                  className="text-xs"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Deskripsi Singkat (Opsional)</Label>
              <Textarea
                value={deskripsiAgenda}
                onChange={(e) => setDeskripsiAgenda(e.target.value)}
                placeholder="Tuliskan tujuan agenda atau tugas kepanitiaan..."
                rows={3}
                className="text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setIsAgendaDialogOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="text-xs bg-primary hover:bg-primary/90 gap-1.5"
              onClick={handleSaveAgenda}
              disabled={isPending}
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{editingAgenda ? "Simpan Perubahan" : "Buat Agenda"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Hapus Agenda Organisasi?</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tindakan ini akan menghapus agenda ini beserta periode dan susunan anggota di dalamnya. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setDeleteId(null)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs gap-1.5"
              onClick={handleDeleteAgenda}
              disabled={isPending}
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Ya, Hapus</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
