'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import {
  ArrowLeft,
  UserPlus,
  Users,
  Shield,
  Phone,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  FolderKanban,
  LayoutGrid,
  Table as TableIcon,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2,
  Plus,
  Loader2,
  AlertCircle,
  Clock,
  Printer,
  ShieldAlert,
} from 'lucide-react';
import { createAnggota, updateAnggota, deleteAnggota } from '@/actions/anggota';
import { createPeriode, setActivePeriode, deletePeriode } from '@/actions/periode';

export interface DBPeriode {
  id: string;
  nama_periode: string;
  tanggal_mulai: string;
  tanggal_selesai: string | null;
  is_aktif: boolean;
  anggota?: DBAnggota[];
}

export interface DBAnggota {
  id: string;
  nama: string;
  kontak: string;
  rt_rw: string;
  jabatan: string;
  status: 'Aktif' | 'Alumni' | 'Cuti';
  foto_url: string | null;
  created_at?: string;
}

interface BaganDetailManagerProps {
  bagian: string;
  id: string;
  initialAgenda: any;
  userRole?: string;
}

const JABATAN_SUGGESTIONS = [
  'Ketua Pelaksana / Koordinator',
  'Wakil Koordinator',
  'Sekretaris Pelaksana',
  'Bendahara Pelaksana',
  'Koordinator Perlengkapan & Sarpras',
  'Koordinator Lapangan & Keamanan',
  'Koordinator Acara & Lomba',
  'Koordinator Konsumsi & Logistik',
  'Koordinator Publikasi & Dokumentasi',
  'Anggota Pelaksana',
];

export function BaganDetailManager({ bagian, id, initialAgenda, userRole = 'anggota' }: BaganDetailManagerProps) {
  const [agenda, setAgenda] = useState<any>(initialAgenda);
  const periods: DBPeriode[] = agenda?.periode_kepengurusan || [];

  // Cari periode aktif atau yang pertama
  const defaultPeriod = periods.find((p) => p.is_aktif) || periods[0] || null;
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>(defaultPeriod?.id || '');

  const currentPeriode = periods.find((p) => p.id === selectedPeriodeId) || defaultPeriod;
  const members: DBAnggota[] = currentPeriode?.anggota || [];

  const [viewMode, setViewMode] = useState<'organogram' | 'tabel'>('organogram');
  const [searchMember, setSearchMember] = useState('');
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal Anggota
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<DBAnggota | null>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);

  // Form Anggota State
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState(JABATAN_SUGGESTIONS[0]);
  const [rt, setRt] = useState('RT 03 / RW 05');
  const [kontak, setKontak] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Alumni' | 'Cuti'>('Aktif');

  // Modal Periode
  const [isPeriodeDialogOpen, setIsPeriodeDialogOpen] = useState(false);
  const [namaPeriode, setNamaPeriode] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().split('T')[0]);
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [isAktifBaru, setIsAktifBaru] = useState(false);

  const isAdminOrKetua = userRole === 'admin' || userRole === 'ketua';

  // Helpers for levels
  const getLevel = (jab: string): 'pucuk' | 'inti' | 'divisi' => {
    const j = jab.toLowerCase();
    if (j.includes('ketua') || j.includes('koordinator utama') || j.includes('pimpinan')) {
      return 'pucuk';
    }
    if (j.includes('wakil') || j.includes('sekretaris') || j.includes('bendahara')) {
      return 'inti';
    }
    return 'divisi';
  };

  const pucukMembers = members.filter((m) => getLevel(m.jabatan) === 'pucuk');
  const intiMembers = members.filter((m) => getLevel(m.jabatan) === 'inti');
  const divisiMembers = members.filter((m) => getLevel(m.jabatan) === 'divisi');

  const filteredMembers = members.filter((m) => {
    if (!searchMember.trim()) return true;
    const q = searchMember.toLowerCase();
    return m.nama.toLowerCase().includes(q) || m.jabatan.toLowerCase().includes(q) || m.rt_rw.toLowerCase().includes(q) || m.kontak.toLowerCase().includes(q);
  });

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((x) => x[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleOpenAddMember = () => {
    if (!currentPeriode) {
      alert('Harap buat periode kepengurusan terlebih dahulu.');
      return;
    }
    setEditingMember(null);
    setNama('');
    setJabatan(JABATAN_SUGGESTIONS[4] || 'Anggota Pelaksana');
    setRt('RT 01 / RW 05');
    setKontak('');
    setStatus('Aktif');
    setErrorMessage(null);
    setIsMemberDialogOpen(true);
  };

  const handleOpenEditMember = (m: DBAnggota) => {
    setEditingMember(m);
    setNama(m.nama);
    setJabatan(m.jabatan);
    setRt(m.rt_rw);
    setKontak(m.kontak);
    setStatus(m.status);
    setErrorMessage(null);
    setIsMemberDialogOpen(true);
  };

  const handleSaveMember = () => {
    if (!nama.trim() || !kontak.trim()) {
      setErrorMessage('Nama dan nomor kontak wajib diisi.');
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set('nama', nama);
      formData.set('jabatan', jabatan);
      formData.set('rt_rw', rt);
      formData.set('kontak', kontak);
      formData.set('status', status);
      formData.set('periode_id', currentPeriode.id);
      formData.set('bagian_id', agenda.bagian_id);

      if (editingMember) {
        const res = await updateAnggota(editingMember.id, formData);
        if (res.error) {
          setErrorMessage(res.error);
          return;
        }

        // Update local state
        setAgenda((prev: any) => ({
          ...prev,
          periode_kepengurusan: prev.periode_kepengurusan.map((p: any) =>
            p.id === currentPeriode.id
              ? {
                  ...p,
                  anggota: p.anggota.map((m: any) => (m.id === editingMember.id ? { ...m, nama, jabatan, rt_rw: rt, kontak, status } : m)),
                }
              : p,
          ),
        }));
      } else {
        const res = await createAnggota(formData);
        if (res.error) {
          setErrorMessage(res.error);
          return;
        }

        const newAnggota: DBAnggota = res.anggota || {
          id: Date.now().toString(),
          nama,
          jabatan,
          rt_rw: rt,
          kontak,
          status,
          foto_url: null,
        };

        setAgenda((prev: any) => ({
          ...prev,
          periode_kepengurusan: prev.periode_kepengurusan.map((p: any) =>
            p.id === currentPeriode.id
              ? {
                  ...p,
                  anggota: [newAnggota, ...(p.anggota || [])],
                }
              : p,
          ),
        }));
      }

      setIsMemberDialogOpen(false);
    });
  };

  const handleDeleteMember = () => {
    if (!deleteMemberId) return;

    startTransition(async () => {
      const res = await deleteAnggota(deleteMemberId);
      if (res.error) {
        alert(res.error);
        return;
      }

      setAgenda((prev: any) => ({
        ...prev,
        periode_kepengurusan: prev.periode_kepengurusan.map((p: any) =>
          p.id === currentPeriode.id
            ? {
                ...p,
                anggota: (p.anggota || []).filter((m: any) => m.id !== deleteMemberId),
              }
            : p,
        ),
      }));
      setDeleteMemberId(null);
    });
  };

  // Periode Actions
  const handleCreatePeriode = () => {
    if (!namaPeriode.trim()) {
      alert('Nama periode wajib diisi.');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set('agenda_organisasi_id', agenda.id);
      formData.set('nama_periode', namaPeriode);
      formData.set('tanggal_mulai', tanggalMulai);
      if (tanggalSelesai) formData.set('tanggal_selesai', tanggalSelesai);
      formData.set('is_aktif', isAktifBaru ? 'true' : 'false');

      const res = await createPeriode(formData);
      if (res.error) {
        alert(res.error);
        return;
      }

      const createdP: DBPeriode = {
        ...res.periode,
        anggota: [],
      };

      setAgenda((prev: any) => ({
        ...prev,
        periode_kepengurusan: isAktifBaru ? [createdP, ...prev.periode_kepengurusan.map((p: any) => ({ ...p, is_aktif: false }))] : [createdP, ...prev.periode_kepengurusan],
      }));

      setSelectedPeriodeId(createdP.id);
      setIsPeriodeDialogOpen(false);
      setNamaPeriode('');
    });
  };

  const handleSetActivePeriod = (pId: string) => {
    startTransition(async () => {
      const res = await setActivePeriode(agenda.id, pId);
      if (res.error) {
        alert(res.error);
        return;
      }

      setAgenda((prev: any) => ({
        ...prev,
        periode_kepengurusan: prev.periode_kepengurusan.map((p: any) => ({
          ...p,
          is_aktif: p.id === pId,
        })),
      }));
    });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link href={`/struktur/${bagian}/agenda`}>
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Daftar Agenda</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak / PDF</span>
          </Button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="text-xs">
              {agenda.status || 'Aktif'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              • Bagian: <span className="font-semibold text-foreground">{agenda.bagian?.nama || bagian}</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">{agenda.nama_agenda}</h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">{agenda.deskripsi || 'Susunan struktural panitia dan pengurus pelaksana kegiatan.'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center border rounded-lg p-0.5 bg-muted/40">
            <Button size="sm" variant={viewMode === 'organogram' ? 'default' : 'ghost'} className="h-7 text-xs px-2.5 gap-1 rounded-md" onClick={() => setViewMode('organogram')}>
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Bagan Visual</span>
            </Button>
            <Button size="sm" variant={viewMode === 'tabel' ? 'default' : 'ghost'} className="h-7 text-xs px-2.5 gap-1 rounded-md" onClick={() => setViewMode('tabel')}>
              <TableIcon className="h-3.5 w-3.5" />
              <span>Tabel Anggota</span>
            </Button>
          </div>

          {isAdminOrKetua && (
            <Button size="sm" className="gap-1.5 shadow-sm bg-primary hover:bg-primary/90 h-8 text-xs" onClick={handleOpenAddMember}>
              <UserPlus className="h-4 w-4" />
              <span>Tambah Anggota</span>
            </Button>
          )}
        </div>
      </div>

      {/* Period Selector & History Tabs */}
      <div className="bg-card border rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
            <Calendar className="h-3.5 w-3.5" />
            Pilih Periode:
          </span>
          {periods.length === 0 ? (
            <span className="text-xs text-muted-foreground italic">Belum ada periode</span>
          ) : (
            periods.map((p) => (
              <Button key={p.id} size="sm" variant={selectedPeriodeId === p.id ? 'default' : 'outline'} className="h-7 text-xs px-3 rounded-lg gap-1.5" onClick={() => setSelectedPeriodeId(p.id)}>
                <span>{p.nama_periode}</span>
                {p.is_aktif ? (
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                    Aktif
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 text-muted-foreground">
                    Riwayat
                  </Badge>
                )}
              </Button>
            ))
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAdminOrKetua && currentPeriode && !currentPeriode.is_aktif && (
            <Button size="sm" variant="outline" className="h-7 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10" onClick={() => handleSetActivePeriod(currentPeriode.id)} disabled={isPending}>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              <span>Jadikan Periode Aktif</span>
            </Button>
          )}
          {isAdminOrKetua && (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setIsPeriodeDialogOpen(true)}>
              <Plus className="h-3 w-3" />
              <span>Tambah Periode Baru</span>
            </Button>
          )}
        </div>
      </div>

      {/* Info Banner Periode */}
      {currentPeriode && (
        <div className="flex items-center justify-between text-xs px-4 py-2 rounded-lg bg-muted/40 border">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{currentPeriode.nama_periode}</span>
            <span className="text-muted-foreground">
              ({currentPeriode.tanggal_mulai} s/d {currentPeriode.tanggal_selesai || 'Sekarang'})
            </span>
          </div>
          <span className="text-muted-foreground">Total {members.length} anggota ditugaskan</span>
        </div>
      )}

      {/* Visual Organogram View */}
      {viewMode === 'organogram' ? (
        <div className="space-y-8 bg-muted/20 border rounded-2xl p-6 relative overflow-hidden">
          {members.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">Bagan Kepengurusan Masih Kosong</p>
              <p className="text-xs mt-1">{isAdminOrKetua ? "Klik tombol 'Tambah Anggota' di atas untuk menyusun pimpinan dan divisi." : 'Belum ada anggota yang terdaftar pada periode kepengurusan ini.'}</p>
            </div>
          ) : (
            <>
              {/* Level 1: Pucuk Pimpinan */}
              {pucukMembers.length > 0 && (
                <div className="space-y-2">
                  <div className="text-center">
                    <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase bg-card border px-3 py-1 rounded-full shadow-xs">Tingkat I • Pimpinan / Koordinator Utama</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 pt-3">
                    {pucukMembers.map((m) => (
                      <Card key={m.id} className="w-full max-w-xs border-primary/40 shadow-md hover:shadow-lg transition-all text-center bg-card relative group">
                        {isAdminOrKetua && (
                          <div className="absolute top-2 right-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground opacity-60 group-hover:opacity-100">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenEditMember(m)}>
                                  <Edit className="h-3.5 w-3.5 mr-2" />
                                  <span>Edit Data</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDeleteMemberId(m.id)} className="text-destructive">
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  <span>Keluarkan dari Bagan</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}

                        <CardHeader className="pb-3 pt-4">
                          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center mx-auto shadow-sm">{getInitials(m.nama)}</div>
                          <Badge variant="default" className="mx-auto w-fit text-[10px] mt-2">
                            {m.jabatan}
                          </Badge>
                          <CardTitle className="text-base font-bold mt-1">{m.nama}</CardTitle>
                          <CardDescription className="text-xs">
                            {m.rt_rw} • {m.kontak}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Decorative Divider Connector */}
              {pucukMembers.length > 0 && (intiMembers.length > 0 || divisiMembers.length > 0) && (
                <div className="flex justify-center items-center">
                  <div className="h-8 w-0.5 bg-primary/30" />
                </div>
              )}

              {/* Level 2: Pengurus Inti */}
              {intiMembers.length > 0 && (
                <div className="space-y-2">
                  <div className="text-center">
                    <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase bg-card border px-3 py-1 rounded-full shadow-xs">Tingkat II • Pengurus Inti & Pelaksana Harian</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto pt-3">
                    {intiMembers.map((m) => (
                      <Card key={m.id} className="border-border hover:border-primary/40 shadow-xs hover:shadow-md transition-all text-center bg-card relative group">
                        {isAdminOrKetua && (
                          <div className="absolute top-2 right-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground opacity-60 group-hover:opacity-100">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenEditMember(m)}>
                                  <Edit className="h-3.5 w-3.5 mr-2" />
                                  <span>Edit Data</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDeleteMemberId(m.id)} className="text-destructive">
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  <span>Keluarkan</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}

                        <CardHeader className="pb-3 pt-4">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 font-bold text-xs flex items-center justify-center mx-auto">{getInitials(m.nama)}</div>
                          <Badge variant="secondary" className="mx-auto w-fit text-[10px] mt-1.5">
                            {m.jabatan}
                          </Badge>
                          <CardTitle className="text-sm font-semibold mt-1">{m.nama}</CardTitle>
                          <CardDescription className="text-[11px]">
                            {m.rt_rw} • {m.kontak}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Decorative Divider Connector */}
              {intiMembers.length > 0 && divisiMembers.length > 0 && (
                <div className="flex justify-center items-center">
                  <div className="h-8 w-0.5 bg-border" />
                </div>
              )}

              {/* Level 3: Divisi / Pelaksana Lapangan */}
              {divisiMembers.length > 0 && (
                <div className="space-y-2">
                  <div className="text-center">
                    <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase bg-card border px-3 py-1 rounded-full shadow-xs">Tingkat III • Seksi / Divisi Pelaksana</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 pt-3">
                    {divisiMembers.map((m) => (
                      <Card key={m.id} className="border hover:border-primary/30 shadow-xs text-left bg-card relative group p-3 flex flex-col justify-between">
                        {isAdminOrKetua && (
                          <div className="absolute top-2 right-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenEditMember(m)}>
                                  <Edit className="h-3 w-3 mr-2" />
                                  <span>Edit Data</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDeleteMemberId(m.id)} className="text-destructive">
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  <span>Keluarkan</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-muted text-foreground text-[10px] font-bold flex items-center justify-center shrink-0">{getInitials(m.nama)}</div>
                            <div>
                              <h4 className="font-semibold text-xs leading-tight line-clamp-1">{m.nama}</h4>
                              <p className="text-[10px] text-muted-foreground">{m.rt_rw}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 mt-2 block w-fit truncate">
                            {m.jabatan}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 pt-2 border-t mt-2">
                          <Phone className="h-3 w-3" />
                          <span>{m.kontak}</span>
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* Tabel View */
        <Card>
          <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base">Daftar Lengkap Anggota Bagan</CardTitle>
              <CardDescription className="text-xs">Tabel susunan anggota pada {currentPeriode?.nama_periode || 'periode ini'}.</CardDescription>
            </div>
            <Input placeholder="Cari nama, jabatan, RT..." value={searchMember} onChange={(e) => setSearchMember(e.target.value)} className="h-8 text-xs sm:w-64" />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground text-left">
                    <th className="pb-2 font-medium">Nama Anggota</th>
                    <th className="pb-2 font-medium">Jabatan</th>
                    <th className="pb-2 font-medium">RT/RW</th>
                    <th className="pb-2 font-medium">No. Kontak</th>
                    <th className="pb-2 font-medium">Status</th>
                    {isAdminOrKetua && <th className="pb-2 font-medium text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground">
                        Tidak ada data anggota yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => (
                      <tr key={m.id} className="odd:bg-muted/20 even:bg-background hover:bg-muted/30">
                        <td className="py-3 font-semibold">{m.nama}</td>
                        <td className="py-3">
                          <Badge variant="outline" className="text-[10px]">
                            {m.jabatan}
                          </Badge>
                        </td>
                        <td className="py-3 text-muted-foreground">{m.rt_rw}</td>
                        <td className="py-3 text-muted-foreground">{m.kontak}</td>
                        <td className="py-3">
                          <Badge variant={m.status === 'Aktif' ? 'default' : 'secondary'} className="text-[9px]">
                            {m.status}
                          </Badge>
                        </td>
                        {isAdminOrKetua && (
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => handleOpenEditMember(m)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setDeleteMemberId(m.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog Tambah / Edit Anggota */}
      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <span>{editingMember ? 'Edit Anggota Bagan' : 'Tambah Anggota ke Bagan'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">Anggota ini akan terhubung ke periode kepengurusan {currentPeriode?.nama_periode}.</DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Lengkap *</Label>
              <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Rian Pratama" className="text-xs" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Jabatan dalam Bagan *</Label>
              <Input value={jabatan} onChange={(e) => setJabatan(e.target.value)} placeholder="Contoh: Koordinator Acara atau Sekretaris" className="text-xs" />
              <p className="text-[10px] text-muted-foreground">Ketik &apos;Ketua&apos; untuk Tingkat I, &apos;Wakil/Sekretaris/Bendahara&apos; untuk Tingkat II, atau seksi/divisi untuk Tingkat III.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Domisili RT/RW *</Label>
                <Input value={rt} onChange={(e) => setRt(e.target.value)} placeholder="RT 03 / RW 05" className="text-xs" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Status Keaktifan</Label>
                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Alumni">Alumni</SelectItem>
                    <SelectItem value="Cuti">Cuti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">No. WhatsApp / HP *</Label>
              <Input value={kontak} onChange={(e) => setKontak(e.target.value)} placeholder="0812-xxxx-xxxx" className="text-xs" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setIsMemberDialogOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button size="sm" className="text-xs bg-primary hover:bg-primary/90 gap-1.5" onClick={handleSaveMember} disabled={isPending}>
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Simpan Anggota</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Tambah Periode Baru */}
      <Dialog open={isPeriodeDialogOpen} onOpenChange={setIsPeriodeDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Tambah Periode Kepengurusan Baru</span>
            </DialogTitle>
            <DialogDescription className="text-xs">Buat periode kepengurusan baru di bawah agenda ini.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Periode *</Label>
              <Input value={namaPeriode} onChange={(e) => setNamaPeriode(e.target.value)} placeholder="Contoh: Periode 2027–2029 atau Tahap II" className="text-xs" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tanggal Mulai *</Label>
                <Input type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} className="text-xs" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Tanggal Selesai</Label>
                <Input type="date" value={tanggalSelesai} onChange={(e) => setTanggalSelesai(e.target.value)} className="text-xs" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="isAktif" checked={isAktifBaru} onChange={(e) => setIsAktifBaru(e.target.checked)} className="rounded border-gray-300" />
              <Label htmlFor="isAktif" className="text-xs cursor-pointer">
                Jadikan sebagai periode aktif saat ini
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setIsPeriodeDialogOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button size="sm" className="text-xs bg-primary hover:bg-primary/90 gap-1.5" onClick={handleCreatePeriode} disabled={isPending}>
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Buat Periode</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus Anggota dari Bagan */}
      <Dialog open={!!deleteMemberId} onOpenChange={() => setDeleteMemberId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Keluarkan Anggota?</span>
            </DialogTitle>
            <DialogDescription className="text-xs">Anggota ini akan dikeluarkan dari susunan bagan pada periode kepengurusan ini.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-3">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setDeleteMemberId(null)} disabled={isPending}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" className="text-xs gap-1.5" onClick={handleDeleteMember} disabled={isPending}>
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Keluarkan</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
