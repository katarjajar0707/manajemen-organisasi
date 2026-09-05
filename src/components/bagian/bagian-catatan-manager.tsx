"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  FileText,
  Paperclip,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  ArrowLeft,
  Sparkles,
  Layers,
  FolderArchive,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { CURRENT_ONGOING_KEGIATAN } from "@/constants/kegiatan-aktif";

interface NoteItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  kategori: "rutin" | "ongoing-event" | "arsip-lainnya";
  hasAttachment: boolean;
}

// Catatan Rutin per Bagian
const INITIAL_NOTES_RUTIN: Record<string, NoteItem[]> = {
  default: [
    {
      id: "nr-1",
      title: "Notula Rapat Koordinasi Rutin Bagian",
      excerpt: "Pembahasan program kerja bulanan, evaluasi pembagian tugas harian, dan inventaris berkas.",
      date: "05 Sep 2026",
      author: "Pengurus Harian",
      kategori: "rutin",
      hasAttachment: true,
    },
    {
      id: "nr-2",
      title: "SOP Pelayanan Warga & Administrasi Internal",
      excerpt: "Standar operasional prosedur pengajuan surat keterangan dan koordinasi warga antar RT.",
      date: "01 Sep 2026",
      author: "Sekretariat",
      kategori: "rutin",
      hasAttachment: false,
    },
  ],
};

// Catatan Khusus Kegiatan yang Sedang Berjalan (HUT RI ke-81) per Bagian
const NOTES_ONGOING_EVENT: Record<string, NoteItem[]> = {
  acara: [
    {
      id: "noe-ac-1",
      title: "Rundown Final Rangkaian Lomba HUT RI ke-81 (Durasi 1 Bulan)",
      excerpt: "Jadwal pertandingan futsal pemuda, tarik tambang ibu-ibu, lomba balap karung anak-anak, dan gladi bersih panggung.",
      date: "20 Agu 2026",
      author: "Rian Pratama (Seksi Acara)",
      kategori: "ongoing-event",
      hasAttachment: true,
    },
    {
      id: "noe-ac-2",
      title: "Skema Dewan Juri & Teknis Pembagian Hadiah",
      excerpt: "Daftar nama juri dari perwakilan tiap RT 01–06 dan rincian pembagian trofi serta sertifikat piagam.",
      date: "28 Agu 2026",
      author: "Seksi Acara",
      kategori: "ongoing-event",
      hasAttachment: false,
    },
  ],
  sekretaris: [
    {
      id: "noe-sek-1",
      title: "Penerbitan Surat Izin Keramaian Polsek & Kelurahan",
      excerpt: "Pengurusan berkas permohonan keamanan acara ke Polsek Sukamaju untuk panggung gembira kemerdekaan.",
      date: "19 Agu 2026",
      author: "Dewi Anggraini",
      kategori: "ongoing-event",
      hasAttachment: true,
    },
    {
      id: "noe-sek-2",
      title: "Daftar Distribusi Undangan Tokoh Masyarakat RW 05",
      excerpt: "Target pengiriman 50 undangan fisik ke Ketua RT, Ketua RW, LMK, Babinsa, dan tokoh sesepuh pemuda.",
      date: "26 Agu 2026",
      author: "Sekretariat",
      kategori: "ongoing-event",
      hasAttachment: true,
    },
  ],
  sarpras: [
    {
      id: "noe-sar-1",
      title: "Denah Pemasangan Tenda Panggung & Titik Genset Cadangan",
      excerpt: "Plotting tata letak tenda 8x12 meter di lapangan balai warga, jalur instalasi kabel audio, dan pagar pembatas.",
      date: "22 Agu 2026",
      author: "Diki Kurniawan (Sarpras)",
      kategori: "ongoing-event",
      hasAttachment: true,
    },
    {
      id: "noe-sar-2",
      title: "Pengecekan Kesiapan Sound System Portable & Alat Lomba",
      excerpt: "Pemeriksaan mik wireless, speaker aktif lapangan, tali tambang tambatan, dan bendera umbul-umbul.",
      date: "25 Agu 2026",
      author: "Tim Sarpras",
      kategori: "ongoing-event",
      hasAttachment: false,
    },
  ],
  kominfo: [
    {
      id: "noe-kom-1",
      title: "Brief Desain Baliho Kemerdekaan & Konten Instagram Pemuda",
      excerpt: "Publikasi teaser perlombaan, jadwal event mingguan, dan live report dokumentasi foto kegiatan.",
      date: "18 Agu 2026",
      author: "Farhan Maulana (Humas)",
      kategori: "ongoing-event",
      hasAttachment: true,
    },
  ],
  default: [
    {
      id: "noe-def-1",
      title: "Jobdesk Khusus Panitia Lapangan HUT RI ke-81",
      excerpt: "Instruksi kerja dan pembagian tugas shift kepanitiaan selama rangkaian kegiatan 1 bulan berlangsung.",
      date: "20 Agu 2026",
      author: "Ahmad Zaki (Wakil Ketua)",
      kategori: "ongoing-event",
      hasAttachment: true,
    },
    {
      id: "noe-def-2",
      title: "Koordinasi Logistik Konsumsi & Kebersihan Posko",
      excerpt: "Penyediaan konsumsi harian panitia dan jadwal piket kebersihan area lapangan pasca kegiatan lomba.",
      date: "24 Agu 2026",
      author: "Koordinator Lapangan",
      kategori: "ongoing-event",
      hasAttachment: false,
    },
  ],
};

// Catatan Arsip Event Selesai
const NOTES_ARSIP_LAINNYA: NoteItem[] = [
  {
    id: "nal-1",
    title: "Notula Evaluasi Kegiatan Bakti Sosial Ramadhan 1447H",
    excerpt: "Laporan catatan evaluasi pembagian sembako dan rekomendasi perbaikan untuk tahun depan.",
    date: "15 Apr 2026",
    author: "Sekretariat",
    kategori: "arsip-lainnya",
    hasAttachment: true,
  },
  {
    id: "nal-2",
    title: "Catatan Teknis Turnamen Futsal Pemuda Antar RT 2026",
    excerpt: "Rekapitulasi sanksi kartu, fairplay, dan catatan fasilitas lapangan futsal yang perlu perbaikan.",
    date: "20 Mei 2026",
    author: "Seksi Olahraga",
    kategori: "arsip-lainnya",
    hasAttachment: false,
  },
];

interface BagianCatatanManagerProps {
  slug: string;
}

export function BagianCatatanManager({ slug }: BagianCatatanManagerProps) {
  const capitalized = slug.charAt(0).toUpperCase() + slug.slice(1);

  // Tab Catatan Bagian: "rutin" | "kegiatan-berjalan" | "arsip-lainnya"
  const [activeTab, setActiveTab] = useState<"rutin" | "kegiatan-berjalan" | "arsip-lainnya">("rutin");
  const [searchQuery, setSearchQuery] = useState("");

  // Notes state
  const [rutinNotes, setRutinNotes] = useState<NoteItem[]>(
    INITIAL_NOTES_RUTIN[slug] || INITIAL_NOTES_RUTIN.default
  );
  const [ongoingNotes, setOngoingNotes] = useState<NoteItem[]>(
    NOTES_ONGOING_EVENT[slug] || NOTES_ONGOING_EVENT.default
  );
  const [arsipNotes, setArsipNotes] = useState<NoteItem[]>(NOTES_ARSIP_LAINNYA);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [author, setAuthor] = useState("Azzam Azhari");
  const [hasAttachment, setHasAttachment] = useState(false);

  const handleOpenCreate = () => {
    setEditingNote(null);
    setTitle("");
    setExcerpt("");
    setAuthor("Azzam Azhari");
    setHasAttachment(false);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (note: NoteItem) => {
    setEditingNote(note);
    setTitle(note.title);
    setExcerpt(note.excerpt);
    setAuthor(note.author);
    setHasAttachment(note.hasAttachment);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() || !excerpt.trim()) return;

    if (editingNote) {
      const updateFn = (prev: NoteItem[]) =>
        prev.map((n) =>
          n.id === editingNote.id
            ? {
                ...n,
                title,
                excerpt,
                author,
                hasAttachment,
              }
            : n
        );
      if (activeTab === "rutin") setRutinNotes(updateFn);
      else if (activeTab === "kegiatan-berjalan") setOngoingNotes(updateFn);
      else setArsipNotes(updateFn);
    } else {
      // Map tab key → NoteItem kategori literal
      const kategoriMap: Record<typeof activeTab, NoteItem["kategori"]> = {
        rutin: "rutin",
        "kegiatan-berjalan": "ongoing-event",
        "arsip-lainnya": "arsip-lainnya",
      };
      const newNote: NoteItem = {
        id: Date.now().toString(),
        title,
        excerpt,
        date: "Hari ini",
        author,
        kategori: kategoriMap[activeTab],
        hasAttachment,
      };
      if (activeTab === "rutin") setRutinNotes([newNote, ...rutinNotes]);
      else if (activeTab === "kegiatan-berjalan") setOngoingNotes([newNote, ...ongoingNotes]);
      else setArsipNotes([newNote, ...arsipNotes]);
    }

    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      if (activeTab === "rutin") setRutinNotes((prev) => prev.filter((n) => n.id !== deleteId));
      else if (activeTab === "kegiatan-berjalan") setOngoingNotes((prev) => prev.filter((n) => n.id !== deleteId));
      else setArsipNotes((prev) => prev.filter((n) => n.id !== deleteId));
      setDeleteId(null);
    }
  };

  // Select active notes list
  const currentNotesList =
    activeTab === "rutin"
      ? rutinNotes
      : activeTab === "kegiatan-berjalan"
      ? ongoingNotes
      : arsipNotes;

  const filteredNotes = currentNotesList.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.excerpt.toLowerCase().includes(q) ||
      n.author.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link href="/bagian">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Kelola Bagian</span>
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Catatan Bagian: {capitalized}</h1>
            <Badge variant="secondary" className="text-xs">Internal Bagian</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Daftar notula rapat, koordinasi kerja operasional, dan penugasan event khusus seksi {capitalized}.
          </p>
        </div>
        <Button size="sm" className="gap-2 shadow-xs bg-primary hover:bg-primary/90 text-xs h-8 w-full sm:w-auto" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          <span>
            + Tulis Catatan {activeTab === "kegiatan-berjalan" ? `(${CURRENT_ONGOING_KEGIATAN.namaSingkat})` : "Baru"}
          </span>
        </Button>
      </div>

      {/* Menu Bar Tabs Terintegrasi dengan Kegiatan Berjalan */}
      <div className="bg-card border rounded-2xl p-2 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Button
            size="sm"
            variant={activeTab === "rutin" ? "default" : "ghost"}
            className="h-9 px-4 text-xs font-semibold rounded-xl gap-2 shrink-0"
            onClick={() => setActiveTab("rutin")}
          >
            <FileText className="h-4 w-4" />
            <span>Catatan Rutin Bagian</span>
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 ml-0.5">
              {rutinNotes.length}
            </Badge>
          </Button>

          {/* TAB BARU OTOMATIS: Kegiatan Sedang Berjalan */}
          <Button
            size="sm"
            variant={activeTab === "kegiatan-berjalan" ? "default" : "outline"}
            className={`h-9 px-4 text-xs font-semibold rounded-xl gap-2 shrink-0 transition-all ${
              activeTab === "kegiatan-berjalan"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10"
            }`}
            onClick={() => setActiveTab("kegiatan-berjalan")}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>🎯 {CURRENT_ONGOING_KEGIATAN.namaSingkat} (Sedang Berjalan)</span>
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 ml-0.5 bg-emerald-500/20 text-emerald-800 dark:text-emerald-200">
              {ongoingNotes.length} Catatan
            </Badge>
          </Button>

          <Button
            size="sm"
            variant={activeTab === "arsip-lainnya" ? "default" : "ghost"}
            className="h-9 px-4 text-xs font-semibold rounded-xl gap-2 shrink-0"
            onClick={() => setActiveTab("arsip-lainnya")}
          >
            <FolderArchive className="h-4 w-4" />
            <span>Arsip Catatan Event Lainnya</span>
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 ml-0.5">
              {arsipNotes.length}
            </Badge>
          </Button>
        </div>
      </div>

      {/* Banner Khusus bila tab Kegiatan Berjalan aktif */}
      {activeTab === "kegiatan-berjalan" && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500 text-white text-[10px] font-semibold">
                Event Sedang Berlangsung (1 Bulan)
              </Badge>
              <span className="font-semibold text-foreground">
                {CURRENT_ONGOING_KEGIATAN.judul}
              </span>
            </div>
            <p className="text-muted-foreground text-[11px]">
              Catatan khusus untuk koordinasi tugas seksi {capitalized} selama periode 17 Agustus – 17 September 2026.
            </p>
          </div>
          <Badge variant="outline" className="w-fit text-emerald-600 border-emerald-500/30">
            {CURRENT_ONGOING_KEGIATAN.durasiLabel}
          </Badge>
        </div>
      )}

      {/* Search Input */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder={`Cari catatan ${capitalized}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-muted-foreground border rounded-xl border-dashed">
            Belum ada catatan pada kategori ini. Klik tombol di atas untuk membuat catatan baru.
          </div>
        ) : (
          filteredNotes.map((note) => (
            <Card
              key={note.id}
              className={`hover:shadow-md transition-all flex flex-col justify-between ${
                note.kategori === "ongoing-event" ? "border-emerald-500/30 bg-emerald-500/2" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-primary" />
                    {note.date}
                  </span>
                  <div className="flex items-center gap-1">
                    {note.hasAttachment && (
                      <Badge variant="outline" className="gap-1 text-[10px] text-primary border-primary/30">
                        <Paperclip className="h-3 w-3" />
                        Lampiran
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(note)}>
                          <Edit className="h-3.5 w-3.5 mr-2" />
                          <span>Edit Catatan</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(note.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          <span>Hapus</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardTitle className="text-base font-semibold mt-1 leading-snug">{note.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {note.excerpt}
                </p>
                <div className="pt-3 border-t text-[11px] text-muted-foreground flex justify-between items-center">
                  <span>Ditulis oleh: <strong className="text-foreground">{note.author}</strong></span>
                  {note.kategori === "ongoing-event" && (
                    <Badge variant="secondary" className="text-[10px] text-emerald-600 bg-emerald-500/10">
                      Live Event
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>{editingNote ? "Edit Catatan" : "Tulis Catatan Baru"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Catatan ini akan tersimpan pada tab{" "}
              <strong>
                {activeTab === "rutin"
                  ? "Catatan Rutin Bagian"
                  : activeTab === "kegiatan-berjalan"
                  ? `${CURRENT_ONGOING_KEGIATAN.namaSingkat} (Sedang Berjalan)`
                  : "Arsip Event Lainnya"}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Judul Catatan / Notula</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Notula Rapat Koordinasi Panitia Lapangan"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Nama Penulis</Label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Isi Lengkap Catatan</Label>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={4}
                placeholder="Tuliskan detail poin instruksi kerja, kesepakatan rapat, atau catatan teknis..."
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="hasAttachmentNote"
                checked={hasAttachment}
                onChange={(e) => setHasAttachment(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="hasAttachmentNote" className="text-xs cursor-pointer">
                Tandai memiliki berkas fisik lampiran
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!title.trim() || !excerpt.trim()}>
              Simpan Catatan
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
              <span>Hapus Catatan</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus catatan ini?
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
