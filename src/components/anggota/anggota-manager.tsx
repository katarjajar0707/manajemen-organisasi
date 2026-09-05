"use client";

import { useState } from "react";
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
  CheckCircle2,
  Download,
  Filter,
  Shield,
  UserCheck,
} from "lucide-react";
import { INITIAL_DEPARTEMEN } from "@/components/struktur/struktur-manager";

export interface AnggotaItem {
  id: string;
  nama: string;
  jabatan: string;
  bagian: string;
  rt_rw: string;
  kontak: string;
  status: "Aktif" | "Alumni" | "Cuti";
  tanggalBergabung: string;
}

const INITIAL_MEMBERS: AnggotaItem[] = [
  {
    id: "1",
    nama: "Ahmad Zaki",
    jabatan: "Ketua Karang Taruna",
    bagian: "Pengurus Harian",
    rt_rw: "RT 03 / RW 05",
    kontak: "0812-3456-7890",
    status: "Aktif",
    tanggalBergabung: "Januari 2025",
  },
  {
    id: "2",
    nama: "Siti Rahma",
    jabatan: "Bendahara Umum",
    bagian: "Bendahara",
    rt_rw: "RT 02 / RW 05",
    kontak: "0813-9876-5432",
    status: "Aktif",
    tanggalBergabung: "Januari 2025",
  },
  {
    id: "3",
    nama: "Rian Pratama",
    jabatan: "Koordinator Acara & Lomba",
    bagian: "Acara & Kegiatan",
    rt_rw: "RT 04 / RW 05",
    kontak: "0857-1122-3344",
    status: "Aktif",
    tanggalBergabung: "Februari 2025",
  },
  {
    id: "4",
    nama: "Dewi Anggraini",
    jabatan: "Sekretaris I",
    bagian: "Sekretariat",
    rt_rw: "RT 01 / RW 05",
    kontak: "0878-5566-7788",
    status: "Aktif",
    tanggalBergabung: "Januari 2025",
  },
  {
    id: "5",
    nama: "Fajar Nugraha",
    jabatan: "Divisi Perlengkapan",
    bagian: "Sarana & Prasarana",
    rt_rw: "RT 05 / RW 05",
    kontak: "0819-3344-5566",
    status: "Aktif",
    tanggalBergabung: "Maret 2025",
  },
  {
    id: "6",
    nama: "Hendra Wijaya",
    jabatan: "Mantan Koordinator Olahraga",
    bagian: "Olahraga",
    rt_rw: "RT 02 / RW 05",
    kontak: "0812-8877-6655",
    status: "Alumni",
    tanggalBergabung: "Periode 2023–2025",
  },
];

const RT_OPTIONS = ["Semua RT", "RT 01", "RT 02", "RT 03", "RT 04", "RT 05", "RT 06"];

export function AnggotaManager() {
  const [members, setMembers] = useState<AnggotaItem[]>(INITIAL_MEMBERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRt, setFilterRt] = useState("Semua RT");
  const [filterStatus, setFilterStatus] = useState<"semua" | "Aktif" | "Alumni" | "Cuti">("semua");

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AnggotaItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form Fields
  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("Anggota");
  const [bagian, setBagian] = useState("Acara & Kegiatan");
  const [rt, setRt] = useState("RT 03 / RW 05");
  const [kontak, setKontak] = useState("");
  const [status, setStatus] = useState<"Aktif" | "Alumni" | "Cuti">("Aktif");

  const handleOpenCreate = () => {
    setEditingMember(null);
    setNama("");
    setJabatan("Anggota");
    setBagian("Acara & Kegiatan");
    setRt("RT 01 / RW 05");
    setKontak("");
    setStatus("Aktif");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (m: AnggotaItem) => {
    setEditingMember(m);
    setNama(m.nama);
    setJabatan(m.jabatan);
    setBagian(m.bagian);
    setRt(m.rt_rw);
    setKontak(m.kontak);
    setStatus(m.status);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!nama.trim()) return;

    if (editingMember) {
      setMembers((prev) =>
        prev.map((item) =>
          item.id === editingMember.id
            ? {
                ...item,
                nama,
                jabatan,
                bagian,
                rt_rw: rt,
                kontak,
                status,
              }
            : item
        )
      );
    } else {
      const newMember: AnggotaItem = {
        id: Date.now().toString(),
        nama,
        jabatan,
        bagian,
        rt_rw: rt,
        kontak,
        status,
        tanggalBergabung: "Baru saja",
      };
      setMembers([...members, newMember]);
    }

    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      setMembers((prev) => prev.filter((m) => m.id !== deleteId));
      setDeleteId(null);
    }
  };

  const filteredMembers = members.filter((m) => {
    if (filterStatus !== "semua" && m.status !== filterStatus) return false;
    if (filterRt !== "Semua RT" && !m.rt_rw.includes(filterRt)) return false;

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
            Database keanggotaan pemuda RW 05 lengkap dengan domisili, penugasan bagian, dan status aktif.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 shadow-xs text-xs h-8 flex-1 sm:flex-initial"
            onClick={() => alert("Mengekspor data anggota ke CSV...")}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor Data</span>
          </Button>
          <Button
            size="sm"
            className="gap-1.5 shadow-sm bg-primary hover:bg-primary/90 text-xs h-8 flex-1 sm:flex-initial"
            onClick={handleOpenCreate}
          >
            <UserPlus className="h-4 w-4" />
            <span>Tambah Anggota</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari nama, jabatan, atau RT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-muted/30"
            />
          </div>

          <Select value={filterRt} onValueChange={setFilterRt}>
            <SelectTrigger className="h-8 text-xs w-[120px]">
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

      {/* Table Card */}
      <Card className="border shadow-xs overflow-hidden">
        <CardHeader className="p-4 pb-2 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Daftar Keanggotaan ({filteredMembers.length})</span>
            </CardTitle>
            <span className="text-xs text-muted-foreground">Unit RW 05 Sukamaju</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card List (tampil di layar mobile < md) */}
          <div className="md:hidden divide-y divide-border/60">
            {filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                Tidak ada anggota yang cocok dengan pencarian.
              </div>
            ) : (
              filteredMembers.map((m) => (
                <div key={m.id} className="p-3.5 space-y-2 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {m.nama.slice(0, 2).toUpperCase()}
                      </div>
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
                          : "warning"
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

                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2.5 gap-1 text-emerald-600 dark:text-emerald-400"
                      onClick={() => alert(`Membuka WhatsApp ke ${m.kontak}`)}
                    >
                      <Phone className="h-3 w-3" />
                      <span>Hubungi</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2 gap-1"
                      onClick={() => handleOpenEdit(m)}
                    >
                      <Edit className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(m.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (tampil di tablet & desktop >= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] border-b">
                <tr>
                  <th className="px-4 py-3">Nama Anggota</th>
                  <th className="px-4 py-3">Jabatan & Bagian</th>
                  <th className="px-4 py-3">Domisili Warga</th>
                  <th className="px-4 py-3">Kontak WhatsApp</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                          {m.nama.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{m.nama}</p>
                          <p className="text-[10px] text-muted-foreground">Bergabung: {m.tanggalBergabung}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{m.jabatan}</p>
                        <p className="text-[11px] text-muted-foreground">{m.bagian}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary" />
                        {m.rt_rw}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-emerald-500" />
                        {m.kontak || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={m.status === "Aktif" ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {m.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleOpenEdit(m)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => setDeleteId(m.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Add / Edit Anggota */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <span>{editingMember ? "Edit Data Anggota" : "Tambah Anggota Baru"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Masukkan identitas warga pemuda untuk didaftarkan ke sistem keanggotaan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Lengkap</Label>
              <Input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Farhan Maulana"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Departemen</Label>
                <Select value={bagian} onValueChange={setBagian}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    {INITIAL_DEPARTEMEN.map((departemen) => (
                      <SelectItem key={departemen} value={departemen}>
                        {departemen}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Status Keaktifan</Label>
                <Select
                  value={status}
                  onValueChange={(val: "Aktif" | "Alumni" | "Cuti") => setStatus(val)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Cuti">Cuti</SelectItem>
                    <SelectItem value="Alumni">Alumni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Domisili RT/RW</Label>
                <Input
                  value={rt}
                  onChange={(e) => setRt(e.target.value)}
                  placeholder="RT 03 / RW 05"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Nomor WhatsApp</Label>
                <Input
                  value={kontak}
                  onChange={(e) => setKontak(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!nama.trim()}>
              {editingMember ? "Simpan Perubahan" : "Simpan Anggota"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Hapus Anggota</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus data anggota ini dari database?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
