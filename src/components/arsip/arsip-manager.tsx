'use client';

import { useState, useTransition, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Archive,
  Upload,
  Download,
  Search,
  FileCheck,
  FileText,
  FileSpreadsheet,
  FolderArchive,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  Calendar,
  Layers,
  HardDrive,
  File,
  CheckCircle2,
  Check,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Plus,
  ImageIcon,
  Link as LinkIcon,
} from 'lucide-react';
import { ArsipItem, KategoriArsip, createArsip, updateArsip, deleteArsip } from '@/actions/arsip';
import { uploadLampiran } from '@/actions/storage';
import { isImageFile } from '@/lib/utils';
import { PreviewImage } from '@/components/common/preview-image';

interface ArsipManagerProps {
  initialArchives?: ArsipItem[];
  agendaList?: { id: string; nama: string }[];
  userRole?: string;
  currentUserId?: string;
}

export function ArsipManager({ initialArchives = [], agendaList = [], userRole = 'anggota', currentUserId }: ArsipManagerProps) {
  const [archives, setArchives] = useState<ArsipItem[]>(initialArchives);
  const [activeCategory, setActiveCategory] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgenda, setFilterAgenda] = useState('all');
  const [isPending, startTransition] = useTransition();

  // Toast Notification
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'info' | 'warning';
  }>({ show: false, message: '', type: 'success' });

  const triggerNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  // Dialog State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingArsip, setEditingArsip] = useState<ArsipItem | null>(null);
  const [previewArsip, setPreviewArsip] = useState<ArsipItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form Fields
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [nomorSurat, setNomorSurat] = useState('');
  const [kategori, setKategori] = useState<KategoriArsip>('lainnya');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('PDF');
  const [fileSize, setFileSize] = useState('1 MB');
  const [agendaId, setAgendaId] = useState<string>('none');
  const [selectedFileName, setSelectedFileName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setSelectedFileName(file.name);

      // Extract size
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr = `${sizeMb} MB`;
      setFileSize(sizeStr);

      // Extract type
      let ext = file.name.split('.').pop()?.toUpperCase() || 'IMG';
      if (isImageFile(file)) ext = 'IMG';
      setFileType(ext);

      const res = await uploadLampiran(file, 'arsip');
      if (res.error || !res.url) {
        triggerNotification(res.error || 'Gagal mengunggah gambar.', 'warning');
      } else {
        setImageUrl(res.url);
        setFileUrl(res.url);
        triggerNotification('Gambar berhasil diunggah ke storage!', 'success');
      }
    } catch (err: any) {
      triggerNotification(err.message || 'Gagal mengunggah gambar.', 'warning');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenUpload = () => {
    setEditingArsip(null);
    setJudul('');
    setDeskripsi('');
    setDriveUrl('');
    setImageUrl('');
    setFileUrl('');
    setNomorSurat('');
    setKategori('lainnya');
    setAgendaId('none');
    setSelectedFileName('');
    setIsUploadOpen(true);
  };

  const handleOpenEdit = (item: ArsipItem) => {
    setEditingArsip(item);
    setJudul(item.judul);
    setDeskripsi(item.deskripsi);
    setDriveUrl(item.driveUrl || '');
    setImageUrl(item.imageUrl || (item.fileType === 'IMG' ? item.fileUrl : ''));
    setFileUrl(item.fileUrl);
    setNomorSurat(item.nomorSurat === '-' ? '' : item.nomorSurat);
    setKategori(item.kategori);
    setAgendaId(item.agendaOrganisasiId || 'none');
    setSelectedFileName(item.imageUrl ? 'Gambar Terlampir' : '');
    setIsUploadOpen(true);
  };

  const handleSave = () => {
    if (!judul.trim()) {
      triggerNotification('Judul Dokument wajib diisi.', 'warning');
      return;
    }

    let cleanDriveUrl = driveUrl.trim();
    if (cleanDriveUrl && !cleanDriveUrl.startsWith('http://') && !cleanDriveUrl.startsWith('https://')) {
      cleanDriveUrl = `https://${cleanDriveUrl}`;
    }

    startTransition(async () => {
      const selectedAgendaId = agendaId === 'none' ? null : agendaId;

      if (editingArsip) {
        const res = await updateArsip(editingArsip.id, {
          judul,
          deskripsi,
          driveUrl: cleanDriveUrl || null,
          imageUrl: imageUrl || null,
          agendaOrganisasiId: selectedAgendaId,
          kategori,
        });

        if (res.success) {
          const agendaObj = agendaList.find((a) => a.id === selectedAgendaId);
          setArchives((prev) =>
            prev.map((a) =>
              a.id === editingArsip.id
                ? {
                    ...a,
                    judul,
                    deskripsi,
                    driveUrl: cleanDriveUrl || null,
                    imageUrl: imageUrl || null,
                    fileUrl: imageUrl || cleanDriveUrl || a.fileUrl,
                    fileType: imageUrl ? 'IMG' : cleanDriveUrl ? 'LINK' : a.fileType,
                    agendaOrganisasiId: selectedAgendaId,
                    agendaTerkait: agendaObj?.nama || 'Umum / Organisasi',
                  }
                : a,
            ),
          );
          setIsUploadOpen(false);
          triggerNotification('Data berkas arsip berhasil diperbarui!', 'success');
        } else {
          triggerNotification(res.error || 'Gagal memperbarui arsip.', 'warning');
        }
      } else {
        const res = await createArsip({
          judul,
          deskripsi,
          driveUrl: cleanDriveUrl || null,
          imageUrl: imageUrl || null,
          agendaOrganisasiId: selectedAgendaId,
          kategori: 'lainnya',
        });

        if (res.success && res.data) {
          setArchives([res.data, ...archives]);
          setIsUploadOpen(false);
          triggerNotification('Berkas arsip berhasil ditambahkan!', 'success');
        } else {
          triggerNotification(res.error || 'Gagal menambahkan berkas arsip.', 'warning');
        }
      }
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;

    startTransition(async () => {
      const res = await deleteArsip(deleteId);
      if (res.success) {
        setArchives((prev) => prev.filter((a) => a.id !== deleteId));
        setDeleteId(null);
        triggerNotification('Arsip dokumen berhasil dihapus.', 'info');
      } else {
        triggerNotification(res.error || 'Gagal menghapus arsip.', 'warning');
      }
    });
  };

  const handleDownload = (item: ArsipItem) => {
    if (item.fileUrl) {
      window.open(item.fileUrl, '_blank');
    }
  };

  const filteredArchives = archives.filter((item) => {
    if (activeCategory === 'drive' && !item.driveUrl) return false;
    if (activeCategory === 'gambar' && !item.imageUrl) return false;
    if (activeCategory === 'agenda' && !item.agendaOrganisasiId) return false;

    if (filterAgenda !== 'all' && item.agendaOrganisasiId !== filterAgenda) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchJudul = item.judul.toLowerCase().includes(q);
      const matchNo = item.nomorSurat.toLowerCase().includes(q);
      const matchDesc = item.deskripsi.toLowerCase().includes(q);
      const matchAgenda = item.agendaTerkait?.toLowerCase().includes(q);
      const matchDrive = item.driveUrl?.toLowerCase().includes(q);
      if (!matchJudul && !matchNo && !matchDesc && !matchAgenda && !matchDrive) return false;
    }
    return true;
  });

  const getFileIcon = (type: string) => {
    if (type === 'LINK') return <ExternalLink className="h-5 w-5 text-blue-500" />;
    if (type === 'IMG') return <ImageIcon className="h-5 w-5 text-emerald-500" />;
    if (type === 'PDF') return <FileCheck className="h-5 w-5 text-rose-500" />;
    if (type === 'DOCX' || type === 'DOC') return <FileText className="h-5 w-5 text-blue-500" />;
    if (type === 'XLSX' || type === 'XLS' || type === 'CSV') return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    return <File className="h-5 w-5 text-purple-500" />;
  };

  const getKategoriBadge = (kat: string) => {
    switch (kat) {
      case 'sk':
        return <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] uppercase font-bold">SK Resmi</Badge>;
      case 'lpj':
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] uppercase font-bold">LPJ</Badge>;
      case 'proposal':
        return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] uppercase font-bold">Proposal</Badge>;
      case 'notulensi':
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] uppercase font-bold">Notulensi</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
            <span className="font-medium">{notification.message}</span>
          </div>
          <button onClick={() => setNotification((prev) => ({ ...prev, show: false }))} className="text-muted-foreground hover:text-foreground text-xs">
            Tutup
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Arsip Dokumen Organisasi</h1>
          <p className="text-sm text-muted-foreground mt-1">Penyimpanan digital terpusat untuk berkas arsip, link Google Drive, dan dokumentasi gambar organisasi.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button size="sm" className="gap-2 shadow-sm bg-primary hover:bg-primary/90 text-xs h-8 w-full sm:w-auto" onClick={handleOpenUpload}>
            <Plus className="h-4 w-4" />
            <span>Tambah Berkas Arsip</span>
          </Button>
        </div>
      </div>

      {/* Mini Storage Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-card/70 border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Dokumen Disimpan</p>
              <h3 className="text-2xl font-bold mt-0.5">{archives.length} Berkas</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Tersinkronisasi di sistem</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FolderArchive className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Tautan Cloud / Drive</p>
              <h3 className="text-2xl font-bold mt-0.5">{archives.filter((a) => !!a.driveUrl).length} Dokumen</h3>
              <p className="text-[11px] text-blue-500 font-medium mt-0.5">Google Drive & Tautan Web</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <ExternalLink className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Lampiran Foto & Gambar</p>
              <h3 className="text-2xl font-bold mt-0.5">{archives.filter((a) => !!a.imageUrl).length} Dokumen</h3>
              <p className="text-[11px] text-emerald-500 font-medium mt-0.5">Foto & Scan Dokumen</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ImageIcon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-muted/30 p-2.5 rounded-xl border">
        {/* Kategori Tabs Baru */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
          {[
            { id: 'semua', label: 'Semua Berkas', count: archives.length },
            { id: 'drive', label: 'Link Drive', count: archives.filter((a) => !!a.driveUrl).length },
            { id: 'gambar', label: 'Foto & Gambar', count: archives.filter((a) => !!a.imageUrl).length },
            { id: 'agenda', label: 'Terkait Agenda', count: archives.filter((a) => !!a.agendaOrganisasiId).length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-all whitespace-nowrap shrink-0 ${
                activeCategory === tab.id ? 'bg-background text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${activeCategory === tab.id ? 'bg-primary/10 text-primary font-bold' : 'bg-muted text-muted-foreground'}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Filter Agenda & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {agendaList.length > 0 && (
            <Select value={filterAgenda} onValueChange={setFilterAgenda}>
              <SelectTrigger className="w-full sm:w-44 h-8 text-xs bg-background">
                <SelectValue placeholder="Filter Agenda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Agenda</SelectItem>
                {agendaList.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="relative w-full sm:w-56 flex-1">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Cari judul / deskripsi / link..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 text-xs bg-background w-full" />
          </div>
        </div>
      </div>

      {/* Grid Arsip Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredArchives.map((item) => (
          <Card key={item.id} className="flex flex-col justify-between hover:border-primary/40 transition-all group">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-muted/60 border group-hover:bg-primary/5 transition-colors">{getFileIcon(item.fileType)}</div>
                  {(getKategoriBadge(item.kategori) || (item.nomorSurat && item.nomorSurat !== '-')) && (
                    <div>
                      {getKategoriBadge(item.kategori)}
                      {item.nomorSurat && item.nomorSurat !== '-' && <span className="text-[11px] font-mono text-muted-foreground block mt-0.5">No: {item.nomorSurat}</span>}
                    </div>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-xs">
                    <DropdownMenuItem onClick={() => setPreviewArsip(item)} className="gap-2 cursor-pointer">
                      <Eye className="h-3.5 w-3.5" />
                      Lihat Rincian
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(item)} className="gap-2 cursor-pointer">
                      <Download className="h-3.5 w-3.5" />
                      Buka Dokumen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenEdit(item)} className="gap-2 cursor-pointer">
                      <Edit className="h-3.5 w-3.5" />
                      Edit Info
                    </DropdownMenuItem>
                    {(userRole === 'admin' || userRole === 'ketua') && (
                      <DropdownMenuItem onClick={() => setDeleteId(item.id)} className="gap-2 text-destructive cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus Arsip
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardTitle className="text-sm font-semibold leading-snug mt-2 line-clamp-2">{item.judul}</CardTitle>
              {item.deskripsi && <CardDescription className="text-xs line-clamp-2 mt-1">{item.deskripsi}</CardDescription>}
            </CardHeader>

            <CardContent className="p-4 pt-1 space-y-2.5">
              {/* Gambar jika ada */}
              {item.imageUrl && (
                <div className="relative h-28 w-full rounded-lg overflow-hidden border bg-muted/40 cursor-pointer group/img" onClick={() => setPreviewArsip(item)}>
                  <PreviewImage src={item.imageUrl} alt={item.judul} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span>Lihat Gambar</span>
                  </div>
                </div>
              )}

              {/* Tampilkan Link Drive/link lainnya yang BISA DIKLIK */}
              {item.driveUrl && (
                <div className="pt-0.5">
                  <a
                    href={item.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-all hover:shadow-xs group/link"
                    title={item.driveUrl}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <ExternalLink className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 group-hover/link:scale-110 transition-transform" />
                      <span className="truncate">Buka Link Drive / Tautan</span>
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 underline shrink-0 font-normal">Buka ↗</span>
                  </a>
                </div>
              )}

              <div className="bg-muted/30 p-2 rounded-lg border border-border/50 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Tanggal:
                  </span>
                  <span>{item.tanggal}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/40 text-[11px] text-muted-foreground mt-2">
              <span>
                Oleh: <strong className="text-foreground">{item.uploader}</strong>
              </span>
              <div className="flex items-center gap-1">
                {item.driveUrl ? (
                  <a href={item.driveUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-500/10 px-2 font-medium">
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Buka Drive</span>
                    </Button>
                  </a>
                ) : item.fileUrl && item.fileUrl !== '#' ? (
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(item)} className="h-7 text-xs gap-1 hover:text-primary px-2">
                    <Download className="h-3.5 w-3.5" />
                    <span>Buka</span>
                  </Button>
                ) : null}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredArchives.length === 0 && (
        <div className="text-center py-12 border border-dashed rounded-xl bg-card/30">
          <FolderArchive className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-sm font-semibold">Tidak ada arsip dokumen ditemukan</h3>
          <p className="text-xs text-muted-foreground mt-1">Silakan unggah dokumen atau sesuaikan filter pencarian.</p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. DIALOG TAMBAH / EDIT ARSIP                             */}
      {/* ========================================================= */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderArchive className="h-5 w-5 text-primary" />
              <span>{editingArsip ? 'Edit Berkas Arsip' : 'Tambah Berkas Arsip'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">Simpan dokumen atau arsip digital dengan tautan Google Drive / cloud dan unggahan gambar dokumen.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            {/* 1. Judul Dokument */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">
                Judul Dokument <span className="text-destructive">*</span>
              </Label>
              <Input placeholder="Contoh: SK Kepengurusan 2026 / Notulensi Rapat Pleno" value={judul} onChange={(e) => setJudul(e.target.value)} className="text-xs" />
            </div>

            {/* 2. Deskripsi */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Deskripsi</Label>
              <Textarea rows={3} placeholder="Jelaskan rincian atau keterangan dokumen arsip ini..." value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} className="text-xs resize-none" />
            </div>

            {/* 3. Input Link Drive/link lainnya (jika ada) */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Input Link Drive/link lainnya (jika ada)</Label>
              <div className="relative">
                <Input placeholder="https://drive.google.com/... atau link cloud lainnya" value={driveUrl} onChange={(e) => setDriveUrl(e.target.value)} className="text-xs pr-8" />
                {driveUrl && (
                  <a
                    href={driveUrl.startsWith('http') ? driveUrl : `https://${driveUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-primary transition-colors"
                    title="Uji buka tautan"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">Tautan Google Drive, Dropbox, OneDrive, atau link dokumen pendukung lainnya.</p>
            </div>

            {/* 4. Upload gambar (jika ada) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Upload gambar (jika ada)</Label>
              <input ref={fileInputRef} type="file" accept="image/*,.heic,.heif" onChange={handleFileChange} className="hidden" />
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-muted/20">
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Sedang mengunggah gambar ke storage...</span>
                  </div>
                ) : imageUrl ? (
                  <div className="space-y-2">
                    <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden border shadow-xs">
                      <PreviewImage src={imageUrl} alt="Preview Dokumen" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-500 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{selectedFileName || 'Gambar berhasil dipilih'}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Klik untuk mengganti gambar</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-1">
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                    <p className="text-xs font-medium">Klik untuk memilih gambar / foto arsip</p>
                    <p className="text-[11px] text-muted-foreground">Semua format gambar (Opsional)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setIsUploadOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button size="sm" className="text-xs gap-1.5" onClick={handleSave} disabled={isPending || isUploading}>
              {isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              <span>{editingArsip ? 'Simpan Perubahan' : 'Simpan Berkas Arsip'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 2. DIALOG PREVIEW ARSIP                                   */}
      {/* ========================================================= */}
      <Dialog open={!!previewArsip} onOpenChange={(open) => !open && setPreviewArsip(null)}>
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderArchive className="h-5 w-5 text-primary" />
              Detail Berkas Arsip
            </DialogTitle>
          </DialogHeader>

          {previewArsip && (
            <div className="space-y-3.5 py-2 text-xs">
              <div className="p-3 bg-muted/40 rounded-lg border space-y-1.5">
                <h4 className="font-bold text-sm text-foreground">{previewArsip.judul}</h4>
                <div className="flex items-center gap-2">
                  {getKategoriBadge(previewArsip.kategori)}
                  {previewArsip.nomorSurat && previewArsip.nomorSurat !== '-' && <span className="font-mono text-muted-foreground">No: {previewArsip.nomorSurat}</span>}
                </div>
              </div>

              {/* Link Drive di Preview Dialog */}
              {previewArsip.driveUrl && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-2">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                    Link Drive / Tautan Berkas:
                  </span>
                  <p className="text-xs text-blue-600 dark:text-blue-400 break-all font-mono">{previewArsip.driveUrl}</p>
                  <div>
                    <a
                      href={previewArsip.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
                    >
                      <span>Buka Link Drive</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Gambar di Preview Dialog */}
              {previewArsip.imageUrl && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground">Lampiran Gambar:</span>
                  <div className="rounded-lg overflow-hidden border max-h-64 bg-black/5">
                    <PreviewImage src={previewArsip.imageUrl} alt={previewArsip.judul} className="w-full h-full object-contain mx-auto" />
                  </div>
                </div>
              )}

              {previewArsip.deskripsi && (
                <div className="p-2.5 rounded bg-muted/20 border text-muted-foreground space-y-1">
                  <span className="font-semibold text-foreground">Deskripsi:</span>
                  <p className="text-foreground whitespace-pre-line">{previewArsip.deskripsi}</p>
                </div>
              )}

              <div className="flex items-center justify-between p-2 rounded bg-muted/20 border text-muted-foreground">
                <span>Tanggal Input:</span>
                <strong className="text-foreground">{previewArsip.tanggal}</strong>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPreviewArsip(null)}>
              Tutup
            </Button>
            {previewArsip?.driveUrl ? (
              <a href={previewArsip.driveUrl} target="_blank" rel="noopener noreferrer">
                <Button className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Buka Link Drive
                </Button>
              </a>
            ) : previewArsip?.fileUrl && previewArsip.fileUrl !== '#' ? (
              <Button onClick={() => handleDownload(previewArsip)} className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Buka / Download File
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 3. DIALOG DELETE CONFIRMATION                             */}
      {/* ========================================================= */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Hapus Berkas Arsip?
            </DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus arsip dokumen ini dari repositori?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-3">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isPending}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              Hapus Berkas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
