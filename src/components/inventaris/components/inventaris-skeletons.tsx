import { TableRow, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function InventarisTableRowsSkeleton({ history = false }: { history?: boolean }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, row) => (
        <TableRow key={row}>
          {Array.from({ length: 7 }).map((__, cell) => (
            <TableCell key={cell} className="py-4">
              <Skeleton
                className={
                  history && cell === 0 ? 'h-3 w-36' : cell === 6 ? 'h-3 ml-auto w-16' : 'h-3 w-24'
                }
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
    <div
      aria-busy="true"
      aria-live="polite"
      className="divide-y divide-border/60"
    >
      <span className="sr-only">Memuat daftar inventaris...</span>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-3 p-3.5 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-14" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3.5 w-1/2" />
            </div>
            <Skeleton className="h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20" />
          </div>
          <div className="flex items-center justify-between border-t border-border/40 pt-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
