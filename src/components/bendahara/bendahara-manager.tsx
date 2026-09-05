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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Paperclip,
  Calendar,
  Sparkles,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Wallet,
  Plus,
  Search,
  Filter,
  Download,
  AlertCircle,
  FileCheck,
  Building,
} from "lucide-react";
import {
  CURRENT_ONGOING_KEGIATAN,
  TRANSAKSI_KEGIATAN_BERJALAN,
  LAPORAN_KEGIATAN_LAINNYA,
} from "@/constants/kegiatan-aktif";

// Transaksi Kas Umum Rutin Organisasi
const INITIAL_KAS_UMUM = [
  {
    id: "ku-1",
    jenis: "masuk" as const,
    judul: "Iuran Kas Warga RT 02 (Bulan September)",
    nominal: 500000,
    nominalFormatted: "Rp 500.000",
    kategori: "Iuran Rutin",
    tanggal: "05 Sep 2026",
    bukti: true,
  },
  {
    id: "ku-2",
    jenis: "keluar" as const,
    judul: "Beli Cat & Kuas Pemeliharaan Gapura RW",
    nominal: 320000,
    nominalFormatted: "Rp 320.000",
    kategori: "Sarana & Prasarana",
    tanggal: "03 Sep 2026",
    bukti: true,
  },
  {
    id: "ku-3",
    jenis: "masuk" as const,
    judul: "Sumbangan Donatur Pribadi Kas Operasional",
    nominal: 1000000,
    nominalFormatted: "Rp 1.000.000",
    kategori: "Donatur Warga",
    tanggal: "01 Sep 2026",
    bukti: false,
  },
  {
    id: "ku-4",
    jenis: "keluar" as const,
    judul: "Fotokopi & Penjilidan Formulir Warga",
    nominal: 450000,
    nominalFormatted: "Rp 45.000",
    kategori: "Administrasi Sekretariat",
    tanggal: "29 Agu 2026",
    bukti: false,
  },
  {
    id: "ku-5",
    jenis: "masuk" as const,
    judul: "Iuran Kas Warga RT 05 (Bulan Agustus)",
    nominal: 750000,
    nominalFormatted: "Rp 750.000",
    kategori: "Iuran Rutin",
    tanggal: "27 Agu 2026",
    bukti: true,
  },
];

export function BendaharaManager() {
  // Tab Bar Utama: "kas-umum" | "kegiatan-berjalan" | "laporan-lainnya"
  const [mainTab, setMainTab] = useState<"kas-umum" | "kegiatan-berjalan" | "laporan-lainnya">("kas-umum");

  // Kas Umum State
  const [kasUmumList, setKasUmumList] = useState(INITIAL_KAS_UMUM);
  const [filterUmum, setFilterUmum] = useState<"semua" | "masuk" | "keluar">("semua");

  // Kegiatan Berjalan (Event 1 Bulan: HUT RI ke-81) State
  const [ongoingEvent, setOngoingEvent] = useState(CURRENT_ONGOING_KEGIATAN);
  const [eventTrxList, setEventTrxList] = useState(TRANSAKSI_KEGIATAN_BERJALAN);
  const [filterEvent, setFilterEvent] = useState<"semua" | "masuk" | "keluar">("semua");

  // Dialog State: Tambah Transaksi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetContext, setTargetContext] = useState<"umum" | "event">("umum");
  const [formJenis, setFormJenis] = useState<"masuk" | "keluar">("masuk");
  const [formJudul, setFormJudul] = useState("");
  const [formNominal, setFormNominal] = useState("");
  const [formKategori, setFormKategori] = useState("");
  const [formKeterangan, setFormKeterangan] = useState("");
  const [formBukti, setFormBukti] = useState(true);

  const handleOpenAdd = (context: "umum" | "event", defaultJenis: "masuk" | "keluar") => {
    setTargetContext(context);
    setFormJenis(defaultJenis);
    setFormJudul("");
    setFormNominal("");
    setFormKategori(context === "event" ? "Sponsor / Donatur" : "Iuran Rutin");
    setFormKeterangan("");
    setFormBukti(true);
    setIsModalOpen(true);
  };

  const handleSaveTransaksi = () => {
    const rawNominal = parseInt(formNominal.replace(/[^0-9]/g, "")) || 0;
    if (!formJudul.trim() || rawNominal <= 0) return;

    const formatted = "Rp " + rawNominal.toLocaleString("id-ID");

    if (targetContext === "umum") {
      const newTrx = {
        id: Date.now().toString(),
        jenis: formJenis,
        judul: formJudul,
        nominal: rawNominal,
        nominalFormatted: formatted,
        kategori: formKategori || "Operasional",
        tanggal: "Hari ini",
        bukti: formBukti,
      };
      setKasUmumList([newTrx, ...kasUmumList]);
    } else {
      const newEventTrx = {
        id: Date.now().toString(),
        jenis: formJenis,
        judul: formJudul,
        nominal: rawNominal,
        nominalFormatted: formatted,
        kategori: formKategori || "Event",
        tanggal: "Hari ini",
        keterangan: formKeterangan || "Transaksi kepanitiaan HUT RI",
        bukti: formBukti,
      };
      setEventTrxList([newEventTrx, ...eventTrxList]);

      // Update saldo event
      setOngoingEvent((prev) => ({
        ...prev,
        danaMasuk: formJenis === "masuk" ? prev.danaMasuk + rawNominal : prev.danaMasuk,
        anggaranTerpakai: formJenis === "keluar" ? prev.anggaranTerpakai + rawNominal : prev.anggaranTerpakai,
        sisaAnggaran:
          formJenis === "masuk"
            ? prev.sisaAnggaran + rawNominal
            : prev.sisaAnggaran - rawNominal,
      }));
    }

    setIsModalOpen(false);
  };

  // Filter lists
  const filteredKasUmum = kasUmumList.filter((item) => {
    if (filterUmum === "semua") return true;
    return item.jenis === filterUmum;
  });

  const filteredEventTrx = eventTrxList.filter((item) => {
    if (filterEvent === "semua") return true;
    return item.jenis === filterEvent;
  });

  return (
    <div className="space-y-6">
      {/* Header Halaman Bendahara */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Catatan Keuangan (Bendahara)</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pengelolaan kas umum bulanan, anggaran kegiatan yang sedang berjalan, dan arsip laporan keuangan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs h-8 flex-1 sm:flex-initial"
            onClick={() => alert("Mengunduh Rekapitulasi Kas (Excel/PDF)...")}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor Pembukuan</span>
          </Button>
          <Button
            size="sm"
            className="gap-1.5 shadow-sm bg-primary hover:bg-primary/90 text-xs h-8 flex-1 sm:flex-initial"
            onClick={() => handleOpenAdd(mainTab === "kegiatan-berjalan" ? "event" : "umum", "masuk")}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Catat Transaksi</span>
          </Button>
        </div>
      </div>

      {/* Navigation Menu Tab Bar Terintegrasi */}
      <div className="bg-card border rounded-2xl p-2 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Button
            size="sm"
            variant={mainTab === "kas-umum" ? "default" : "ghost"}
            className="h-9 px-4 text-xs font-semibold rounded-xl gap-2 shrink-0"
            onClick={() => setMainTab("kas-umum")}
          >
            <Wallet className="h-4 w-4" />
            <span>Kas Umum Organisasi</span>
          </Button>

          {/* TAB BARU OTOMATIS MUNCUL: Kegiatan Sedang Berjalan (1 Bulan) */}
          <Button
            size="sm"
            variant={mainTab === "kegiatan-berjalan" ? "default" : "outline"}
            className={`h-9 px-4 text-xs font-semibold rounded-xl gap-2 shrink-0 transition-all ${
              mainTab === "kegiatan-berjalan"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10"
            }`}
            onClick={() => setMainTab("kegiatan-berjalan")}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>🎯 {ongoingEvent.namaSingkat} (Sedang Berjalan)</span>
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 ml-0.5 bg-emerald-500/20 text-emerald-800 dark:text-emerald-200">
              Durasi 1 Bulan
            </Badge>
          </Button>

          <Button
            size="sm"
            variant={mainTab === "laporan-lainnya" ? "default" : "ghost"}
            className="h-9 px-4 text-xs font-semibold rounded-xl gap-2 shrink-0"
            onClick={() => setMainTab("laporan-lainnya")}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Laporan Kegiatan Lainnya</span>
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 ml-0.5">
              {LAPORAN_KEGIATAN_LAINNYA.length}
            </Badge>
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          KONTEN TAB 1: KAS UMUM ORGANISASI
         ───────────────────────────────────────────────────────────── */}
      {mainTab === "kas-umum" && (
        <div className="space-y-6">
          {/* Saldo Cards Kas Umum */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="border-primary/30 shadow-xs bg-card/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Total Saldo Kas Umum</span>
                  <Wallet className="h-4 w-4 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground">Rp 12.850.000</div>
                <p className="text-xs text-muted-foreground mt-1">Saldo aktif siap guna kas operasional</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/30 shadow-xs bg-card/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Total Uang Masuk</span>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-500">Rp 18.500.000</div>
                <p className="text-xs text-muted-foreground mt-1">Akumulasi iuran & donatur kas umum</p>
              </CardContent>
            </Card>

            <Card className="border-rose-500/30 shadow-xs bg-card/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Total Uang Keluar</span>
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-rose-500">Rp 5.650.000</div>
                <p className="text-xs text-muted-foreground mt-1">Akumulasi belanja operasional</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabel Riwayat Transaksi Kas Umum */}
          <Card className="border shadow-xs">
            <CardHeader className="p-4 pb-3 border-b bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">Buku Mutasi Kas Umum</CardTitle>
                  <CardDescription className="text-xs">
                    Catatan seluruh arus kas operasional harian Karang Taruna.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border w-fit">
                  <Button
                    size="sm"
                    variant={filterUmum === "semua" ? "default" : "ghost"}
                    className="h-7 text-xs px-3 rounded-md"
                    onClick={() => setFilterUmum("semua")}
                  >
                    Semua
                  </Button>
                  <Button
                    size="sm"
                    variant={filterUmum === "masuk" ? "default" : "ghost"}
                    className="h-7 text-xs px-2.5 rounded-md gap-1 text-emerald-600"
                    onClick={() => setFilterUmum("masuk")}
                  >
                    <ArrowDownLeft className="h-3.5 w-3.5" />
                    <span>Uang Masuk</span>
                  </Button>
                  <Button
                    size="sm"
                    variant={filterUmum === "keluar" ? "default" : "ghost"}
                    className="h-7 text-xs px-2.5 rounded-md gap-1 text-destructive"
                    onClick={() => setFilterUmum("keluar")}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span>Uang Keluar</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-2.5">
              {filteredKasUmum.map((trx) => {
                const isMasuk = trx.jenis === "masuk";
                return (
                  <div
                    key={trx.id}
                    className="flex items-center justify-between p-3 rounded-xl border bg-card/60 hover:bg-muted/30 transition-colors gap-2"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div
                        className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${
                          isMasuk ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {isMasuk ? <ArrowDownLeft className="h-3.5 sm:h-4 w-3.5 sm:w-4" /> : <ArrowUpRight className="h-3.5 sm:h-4 w-3.5 sm:w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <h4 className="font-semibold text-xs sm:text-sm leading-snug break-words">{trx.judul}</h4>
                          <Badge variant="outline" className="text-[9px] sm:text-[10px] py-0 shrink-0">
                            {trx.kategori}
                          </Badge>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{trx.tanggal}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className={`font-bold text-xs sm:text-base ${
                          isMasuk ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {isMasuk ? `+${trx.nominalFormatted}` : `−${trx.nominalFormatted}`}
                      </div>
                      {trx.bukti && (
                        <Badge variant="outline" className="text-[9px] sm:text-[10px] gap-1 mt-0.5 text-primary border-primary/30">
                          <Paperclip className="h-2.5 w-2.5" />
                          <span className="hidden sm:inline">Nota</span> Terverifikasi
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          KONTEN TAB 2: KEGIATAN SEDANG BERJALAN (EVENT 1 BULAN)
         ───────────────────────────────────────────────────────────── */}
      {mainTab === "kegiatan-berjalan" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Banner Informasi Event 1 Bulan */}
          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-background to-card shadow-xs">
            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="bg-emerald-500 text-white text-xs gap-1.5 shadow-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                Sedang Berjalan Sekarang
              </Badge>
              <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                <Calendar className="h-3 w-3 mr-1" />
                {ongoingEvent.durasiLabel}
              </Badge>
              <span className="text-xs text-muted-foreground">• PJ: {ongoingEvent.penanggungJawab}</span>
            </div>

            {/* Judul */}
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground leading-snug">
              {ongoingEvent.judul}
            </h2>

            {/* Deskripsi */}
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed max-w-3xl">
              {ongoingEvent.deskripsi}
            </p>

            {/* Tombol Aksi — di bawah teks, rata kiri */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-emerald-500/20">
              <Button
                size="sm"
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs h-8"
                onClick={() => handleOpenAdd("event", "masuk")}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Tambah Uang Masuk Event</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs h-8 border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
                onClick={() => handleOpenAdd("event", "keluar")}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>- Catat Belanja Event</span>
              </Button>
            </div>
          </div>

          {/* Kartu Ringkasan Anggaran Khusus Event Berjalan */}
          <div className="grid gap-3 sm:grid-cols-4">
            <Card className="border shadow-xs bg-card/80">
              <CardHeader className="p-3.5 pb-1">
                <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Target Pagu Anggaran
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 pt-0">
                <div className="text-xl font-bold">
                  Rp {ongoingEvent.anggaranTotal.toLocaleString("id-ID")}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Rencana anggaran biaya (RAB)</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/30 shadow-xs bg-card/80">
              <CardHeader className="p-3.5 pb-1">
                <CardTitle className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Dana Masuk (Sponsor)</span>
                  <TrendingUp className="h-3.5 w-3.5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 pt-0">
                <div className="text-xl font-bold text-emerald-600">
                  Rp {ongoingEvent.danaMasuk.toLocaleString("id-ID")}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Swadaya warga & donatur</p>
              </CardContent>
            </Card>

            <Card className="border-rose-500/30 shadow-xs bg-card/80">
              <CardHeader className="p-3.5 pb-1">
                <CardTitle className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Realisasi Pengeluaran</span>
                  <TrendingDown className="h-3.5 w-3.5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 pt-0">
                <div className="text-xl font-bold text-rose-600">
                  Rp {ongoingEvent.anggaranTerpakai.toLocaleString("id-ID")}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Pengadaan piala, tenda & konsumsi</p>
              </CardContent>
            </Card>

            <Card className="border-primary/30 shadow-xs bg-card/80">
              <CardHeader className="p-3.5 pb-1">
                <CardTitle className="text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center justify-between">
                  <span>Sisa Saldo Kas Event</span>
                  <Wallet className="h-3.5 w-3.5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 pt-0">
                <div className="text-xl font-bold text-primary">
                  Rp {ongoingEvent.sisaAnggaran.toLocaleString("id-ID")}
                </div>
                <p className="text-[11px] text-emerald-500 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                  Saldo kas berjalan aman
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabel Mutasi Khusus Event Sedang Berjalan */}
          <Card className="border shadow-xs">
            <CardHeader className="p-4 pb-3 border-b bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Rincian Mutasi Keuangan: {ongoingEvent.judul}</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Pencatatan real-time uang masuk sponsor dan belanja perlengkapan selama event berlangsung 1 bulan.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border w-fit">
                  <Button
                    size="sm"
                    variant={filterEvent === "semua" ? "default" : "ghost"}
                    className="h-7 text-xs px-3 rounded-md"
                    onClick={() => setFilterEvent("semua")}
                  >
                    Semua ({eventTrxList.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={filterEvent === "masuk" ? "default" : "ghost"}
                    className="h-7 text-xs px-2.5 rounded-md gap-1 text-emerald-600"
                    onClick={() => setFilterEvent("masuk")}
                  >
                    <ArrowDownLeft className="h-3.5 w-3.5" />
                    <span>Masuk ({eventTrxList.filter((t) => t.jenis === "masuk").length})</span>
                  </Button>
                  <Button
                    size="sm"
                    variant={filterEvent === "keluar" ? "default" : "ghost"}
                    className="h-7 text-xs px-2.5 rounded-md gap-1 text-destructive"
                    onClick={() => setFilterEvent("keluar")}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span>Keluar ({eventTrxList.filter((t) => t.jenis === "keluar").length})</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-2.5">
              {filteredEventTrx.map((trx) => {
                const isMasuk = trx.jenis === "masuk";
                return (
                  <div
                    key={trx.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border bg-card/60 hover:bg-muted/30 transition-colors gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                          isMasuk ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {isMasuk ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-sm leading-snug">{trx.judul}</h4>
                          <Badge variant="outline" className="text-[10px] py-0 text-primary border-primary/30">
                            {trx.kategori}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{trx.keterangan}</p>
                        <p className="text-[11px] text-muted-foreground font-mono pt-0.5">📅 {trx.tanggal}</p>
                      </div>
                    </div>

                    <div className="text-right self-end sm:self-center shrink-0">
                      <div
                        className={`font-bold text-base ${
                          isMasuk ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {isMasuk ? `+${trx.nominalFormatted}` : `−${trx.nominalFormatted}`}
                      </div>
                      {trx.bukti && (
                        <Badge variant="outline" className="text-[10px] gap-1 mt-1 text-emerald-600 border-emerald-500/30">
                          <Paperclip className="h-2.5 w-2.5" />
                          Nota Terlampir
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          KONTEN TAB 3: LAPORAN KEGIATAN LAINNYA
         ───────────────────────────────────────────────────────────── */}
      {mainTab === "laporan-lainnya" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Laporan Keuangan Kegiatan Lainnya</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rekapitulasi anggaran, sisa kas, dan status pertanggungjawaban (LPJ) dari kegiatan yang telah selesai.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LAPORAN_KEGIATAN_LAINNYA.map((lap) => (
              <Card key={lap.id} className="hover:shadow-md transition-all border flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {lap.periode}
                    </Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {lap.statusLPJ}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-semibold mt-2 leading-snug">
                    {lap.namaKegiatan}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Penanggung Jawab: {lap.pj}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-2 text-xs">
                  <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Dana Masuk:</span>
                      <strong className="text-emerald-600 font-semibold">{lap.totalDanaMasuk}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Pengeluaran:</span>
                      <strong className="text-rose-600 font-semibold">{lap.totalPengeluaran}</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t text-[11px]">
                      <span className="text-muted-foreground">Status Sisa Dana:</span>
                      <span className="font-semibold text-foreground">{lap.sisaDana}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 pb-4">
                  <Link href="/arsip" className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                      <FileCheck className="h-3.5 w-3.5 text-primary" />
                      <span>Lihat Berkas LPJ di Arsip</span>
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Dialog Modal Tambah Transaksi */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              <span>
                Catat Transaksi: {targetContext === "event" ? ongoingEvent.namaSingkat : "Kas Umum"}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {targetContext === "event"
                ? "Transaksi ini akan otomatis dialokasikan ke anggaran kegiatan 1 bulan yang sedang berjalan."
                : "Transaksi ini akan dicatat ke buku kas umum bulanan Karang Taruna."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Jenis Transaksi</Label>
                <Select
                  value={formJenis}
                  onValueChange={(v: "masuk" | "keluar") => setFormJenis(v)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masuk">Uang Masuk (+)</SelectItem>
                    <SelectItem value="keluar">Uang Keluar (−)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Nominal (Rp)</Label>
                <Input
                  value={formNominal}
                  onChange={(e) => setFormNominal(e.target.value)}
                  placeholder="Contoh: 500000"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Judul / Uraian Singkat Transaksi</Label>
              <Input
                value={formJudul}
                onChange={(e) => setFormJudul(e.target.value)}
                placeholder={
                  formJenis === "masuk"
                    ? "Contoh: Sponsor Toko Berkah Mandiri"
                    : "Contoh: Pembelian Hadiah Lomba Tarik Tambang"
                }
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Kategori Pos Anggaran</Label>
              <Input
                value={formKategori}
                onChange={(e) => setFormKategori(e.target.value)}
                placeholder="Contoh: Sponsor, Perlengkapan, Konsumsi, Iuran"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Keterangan Tambahan / Catatan Nota</Label>
              <Textarea
                value={formKeterangan}
                onChange={(e) => setFormKeterangan(e.target.value)}
                placeholder="Catat no kuitansi atau nama personil pembeli..."
                rows={2}
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="buktiNota"
                checked={formBukti}
                onChange={(e) => setFormBukti(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="buktiNota" className="text-xs cursor-pointer">
                Tandai memiliki bukti nota / kuitansi fisik
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSaveTransaksi} disabled={!formJudul.trim() || !formNominal.trim()}>
              Simpan Transaksi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
