import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Upload, Camera, ZoomIn } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DokumentasiKegiatanPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/kegiatan">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Jadwal Kegiatan</span>
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Galeri Dokumentasi Foto Acara</h1>
          <p className="text-sm text-muted-foreground">
            Foto dokumentasi kegiatan #ID: {id}. Klik foto untuk memperbesar atau download.
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          <span>Upload Foto Kegiatan</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="overflow-hidden group cursor-pointer">
            <div className="aspect-video bg-muted relative flex items-center justify-center text-muted-foreground">
              <Camera className="h-8 w-8 opacity-40 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                <ZoomIn className="h-6 w-6" />
              </div>
            </div>
            <CardContent className="p-3">
              <p className="text-xs font-medium truncate">Foto dokumentasi sesi #{item}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Uploaded 14 Sep 2026</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
