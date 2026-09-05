import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Wallet,
  Users,
  Calendar,
  Megaphone,
  MessagesSquare,
  ArrowRight,
  TrendingUp,
  PlusCircle,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Internal</h1>
          <p className="text-sm text-muted-foreground">
            Selamat datang di sistem manajemen dan koordinasi Karang Taruna.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link href="/diskusi" className="flex-1 sm:flex-initial">
            <Button size="sm" variant="outline" className="gap-2 w-full">
              <MessagesSquare className="h-4 w-4" />
              <span>Catatan Umum</span>
            </Button>
          </Link>
          <Link href="/kegiatan" className="flex-1 sm:flex-initial">
            <Button size="sm" className="gap-2 w-full">
              <PlusCircle className="h-4 w-4" />
              <span>Tambah Kegiatan</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Kas Bendahara
            </CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 12.850.000</div>
            <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 mt-1 gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>+Rp 1.500.000 bulan ini</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Anggota Terdata
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48 Orang</div>
            <p className="text-xs text-muted-foreground mt-1">Periode aktif 2025–2027</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kegiatan Bulan Ini
            </CardTitle>
            <Calendar className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 Acara</div>
            <p className="text-xs text-muted-foreground mt-1">1 terdekat minggu ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pengumuman Baru
            </CardTitle>
            <Megaphone className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 Info</div>
            <p className="text-xs text-muted-foreground mt-1">Ditujukan ke semua bagian</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Akses Cepat Bagian</CardTitle>
              <CardDescription>Pilih bagian untuk melihat catatan internal</CardDescription>
            </div>
            <Link href="/bagian">
              <Button variant="ghost" size="sm" className="gap-1">
                <span>Semua</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              { name: "Bendahara", slug: "bendahara", desc: "Catatan keuangan kas masuk & keluar", count: "34 Transaksi" },
              { name: "Sekretaris", slug: "sekretaris", desc: "Notula rapat & arsip persuratan", count: "18 Catatan" },
              { name: "Acara & Kegiatan", slug: "acara", desc: "Perencanaan & rundown kegiatan", count: "12 Catatan" },
              { name: "Humas & Kominfo", slug: "kominfo", desc: "Publikasi media sosial & broadcast", count: "9 Catatan" },
            ].map((dept) => (
              <Link
                key={dept.slug}
                href={dept.slug === "bendahara" ? "/bagian/bendahara" : `/bagian/${dept.slug}`}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-sm">{dept.name}</h4>
                  <p className="text-xs text-muted-foreground">{dept.desc}</p>
                </div>
                <Badge variant="secondary">{dept.count}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Diskusi & Catatan Umum Terbaru</CardTitle>
              <CardDescription>Papan komunikasi terbuka antar-bagian</CardDescription>
            </div>
            <Link href="/diskusi">
              <Button variant="ghost" size="sm" className="gap-1">
                <span>Lihat Semua</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                title: "Koordinasi Persiapan Peringatan HUT RI",
                author: "Rian (Acara)",
                tag: "@Bendahara",
                time: "2 jam lalu",
              },
              {
                title: "Update Ketersediaan Sound System Inventaris",
                author: "Diki (Inventaris)",
                tag: "@Semua",
                time: "1 hari lalu",
              },
              {
                title: "Pemberitahuan Iuran Kas Bulanan Anggota",
                author: "Siti (Bendahara)",
                tag: "@Semua",
                time: "3 hari lalu",
              },
            ].map((disc, idx) => (
              <div key={idx} className="p-3 rounded-lg border bg-card space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{disc.title}</h4>
                  <Badge variant="outline" className="text-primary text-[10px]">{disc.tag}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Oleh {disc.author} • {disc.time}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
