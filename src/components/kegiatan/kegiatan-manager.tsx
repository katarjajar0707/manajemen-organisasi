"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Camera,
  Pencil,
  Trash2,
  Search,
  Clock,
  Users,
  LayoutList,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Building2,
} from "lucide-react";
import Link from "next/link";
import {
  KegiatanData,
  createKegiatan,
  updateKegiatan,
  deleteKegiatan,
} from "@/actions/kegiatan";

interface BagianItem {
  id: string;
  nama: string;
  slug: string;
}

interface KegiatanManagerProps {
  initialKegiatan?: KegiatanData[];
  bagianList?: BagianItem[];
  userRole?: string;
  currentUserId?: string;
  currentUserBagianId?: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  Mendatang: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Berlangsung: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Selesai: "bg-muted text-muted-foreground border-border",
};

function formatTanggal(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTanggalShort(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar({
  kegiatan,
  onSelectDate,
}: {
  kegiatan: KegiatanData[];
  onSelectDate?: (dateStr: string) => void;
}) {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const firstDay = new Date(current.year, current.month, 1).getDay();

  const eventDays = useMemo(() => {
    const map: Record<number, KegiatanData[]> = {};
    kegiatan.forEach((ev) => {
      const d = new Date(ev.tanggalMulai + "T00:00:00");
      if (d.getMonth() === current.month && d.getFullYear() === current.year) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(ev);
      }
    });
    return map;
  }, [kegiatan, current]);

  const monthName = new Date(current.year, current.month).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const prev = () =>
    setCurrent((c) => {
      const m = c.month - 1;
      return m < 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: m };
    });
  const next = () =>
    setCurrent((c) => {
      const m = c.month + 1;
      return m > 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: m };
    });

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <Card className="border shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base capitalize">{monthName}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={next}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] font-medium text-muted-foreground mb-1">
          {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, i) => {
            const isToday =
              day === today.getDate() &&
              current.month === today.getMonth() &&
              current.year === today.getFullYear();
            const events = day ? eventDays[day] : null;
            return (
              <div
                key={i}
                className={`relative aspect-square flex flex-col items-center justify-center rounded text-xs cursor-default
                  ${day ? "hover:bg-muted/60" : ""}
                  ${isToday ? "bg-primary text-primary-foreground font-bold" : ""}
                `}
              >
                {day && (
                  <>
                    <span>{day}</span>
                    {events && events.length > 0 && !isToday && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {events.slice(0, 2).map((_, idx) => (
                          <span key={idx} className="h-1 w-1 rounded-full bg-primary" />
                        ))}
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Upcoming in this month */}
        {Object.keys(eventDays).length > 0 && (
          <div className="mt-4 space-y-2 border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground">Kegiatan Bulan Ini</p>
            {Object.entries(eventDays)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([day, evs]) =>
                evs.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-2 text-xs">
                    <span className="w-6 text-right shrink-0 font-medium text-primary">{day}</span>
                    <span className="text-muted-foreground leading-tight line-clamp-1">{ev.judul}</span>
                  </div>
                ))
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs opacity-60 mt-0.5">{sub}</p>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteDialog({
  open,
  kegiatan,
  isPending,
  onClose,
  onConfirm,
}: {
  open: boolean;
  kegiatan: KegiatanData | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-destructive">Hapus Kegiatan</DialogTitle>
          <DialogDescription className="text-xs">
            Yakin ingin menghapus kegiatan{" "}
            <strong className="text-foreground">&quot;{kegiatan?.judul}&quot;</strong>? Seluruh foto dokumentasi
            yang terkait juga akan terhapus.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-3">
          <Button variant="outline" size="sm" className="text-xs" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button variant="destructive" size="sm" className="text-xs gap-1.5" onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Hapus Kegiatan</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Form Dialog ──────────────────────────────────────────────────────────────
interface KegiatanFormData {
  judul: string;
  deskripsi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  lokasi: string;
}

function KegiatanFormDialog({
  open,
  mode,
  initial,
  isPending,
  errorMessage,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial: Partial<KegiatanData> | null;
  isPending: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSave: (data: KegiatanFormData) => void;
}) {
  const emptyForm: KegiatanFormData = {
    judul: "",
    deskripsi: "",
    tanggalMulai: new Date().toISOString().split("T")[0],
    tanggalSelesai: new Date().toISOString().split("T")[0],
    lokasi: "Balai Warga RW 05",
  };

  const [form, setForm] = useState<KegiatanFormData>(emptyForm);

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          judul: initial.judul || "",
          deskripsi: initial.deskripsi || "",
          tanggalMulai: initial.tanggalMulai || emptyForm.tanggalMulai,
          tanggalSelesai: initial.tanggalSelesai || initial.tanggalMulai || emptyForm.tanggalSelesai,
          lokasi: initial.lokasi || "Balai Warga RW 05",
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, initial]);

  const handleSave = () => {
    if (!form.judul || !form.tanggalMulai) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <span>{mode === "create" ? "Tambah Jadwal Kegiatan Baru" : "Edit Jadwal Kegiatan"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Jadwal ini akan otomatis tampil di kalender organisasi dan dashboard transparansi warga.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-3.5 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Judul Kegiatan *</Label>
            <Input
              placeholder="Contoh: Kerja Bakti Lingkungan RW 05"
              value={form.judul}
              onChange={(e) => setForm((p) => ({ ...p, judul: e.target.value }))}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Deskripsi Kegiatan *</Label>
            <Textarea
              placeholder="Jelaskan tujuan kegiatan, susunan acara, dan imbauan..."
              rows={3}
              value={form.deskripsi}
              onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
              className="text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tanggal Mulai *</Label>
              <Input
                type="date"
                value={form.tanggalMulai}
                onChange={(e) => setForm((p) => ({ ...p, tanggalMulai: e.target.value }))}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tanggal Selesai</Label>
              <Input
                type="date"
                value={form.tanggalSelesai}
                onChange={(e) => setForm((p) => ({ ...p, tanggalSelesai: e.target.value }))}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Lokasi Kegiatan</Label>
            <Input
              placeholder="Contoh: Balai Warga & Lapangan RW 05"
              value={form.lokasi}
              onChange={(e) => setForm((p) => ({ ...p, lokasi: e.target.value }))}
              className="text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button
            size="sm"
            className="text-xs bg-primary hover:bg-primary/90 gap-1.5"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{mode === "create" ? "Simpan Jadwal" : "Perbarui Jadwal"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function KegiatanManager({
  initialKegiatan = [],
  bagianList = [],
  userRole = "anggota",
  currentUserId,
  currentUserBagianId,
}: KegiatanManagerProps) {
  const [kegiatan, setKegiatan] = useState<KegiatanData[]>(initialKegiatan);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editTarget, setEditTarget] = useState<KegiatanData | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<KegiatanData | null>(null);

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAdminOrKetua = userRole === "admin" || userRole === "ketua";

  // Filtered
  const filtered = useMemo(() => {
    return kegiatan.filter((k) => {
      const matchSearch =
        k.judul.toLowerCase().includes(search.toLowerCase()) ||
        k.lokasi.toLowerCase().includes(search.toLowerCase()) ||
        k.penanggungJawab.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "Semua" || k.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [kegiatan, search, statusFilter]);

  // Counts
  const counts = useMemo(
    () => ({
      total: kegiatan.length,
      mendatang: kegiatan.filter((k) => k.status === "Mendatang").length,
      berlangsung: kegiatan.filter((k) => k.status === "Berlangsung").length,
      selesai: kegiatan.filter((k) => k.status === "Selesai").length,
      totalFoto: kegiatan.reduce((acc, curr) => acc + curr.totalFoto, 0),
    }),
    [kegiatan]
  );

  const handleOpenCreate = () => {
    setEditTarget(null);
    setFormMode("create");
    setErrorMessage(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (k: KegiatanData) => {
    setEditTarget(k);
    setFormMode("edit");
    setErrorMessage(null);
    setFormOpen(true);
  };

  const handleSaveForm = (data: KegiatanFormData) => {
    setErrorMessage(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("judul", data.judul);
      formData.set("deskripsi", data.deskripsi);
      formData.set("tanggal_mulai", data.tanggalMulai);
      formData.set("tanggal_selesai", data.tanggalSelesai);
      formData.set("lokasi", data.lokasi);

      if (formMode === "edit" && editTarget) {
        const res = await updateKegiatan(editTarget.id, formData);
        if (res.error) {
          setErrorMessage(res.error);
          return;
        }

        setKegiatan((prev) =>
          prev.map((k) =>
            k.id === editTarget.id
              ? {
                  ...k,
                  ...data,
                  bagianNama: "Semua Bagian",
                  penanggungJawab: "Semua Bagian",
                }
              : k
          )
        );
      } else {
        const res = await createKegiatan(formData);
        if (res.error) {
          setErrorMessage(res.error);
          return;
        }

        const newK: KegiatanData = {
          id: res.kegiatan?.id || Date.now().toString(),
          judul: data.judul,
          deskripsi: data.deskripsi,
          tanggalMulai: data.tanggalMulai,
          tanggalSelesai: data.tanggalSelesai,
          waktuMulai: "00:00",
          waktuSelesai: "23:59",
          lokasi: data.lokasi,
          bagianId: "",
          bagianNama: "Semua Bagian",
          penanggungJawab: "Semua Bagian",
          totalFoto: 0,
          status: "Mendatang",
          dibuatOleh: currentUserId || "",
          createdAt: new Date().toISOString(),
        };

        setKegiatan([newK, ...kegiatan]);
      }

      setFormOpen(false);
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      const res = await deleteKegiatan(deleteTarget.id);
      if (res.error) {
        alert(res.error);
        return;
      }

      setKegiatan((prev) => prev.filter((k) => k.id !== deleteTarget.id));
      setDeleteOpen(false);
      setDeleteTarget(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Jadwal & Acara Kegiatan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Informasi seluruh agenda, kalender bulanan, dan dokumentasi foto kegiatan Karang Taruna RW 05.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-2 bg-primary hover:bg-primary/90 text-xs h-8"
          onClick={handleOpenCreate}
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Kegiatan</span>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Kegiatan"
          value={counts.total}
          sub="Tercatat dalam sistem"
          color="bg-card border-border"
        />
        <StatCard
          label="Sedang Berlangsung"
          value={counts.berlangsung}
          sub="Aktif saat ini"
          color="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
        />
        <StatCard
          label="Akan Datang"
          value={counts.mendatang}
          sub="Agenda mendatang"
          color="bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400"
        />
        <StatCard
          label="Dokumentasi Foto"
          value={counts.totalFoto}
          sub="Foto galeri terunggah"
          color="bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
        />
      </div>

      {/* Main Content: Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tabs & Event List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card border rounded-xl p-3 shadow-xs">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari judul atau lokasi kegiatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-muted/30"
              />
            </div>

            <div className="flex items-center gap-2">

              <div className="flex items-center border rounded-lg p-0.5 bg-muted/30">
                <Button
                  size="icon"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  className="h-7 w-7 rounded-md"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  className="h-7 w-7 rounded-md"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {["Semua", "Berlangsung", "Mendatang", "Selesai"].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? "default" : "outline"}
                className="h-7 text-xs px-3 rounded-lg capitalize"
                onClick={() => setStatusFilter(st)}
              >
                {st} (
                {st === "Semua"
                  ? counts.total
                  : st === "Berlangsung"
                  ? counts.berlangsung
                  : st === "Mendatang"
                  ? counts.mendatang
                  : counts.selesai}
                )
              </Button>
            ))}
          </div>

          {/* Event Cards */}
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-14 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <CalendarIcon className="h-10 w-10 opacity-30" />
                <p className="font-semibold text-sm">Tidak ada kegiatan ditemukan</p>
                <p className="text-xs">Coba sesuaikan kata kunci pencarian atau filter status.</p>
              </CardContent>
            </Card>
          ) : viewMode === "list" ? (
            <div className="space-y-3">
              {filtered.map((k) => (
                <Card
                  key={k.id}
                  className="overflow-hidden hover:border-primary/40 transition-all border shadow-xs"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-medium ${STATUS_COLOR[k.status] || ""}`}
                          >
                            {k.status}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {k.bagianNama}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-base text-foreground leading-snug">{k.judul}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {k.deskripsi}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                        <Link href={`/kegiatan/${k.id}/dokumentasi`}>
                          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                            <Camera className="h-3.5 w-3.5" />
                            <span>{k.totalFoto} Foto</span>
                          </Button>
                        </Link>
                        {(isAdminOrKetua || k.dibuatOleh === currentUserId) && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleOpenEdit(k)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setDeleteTarget(k);
                                setDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>
                          {formatTanggalShort(k.tanggalMulai)}
                          {k.tanggalSelesai !== k.tanggalMulai ? ` – ${formatTanggalShort(k.tanggalSelesai)}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{k.lokasi}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((k) => (
                <Card
                  key={k.id}
                  className="hover:border-primary/40 transition-all border shadow-xs flex flex-col justify-between"
                >
                  <CardHeader className="p-4 pb-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${STATUS_COLOR[k.status] || ""}`}
                      >
                        {k.status}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">{k.bagianNama}</span>
                    </div>
                    <CardTitle className="text-sm font-bold leading-snug line-clamp-2">
                      {k.judul}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {k.deskripsi}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-2 text-xs text-muted-foreground">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">
                          {formatTanggalShort(k.tanggalMulai)}
                          {k.tanggalSelesai !== k.tanggalMulai ? ` – ${formatTanggalShort(k.tanggalSelesai)}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{k.lokasi}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Link href={`/kegiatan/${k.id}/dokumentasi`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                          <Camera className="h-3.5 w-3.5" />
                          <span>{k.totalFoto} Foto</span>
                        </Button>
                      </Link>
                      {(isAdminOrKetua || k.dibuatOleh === currentUserId) && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleOpenEdit(k)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => {
                              setDeleteTarget(k);
                              setDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Mini Calendar & Info */}
        <div className="space-y-4">
          <MiniCalendar kegiatan={kegiatan} />

          <Card className="border shadow-xs bg-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Informasi & Prosedur
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-muted-foreground leading-relaxed">
              <p>
                • Seluruh jadwal kegiatan yang dicatat di sini otomatis terhubung dengan kalender publik warga.
              </p>
              <p>
                • Klik ikon kamera pada setiap kartu kegiatan untuk mengunggah foto dokumentasi resmi acara.
              </p>
              <p>
                • Sesuai PRD, modul kegiatan berfokus pada informasi jadwal publik tanpa pencatatan presensi kehadiran.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Dialog */}
      <KegiatanFormDialog
        open={formOpen}
        mode={formMode}
        initial={editTarget}
        isPending={isPending}
        errorMessage={errorMessage}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveForm}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteOpen}
        kegiatan={deleteTarget}
        isPending={isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
