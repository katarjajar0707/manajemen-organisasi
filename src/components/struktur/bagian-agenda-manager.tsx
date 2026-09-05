"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, Plus, ArrowRight, FolderKanban, Users, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { AgendaData, createAgenda } from "@/actions/agenda";

interface BagianAgendaManagerProps {
  bagian: {
    id: string;
    nama: string;
    slug: string;
  };
  initialAgendas: AgendaData[];
  userRole: string;
}

export function BagianAgendaManager({
  bagian,
  initialAgendas,
  userRole,
}: BagianAgendaManagerProps) {
  const [agendas, setAgendas] = useState<AgendaData[]>(initialAgendas);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [namaAgenda, setNamaAgenda] = useState("");
  const [periodeAgenda, setPeriodeAgenda] = useState("Periode 2025–2027");
  const [deskripsi, setDeskripsi] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isAdminOrKetua = userRole === "admin" || userRole === "ketua";

  const handleCreateAgenda = () => {
    if (!namaAgenda.trim()) {
      setErrorMessage("Nama agenda wajib diisi.");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("nama_agenda", namaAgenda);
      formData.set("bagian_id", bagian.id);
      formData.set("nama_periode", periodeAgenda || "Periode 2025–2027");
      formData.set("deskripsi", deskripsi);

      const res = await createAgenda(formData);
      if (res.error) {
        setErrorMessage(res.error);
        return;
      }

      const newAgenda: AgendaData = {
        id: res.agendaId || Date.now().toString(),
        nama: namaAgenda,
        bagian: bagian.nama,
        bagianSlug: bagian.slug,
        bagianId: bagian.id,
        periode: periodeAgenda || "Periode 2025–2027",
        activePeriodeId: null,
        status: "Aktif",
        totalAnggota: 0,
        deskripsi,
        penanggungJawab: `Pengurus (${userRole})`,
        createdAt: new Date().toISOString(),
      };

      setAgendas([newAgenda, ...agendas]);
      setIsDialogOpen(false);
      setNamaAgenda("");
      setDeskripsi("");
    });
  };

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
          <h1 className="text-2xl font-bold tracking-tight">Agenda Organisasi: {bagian.nama}</h1>
          <p className="text-sm text-muted-foreground">
            Daftar kepanitiaan / kepengurusan khusus untuk bagian {bagian.nama}.
          </p>
        </div>
        {isAdminOrKetua && (
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-xs" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Tambah Agenda ({userRole})</span>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Agenda Bagian</CardTitle>
          <CardDescription>Pilih agenda untuk melihat periode kepengurusan dan bagan anggotanya.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {agendas.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <FolderKanban className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Belum ada agenda untuk bagian {bagian.nama}</p>
              {isAdminOrKetua && (
                <p className="text-xs mt-1">Klik tombol di atas untuk membuat agenda baru.</p>
              )}
            </div>
          ) : (
            agendas.map((ag) => (
              <div
                key={ag.id}
                className="flex items-center justify-between p-3.5 rounded-lg border bg-card/60 hover:bg-card/90 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{ag.nama}</h4>
                    <Badge variant={ag.status === "Aktif" ? "default" : "secondary"} className="text-[10px]">
                      {ag.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Periode: {ag.periode}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-primary" />
                      {ag.totalAnggota} Anggota
                    </span>
                  </div>
                  {ag.deskripsi && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{ag.deskripsi}</p>
                  )}
                </div>
                <Link href={`/struktur/${bagian.slug}/agenda/${ag.id}`}>
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    <span>Detail Bagan</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Dialog Buat Agenda */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              <span>Tambah Agenda Bagian: {bagian.nama}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Buat agenda atau kepanitiaan baru di bawah bagian {bagian.nama}.
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Agenda / Panitia *</Label>
              <Input
                value={namaAgenda}
                onChange={(e) => setNamaAgenda(e.target.value)}
                placeholder="Contoh: Panitia HUT RI ke-81 Bagian Acara"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Nama Periode Awal</Label>
              <Input
                value={periodeAgenda}
                onChange={(e) => setPeriodeAgenda(e.target.value)}
                placeholder="Contoh: Periode 2025–2027"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Deskripsi Singkat</Label>
              <Textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Deskripsi tugas atau program kerja agenda ini..."
                rows={3}
                className="text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setIsDialogOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="text-xs bg-primary hover:bg-primary/90 gap-1.5"
              onClick={handleCreateAgenda}
              disabled={isPending}
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Simpan Agenda</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
