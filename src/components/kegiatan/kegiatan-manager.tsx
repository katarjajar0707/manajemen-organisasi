'use client';

import { useState, useMemo, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  LayoutList,
  LayoutGrid,
  AlertCircle,
} from 'lucide-react';
import {
  KegiatanData,
  createKegiatan,
  updateKegiatan,
  deleteKegiatan,
} from '@/actions/kegiatan';
import { StatCard } from './components/stat-card';
import { MiniCalendar } from './components/mini-calendar';
import { KegiatanFormDialog, KegiatanFormData } from './components/kegiatan-form-dialog';
import { DeleteKegiatanDialog } from './components/delete-kegiatan-dialog';
import { KegiatanCard } from './components/kegiatan-card';

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

export function KegiatanManager({
  initialKegiatan = [],
  userRole = 'anggota',
  currentUserId,
}: KegiatanManagerProps) {
  const [kegiatan, setKegiatan] = useState<KegiatanData[]>(initialKegiatan);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editTarget, setEditTarget] = useState<KegiatanData | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<KegiatanData | null>(null);

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAdminOrKetua = userRole === 'admin' || userRole === 'ketua';

  // Filtered
  const filtered = useMemo(() => {
    return kegiatan.filter((k) => {
      const matchSearch =
        k.judul.toLowerCase().includes(search.toLowerCase()) ||
        k.lokasi.toLowerCase().includes(search.toLowerCase()) ||
        k.penanggungJawab.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'Semua' || k.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [kegiatan, search, statusFilter]);

  // Counts
  const counts = useMemo(
    () => ({
      total: kegiatan.length,
      mendatang: kegiatan.filter((k) => k.status === 'Mendatang').length,
      berlangsung: kegiatan.filter((k) => k.status === 'Berlangsung').length,
      selesai: kegiatan.filter((k) => k.status === 'Selesai').length,
      totalFoto: kegiatan.reduce((acc, curr) => acc + curr.totalFoto, 0),
    }),
    [kegiatan]
  );

  const handleOpenCreate = () => {
    setEditTarget(null);
    setFormMode('create');
    setErrorMessage(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (k: KegiatanData) => {
    setEditTarget(k);
    setFormMode('edit');
    setErrorMessage(null);
    setFormOpen(true);
  };

  const handleSaveForm = (data: KegiatanFormData) => {
    setErrorMessage(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set('judul', data.judul);
      formData.set('deskripsi', data.deskripsi);
      formData.set('tanggal_mulai', data.tanggalMulai);
      formData.set('tanggal_selesai', data.tanggalSelesai);
      formData.set('lokasi', data.lokasi);
      formData.set('target_rab', String(data.targetRab || 0));

      if (formMode === 'edit' && editTarget) {
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
                  targetRab: data.targetRab || 0,
                  bagianNama: 'Semua Bagian',
                  penanggungJawab: 'Semua Bagian',
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
          waktuMulai: '00:00',
          waktuSelesai: '23:59',
          lokasi: data.lokasi,
          bagianId: '',
          bagianNama: 'Semua Bagian',
          penanggungJawab: 'Semua Bagian',
          totalFoto: 0,
          status: 'Mendatang',
          dibuatOleh: currentUserId || '',
          createdAt: new Date().toISOString(),
          targetRab: data.targetRab || 0,
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
        {isAdminOrKetua ? (
          <Button
            size="sm"
            className="gap-2 bg-primary hover:bg-primary/90 text-xs h-8"
            onClick={handleOpenCreate}
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kegiatan</span>
          </Button>
        ) : (
          <Badge variant="outline" className="text-xs py-1 px-2.5 gap-1.5 text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Pembuatan agenda/kegiatan khusus Ketua & Admin</span>
          </Badge>
        )}
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
        {/* Left 2 Cols: Event List / Grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card border rounded-xl p-3 shadow-xs">
            <div className="relative w-full sm:w-64 flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari judul atau lokasi kegiatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-muted/30 w-full"
              />
            </div>

            <div className="flex items-center justify-end gap-2 shrink-0">
              <div className="flex items-center border rounded-lg p-0.5 bg-muted/30">
                <Button
                  size="icon"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  className="h-7 w-7 rounded-md"
                  onClick={() => setViewMode('list')}
                >
                  <LayoutList className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  className="h-7 w-7 rounded-md"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {['Semua', 'Berlangsung', 'Mendatang', 'Selesai'].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? 'default' : 'outline'}
                className="h-7 text-xs px-3 rounded-lg capitalize whitespace-nowrap shrink-0"
                onClick={() => setStatusFilter(st)}
              >
                {st} (
                {st === 'Semua'
                  ? counts.total
                  : st === 'Berlangsung'
                    ? counts.berlangsung
                    : st === 'Mendatang'
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
          ) : viewMode === 'list' ? (
            <div className="space-y-3">
              {filtered.map((k) => (
                <KegiatanCard
                  key={k.id}
                  kegiatan={k}
                  viewMode="list"
                  isAdminOrKetua={isAdminOrKetua}
                  onEdit={handleOpenEdit}
                  onDelete={(target) => {
                    setDeleteTarget(target);
                    setDeleteOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((k) => (
                <KegiatanCard
                  key={k.id}
                  kegiatan={k}
                  viewMode="grid"
                  isAdminOrKetua={isAdminOrKetua}
                  onEdit={handleOpenEdit}
                  onDelete={(target) => {
                    setDeleteTarget(target);
                    setDeleteOpen(true);
                  }}
                />
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
        isAdminOrKetua={isAdminOrKetua}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveForm}
      />

      {/* Delete Dialog */}
      <DeleteKegiatanDialog
        open={deleteOpen}
        kegiatan={deleteTarget}
        isPending={isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
