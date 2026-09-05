import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Plus, ArrowRight, FolderKanban } from "lucide-react";

interface PageProps {
  params: Promise<{
    bagian: string;
  }>;
}

export default async function KelolaAgendaBagianPage({ params }: PageProps) {
  const { bagian } = await params;
  const capitalized = bagian.charAt(0).toUpperCase() + bagian.slice(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/struktur">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Struktur</span>
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agenda Organisasi: {capitalized}</h1>
          <p className="text-sm text-muted-foreground">
            Daftar kepanitiaan / kepengurusan khusus untuk bagian {capitalized}.
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Tambah Agenda (Ketua/Admin)</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Agenda Bagian</CardTitle>
          <CardDescription>Pilih agenda untuk melihat periode kepengurusan dan bagan anggotanya.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { id: "1", nama: `Program Utama ${capitalized}`, periode: "2025–2027", isAktif: true },
            { id: "2", nama: `Kepanitiaan Event Tahunan ${capitalized}`, periode: "2026", isAktif: false },
          ].map((ag) => (
            <div
              key={ag.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card/60"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{ag.nama}</h4>
                  <Badge variant={ag.isAktif ? "default" : "secondary"} className="text-[10px]">
                    {ag.isAktif ? "Periode Aktif" : "Nonaktif"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Periode: {ag.periode}</p>
              </div>
              <Link href={`/struktur/${bagian}/agenda/${ag.id}`}>
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  <span>Detail Periode</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
