'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Package,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Pencil,
  Trash2,
  ArrowRightLeft,
  MapPin,
  Clock,
  User,
  Image as ImageIcon,
} from 'lucide-react';
import { ItemInventaris } from '@/actions/inventaris';
import { PreviewImage } from '@/components/common/preview-image';
import { InventarisTableRowsSkeleton, InventarisMobileRowsSkeleton } from './inventaris-skeletons';

interface InventarisTableProps {
  items: ItemInventaris[];
  filteredItems: ItemInventaris[];
  dataReady: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterKategori: string;
  setFilterKategori: (val: string) => void;
  filterKondisi: string;
  setFilterKondisi: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  resetFilters: () => void;
  onPinjam: (item: ItemInventaris) => void;
  onDetail: (item: ItemInventaris) => void;
  onEdit: (item: ItemInventaris) => void;
  onDelete: (item: ItemInventaris) => void;
}

export function InventarisTable({
  items,
  filteredItems,
  dataReady,
  searchQuery,
  setSearchQuery,
  filterKategori,
  setFilterKategori,
  filterKondisi,
  setFilterKondisi,
  filterStatus,
  setFilterStatus,
  resetFilters,
  onPinjam,
  onDetail,
  onEdit,
  onDelete,
}: InventarisTableProps) {
  return (
    <div className="space-y-4">
      {/* Filter & Search Bar */}
      <Card className="bg-card/40 border-border/60">
        <CardContent className="p-3.5 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Cari nama barang, kategori, lokasi, atau peminjam..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-9 text-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  aria-label="Bersihkan pencarian"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
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
                Daftar Aset & Inventaris Karang Taruna
              </CardTitle>
              <CardDescription>Seluruh aset perlengkapan milik organisasi yang terdata.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile View for Inventaris (< md) */}
          <div className="md:hidden">
            {!dataReady ? (
              <InventarisMobileRowsSkeleton />
            ) : filteredItems.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                Tidak ada data barang inventaris yang sesuai dengan filter pencarian.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-3.5 sm:p-4 space-y-3 transition-colors ${
                      index % 2 === 0
                        ? 'bg-background'
                        : 'bg-muted/60 dark:bg-muted/35'
                    } hover:bg-primary/5 dark:hover:bg-primary/10`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <Badge
                            variant={item.kondisi === 'baik' ? 'success' : item.kondisi === 'rusak_ringan' ? 'warning' : 'destructive'}
                            className="text-[10px] capitalize font-medium px-1.5 py-0"
                          >
                            {item.kondisi === 'baik' && <CheckCircle2 className="h-2.5 w-2.5 mr-1" />}
                            {item.kondisi === 'rusak_ringan' && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                            {item.kondisi === 'rusak_berat' && <XCircle className="h-2.5 w-2.5 mr-1" />}
                            {item.kondisi.replace('_', ' ')}
                          </Badge>
                          <Badge
                            variant={item.status === 'Tersedia' ? 'outline' : 'default'}
                            className={`text-[10px] px-1.5 py-0 ${
                              item.status === 'Tersedia'
                                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                                : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            }`}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
                          {item.nama}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.kategori}</p>
                      </div>

                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border border-border shrink-0 bg-muted flex items-center justify-center">
                        {item.fotoUrl ? (
                          <PreviewImage
                            src={item.fotoUrl}
                            alt={item.nama}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
                      <div>
                        <span className="text-[11px] block text-muted-foreground/70">Jumlah:</span>
                        <span className="font-medium text-foreground">
                          {item.jumlah} {item.satuan}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] block text-muted-foreground/70">Lokasi:</span>
                        <span className="font-medium text-foreground truncate block" title={item.lokasi}>
                          {item.lokasi}
                        </span>
                      </div>
                    </div>

                    {item.status === 'Dipinjam' && item.peminjam && (
                      <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 space-y-0.5">
                        <div className="flex items-center gap-1 font-medium text-sky-200">
                          <User className="h-3 w-3" />
                          <span>Peminjam: {item.peminjam}</span>
                        </div>
                        <div className="text-[11px] text-sky-300/80 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          <span>Target Kembali: {item.tglKembaliRencana || '-'}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <Button
                        variant={item.status === 'Tersedia' ? 'outline' : 'default'}
                        size="sm"
                        className={`h-8 text-xs gap-1.5 ${
                          item.status === 'Tersedia'
                            ? 'border-sky-500/30 text-sky-400 hover:bg-sky-500/10'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                        onClick={() => onPinjam(item)}
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        <span>{item.status === 'Tersedia' ? 'Pinjam' : 'Kembalikan'}</span>
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => onDetail(item)}
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => onEdit(item)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete(item)}
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[60px] text-center">Foto</TableHead>
                  <TableHead className="min-w-[200px]">Nama Barang</TableHead>
                  <TableHead className="w-[150px]">Kategori</TableHead>
                  <TableHead className="w-[90px]">Jumlah</TableHead>
                  <TableHead className="w-[120px]">Kondisi</TableHead>
                  <TableHead className="w-[110px]">Status</TableHead>
                  <TableHead className="w-[160px]">Lokasi</TableHead>
                  <TableHead className="w-[160px]">Peminjam</TableHead>
                  <TableHead className="w-[140px] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!dataReady ? (
                  <InventarisTableRowsSkeleton />
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground text-xs">
                      Tidak ada data barang inventaris yang sesuai dengan filter pencarian.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className={`hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors ${
                        index % 2 === 0
                          ? 'bg-background'
                          : 'bg-muted/50 dark:bg-muted/30'
                      }`}
                    >
                      <TableCell className="text-center p-2">
                        <div className="h-10 w-10 mx-auto rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                          {item.fotoUrl ? (
                            <PreviewImage
                              src={item.fotoUrl}
                              alt={item.nama}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground text-sm leading-snug line-clamp-1" title={item.nama}>
                          {item.nama}
                        </div>
                        {item.keterangan && (
                          <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5" title={item.keterangan}>
                            {item.keterangan}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{item.kategori}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold text-foreground">
                          {item.jumlah} <span className="font-normal text-muted-foreground">{item.satuan}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.kondisi === 'baik' ? 'success' : item.kondisi === 'rusak_ringan' ? 'warning' : 'destructive'}
                          className="text-xs capitalize font-medium"
                        >
                          {item.kondisi === 'baik' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {item.kondisi === 'rusak_ringan' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {item.kondisi === 'rusak_berat' && <XCircle className="h-3 w-3 mr-1" />}
                          {item.kondisi.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.status === 'Tersedia' ? 'outline' : 'default'}
                          className={`text-xs ${
                            item.status === 'Tersedia'
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                              : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                          }`}
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
                            className={`h-8 w-8 ${
                              item.status === 'Tersedia'
                                ? 'text-muted-foreground hover:text-sky-400'
                                : 'text-sky-400 hover:text-emerald-400'
                            }`}
                            onClick={() => onPinjam(item)}
                            title={item.status === 'Tersedia' ? 'Pinjamkan Barang Ini' : 'Proses Pengembalian'}
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => onDetail(item)}
                            title="Lihat Detail Barang"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => onEdit(item)}
                            title="Edit Data Barang"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                            onClick={() => onDelete(item)}
                            title="Hapus Barang"
                            aria-label="Hapus Barang"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
    </div>
  );
}
