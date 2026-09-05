import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Building2, Plus, ArrowRight, FolderKanban } from "lucide-react";

export default function BagianManagementPage() {
  const departments = [
    { id: "1", nama: "Bendahara", slug: "bendahara", deskripsi: "Pengelolaan keuangan, kas masuk, kas keluar & bukti nota", isSpecial: true },
    { id: "2", nama: "Sekretaris", slug: "sekretaris", deskripsi: "Pencatatan notula, korespondensi, dan surat-menyurat", isSpecial: false },
    { id: "3", nama: "Acara & Kegiatan", slug: "acara", deskripsi: "Perencanaan dan eksekusi event kepemudaan & sosial", isSpecial: false },
    { id: "4", nama: "Humas & Komunikasi", slug: "kominfo", deskripsi: "Hubungan masyarakat, dokumentasi, dan media sosial", isSpecial: false },
    { id: "5", nama: "Sarana & Prasarana", slug: "sarpras", deskripsi: "Pengelolaan aset dan inventaris warga", isSpecial: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Bagian Organisasi</h1>
          <p className="text-sm text-muted-foreground">
            Daftar bagian/divisi yang aktif dalam struktur Karang Taruna.
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Tambah Bagian Baru</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <Card key={dept.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                {dept.isSpecial ? (
                  <Badge variant="default">Modul Keuangan</Badge>
                ) : (
                  <Badge variant="secondary">Catatan Standar</Badge>
                )}
              </div>
              <CardTitle className="mt-2 text-lg">{dept.nama}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">
                {dept.deskripsi}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex gap-2">
              <Link
                href={dept.slug === "bendahara" ? "/bagian/bendahara" : `/bagian/${dept.slug}`}
                className="flex-1"
              >
                <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                  <span>Lihat Catatan</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
              <Link href={`/struktur/${dept.slug}/agenda`}>
                <Button variant="ghost" size="sm" className="text-xs gap-1" title="Kelola Agenda Struktur">
                  <FolderKanban className="h-3.5 w-3.5" />
                  <span>Agenda</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
