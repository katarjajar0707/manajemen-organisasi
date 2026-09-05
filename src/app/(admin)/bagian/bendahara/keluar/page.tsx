import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Upload, AlertCircle } from "lucide-react";

export default function UangKeluarPage() {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-destructive">
              <ArrowUpRight className="h-5 w-5" />
              <CardTitle>Catat Uang Keluar (Pengeluaran)</CardTitle>
            </div>
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Bukti Wajib
            </Badge>
          </div>
          <CardDescription>
            Pengeluaran wajib melampirkan foto nota/struk belanja asli.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="judul">Alasan / Judul Pengeluaran</Label>
            <Input id="judul" placeholder="Contoh: Pembelian Cat dan Kuas Gapura" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jumlah">Nominal (Rp)</Label>
            <Input id="jumlah" type="number" placeholder="Contoh: 320000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan / Rincian Belanja</Label>
            <Input id="keterangan" placeholder="Detail item yang dibeli..." />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-destructive">
              <span>Lampiran Bukti Nota / Kuitansi *</span>
            </Label>
            <div className="border border-dashed border-destructive/40 rounded-lg p-6 text-center text-xs text-muted-foreground hover:bg-destructive/5 transition-colors cursor-pointer">
              <Upload className="h-6 w-6 mx-auto mb-2 text-destructive" />
              <span className="font-medium text-foreground">Upload Foto Nota / Kuitansi</span>
              <p className="text-[11px] text-muted-foreground mt-1">Format: JPG, PNG, atau PDF (Maks. 5MB)</p>
            </div>
          </div>

          <Button variant="destructive" className="w-full">Simpan Uang Keluar</Button>
        </CardContent>
      </Card>
    </div>
  );
}
