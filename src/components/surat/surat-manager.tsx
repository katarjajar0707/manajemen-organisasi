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
import {
  FileText,
  Plus,
  Copy,
  Edit,
  Download,
  Search,
  Printer,
  Check,
  CheckCircle2,
  Trash2,
  Sparkles,
  Send,
  MoreVertical,
  Mail,
  Building,
} from "lucide-react";

export interface TemplateSurat {
  id: string;
  nama: string;
  jenis: "undangan" | "proposal" | "keluar" | "keterangan";
  ringkasan: string;
  kodeFormat: string;
  isiTemplate: string;
}

const INITIAL_TEMPLATES: TemplateSurat[] = [
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
  },
  {
    id: "3",
    nama: "Proposal Pengajuan Bantuan Dana Kegiatan",
    jenis: "proposal",
    ringkasan: "Struktur standar permohonan donasi dan sponsor dengan rincian kebutuhan anggaran.",
    kodeFormat: "PROP-KT/RW05",
    isiTemplate: `Nomor: {{nomor}}
Lampiran: 1 Bundel Proposal & Estimasi Anggaran
Perihal: Permohonan Bantuan Dana & Donasi Kegiatan

Kepada Yth.
Bapak/Ibu Donatur / Pimpinan Perusahaan: {{penerima}}
di Tempat

Dengan hormat,
Generasi muda Karang Taruna RW 05 bermaksud menyelenggarakan kegiatan "{{perihal}}" yang bertujuan mempererat tali silaturahmi dan menumbuhkan semangat kebersamaan pemuda warga.

Kegiatan ini direncanakan pada:
Hari / Tanggal : {{tanggal}}
Lokasi         : {{tempat}}
Estimasi Biaya : Rp {{agenda}}

Besar harapan kami agar Bapak/Ibu berkenan berpartisipasi memberikan dukungan moril maupun materil guna menyukseskan kegiatan tersebut.

Demikian surat pengantar proposal ini kami sampaikan, atas kebaikan Bapak/Ibu kami haturkan terima kasih.

Hormat kami,
Ketua Karang Taruna

( {{penandatangan}} )`,
  },
  {
    id: "4",
    nama: "Surat Keterangan Aktif Organisasi Pemuda",
    jenis: "keterangan",
    ringkasan: "Surat bukti keanggotaan aktif untuk beasiswa, lamaran kerja, atau arsip administrasi anggota.",
    kodeFormat: "KET-KT/RW05",
    isiTemplate: `SURAT KETERANGAN AKTIF PENGURUS
Nomor: {{nomor}}

Yang bertanda tangan di bawah ini:
Nama    : Azzam Azhari
Jabatan : Ketua Karang Taruna RW 05

Dengan ini menerangkan bahwa:
Nama Lengkap : {{penerima}}
Domisili     : {{tempat}}
Jabatan      : {{agenda}}
Masa Bakti   : {{tanggal}}

Adalah benar-benar anggota aktif Karang Taruna RW 05 yang memiliki dedikasi dan kontribusi positif dalam setiap kegiatan kemasyarakatan.

Surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagai: {{perihal}}.

Ditetapkan di : Jakarta
Pada Tanggal  : {{waktu}}

Ketua Karang Taruna RW 05

( {{penandatangan}} )`,
  },
];

export function SuratManager() {
  const [templates, setTemplates] = useState<TemplateSurat[]>(INITIAL_TEMPLATES);
  const [activeTab, setActiveTab] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog Buat / Edit Template
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateSurat | null>(null);
  const [templateNama, setTemplateNama] = useState("");
  const [templateJenis, setTemplateJenis] = useState<"undangan" | "proposal" | "keluar" | "keterangan">("undangan");
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
  const [genPenandatangan, setGenPenandatangan] = useState("Azzam Azhari (Ketua)");
  const [isCopied, setIsCopied] = useState(false);

  // Delete Dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleOpenCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateNama("");
    setTemplateJenis("undangan");
    setTemplateRingkasan("");
    setTemplateKode("SK-KT/RW05");
    setTemplateIsi(INITIAL_TEMPLATES[0].isiTemplate);
    setIsTemplateDialogOpen(true);
  };

  const handleOpenEditTemplate = (tpl: TemplateSurat) => {
    setEditingTemplate(tpl);
    setTemplateNama(tpl.nama);
    setTemplateJenis(tpl.jenis);
    setTemplateRingkasan(tpl.ringkasan);
    setTemplateKode(tpl.kodeFormat);
    setTemplateIsi(tpl.isiTemplate);
    setIsTemplateDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!templateNama.trim() || !templateIsi.trim()) return;

    if (editingTemplate) {
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
    } else {
      const newTpl: TemplateSurat = {
        id: Date.now().toString(),
        nama: templateNama,
        jenis: templateJenis,
        ringkasan: templateRingkasan,
        kodeFormat: templateKode || "SURAT-KT",
        isiTemplate: templateIsi,
      };
      setTemplates([...templates, newTpl]);
    }

    setIsTemplateDialogOpen(false);
  };

  const handleOpenGenerator = (tpl: TemplateSurat) => {
    setActiveGeneratorTemplate(tpl);
    setGenNomor(`02${Math.floor(Math.random() * 80 + 10)}/${tpl.kodeFormat}/2026`);
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
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handlePrintLetter = () => {
    alert("Menyiapkan dokumen untuk pencetakan / ekspor PDF resmi...");
  };

  const handleDeleteTemplate = () => {
    if (deleteId) {
      setTemplates((prev) => prev.filter((t) => t.id !== deleteId));
      setDeleteId(null);
    }
  };

  const filteredTemplates = templates.filter((tpl) => {
    if (activeTab !== "semua" && tpl.jenis !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNama = tpl.nama.toLowerCase().includes(q);
      const matchRingkasan = tpl.ringkasan.toLowerCase().includes(q);
      if (!matchNama && !matchRingkasan) return false;
    }
    return true;
  });

  const getJenisBadge = (jenis: string) => {
    switch (jenis) {
      case "undangan":
        return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] capitalize">Undangan</Badge>;
      case "proposal":
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] capitalize">Proposal</Badge>;
      case "keluar":
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] capitalize">Izin / Keluar</Badge>;
      case "keterangan":
        return <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] capitalize">Keterangan</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] capitalize">{jenis}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Template Surat & Administrasi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Buat surat resmi otomatis dalam hitungan detik dengan variabel dinamis & kop standar Karang Taruna.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            className="gap-2 shadow-sm bg-primary hover:bg-primary/90 text-xs h-8 w-full sm:w-auto"
            onClick={handleOpenCreateTemplate}
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Template Baru</span>
          </Button>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "semua", label: "Semua" },
            { id: "undangan", label: "Undangan" },
            { id: "proposal", label: "Proposal" },
            { id: "keluar", label: "Surat Izin" },
            { id: "keterangan", label: "Keterangan" },
          ].map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              variant={activeTab === tab.id ? "default" : "ghost"}
              className="text-xs h-8 px-3 rounded-lg capitalize"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.id === "semua"
                ? `Semua (${templates.length})`
                : `${tab.label} (${templates.filter((t) => t.jenis === tab.id).length})`}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Cari template surat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-muted/30"
          />
        </div>
      </div>

      {/* Template Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((tpl) => (
          <Card
            key={tpl.id}
            className="flex flex-col justify-between hover:shadow-md transition-all border group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {getJenisBadge(tpl.jenis)}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {tpl.kodeFormat}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEditTemplate(tpl)}>
                        <Edit className="h-3.5 w-3.5 mr-2" />
                        <span>Edit Template</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(tpl.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        <span>Hapus</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors leading-snug">
                {tpl.nama}
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed mt-1">
                {tpl.ringkasan}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0 pb-4 flex gap-2">
              <Button
                size="sm"
                variant="default"
                className="flex-1 text-xs gap-1.5 shadow-xs"
                onClick={() => handleOpenGenerator(tpl)}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Gunakan Template</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs text-muted-foreground hover:text-primary"
                title="Edit Format"
                onClick={() => handleOpenEditTemplate(tpl)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generator & Preview Modal (Gunakan Template) */}
      <Dialog
        open={!!activeGeneratorTemplate}
        onOpenChange={(open) => !open && setActiveGeneratorTemplate(null)}
      >
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[92vh] overflow-y-auto">
          {activeGeneratorTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <DialogTitle className="text-base sm:text-lg">
                    Generator: {activeGeneratorTemplate.nama}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-xs">
                  Isi variabel di sebelah kiri, pratinjau surat resmi berformat kop akan terupdate otomatis secara langsung.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-2">
                {/* Kolom Kiri: Form Input Variabel */}
                <div className="lg:col-span-5 space-y-3.5 pr-0 lg:pr-2 border-r-0 lg:border-r">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Edit className="h-3.5 w-3.5 text-primary" />
                    <span>Variabel Isian Surat</span>
                  </h4>

                  <div className="space-y-1">
                    <Label className="text-[11px]">Nomor Surat</Label>
                    <Input
                      value={genNomor}
                      onChange={(e) => setGenNomor(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px]">Penerima / Kepada Yth.</Label>
                    <Input
                      value={genPenerima}
                      onChange={(e) => setGenPenerima(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px]">Perihal / Acara</Label>
                    <Input
                      value={genPerihal}
                      onChange={(e) => setGenPerihal(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Hari & Tanggal</Label>
                      <Input
                        value={genTanggal}
                        onChange={(e) => setGenTanggal(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Waktu / Jam</Label>
                      <Input
                        value={genWaktu}
                        onChange={(e) => setGenWaktu(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px]">Lokasi / Tempat</Label>
                    <Input
                      value={genTempat}
                      onChange={(e) => setGenTempat(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px]">Agenda / Keterangan Tambahan</Label>
                    <Input
                      value={genAgenda}
                      onChange={(e) => setGenAgenda(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px]">Penandatangan Surat</Label>
                    <Input
                      value={genPenandatangan}
                      onChange={(e) => setGenPenandatangan(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Kolom Kanan: Pratinjau Lembar Surat (Kop Surat Resmi) */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Live Preview Surat Resmi</span>
                    </h4>
                    <span className="text-[10px] text-muted-foreground">Format A4 Standar</span>
                  </div>

                  {/* Kertas Kop Surat */}
                  <div className="bg-background border rounded-xl p-5 shadow-inner text-foreground space-y-4 font-serif text-xs leading-relaxed max-h-[460px] overflow-y-auto">
                    {/* Kop Surat Header */}
                    <div className="text-center border-b-2 border-foreground pb-3 font-sans space-y-0.5">
                      <h3 className="font-bold text-sm tracking-wider uppercase">
                        KARANG TARUNA BHAKTI KARYA
                      </h3>
                      <h4 className="font-semibold text-xs uppercase tracking-wide">
                        RUKUN WARGA 05 KELURAHAN SUKAMAJU
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-normal">
                        Sekretariat: Jl. Pemuda Harapan No. 12 RW 05 • Kontak: 0812-3456-7890 • Email: info@karangtaruna.id
                      </p>
                    </div>

                    {/* Badan Isi Surat */}
                    <div className="whitespace-pre-line font-mono text-[11px] leading-relaxed text-foreground/90">
                      {generateLetterContent()}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setActiveGeneratorTemplate(null)}>
                  Tutup
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={handleCopyLetter}
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{isCopied ? "Tersalin ke Clipboard!" : "Salin Teks"}</span>
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={handlePrintLetter}
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Cetak / Unduh PDF</span>
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Add / Edit Template Master */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>{editingTemplate ? "Edit Master Template" : "Buat Master Template Baru"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Gunakan tag kurung kurawal seperti {"{{nomor}}"}, {"{{penerima}}"}, {"{{tanggal}}"} agar dinamis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Template</Label>
              <Input
                value={templateNama}
                onChange={(e) => setTemplateNama(e.target.value)}
                placeholder="Contoh: Surat Rekomendasi Kegiatan Warga"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Jenis Surat</Label>
                <Select
                  value={templateJenis}
                  onValueChange={(val: "undangan" | "proposal" | "keluar" | "keterangan") => setTemplateJenis(val)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undangan">Surat Undangan</SelectItem>
                    <SelectItem value="proposal">Proposal Bantuan</SelectItem>
                    <SelectItem value="keluar">Surat Izin / Keluar</SelectItem>
                    <SelectItem value="keterangan">Surat Keterangan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Kode Format Surat</Label>
                <Input
                  value={templateKode}
                  onChange={(e) => setTemplateKode(e.target.value)}
                  placeholder="Contoh: REK-KT/RW05"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Ringkasan / Kegunaan</Label>
              <Input
                value={templateRingkasan}
                onChange={(e) => setTemplateRingkasan(e.target.value)}
                placeholder="Jelaskan kapan template surat ini digunakan..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Format Draft Teks Surat</Label>
              <Textarea
                value={templateIsi}
                onChange={(e) => setTemplateIsi(e.target.value)}
                rows={9}
                className="text-xs font-mono leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsTemplateDialogOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSaveTemplate} disabled={!templateNama.trim()}>
              Simpan Master Template
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
              <span>Hapus Template</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus template surat ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteTemplate}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
