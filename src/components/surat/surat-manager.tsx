"use client";

import { useState, useTransition } from "react";
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
import {
  FileText,
  Plus,
  Copy,
  Edit,
  Search,
  Printer,
  Check,
  CheckCircle2,
  Trash2,
  Sparkles,
  MoreVertical,
  Mail,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  TemplateSurat,
  JenisSurat,
  createTemplateSurat,
  updateTemplateSurat,
  deleteTemplateSurat,
} from "@/actions/surat";

interface SuratManagerProps {
  initialTemplates?: TemplateSurat[];
  userRole?: string;
  currentUserId?: string;
}

const DEFAULT_TEMPLATES: TemplateSurat[] = [
  {
    id: "1",
    nama: "Surat Undangan Rapat Warga / Pemuda",
    jenis: "undangan",
    ringkasan: "Template resmi undangan pertemuan rutin atau rapat koordinasi kepanitiaan.",
    kodeFormat: "UND-KT/RW05",
    isiTemplate: `Nomor: {{nomor}}
Lampiran: -
Perihal: Undangan Pertemuan {{perihal}}

Kepada Yth.
Bapak/Ibu/Saudara/i: {{penerima}}
di Tempat

Dengan hormat,
Sehubungan dengan rencana pelaksanaan {{perihal}}, kami mengundang Bapak/Ibu/Saudara/i untuk hadir pada rapat koordinasi yang akan dilaksanakan pada:

Hari / Tanggal : {{tanggal}}
Waktu          : {{waktu}} WIB
Tempat         : {{tempat}}
Agenda         : {{agenda}}

Mengingat pentingnya acara ini, kehadiran tepat waktu sangat kami harapkan. Demikian surat undangan ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.

Hormat kami,
Pengurus Karang Taruna RW 05

( {{penandatangan}} )`,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    nama: "Surat Permohonan Izin Peminjaman Tempat & Alat",
    jenis: "keluar",
    ringkasan: "Surat resmi izin penggunaan balai pertemuan warga, lapangan olahraga, atau inventaris.",
    kodeFormat: "IZIN-KT/RW05",
    isiTemplate: `Nomor: {{nomor}}
Lampiran: 1 Lembar Jadwal
Perihal: Permohonan Izin Tempat & Peralatan

Kepada Yth.
Pengurus RW / Ketua RT {{penerima}}
di Tempat

Dengan hormat,
Dalam rangka kelancaran agenda {{perihal}}, kami dari panitia Karang Taruna RW 05 bermaksud mengajukan permohonan izin penggunaan fasilitas:

Fasilitas      : {{tempat}}
Hari / Tanggal : {{tanggal}}
Waktu          : {{waktu}} WIB
Keperluan      : {{agenda}}

Kami berkomitmen menjaga kebersihan, ketertiban, dan keutuhan fasilitas selama maupun setelah kegiatan berlangsung.

Demikian permohonan ini kami ajukan. Atas izin dan dukungannya, kami sampaikan banyak terima kasih.

Hormat kami,
Koordinator Kegiatan

( {{penandatangan}} )`,
    createdAt: new Date().toISOString(),
  },
];

export function SuratManager({
  initialTemplates = [],
  userRole = "anggota",
  currentUserId,
}: SuratManagerProps) {
  const [templates, setTemplates] = useState<TemplateSurat[]>(
    initialTemplates.length > 0 ? initialTemplates : DEFAULT_TEMPLATES
  );
  const [activeTab, setActiveTab] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Notification Toast State
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

  // Dialog Buat / Edit Template
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateSurat | null>(null);
  const [templateNama, setTemplateNama] = useState("");
  const [templateJenis, setTemplateJenis] = useState<JenisSurat>("undangan");
  const [templateRingkasan, setTemplateRingkasan] = useState("");
  const [templateKode, setTemplateKode] = useState("");
  const [templateIsi, setTemplateIsi] = useState("");

  // Dialog Gunakan Template (Generator)
  const [activeGeneratorTemplate, setActiveGeneratorTemplate] = useState<TemplateSurat | null>(null);
  const [genNomor, setGenNomor] = useState("018/KT-RW05/III/2026");
  const [genPenerima, setGenPenerima] = useState("Pengurus RT 01 - RT 06");
  const [genPerihal, setGenPerihal] = useState("Rapat Koordinasi Persiapan Lomba 17 Agustus");
  const [genTanggal, setGenTanggal] = useState("Sabtu, 18 Juli 2026");
  const [genWaktu, setGenWaktu] = useState("19.30 - 22.00");
  const [genTempat, setGenTempat] = useState("Balai Warga RW 05");
  const [genAgenda, setGenAgenda] = useState("Pembentukan Panitia Teknis & Rincian Anggaran");
  const [genPenandatangan, setGenPenandatangan] = useState("Ketua Karang Taruna");
  const [isCopied, setIsCopied] = useState(false);

  // Delete Dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleOpenCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateNama("");
    setTemplateJenis("undangan");
    setTemplateRingkasan("");
    setTemplateKode("SK-KT/RW05");
    setTemplateIsi(DEFAULT_TEMPLATES[0]?.isiTemplate || "");
    setIsTemplateDialogOpen(true);
  };

  const handleOpenEditTemplate = (tpl: TemplateSurat) => {
    setEditingTemplate(tpl);
    setTemplateNama(tpl.nama);
    setTemplateJenis(tpl.jenis);
    setTemplateRingkasan(tpl.ringkasan || "");
    setTemplateKode(tpl.kodeFormat || "");
    setTemplateIsi(tpl.isiTemplate);
    setIsTemplateDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!templateNama.trim() || !templateIsi.trim()) {
      triggerNotification("Nama dan isi template wajib diisi.", "warning");
      return;
    }

    startTransition(async () => {
      if (editingTemplate) {
        const res = await updateTemplateSurat(editingTemplate.id, {
          nama: templateNama,
          jenis: templateJenis,
          ringkasan: templateRingkasan,
          kodeFormat: templateKode,
          isiTemplate: templateIsi,
        });

        if (res.success) {
          setTemplates((prev) =>
            prev.map((item) =>
              item.id === editingTemplate.id
                ? {
                    ...item,
                    nama: templateNama,
                    jenis: templateJenis,
                    ringkasan: templateRingkasan,
                    kodeFormat: templateKode,
                    isiTemplate: templateIsi,
                  }
                : item
            )
          );
          setIsTemplateDialogOpen(false);
          triggerNotification("Template surat berhasil diperbarui!", "success");
        } else {
          triggerNotification(res.error || "Gagal memperbarui template.", "warning");
        }
      } else {
        const res = await createTemplateSurat({
          nama: templateNama,
          jenis: templateJenis,
          ringkasan: templateRingkasan,
          kodeFormat: templateKode || "SURAT-KT",
          isiTemplate: templateIsi,
        });

        if (res.success && res.data) {
          setTemplates([res.data, ...templates]);
          setIsTemplateDialogOpen(false);
          triggerNotification("Template surat baru berhasil disimpan!", "success");
        } else {
          triggerNotification(res.error || "Gagal membuat template.", "warning");
        }
      }
    });
  };

  const handleOpenGenerator = (tpl: TemplateSurat) => {
    setActiveGeneratorTemplate(tpl);
    const randomNum = Math.floor(Math.random() * 80 + 10);
    setGenNomor(`02${randomNum}/${tpl.kodeFormat || "KT-RW05"}/2026`);
    setIsCopied(false);
  };

  const generateLetterContent = () => {
    if (!activeGeneratorTemplate) return "";
    let content = activeGeneratorTemplate.isiTemplate;
    content = content.replaceAll("{{nomor}}", genNomor);
    content = content.replaceAll("{{penerima}}", genPenerima);
    content = content.replaceAll("{{perihal}}", genPerihal);
    content = content.replaceAll("{{tanggal}}", genTanggal);
    content = content.replaceAll("{{waktu}}", genWaktu);
    content = content.replaceAll("{{tempat}}", genTempat);
    content = content.replaceAll("{{agenda}}", genAgenda);
    content = content.replaceAll("{{penandatangan}}", genPenandatangan);
    return content;
  };

  const handleCopyLetter = () => {
    const text = generateLetterContent();
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(text);
      setIsCopied(true);
      triggerNotification("Teks surat berhasil disalin ke clipboard!", "success");
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handlePrintLetter = () => {
    if (typeof window !== "undefined") {
      const content = generateLetterContent();
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${activeGeneratorTemplate?.nama || "Surat Organisasi"}</title>
              <style>
                body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; padding: 40px; }
                pre { font-family: 'Times New Roman', serif; white-space: pre-wrap; word-wrap: break-word; }
              </style>
            </head>
            <body>
              <pre>${content}</pre>
              <script>
                window.onload = function() { window.print(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleDeleteTemplate = () => {
    if (!deleteId) return;

    startTransition(async () => {
      const res = await deleteTemplateSurat(deleteId);
      if (res.success) {
        setTemplates((prev) => prev.filter((t) => t.id !== deleteId));
        setDeleteId(null);
        triggerNotification("Template surat berhasil dihapus.", "info");
      } else {
        triggerNotification(res.error || "Gagal menghapus template.", "warning");
      }
    });
  };

  const filteredTemplates = templates.filter((tpl) => {
    const matchesTab = activeTab === "semua" || tpl.jenis === activeTab;
    const matchesSearch =
      tpl.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.ringkasan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.kodeFormat.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getJenisBadge = (jenis: string) => {
    switch (jenis) {
      case "undangan":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">Undangan</Badge>;
      case "proposal":
        return <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">Proposal</Badge>;
      case "keluar":
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">Surat Keluar / Izin</Badge>;
      case "keterangan":
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">Keterangan</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{jenis}</Badge>;
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
          <h1 className="text-2xl font-bold tracking-tight">Template Surat & Administrasi</h1>
          <p className="text-sm text-muted-foreground">
            Standardisasi format surat resmi, permohonan izin, proposal, dan generator surat otomatis.
          </p>
        </div>
        <Button onClick={handleOpenCreateTemplate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Tambah Template
        </Button>
      </div>

      {/* Filter & Kategori Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-lg border border-border/40 overflow-x-auto max-w-full pb-1 md:pb-1">
          {[
            { id: "semua", label: "Semua" },
            { id: "undangan", label: "Undangan" },
            { id: "keluar", label: "Surat Keluar/Izin" },
            { id: "proposal", label: "Proposal" },
            { id: "keterangan", label: "Keterangan" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari template surat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((tpl) => (
          <Card key={tpl.id} className="flex flex-col justify-between hover:border-primary/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  {getJenisBadge(tpl.jenis)}
                  <CardTitle className="text-base font-semibold leading-tight pt-1">
                    {tpl.nama}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenGenerator(tpl)} className="gap-2 cursor-pointer">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Gunakan / Buat Surat
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenEditTemplate(tpl)} className="gap-2 cursor-pointer">
                      <Edit className="h-4 w-4" />
                      Edit Format
                    </DropdownMenuItem>
                    {(userRole === "admin" || userRole === "ketua") && (
                      <DropdownMenuItem
                        onClick={() => setDeleteId(tpl.id)}
                        className="gap-2 text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus Template
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="text-xs line-clamp-2 mt-1">
                {tpl.ringkasan || "Format surat baku untuk keperluan administrasi resmi karang taruna."}
              </CardDescription>
            </CardHeader>

            <CardContent className="py-2">
              <div className="bg-muted/40 rounded-md p-2.5 font-mono text-[11px] text-muted-foreground border border-border/50 line-clamp-3 leading-relaxed">
                {tpl.isiTemplate}
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
                <span>Kode: <strong className="text-foreground">{tpl.kodeFormat}</strong></span>
              </div>
            </CardContent>

            <CardFooter className="pt-2 border-t border-border/40 flex items-center justify-between">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleOpenGenerator(tpl)}
                className="w-full gap-2 text-xs font-medium"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Isi & Generate Surat
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 border border-dashed rounded-lg bg-card/30">
          <Mail className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-sm font-semibold">Tidak ada template ditemukan</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Coba ubah kata kunci pencarian atau buat template baru.
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. DIALOG GENERATOR SURAT (ISI PLACEHOLDER & PREVIEW)     */}
      {/* ========================================================= */}
      <Dialog open={!!activeGeneratorTemplate} onOpenChange={(open) => !open && setActiveGeneratorTemplate(null)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generator Surat Otomatis: {activeGeneratorTemplate?.nama}
            </DialogTitle>
            <DialogDescription>
              Lengkapi variabel isian di bawah ini. Teks surat di sebelah kanan akan terisi secara realtime.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-2">
            {/* Form Input Variabel */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="p-3 bg-muted/40 rounded-lg border border-border/60 text-xs font-medium text-muted-foreground">
                Variabel Template ({activeGeneratorTemplate?.kodeFormat})
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Nomor Surat ({"{{nomor}}"})</Label>
                <Input value={genNomor} onChange={(e) => setGenNomor(e.target.value)} className="h-8 text-xs font-mono" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Tujuan / Penerima ({"{{penerima}}"})</Label>
                <Input value={genPenerima} onChange={(e) => setGenPenerima(e.target.value)} className="h-8 text-xs" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Perihal / Nama Acara ({"{{perihal}}"})</Label>
                <Input value={genPerihal} onChange={(e) => setGenPerihal(e.target.value)} className="h-8 text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Hari/Tgl ({"{{tanggal}}"})</Label>
                  <Input value={genTanggal} onChange={(e) => setGenTanggal(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Waktu ({"{{waktu}}"})</Label>
                  <Input value={genWaktu} onChange={(e) => setGenWaktu(e.target.value)} className="h-8 text-xs" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Tempat Pelaksanaan ({"{{tempat}}"})</Label>
                <Input value={genTempat} onChange={(e) => setGenTempat(e.target.value)} className="h-8 text-xs" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Agenda / Rincian ({"{{agenda}}"})</Label>
                <Input value={genAgenda} onChange={(e) => setGenAgenda(e.target.value)} className="h-8 text-xs" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Nama Penandatangan ({"{{penandatangan}}"})</Label>
                <Input value={genPenandatangan} onChange={(e) => setGenPenandatangan(e.target.value)} className="h-8 text-xs" />
              </div>
            </div>

            {/* Live Preview Surat */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Pratinjau Surat Siap Cetak
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLetter}
                    className="h-7 text-xs gap-1.5"
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {isCopied ? "Tersalin!" : "Salin Teks"}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handlePrintLetter}
                    className="h-7 text-xs gap-1.5"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Cetak / PDF
                  </Button>
                </div>
              </div>

              <div className="flex-1 p-4 bg-white dark:bg-zinc-950 rounded-lg border border-border shadow-inner font-serif text-xs leading-relaxed text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap select-text min-h-[360px]">
                {generateLetterContent()}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveGeneratorTemplate(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 2. DIALOG BUAT / EDIT TEMPLATE                            */}
      {/* ========================================================= */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template Surat" : "Buat Template Surat Baru"}
            </DialogTitle>
            <DialogDescription>
              Gunakan tag kurung kurawal ganda seperti <code className="text-primary font-mono font-semibold">{"{{nomor}}"}</code>, <code className="text-primary font-mono font-semibold">{"{{penerima}}"}</code>, <code className="text-primary font-mono font-semibold">{"{{perihal}}"}</code>, <code className="text-primary font-mono font-semibold">{"{{tanggal}}"}</code>, <code className="text-primary font-mono font-semibold">{"{{tempat}}"}</code>, <code className="text-primary font-mono font-semibold">{"{{agenda}}"}</code>, <code className="text-primary font-mono font-semibold">{"{{penandatangan}}"}</code> sebagai placeholder dinamis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nama Template</Label>
                <Input
                  placeholder="Contoh: Undangan Koordinasi RT"
                  value={templateNama}
                  onChange={(e) => setTemplateNama(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Kategori Surat</Label>
                <Select value={templateJenis} onValueChange={(val: any) => setTemplateJenis(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undangan">Surat Undangan</SelectItem>
                    <SelectItem value="keluar">Surat Keluar / Izin</SelectItem>
                    <SelectItem value="proposal">Proposal Kegiatan</SelectItem>
                    <SelectItem value="keterangan">Surat Keterangan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Kode Format Penomoran</Label>
                <Input
                  placeholder="Contoh: UND-KT/RW05"
                  value={templateKode}
                  onChange={(e) => setTemplateKode(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Ringkasan / Kegunaan</Label>
                <Input
                  placeholder="Deskripsi singkat fungsi surat..."
                  value={templateRingkasan}
                  onChange={(e) => setTemplateRingkasan(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Isi Template Baku</Label>
              <Textarea
                rows={12}
                className="font-mono text-xs leading-relaxed"
                value={templateIsi}
                onChange={(e) => setTemplateIsi(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button onClick={handleSaveTemplate} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              {editingTemplate ? "Simpan Perubahan" : "Simpan Template"}
            </Button>
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
              Hapus Template Surat?
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus template ini? Format surat tidak akan bisa dipulihkan kembali.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-3">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isPending}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              Hapus Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
