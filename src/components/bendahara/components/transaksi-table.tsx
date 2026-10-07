import { Suspense, type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, TrendingDown, TrendingUp, MoreVertical, Trash2, FileText, FileDown, Eye, Pencil, Lock } from 'lucide-react';
import { cn, isImageUrl } from '@/lib/utils';
import { PreviewImage } from '@/components/common/preview-image';
import type { Transaksi } from '@/constants/keuangan';

export function TransactionRowsSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="border-b border-border/60 last:border-0">
          {Array.from({ length: 6 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-3 py-3.5 sm:px-6">
              <div
                aria-hidden="true"
                className={`h-3 motion-safe:animate-pulse rounded bg-muted ${cellIndex === 1 ? 'w-48' : cellIndex === 5 ? 'ml-auto w-8' : 'w-20'}`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

interface TransaksiTableProps {
  dataReady: boolean;
  realtimeStatus: 'connecting' | 'connected' | 'error';
  filteredList: Transaksi[];
  paginatedList: Transaksi[];
  filterJenis: 'semua' | 'masuk' | 'keluar';
  setFilterJenis: (val: 'semua' | 'masuk' | 'keluar') => void;
  filterClosing?: 'semua' | 'aktif' | 'closed';
  setFilterClosing?: (val: 'semua' | 'aktif' | 'closed') => void;
  filterCounts: { total: number; masuk: number; keluar: number };
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  rowsPerPage: number;
  setRowsPerPage: (val: number) => void;
  currentPage: number;
  setCurrentPage: (val: number | ((prev: number) => number)) => void;
  totalPages: number;
  pageNumbers: (number | string)[];
  canManage?: boolean;
  userRole?: string;
  formatRupiah: (angka: number | string) => string;
  onOpenEdit: (trx: Transaksi) => void;
  onDelete: (id: string) => void;
  onPreview: (url: string) => void;
  onExportPDF: () => void;
  children?: ReactNode;
}


export function TransaksiTable({
  dataReady,
  realtimeStatus,
  filteredList,
  paginatedList,
  filterJenis,
  setFilterJenis,
  filterClosing,
  setFilterClosing,
  filterCounts,
  searchQuery,
  setSearchQuery,
  rowsPerPage,
  setRowsPerPage,
  currentPage,
  setCurrentPage,
  totalPages,
  pageNumbers,
  canManage = false,
  userRole = 'anggota',
  formatRupiah,
  onOpenEdit,
  onDelete,
  onPreview,
  onExportPDF,
  children,
}: TransaksiTableProps) {

  return (
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
                {dataReady ? `${filteredList.length} data` : <span aria-hidden="true" className="inline-block h-4 w-12 motion-safe:animate-pulse rounded bg-muted align-middle" />}
              </Badge>
            </div>
            <CardDescription className="text-xs mt-0.5">Semua mutasi kas umum organisasi</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full xl:w-auto">
            {/* Filter Semua, Kas Masuk, Kas Keluar */}
            <div role="tablist" aria-label="Filter jenis transaksi" className="flex w-full items-center p-1 rounded-lg bg-muted/60 border border-border/70 text-xs sm:w-auto">
              <button
                type="button"
                role="tab"
                id="tab-filter-semua"
                aria-selected={filterJenis === 'semua'}
                tabIndex={filterJenis === 'semua' ? 0 : -1}
                onClick={() => setFilterJenis('semua')}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setFilterJenis('masuk');
                    document.getElementById('tab-filter-masuk')?.focus();
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setFilterJenis('keluar');
                    document.getElementById('tab-filter-keluar')?.focus();
                  }
                }}
                className={cn(
                  'flex-1 justify-center px-2.5 sm:flex-none sm:px-3 py-1.5 rounded-md font-medium transition-all text-xs cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  filterJenis === 'semua' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Semua ({dataReady ? filterCounts.total : '...'})
              </button>
              <button
                type="button"
                role="tab"
                id="tab-filter-masuk"
                aria-selected={filterJenis === 'masuk'}
                tabIndex={filterJenis === 'masuk' ? 0 : -1}
                onClick={() => setFilterJenis('masuk')}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setFilterJenis('keluar');
                    document.getElementById('tab-filter-keluar')?.focus();
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setFilterJenis('semua');
                    document.getElementById('tab-filter-semua')?.focus();
                  }
                }}
                className={cn(
                  'flex-1 justify-center px-2.5 sm:flex-none sm:px-3 py-1.5 rounded-md font-medium transition-all text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  filterJenis === 'masuk' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:text-emerald-600',
                )}
              >
                <TrendingUp className="h-3 w-3" />
                Masuk ({dataReady ? filterCounts.masuk : '...'})
              </button>
              <button
                type="button"
                role="tab"
                id="tab-filter-keluar"
                aria-selected={filterJenis === 'keluar'}
                tabIndex={filterJenis === 'keluar' ? 0 : -1}
                onClick={() => setFilterJenis('keluar')}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setFilterJenis('semua');
                    document.getElementById('tab-filter-semua')?.focus();
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setFilterJenis('masuk');
                    document.getElementById('tab-filter-masuk')?.focus();
                  }
                }}
                className={cn(
                  'flex-1 justify-center px-2.5 sm:flex-none sm:px-3 py-1.5 rounded-md font-medium transition-all text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  filterJenis === 'keluar' ? 'bg-red-600 text-white shadow-xs dark:bg-red-600' : 'text-muted-foreground hover:text-red-600 dark:hover:text-red-400',
                )}
              >
                <TrendingDown className="h-3 w-3" />
                Keluar ({dataReady ? filterCounts.keluar : '...'})
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
              {/* Filter Status Closing */}
              {filterClosing && setFilterClosing && (
                <Select value={filterClosing} onValueChange={(val: 'semua' | 'aktif' | 'closed') => setFilterClosing(val)}>
                  <SelectTrigger className="h-8 text-xs w-[130px] shrink-0">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Status</SelectItem>
                    <SelectItem value="aktif">Kas Aktif</SelectItem>
                    <SelectItem value="closed">Terkunci Closing</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Input Pencarian */}
              <div className="relative flex-1 min-w-0">
                <Input placeholder="Cari transaksi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 text-xs w-full" />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              </div>

              {/* Tombol Export PDF */}
              <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-primary/40 hover:bg-primary/10 hover:text-primary hover:border-primary shrink-0" onClick={onExportPDF}>
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
                {canManage && <th className="px-3 sm:px-6 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              <Suspense fallback={<TransactionRowsSkeleton />}>{children}</Suspense>
              {!dataReady ? null : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="px-3 sm:px-6 py-8 text-center text-muted-foreground">
                    Belum ada transaksi kas umum.
                  </td>
                </tr>
              ) : (
                paginatedList.map((trx) => (
                  <tr key={trx.id} className="odd:bg-muted/20 even:bg-background hover:bg-muted/30 transition-colors">
                    <td suppressHydrationWarning className="px-3 sm:px-6 py-3.5 whitespace-nowrap text-xs">
                      {new Date(trx.created_at || trx.tanggal).toLocaleDateString('id-ID', {
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
                        {trx.closing_id && (
                          <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 font-mono">
                            <Lock className="h-2.5 w-2.5" />
                            {trx.closing?.nomor_closing || 'Terkunci Closing'}
                          </Badge>
                        )}
                      </div>
                      {(trx.displayKeterangan || trx.keterangan) && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{trx.displayKeterangan || trx.keterangan}</div>}
                      <div className="text-[10px] text-muted-foreground mt-1">Oleh: {trx.author?.nama || 'Unknown'}</div>
                    </td>
                    <td suppressHydrationWarning className={`px-3 sm:px-6 py-3.5 text-right font-semibold tabular-nums whitespace-nowrap ${trx.jenis === 'masuk' ? 'text-emerald-600' : 'text-rose-600'}`}>
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
                          onClick={() => onPreview(trx.lampiran_url!)}
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
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(!trx.closing_id || userRole === 'admin') ? (
                              <DropdownMenuItem onClick={() => onOpenEdit(trx)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                {trx.closing_id ? 'Edit (Admin Audit)' : 'Edit'}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed">
                                <Lock className="h-4 w-4 mr-2" /> Terkunci (Hanya Admin)
                              </DropdownMenuItem>
                            )}

                            {!trx.closing_id ? (
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(trx.id)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Hapus
                              </DropdownMenuItem>
                            ) : userRole === 'admin' ? (
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(trx.id)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Hapus (Admin Audit)
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed text-muted-foreground">
                                <Lock className="h-4 w-4 mr-2" /> Terkunci (Telah Closing)
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!dataReady || filteredList.length === 0 ? null : (
          <div className="border-t bg-muted/5 px-3 py-3 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center justify-between gap-2 sm:justify-start">
                <span className="text-xs text-muted-foreground">Baris per halaman</span>
                <Select value={String(rowsPerPage)} onValueChange={(value) => setRowsPerPage(Number(value))}>
                  <SelectTrigger className="h-8 w-[90px] text-xs">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 30, 50, 75, 100].map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  (Total {filteredList.length} data)
                </span>
              </div>

              <Pagination className="mx-0 w-auto justify-center sm:justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className={currentPage === 1 ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {pageNumbers.map((page, idx) => (
                    <PaginationItem key={idx}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          isActive={currentPage === page}
                          onClick={() => setCurrentPage(page as number)}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
