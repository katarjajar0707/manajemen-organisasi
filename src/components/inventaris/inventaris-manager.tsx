'use client';

import { createContext, type ReactNode, useContext, useState, useMemo, useTransition, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  Plus,
  CheckCircle2,
  AlertTriangle,
  History,
  Clock,
} from 'lucide-react';
import {
  ItemInventaris,
  PeminjamanRecord,
  createInventaris,
  updateInventaris,
  deleteInventaris,
  pinjamInventaris,
  kembalikanInventaris,
  getInventarisList,
  getRiwayatPeminjaman,
} from '@/actions/inventaris';
import type { PengaturanSistemData } from '@/actions/pengaturan';
import {
  INVENTARIS_ITEMS_QUERY_KEY,
  INVENTARIS_RIWAYAT_QUERY_KEY,
  InventarisFormData,
} from '@/constants/inventaris';
import { InventarisStats } from './components/inventaris-stats';
import { InventarisTable } from './components/inventaris-table';
import { RiwayatTable } from './components/riwayat-table';
import { InventarisFormDialog } from './components/inventaris-form-dialog';
import { InventarisPinjamDialog, PinjamFormData } from './components/inventaris-pinjam-dialog';
import { InventarisDetailDialog } from './components/inventaris-detail-dialog';
import { InventarisDeleteDialog } from './components/inventaris-delete-dialog';

interface InventarisManagerProps {
  initialItems?: ItemInventaris[];
  initialRiwayat?: PeminjamanRecord[];
  userRole?: string;
  currentUserId?: string;
  settings?: PengaturanSistemData;
  loading?: boolean;
  children?: ReactNode;
}

interface InventarisData {
  items: ItemInventaris[];
  riwayat: PeminjamanRecord[];
  profile: { id: string; role: string } | null;
  settings: PengaturanSistemData;
}

const InventarisDataContext = createContext<((data: InventarisData) => void) | null>(null);

export function InventarisDataBridge({ data }: { data: InventarisData }) {
  const setData = useContext(InventarisDataContext);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!setData) return;
    queryClient.setQueryData(INVENTARIS_ITEMS_QUERY_KEY, data.items);
    queryClient.setQueryData(INVENTARIS_RIWAYAT_QUERY_KEY, data.riwayat);
    setData(data);
  }, [data, queryClient, setData]);

  return null;
}

export function InventarisManager({
  initialItems = [],
  initialRiwayat = [],
  userRole: _userRole = 'anggota',
  currentUserId: initialCurrentUserId,
  settings: initialSettings,
  loading = false,
  children,
}: InventarisManagerProps) {
  const queryClient = useQueryClient();
  const [dataReady, setDataReady] = useState(!loading);
  const [_currentUserRole, setCurrentUserRole] = useState(_userRole);
  const [_currentUserId, setCurrentUserId] = useState<string | undefined>(initialCurrentUserId);
  const [settings, setSettings] = useState(initialSettings);

  const dataSetter = useMemo(
    () => (data: InventarisData) => {
      setCurrentUserRole(data.profile?.role || 'anggota');
      setCurrentUserId(data.profile?.id);
      setSettings(data.settings);
      setDataReady(true);
    },
    []
  );

  const { data: items = initialItems } = useQuery({
    queryKey: INVENTARIS_ITEMS_QUERY_KEY,
    queryFn: () => getInventarisList(),
    initialData: initialItems,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: riwayat = initialRiwayat } = useQuery({
    queryKey: INVENTARIS_RIWAYAT_QUERY_KEY,
    queryFn: () => getRiwayatPeminjaman(),
    initialData: initialRiwayat,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

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

  // Selected item
  const [selectedItem, setSelectedItem] = useState<ItemInventaris | null>(null);

  // Statistics
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

  const resetFilters = () => {
    setSearchQuery('');
    setFilterKategori('all');
    setFilterKondisi('all');
    setFilterStatus('all');
  };

  // Handlers
  const handleOpenDetail = (item: ItemInventaris) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (item: ItemInventaris) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (item: ItemInventaris) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleOpenPinjam = (item: ItemInventaris) => {
    setSelectedItem(item);
    setIsPinjamOpen(true);
  };

  const handleCreateSubmit = (data: InventarisFormData) => {
    startTransition(async () => {
      try {
        const res = await createInventaris(data);
        if (res.error) {
          triggerNotification(res.error, 'warning');
          return;
        }

        if (res.data) {
          queryClient.setQueryData<ItemInventaris[]>(INVENTARIS_ITEMS_QUERY_KEY, (prev = []) => [
            res.data!,
            ...prev,
          ]);
        }
        queryClient.invalidateQueries({ queryKey: INVENTARIS_ITEMS_QUERY_KEY });
        setIsCreateOpen(false);
        triggerNotification(`Barang "${data.nama}" berhasil ditambahkan!`, 'success');
      } catch (err: unknown) {
        triggerNotification(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.', 'warning');
      }
    });
  };

  const handleEditSubmit = (data: InventarisFormData) => {
    if (!selectedItem) return;

    startTransition(async () => {
      try {
        const res = await updateInventaris(selectedItem.id, data);
        if (res.error) {
          triggerNotification(res.error, 'warning');
          return;
        }

        queryClient.setQueryData<ItemInventaris[]>(INVENTARIS_ITEMS_QUERY_KEY, (prev = []) =>
          prev.map((i) => (i.id === selectedItem.id ? { ...i, ...data } : i))
        );
        queryClient.invalidateQueries({ queryKey: INVENTARIS_ITEMS_QUERY_KEY });
        setIsEditOpen(false);
        triggerNotification(`Data barang "${data.nama}" berhasil diperbarui!`, 'success');
      } catch (err: unknown) {
        triggerNotification(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.', 'warning');
      }
    });
  };

  const handleDeleteSubmit = () => {
    if (!selectedItem) return;

    startTransition(async () => {
      try {
        const res = await deleteInventaris(selectedItem.id);
        if (res.error) {
          triggerNotification(res.error, 'warning');
          return;
        }

        queryClient.setQueryData<ItemInventaris[]>(INVENTARIS_ITEMS_QUERY_KEY, (prev = []) =>
          prev.filter((i) => i.id !== selectedItem.id)
        );
        queryClient.invalidateQueries({ queryKey: INVENTARIS_ITEMS_QUERY_KEY });
        setIsDeleteOpen(false);
        triggerNotification(`Barang "${selectedItem.nama}" berhasil dihapus.`, 'info');
      } catch (err: unknown) {
        triggerNotification(err instanceof Error ? err.message : 'Gagal menghapus data.', 'warning');
      }
    });
  };

  const handlePinjamSubmit = (data: PinjamFormData) => {
    if (!selectedItem) return;

    startTransition(async () => {
      try {
        const res = await pinjamInventaris({
          inventarisId: selectedItem.id,
          peminjam: data.peminjam,
          tanggalPinjam: data.tanggalPinjam,
          tanggalKembaliRencana: data.tanggalKembaliRencana,
          jumlahPinjam: data.jumlahPinjam,
          keterangan: data.keterangan,
        });

        if (res.error) {
          triggerNotification(res.error, 'warning');
          return;
        }

        queryClient.invalidateQueries({ queryKey: INVENTARIS_ITEMS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: INVENTARIS_RIWAYAT_QUERY_KEY });
        setIsPinjamOpen(false);
        triggerNotification(`Peminjaman barang "${selectedItem.nama}" berhasil dicatat!`, 'success');
      } catch (err: unknown) {
        triggerNotification(err instanceof Error ? err.message : 'Gagal memproses peminjaman.', 'warning');
      }
    });
  };

  const handleKembalikanSubmit = () => {
    if (!selectedItem) return;

    startTransition(async () => {
      try {
        const loanId = selectedItem.aktifPinjamId || selectedItem.id;
        const res = await kembalikanInventaris(loanId);
        if (res.error) {
          triggerNotification(res.error, 'warning');
          return;
        }

        queryClient.invalidateQueries({ queryKey: INVENTARIS_ITEMS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: INVENTARIS_RIWAYAT_QUERY_KEY });
        setIsPinjamOpen(false);
        triggerNotification(`Barang "${selectedItem.nama}" telah ditandai kembali!`, 'success');
      } catch (err: unknown) {
        triggerNotification(err instanceof Error ? err.message : 'Gagal memproses pengembalian.', 'warning');
      }
    });
  };

  return (
    <InventarisDataContext.Provider value={dataSetter}>
      {children}
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
              {notification.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
              {notification.type === 'info' && <Clock className="h-4 w-4 text-sky-400" />}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification((prev) => ({ ...prev, show: false }))}
              className="text-muted-foreground hover:text-foreground text-xs ml-4"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manajemen Inventaris & Aset</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pendataan terpusat seluruh perlengkapan, kontrol kondisi barang, dan sirkulasi peminjaman aset.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shrink-0 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Barang Baru</span>
          </Button>
        </div>

        {/* Summary Stats Cards */}
        <InventarisStats dataReady={dataReady} stats={stats} />

        {/* Main Tabs: Daftar Barang vs Riwayat Peminjaman */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'daftar' | 'riwayat')} className="w-full">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
            <TabsList className="bg-muted/60">
              <TabsTrigger value="daftar" className="gap-2">
                <Package className="h-4 w-4" />
                Daftar Barang ({dataReady ? items.length : '...'})
              </TabsTrigger>
              <TabsTrigger value="riwayat" className="gap-2">
                <History className="h-4 w-4" />
                Riwayat Peminjaman ({dataReady ? riwayat.length : '...'})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: DAFTAR BARANG */}
          <TabsContent value="daftar" className="space-y-4 mt-4">
            <InventarisTable
              items={items}
              filteredItems={filteredItems}
              dataReady={dataReady}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterKategori={filterKategori}
              setFilterKategori={setFilterKategori}
              filterKondisi={filterKondisi}
              setFilterKondisi={setFilterKondisi}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              resetFilters={resetFilters}
              onPinjam={handleOpenPinjam}
              onDetail={handleOpenDetail}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          </TabsContent>

          {/* TAB 2: RIWAYAT PEMINJAMAN */}
          <TabsContent value="riwayat" className="space-y-4 mt-4">
            <RiwayatTable riwayat={riwayat} dataReady={dataReady} />
          </TabsContent>
        </Tabs>

        {/* Dialog 1: Create Item */}
        <InventarisFormDialog
          open={isCreateOpen}
          mode="create"
          item={null}
          isPending={isPending}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
          onToast={triggerNotification}
        />

        {/* Dialog 2: Edit Item */}
        <InventarisFormDialog
          open={isEditOpen}
          mode="edit"
          item={selectedItem}
          isPending={isPending}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleEditSubmit}
          onDeleteRequest={handleOpenDelete}
          onToast={triggerNotification}
        />

        {/* Dialog 3: Pinjam / Kembalikan Item */}
        <InventarisPinjamDialog
          open={isPinjamOpen}
          item={selectedItem}
          settings={settings}
          isPending={isPending}
          onClose={() => setIsPinjamOpen(false)}
          onSubmit={handlePinjamSubmit}
          onReturn={handleKembalikanSubmit}
        />

        {/* Dialog 4: Detail Item */}
        <InventarisDetailDialog
          open={isDetailOpen}
          item={selectedItem}
          onClose={() => setIsDetailOpen(false)}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />

        {/* Dialog 5: Delete Item */}
        <InventarisDeleteDialog
          open={isDeleteOpen}
          item={selectedItem}
          isPending={isPending}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteSubmit}
        />
      </div>
    </InventarisDataContext.Provider>
  );
}
