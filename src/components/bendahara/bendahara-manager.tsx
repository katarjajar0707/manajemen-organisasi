"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Wallet,
  TrendingDown,
  TrendingUp,
  MoreVertical,
  Trash2,
  AlertCircle,
  Paperclip,
  ExternalLink,
  FileText,
  FileDown,
  Eye,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createTransaksi, deleteTransaksi } from "@/actions/keuangan";

interface Transaksi {
  id: string;
  judul: string;
  keterangan: string;
  jenis: "masuk" | "keluar";
  jumlah: number;
  tanggal: string;
  lampiran_url: string | null;
  author?: {
    nama: string;
    role: string;
  };
}

interface BendaharaManagerProps {
  initialList: any[];
  initialSaldo: { masuk: number; keluar: number; sisa: number };
}

export function BendaharaManager({ initialList, initialSaldo }: BendaharaManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenis, setFilterJenis] = useState<"semua" | "masuk" | "keluar">("semua");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jenis, setJenis] = useState<"masuk" | "keluar">("masuk");
  const [judul, setJudul] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const formatRupiah = (angka: number | string) => {
    const num = Math.round(Number(angka) || 0);
    return `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  const handleOpenCreate = (tJenis: "masuk" | "keluar") => {
    setJenis(tJenis);
    setJudul("");
    setKeterangan("");
    setJumlah("");
    setFile(null);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !jumlah) return;

    if (jenis === "keluar" && (!file || file.size === 0)) {
      setError("Nota lampiran wajib disertakan untuk uang keluar.");
      return;
    }

    if (file && file.size > 10 * 1024 * 1024) {
      setError("Ukuran berkas lampiran tidak boleh melebihi 10 MB.");
      toast.error("Ukuran berkas terlalu besar (maksimal 10 MB).");
      return;
    }

    setError(null);
    startTransition(async () => {
      const cleanNominal = jumlah.replace(/[^0-9]/g, "");
      const formData = new FormData();
      formData.append("jenis", jenis);
      formData.append("judul", judul);
      formData.append("keterangan", keterangan);
      formData.append("jumlah", cleanNominal);
      if (file) {
        formData.append("lampiran", file);
      }

      const res = await createTransaksi(formData, "bendahara");

      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        toast.success(`Transaksi kas ${jenis === "masuk" ? "pemasukan" : "pengeluaran"} berhasil disimpan.`);
        setIsDialogOpen(false);
      }
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      startTransition(async () => {
        const res = await deleteTransaksi(deleteId, "bendahara");
        if (res?.error) {
          toast.error("Gagal menghapus: " + res.error);
        } else {
          toast.success("Transaksi berhasil dihapus.");
        }
        setDeleteId(null);
      });
    }
  };

  const filteredList = initialList.filter((item: any) => {
    if (filterJenis !== "semua" && item.jenis !== filterJenis) {
      return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.judul.toLowerCase().includes(q) ||
      item.keterangan?.toLowerCase().includes(q) ||
      (item.author?.nama || "").toLowerCase().includes(q)
    );
  });

  const handleExportPDF = () => {
    if (filteredList.length === 0) {
      toast.error("Tidak ada data transaksi untuk diekspor.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Gagal membuka jendela cetak. Pastikan pop-up diizinkan pada browser.");
      return;
    }

    const filterText =
      filterJenis === "masuk"
        ? "Kas Masuk (Pemasukan)"
        : filterJenis === "keluar"
        ? "Kas Keluar (Pengeluaran)"
        : "Semua Transaksi (Pemasukan & Pengeluaran)";

    const totalMasukFiltered = filteredList
      .filter((t: any) => t.jenis === "masuk")
      .reduce((acc: number, curr: any) => acc + Number(curr.jumlah), 0);

    const totalKeluarFiltered = filteredList
      .filter((t: any) => t.jenis === "keluar")
      .reduce((acc: number, curr: any) => acc + Number(curr.jumlah), 0);

    const saldoFiltered = totalMasukFiltered - totalKeluarFiltered;

    const rowsHtml = filteredList
      .map((trx: any, idx: number) => {
        const tgl = new Date(trx.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
        const jenisLabel = trx.jenis === "masuk" ? "Pemasukan" : "Pengeluaran";
        const nominalColor = trx.jenis === "masuk" ? "#047857" : "#b91c1c";

        return `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td style="white-space: nowrap;">${tgl}</td>
            <td>
              <div style="font-weight: 600; color: #0f172a;">${trx.judul}</div>
              ${trx.keterangan ? `<div style="color: #64748b; font-size: 11px; margin-top: 2px;">${trx.keterangan}</div>` : ""}
            </td>
            <td style="text-align: center;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background-color: ${trx.jenis === "masuk" ? "#d1fae5" : "#fee2e2"}; color: ${trx.jenis === "masuk" ? "#065f46" : "#991b1b"};">
                ${jenisLabel}
              </span>
            </td>
            <td style="text-align: right; font-family: monospace; font-weight: bold; color: ${nominalColor};">
              ${formatRupiah(trx.jumlah)}
            </td>
            <td style="font-size: 11px; color: #475569;">${trx.author?.nama || "Admin"}</td>
          </tr>
        `;
      })
      .join("");

    const nowIndo = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Laporan Keuangan Karang Taruna - ${nowIndo}</title>
          <style>
            @page {
              size: A4;
              margin: 12mm 15mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 10px;
              font-size: 12px;
              line-height: 1.4;
            }
            .kop {
              text-align: center;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 18px;
            }
            .kop h2 {
              margin: 0;
              font-size: 15px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #475569;
            }
            .kop h1 {
              margin: 4px 0;
              font-size: 20px;
              color: #0f172a;
              letter-spacing: 0.5px;
            }
            .kop p {
              margin: 0;
              font-size: 11px;
              color: #64748b;
            }
            .meta-box {
              display: flex;
              justify-content: space-between;
              margin-bottom: 16px;
              font-size: 12px;
              padding: 8px 12px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
            }
            .summary-cards {
              display: flex;
              gap: 12px;
              margin-bottom: 18px;
            }
            .card {
              flex: 1;
              padding: 10px 14px;
              border-radius: 6px;
              border: 1px solid #cbd5e1;
              background-color: #ffffff;
            }
            .card-title {
              font-size: 10px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .card-value {
              font-size: 16px;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
            }
            th {
              background-color: #f1f5f9;
              border: 1px solid #cbd5e1;
              padding: 8px;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #334155;
            }
            td {
              border: 1px solid #cbd5e1;
              padding: 8px;
              font-size: 12px;
            }
            .tanda-tangan {
              display: flex;
              justify-content: space-between;
              margin-top: 40px;
              page-break-inside: avoid;
            }
            .ttd-box {
              width: 220px;
              text-align: center;
              font-size: 12px;
            }
            .ttd-space {
              height: 60px;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 15px; text-align: right;">
            <button onclick="window.print()" style="padding: 8px 18px; background-color: #0284c7; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px;">
              🖨️ Cetak / Simpan sebagai PDF
            </button>
          </div>

          <div class="kop">
            <h2>PENGURUS KARANG TARUNA</h2>
            <h1>LAPORAN REKAPITULASI ARUS KAS KEUANGAN</h1>
            <p>Sistem Informasi Manajemen Organisasi & Transparansi Keuangan</p>
          </div>

          <div class="meta-box">
            <div>
              <div><strong>Kategori Filter:</strong> ${filterText}</div>
              <div><strong>Total Transaksi:</strong> ${filteredList.length} catatan</div>
            </div>
            <div style="text-align: right;">
              <div><strong>Tanggal Cetak:</strong> ${nowIndo}</div>
              <div><strong>Status:</strong> Sah / Terverifikasi Sistem</div>
            </div>
          </div>

          <div class="summary-cards">
            <div class="card" style="border-left: 4px solid #059669;">
              <div class="card-title">Total Pemasukan</div>
              <div class="card-value" style="color: #059669;">${formatRupiah(totalMasukFiltered)}</div>
            </div>
            <div class="card" style="border-left: 4px solid #dc2626;">
              <div class="card-title">Total Pengeluaran</div>
              <div class="card-value" style="color: #dc2626;">${formatRupiah(totalKeluarFiltered)}</div>
            </div>
            <div class="card" style="border-left: 4px solid #0284c7;">
              <div class="card-title">Sisa Saldo Kas Organisasi</div>
              <div class="card-value" style="color: #0284c7;">${formatRupiah(initialSaldo.sisa)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 35px;">No</th>
                <th style="width: 100px;">Tanggal</th>
                <th>Uraian / Judul Transaksi</th>
                <th style="width: 95px; text-align: center;">Jenis</th>
                <th style="width: 130px; text-align: right;">Nominal</th>
                <th style="width: 110px;">Pencatat</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
            <tfoot>
              <tr style="background-color: #f8fafc; font-weight: bold;">
                <td colspan="4" style="text-align: right; padding: 10px;">Total Mutasi (Data Sesuai Filter):</td>
                <td style="text-align: right; font-family: monospace; color: ${saldoFiltered >= 0 ? "#047857" : "#b91c1c"};">
                  ${formatRupiah(saldoFiltered)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div class="tanda-tangan">
            <div class="ttd-box">
              <p>Mengetahui,<br><strong>Ketua Karang Taruna</strong></p>
              <div class="ttd-space"></div>
              <p><strong>( ........................................ )</strong></p>
            </div>
            <div class="ttd-box">
              <p>Tertanda,<br><strong>Bendahara Umum</strong></p>
              <div class="ttd-space"></div>
              <p><strong>( ........................................ )</strong></p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manajemen Keuangan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Catatan arus kas, kas masuk, dan pengeluaran organisasi.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-none gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60"
            size="sm"
            onClick={() => handleOpenCreate("masuk")}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Kas Masuk</span>
          </Button>
          <Button 
            className="flex-1 sm:flex-none gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            size="sm"
            onClick={() => handleOpenCreate("keluar")}
          >
            <TrendingDown className="h-4 w-4" />
            <span>Kas Keluar</span>
          </Button>
        </div>
      </div>

      {/* Saldo Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-blue-50/70 border-blue-200 dark:from-blue-950/40 dark:to-indigo-950/20 dark:border-blue-900/40 dark:bg-card shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-blue-300 flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400">
                <Wallet className="h-4 w-4" />
              </span>
              <span>Total Saldo Aktif</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div suppressHydrationWarning className="text-2xl font-extrabold text-slate-950 dark:text-blue-100">
              {formatRupiah(initialSaldo.sisa)}
            </div>
            <p className="text-xs text-slate-700 dark:text-blue-400/80 font-medium mt-1">
              Kas Umum Keseluruhan
            </p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/70 border-emerald-200 dark:from-emerald-950/40 dark:to-green-950/20 dark:border-emerald-900/40 dark:bg-card shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-emerald-300 flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </span>
              <span>Total Pemasukan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div suppressHydrationWarning className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-100">
              {formatRupiah(initialSaldo.masuk)}
            </div>
            <p className="text-xs text-slate-700 dark:text-emerald-400/80 font-medium mt-1">
              Akumulasi Dana Masuk
            </p>
          </CardContent>
        </Card>

        <Card className="bg-rose-50/70 border-rose-200 dark:from-rose-950/40 dark:to-red-950/20 dark:border-rose-900/40 dark:bg-card shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-rose-300 flex items-center gap-2">
              <span className="p-1 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400">
                <TrendingDown className="h-4 w-4" />
              </span>
              <span>Total Pengeluaran</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div suppressHydrationWarning className="text-2xl font-extrabold text-rose-800 dark:text-rose-100">
              {formatRupiah(initialSaldo.keluar)}
            </div>
            <p className="text-xs text-slate-700 dark:text-rose-400/80 font-medium mt-1">
              Akumulasi Dana Keluar
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Riwayat Transaksi</CardTitle>
                <Badge variant="outline" className="text-xs font-mono">
                  {filteredList.length} data
                </Badge>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Semua mutasi kas umum organisasi
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
              {/* Filter Semua, Kas Masuk, Kas Keluar */}
              <div className="inline-flex items-center p-1 rounded-lg bg-muted/60 border border-border/70 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterJenis("semua")}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-all text-xs cursor-pointer",
                    filterJenis === "semua"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Semua ({initialList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterJenis("masuk")}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-all text-xs flex items-center gap-1 cursor-pointer",
                    filterJenis === "masuk"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-emerald-600"
                  )}
                >
                  <TrendingUp className="h-3 w-3" />
                  Kas Masuk ({initialList.filter((i: any) => i.jenis === "masuk").length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterJenis("keluar")}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-all text-xs flex items-center gap-1 cursor-pointer",
                    filterJenis === "keluar"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-rose-600"
                  )}
                >
                  <TrendingDown className="h-3 w-3" />
                  Kas Keluar ({initialList.filter((i: any) => i.jenis === "keluar").length})
                </button>
              </div>

              {/* Input Pencarian */}
              <div className="relative flex-1 sm:w-56 min-w-[160px]">
                <Input
                  placeholder="Cari transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              </div>

              {/* Tombol Export PDF */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs border-primary/40 hover:bg-primary/10 hover:text-primary hover:border-primary shrink-0"
                onClick={handleExportPDF}
              >
                <FileDown className="h-3.5 w-3.5 text-primary" />
                <span>Export .PDF</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b">
                <tr>
                  <th className="px-6 py-3 font-medium">Tanggal</th>
                  <th className="px-6 py-3 font-medium">Keterangan</th>
                  <th className="px-6 py-3 font-medium text-right">Jumlah</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                  <th className="px-6 py-3 font-medium text-center">Lampiran</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      Belum ada transaksi kas umum.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((trx: any) => (
                    <tr key={trx.id} className="hover:bg-muted/30 transition-colors">
                      <td suppressHydrationWarning className="px-6 py-4 whitespace-nowrap text-xs">
                        {new Date(trx.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{trx.judul}</div>
                        {trx.keterangan && (
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{trx.keterangan}</div>
                        )}
                        <div className="text-[10px] text-muted-foreground mt-1">
                          Oleh: {trx.author?.nama || "Unknown"}
                        </div>
                      </td>
                      <td suppressHydrationWarning className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${trx.jenis === "masuk" ? "text-emerald-600" : "text-rose-600"}`}>
                        {formatRupiah(trx.jumlah)}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <Badge 
                          variant="secondary" 
                          className={trx.jenis === "masuk" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-rose-100 text-rose-800 hover:bg-rose-100"}
                        >
                          {trx.jenis === "masuk" ? "Pemasukan" : "Pengeluaran"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {trx.lampiran_url ? (
                          <button
                            type="button"
                            onClick={() => setPreviewUrl(trx.lampiran_url)}
                            className="group relative inline-flex items-center justify-center h-12 w-12 rounded-lg overflow-hidden border border-border/80 hover:border-primary/60 cursor-pointer shadow-xs bg-muted/40 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40"
                            title="Klik untuk melihat bukti transaksi"
                          >
                            {trx.lampiran_url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) || !trx.lampiran_url.toLowerCase().includes(".pdf") ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={trx.lampiran_url}
                                alt={trx.judul || "Bukti Lampiran"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-[9px] font-mono text-primary font-bold">
                                <FileText className="h-4 w-4 mb-0.5" />
                                <span>PDF</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="h-3.5 w-3.5" />
                            </div>
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteId(trx.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Add Transaksi */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                {jenis === "masuk" ? (
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-rose-600" />
                )}
                <span>{jenis === "masuk" ? "Catat Kas Masuk" : "Catat Kas Keluar"}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Masukkan detail mutasi {jenis === "masuk" ? "pemasukan" : "pengeluaran"} kas.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-1.5">
                <Label className="text-xs">Judul Transaksi</Label>
                <Input
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder={jenis === "masuk" ? "Cth: Iuran Bulanan Anggota" : "Cth: Pembelian Konsumsi Rapat"}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Nominal (Rp)</Label>
                <Input
                  value={jumlah}
                  onChange={(e) => {
                    // Hanya izinkan angka
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    if (val) {
                      setJumlah(new Intl.NumberFormat("id-ID").format(parseInt(val, 10)));
                    } else {
                      setJumlah("");
                    }
                  }}
                  placeholder="0"
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Keterangan Tambahan (Opsional)</Label>
                <Textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Detail tambahan..."
                  rows={2}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">
                  Lampiran (Nota/Bukti) {jenis === "keluar" && <span className="text-destructive">* Wajib</span>}
                </Label>
                <Input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="text-xs"
                  accept="image/*,.pdf"
                  required={jenis === "keluar"}
                />
                {file && file.type.startsWith("image/") && (
                  <div className="flex items-center gap-2.5 mt-2 p-2 bg-muted/40 border rounded-lg">
                    <div className="h-12 w-12 rounded-md overflow-hidden border bg-background shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(file)} alt="Preview Bukti" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1 text-xs">
                      <p className="font-medium truncate text-foreground">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB (Siap diunggah)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)} disabled={isPending}>
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isPending || !judul || !jumlah || (jenis === "keluar" && !file)}>
                {isPending ? "Menyimpan..." : "Simpan Transaksi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Hapus Transaksi</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus transaksi ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)} disabled={isPending}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Preview Lampiran Modal */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-3xl w-full p-2">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Bukti Transaksi</DialogTitle>
          </DialogHeader>
          <div className="p-4 flex items-center justify-center min-h-[40vh] bg-muted/20 rounded-md">
            {previewUrl?.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) || !previewUrl?.toLowerCase().includes(".pdf") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl || ""} alt="Lampiran" className="max-w-full max-h-[70vh] object-contain rounded" />
            ) : (
              <div className="text-center space-y-4">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Berkas bukan berupa gambar yang bisa di-preview.</p>
                <a href={previewUrl || "#"} target="_blank" rel="noopener noreferrer">
                  <Button className="gap-2">
                    Unduh / Buka Berkas <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
