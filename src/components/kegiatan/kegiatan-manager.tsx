"use client";

import { useState, useMemo, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Eye,
  ShieldAlert,
  ShieldCheck,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore, UserRole } from "@/store/auth-store";

// ─── Types ───────────────────────────────────────────────────────────────────
type Kegiatan = {
  id: string;
  judul: string;
  deskripsi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  waktuMulai: string;
  waktuSelesai: string;
  lokasi: string;
  penanggungJawab: string;
  totalFoto: number;
  status: "Mendatang" | "Berlangsung" | "Selesai";
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_KEGIATAN: Kegiatan[] = [
  {
    id: "hut-ri-81",
    judul: "Festival Semarak HUT RI ke-81 & Bulan Kemerdekaan",
    deskripsi:
      "Rangkaian perayaan 1 bulan penuh (17 Agustus – 17 September 2026) mencakup aneka perlombaan antar-RT, panggung seni budaya pemuda, bazar UMKM warga, dan malam syukuran puncak.",
    tanggalMulai: "2026-08-17",
    tanggalSelesai: "2026-09-17",
    waktuMulai: "08:00",
    waktuSelesai: "23:00",
    lokasi: "Balai Warga & Lapangan RW 05",
    penanggungJawab: "Panitia HUT RI (Ketua & Acara)",
    totalFoto: 14,
    status: "Berlangsung",
  },
  {
    id: "1",
    judul: "Kerja Bakti Lingkungan Bersih",
    deskripsi:
      "Pembersihan selokan, pengecatan gapura, dan penanaman bibit pohon menyambut bulan kemerdekaan. Seluruh warga RT 01–06 diharapkan hadir.",
    tanggalMulai: "2026-09-14",
    tanggalSelesai: "2026-09-14",
    waktuMulai: "07:30",
    waktuSelesai: "12:00",
    lokasi: "Balai RW 05, Jl. Melati No. 12",
    penanggungJawab: "Seksi Lingkungan & Acara",
    totalFoto: 8,
    status: "Mendatang",
  },
  {
    id: "2",
    judul: "Rapat Koordinasi Panitia HUT RI ke-81",
    deskripsi:
      "Finalisasi anggaran kegiatan, teknis pelaksanaan lomba anak-anak, ibu-ibu, dan bapak-bapak, serta persiapan malam tirakatan 17 Agustus.",
    tanggalMulai: "2026-09-20",
    tanggalSelesai: "2026-09-20",
    waktuMulai: "19:30",
    waktuSelesai: "22:00",
    lokasi: "Sekretariat Katar, Jl. Anggrek No. 3",
    penanggungJawab: "Pengurus Inti",
    totalFoto: 3,
    status: "Mendatang",
  },
  {
    id: "3",
    judul: "Turnamen Badminton Antar RT",
    deskripsi:
      "Kompetisi badminton kategori tunggal putra, tunggal putri, dan ganda campuran untuk mempererat tali silaturahmi warga.",
    tanggalMulai: "2026-09-28",
    tanggalSelesai: "2026-09-29",
    waktuMulai: "08:00",
    waktuSelesai: "17:00",
    lokasi: "Lapangan Serbaguna RW 05",
    penanggungJawab: "Seksi Olahraga",
    totalFoto: 0,
    status: "Mendatang",
  },
  {
    id: "4",
    judul: "Bakti Sosial Pembagian Sembako",
    deskripsi:
      "Kegiatan sosial kemasyarakatan berupa pembagian paket sembako bagi warga yang membutuhkan di wilayah RW 05.",
    tanggalMulai: "2026-08-15",
    tanggalSelesai: "2026-08-15",
    waktuMulai: "09:00",
    waktuSelesai: "13:00",
    lokasi: "Masjid Al-Ikhlas RW 05",
    penanggungJawab: "Seksi Sosial",
    totalFoto: 21,
    status: "Selesai",
  },
  {
    id: "5",
    judul: "Pelatihan Digital Marketing untuk Pemuda",
    deskripsi:
      "Workshop intensif memanfaatkan media sosial dan marketplace untuk mengembangkan potensi wirausaha muda warga Karang Taruna.",
    tanggalMulai: "2026-08-02",
    tanggalSelesai: "2026-08-03",
    waktuMulai: "13:00",
    waktuSelesai: "17:00",
    lokasi: "Balai Serba Guna Kelurahan",
    penanggungJawab: "Kominfo & Bisnis",
    totalFoto: 15,
    status: "Selesai",
  },
];

const BAGIAN_OPTIONS = [
  "Pengurus Inti",
  "Seksi Lingkungan & Acara",
  "Seksi Sosial",
  "Seksi Olahraga",
  "Kominfo & Bisnis",
  "Seksi Sarpras",
  "Bendahara",
];

const STATUS_COLOR: Record<string, string> = {
  Mendatang: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Berlangsung: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Selesai: "bg-muted text-muted-foreground border-border",
};

// ─── Helper: format tanggal ───────────────────────────────────────────────────
function formatTanggal(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTanggalShort(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar({ kegiatan }: { kegiatan: Kegiatan[] }) {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const firstDay = new Date(current.year, current.month, 1).getDay();

  const eventDays = useMemo(() => {
    const map: Record<number, Kegiatan[]> = {};
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
    <Card>
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
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Kegiatan Bulan Ini</p>
            {Object.entries(eventDays)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([day, evs]) =>
                evs.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-2 text-xs">
                    <span className="w-6 text-right shrink-0 font-medium text-primary">{day}</span>
                    <span className="text-muted-foreground leading-tight">{ev.judul}</span>
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
  onClose,
  onConfirm,
}: {
  open: boolean;
  kegiatan: Kegiatan | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Hapus Kegiatan</DialogTitle>
          <DialogDescription>
            Yakin menghapus kegiatan{" "}
            <strong className="text-foreground">&quot;{kegiatan?.judul}&quot;</strong>? Data
            dokumentasi foto yang terkait akan ikut terhapus.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Hapus Kegiatan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Form Dialog ──────────────────────────────────────────────────────────────
function KegiatanFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial: Partial<Kegiatan> | null;
  onClose: () => void;
  onSave: (data: Omit<Kegiatan, "id" | "totalFoto">) => void;
}) {
  const emptyForm: Omit<Kegiatan, "id" | "totalFoto"> = {
    judul: "",
    deskripsi: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    waktuMulai: "08:00",
    waktuSelesai: "12:00",
    lokasi: "",
    penanggungJawab: "",
    status: "Mendatang",
  };

  const [form, setForm] = useState<Omit<Kegiatan, "id" | "totalFoto">>(
    initial ? { ...emptyForm, ...initial } as Omit<Kegiatan, "id" | "totalFoto"> : emptyForm
  );

  const set = (k: keyof Omit<Kegiatan, "id" | "totalFoto">, v: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setForm((prev) => ({ ...prev, [k]: v }) as Omit<Kegiatan, "id" | "totalFoto">);

  const handleSave = () => {
    if (!form.judul || !form.tanggalMulai || !form.lokasi || !form.penanggungJawab) return;
    onSave(form);
  };

  // Reset when dialog opens
  useEffect(() => {
    if (open) setForm(initial ? { ...emptyForm, ...initial } as Omit<Kegiatan, "id" | "totalFoto"> : emptyForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah Kegiatan Baru" : "Edit Kegiatan"}
          </DialogTitle>
          <DialogDescription>
            Isi detail kegiatan. Tanggal dan waktu wajib diisi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="judul">Judul Kegiatan *</Label>
            <Input
              id="judul"
              placeholder="contoh: Kerja Bakti Lingkungan"
              value={form.judul}
              onChange={(e) => set("judul", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              placeholder="Keterangan detail kegiatan..."
              rows={3}
              value={form.deskripsi}
              onChange={(e) => set("deskripsi", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="tglMulai">Tanggal Mulai *</Label>
              <Input
                id="tglMulai"
                type="date"
                value={form.tanggalMulai}
                onChange={(e) => set("tanggalMulai", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tglSelesai">Tanggal Selesai</Label>
              <Input
                id="tglSelesai"
                type="date"
                value={form.tanggalSelesai}
                onChange={(e) => set("tanggalSelesai", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="waktuMulai">Jam Mulai</Label>
              <Input
                id="waktuMulai"
                type="time"
                value={form.waktuMulai}
                onChange={(e) => set("waktuMulai", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waktuSelesai">Jam Selesai</Label>
              <Input
                id="waktuSelesai"
                type="time"
                value={form.waktuSelesai}
                onChange={(e) => set("waktuSelesai", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lokasi">Lokasi *</Label>
            <Input
              id="lokasi"
              placeholder="contoh: Balai RW 05"
              value={form.lokasi}
              onChange={(e) => set("lokasi", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Bagian Penanggung Jawab *</Label>
            <Select
              value={form.penanggungJawab}
              onValueChange={(v) => set("penanggungJawab", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih bagian..." />
              </SelectTrigger>
              <SelectContent>
                {BAGIAN_OPTIONS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => set("status", v as Kegiatan["status"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mendatang">Mendatang</SelectItem>
                <SelectItem value="Berlangsung">Berlangsung</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={!form.judul || !form.tanggalMulai || !form.lokasi || !form.penanggungJawab}
          >
            {mode === "create" ? "Tambah Kegiatan" : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────
function KegiatanDetailDialog({
  open,
  kegiatan,
  onClose,
  onEdit,
}: {
  open: boolean;
  kegiatan: Kegiatan | null;
  onClose: () => void;
  onEdit: () => void;
}) {
  if (!kegiatan) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`border text-xs ${STATUS_COLOR[kegiatan.status]}`}>
              {kegiatan.status}
            </Badge>
            <span className="text-xs text-muted-foreground">{kegiatan.penanggungJawab}</span>
          </div>
          <DialogTitle className="text-xl leading-snug">{kegiatan.judul}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{kegiatan.deskripsi}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/40 p-3 space-y-0.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Tanggal
              </p>
              <p className="text-sm font-medium">
                {formatTanggalShort(kegiatan.tanggalMulai)}
                {kegiatan.tanggalSelesai !== kegiatan.tanggalMulai &&
                  ` – ${formatTanggalShort(kegiatan.tanggalSelesai)}`}
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 space-y-0.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Waktu
              </p>
              <p className="text-sm font-medium">
                {kegiatan.waktuMulai} – {kegiatan.waktuSelesai}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>{kegiatan.lokasi}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Camera className="h-4 w-4 text-primary shrink-0" />
            <Link href={`/kegiatan/${kegiatan.id}/dokumentasi`} className="text-primary underline-offset-4 hover:underline">
              Lihat {kegiatan.totalFoto} Foto Dokumentasi
            </Link>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          <Button onClick={onEdit} className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Edit Kegiatan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function KegiatanManager() {
  const userRole = useAuthStore((s) => s.userRole) || "admin";
  const setUserRole = useAuthStore((s) => s.setUserRole);

  const canAccess = userRole === "admin" || userRole === "ketua";

  const [data, setData] = useState<Kegiatan[]>(INITIAL_KEGIATAN);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [view, setView] = useState<"list" | "calendar">("list");

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formInitial, setFormInitial] = useState<Partial<Kegiatan> | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Kegiatan | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Kegiatan | null>(null);

  const filtered = useMemo(() => {
    return data.filter((k) => {
      const matchSearch =
        !search ||
        k.judul.toLowerCase().includes(search.toLowerCase()) ||
        k.lokasi.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "semua" || k.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [data, search, filterStatus]);

  const stats = useMemo(() => ({
    total: data.length,
    mendatang: data.filter((k) => k.status === "Mendatang").length,
    berlangsung: data.filter((k) => k.status === "Berlangsung").length,
    selesai: data.filter((k) => k.status === "Selesai").length,
    totalFoto: data.reduce((s, k) => s + k.totalFoto, 0),
  }), [data]);

  const openCreate = () => {
    setFormMode("create");
    setFormInitial(null);
    setFormOpen(true);
  };

  const openEdit = (k: Kegiatan) => {
    setDetailOpen(false);
    setFormMode("edit");
    setFormInitial(k);
    setFormOpen(true);
  };

  const openDetail = (k: Kegiatan) => {
    setDetailItem(k);
    setDetailOpen(true);
  };

  const openDelete = (k: Kegiatan) => {
    setDeleteItem(k);
    setDeleteOpen(true);
  };

  const handleSave = (form: Omit<Kegiatan, "id" | "totalFoto">) => {
    if (formMode === "create") {
      const newItem: Kegiatan = {
        ...form,
        id: Date.now().toString(),
        totalFoto: 0,
      };
      setData((prev) => [newItem, ...prev]);
    } else if (formInitial?.id) {
      setData((prev) =>
        prev.map((k) => (k.id === formInitial.id ? { ...k, ...form } : k))
      );
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteItem) setData((prev) => prev.filter((k) => k.id !== deleteItem.id));
    setDeleteOpen(false);
    setDeleteItem(null);
  };

  // Guard: Hanya Ketua dan Admin yang dapat mengakses halaman Kegiatan
  if (!canAccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <Card className="border-destructive/30 shadow-md p-6 bg-card/80">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <Badge variant="destructive" className="mb-2 text-xs">
            Akses Dibatasi: Khusus Ketua & Admin
          </Badge>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Halaman Manajemen Kegiatan
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
            Sesuai kebijakan Karang Taruna, penyusunan agenda kegiatan, pembentukan kepanitiaan, dan pengelolaan jadwal hanya dapat diakses dan diubah oleh <strong>Ketua</strong> atau <strong>Admin</strong>.
          </p>

          <div className="pt-6 border-t mt-6 space-y-3">
            <p className="text-xs text-muted-foreground font-medium">
              Role akun Anda saat ini: <span className="font-bold text-foreground capitalize">{userRole}</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="text-xs">
                  Kembali ke Dashboard
                </Button>
              </Link>
              <Button
                size="sm"
                className="text-xs gap-1.5 bg-primary hover:bg-primary/90"
                onClick={() => setUserRole("ketua")}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Simulasikan Akses sebagai Ketua</span>
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="text-xs gap-1.5"
                onClick={() => setUserRole("admin")}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Simulasikan sebagai Admin</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role Access Indicator & Simulator Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Akses Diberikan: Terverifikasi sebagai{" "}
            <strong className="uppercase font-bold">{userRole}</strong> (Hak Akses Kelola Kegiatan Aktif)
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-muted-foreground">Tes Hak Akses:</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10"
            onClick={() => setUserRole("anggota")}
            title="Ubah role ke Anggota untuk melihat tampilan terproteksi"
          >
            Simulasi Role Anggota (Kunci)
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Kalender & Jadwal Kegiatan</h1>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
              Ketua & Admin Only
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Agenda jadwal kegiatan kepemudaan, sosial, dan kepanitiaan warga.
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          <span>Tambah Kegiatan</span>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Kegiatan"
          value={stats.total}
          sub="semua periode"
          color="bg-card border"
        />
        <StatCard
          label="Mendatang"
          value={stats.mendatang}
          sub="jadwal berikutnya"
          color="bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-blue-300"
        />
        <StatCard
          label="Selesai"
          value={stats.selesai}
          sub="kegiatan terlaksana"
          color="bg-muted/40 border"
        />
        <StatCard
          label="Total Foto"
          value={stats.totalFoto}
          sub="dokumentasi kegiatan"
          color="bg-card border"
        />
      </div>

      {/* Tab: List / Kalender */}
      <Tabs value={view} onValueChange={(v) => setView(v as "list" | "calendar")}>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <LayoutList className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              Kalender
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari kegiatan..."
                className="pl-8 h-9 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9 w-[125px] shrink-0 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Status</SelectItem>
                <SelectItem value="Mendatang">Mendatang</SelectItem>
                <SelectItem value="Berlangsung">Berlangsung</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* LIST VIEW */}
        <TabsContent value="list" className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Tidak ada kegiatan ditemukan</p>
              <p className="text-xs mt-1">Coba ubah filter atau tambah kegiatan baru.</p>
            </div>
          ) : (
            filtered.map((ev) => (
              <Card key={ev.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                  {/* Date block */}
                  <div className="flex sm:flex-col items-center sm:items-center justify-start sm:justify-center gap-3 sm:gap-0 sm:w-20 shrink-0">
                    <div className="text-center bg-primary/10 rounded-lg p-2 sm:p-3 sm:w-full">
                      <p className="text-[10px] font-semibold uppercase text-primary tracking-wider">
                        {new Date(ev.tanggalMulai + "T00:00:00").toLocaleDateString("id-ID", { month: "short" })}
                      </p>
                      <p className="text-2xl sm:text-3xl font-extrabold text-primary leading-none">
                        {new Date(ev.tanggalMulai + "T00:00:00").getDate()}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge className={`border text-[10px] ${STATUS_COLOR[ev.status]}`}>
                        {ev.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {ev.penanggungJawab}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-base leading-snug">{ev.judul}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {ev.deskripsi}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {ev.waktuMulai} – {ev.waktuSelesai}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {ev.lokasi}
                      </span>
                      {ev.totalFoto > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Camera className="h-3.5 w-3.5" />
                          {ev.totalFoto} foto
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap sm:flex-col gap-1.5 items-center sm:items-end justify-start sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 sm:h-8 px-2 text-xs gap-1"
                      onClick={() => openDetail(ev)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Detail
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-xs gap-1"
                      onClick={() => openEdit(ev)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Link href={`/kegiatan/${ev.id}/dokumentasi`}>
                      <Button variant="outline" size="sm" className="h-8 px-2 text-xs gap-1">
                        <Camera className="h-3.5 w-3.5" />
                        Foto
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => openDelete(ev)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* CALENDAR VIEW */}
        <TabsContent value="calendar" className="mt-4">
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            <MiniCalendar kegiatan={data} />
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Kegiatan Mendatang
              </h3>
              {data
                .filter((k) => k.status === "Mendatang")
                .sort((a, b) => a.tanggalMulai.localeCompare(b.tanggalMulai))
                .map((ev) => (
                  <Card key={ev.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={`border text-[10px] ${STATUS_COLOR[ev.status]}`}>
                          {ev.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTanggalShort(ev.tanggalMulai)}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm leading-snug">{ev.judul}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {ev.lokasi}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs w-full gap-1"
                        onClick={() => openDetail(ev)}
                      >
                        <Eye className="h-3 w-3" /> Lihat Detail
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <KegiatanFormDialog
        open={formOpen}
        mode={formMode}
        initial={formInitial}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
      <KegiatanDetailDialog
        open={detailOpen}
        kegiatan={detailItem}
        onClose={() => setDetailOpen(false)}
        onEdit={() => detailItem && openEdit(detailItem)}
      />
      <DeleteDialog
        open={deleteOpen}
        kegiatan={deleteItem}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
