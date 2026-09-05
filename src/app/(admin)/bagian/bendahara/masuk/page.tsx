import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, ArrowDownLeft, Upload } from "lucide-react";

export default function UangMasukPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/bagian/bendahara">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Keuangan</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-emerald-600">
            <ArrowDownLeft className="h-5 w-5" />
            <CardTitle>Catat Uang Masuk (Pemasukan)</CardTitle>
          </div>
          <CardDescription>
            Tanggal dicatat otomatis hari ini secara sistem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="judul">Judul Pemasukan</Label>
            <Input id="judul" placeholder="Contoh: Donasi Kegiatan HUT RI dari Warga RT 03" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jumlah">Nominal (Rp)</Label>
            <Input id="jumlah" type="number" placeholder="Contoh: 500000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan / Rincian</Label>
            <Input id="keterangan" placeholder="Detail sumber pemasukan..." />
          </div>

          <div className="space-y-2">
            <Label>Bukti Transfer / Nota (Opsional)</Label>
            <div className="border border-dashed rounded-lg p-6 text-center text-xs text-muted-foreground hover:bg-muted/40 transition-colors cursor-pointer">
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <span>Pilih file gambar/PDF bukti kas masuk</span>
            </div>
          </div>

          <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Simpan Uang Masuk</Button>
        </CardContent>
      </Card>
    </div>
  );
}
