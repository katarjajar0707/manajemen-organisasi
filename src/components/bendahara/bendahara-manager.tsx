'use client';

import { createContext, type ReactNode, Suspense, useContext, useState, useTransition, useMemo, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, Wallet, TrendingDown, TrendingUp, MoreVertical, Trash2, AlertCircle, Paperclip, ExternalLink, FileText, FileDown, Eye, ImageIcon, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { cn, isImageFile, isImageUrl } from '@/lib/utils';
import { PreviewImage } from '@/components/common/preview-image';
import { createTransaksi, deleteTransaksi, updateTransaksi } from '@/actions/keuangan';
import type { PengaturanSistemData } from '@/actions/pengaturan';
import { createClient } from '@/lib/supabase/client';

interface Transaksi {
  id: string;
  judul: string;
  keterangan: string;
  kategori?: string;
  displayKeterangan?: string;
  jenis: 'masuk' | 'keluar';
  jumlah: number;
  tanggal: string;
  lampiran_url: string | null;
  author?: {
    nama: string;
    role: string;
  };
}

interface BendaharaManagerProps {
  initialList?: any[];
  initialSaldo: { masuk: number; keluar: number; sisa: number };
  bagianId?: string | null;
  agendaCategories?: string[];
  settings?: PengaturanSistemData;
  children?: ReactNode;
}

const KEUANGAN_QUERY_KEY = ['keuangan', 'bendahara'] as const;

interface BendaharaData {
  list: any[];
  saldo: { masuk: number; keluar: number; sisa: number };
  bagianId: string | null;
  categories: string[];
  settings: PengaturanSistemData;
}

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

export function TransactionRowsSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="border-b border-border/60 last:border-0">
          {Array.from({ length: 6 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-3 py-3.5 sm:px-6">
              <div className={`h-3 animate-pulse rounded bg-muted ${cellIndex === 1 ? 'w-48' : cellIndex === 5 ? 'ml-auto w-8' : 'w-20'}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function normalizeTransaction(item: any) {
  let kategori = 'Kas General';
  let displayKeterangan = item.keterangan || '';
  const match = (item.keterangan || '').match(/^\[Kategori:\s*([^\]]+)\]/i);
  if (match) {
    kategori = match[1].trim();
    displayKeterangan = (item.keterangan || '').replace(/^\[Kategori:\s*[^\]]+\]\s*/i, '').trim();
  } else if (item.kategori) {
    kategori = item.kategori;
  }
  return { ...item, kategori, displayKeterangan };
}

async function fetchKeuanganTransactions(initialBagianId: string | null) {
  const supabase = createClient();
  let bagianId = initialBagianId;

  if (!bagianId) {
    const { data: bagian } = await supabase.from('bagian').select('id').eq('slug', 'bendahara').single();
    bagianId = bagian?.id || null;
  }

  if (!bagianId) return [];

  const { data, error } = await supabase.from('catatan_keuangan').select('*, author:profiles!catatan_keuangan_dibuat_oleh_fkey(nama, role)').eq('bagian_id', bagianId).is('deleted_at', null).order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(normalizeTransaction);
}

export function BendaharaManager({ initialList = [], initialSaldo, bagianId: initialBagianId = null, agendaCategories = [], settings: initialSettings, children }: BendaharaManagerProps) {
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
  const { data: transactions = initialList } = useQuery({
    queryKey: KEUANGAN_QUERY_KEY,
    queryFn: () => fetchKeuanganTransactions(currentBagianId),
    initialData: initialList,
    staleTime: 5000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJenis, setFilterJenis] = useState<'semua' | 'masuk' | 'keluar'>('semua');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  // Form state
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
    const list: string[] = [];
    (currentCategories || []).forEach((c) => {
      const trimmed = c?.trim();
      if (trimmed && !list.includes(trimmed)) {
        list.push(trimmed);
      }
    });
    return list;
  }, [currentCategories]);

  const saldo = useMemo(() => {
    const masuk = transactions.filter((item) => item.jenis === 'masuk').reduce((total, item) => total + Number(item.jumlah), 0);
    const keluar = transactions.filter((item) => item.jenis === 'keluar').reduce((total, item) => total + Number(item.jumlah), 0);
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
            queryClient.setQueryData<any[]>(KEUANGAN_QUERY_KEY, (current = []) => current.filter((item) => item.id !== payload.old.id));
            return;
          }

          const { data: refreshed, error: refreshError } = await supabase
            .from('catatan_keuangan')
            .select('*, author:profiles!catatan_keuangan_dibuat_oleh_fkey(nama, role)')
            .eq('id', payload.new.id)
            .eq('bagian_id', bagian.id)
            .is('deleted_at', null)
            .single();
          if (refreshError) {
            setRealtimeStatus('error');
            return;
          }
          if (!refreshed) {
            queryClient.setQueryData<any[]>(KEUANGAN_QUERY_KEY, (current = []) => current.filter((item) => item.id !== payload.new.id));
            return;
          }

          const normalized = normalizeTransaction(refreshed);
          queryClient.setQueryData<any[]>(KEUANGAN_QUERY_KEY, (current = []) => {
            const index = current.findIndex((item) => item.id === normalized.id);
            if (index === -1) return [normalized, ...current];
            const next = [...current];
            next[index] = normalized;
            return next;
          });
        })
        .subscribe(async (status) => {
          if (!active) return;

          // The first sync closes the gap between the server-rendered snapshot
          // and the moment the Realtime channel becomes active. The same sync
          // also recovers cleanly after a reconnect.
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

  const formatRupiah = (angka: number | string) => {
    const num = Math.round(Number(angka) || 0);
    return `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  };

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
    setSelectedKategori(trx.kategori || 'Kas General');
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
      if (file) {
        formData.append('lampiran', file);
      }

      const res = editingId ? await updateTransaksi(editingId, formData, 'bendahara') : await createTransaksi(formData, 'bendahara');

      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        // Reconcile immediately after the server action succeeds so the
        // submitting browser updates even when the realtime event is delayed.
        await queryClient.invalidateQueries({ queryKey: KEUANGAN_QUERY_KEY });
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
          toast.success('Transaksi berhasil dihapus.');
        }
        setDeleteId(null);
      });
    }
  };

  const filteredList = transactions.filter((item: any) => {
    // Filter Jenis Transaksi (Masuk / Keluar)
    if (filterJenis !== 'semua' && item.jenis !== filterJenis) {
      return false;
    }

    // Search Query
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

  const handleExportPDF = () => {
    if (filteredList.length === 0) {
      toast.error('Tidak ada data transaksi untuk diekspor.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Gagal membuka jendela cetak. Pastikan pop-up diizinkan pada browser.');
      return;
    }

    const filterText = [filterJenis === 'masuk' ? 'Kas Masuk (Pemasukan)' : filterJenis === 'keluar' ? 'Kas Keluar (Pengeluaran)' : 'Semua Mutasi'].join(' | ');

    const totalMasukFiltered = filteredList.filter((t: any) => t.jenis === 'masuk').reduce((acc: number, curr: any) => acc + Number(curr.jumlah), 0);

    const totalKeluarFiltered = filteredList.filter((t: any) => t.jenis === 'keluar').reduce((acc: number, curr: any) => acc + Number(curr.jumlah), 0);

    const saldoFiltered = totalMasukFiltered - totalKeluarFiltered;

    const escapeHtml = (value: unknown) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const rowsHtml = filteredList
      .map((trx: any, idx: number) => {
        const tgl = new Date(trx.created_at).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
        const jenisLabel = trx.jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran';
        const nominalColor = trx.jenis === 'masuk' ? '#047857' : '#b91c1c';
        const cleanDesc = trx.displayKeterangan || trx.keterangan || '';
        const title = escapeHtml(trx.judul || 'Transaksi');
        const description = escapeHtml(cleanDesc);
        const author = escapeHtml(trx.author?.nama || 'Admin');

        return `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td style="white-space: nowrap;">${tgl}</td>
            <td style="vertical-align: top;">
              <strong>${title}</strong>
              ${description ? `<div class="description">${description}</div>` : ''}
            </td>
            <td style="text-align: center;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background-color: ${trx.jenis === 'masuk' ? '#d1fae5' : '#fee2e2'}; color: ${trx.jenis === 'masuk' ? '#065f46' : '#991b1b'};">
                ${jenisLabel}
              </span>
            </td>
            <td style="text-align: right; font-family: monospace; font-weight: bold; color: ${nominalColor};">
              ${formatRupiah(trx.jumlah)}
            </td>
            <td style="font-size: 11px; color: #475569;">${author}</td>
          </tr>
        `;
      })
      .join('');

    const nowIndo = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Laporan Keuangan Karang Taruna - ${nowIndo}</title>
          <style>
            @page {
              size: A4;
              margin: 12mm 15mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 10px;
              font-size: 12px;
              line-height: 1.4;
            }
            .kop {
              text-align: center;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 18px;
            }
            .kop h2 {
              margin: 0;
              font-size: 15px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #475569;
            }
            .kop h1 {
              margin: 4px 0;
              font-size: 20px;
              color: #0f172a;
              letter-spacing: 0.5px;
            }
            .kop p {
              margin: 0;
              font-size: 11px;
              color: #64748b;
            }
            .meta-box {
              display: flex;
              justify-content: space-between;
              margin-bottom: 16px;
              font-size: 12px;
              padding: 8px 12px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
            }
            .summary-cards {
              display: flex;
              gap: 12px;
              margin-bottom: 18px;
            }
            .card {
              flex: 1;
              padding: 10px 14px;
              border-radius: 6px;
              border: 1px solid #cbd5e1;
              background-color: #ffffff;
            }
            .card-title {
              font-size: 10px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .card-value {
              font-size: 16px;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
              table-layout: fixed;
            }
            thead {
              display: table-header-group;
            }
            tfoot {
              display: table-footer-group;
            }
            tr {
              page-break-inside: avoid;
            }
            th {
              background-color: #f1f5f9;
              border: 1px solid #cbd5e1;
              padding: 8px;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #334155;
            }
            td {
              border: 1px solid #cbd5e1;
              padding: 8px;
              font-size: 12px;
              overflow-wrap: anywhere;
              vertical-align: top;
            }
            td .description {
              margin-top: 3px;
              color: #64748b;
              font-size: 10px;
              line-height: 1.35;
            }
            .tanda-tangan {
              display: flex;
              justify-content: space-between;
              margin-top: 40px;
              page-break-inside: avoid;
            }
            .ttd-box {
              width: 220px;
              text-align: center;
              font-size: 12px;
            }
            .ttd-space {
              height: 60px;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 15px; text-align: right;">
            <button onclick="window.print()" style="padding: 8px 18px; background-color: #0284c7; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px;">
              🖨️ Cetak / Simpan sebagai PDF
            </button>
          </div>

          <div class="kop">
            <h2>PENGURUS KARANG TARUNA</h2>
            <h1>LAPORAN REKAPITULASI ARUS KAS KEUANGAN</h1>
            <p>Sistem Informasi Manajemen Organisasi & Transparansi Keuangan</p>
          </div>

          <div class="meta-box">
            <div>
              <div><strong>Kategori Filter:</strong> ${filterText}</div>
              <div><strong>Total Transaksi:</strong> ${filteredList.length} catatan</div>
            </div>
            <div style="text-align: right;">
              <div><strong>Tanggal Cetak:</strong> ${nowIndo}</div>
              <div><strong>Status:</strong> Sah / Terverifikasi Sistem</div>
            </div>
          </div>

          <div class="summary-cards">
            <div class="card" style="border-left: 4px solid #059669;">
              <div class="card-title">Total Pemasukan</div>
              <div class="card-value" style="color: #059669;">${formatRupiah(totalMasukFiltered)}</div>
            </div>
            <div class="card" style="border-left: 4px solid #dc2626;">
              <div class="card-title">Total Pengeluaran</div>
              <div class="card-value" style="color: #dc2626;">${formatRupiah(totalKeluarFiltered)}</div>
            </div>
            <div class="card" style="border-left: 4px solid #0284c7;">
              <div class="card-title">Sisa Saldo Kas Organisasi</div>
              <div class="card-value" style="color: #0284c7;">${formatRupiah(saldo.sisa)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 35px;">No</th>
                <th style="width: 100px;">Tanggal</th>
                <th>Uraian / Judul Transaksi</th>
                <th style="width: 95px; text-align: center;">Jenis</th>
                <th style="width: 130px; text-align: right;">Nominal</th>
                <th style="width: 110px;">Pencatat</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
            <tfoot>
              <tr style="background-color: #f8fafc; font-weight: bold;">
                <td colspan="4" style="text-align: right; padding: 10px;">Total Mutasi (Data Sesuai Filter):</td>
                <td style="text-align: right; font-family: monospace; color: ${saldoFiltered >= 0 ? '#047857' : '#b91c1c'};">
                  ${formatRupiah(saldoFiltered)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div class="tanda-tangan">
            <div class="ttd-box">
              <p>Mengetahui,<br><strong>Ketua Karang Taruna</strong></p>
              <div class="ttd-space"></div>
              <p><strong>( ........................................ )</strong></p>
            </div>
            <div class="ttd-box">
              <p>Tertanda,<br><strong>Bendahara Umum</strong></p>
              <div class="ttd-space"></div>
              <p><strong>( ........................................ )</strong></p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
          <div className="flex gap-2 w-full sm:w-auto">
            <Button className="flex-1 sm:flex-none gap-2 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700" size="sm" onClick={() => handleOpenCreate('masuk')}>
              <TrendingUp className="h-4 w-4" />
              <span>Kas Masuk</span>
            </Button>
            <Button className="flex-1 sm:flex-none gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-xs" size="sm" onClick={() => handleOpenCreate('keluar')}>
              <TrendingDown className="h-4 w-4" />
              <span>Kas Keluar</span>
            </Button>
          </div>
        </div>

        {/* Saldo Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <Card className="col-span-2 bg-blue-50/70 border-blue-200 dark:from-blue-950/40 dark:to-indigo-950/20 dark:border-blue-900/40 dark:bg-card shadow-xs sm:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground dark:text-blue-300 flex items-center gap-2">
                <span className="p-1 rounded-md bg-blue-500/10 text-blue-950 dark:text-blue-400">
                  <Wallet className="h-4 w-4" />
                </span>
                <span>Total Saldo Aktif</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div suppressHydrationWarning className="text-2xl font-extrabold text-foreground dark:text-blue-300">
                {dataReady ? formatRupiah(saldo.sisa) : <span className="inline-block h-7 w-36 animate-pulse rounded bg-muted" />}
              </div>
              <p className="text-xs text-muted-foreground dark:text-blue-400/80 font-medium mt-1">Kas Umum Keseluruhan</p>
            </CardContent>
          </Card>

          <Card className="bg-emerald-50/70 border-emerald-200 dark:from-emerald-950/40 dark:to-green-950/20 dark:border-emerald-900/40 dark:bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-900 dark:text-emerald-300 flex items-center gap-2 sm:text-sm">
                <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <span>Total Pemasukan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div suppressHydrationWarning className="text-lg font-extrabold text-emerald-800 dark:text-emerald-300 sm:text-2xl">
                {dataReady ? formatRupiah(saldo.masuk) : <span className="inline-block h-7 w-32 animate-pulse rounded bg-muted" />}
              </div>
              <p className="text-[10px] text-slate-700 dark:text-emerald-400/80 font-medium mt-1 sm:text-xs">Akumulasi Dana Masuk</p>
            </CardContent>
          </Card>

          <Card className="bg-rose-50/70 border-rose-200 dark:from-rose-950/40 dark:to-red-950/20 dark:border-rose-900/40 dark:bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-900 dark:text-rose-300 flex items-center gap-2 sm:text-sm">
                <span className="p-1 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400">
                  <TrendingDown className="h-4 w-4" />
                </span>
                <span>Total Pengeluaran</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div suppressHydrationWarning className="text-lg font-extrabold text-rose-800 dark:text-rose-300 sm:text-2xl">
                {dataReady ? formatRupiah(saldo.keluar) : <span className="inline-block h-7 w-32 animate-pulse rounded bg-muted" />}
              </div>
              <p className="text-[10px] text-slate-700 dark:text-rose-400/80 font-medium mt-1 sm:text-xs">Akumulasi Dana Keluar</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-4 border-b">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    Riwayat Transaksi
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
                        realtimeStatus === 'connected'
                          ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : realtimeStatus === 'error'
                            ? 'border-destructive/25 bg-destructive/10 text-destructive'
                            : 'border-border bg-muted text-muted-foreground',
                      )}
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full', realtimeStatus === 'connected' ? 'bg-emerald-500' : realtimeStatus === 'error' ? 'bg-destructive' : 'bg-muted-foreground')} />
                      {realtimeStatus === 'connected' ? 'Live' : realtimeStatus === 'error' ? 'Terputus' : 'Menghubungkan'}
                    </span>
                  </CardTitle>
                  <Badge variant="outline" className="text-xs font-mono">
                    {dataReady ? `${filteredList.length} data` : <span className="inline-block h-4 w-12 animate-pulse rounded bg-muted align-middle" />}
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-0.5">Semua mutasi kas umum organisasi</CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full xl:w-auto">
                {/* Filter Semua, Kas Masuk, Kas Keluar */}
                <div className="flex w-full items-center p-1 rounded-lg bg-muted/60 border border-border/70 text-xs sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setFilterJenis('semua')}
                    className={cn(
                      'flex-1 justify-center px-2.5 sm:flex-none sm:px-3 py-1.5 rounded-md font-medium transition-all text-xs cursor-pointer whitespace-nowrap',
                      filterJenis === 'semua' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Semua ({dataReady ? transactions.length : '...'})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterJenis('masuk')}
                    className={cn(
                      'flex-1 justify-center px-2.5 sm:flex-none sm:px-3 py-1.5 rounded-md font-medium transition-all text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap',
                      filterJenis === 'masuk' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:text-emerald-600',
                    )}
                  >
                    <TrendingUp className="h-3 w-3" />
                    Masuk ({dataReady ? transactions.filter((i: any) => i.jenis === 'masuk').length : '...'})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterJenis('keluar')}
                    className={cn(
                      'flex-1 justify-center px-2.5 sm:flex-none sm:px-3 py-1.5 rounded-md font-medium transition-all text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap',
                      filterJenis === 'keluar' ? 'bg-rose-600 text-white shadow-xs' : 'text-muted-foreground hover:text-rose-600',
                    )}
                  >
                    <TrendingDown className="h-3 w-3" />
                    Keluar ({dataReady ? transactions.filter((i: any) => i.jenis === 'keluar').length : '...'})
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                  {/* Input Pencarian */}
                  <div className="relative flex-1 min-w-0">
                    <Input placeholder="Cari transaksi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 text-xs w-full" />
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  </div>

                  {/* Tombol Export PDF */}
                  <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-primary/40 hover:bg-primary/10 hover:text-primary hover:border-primary shrink-0" onClick={handleExportPDF}>
                    <FileDown className="h-3.5 w-3.5 text-primary" />
                    <span className="hidden sm:inline">Export</span>
                    <span>.PDF</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 font-medium">Tanggal</th>
                    <th className="px-3 sm:px-6 py-3 font-medium min-w-55 sm:min-w-0">Keterangan</th>
                    <th className="px-3 sm:px-6 py-3 font-medium text-right">Jumlah</th>
                    <th className="px-3 sm:px-6 py-3 font-medium text-center">Status</th>
                    <th className="px-3 sm:px-6 py-3 font-medium text-center">Lampiran</th>
                    <th className="px-3 sm:px-6 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <Suspense fallback={<TransactionRowsSkeleton />}>{children}</Suspense>
                  {!dataReady ? null : filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 sm:px-6 py-8 text-center text-muted-foreground">
                        Belum ada transaksi kas umum.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((trx: any) => (
                      <tr key={trx.id} className="odd:bg-muted/20 even:bg-background hover:bg-muted/30 transition-colors">
                        <td suppressHydrationWarning className="px-3 sm:px-6 py-3.5 whitespace-nowrap text-xs">
                          {new Date(trx.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-3 sm:px-6 py-3.5 min-w-55 sm:min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground">{trx.judul}</span>
                            {trx.kategori && trx.kategori !== 'Kas General' && trx.kategori !== 'Kas General / Operasional' && (
                              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-medium">
                                {trx.kategori}
                              </Badge>
                            )}
                          </div>
                          {(trx.displayKeterangan || trx.keterangan) && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{trx.displayKeterangan || trx.keterangan}</div>}
                          <div className="text-[10px] text-muted-foreground mt-1">Oleh: {trx.author?.nama || 'Unknown'}</div>
                        </td>
                        <td suppressHydrationWarning className={`px-3 sm:px-6 py-3.5 text-right font-semibold whitespace-nowrap ${trx.jenis === 'masuk' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatRupiah(trx.jumlah)}
                        </td>
                        <td className="px-3 sm:px-6 py-3.5 text-center whitespace-nowrap">
                          <Badge variant="secondary" className={trx.jenis === 'masuk' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : 'bg-rose-100 text-rose-800 hover:bg-rose-100'}>
                            {trx.jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {trx.lampiran_url ? (
                            <button
                              type="button"
                              onClick={() => setPreviewUrl(trx.lampiran_url)}
                              className="group relative inline-flex items-center justify-center h-12 w-12 rounded-lg overflow-hidden border border-border/80 hover:border-primary/60 cursor-pointer shadow-xs bg-muted/40 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40"
                              title="Klik untuk melihat bukti transaksi"
                            >
                              {isImageUrl(trx.lampiran_url) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <PreviewImage src={trx.lampiran_url} alt={trx.judul || 'Bukti Lampiran'} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex flex-col items-center justify-center text-[9px] font-mono text-primary font-bold">
                                  <FileText className="h-4 w-4 mb-0.5" />
                                  <span>PDF</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Eye className="h-3.5 w-3.5" />
                              </div>
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenEdit(trx)}>
                                <Pencil className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteId(trx.id)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog Add Transaksi */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[calc(100%-1rem)] max-w-lg max-h-[calc(100dvh-1rem)] overflow-x-hidden overflow-y-auto p-4 sm:p-6">
            <form onSubmit={handleSave} className="min-w-0">
              <DialogHeader className="min-w-0">
                <DialogTitle className="pr-8 text-base sm:text-lg flex items-center gap-2">
                  {jenis === 'masuk' ? <TrendingUp className="h-5 w-5 text-emerald-600" /> : <TrendingDown className="h-5 w-5 text-rose-600" />}
                  <span>{editingId ? 'Edit Transaksi' : jenis === 'masuk' ? 'Catat Kas Masuk' : 'Catat Kas Keluar'}</span>
                </DialogTitle>
                <DialogDescription className="text-xs leading-relaxed">Masukkan detail mutasi {jenis === 'masuk' ? 'pemasukan' : 'pengeluaran'} kas.</DialogDescription>
              </DialogHeader>

              <div className="min-w-0 space-y-4 py-4 sm:space-y-5">
                {error && (
                  <div className="min-w-0 bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="min-w-0 wrap-break-word">{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs">Judul Transaksi</Label>
                  <Input value={judul} onChange={(e) => setJudul(e.target.value)} placeholder={jenis === 'masuk' ? 'Cth: Iuran Bulanan Anggota' : 'Cth: Pembelian Konsumsi Rapat'} className="text-xs" required />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Kategori / Agenda Acara</Label>
                  <Select value={selectedKategori} onValueChange={setSelectedKategori}>
                    <SelectTrigger className="min-w-0 text-xs">
                      <SelectValue placeholder="Pilih Kategori / Agenda" className="truncate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kas General">Kas General (Umum / Operasional)</SelectItem>
                      {allCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          Agenda: {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="wrap-break-word text-[11px] text-muted-foreground">Pilih agenda sesuai acara yang dibuat, atau pilih Kas General untuk transaksi umum.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Nominal (Rp)</Label>
                  <Input
                    value={jumlah}
                    onChange={(e) => {
                      // Hanya izinkan angka
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      if (val) {
                        setJumlah(new Intl.NumberFormat('id-ID').format(parseInt(val, 10)));
                      } else {
                        setJumlah('');
                      }
                    }}
                    placeholder="0"
                    className="text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Keterangan Tambahan (Opsional)</Label>
                  <Textarea value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Detail tambahan..." rows={2} className="text-xs" />
                </div>

                {jenis === 'keluar' &&
                  currentSettings?.operasional &&
                  (() => {
                    const nominalVal = parseInt(jumlah.replace(/\./g, ''), 10) || 0;
                    const batasNotif = parseFloat(currentSettings.operasional.batasNotifPengeluaran || '1000000') || 1000000;
                    const isBesar = currentSettings.operasional.notifPengeluaranBesar && nominalVal >= batasNotif;
                    const maxTanpaNota = parseFloat(currentSettings.operasional.maxPengeluaranTanpaNota || '50000') || 50000;

                    return (
                      <div className="space-y-1.5 pt-1">
                        {isBesar && (
                          <div className="min-w-0 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                            <span className="min-w-0 wrap-break-word">
                              Perhatian: Nominal pengeluaran ini tergolong pengeluaran besar (mencapai batas Rp {new Intl.NumberFormat('id-ID').format(batasNotif)}). Pastikan telah berkoordinasi dan disetujui Ketua.
                            </span>
                          </div>
                        )}
                        <p className="wrap-break-word text-[11px] text-muted-foreground">
                          * Kebijakan operasional {currentSettings.profil.nama || 'organisasi'}: Pengeluaran kas di atas Rp {new Intl.NumberFormat('id-ID').format(maxTanpaNota)} wajib menyertakan lampiran nota fisik.
                        </p>
                      </div>
                    );
                  })()}

                <div className="space-y-1.5">
                  <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start">
                    {editingId && editingLampiranUrl && isImageUrl(editingLampiranUrl) && (
                      <button type="button" className="h-20 w-20 shrink-0 self-start overflow-hidden rounded-md border bg-muted sm:h-16 sm:w-16" onClick={() => setPreviewUrl(editingLampiranUrl)} title="Lihat lampiran tersimpan">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <PreviewImage src={editingLampiranUrl} alt="Preview lampiran tersimpan" className="h-full w-full object-cover" />
                      </button>
                    )}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Label className="text-xs">Lampiran (Nota/Bukti) {jenis === 'keluar' && <span className="text-destructive">* Wajib</span>}</Label>
                      <Input id="lampiran-file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="sr-only" accept="image/*,.heic,.heif,.pdf" required={jenis === 'keluar' && !editingId} />
                      <label
                        htmlFor="lampiran-file"
                        className="flex min-h-9 w-full cursor-pointer flex-col items-start justify-center gap-0.5 rounded-md border border-input bg-background px-3 py-2 text-xs text-muted-foreground hover:bg-muted/50"
                      >
                        <Paperclip className="h-3.5 w-3.5 shrink-0" />
                        <span className="min-w-0 max-w-full truncate font-medium text-foreground">
                          {file?.name || (editingLampiranUrl ? decodeURIComponent(editingLampiranUrl.split('/').pop()?.split('?')[0] || 'Lampiran tersimpan') : 'Belum ada file dipilih')}
                        </span>
                        <span className="text-[10px]">{editingId && editingLampiranUrl ? 'Upload untuk mengganti/edit file' : 'Upload file lampiran'}</span>
                      </label>
                    </div>
                  </div>
                  {file && isImageFile(file) && (
                    <div className="flex min-w-0 items-center gap-2.5 mt-2 p-2 bg-muted/40 border rounded-lg">
                      <div className="h-12 w-12 rounded-md overflow-hidden border bg-background shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <PreviewImage file={file} src={URL.createObjectURL(file)} alt="Preview Bukti" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-medium truncate text-foreground">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB (Siap diunggah)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2 pt-1 sm:gap-0 [&>button]:w-full sm:[&>button]:w-auto">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)} disabled={isPending}>
                  Batal
                </Button>
                <Button type="submit" size="sm" loading={isPending} className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={!judul || !jumlah || (jenis === 'keluar' && !file && !editingLampiranUrl)}>
                  {editingId ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base text-destructive flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                <span>Hapus Transaksi</span>
              </DialogTitle>
              <DialogDescription className="text-xs">Apakah Anda yakin ingin menghapus transaksi ini?</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setDeleteId(null)} disabled={isPending}>
                Batal
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
                {isPending ? 'Menghapus...' : 'Hapus'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Lampiran Modal */}
        <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
          <DialogContent className="max-w-3xl w-full p-2">
            <DialogHeader className="p-4 pb-0">
              <DialogTitle>Bukti Transaksi</DialogTitle>
            </DialogHeader>
            <div className="p-4 flex items-center justify-center min-h-[40vh] bg-muted/20 rounded-md">
              {previewUrl &&
                (isImageUrl(previewUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <PreviewImage src={previewUrl} alt="Lampiran" className="max-w-full max-h-[70vh] object-contain rounded" />
                ) : (
                  <div className="text-center space-y-4">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Berkas bukan berupa gambar yang bisa di-preview.</p>
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="gap-2">
                        Unduh / Buka Berkas <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </BendaharaDataContext.Provider>
  );
}
