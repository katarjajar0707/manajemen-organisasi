"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ArrowLeft,
  UserPlus,
  Users,
  Shield,
  Phone,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  FolderKanban,
  LayoutGrid,
  Table as TableIcon,
  Download,
  Share2,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { INITIAL_AGENDAS, AgendaItem } from "./struktur-manager";

export interface BaganMember {
  id: string;
  nama: string;
  jabatan: string;
  level: "pucuk" | "inti" | "divisi";
  divisi: string;
  rt: string;
  kontak: string;
  avatarText: string;
}

const DEFAULT_MEMBERS: BaganMember[] = [
  {
    id: "m1",
    nama: "Ahmad Zaki",
    jabatan: "Ketua Pelaksana / Koordinator",
    level: "pucuk",
    divisi: "Koordinator Utama",
    rt: "RT 03 / RW 05",
    kontak: "0812-3456-7890",
    avatarText: "AZ",
  },
  {
    id: "m2",
    nama: "Siti Rahma",
    jabatan: "Wakil Koordinator",
    level: "inti",
    divisi: "Pengurus Harian",
    rt: "RT 02 / RW 05",
    kontak: "0813-8899-1234",
    avatarText: "SR",
  },
  {
    id: "m3",
    nama: "Dewi Anggraini",
    jabatan: "Sekretaris Pelaksana",
    level: "inti",
    divisi: "Sekretariat",
    rt: "RT 01 / RW 05",
    kontak: "0812-1122-3344",
    avatarText: "DA",
  },
  {
    id: "m4",
    nama: "Rian Pratama",
    jabatan: "Bendahara Pelaksana",
    level: "inti",
    divisi: "Keuangan",
    rt: "RT 04 / RW 05",
    kontak: "0857-4433-2211",
    avatarText: "RP",
  },
  {
    id: "m5",
    nama: "Fajar Nugraha",
    jabatan: "Koordinator Perlengkapan & Sarpras",
    level: "divisi",
    divisi: "Sarana & Prasarana",
    rt: "RT 03 / RW 05",
    kontak: "0819-7766-5544",
    avatarText: "FN",
  },
  {
    id: "m6",
    nama: "Budi Santoso",
    jabatan: "Koordinator Lapangan & Keamanan",
    level: "divisi",
    divisi: "Keamanan & Ketertiban",
    rt: "RT 05 / RW 05",
    kontak: "0877-3322-1199",
    avatarText: "BS",
  },
  {
    id: "m7",
    nama: "Nadia Utami",
    jabatan: "Koordinator Konsumsi & Logistik",
    level: "divisi",
    divisi: "Konsumsi",
    rt: "RT 02 / RW 05",
    kontak: "0812-9988-7766",
    avatarText: "NU",
  },
];

const JABATAN_OPTIONS = [
  "Ketua Pelaksana / Koordinator",
  "Wakil Koordinator",
  "Sekretaris Pelaksana",
  "Bendahara Pelaksana",
  "Koordinator Perlengkapan & Sarpras",
  "Koordinator Lapangan & Keamanan",
  "Koordinator Konsumsi & Logistik",
  "Koordinator Publikasi & Dokumentasi",
  "Anggota Pelaksana",
];

const DIVISI_OPTIONS = [
  "Pengurus Harian",
  "Sekretariat",
  "Keuangan",
  "Acara & Kegiatan",
  "Sarana & Prasarana",
  "Konsumsi",
  "Keamanan & Ketertiban",
  "Publikasi & Dokumentasi",
];

interface BaganDetailManagerProps {
  bagian: string;
  id: string;
}

export function BaganDetailManager({ bagian, id }: BaganDetailManagerProps) {
  const agenda = INITIAL_AGENDAS.find((a) => a.id === id) || {
    id,
    nama: `Bagan Agenda ${bagian.charAt(0).toUpperCase() + bagian.slice(1)}`,
    bagian: bagian.charAt(0).toUpperCase() + bagian.slice(1),
    slug: bagian,
    periode: "2025–2027",
    status: "Aktif" as const,
    totalAnggota: 7,
    deskripsi: "Susunan struktural panitia pelaksana kegiatan.",
    penanggungJawab: "Pengurus Harian",
  };

  const [members, setMembers] = useState<BaganMember[]>(DEFAULT_MEMBERS);
  const [viewMode, setViewMode] = useState<"organogram" | "tabel">("organogram");
  const [searchMember, setSearchMember] = useState("");

  // Dialog State
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<BaganMember | null>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);

  // Form State
  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState(JABATAN_OPTIONS[0]);
  const [divisi, setDivisi] = useState(DIVISI_OPTIONS[0]);
  const [rt, setRt] = useState("RT 03 / RW 05");
  const [kontak, setKontak] = useState("");

  const handleOpenAdd = () => {
    setEditingMember(null);
    setNama("");
    setJabatan(JABATAN_OPTIONS[4] || "Anggota Pelaksana");
    setDivisi(DIVISI_OPTIONS[3] || "Acara & Kegiatan");
    setRt("RT 01 / RW 05");
    setKontak("");
    setIsMemberDialogOpen(true);
  };

  const handleOpenEdit = (m: BaganMember) => {
    setEditingMember(m);
    setNama(m.nama);
    setJabatan(m.jabatan);
    setDivisi(m.divisi);
    setRt(m.rt);
    setKontak(m.kontak);
    setIsMemberDialogOpen(true);
  };

  const handleSaveMember = () => {
    if (!nama.trim()) return;

    let level: "pucuk" | "inti" | "divisi" = "divisi";
    if (jabatan.toLowerCase().includes("ketua pelaksana") || jabatan.toLowerCase().includes("koordinator utama")) {
      level = "pucuk";
    } else if (
      jabatan.toLowerCase().includes("wakil") ||
      jabatan.toLowerCase().includes("sekretaris") ||
      jabatan.toLowerCase().includes("bendahara")
    ) {
      level = "inti";
    }

    const initials = nama
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    if (editingMember) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingMember.id
            ? {
                ...m,
                nama,
                jabatan,
                divisi,
                rt,
                kontak,
                level,
                avatarText: initials,
              }
            : m
        )
      );
    } else {
      const newMember: BaganMember = {
        id: Date.now().toString(),
        nama,
        jabatan,
        divisi,
        rt,
        kontak,
        level,
        avatarText: initials,
      };
      setMembers([...members, newMember]);
    }

    setIsMemberDialogOpen(false);
  };

  const handleDeleteMember = () => {
    if (deleteMemberId) {
      setMembers((prev) => prev.filter((m) => m.id !== deleteMemberId));
      setDeleteMemberId(null);
    }
  };

  const pucukMembers = members.filter((m) => m.level === "pucuk");
  const intiMembers = members.filter((m) => m.level === "inti");
  const divisiMembers = members.filter((m) => m.level === "divisi");

  const filteredMembers = members.filter((m) => {
    if (!searchMember.trim()) return true;
    const q = searchMember.toLowerCase();
    return (
      m.nama.toLowerCase().includes(q) ||
      m.jabatan.toLowerCase().includes(q) ||
      m.divisi.toLowerCase().includes(q) ||
      m.rt.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link href="/struktur">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Daftar Agenda</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
            <Download className="h-3.5 w-3.5" />
            <span>Unduh PDF Bagan</span>
          </Button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="text-xs">
              {agenda.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {agenda.periode}
            </Badge>
            <span className="text-xs text-muted-foreground">• Bagian: {agenda.bagian}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">{agenda.nama}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{agenda.deskripsi}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg p-0.5 bg-muted/40">
            <Button
              size="sm"
              variant={viewMode === "organogram" ? "default" : "ghost"}
              className="h-7 text-xs px-2.5 gap-1 rounded-md"
              onClick={() => setViewMode("organogram")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Bagan Visual</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === "tabel" ? "default" : "ghost"}
              className="h-7 text-xs px-2.5 gap-1 rounded-md"
              onClick={() => setViewMode("tabel")}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Tabel Anggota</span>
            </Button>
          </div>

          <Button size="sm" className="gap-1.5 shadow-sm bg-primary hover:bg-primary/90 h-8" onClick={handleOpenAdd}>
            <UserPlus className="h-4 w-4" />
            <span>Tambah Anggota</span>
          </Button>
        </div>
      </div>

      {/* Visual Organogram View */}
      {viewMode === "organogram" ? (
        <div className="space-y-8 bg-muted/20 border rounded-2xl p-6 relative overflow-hidden">
          {/* Level 1: Pucuk Pimpinan */}
          <div className="space-y-2">
            <div className="text-center">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase bg-card border px-3 py-1 rounded-full shadow-xs">
                Tingkat I • Pimpinan / Koordinator Utama
              </span>
            </div>
            <div className="flex justify-center pt-3">
              {pucukMembers.map((m) => (
                <Card
                  key={m.id}
                  className="w-full max-w-xs border-primary/40 shadow-md hover:shadow-lg transition-all text-center bg-card relative group"
                >
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground opacity-60 group-hover:opacity-100">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(m)}>
                          <Edit className="h-3.5 w-3.5 mr-2" />
                          <span>Edit Data</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteMemberId(m.id)} className="text-destructive">
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          <span>Keluarkan dari Bagan</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <CardHeader className="pb-3 pt-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center mx-auto shadow-sm">
                      {m.avatarText}
                    </div>
                    <Badge variant="default" className="mx-auto w-fit text-[10px] mt-2">
                      {m.jabatan}
                    </Badge>
                    <CardTitle className="text-base font-bold mt-1">{m.nama}</CardTitle>
                    <CardDescription className="text-xs">{m.rt} • {m.kontak}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Decorative Divider Connector */}
          <div className="flex justify-center items-center">
            <div className="h-8 w-0.5 bg-primary/30" />
          </div>

          {/* Level 2: Pengurus Inti (Wakil, Sekretaris, Bendahara) */}
          <div className="space-y-2">
            <div className="text-center">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase bg-card border px-3 py-1 rounded-full shadow-xs">
                Tingkat II • Pengurus Inti & Pelaksana Harian
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto pt-3">
              {intiMembers.map((m) => (
                <Card
                  key={m.id}
                  className="border-border hover:border-primary/40 shadow-xs hover:shadow-md transition-all text-center bg-card relative group"
                >
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground opacity-60 group-hover:opacity-100">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(m)}>
                          <Edit className="h-3.5 w-3.5 mr-2" />
                          <span>Edit Data</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteMemberId(m.id)} className="text-destructive">
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          <span>Keluarkan</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <CardHeader className="pb-3 pt-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 font-bold text-xs flex items-center justify-center mx-auto">
                      {m.avatarText}
                    </div>
                    <Badge variant="secondary" className="mx-auto w-fit text-[10px] mt-1.5">
                      {m.jabatan}
                    </Badge>
                    <CardTitle className="text-sm font-semibold mt-1">{m.nama}</CardTitle>
                    <CardDescription className="text-[11px]">{m.rt} • {m.kontak}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Decorative Divider Connector */}
          <div className="flex justify-center items-center">
            <div className="h-8 w-0.5 bg-primary/30" />
          </div>

          {/* Level 3: Koordinator Seksi & Divisi Lapangan */}
          <div className="space-y-2">
            <div className="text-center">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase bg-card border px-3 py-1 rounded-full shadow-xs">
                Tingkat III • Seksi Lapangan & Divisi Khusus
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-5xl mx-auto pt-3">
              {divisiMembers.map((m) => (
                <Card
                  key={m.id}
                  className="border-border hover:border-emerald-500/40 shadow-xs hover:shadow-md transition-all text-center bg-card relative group"
                >
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground opacity-60 group-hover:opacity-100">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(m)}>
                          <Edit className="h-3.5 w-3.5 mr-2" />
                          <span>Edit Data</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteMemberId(m.id)} className="text-destructive">
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          <span>Keluarkan</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <CardHeader className="pb-3 pt-4">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center mx-auto">
                      {m.avatarText}
                    </div>
                    <Badge variant="outline" className="mx-auto w-fit text-[10px] mt-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                      {m.divisi}
                    </Badge>
                    <CardTitle className="text-xs font-semibold mt-1 leading-snug">{m.nama}</CardTitle>
                    <p className="text-[11px] text-muted-foreground font-medium">{m.jabatan}</p>
                    <CardDescription className="text-[10px] mt-0.5">{m.rt} • {m.kontak}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Tabel Anggota View */
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base">Daftar Anggota & Penugasan ({filteredMembers.length})</CardTitle>
              <Input
                placeholder="Cari nama, jabatan, atau domisili..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="w-full sm:w-64 h-8 text-xs"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] border-b">
                  <tr>
                    <th className="px-4 py-3">Nama Anggota</th>
                    <th className="px-4 py-3">Jabatan di Bagan</th>
                    <th className="px-4 py-3">Divisi / Seksi</th>
                    <th className="px-4 py-3">Domisili</th>
                    <th className="px-4 py-3">Kontak WA</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center">
                            {m.avatarText}
                          </div>
                          <span>{m.nama}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[11px]">
                          {m.jabatan}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{m.divisi}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.rt}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.kontak}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(m)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => setDeleteMemberId(m.id)}
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
      )}

      {/* Dialog Add / Edit Member */}
      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <span>{editingMember ? "Edit Data Anggota Bagan" : "Tugaskan Anggota ke Bagan"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Anggota yang ditugaskan akan otomatis tampil pada bagan hierarki kepanitiaan ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Lengkap Anggota</Label>
              <Input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Farhan Maulana"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Jabatan Penugasan</Label>
              <Select value={jabatan} onValueChange={setJabatan}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JABATAN_OPTIONS.map((j) => (
                    <SelectItem key={j} value={j}>
                      {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Divisi / Seksi Kerja</Label>
              <Select value={divisi} onValueChange={setDivisi}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIVISI_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Domisili (RT/RW)</Label>
                <Input
                  value={rt}
                  onChange={(e) => setRt(e.target.value)}
                  placeholder="RT 02 / RW 05"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">No WhatsApp</Label>
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
            <Button variant="outline" size="sm" onClick={() => setIsMemberDialogOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSaveMember} disabled={!nama.trim()}>
              {editingMember ? "Simpan Perubahan" : "Tambahkan ke Bagan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Member Confirmation */}
      <Dialog open={!!deleteMemberId} onOpenChange={(open) => !open && setDeleteMemberId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Hapus Anggota dari Bagan</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin mengeluarkan anggota ini dari susunan bagan agenda ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteMemberId(null)}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteMember}>
              Keluarkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
