'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, MapPin, Camera, Pencil, Trash2 } from 'lucide-react';
import { KegiatanData } from '@/actions/kegiatan';
import { STATUS_COLOR, formatTanggalShort } from '@/constants/kegiatan';

interface KegiatanCardProps {
  kegiatan: KegiatanData;
  viewMode: 'list' | 'grid';
  isAdminOrKetua: boolean;
  onEdit: (k: KegiatanData) => void;
  onDelete: (k: KegiatanData) => void;
}

export function KegiatanCard({
  kegiatan: k,
  viewMode,
  isAdminOrKetua,
  onEdit,
  onDelete,
}: KegiatanCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:border-primary/40 transition-all border shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-medium ${STATUS_COLOR[k.status] || ''}`}
                >
                  {k.status}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {k.bagianNama}
                </Badge>
                {k.targetRab > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-mono font-semibold"
                  >
                    Target RAB: Rp {new Intl.NumberFormat('id-ID').format(k.targetRab)}
                  </Badge>
                )}
              </div>
              <h3 className="font-bold text-base text-foreground leading-snug">{k.judul}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {k.deskripsi}
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
              <Link href={`/kegiatan/${k.id}/dokumentasi`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>{k.totalFoto} Foto</span>
                </Button>
              </Link>
              {isAdminOrKetua && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(k)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(k)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>
                {formatTanggalShort(k.tanggalMulai)}
                {k.tanggalSelesai !== k.tanggalMulai ? ` – ${formatTanggalShort(k.tanggalSelesai)}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{k.lokasi}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:border-primary/40 transition-all border shadow-xs flex flex-col justify-between">
      <CardHeader className="p-4 pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`text-[10px] font-medium ${STATUS_COLOR[k.status] || ''}`}
          >
            {k.status}
          </Badge>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className="text-[11px] text-muted-foreground">{k.bagianNama}</span>
            {k.targetRab > 0 && (
              <Badge
                variant="outline"
                className="text-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-mono font-semibold"
              >
                RAB: Rp {new Intl.NumberFormat('id-ID').format(k.targetRab)}
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-sm font-bold leading-snug line-clamp-2">
          {k.judul}
        </CardTitle>
        <CardDescription className="text-xs line-clamp-2">
          {k.deskripsi}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2 text-xs text-muted-foreground">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">
              {formatTanggalShort(k.tanggalMulai)}
              {k.tanggalSelesai !== k.tanggalMulai ? ` – ${formatTanggalShort(k.tanggalSelesai)}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{k.lokasi}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <Link href={`/kegiatan/${k.id}/dokumentasi`}>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Camera className="h-3.5 w-3.5" />
              <span>{k.totalFoto} Foto</span>
            </Button>
          </Link>
          {isAdminOrKetua && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onEdit(k)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={() => onDelete(k)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
