'use client';

import { useState, useMemo, useTransition, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Plus, Search, CheckCircle2, AlertTriangle, XCircle, Eye, Pencil, Trash2, ArrowRightLeft, Boxes, MapPin, Clock, User, Filter, Check, Loader2, Image as ImageIcon, History, Upload, Calendar } from 'lucide-react';
import { ItemInventaris, PeminjamanRecord, KondisiBarang, StatusBarang, KategoriBarang, createInventaris, updateInventaris, deleteInventaris, pinjamInventaris, kembalikanInventaris, getRiwayatPeminjaman } from '@/actions/inventaris';
import { uploadLampiran } from '@/actions/storage';
import { PreviewImage } from '@/components/common/preview-image';
import type { PengaturanSistemData } from '@/actions/pengaturan';

interface InventarisManagerProps {
  initialItems?: ItemInventaris[];
  initialRiwayat?: PeminjamanRecord[];
  userRole?: string;
  currentUserId?: string;
  settings?: PengaturanSistemData;
}

export function InventarisManager({ initialItems = [], initialRiwayat = [], userRole = 'anggota', currentUserId, settings }: InventarisManagerProps) {
  const [items, setItems] = useState<ItemInventaris[]>(initialItems);
  const [riwayat, setRiwayat] = useState<PeminjamanRecord[]>(initialRiwayat);
  const [activeTab, setActiveTab] = useState<'daftar' | 'riwayat'>('daftar');
  const [isPending, startTransition] = useTransition();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('all');
  const [filterKondisi, setFilterKondisi] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Notification Toast State
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'info' | 'warning';
  }>({ show: false, message: '', type: 'success' });

  const triggerNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPinjamOpen, setIsPinjamOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Selected item
  const [selectedItem, setSelectedItem] = useState<ItemInventaris | null>(null);

  // Form states for Create & Edit
  const [formData, setFormData] = useState<{
    nama: string;
    kategori: KategoriBarang;
    jumlah: number;
    satuan: string;
    kondisi: KondisiBarang;
    lokasi: string;
    fotoUrl: string;
    keterangan: string;
  }>({
    nama: '',
    kategori: 'Elektronik & Sound',
    jumlah: 1,
    satuan: 'Unit',
    kondisi: 'baik',
    lokasi: 'Ruang Sekretariat Katar',
    fotoUrl: '',
    keterangan: '',
  });

  // Form state for Peminjaman
  const [pinjamForm, setPinjamForm] = useState({
    peminjam: '',
    tanggalPinjam: new Date().toISOString().split('T')[0],
    tanggalKembaliRencana: '',
    jumlahPinjam: 1,
    keterangan: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalJenis = items.length;
    const totalUnit = items.reduce((acc, curr) => acc + curr.jumlah, 0);
    const kondisiBaik = items.filter((i) => i.kondisi === 'baik').length;
    const kondisiRusak = items.filter((i) => i.kondisi !== 'baik').length;
    const dipinjam = items.filter((i) => i.status === 'Dipinjam').length;

    return { totalJenis, totalUnit, kondisiBaik, kondisiRusak, dipinjam };
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.peminjam && item.peminjam.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchKategori = filterKategori === 'all' || item.kategori === filterKategori;
      const matchKondisi = filterKondisi === 'all' || item.kondisi === filterKondisi;
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;

      return matchSearch && matchKategori && matchKondisi && matchStatus;
    });
  }, [items, searchQuery, filterKategori, filterKondisi, filterStatus]);

  // Handle Photo Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadLampiran(file, 'inventaris');
      if (res.error || !res.url) {
        triggerNotification(res.error || 'Gagal mengunggah foto.', 'warning');
      } else {
        setFormData((prev) => ({ ...prev, fotoUrl: res.url! }));
        triggerNotification('Foto inventaris berhasil diunggah!', 'success');
      }
    } catch (err: any) {
      triggerNotification(err.message || 'Gagal mengunggah foto.', 'warning');
    } finally {
      setIsUploading(false);
    }
  };

  // Handlers
  const handleOpenCreate = () => {
    setFormData({
      nama: '',
      kategori: 'Elektronik & Sound',
      jumlah: 1,
      satuan: 'Unit',
      kondisi: 'baik',
      lokasi: 'Ruang Sekretariat Katar',
      fotoUrl: '',
      keterangan: '',
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) return;

    startTransition(async () => {
      const res = await createInventaris({
        nama: formData.nama,
        kategori: formData.kategori,
        jumlah: Number(formData.jumlah) || 1,
        satuan: formData.satuan || 'Unit',
        kondisi: formData.kondisi,
        lokasi: formData.lokasi || 'Sekretariat',
        fotoUrl: formData.fotoUrl || null,
        keterangan: formData.keterangan,
      });

      if (res.success && res.data) {
        setItems((prev) => [res.data!, ...prev]);
        setIsCreateOpen(false);
        triggerNotification(`Barang "${res.data.nama}" berhasil ditambahkan ke database!`, 'success');
      } else {
        triggerNotification(res.error || 'Gagal menambahkan barang.', 'warning');
      }
    });
  };

  const handleOpenEdit = (item: ItemInventaris) => {
    setSelectedItem(item);
    setFormData({
      nama: item.nama,
      kategori: (item.kategori as KategoriBarang) || 'Lainnya',
      jumlah: item.jumlah,
      satuan: item.satuan,
      kondisi: item.kondisi,
      lokasi: item.lokasi,
      fotoUrl: item.fotoUrl || '',
      keterangan: item.keterangan || '',
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !formData.nama.trim()) return;

    startTransition(async () => {
      const res = await updateInventaris(selectedItem.id, {
        nama: formData.nama,
        kategori: formData.kategori,
        jumlah: Number(formData.jumlah) || 1,
        satuan: formData.satuan,
        kondisi: formData.kondisi,
        lokasi: formData.lokasi,
        fotoUrl: formData.fotoUrl || null,
        keterangan: formData.keterangan,
      });

      if (res.success) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === selectedItem.id
              ? {
                  ...i,
                  nama: formData.nama,
                  kategori: formData.kategori,
                  jumlah: Number(formData.jumlah) || 1,
                  satuan: formData.satuan,
                  kondisi: formData.kondisi,
                  lokasi: formData.lokasi,
                  fotoUrl: formData.fotoUrl || null,
                  keterangan: formData.keterangan,
                }
              : i,
          ),
        );
        setIsEditOpen(false);
        triggerNotification(`Data barang "${formData.nama}" berhasil diperbarui!`, 'success');
      } else {
        triggerNotification(res.error || 'Gagal memperbarui barang.', 'warning');
      }
    });
  };

  const handleOpenDetail = (item: ItemInventaris) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (item: ItemInventaris) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteSubmit = () => {
    if (!selectedItem) return;

    startTransition(async () => {
      const res = await deleteInventaris(selectedItem.id);
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
        setIsDeleteOpen(false);
        triggerNotification(`Barang "${selectedItem.nama}" berhasil dihapus dari inventaris.`, 'warning');
        setSelectedItem(null);
      } else {
        triggerNotification(res.error || 'Gagal menghapus barang.', 'warning');
      }
    });
  };

  const handleOpenPinjam = (item: ItemInventaris) => {
    setSelectedItem(item);
    const today = new Date();
    const maxHari = parseInt(settings?.operasional.maxHariPinjamInventaris || '3') || 3;
    const defaultKembali = new Date(today);
    defaultKembali.setDate(defaultKembali.getDate() + maxHari);

    setPinjamForm({
      peminjam: item.peminjam || '',
      tanggalPinjam: item.tglPinjam || today.toISOString().split('T')[0],
      tanggalKembaliRencana: item.tglKembaliRencana || defaultKembali.toISOString().split('T')[0],
      jumlahPinjam: 1,
      keterangan: '',
    });
    setIsPinjamOpen(true);
  };

  const handlePinjamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    startTransition(async () => {
      if (selectedItem.status === 'Tersedia') {
        if (!pinjamForm.peminjam.trim()) {
          triggerNotification('Nama peminjam wajib diisi.', 'warning');
          return;
        }
        if (!pinjamForm.tanggalKembaliRencana) {
          triggerNotification('Rencana tanggal pengembalian wajib diisi.', 'warning');
          return;
        }

        const res = await pinjamInventaris({
          inventarisId: selectedItem.id,
          peminjam: pinjamForm.peminjam,
          tanggalPinjam: pinjamForm.tanggalPinjam,
          tanggalKembaliRencana: pinjamForm.tanggalKembaliRencana,
          jumlahPinjam: pinjamForm.jumlahPinjam,
          keterangan: pinjamForm.keterangan,
        });

        if (res.success) {
          setItems((prev) =>
            prev.map((i) =>
              i.id === selectedItem.id
                ? {
                    ...i,
                    status: 'Dipinjam',
                    peminjam: pinjamForm.peminjam,
                    tglPinjam: pinjamForm.tanggalPinjam,
                    tglKembaliRencana: pinjamForm.tanggalKembaliRencana,
                  }
                : i,
            ),
          );
          // Refresh riwayat
          const updatedRiwayat = await getRiwayatPeminjaman();
          setRiwayat(updatedRiwayat);
          triggerNotification(`Peminjaman "${selectedItem.nama}" oleh ${pinjamForm.peminjam} berhasil dicatat.`, 'info');
          setIsPinjamOpen(false);
        } else {
          triggerNotification(res.error || 'Gagal mencatat peminjaman.', 'warning');
        }
      } else {
        // Pengembalian barang
        if (!selectedItem.aktifPinjamId) {
          // Fallback if loan id wasn't preloaded
          const activeRecord = riwayat.find((r) => r.inventarisId === selectedItem.id && r.status === 'dipinjam');
          if (activeRecord) {
            const res = await kembalikanInventaris(activeRecord.id);
            if (res.success) {
              setItems((prev) =>
                prev.map((i) =>
                  i.id === selectedItem.id
                    ? {
                        ...i,
                        status: 'Tersedia',
                        peminjam: undefined,
                        tglPinjam: undefined,
                        tglKembaliRencana: undefined,
                        aktifPinjamId: undefined,
                      }
                    : i,
                ),
              );
              const updatedRiwayat = await getRiwayatPeminjaman();
              setRiwayat(updatedRiwayat);
              triggerNotification(`Barang "${selectedItem.nama}" telah berhasil dikembalikan!`, 'success');
              setIsPinjamOpen(false);
              return;
            }
          }
        } else {
          const res = await kembalikanInventaris(selectedItem.aktifPinjamId);
          if (res.success) {
            setItems((prev) =>
              prev.map((i) =>
                i.id === selectedItem.id
                  ? {
                      ...i,
                      status: 'Tersedia',
                      peminjam: undefined,
                      tglPinjam: undefined,
                      tglKembaliRencana: undefined,
                      aktifPinjamId: undefined,
                    }
                  : i,
              ),
            );
            const updatedRiwayat = await getRiwayatPeminjaman();
            setRiwayat(updatedRiwayat);
            triggerNotification(`Barang "${selectedItem.nama}" telah berhasil dikembalikan!`, 'success');
            setIsPinjamOpen(false);
            return;
          }
        }
        triggerNotification('Gagal memproses pengembalian barang.', 'warning');
      }
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterKategori('all');
    setFilterKondisi('all');
    setFilterStatus('all');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {notification.show && (
        <div
          className={`flex items-center justify-between p-3.5 px-4 rounded-lg border text-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : notification.type === 'warning'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-sky-500/10 border-sky-500/30 text-sky-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' && <Check className="h-4 w-4 text-emerald-400" />}
            {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
            {notification.type === 'info' && <Clock className="h-4 w-4 text-sky-400" />}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button onClick={() => setNotification((prev) => ({ ...prev, show: false }))} className="text-muted-foreground hover:text-foreground text-xs">
            Tutup
          </button>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventaris & Aset Organisasi</h1>
          <p className="text-sm text-muted-foreground">Kelola data aset, status kepemilikan, kondisi fisik, dan sirkulasi pinjam-pakai barang.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 shadow-sm font-medium w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Tambah Barang
          </Button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-card/50 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Inventaris</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-foreground">{stats.totalJenis}</span>
                <span className="text-xs text-muted-foreground">jenis ({stats.totalUnit} unit)</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Boxes className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Kondisi Baik</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-emerald-400">{stats.kondisiBaik}</span>
                <span className="text-xs text-muted-foreground">jenis</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Perlu Perbaikan</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-amber-400">{stats.kondisiRusak}</span>
                <span className="text-xs text-muted-foreground">jenis</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Sedang Dipinjam</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-sky-400">{stats.dipinjam}</span>
                <span className="text-xs text-muted-foreground">barang</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs: Daftar Barang vs Riwayat Peminjaman */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="daftar" className="gap-2">
              <Package className="h-4 w-4" />
              Daftar Barang ({items.length})
            </TabsTrigger>
            <TabsTrigger value="riwayat" className="gap-2">
              <History className="h-4 w-4" />
              Riwayat Peminjaman ({riwayat.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: DAFTAR BARANG */}
        <TabsContent value="daftar" className="space-y-4 mt-4">
          {/* Filter & Search Bar */}
          <Card className="bg-card/40 border-border/60">
            <CardContent className="p-3.5 space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Input placeholder="Cari nama barang, kategori, lokasi, atau peminjam..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full md:flex md:w-auto">
                  {/* Select Kategori */}
                  <div className="w-full md:w-48">
                    <Select value={filterKategori} onValueChange={setFilterKategori}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        <SelectItem value="Elektronik & Sound">Elektronik & Sound</SelectItem>
                        <SelectItem value="Tenda & Panggung">Tenda & Panggung</SelectItem>
                        <SelectItem value="Meja & Kursi">Meja & Kursi</SelectItem>
                        <SelectItem value="Logistik & Kebersihan">Logistik & Kebersihan</SelectItem>
                        <SelectItem value="Olahraga">Olahraga</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select Kondisi */}
                  <div className="w-full md:w-40">
                    <Select value={filterKondisi} onValueChange={setFilterKondisi}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Kondisi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kondisi</SelectItem>
                        <SelectItem value="baik">Baik</SelectItem>
                        <SelectItem value="rusak_ringan">Rusak Ringan</SelectItem>
                        <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select Status */}
                  <div className="w-full md:w-40">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Status Pinjam" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="Tersedia">Tersedia</SelectItem>
                        <SelectItem value="Dipinjam">Dipinjam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                <span>
                  Menampilkan <strong className="text-foreground">{filteredItems.length}</strong> dari {items.length} total barang
                </span>
                {(searchQuery || filterKategori !== 'all' || filterKondisi !== 'all' || filterStatus !== 'all') && (
                  <button onClick={resetFilters} className="text-primary hover:underline flex items-center gap-1 font-medium">
                    Hapus Semua Filter
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Main Data Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Daftar Inventaris Barang
                  </CardTitle>
                  <CardDescription>Daftar lengkap aset fisik karang taruna beserta kondisi dan status peminjaman.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Mobile Card List (< md) */}
              <div className="md:hidden divide-y divide-border/60">
                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-xs">Tidak ada data barang yang cocok dengan filter.</div>
                ) : (
                  filteredItems.map((item) => (
                    <div key={item.id} className="p-3.5 space-y-2.5 odd:bg-muted/20 even:bg-background hover:bg-muted/20 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge variant="outline" className="text-[10px] py-0">
                              {item.kategori}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-xs sm:text-sm text-foreground leading-snug break-words">{item.nama}</h4>
                        </div>
                        <Badge
                          variant={item.status === 'Tersedia' ? 'outline' : 'default'}
                          className={`text-[10px] shrink-0 ${item.status === 'Tersedia' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}
                        >
                          {item.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
                        <div>
                          <span className="text-[11px] block">Jumlah:</span>
                          <span className="font-medium text-foreground">
                            {item.jumlah} {item.satuan}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] block">Kondisi:</span>
                          <span className="capitalize font-medium text-foreground">{item.kondisi.replace('_', ' ')}</span>
                        </div>
                      </div>

                      {item.status === 'Dipinjam' && item.peminjam && (
                        <div className="p-2 rounded bg-sky-500/5 border border-sky-500/20 text-xs text-sky-300">
                          <div className="flex items-center gap-1 font-medium">
                            <User className="h-3 w-3" />
                            {item.peminjam}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">Rencana Kembali: {item.tglKembaliRencana || '-'}</div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.lokasi}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => handleOpenPinjam(item)}>
                            <ArrowRightLeft className="h-3 w-3 mr-1" />
                            {item.status === 'Tersedia' ? 'Pinjam' : 'Kembali'}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenDetail(item)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(item)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {(userRole === 'admin' || userRole === 'ketua') && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleOpenDelete(item)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Barang & Kategori</TableHead>
                      <TableHead className="w-24 text-center">Jumlah</TableHead>
                      <TableHead className="w-32">Kondisi</TableHead>
                      <TableHead className="w-28">Status</TableHead>
                      <TableHead className="w-40">Lokasi Simpan</TableHead>
                      <TableHead className="w-44">Status Pinjam</TableHead>
                      <TableHead className="w-32 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-sm">
                          Tidak ada inventaris barang yang sesuai dengan filter.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id} className="odd:bg-muted/20 even:bg-background hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {item.fotoUrl ? (
                                <PreviewImage src={item.fotoUrl} alt={item.nama} className="h-10 w-10 rounded object-cover border border-border shrink-0" />
                              ) : (
                                <div className="h-10 w-10 rounded bg-muted/60 border border-border flex items-center justify-center text-muted-foreground shrink-0">
                                  <Package className="h-5 w-5" />
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-sm text-foreground">{item.nama}</div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge variant="outline" className="text-[10px] py-0">
                                    {item.kategori}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold">{item.jumlah}</span> <span className="text-xs text-muted-foreground">{item.satuan}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.kondisi === 'baik' ? 'success' : item.kondisi === 'rusak_ringan' ? 'warning' : 'destructive'} className="text-xs capitalize font-medium">
                              {item.kondisi === 'baik' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {item.kondisi === 'rusak_ringan' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {item.kondisi === 'rusak_berat' && <XCircle className="h-3 w-3 mr-1" />}
                              {item.kondisi.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={item.status === 'Tersedia' ? 'outline' : 'default'}
                              className={`text-xs ${item.status === 'Tersedia' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 'bg-sky-500/10 text-sky-400 border-sky-500/20'}`}
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                              <span className="truncate max-w-[140px]" title={item.lokasi}>
                                {item.lokasi}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.status === 'Dipinjam' && item.peminjam ? (
                              <div>
                                <div className="text-xs font-medium text-foreground line-clamp-1" title={item.peminjam}>
                                  {item.peminjam}
                                </div>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Clock className="h-3 w-3 text-sky-400" />
                                  Kembali: {item.tglKembaliRencana || '-'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${item.status === 'Tersedia' ? 'text-muted-foreground hover:text-sky-400' : 'text-sky-400 hover:text-emerald-400'}`}
                                onClick={() => handleOpenPinjam(item)}
                                title={item.status === 'Tersedia' ? 'Pinjamkan Barang Ini' : 'Proses Pengembalian'}
                              >
                                <ArrowRightLeft className="h-4 w-4" />
                              </Button>

                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleOpenDetail(item)} title="Lihat Detail Barang">
                                <Eye className="h-4 w-4" />
                              </Button>

                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenEdit(item)} title="Edit Data Barang">
                                <Pencil className="h-4 w-4" />
                              </Button>

                              {(userRole === 'admin' || userRole === 'ketua') && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleOpenDelete(item)} title="Hapus Barang">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: RIWAYAT PEMINJAMAN */}
        <TabsContent value="riwayat" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Catatan Riwayat Peminjaman & Sirkulasi
              </CardTitle>
              <CardDescription>Log pencatatan siapa yang meminjam barang, tanggal pinjam, dan status pengembalian fisik.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Barang</TableHead>
                      <TableHead>Peminjam</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Tanggal Pinjam</TableHead>
                      <TableHead>Rencana Kembali</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dicatat Oleh</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riwayat.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-sm">
                          Belum ada riwayat peminjaman barang tercatat.
                        </TableCell>
                      </TableRow>
                    ) : (
                      riwayat.map((rec) => (
                        <TableRow key={rec.id} className="odd:bg-muted/20 even:bg-background hover:bg-muted/30">
                          <TableCell className="font-medium text-foreground">{rec.namaBarang || 'Barang Inventaris'}</TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">{rec.peminjam}</div>
                            {rec.keterangan && <div className="text-xs text-muted-foreground">{rec.keterangan}</div>}
                          </TableCell>
                          <TableCell>{rec.jumlahPinjam} unit</TableCell>
                          <TableCell className="text-xs">{rec.tanggalPinjam}</TableCell>
                          <TableCell className="text-xs">{rec.tanggalKembaliRencana}</TableCell>
                          <TableCell>
                            <Badge
                              variant={rec.status === 'dipinjam' ? 'default' : 'outline'}
                              className={`text-xs ${rec.status === 'dipinjam' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'}`}
                            >
                              {rec.status === 'dipinjam' ? 'Sedang Dipinjam' : 'Sudah Kembali'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{rec.dibuatOleh || 'Pengurus'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========================================================= */}
      {/* 1. DIALOG CREATE (TAMBAH BARANG)                          */}
      {/* ========================================================= */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[540px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Tambah Aset Barang Baru
            </DialogTitle>
            <DialogDescription>Isi data detail barang inventaris baru untuk didaftarkan ke database organisasi.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-nama" className="text-xs">
                Nama Barang <span className="text-destructive">*</span>
              </Label>
              <Input id="create-nama" placeholder="Contoh: Sound System Portable 12 Inch" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-kategori" className="text-xs">
                  Kategori
                </Label>
                <Select value={formData.kategori} onValueChange={(val: KategoriBarang) => setFormData({ ...formData, kategori: val })}>
                  <SelectTrigger id="create-kategori">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Elektronik & Sound">Elektronik & Sound</SelectItem>
                    <SelectItem value="Tenda & Panggung">Tenda & Panggung</SelectItem>
                    <SelectItem value="Meja & Kursi">Meja & Kursi</SelectItem>
                    <SelectItem value="Logistik & Kebersihan">Logistik & Kebersihan</SelectItem>
                    <SelectItem value="Olahraga">Olahraga</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-kondisi" className="text-xs">
                  Kondisi Fisik
                </Label>
                <Select value={formData.kondisi} onValueChange={(val: KondisiBarang) => setFormData({ ...formData, kondisi: val })}>
                  <SelectTrigger id="create-kondisi">
                    <SelectValue placeholder="Pilih Kondisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baik">Baik (Normal)</SelectItem>
                    <SelectItem value="rusak_ringan">Rusak Ringan</SelectItem>
                    <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-jumlah" className="text-xs">
                  Jumlah
                </Label>
                <Input id="create-jumlah" type="number" min="1" value={formData.jumlah} onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value) || 1 })} required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-satuan" className="text-xs">
                  Satuan
                </Label>
                <Input id="create-satuan" placeholder="Unit / Pcs / Set / Roll" value={formData.satuan} onChange={(e) => setFormData({ ...formData, satuan: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-lokasi" className="text-xs">
                Lokasi Penyimpanan
              </Label>
              <Input id="create-lokasi" placeholder="Contoh: Ruang Sekretariat Katar / Gudang RW" value={formData.lokasi} onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })} />
            </div>

            {/* Foto Upload */}
            <div className="space-y-1.5">
              <Label className="text-xs">Foto Barang (Opsional)</Label>
              <div className="flex items-center gap-3">
                {formData.fotoUrl ? (
                  <div className="relative group">
                    <PreviewImage src={formData.fotoUrl} alt="Preview" className="h-16 w-16 rounded-md object-cover border border-border" />
                    <button type="button" onClick={() => setFormData({ ...formData, fotoUrl: '' })} className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 text-xs shadow">
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-md border border-dashed border-border flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
                <div className="flex-1">
                  <input ref={fileInputRef} type="file" accept="image/*,.heic,.heif" onChange={handleFileUpload} className="hidden" />
                  <Button type="button" variant="outline" size="sm" disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="gap-1.5 text-xs">
                    {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {isUploading ? 'Mengunggah...' : 'Unggah Foto'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-keterangan" className="text-xs">
                Keterangan Tambahan (Opsional)
              </Label>
              <Textarea id="create-keterangan" placeholder="Catatan kelengkapan, nomor seri, dll..." value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} rows={2} />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isPending}>
                Batal
              </Button>
              <Button type="submit" loading={isPending} disabled={isUploading}>
                Simpan ke Inventaris
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 2. DIALOG EDIT                                            */}
      {/* ========================================================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[540px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Data Barang
            </DialogTitle>
            <DialogDescription>Perbarui rincian aset inventaris barang.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-nama" className="text-xs">
                Nama Barang <span className="text-destructive">*</span>
              </Label>
              <Input id="edit-nama" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-kategori" className="text-xs">
                  Kategori
                </Label>
                <Select value={formData.kategori} onValueChange={(val: KategoriBarang) => setFormData({ ...formData, kategori: val })}>
                  <SelectTrigger id="edit-kategori">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Elektronik & Sound">Elektronik & Sound</SelectItem>
                    <SelectItem value="Tenda & Panggung">Tenda & Panggung</SelectItem>
                    <SelectItem value="Meja & Kursi">Meja & Kursi</SelectItem>
                    <SelectItem value="Logistik & Kebersihan">Logistik & Kebersihan</SelectItem>
                    <SelectItem value="Olahraga">Olahraga</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-kondisi" className="text-xs">
                  Kondisi Fisik
                </Label>
                <Select value={formData.kondisi} onValueChange={(val: KondisiBarang) => setFormData({ ...formData, kondisi: val })}>
                  <SelectTrigger id="edit-kondisi">
                    <SelectValue placeholder="Pilih Kondisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baik">Baik</SelectItem>
                    <SelectItem value="rusak_ringan">Rusak Ringan</SelectItem>
                    <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-jumlah" className="text-xs">
                  Jumlah
                </Label>
                <Input id="edit-jumlah" type="number" min="1" value={formData.jumlah} onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value) || 1 })} required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-satuan" className="text-xs">
                  Satuan
                </Label>
                <Input id="edit-satuan" value={formData.satuan} onChange={(e) => setFormData({ ...formData, satuan: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-lokasi" className="text-xs">
                Lokasi Penyimpanan
              </Label>
              <Input id="edit-lokasi" value={formData.lokasi} onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-keterangan" className="text-xs">
                Keterangan Tambahan
              </Label>
              <Textarea id="edit-keterangan" value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} rows={2} />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={isPending}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 3. DIALOG PINJAM / KEMBALIKAN                            */}
      {/* ========================================================= */}
      <Dialog open={isPinjamOpen} onOpenChange={setIsPinjamOpen}>
        <DialogContent className="sm:max-w-[480px] w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-sky-400" />
              {selectedItem?.status === 'Tersedia' ? 'Form Peminjaman Barang' : 'Konfirmasi Pengembalian Barang'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.status === 'Tersedia' ? `Catat rincian warga/panitia yang meminjam "${selectedItem?.nama}".` : `Pastikan barang "${selectedItem?.nama}" telah dikembalikan dalam kondisi fisik yang baik.`}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && selectedItem.status === 'Tersedia' ? (
            <form onSubmit={handlePinjamSubmit} className="space-y-4 py-2">
              {settings?.operasional && (
                <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-700 dark:text-sky-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>Kebijakan Peminjaman {settings.profil.nama || 'Organisasi'}:</span>
                  </div>
                  <p>
                    • Batas maksimal peminjaman: <strong>{settings.operasional.maxHariPinjamInventaris} hari</strong>.
                  </p>
                  {settings.operasional.wajibPersetujuanKetua && <p>• Peminjaman aset wajib mendapatkan persetujuan / konfirmasi dari Ketua.</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="pinjam-nama" className="text-xs">
                  Nama Peminjam / Acara <span className="text-destructive">*</span>
                </Label>
                <Input id="pinjam-nama" placeholder="Contoh: Pak RT 03 / Panitia Acara Senam" value={pinjamForm.peminjam} onChange={(e) => setPinjamForm({ ...pinjamForm, peminjam: e.target.value })} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pinjam-tgl-pinjam" className="text-xs">
                    Tanggal Pinjam (Otomatis)
                  </Label>
                  <Input id="pinjam-tgl-pinjam" type="date" value={pinjamForm.tanggalPinjam} onChange={(e) => setPinjamForm({ ...pinjamForm, tanggalPinjam: e.target.value })} required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pinjam-tgl-kembali" className="text-xs">
                    Rencana Tanggal Kembali <span className="text-destructive">*</span>
                  </Label>
                  <Input id="pinjam-tgl-kembali" type="date" value={pinjamForm.tanggalKembaliRencana} onChange={(e) => setPinjamForm({ ...pinjamForm, tanggalKembaliRencana: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pinjam-keterangan" className="text-xs">
                  Keperluan / Catatan
                </Label>
                <Input id="pinjam-keterangan" placeholder="Contoh: Dipinjam untuk kegiatan syukuran warga" value={pinjamForm.keterangan} onChange={(e) => setPinjamForm({ ...pinjamForm, keterangan: e.target.value })} />
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsPinjamOpen(false)} disabled={isPending}>
                  Batal
                </Button>
                <Button type="submit" disabled={isPending} className="bg-sky-600 hover:bg-sky-700">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                  Konfirmasi Pinjam
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-3.5 rounded-lg bg-muted/50 border border-border space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peminjam:</span>
                  <span className="font-semibold text-foreground">{selectedItem?.peminjam || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Pinjam:</span>
                  <span className="font-medium text-foreground">{selectedItem?.tglPinjam || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Kembali:</span>
                  <span className="font-medium text-foreground">{selectedItem?.tglKembaliRencana || '-'}</span>
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsPinjamOpen(false)} disabled={isPending}>
                  Batal
                </Button>
                <Button type="button" onClick={handlePinjamSubmit} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                  Tandai Sudah Kembali
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 4. DIALOG DETAIL                                          */}
      {/* ========================================================= */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[480px] w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Rincian Inventaris
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4 py-2 text-sm">
              {selectedItem.fotoUrl && (
                <div className="rounded-lg overflow-hidden border border-border max-h-48">
                  <PreviewImage src={selectedItem.fotoUrl} alt={selectedItem.nama} className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <h3 className="font-bold text-base text-foreground">{selectedItem.nama}</h3>
                <Badge variant="outline" className="text-xs mt-1">
                  {selectedItem.kategori}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border border-border text-xs">
                <div>
                  <span className="text-muted-foreground block">Jumlah:</span>
                  <span className="font-semibold text-foreground text-sm">
                    {selectedItem.jumlah} {selectedItem.satuan}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Kondisi:</span>
                  <span className="capitalize font-semibold text-foreground text-sm">{selectedItem.kondisi.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Lokasi:</span>
                  <span className="font-medium text-foreground">{selectedItem.lokasi}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Status:</span>
                  <span className="font-semibold text-foreground">{selectedItem.status}</span>
                </div>
              </div>

              {selectedItem.keterangan && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground block mb-1">Keterangan:</span>
                  <p className="text-xs bg-muted/20 p-2.5 rounded border border-border text-muted-foreground">{selectedItem.keterangan}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 5. DIALOG DELETE                                          */}
      {/* ========================================================= */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[420px] w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Hapus Aset Barang?
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{selectedItem?.nama}</strong> dari inventaris organisasi? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-3">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              Hapus Barang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
