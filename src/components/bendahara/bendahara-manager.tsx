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
  FileText
} from "lucide-react";
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

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
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

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("jenis", jenis);
      formData.append("judul", judul);
      formData.append("keterangan", keterangan);
      formData.append("jumlah", jumlah);
      if (file) {
        formData.append("lampiran", file);
      }

      const res = await createTransaksi(formData, "bendahara");

      if (res?.error) {
        setError(res.error);
      } else {
        setIsDialogOpen(false);
      }
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      startTransition(async () => {
        const res = await deleteTransaksi(deleteId, "bendahara");
        if (res?.error) {
          alert("Gagal menghapus: " + res.error);
        }
        setDeleteId(null);
      });
    }
  };

  const filteredList = initialList.filter((item: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.judul.toLowerCase().includes(q) ||
      item.keterangan?.toLowerCase().includes(q) ||
      (item.author?.nama || "").toLowerCase().includes(q)
    );
  });

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
            className="flex-1 sm:flex-none gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
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
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Total Saldo Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatRupiah(initialSaldo.sisa)}</div>
            <p className="text-xs text-blue-600/80 mt-1">Kas Umum Keseluruhan</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Total Pemasukan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{formatRupiah(initialSaldo.masuk)}</div>
            <p className="text-xs text-emerald-600/80 mt-1">Akumulasi Dana Masuk</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rose-50 to-red-50 border-rose-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-800 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" /> Total Pengeluaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-900">{formatRupiah(initialSaldo.keluar)}</div>
            <p className="text-xs text-rose-600/80 mt-1">Akumulasi Dana Keluar</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg">Riwayat Transaksi</CardTitle>
              <CardDescription>Semua mutasi kas umum organisasi</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Input
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
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
                      <td className={`px-6 py-4 text-right font-semibold ${trx.jenis === "masuk" ? "text-emerald-600" : "text-rose-600"}`}>
                        {trx.jenis === "masuk" ? "+" : "-"}{formatRupiah(trx.jumlah)}
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
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary"
                            onClick={() => setPreviewUrl(trx.lampiran_url)}
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
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
            {previewUrl?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Lampiran" className="max-w-full max-h-[70vh] object-contain rounded" />
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
