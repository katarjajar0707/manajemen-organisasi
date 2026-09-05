import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Plus, Calendar, Bell } from "lucide-react";

export default function PengumumanPage() {
  const announcements = [
    {
      id: "1",
      judul: "Pemberitahuan Rapat Pleno Persiapan Agustusan",
      isi: "Diharapkan seluruh perwakilan bidang hadir tepat waktu pada malam minggu di sekretariat untuk mematangkan susunan panitia dan RAB.",
      tanggal: "5 Sep 2026",
      target: "Semua Anggota",
      author: "Ketua",
    },
    {
      id: "2",
      judul: "Pengingat Laporan Pertanggungjawaban (LPJ) Kas",
      isi: "Batas pengumpulan kuitansi dan nota belanja kegiatan kerja bakti maksimal hari Senin ke Bendahara.",
      tanggal: "2 Sep 2026",
      target: "Bagian Tertentu",
      author: "Bendahara",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengumuman & Broadcast Internal</h1>
          <p className="text-sm text-muted-foreground">
            Pemberitahuan resmi satu arah untuk seluruh pengurus atau divisi tertentu.
          </p>
        </div>
        <Button size="sm" className="gap-2 w-full sm:w-auto text-xs h-8">
          <Plus className="h-4 w-4" />
          <span>Buat Pengumuman</span>
        </Button>
      </div>

      <div className="space-y-4">
        {announcements.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                    <Bell className="h-4 w-4" />
                  </div>
                  <Badge variant={item.target === "Semua Anggota" ? "default" : "secondary"}>
                    {item.target}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {item.tanggal}
                </span>
              </div>
              <CardTitle className="text-base mt-2">{item.judul}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.isi}</p>
              <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
                Diumumkan oleh: <span className="font-semibold text-foreground">{item.author}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
