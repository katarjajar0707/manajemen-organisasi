'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { KegiatanData } from '@/actions/kegiatan';

interface MiniCalendarProps {
  kegiatan: KegiatanData[];
  onSelectDate?: (dateStr: string) => void;
}

export function MiniCalendar({ kegiatan }: MiniCalendarProps) {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const firstDay = new Date(current.year, current.month, 1).getDay();

  const eventDays = useMemo(() => {
    const map: Record<number, KegiatanData[]> = {};
    kegiatan.forEach((ev) => {
      const d = new Date(ev.tanggalMulai + 'T00:00:00');
      if (d.getMonth() === current.month && d.getFullYear() === current.year) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(ev);
      }
    });
    return map;
  }, [kegiatan, current]);

  const monthName = new Date(current.year, current.month).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  const prev = () =>
    setCurrent((c) => {
      const m = c.month - 1;
      return m < 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: m };
    });

  const next = () =>
    setCurrent((c) => {
      const m = c.month + 1;
      return m > 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: m };
    });

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <Card className="border shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base capitalize">{monthName}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={next}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] font-medium text-muted-foreground mb-1">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, i) => {
            const isToday =
              day === today.getDate() &&
              current.month === today.getMonth() &&
              current.year === today.getFullYear();
            const events = day ? eventDays[day] : null;
            return (
              <div
                key={i}
                className={`relative aspect-square flex flex-col items-center justify-center rounded text-xs cursor-default
                  ${day ? 'hover:bg-muted/60' : ''}
                  ${isToday ? 'bg-primary text-primary-foreground font-bold' : ''}
                `}
              >
                {day && (
                  <>
                    <span>{day}</span>
                    {events && events.length > 0 && !isToday && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {events.slice(0, 2).map((_, idx) => (
                          <span key={idx} className="h-1 w-1 rounded-full bg-primary" />
                        ))}
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Upcoming in this month */}
        {Object.keys(eventDays).length > 0 && (
          <div className="mt-4 space-y-2 border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground">Kegiatan Bulan Ini</p>
            {Object.entries(eventDays)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([day, evs]) =>
                evs.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-2 text-xs">
                    <span className="w-6 text-right shrink-0 font-medium text-primary">{day}</span>
                    <span className="text-muted-foreground leading-tight line-clamp-1">{ev.judul}</span>
                  </div>
                ))
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
