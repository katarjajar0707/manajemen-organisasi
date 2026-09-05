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
  MessagesSquare,
  Plus,
  MessageCircle,
  AtSign,
  ArrowRight,
  Search,
  Filter,
  Pin,
  Heart,
  MoreVertical,
  Trash2,
  Edit,
  Share2,
  FileText,
  Clock,
  Sparkles,
  Tag,
  CheckCircle2,
} from "lucide-react";

export interface ThreadItem {
  id: string;
  tipe: "diskusi" | "catatan_umum";
  judul: string;
  isi: string;
  author: string;
  authorRole: string;
  bagian: string;
  mentions: string[];
  balasanCount: number;
  likesCount: number;
  isLiked?: boolean;
  isPinned?: boolean;
  time: string;
  tags?: string[];
}

export const INITIAL_THREADS: ThreadItem[] = [
  {
    id: "1",
    tipe: "diskusi",
    judul: "Usulan Ide Lomba Peringatan HUT RI ke-81",
    isi: "Mari kumpulkan ide-ide lomba untuk kategori anak-anak, ibu-ibu, dan bapak-bapak di thread ini. Silakan berikan estimasi kebutuhan alat dan perkiraan anggaran agar bisa dikoordinasikan dengan tim sarpras dan bendahara.",
    author: "Rian Pratama",
    authorRole: "Koordinator Acara",
    bagian: "Acara & Kegiatan",
    mentions: ["@Bendahara", "@Sarpras"],
    balasanCount: 7,
    likesCount: 14,
    isLiked: false,
    isPinned: true,
    time: "3 jam lalu",
    tags: ["HUT RI", "Lomba", "Perencanaan"],
  },
  {
    id: "2",
    tipe: "catatan_umum",
    judul: "Catatan Bersama: SOP Peminjaman Tenda & Sound System Warga",
    isi: "Mulai pekan depan, warga yang ingin meminjam tenda atau inventaris sound system wajib mengisi formulir izin minimal H-3 melalui sekretariat atau bagian Sarpras.",
    author: "Dewi Anggraini",
    authorRole: "Sekretaris I",
    bagian: "Sekretariat",
    mentions: ["@Semua", "@Sarpras"],
    balasanCount: 4,
    likesCount: 9,
    isLiked: true,
    isPinned: true,
    time: "Kemarin, 14:20",
    tags: ["SOP", "Inventaris", "Sekretariat"],
  },
  {
    id: "3",
    tipe: "diskusi",
    judul: "Koordinasi Kerja Bakti & Pengadaan Tempat Sampah Pilah RW 05",
    isi: "Agenda kerja bakti serentak dijadwalkan tanggal 15 bulan ini. Dibutuhkan 10 set tempat sampah organik/anorganik baru untuk disebar di titik pos ronda dan taman bermain.",
    author: "Fajar Nugraha",
    authorRole: "Divisi Lingkungan",
    bagian: "Lingkungan Hidup",
    mentions: ["@Ketua", "@Bendahara"],
    balasanCount: 3,
    likesCount: 6,
    isLiked: false,
    isPinned: false,
    time: "2 hari lalu",
    tags: ["Kebersihan", "Kerja Bakti"],
  },
  {
    id: "4",
    tipe: "catatan_umum",
    judul: "Notulensi Rapat Pleno Bulanan: Evaluasi Q1 & Rencana Kas",
    isi: "Rangkuman kesepakatan rapat pleno: Iuran kas bulanan tetap Rp 10.000/anggota aktif, rekap laporan keuangan dipublikasikan transparan di dashboard publik setiap tanggal 1.",
    author: "Ahmad Zaki",
    authorRole: "Wakil Ketua",
    bagian: "Pengurus Harian",
    mentions: ["@Semua"],
    balasanCount: 1,
    likesCount: 18,
    isLiked: false,
    isPinned: false,
    time: "3 hari lalu",
    tags: ["Notulensi", "Pleno", "Kas"],
  },
];

const AVAILABLE_MENTIONS = [
  "@Semua",
  "@Ketua",
  "@Sekretariat",
  "@Bendahara",
  "@Sarpras",
  "@Acara & Kegiatan",
  "@Humas & Media",
  "@Lingkungan Hidup",
];

const BAGIAN_OPTIONS = [
  "Pengurus Harian",
  "Sekretariat",
  "Bendahara",
  "Acara & Kegiatan",
  "Sarana & Prasarana",
  "Humas & Media",
  "Lingkungan Hidup",
];

export function DiskusiManager() {
  const [threads, setThreads] = useState<ThreadItem[]>(INITIAL_THREADS);
  const [activeTab, setActiveTab] = useState<"semua" | "diskusi" | "catatan_umum" | "pinned">("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBagian, setFilterBagian] = useState("all");

  // Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingThread, setEditingThread] = useState<ThreadItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form Fields
  const [tipe, setTipe] = useState<"diskusi" | "catatan_umum">("diskusi");
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [bagian, setBagian] = useState(BAGIAN_OPTIONS[0]);
  const [author, setAuthor] = useState("Azzam Azhari");
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");

  const handleOpenCreate = (defaultTipe: "diskusi" | "catatan_umum" = "diskusi") => {
    setEditingThread(null);
    setTipe(defaultTipe);
    setJudul("");
    setIsi("");
    setBagian(BAGIAN_OPTIONS[0]);
    setAuthor("Azzam Azhari");
    setSelectedMentions([]);
    setTagsInput("");
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (t: ThreadItem) => {
    setEditingThread(t);
    setTipe(t.tipe);
    setJudul(t.judul);
    setIsi(t.isi);
    setBagian(t.bagian);
    setAuthor(t.author);
    setSelectedMentions(t.mentions || []);
    setTagsInput(t.tags ? t.tags.join(", ") : "");
    setIsCreateOpen(true);
  };

  const handleToggleMention = (m: string) => {
    if (selectedMentions.includes(m)) {
      setSelectedMentions(selectedMentions.filter((item) => item !== m));
    } else {
      setSelectedMentions([...selectedMentions, m]);
    }
  };

  const handleSave = () => {
    if (!judul.trim() || !isi.trim()) return;

    const parsedTags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (editingThread) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === editingThread.id
            ? {
                ...t,
                tipe,
                judul,
                isi,
                bagian,
                author,
                mentions: selectedMentions,
                tags: parsedTags,
              }
            : t
        )
      );
    } else {
      const newThread: ThreadItem = {
        id: Date.now().toString(),
        tipe,
        judul,
        isi,
        author,
        authorRole: "Pengurus",
        bagian,
        mentions: selectedMentions,
        balasanCount: 0,
        likesCount: 1,
        isLiked: true,
        isPinned: false,
        time: "Baru saja",
        tags: parsedTags.length > 0 ? parsedTags : [tipe === "diskusi" ? "Diskusi" : "Catatan"],
      };
      setThreads([newThread, ...threads]);
    }

    setIsCreateOpen(false);
  };

  const handleToggleLike = (id: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isLiked = !t.isLiked;
          return {
            ...t,
            isLiked,
            likesCount: isLiked ? t.likesCount + 1 : Math.max(0, t.likesCount - 1),
          };
        }
        return t;
      })
    );
  };

  const handleTogglePin = (id: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned } : t))
    );
  };

  const handleDelete = () => {
    if (deleteId) {
      setThreads((prev) => prev.filter((t) => t.id !== deleteId));
      setDeleteId(null);
    }
  };

  const filteredThreads = threads.filter((t) => {
    if (activeTab === "diskusi" && t.tipe !== "diskusi") return false;
    if (activeTab === "catatan_umum" && t.tipe !== "catatan_umum") return false;
    if (activeTab === "pinned" && !t.isPinned) return false;

    if (filterBagian !== "all" && t.bagian !== filterBagian) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchJudul = t.judul.toLowerCase().includes(q);
      const matchIsi = t.isi.toLowerCase().includes(q);
      const matchAuthor = t.author.toLowerCase().includes(q);
      const matchBagian = t.bagian.toLowerCase().includes(q);
      const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      if (!matchJudul && !matchIsi && !matchAuthor && !matchBagian && !matchTag) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Papan Diskusi & Catatan Umum</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Forum komunikasi terbuka antar bagian, catatan bersama, dan tag pemberitahuan @departemen.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            className="gap-2 shadow-sm flex-1 sm:flex-initial text-xs h-8"
            onClick={() => handleOpenCreate("catatan_umum")}
          >
            <FileText className="h-4 w-4 text-emerald-500" />
            <span>Tulis Catatan</span>
          </Button>
          <Button
            size="sm"
            className="gap-2 shadow-sm bg-primary hover:bg-primary/90 flex-1 sm:flex-initial text-xs h-8"
            onClick={() => handleOpenCreate("diskusi")}
          >
            <MessagesSquare className="h-4 w-4" />
            <span>Mulai Diskusi</span>
          </Button>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card border rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <Button
            size="sm"
            variant={activeTab === "semua" ? "default" : "ghost"}
            className="text-xs h-8 px-3 rounded-lg"
            onClick={() => setActiveTab("semua")}
          >
            Semua ({threads.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === "diskusi" ? "default" : "ghost"}
            className="text-xs h-8 px-3 rounded-lg gap-1"
            onClick={() => setActiveTab("diskusi")}
          >
            <MessagesSquare className="h-3.5 w-3.5" />
            <span>Topik Diskusi ({threads.filter((t) => t.tipe === "diskusi").length})</span>
          </Button>
          <Button
            size="sm"
            variant={activeTab === "catatan_umum" ? "default" : "ghost"}
            className="text-xs h-8 px-3 rounded-lg gap-1"
            onClick={() => setActiveTab("catatan_umum")}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Catatan Umum ({threads.filter((t) => t.tipe === "catatan_umum").length})</span>
          </Button>
          <Button
            size="sm"
            variant={activeTab === "pinned" ? "default" : "ghost"}
            className="text-xs h-8 px-3 rounded-lg gap-1"
            onClick={() => setActiveTab("pinned")}
          >
            <Pin className="h-3.5 w-3.5" />
            <span>Tersemat ({threads.filter((t) => t.isPinned).length})</span>
          </Button>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari bahasan atau tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-muted/30 w-full"
            />
          </div>
          <Select value={filterBagian} onValueChange={setFilterBagian}>
            <SelectTrigger className="h-8 text-xs w-[130px] shrink-0">
              <SelectValue placeholder="Semua Bagian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Bagian</SelectItem>
              {BAGIAN_OPTIONS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Threads List */}
      <div className="space-y-4">
        {filteredThreads.length === 0 ? (
          <Card className="border-dashed py-12 text-center">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <MessagesSquare className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold">Belum Ada Topik Diskusi</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Mulai percakapan baru atau buat catatan bersama untuk saling berkoordinasi antar pengurus.
              </p>
              <Button size="sm" onClick={() => handleOpenCreate("diskusi")} className="mt-2">
                Buat Thread Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredThreads.map((t) => (
            <Card
              key={t.id}
              className={`transition-all hover:shadow-md ${
                t.isPinned ? "border-primary/40 bg-primary/2 dark:bg-primary/5" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={t.tipe === "diskusi" ? "default" : "secondary"}
                      className="text-xs font-medium"
                    >
                      {t.tipe === "diskusi" ? "Topik Diskusi" : "Catatan Bersama"}
                    </Badge>

                    {t.isPinned && (
                      <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-500 bg-amber-500/10 gap-1">
                        <Pin className="h-3 w-3 fill-amber-500" />
                        <span>Tersemat</span>
                      </Badge>
                    )}

                    <span className="text-xs text-muted-foreground font-medium">
                      • {t.bagian}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
                      <Clock className="h-3 w-3" />
                      {t.time}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleTogglePin(t.id)}>
                          <Pin className="h-3.5 w-3.5 mr-2" />
                          <span>{t.isPinned ? "Lepas Sematan" : "Sematkan di Atas"}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEdit(t)}>
                          <Edit className="h-3.5 w-3.5 mr-2" />
                          <span>Edit Tulisan</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(t.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          <span>Hapus</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <Link href={`/diskusi/${t.id}`} className="group">
                  <CardTitle className="text-lg sm:text-xl mt-2 group-hover:text-primary transition-colors">
                    {t.judul}
                  </CardTitle>
                </Link>
                <CardDescription className="text-xs">
                  Ditulis oleh <span className="font-semibold text-foreground">{t.author}</span> ({t.authorRole || t.bagian})
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pb-3">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {t.isi}
                </p>

                {/* Mentions tags */}
                {t.mentions && t.mentions.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <AtSign className="h-3 w-3 text-primary" /> Mention:
                    </span>
                    {t.mentions.map((m, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 cursor-pointer"
                      >
                        {m}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Topics tags */}
                {t.tags && t.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {t.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-2 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2.5 text-xs gap-1.5 ${
                      t.isLiked ? "text-rose-500 hover:text-rose-600 font-medium" : "text-muted-foreground"
                    }`}
                    onClick={() => handleToggleLike(t.id)}
                  >
                    <Heart className={`h-3.5 w-3.5 ${t.isLiked ? "fill-rose-500" : ""}`} />
                    <span>{t.likesCount} Dukungan</span>
                  </Button>
                </div>

                <Link href={`/diskusi/${t.id}`}>
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-primary hover:text-primary">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>{t.balasanCount} Balasan</span>
                    <ArrowRight className="h-3 w-3 ml-0.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              {tipe === "diskusi" ? (
                <MessagesSquare className="h-5 w-5 text-primary" />
              ) : (
                <FileText className="h-5 w-5 text-emerald-500" />
              )}
              <span>{editingThread ? "Edit Kiriman" : tipe === "diskusi" ? "Mulai Topik Diskusi Baru" : "Tulis Catatan Bersama"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Posting pesan ini untuk mengundang masukan dari pengurus atau menyimpan SOP/catatan penting.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tipe Postingan</Label>
                <Select
                  value={tipe}
                  onValueChange={(val: "diskusi" | "catatan_umum") => setTipe(val)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diskusi">Topik Diskusi (Tanya-Jawab)</SelectItem>
                    <SelectItem value="catatan_umum">Catatan Umum / SOP Bersama</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Bagian Pengirim</Label>
                <Select value={bagian} onValueChange={setBagian}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BAGIAN_OPTIONS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Nama Penulis</Label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Nama Anda"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Judul Pokok Bahasan</Label>
              <Input
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: Rencana Penggalangan Dana Bazar Warga"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Isi Lengkap / Uraian</Label>
              <Textarea
                value={isi}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setIsi(e.target.value)}
                rows={5}
                placeholder="Tuliskan latar belakang masalah, opsi solusi, atau detail instruksi..."
                className="text-xs leading-relaxed"
              />
            </div>

            {/* Mention Picker */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <AtSign className="h-3.5 w-3.5 text-primary" />
                  Tag Bagian Terkait (Mention)
                </span>
                <span className="text-[11px] text-muted-foreground">Klik untuk memilih</span>
              </Label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-muted/40 rounded-lg border">
                {AVAILABLE_MENTIONS.map((m) => {
                  const isSelected = selectedMentions.includes(m);
                  return (
                    <Badge
                      key={m}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer text-xs transition-colors ${
                        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                      onClick={() => handleToggleMention(m)}
                    >
                      {m}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                Tag / Kata Kunci (Pisahkan dengan koma)
              </Label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Contoh: HUT RI, Anggaran, Lomba"
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!judul.trim() || !isi.trim()}>
              {editingThread ? "Simpan Perubahan" : "Terbitkan Sekarang"}
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
              <span>Konfirmasi Hapus Thread</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus topik/catatan ini? Seluruh balasan di dalamnya juga akan terhapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Hapus Permanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
