"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Phone,
  Users,
  Download,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { AnggotaDetail } from "@/actions/anggota";

interface BagianItem {
  id: string;
  nama: string;
  slug: string;
}

interface PeriodeOption {
  id: string;
  nama: string;
  isAktif: boolean;
  bagianId: string | null;
}

interface AnggotaManagerProps {
  initialMembers?: AnggotaDetail[];
  metadata?: {
    daftarBagian: BagianItem[];
    daftarPeriode: PeriodeOption[];
  };
  userRole?: string;
}

const RT_OPTIONS = ["Semua RT", "RT 01", "RT 02", "RT 03", "RT 04", "RT 05", "RT 06"];

export function AnggotaManager({
  initialMembers = [],
  metadata = { daftarBagian: [], daftarPeriode: [] },
  userRole = "anggota",
}: AnggotaManagerProps) {
  const [members] = useState<AnggotaDetail[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRt, setFilterRt] = useState("Semua RT");
  const [filterStatus, setFilterStatus] = useState<"semua" | "Aktif" | "Alumni" | "Cuti">("semua");
  const [filterBagian, setFilterBagian] = useState<string>("semua");

  const isAdmin = userRole === "admin";

  const handleExportCsv = () => {
    const headers = ["Nama", "Jabatan", "Bagian", "RT/RW", "Kontak", "Status", "Periode"];
    const rows = filteredMembers.map((m) => [
      `"${m.nama}"`,
      `"${m.jabatan}"`,
      `"${m.bagian}"`,
      `"${m.rt_rw}"`,
      `"${m.kontak}"`,
      `"${m.status}"`,
      `"${m.periode}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Anggota_Karang_Taruna_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMembers = members.filter((m) => {
    if (filterStatus !== "semua" && m.status !== filterStatus) return false;
    if (filterRt !== "Semua RT" && !m.rt_rw.includes(filterRt)) return false;
    if (filterBagian !== "semua" && m.bagianId !== filterBagian) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNama = m.nama.toLowerCase().includes(q);
      const matchJabatan = m.jabatan.toLowerCase().includes(q);
      const matchBagian = m.bagian.toLowerCase().includes(q);
      const matchRt = m.rt_rw.toLowerCase().includes(q);
      if (!matchNama && !matchJabatan && !matchBagian && !matchRt) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Data Anggota Karang Taruna</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Database keanggotaan warga pemuda lengkap dengan domisili RT/RW, penugasan bagian, dan status kepengurusan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 shadow-xs text-xs h-8 flex-1 sm:flex-initial"
            onClick={handleExportCsv}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor CSV</span>
          </Button>
          {isAdmin && (
            <Link href="/pengguna">
              <Button
                size="sm"
                className="gap-1.5 shadow-sm bg-primary hover:bg-primary/90 text-xs h-8 flex-1 sm:flex-initial"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Kelola di Manajemen Pengguna</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Info Banner Sinkronisasi Terpusat */}
      <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
        <p>
          Pembuatan dan pengelolaan anggota dilakukan <strong>terpusat melalui Manajemen Pengguna</strong>. Setiap akun yang dibuat Admin otomatis tersinkronisasi ke dalam tabel anggota ini.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border rounded-xl p-3 shadow-xs">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-56 flex-1 min-w-[140px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari nama, jabatan, atau RT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-muted/30 w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={filterRt} onValueChange={setFilterRt}>
              <SelectTrigger className="h-8 text-xs flex-1 sm:w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RT_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {metadata.daftarBagian.length > 0 && (
              <Select value={filterBagian} onValueChange={setFilterBagian}>
                <SelectTrigger className="h-8 text-xs flex-1 sm:w-[130px]">
                  <SelectValue placeholder="Bagian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Bagian</SelectItem>
                  {metadata.daftarBagian.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(["semua", "Aktif", "Alumni", "Cuti"] as const).map((st) => (
            <Button
              key={st}
              size="sm"
              variant={filterStatus === st ? "default" : "ghost"}
              className="text-xs h-8 px-3 rounded-lg capitalize whitespace-nowrap shrink-0"
              onClick={() => setFilterStatus(st)}
            >
              {st === "semua" ? `Semua (${members.length})` : `${st} (${members.filter((m) => m.status === st).length})`}
            </Button>
          ))}
        </div>
      </div>

      {/* Member Cards / Table */}
      <Card className="border shadow-xs overflow-hidden">
        <CardHeader className="p-4 pb-2 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Daftar Keanggotaan ({filteredMembers.length})</span>
            </CardTitle>
            <span className="text-xs text-muted-foreground">Tersinkronisasi Terpusat</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card List (< md) */}
          <div className="md:hidden divide-y divide-border/60">
            {filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                Tidak ada anggota yang cocok dengan filter atau pencarian.
              </div>
            ) : (
              filteredMembers.map((m) => (
                <div key={m.id} className="p-3.5 space-y-2 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {m.foto_url ? (
                        <img
                          src={m.foto_url}
                          alt={m.nama}
                          className="w-9 h-9 rounded-full object-cover border shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {m.nama.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-xs sm:text-sm text-foreground truncate">{m.nama}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{m.jabatan} • {m.bagian}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        m.status === "Aktif"
                          ? "default"
                          : m.status === "Alumni"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px] py-0 px-2 shrink-0 capitalize"
                    >
                      {m.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <span>{m.rt_rw}</span>
                    <div className="flex items-center gap-1.5">
                      {m.kontak && m.kontak !== "-" && (
                        <a
                          href={`https://wa.me/${m.kontak.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2.5 gap-1 text-emerald-600 dark:text-emerald-400"
                          >
                            <Phone className="h-3 w-3" />
                            <span>WA</span>
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/30 border-b text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 font-medium">Anggota</th>
                  <th className="py-3 px-4 font-medium">Bagian / Jabatan</th>
                  <th className="py-3 px-4 font-medium">Domisili</th>
                  <th className="py-3 px-4 font-medium">Kontak</th>
                  <th className="py-3 px-4 font-medium">Periode Kepengurusan</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted-foreground text-xs">
                      Tidak ada data anggota yang cocok dengan filter atau pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {m.foto_url ? (
                            <img
                              src={m.foto_url}
                              alt={m.nama}
                              className="w-8 h-8 rounded-full object-cover border shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                              {m.nama.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{m.nama}</p>
                            <p className="text-[10px] text-muted-foreground">ID: {m.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">{m.jabatan}</p>
                        <p className="text-muted-foreground text-[11px]">{m.bagian}</p>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{m.rt_rw}</td>
                      <td className="py-3 px-4 text-muted-foreground font-mono">{m.kontak}</td>
                      <td className="py-3 px-4 text-muted-foreground">{m.periode}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            m.status === "Aktif"
                              ? "default"
                              : m.status === "Alumni"
                              ? "secondary"
                              : "outline"
                          }
                          className="capitalize text-[10px]"
                        >
                          {m.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {m.kontak && m.kontak !== "-" && (
                          <a
                            href={`https://wa.me/${m.kontak.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2 text-emerald-600 dark:text-emerald-400 gap-1"
                            >
                              <Phone className="h-3 w-3" />
                              <span>WA</span>
                            </Button>
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
