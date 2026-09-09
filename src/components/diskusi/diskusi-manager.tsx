'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { MessagesSquare, Plus, MessageCircle, AtSign, ArrowRight, Search, Pin, Heart, MoreVertical, Trash2, Edit, FileText, Clock, Loader2, AlertCircle } from 'lucide-react';
import { DiskusiItem, createDiskusi, updateDiskusi, deleteDiskusi, togglePinDiskusi } from '@/actions/diskusi';

interface BagianOption {
  id: string;
  nama: string;
  slug: string;
}

interface DiskusiManagerProps {
  initialThreads: DiskusiItem[];
  bagianList: BagianOption[];
  currentUserId?: string;
  userRole?: string;
  currentUserBagianId?: string | null;
}

export function DiskusiManager({ initialThreads, bagianList, currentUserId, userRole = 'anggota', currentUserBagianId }: DiskusiManagerProps) {
  const [threads, setThreads] = useState<DiskusiItem[]>(initialThreads);
  const [activeTab, setActiveTab] = useState<'semua' | 'diskusi' | 'catatan_umum' | 'pinned'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBagian, setFilterBagian] = useState<string>('all');

  // Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingThread, setEditingThread] = useState<DiskusiItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [tipe, setTipe] = useState<'diskusi' | 'catatan_umum'>('diskusi');
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [selectedBagianId, setSelectedBagianId] = useState<string>(currentUserBagianId || (bagianList.length > 0 ? bagianList[0].id : ''));
  const [selectedMentionIds, setSelectedMentionIds] = useState<string[]>([]);

  // Liked items in browser local state for nice interactivity
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  const canManageThread = (t: DiskusiItem) => {
    return userRole === 'admin' || userRole === 'ketua' || t.dibuatOleh === currentUserId;
  };

  const handleOpenCreate = (defaultTipe: 'diskusi' | 'catatan_umum' = 'diskusi') => {
    setEditingThread(null);
    setTipe(defaultTipe);
    setJudul('');
    setIsi('');
    setSelectedBagianId(currentUserBagianId || (bagianList.length > 0 ? bagianList[0].id : ''));
    setSelectedMentionIds([]);
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (t: DiskusiItem) => {
    setEditingThread(t);
    setTipe(t.tipe);
    setJudul(t.judul);
    setIsi(t.isi || '');
    setSelectedBagianId(t.bagianPembuatId || '');
    setSelectedMentionIds(t.mentions.map((m) => m.bagianId));
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleToggleMention = (bagianId: string) => {
    if (selectedMentionIds.includes(bagianId)) {
      setSelectedMentionIds(selectedMentionIds.filter((id) => id !== bagianId));
    } else {
      setSelectedMentionIds([...selectedMentionIds, bagianId]);
    }
  };

  const handleSave = () => {
    if (!judul.trim()) {
      setFormError('Judul wajib diisi.');
      return;
    }

    setFormError(null);
    startTransition(async () => {
      if (editingThread) {
        const res = await updateDiskusi(editingThread.id, {
          tipe,
          judul,
          isi,
          mentionBagianIds: selectedMentionIds,
        });

        if (!res.success) {
          setFormError(res.error || 'Gagal mengubah topik diskusi.');
          return;
        }

        // Update local state
        setThreads((prev) =>
          prev.map((item) => {
            if (item.id === editingThread.id) {
              const updatedMentions = bagianList
                .filter((b) => selectedMentionIds.includes(b.id))
                .map((b) => ({
                  id: b.id,
                  bagianId: b.id,
                  bagianNama: b.nama,
                  bagianSlug: b.slug,
                }));

              return {
                ...item,
                tipe,
                judul,
                isi,
                mentions: updatedMentions,
              };
            }
            return item;
          }),
        );
        setIsCreateOpen(false);
      } else {
        const res = await createDiskusi({
          tipe,
          judul,
          isi,
          bagianPembuatId: selectedBagianId || null,
          mentionBagianIds: selectedMentionIds,
        });

        if (!res.success || !res.data) {
          setFormError(res.error || 'Gagal membuat topik diskusi.');
          return;
        }

        setThreads((prev) => [res.data!, ...prev]);
        setIsCreateOpen(false);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;

    startTransition(async () => {
      const res = await deleteDiskusi(deleteId);
      if (res.success) {
        setThreads((prev) => prev.filter((t) => t.id !== deleteId));
        setDeleteId(null);
      } else {
        alert(res.error || 'Gagal menghapus topik diskusi.');
      }
    });
  };

  const handleTogglePin = (t: DiskusiItem) => {
    startTransition(async () => {
      const newPinned = !t.isPinned;
      const res = await togglePinDiskusi(t.id, newPinned);
      if (res.success) {
        setThreads((prev) => prev.map((item) => (item.id === t.id ? { ...item, isPinned: newPinned } : item)));
      } else {
        alert(res.error || 'Gagal mengubah status sematan.');
      }
    });
  };

  const handleToggleLike = (id: string) => {
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatRelativeTime = (dateIso: string) => {
    try {
      const date = new Date(dateIso);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return 'Baru saja';
      if (diffMinutes < 60) return `${diffMinutes} mnt lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays < 7) return `${diffDays} hari lalu`;
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return 'Baru saja';
    }
  };

  const filteredThreads = threads.filter((t) => {
    if (activeTab === 'diskusi' && t.tipe !== 'diskusi') return false;
    if (activeTab === 'catatan_umum' && t.tipe !== 'catatan_umum') return false;
    if (activeTab === 'pinned' && !t.isPinned) return false;

    if (filterBagian !== 'all' && t.bagianPembuatId !== filterBagian) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchJudul = t.judul.toLowerCase().includes(q);
      const matchIsi = (t.isi || '').toLowerCase().includes(q);
      const matchAuthor = t.authorName.toLowerCase().includes(q);
      const matchBagian = (t.bagianPembuatNama || '').toLowerCase().includes(q);
      const matchMention = t.mentions.some((m) => m.bagianNama.toLowerCase().includes(q));

      if (!matchJudul && !matchIsi && !matchAuthor && !matchBagian && !matchMention) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Papan Diskusi & Catatan Umum</h1>
          <p className="text-sm text-muted-foreground mt-1">Forum komunikasi terbuka antar bagian, catatan bersama lintas divisi, dan mention @departemen.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button size="sm" variant="outline" className="gap-2 shadow-xs flex-1 sm:flex-initial text-xs h-8" onClick={() => handleOpenCreate('catatan_umum')}>
            <FileText className="h-4 w-4 text-emerald-500" />
            <span>Tulis Catatan Umum</span>
          </Button>
          <Button size="sm" className="gap-2 shadow-xs bg-primary hover:bg-primary/90 flex-1 sm:flex-initial text-xs h-8" onClick={() => handleOpenCreate('diskusi')}>
            <MessagesSquare className="h-4 w-4" />
            <span>Mulai Diskusi</span>
          </Button>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card border rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <Button size="sm" variant={activeTab === 'semua' ? 'default' : 'ghost'} className="text-xs h-8 px-3 rounded-lg whitespace-nowrap shrink-0" onClick={() => setActiveTab('semua')}>
            Semua ({threads.length})
          </Button>
          <Button size="sm" variant={activeTab === 'diskusi' ? 'default' : 'ghost'} className="text-xs h-8 px-3 rounded-lg gap-1 whitespace-nowrap shrink-0" onClick={() => setActiveTab('diskusi')}>
            <MessagesSquare className="h-3.5 w-3.5" />
            <span>Topik Diskusi ({threads.filter((t) => t.tipe === 'diskusi').length})</span>
          </Button>
          <Button size="sm" variant={activeTab === 'catatan_umum' ? 'default' : 'ghost'} className="text-xs h-8 px-3 rounded-lg gap-1 whitespace-nowrap shrink-0" onClick={() => setActiveTab('catatan_umum')}>
            <FileText className="h-3.5 w-3.5" />
            <span>Catatan Umum ({threads.filter((t) => t.tipe === 'catatan_umum').length})</span>
          </Button>
          <Button size="sm" variant={activeTab === 'pinned' ? 'default' : 'ghost'} className="text-xs h-8 px-3 rounded-lg gap-1 whitespace-nowrap shrink-0" onClick={() => setActiveTab('pinned')}>
            <Pin className="h-3.5 w-3.5" />
            <span>Tersemat ({threads.filter((t) => t.isPinned).length})</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Cari bahasan atau tag..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 text-xs bg-muted/30 w-full" />
          </div>
          <Select value={filterBagian} onValueChange={setFilterBagian}>
            <SelectTrigger className="h-8 text-xs w-full sm:w-[140px] shrink-0">
              <SelectValue placeholder="Semua Bagian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Bagian</SelectItem>
              {bagianList.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Threads List */}
      <div className="space-y-4">
        {filteredThreads.length === 0 ? (
          <Card className="border-dashed py-12 text-center">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <MessagesSquare className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold">Belum Ada Topik Diskusi</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">Mulai percakapan baru atau buat catatan bersama untuk saling berkoordinasi antar pengurus.</p>
              <Button size="sm" onClick={() => handleOpenCreate('diskusi')} className="mt-2">
                Buat Thread Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredThreads.map((t) => {
            const isLiked = Boolean(likedIds[t.id]);
            return (
              <Card key={t.id} className={`transition-all hover:shadow-md ${t.isPinned ? 'border-primary/40 bg-primary/2 dark:bg-primary/5' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={t.tipe === 'diskusi' ? 'default' : 'secondary'} className="text-xs font-medium">
                        {t.tipe === 'diskusi' ? 'Topik Diskusi' : 'Catatan Bersama'}
                      </Badge>

                      {t.isPinned && (
                        <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-500 bg-amber-500/10 gap-1">
                          <Pin className="h-3 w-3 fill-amber-500" />
                          <span>Tersemat</span>
                        </Badge>
                      )}

                      <span className="text-xs text-muted-foreground font-medium">• {t.bagianPembuatNama || 'Umum'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(t.createdAt)}
                      </span>

                      {canManageThread(t) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(userRole === 'admin' || userRole === 'ketua') && (
                              <DropdownMenuItem onClick={() => handleTogglePin(t)}>
                                <Pin className="h-3.5 w-3.5 mr-2" />
                                <span>{t.isPinned ? 'Lepas Sematan' : 'Sematkan di Atas'}</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleOpenEdit(t)}>
                              <Edit className="h-3.5 w-3.5 mr-2" />
                              <span>Edit Tulisan</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteId(t.id)} className="text-destructive focus:text-destructive">
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              <span>Hapus</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  <Link href={`/diskusi/${t.id}`} className="group">
                    <CardTitle className="text-lg sm:text-xl mt-2 group-hover:text-primary transition-colors">{t.judul}</CardTitle>
                  </Link>
                  <CardDescription className="text-xs">
                    Ditulis oleh <span className="font-semibold text-foreground">{t.authorName}</span> ({t.authorRole} • {t.bagianPembuatNama || 'Umum'})
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pb-3">
                  {t.isi && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{t.isi}</p>}

                  {/* Mentions tags */}
                  {t.mentions && t.mentions.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <AtSign className="h-3 w-3 text-primary" /> Mention:
                      </span>
                      {t.mentions.map((m) => (
                        <Badge key={m.id} variant="secondary" className="text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20">
                          @{m.bagianNama}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className={`h-8 px-2.5 text-xs gap-1.5 ${isLiked ? 'text-rose-500 hover:text-rose-600 font-medium' : 'text-muted-foreground'}`} onClick={() => handleToggleLike(t.id)}>
                      <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{isLiked ? 'Didukung' : 'Dukung'}</span>
                    </Button>
                  </div>

                  <Link href={`/diskusi/${t.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-primary hover:text-primary">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{t.balasanCount} Balasan</span>
                      <ArrowRight className="h-3 w-3 ml-0.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              {tipe === 'diskusi' ? <MessagesSquare className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-emerald-500" />}
              <span>{editingThread ? 'Edit Kiriman' : tipe === 'diskusi' ? 'Mulai Topik Diskusi Baru' : 'Tulis Catatan Bersama'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">Posting pesan ini untuk mengundang masukan dari pengurus atau menyimpan SOP/catatan penting lintas bagian.</DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tipe Postingan</Label>
                <Select value={tipe} onValueChange={(val: 'diskusi' | 'catatan_umum') => setTipe(val)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diskusi">Topik Diskusi (Tanya-Jawab)</SelectItem>
                    <SelectItem value="catatan_umum">Catatan Umum / SOP Bersama</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Bagian Pengirim</Label>
                <Select value={selectedBagianId} onValueChange={setSelectedBagianId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Pilih Bagian" />
                  </SelectTrigger>
                  <SelectContent>
                    {bagianList.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Judul Pokok Bahasan</Label>
              <Input value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Contoh: Rencana Penggalangan Dana Bazar Warga" className="text-xs" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Isi Lengkap / Uraian</Label>
              <Textarea
                value={isi}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setIsi(e.target.value)}
                rows={5}
                placeholder="Tuliskan latar belakang masalah, opsi solusi, atau detail instruksi..."
                className="text-xs leading-relaxed"
              />
            </div>

            {/* Mention Picker */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <AtSign className="h-3.5 w-3.5 text-primary" />
                  Tag Bagian Terkait (Mention @Departemen)
                </span>
                <span className="text-[11px] text-muted-foreground">Klik untuk tag</span>
              </Label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-muted/40 rounded-lg border">
                {bagianList.map((b) => {
                  const isSelected = selectedMentionIds.includes(b.id);
                  return (
                    <Badge
                      key={b.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`cursor-pointer text-xs transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      onClick={() => handleToggleMention(b.id)}
                    >
                      @{b.nama}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSave} loading={isPending} disabled={!judul.trim()}>
              <span>{editingThread ? 'Simpan Perubahan' : 'Terbitkan Sekarang'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Konfirmasi Hapus Thread</span>
            </DialogTitle>
            <DialogDescription className="text-xs">Apakah Anda yakin ingin menghapus topik/catatan ini? Seluruh balasan di dalamnya juga akan terhapus.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)} disabled={isPending}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
              {isPending && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
              <span>Hapus Permanen</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
