'use client';

import { TableRow, TableCell } from '@/components/ui/table';

export function InventarisTableRowsSkeleton({ history = false }: { history?: boolean }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, row) => (
        <TableRow key={row}>
          {Array.from({ length: 7 }).map((__, cell) => (
            <TableCell key={cell} className="py-4">
              <div
                className={`h-3 animate-pulse rounded bg-muted ${
                  history && cell === 0 ? 'w-36' : cell === 6 ? 'ml-auto w-16' : 'w-24'
                }`}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function InventarisMobileRowsSkeleton() {
  return (
    <div className="divide-y divide-border/60" aria-label="Memuat daftar inventaris">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="p-3.5 sm:p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                <div className="h-4 w-14 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted/70" />
            </div>
            <div className="h-16 w-16 sm:h-20 sm:w-20 animate-pulse rounded-xl bg-muted/60 shrink-0" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div className="h-8 w-24 animate-pulse rounded-lg bg-muted/60" />
            <div className="flex gap-1">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-muted/60" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-muted/60" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-muted/60" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
