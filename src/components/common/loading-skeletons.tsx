import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingPageHeader({ actionCount = 1 }: { actionCount?: number }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52 bg-muted/70 sm:w-64" />
        <Skeleton className="h-4 w-full max-w-82.5 bg-muted/50 sm:w-96" />
      </div>
      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
        {Array.from({ length: actionCount }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full rounded-lg bg-muted/60 sm:w-28" />
        ))}
      </div>
    </div>
  );
}

export function LoadingStatCards({ count = 3, firstWide = false }: { count?: number; firstWide?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className={firstWide && index === 0 ? 'col-span-2 border-border/50 bg-card/60 shadow-xs sm:col-span-1' : 'border-border/50 bg-card/60 shadow-xs'}>
          <CardHeader className="space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-md bg-muted/60" />
              <Skeleton className="h-4 w-24 bg-muted/60" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-7 w-32 bg-muted/70" />
            <Skeleton className="h-3 w-36 bg-muted/45" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function LoadingToolbar({ withTabs = true }: { withTabs?: boolean }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/60 p-3 sm:flex-row sm:items-center sm:justify-between">
      {withTabs ? (
        <div className="flex w-full gap-1.5 overflow-hidden sm:w-auto">
          {[1, 2, 3].map((item) => <Skeleton key={item} className="h-8 w-20 shrink-0 rounded-lg bg-muted/55" />)}
        </div>
      ) : <Skeleton className="h-8 w-28 rounded-lg bg-muted/55" />}
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <Skeleton className="h-8 min-w-0 flex-1 rounded-md bg-muted/55 sm:w-56" />
        <Skeleton className="h-8 w-20 shrink-0 rounded-md bg-muted/55" />
      </div>
    </div>
  );
}

export function LoadingTableCard({ columns = 5, rows = 6, minWidth = 'min-w-0' }: { columns?: number; rows?: number; minWidth?: string }) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/60">
      <CardHeader className="border-b border-border/40 p-4 sm:p-5">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40 bg-muted/65" />
          <Skeleton className="h-3.5 w-60 bg-muted/40" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className={`w-full ${minWidth} text-sm`}>
            <thead className="border-b bg-muted/40">
              <tr>
                {Array.from({ length: columns }).map((_, index) => (
                  <th key={index} className="px-3 py-3 text-left sm:px-5"><Skeleton className="h-3 w-20 bg-muted/55" /></th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {Array.from({ length: rows }).map((_, row) => (
                <tr key={row}>
                  {Array.from({ length: columns }).map((__, column) => (
                    <td key={column} className="px-3 py-3.5 sm:px-5">
                      <Skeleton className={column === 0 ? 'h-4 w-32 bg-muted/60' : 'h-3.5 w-24 bg-muted/45'} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function LoadingCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="border-border/60 bg-card/60">
          <CardHeader className="space-y-2 pb-3">
            <Skeleton className="h-4 w-24 rounded-full bg-muted/55" />
            <Skeleton className="h-5 w-4/5 bg-muted/65" />
            <Skeleton className="h-3.5 w-full bg-muted/40" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-3.5 w-3/5 bg-muted/45" />
            <Skeleton className="h-3.5 w-2/5 bg-muted/35" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
