"use client";

import { useState, useTransition, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  UserPlus,
  Search,
  Phone,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Download,
  Filter,
  Shield,
  Loader2,
  AlertCircle,
  Camera,
  X,
  Building2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { AnggotaDetail, createAnggota, updateAnggota, deleteAnggota } from "@/actions/anggota";

interface BagianItem {
  id: string;
  nama: string;
  slug: string;
}

interface PeriodeOption {
  id: string;
  nama: string;
  isAktif: boolean;
  bagianId: string | null;
}

interface AnggotaManagerProps {
  initialMembers?: AnggotaDetail[];
  metadata?: {
    daftarBagian: BagianItem[];
    daftarPeriode: PeriodeOption[];
  };
  userRole?: string;
}

const RT_OPTIONS = ["Semua RT", "RT 01", "RT 02", "RT 03", "RT 04", "RT 05", "RT 06"];

export function AnggotaManager({
  initialMembers = [],
  metadata = { daftarBagian: [], daftarPeriode: [] },
  userRole = "anggota",
}: AnggotaManagerProps) {
  const [members, setMembers] = useState<AnggotaDetail[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRt, setFilterRt] = useState("Semua RT");
  const [filterStatus, setFilterStatus] = useState<"semua" | "Aktif" | "Alumni" | "Cuti">("semua");
  const [filterBagian, setFilterBagian] = useState<string>("semua");

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AnggotaDetail | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form Fields
  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("Anggota");
  const [bagianId, setBagianId] = useState<string>("");
  const [periodeId, setPeriodeId] = useState<string>("");
  const [rt, setRt] = useState("RT 03 / RW 05");
  const [kontak, setKontak] = useState("");
  const [status, setStatus] = useState<"Aktif" | "Alumni" | "Cuti">("Aktif");

  // Photo State
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [removeFoto, setRemoveFoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdminOrKetua = userRole === "admin" || userRole === "ketua";

  const handleOpenCreate = () => {
    setEditingMember(null);
    setNama("");
    setJabatan("Anggota");
    setBagianId(metadata.daftarBagian[0]?.id || "");
    setPeriodeId(metadata.daftarPeriode.find((p) => p.isAktif)?.id || "");
    setRt("RT 01 / RW 05");
    setKontak("");
    setStatus("Aktif");
    setFotoFile(null);
    setFotoPreview(null);
    setRemoveFoto(false);
    setErrorMessage(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (m: AnggotaDetail) => {
    setEditingMember(m);
    setNama(m.nama);
    setJabatan(m.jabatan);
    setBagianId(m.bagianId || "");
    setPeriodeId(m.periodeId || "");
    setRt(m.rt_rw);
    setKontak(m.kontak);
    setStatus(m.status);
    setFotoFile(null);
    setFotoPreview(m.foto_url);
    setRemoveFoto(false);
    setErrorMessage(null);
    setIsDialogOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran foto maksimal 5MB.");
        return;
      }
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
      setRemoveFoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
    setRemoveFoto(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    if (!nama.trim() || !kontak.trim()) {
      setErrorMessage("Nama dan kontak wajib diisi.");
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("nama", nama);
      formData.set("jabatan", jabatan);
      formData.set("rt_rw", rt);
      formData.set("kontak", kontak);
      formData.set("status", status);
      if (bagianId) formData.set("bagian_id", bagianId);
      if (periodeId && periodeId !== "none") formData.set("periode_id", periodeId);
      if (fotoFile) formData.set("foto", fotoFile);
      if (removeFoto) formData.set("removeFoto", "true");

      if (editingMember) {
        const res = await updateAnggota(editingMember.id, formData);
        if (res.error) {
          setErrorMessage(res.error);
          return;
        }

        const selectedBagian = metadata.daftarBagian.find((b) => b.id === bagianId);
        const selectedPeriode = metadata.daftarPeriode.find((p) => p.id === periodeId);

        setMembers((prev) =>
          prev.map((item) =>
            item.id === editingMember.id
              ? {
                  ...item,
                  nama,
                  jabatan,
                  bagian: selectedBagian?.nama || item.bagian,
                  bagianId: bagianId || null,
                  periode: selectedPeriode?.nama || item.periode,
                  periodeId: periodeId || null,
                  rt_rw: rt,
                  kontak,
                  status,
                  foto_url: removeFoto ? null : fotoPreview || item.foto_url,
                }
              : item
          )
        );
      } else {
        const res = await createAnggota(formData);
        if (res.error) {
          setErrorMessage(res.error);
          return;
        }

        const selectedBagian = metadata.daftarBagian.find((b) => b.id === bagianId);
        const selectedPeriode = metadata.daftarPeriode.find((p) => p.id === periodeId);

        const newMember: AnggotaDetail = res.anggota
          ? {
              ...res.anggota,
              bagian: selectedBagian?.nama || "Umum",
              bagianId: bagianId || null,
              periode: selectedPeriode?.nama || "Anggota Umum",
              periodeId: periodeId || null,
              agendaId: null,
              agendaNama: "-",
              tanggalBergabung: "Baru saja",
              createdAt: new Date().toISOString(),
            }
          : {
              id: Date.now().toString(),
              nama,
              jabatan,
              bagian: selectedBagian?.nama || "Umum",
              bagianId: bagianId || null,
              periode: selectedPeriode?.nama || "Anggota Umum",
              periodeId: periodeId || null,
              agendaId: null,
              agendaNama: "-",
              rt_rw: rt,
              kontak,
              status,
              foto_url: fotoPreview || null,
              tanggalBergabung: "Baru saja",
              createdAt: new Date().toISOString(),
            };

        setMembers([newMember, ...members]);
      }

      setIsDialogOpen(false);
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;

    startTransition(async () => {
      const res = await deleteAnggota(deleteId);
      if (res.error) {
        alert(res.error);
        return;
      }
      setMembers((prev) => prev.filter((m) => m.id !== deleteId));
      setDeleteId(null);
    });
  };

  const handleExportCsv = () => {
    const headers = ["Nama", "Jabatan", "Bagian", "RT/RW", "Kontak", "Status", "Periode", "Tanggal Bergabung"];
    const rows = filteredMembers.map((m) => [
      `"${m.nama.replace(/"/g, '""')}"`,
      `"${m.jabatan.replace(/"/g, '""')}"`,
      `"${m.bagian.replace(/"/g, '""')}"`,
      `"${m.rt_rw.replace(/"/g, '""')}"`,
      `"${m.kontak.replace(/"/g, '""')}"`,
      `"${m.status}"`,
      `"${(m.periode || "").replace(/"/g, '""')}"`,
      `"${m.tanggalBergabung}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `data_anggota_karang_taruna_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMembers = members.filter((m) => {
    if (filterStatus !== "semua" && m.status !== filterStatus) return false;
    if (filterRt !== "Semua RT" && !m.rt_rw.includes(filterRt)) return false;
    if (filterBagian !== "semua" && m.bagianId !== filterBagian) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNama = m.nama.toLowerCase().includes(q);
      const matchJabatan = m.jabatan.toLowerCase().includes(q);
      const matchBagian = m.bagian.toLowerCase().includes(q);
      const matchRt = m.rt_rw.toLowerCase().includes(q);
      if (!matchNama && !matchJabatan && !matchBagian && !matchRt) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Data Anggota Karang Taruna</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Database keanggotaan warga pemuda lengkap dengan domisili RT/RW, penugasan bagian, dan status kepengurusan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 shadow-xs text-xs h-8 flex-1 sm:flex-initial"
            onClick={handleExportCsv}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor CSV</span>
          </Button>
          {isAdminOrKetua && (
            <Button
              size="sm"
              className="gap-1.5 shadow-sm bg-primary hover:bg-primary/90 text-xs h-8 flex-1 sm:flex-initial"
              onClick={handleOpenCreate}
            >
              <UserPlus className="h-4 w-4" />
              <span>Tambah Anggota</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border rounded-xl p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari nama, jabatan, atau RT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-muted/30"
            />
          </div>

          <Select value={filterRt} onValueChange={setFilterRt}>
            <SelectTrigger className="h-8 text-xs w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RT_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {metadata.daftarBagian.length > 0 && (
            <Select value={filterBagian} onValueChange={setFilterBagian}>
              <SelectTrigger className="h-8 text-xs w-[130px]">
                <SelectValue placeholder="Bagian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Bagian</SelectItem>
                {metadata.daftarBagian.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(["semua", "Aktif", "Alumni", "Cuti"] as const).map((st) => (
            <Button
              key={st}
              size="sm"
              variant={filterStatus === st ? "default" : "ghost"}
              className="text-xs h-8 px-3 rounded-lg capitalize"
              onClick={() => setFilterStatus(st)}
            >
              {st === "semua" ? `Semua (${members.length})` : `${st} (${members.filter((m) => m.status === st).length})`}
            </Button>
          ))}
        </div>
      </div>

      {/* Member Cards / Table */}
      <Card className="border shadow-xs overflow-hidden">
        <CardHeader className="p-4 pb-2 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Daftar Keanggotaan ({filteredMembers.length})</span>
            </CardTitle>
            <span className="text-xs text-muted-foreground">Karang Taruna RW 05</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card List (< md) */}
          <div className="md:hidden divide-y divide-border/60">
            {filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                Tidak ada anggota yang cocok dengan filter atau pencarian.
              </div>
            ) : (
              filteredMembers.map((m) => (
                <div key={m.id} className="p-3.5 space-y-2 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {m.foto_url ? (
                        <img
                          src={m.foto_url}
                          alt={m.nama}
                          className="w-9 h-9 rounded-full object-cover border shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {m.nama.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-xs sm:text-sm text-foreground truncate">{m.nama}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{m.jabatan} • {m.bagian}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        m.status === "Aktif"
                          ? "default"
                          : m.status === "Alumni"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px] py-0 px-2 shrink-0"
                    >
                      {m.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary shrink-0" />
                      {m.rt_rw}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="h-3 w-3 text-emerald-500 shrink-0" />
                      {m.kontak}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-muted-foreground">
                      {m.periode}
                    </span>
                    <div className="flex items-center gap-1">
                      <a
                        href={`https://wa.me/${m.kontak.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2.5 gap-1 text-emerald-600 dark:text-emerald-400"
                        >
                          <Phone className="h-3 w-3" />
                          <span>WA</span>
                        </Button>
                      </a>
                      {isAdminOrKetua && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2"
                            onClick={() => handleOpenEdit(m)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(m.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/30 border-b text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 font-medium">Anggota</th>
                  <th className="py-3 px-4 font-medium">Bagian / Jabatan</th>
                  <th className="py-3 px-4 font-medium">Domisili</th>
                  <th className="py-3 px-4 font-medium">Kontak</th>
                  <th className="py-3 px-4 font-medium">Periode Kepengurusan</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted-foreground text-xs">
                      Tidak ada data anggota yang cocok dengan filter atau pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {m.foto_url ? (
                            <img
                              src={m.foto_url}
                              alt={m.nama}
                              className="w-8 h-8 rounded-full object-cover border shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                              {m.nama.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground">{m.nama}</p>
                            <p className="text-[10px] text-muted-foreground">Sejak {m.tanggalBergabung}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">{m.jabatan}</p>
                        <p className="text-[11px] text-muted-foreground">{m.bagian}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          {m.rt_rw}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          {m.kontak}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px] truncate max-w-[150px]">
                          {m.periode}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            m.status === "Aktif"
                              ? "default"
                              : m.status === "Alumni"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-[10px]"
                        >
                          {m.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`https://wa.me/${m.kontak.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2 text-emerald-600 dark:text-emerald-400 gap-1"
                            >
                              <Phone className="h-3 w-3" />
                              <span>WA</span>
                            </Button>
                          </a>
                          {isAdminOrKetua && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenEdit(m)}>
                                  <Edit className="h-3.5 w-3.5 mr-2" />
                                  <span>Edit Anggota</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteId(m.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  <span>Hapus Anggota</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Tambah / Edit Anggota */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <span>{editingMember ? "Edit Data Anggota" : "Tambah Anggota Baru"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Lengkapi data anggota pemuda karang taruna dan penugasannya.
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-3.5 py-2">
            {/* Foto Upload & Preview */}
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border bg-background shrink-0 flex items-center justify-center">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="h-6 w-6 text-muted-foreground opacity-50" />
                )}
              </div>
              <div className="space-y-1 text-xs flex-1">
                <p className="font-semibold text-foreground">Foto Profil Anggota (Opsional)</p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Pilih Foto
                  </Button>
                  {fotoPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:bg-destructive/10"
                      onClick={handleRemovePhoto}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Hapus Foto
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Nama & Kontak */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nama Lengkap *</Label>
                <Input
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">No. WhatsApp / HP *</Label>
                <Input
                  value={kontak}
                  onChange={(e) => setKontak(e.target.value)}
                  placeholder="0812-3456-7890"
                  className="text-xs"
                />
              </div>
            </div>

            {/* Jabatan & Bagian */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Jabatan Organisasi *</Label>
                <Input
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Contoh: Anggota, Kabid Acara, dsb."
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Bagian Organisasi</Label>
                <Select value={bagianId} onValueChange={setBagianId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Pilih bagian..." />
                  </SelectTrigger>
                  <SelectContent>
                    {metadata.daftarBagian.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Periode Kepengurusan */}
            {metadata.daftarPeriode.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs">Periode Kepengurusan (Bagan Terhubung)</Label>
                <Select value={periodeId} onValueChange={setPeriodeId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Pilih periode atau tanpa periode..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa Kaitan Periode Spesifik</SelectItem>
                    {metadata.daftarPeriode.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Domisili & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Domisili RT/RW *</Label>
                <Input
                  value={rt}
                  onChange={(e) => setRt(e.target.value)}
                  placeholder="Contoh: RT 03 / RW 05"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Status Keanggotaan</Label>
                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Alumni">Alumni</SelectItem>
                    <SelectItem value="Cuti">Cuti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setIsDialogOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="text-xs bg-primary hover:bg-primary/90 gap-1.5"
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{editingMember ? "Simpan Perubahan" : "Tambah Anggota"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus Anggota */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Hapus Data Anggota?</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Data keanggotaan ini akan dihapus dari sistem dan seluruh bagan organisasi terkait.
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
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Hapus</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
