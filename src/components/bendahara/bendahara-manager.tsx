'use client';

import { createContext, useContext, useState, useTransition, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { convertHeicToJpeg } from '@/lib/client-image';
import {
  createTransaksi,
  deleteTransaksi,
  updateTransaksi,
  getKegiatanOptions,
  getTargetRabKegiatanList,
  type KegiatanOption,
  type TargetRabKegiatanItem,
} from '@/actions/keuangan';
import { createClient } from '@/lib/supabase/client';
import {
  type Transaksi,
  type BendaharaData,
  type BendaharaManagerProps,
  KEUANGAN_QUERY_KEY,
  formatRupiahCached,
  normalizeTransaction,
} from '@/constants/keuangan';
import { KeuanganStats } from './components/keuangan-stats';
import { TargetRabSection } from './components/target-rab-section';
import { TransaksiTable, TransactionRowsSkeleton } from './components/transaksi-table';
import { TransaksiFormDialog, type RabPreviewInfo } from './components/transaksi-form-dialog';
import { TransaksiDeleteDialog } from './components/transaksi-delete-dialog';
import { PreviewLampiranDialog } from './components/preview-lampiran-dialog';
import { exportKeuanganToPdf } from './utils/export-pdf';

export { TransactionRowsSkeleton };

interface BendaharaDataContextValue {
  setData: (data: BendaharaData) => void;
}

const BendaharaDataContext = createContext<BendaharaDataContextValue | null>(null);

export function BendaharaDataBridge({ data }: { data: BendaharaData }) {
  const context = useContext(BendaharaDataContext);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!context) return;
    queryClient.setQueryData(KEUANGAN_QUERY_KEY, data.list);
    context.setData(data);
  }, [context, data, queryClient]);

  return null;
}

async function fetchKeuanganTransactions(initialBagianId: string | null): Promise<Transaksi[]> {
  const supabase = createClient();
  let bagianId = initialBagianId;

  if (!bagianId) {
    const { data: bagian } = await supabase.from('bagian').select('id').eq('slug', 'bendahara').single();
    bagianId = bagian?.id || null;
  }

  if (!bagianId) return [];

  const { data, error } = await supabase
    .from('catatan_keuangan')
    .select('*, author:profiles!catatan_keuangan_dibuat_oleh_fkey(nama, role)')
    .eq('bagian_id', bagianId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(normalizeTransaction);
}

export function BendaharaManager({
  initialList = [],
  initialSaldo: _initialSaldo,
  bagianId: initialBagianId = null,
  agendaCategories = [],
  settings: initialSettings,
  canManage = false,
  children,
}: BendaharaManagerProps) {
  const queryClient = useQueryClient();
  const [dataReady, setDataReady] = useState(initialList.length > 0);
  const [currentBagianId, setCurrentBagianId] = useState<string | null>(initialBagianId);
  const [currentCategories, setCurrentCategories] = useState(agendaCategories);
  const [currentSettings, setCurrentSettings] = useState(initialSettings);

  const dataContext = useMemo(
    () => ({
      setData: (data: BendaharaData) => {
        setCurrentBagianId(data.bagianId);
        setCurrentCategories(data.categories);
        setCurrentSettings(data.settings);
        setDataReady(true);
      },
    }),
    [],
  );

  const { data: transactions = initialList } = useQuery<Transaksi[]>({
    queryKey: KEUANGAN_QUERY_KEY,
    queryFn: () => fetchKeuanganTransactions(currentBagianId),
    initialData: initialList,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const TARGET_RAB_QUERY_KEY = useMemo(() => ['target-rab-kegiatan', currentBagianId] as const, [currentBagianId]);

  const { data: targetRabList = [] } = useQuery<TargetRabKegiatanItem[]>({
    queryKey: TARGET_RAB_QUERY_KEY,
    queryFn: () => getTargetRabKegiatanList(currentBagianId),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: kegiatanOptions = [] } = useQuery<KegiatanOption[]>({
    queryKey: ['kegiatan-options'],
    queryFn: () => getKegiatanOptions(),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterJenis, setFilterJenis] = useState<'semua' | 'masuk' | 'keluar'>('semua');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  // Form dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jenis, setJenis] = useState<'masuk' | 'keluar'>('masuk');
  const [judul, setJudul] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('Kas General');
  const [jumlah, setJumlah] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLampiranUrl, setEditingLampiranUrl] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const allCategories = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    const add = (val?: string | null) => {
      const t = val?.trim();
      if (t && !seen.has(t)) {
        seen.add(t);
        list.push(t);
      }
    };
    (currentCategories || []).forEach(add);
    (targetRabList || []).forEach((k) => add(k.judul));
    (kegiatanOptions || []).forEach((k) => add(k.judul));
    return list;
  }, [currentCategories, targetRabList, kegiatanOptions]);

  const activeKegiatanRab = useMemo(() => {
    if (!selectedKategori || selectedKategori === 'Kas General' || selectedKategori === 'Kas General / Operasional') {
      return null;
    }
    const cleanCat = selectedKategori.trim().toLowerCase();
    const fromTarget = targetRabList.find((k) => k.judul?.trim().toLowerCase() === cleanCat);
    if (fromTarget) return fromTarget;

    const fromOptions = kegiatanOptions.find((k) => k.judul?.trim().toLowerCase() === cleanCat);
    if (fromOptions) {
      return {
        id: fromOptions.id,
        judul: fromOptions.judul,
        target_rab: fromOptions.target_rab,
        realisasi: 0,
        persentase: 0,
        tanggal_mulai: fromOptions.tanggal_mulai,
        lokasi: null,
      };
    }
    return null;
  }, [selectedKategori, targetRabList, kegiatanOptions]);

  const rabPreview = useMemo<RabPreviewInfo | null>(() => {
    if (!activeKegiatanRab || Number(activeKegiatanRab.target_rab) <= 0) return null;

    const nominalNum = parseInt(jumlah.replace(/[^0-9]/g, ''), 10) || 0;
    const target = Number(activeKegiatanRab.target_rab);
    const currentRealisasi = Number(activeKegiatanRab.realisasi) || 0;
    const currentPct = Number(activeKegiatanRab.persentase) || 0;

    const deltaPct = target > 0 ? Math.round((nominalNum / target) * 100) : 0;
    const newRealisasi = jenis === 'masuk' ? currentRealisasi + nominalNum : Math.max(0, currentRealisasi - nominalNum);
    const newPct = target > 0 ? Math.round((newRealisasi / target) * 100) : 0;
    const visualWidth = Math.min(Math.max(newPct, 0), 100);

    return {
      target,
      currentRealisasi,
      currentPct,
      nominalNum,
      deltaPct,
      newRealisasi,
      newPct,
      visualWidth,
    };
  }, [activeKegiatanRab, jumlah, jenis]);

  const saldo = useMemo(() => {
    let masuk = 0;
    let keluar = 0;
    for (const item of transactions) {
      const amt = Number(item.jumlah) || 0;
      if (item.jenis === 'masuk') masuk += amt;
      else keluar += amt;
    }
    return { masuk, keluar, sisa: masuk - keluar };
  }, [transactions]);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let active = true;
    let bagianId: string | null = currentBagianId;

    const subscribe = async () => {
      const bagian = bagianId ? { id: bagianId } : (await supabase.from('bagian').select('id').eq('slug', 'bendahara').single()).data;
      if (!active || !bagian) {
        if (active) {
          setRealtimeStatus('error');
          toast.error('Sinkronisasi realtime gagal menemukan bagian bendahara.');
        }
        return;
      }
      bagianId = bagian.id;

      channel = supabase
        .channel('catatan-keuangan-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'catatan_keuangan', filter: `bagian_id=eq.${bagian.id}` }, async (payload) => {
          if (payload.eventType === 'DELETE') {
            queryClient.setQueryData<Transaksi[]>(KEUANGAN_QUERY_KEY, (current = []) => current.filter((item) => item.id !== (payload.old as { id: string }).id));
            return;
          }

          const { data: refreshed, error: refreshError } = await supabase
            .from('catatan_keuangan')
            .select('*, author:profiles!catatan_keuangan_dibuat_oleh_fkey(nama, role)')
            .eq('id', (payload.new as { id: string }).id)
            .eq('bagian_id', bagian.id)
            .is('deleted_at', null)
            .single();
          if (refreshError) {
            setRealtimeStatus('error');
            return;
          }
          if (!refreshed) {
            queryClient.setQueryData<Transaksi[]>(KEUANGAN_QUERY_KEY, (current = []) => current.filter((item) => item.id !== (payload.new as { id: string }).id));
            return;
          }

          const normalized = normalizeTransaction(refreshed);
          queryClient.setQueryData<Transaksi[]>(KEUANGAN_QUERY_KEY, (current = []) => {
            const index = current.findIndex((item) => item.id === normalized.id);
            if (index === -1) return [normalized, ...current];
            const next = [...current];
            next[index] = normalized;
            return next;
          });
          queryClient.invalidateQueries({ queryKey: ['target-rab-kegiatan'] });
        })
        .subscribe(async (status) => {
          if (!active) return;
          if (status === 'SUBSCRIBED') {
            setRealtimeStatus('connected');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setRealtimeStatus('error');
          }
        });
    };

    void subscribe();
    return () => {
      active = false;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [currentBagianId, queryClient]);

  const formatRupiah = formatRupiahCached;

  const handleOpenCreate = (tJenis: 'masuk' | 'keluar') => {
    setEditingId(null);
    setEditingLampiranUrl(null);
    setJenis(tJenis);
    setJudul('');
    setKeterangan('');
    setJumlah('');
    setFile(null);
    setError(null);
    setSelectedKategori('Kas General');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (trx: Transaksi) => {
    setEditingId(trx.id);
    setEditingLampiranUrl(trx.lampiran_url);
    setJenis(trx.jenis);
    setJudul(trx.judul || '');
    setKeterangan(trx.displayKeterangan || trx.keterangan || '');
    const matchedKategori =
      trx.kategori ||
      (trx.kegiatan_id
        ? targetRabList.find((k) => k.id === trx.kegiatan_id)?.judul || kegiatanOptions.find((k) => k.id === trx.kegiatan_id)?.judul
        : 'Kas General');
    setSelectedKategori(matchedKategori || 'Kas General');
    setJumlah(new Intl.NumberFormat('id-ID').format(Number(trx.jumlah) || 0));
    setFile(null);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !jumlah) return;

    if (jenis === 'keluar' && !editingLampiranUrl && (!file || file.size === 0)) {
      setError('Nota lampiran wajib disertakan untuk uang keluar.');
      return;
    }

    if (file && file.size > 10 * 1024 * 1024) {
      setError('Ukuran berkas lampiran tidak boleh melebihi 10 MB.');
      toast.error('Ukuran berkas terlalu besar (maksimal 10 MB).');
      return;
    }

    setError(null);
    startTransition(async () => {
      const cleanNominal = jumlah.replace(/[^0-9]/g, '');
      const formData = new FormData();
      formData.append('jenis', jenis);
      formData.append('judul', judul);
      formData.append('keterangan', keterangan);
      formData.append('kategori', selectedKategori);
      formData.append('jumlah', cleanNominal);
      if (activeKegiatanRab?.id) {
        formData.append('kegiatan_id', activeKegiatanRab.id);
      }
      if (file) {
        try {
          formData.append('lampiran', await convertHeicToJpeg(file));
        } catch {
          const message = 'File HEIC tidak dapat dikonversi menjadi JPG.';
          setError(message);
          toast.error(message);
          return;
        }
      }

      const res = editingId ? await updateTransaksi(editingId, formData, 'bendahara') : await createTransaksi(formData, 'bendahara');

      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        await queryClient.invalidateQueries({ queryKey: KEUANGAN_QUERY_KEY });
        await queryClient.invalidateQueries({ queryKey: ['target-rab-kegiatan'] });
        toast.success(editingId ? 'Transaksi berhasil diperbarui.' : `Transaksi kas ${jenis === 'masuk' ? 'pemasukan' : 'pengeluaran'} berhasil disimpan.`);
        setIsDialogOpen(false);
        setEditingId(null);
      }
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      startTransition(async () => {
        const res = await deleteTransaksi(deleteId, 'bendahara');
        if (res?.error) {
          toast.error('Gagal menghapus: ' + res.error);
        } else {
          await queryClient.invalidateQueries({ queryKey: KEUANGAN_QUERY_KEY });
          await queryClient.invalidateQueries({ queryKey: ['target-rab-kegiatan'] });
          toast.success('Transaksi berhasil dihapus.');
        }
        setDeleteId(null);
      });
    }
  };

  const filteredList = useMemo(() => {
    return transactions.filter((item) => {
      if (filterJenis !== 'semua' && item.jenis !== filterJenis) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.judul.toLowerCase().includes(q) ||
        (item.displayKeterangan || '').toLowerCase().includes(q) ||
        (item.keterangan || '').toLowerCase().includes(q) ||
        (item.kategori || '').toLowerCase().includes(q) ||
        (item.author?.nama || '').toLowerCase().includes(q)
      );
    });
  }, [transactions, filterJenis, searchQuery]);

  const filterCounts = useMemo(() => {
    let masuk = 0;
    let keluar = 0;
    for (const item of transactions) {
      if (item.jenis === 'masuk') masuk++;
      else keluar++;
    }
    return { total: transactions.length, masuk, keluar };
  }, [transactions]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / rowsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterJenis, rowsPerPage]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredList.slice(start, start + rowsPerPage);
  }, [filteredList, currentPage, rowsPerPage]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 'ellipsis', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
  }, [currentPage, totalPages]);

  const handleExportPDF = () => {
    let totalMasukFiltered = 0;
    let totalKeluarFiltered = 0;
    for (const curr of filteredList) {
      const amt = Number(curr.jumlah) || 0;
      if (curr.jenis === 'masuk') totalMasukFiltered += amt;
      else totalKeluarFiltered += amt;
    }

    exportKeuanganToPdf({
      filteredList,
      filterJenis,
      totalMasukFiltered,
      totalKeluarFiltered,
      saldoSisa: saldo.sisa,
      orgName: currentSettings?.profil?.nama || 'Karang Taruna',
      formatRupiah,
    });
  };

  return (
    <BendaharaDataContext.Provider value={dataContext}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manajemen Keuangan</h1>
            <p className="text-sm text-muted-foreground mt-1">Catatan arus kas, kas masuk, dan pengeluaran organisasi.</p>
          </div>
          {canManage && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                className="flex-1 sm:flex-none gap-2 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                size="sm"
                onClick={() => handleOpenCreate('masuk')}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Kas Masuk</span>
              </Button>
              <Button
                className="flex-1 sm:flex-none gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                size="sm"
                onClick={() => handleOpenCreate('keluar')}
              >
                <TrendingDown className="h-4 w-4" />
                <span>Kas Keluar</span>
              </Button>
            </div>
          )}
        </div>

        {/* Saldo Cards */}
        <KeuanganStats saldo={saldo} dataReady={dataReady} formatRupiah={formatRupiah} />

        {/* Section: Target RAB Kegiatan */}
        <TargetRabSection targetRabList={targetRabList} formatRupiah={formatRupiah} />

        {/* Transaksi Table */}
        <TransaksiTable
          dataReady={dataReady}
          realtimeStatus={realtimeStatus}
          filteredList={filteredList}
          paginatedList={paginatedList}
          filterJenis={filterJenis}
          setFilterJenis={setFilterJenis}
          filterCounts={filterCounts}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          pageNumbers={pageNumbers}
          canManage={canManage}
          formatRupiah={formatRupiah}
          onOpenEdit={handleOpenEdit}
          onDelete={setDeleteId}
          onPreview={setPreviewUrl}
          onExportPDF={handleExportPDF}
        >
          {children}
        </TransaksiTable>

        {/* Dialog Add/Edit Transaksi */}
        {canManage && (
          <TransaksiFormDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            jenis={jenis}
            judul={judul}
            setJudul={setJudul}
            keterangan={keterangan}
            setKeterangan={setKeterangan}
            selectedKategori={selectedKategori}
            setSelectedKategori={setSelectedKategori}
            jumlah={jumlah}
            setJumlah={setJumlah}
            file={file}
            setFile={setFile}
            editingId={editingId}
            editingLampiranUrl={editingLampiranUrl}
            error={error}
            isPending={isPending}
            allCategories={allCategories}
            targetRabList={targetRabList}
            kegiatanOptions={kegiatanOptions}
            rabPreview={rabPreview}
            currentSettings={currentSettings}
            formatRupiah={formatRupiah}
            onSubmit={handleSave}
            onPreviewImage={setPreviewUrl}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {canManage && (
          <TransaksiDeleteDialog
            open={!!deleteId}
            onOpenChange={(open) => !open && setDeleteId(null)}
            onConfirm={handleDelete}
            isPending={isPending}
          />
        )}

        {/* Preview Lampiran Modal */}
        <PreviewLampiranDialog previewUrl={previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)} />
      </div>
    </BendaharaDataContext.Provider>
  );
}
