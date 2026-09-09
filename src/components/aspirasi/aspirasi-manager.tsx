'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquareText, Search } from 'lucide-react';
import type { AspirasiWargaItem } from '@/actions/transparansi';
import { createClient } from '@/lib/supabase/client';

interface AspirasiManagerProps {
  initialAspirasi: AspirasiWargaItem[];
}

export function AspirasiManager({ initialAspirasi }: AspirasiManagerProps) {
  const [aspirasi, setAspirasi] = useState<AspirasiWargaItem[]>(initialAspirasi);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const parseAspirasi = (item: { id: string; judul: string; isi?: string | null; created_at?: string | null }): AspirasiWargaItem | null => {
      if (!item.judul.startsWith('[Aspirasi Warga]')) return null;
      const match = item.judul.match(/^\[Aspirasi Warga\] dari (.+) \((.+)\)$/);
      return {
        id: item.id,
        nama: match?.[1] || 'Warga',
        rt: match?.[2] || 'Warga',
        pesan: item.isi || '-',
        createdAt: item.created_at || new Date().toISOString(),
      };
    };

    const syncAspirasi = async () => {
      const { data, error } = await supabase.from('diskusi').select('id, judul, isi, created_at').eq('tipe', 'catatan_umum').like('judul', '[Aspirasi Warga]%').order('created_at', { ascending: false });
      if (!active || error) return;
      setAspirasi(data.map(parseAspirasi).filter((item): item is AspirasiWargaItem => item !== null));
    };

    const channel = supabase
      .channel('aspirasi-warga-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'diskusi', filter: 'tipe=eq.catatan_umum' }, (payload) => {
        const item = payload.new as { id?: string; judul?: string; isi?: string; created_at?: string };
        if (!item.id || !item.judul) return;
        const newAspirasi = parseAspirasi({ id: item.id, judul: item.judul, isi: item.isi, created_at: item.created_at });
        if (!newAspirasi) return;

        setAspirasi((current) => (current.some((entry) => entry.id === newAspirasi.id) ? current : [newAspirasi, ...current]));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') void syncAspirasi();
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  const filteredAspirasi = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return aspirasi;

    return aspirasi.filter((item) => [item.nama, item.rt, item.pesan].some((value) => value.toLowerCase().includes(query)));
  }, [aspirasi, searchQuery]);

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Kanal Aspirasi &amp; Masukan Warga</h1>
        <p className="text-sm text-muted-foreground mt-1">Daftar aspirasi dan masukan yang dikirimkan warga melalui halaman beranda.</p>
      </div>

      <Card className="border shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b bg-muted/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-primary" />
                Masukan Warga
                <Badge variant="secondary" className="text-xs font-normal">
                  {filteredAspirasi.length} data
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs mt-1">Gunakan data ini sebagai bahan tindak lanjut dan evaluasi pengurus.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Cari nama, RT, atau isi..." className="h-8 pl-8 text-xs" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-sm">
              <thead className="bg-muted/40 border-b">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-semibold w-14">No</th>
                  <th className="px-4 py-3 font-semibold">Warga</th>
                  <th className="px-4 py-3 font-semibold">RT / Keterangan</th>
                  <th className="px-4 py-3 font-semibold">Aspirasi / Masukan</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Dikirim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filteredAspirasi.map((item, index) => (
                  <tr key={item.id} className="odd:bg-muted/20 even:bg-background hover:bg-primary/4 transition-colors align-top">
                    <td className="px-4 py-3 text-xs text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{item.nama}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.rt}</td>
                    <td className="px-4 py-3 whitespace-pre-wrap leading-relaxed text-foreground">{item.pesan}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAspirasi.length === 0 && <div className="px-4 py-12 text-center text-sm text-muted-foreground">{searchQuery ? 'Tidak ada aspirasi yang sesuai pencarian.' : 'Belum ada aspirasi atau masukan warga yang masuk.'}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
