import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Target, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TargetRabKegiatanItem } from '@/actions/keuangan';

interface TargetRabSectionProps {
  targetRabList: TargetRabKegiatanItem[];
  formatRupiah: (angka: number | string) => string;
}

export function TargetRabSection({ targetRabList, formatRupiah }: TargetRabSectionProps) {
  const [isRabOpen, setIsRabOpen] = useState(false);

  if (!targetRabList || targetRabList.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isRabOpen} onOpenChange={setIsRabOpen} className="w-full">
      <Card className="border shadow-xs overflow-hidden">
        <CardHeader className={cn('py-3 bg-muted/20 transition-colors', isRabOpen && 'border-b')}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span className="p-1 rounded-md bg-primary/10 text-primary">
                  <Target className="h-4 w-4" />
                </span>
                <span>Target RAB Kegiatan</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Realisasi pemasukan kas terhadap target Rencana Anggaran Biaya (RAB) agenda kegiatan
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <Badge variant="outline" className="text-xs font-mono w-fit bg-background">
                {targetRabList.length} Agenda dengan Target RAB
              </Badge>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  title={isRabOpen ? 'Sembunyikan Target RAB' : 'Tampilkan Target RAB'}
                >
                  <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', isRabOpen && 'rotate-180')} />
                  <span className="sr-only">Toggle Target RAB</span>
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {targetRabList.map((item) => {
                const isAchieved = item.persentase >= 100;
                const visualWidth = Math.min(Math.max(item.persentase, 0), 100);

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border bg-card/60 p-3.5 space-y-3 hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-semibold text-xs sm:text-sm leading-snug line-clamp-1 text-foreground" title={item.judul}>
                            {item.judul}
                          </h4>
                          {item.is_estimasi && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium"
                              title="Realisasi sebagian atau seluruhnya dihitung dari pencocokan nama agenda pada keterangan catatan kas"
                            >
                              Estimasi
                            </Badge>
                          )}
                        </div>
                        {item.lokasi && (
                          <p className="text-[11px] text-muted-foreground truncate">{item.lokasi}</p>
                        )}
                      </div>
                      <Badge
                        variant={isAchieved ? 'default' : 'secondary'}
                        className={cn(
                          'text-[10px] shrink-0 font-semibold px-2 py-0.5',
                          isAchieved
                            ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                        )}
                      >
                        {isAchieved ? `Tercapai (${item.persentase}%)` : `${item.persentase}%`}
                      </Badge>
                    </div>

                    {/* Custom Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden border border-border/40">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            isAchieved
                              ? 'bg-emerald-500'
                              : item.persentase >= 50
                                ? 'bg-primary'
                                : 'bg-amber-500'
                          )}
                          style={{ width: `${visualWidth}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs gap-1">
                        <span className="text-muted-foreground text-[10px] sm:text-[11px]">Realisasi vs Target:</span>
                        <span className="font-semibold font-mono tabular-nums text-[11px] sm:text-xs text-foreground truncate">
                          {formatRupiah(item.realisasi)} / {formatRupiah(item.target_rab)} ({item.persentase}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
