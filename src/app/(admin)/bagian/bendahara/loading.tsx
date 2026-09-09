import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const transactionRows = Array.from({ length: 6 });

function SkeletonButton({ className = '' }: { className?: string }) {
  return <Skeleton className={`h-9 rounded-lg bg-muted/60 ${className}`} />;
}

export default function BendaharaLoading() {
  return (
    <div className="animate-in fade-in space-y-6 duration-300" aria-label="Memuat manajemen keuangan">
      {/* Header: title/description and the two full-width mobile actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 bg-muted/70 sm:w-64" />
          <Skeleton className="h-4 w-full max-w-82.5 bg-muted/50 sm:w-96" />
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <SkeletonButton className="w-full sm:w-28" />
          <SkeletonButton className="w-full sm:w-28" />
        </div>
      </div>

      {/* Balance cards: first card spans both columns on mobile */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <Card className="col-span-2 border-border/50 bg-card/60 shadow-xs sm:col-span-1">
          <CardHeader className="space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-md bg-muted/60" />
              <Skeleton className="h-4 w-28 bg-muted/60" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-8 w-36 bg-muted/70" />
            <Skeleton className="h-3 w-32 bg-muted/45" />
          </CardContent>
        </Card>
        {['income', 'expense'].map((item) => (
          <Card key={item} className="border-border/50 bg-card/60 shadow-xs">
            <CardHeader className="space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-md bg-muted/60" />
                <Skeleton className="h-4 w-24 bg-muted/60" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-7 w-28 bg-muted/70 sm:w-32" />
              <Skeleton className="h-3 w-24 bg-muted/45 sm:w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transaction card: mirrors the responsive filter toolbar and horizontal table */}
      <Card className="overflow-hidden border-border/50 bg-card/60">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex flex-col items-start gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-36 bg-muted/70" />
                <Skeleton className="h-5 w-12 rounded-md bg-muted/50" />
              </div>
              <Skeleton className="h-3.5 w-56 bg-muted/45" />
            </div>

            <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center xl:w-auto">
              <Skeleton className="h-9 w-full rounded-lg bg-muted/55 sm:w-64" />
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Skeleton className="h-8 min-w-0 flex-1 rounded-md bg-muted/55 sm:w-52" />
                <Skeleton className="h-8 w-16 shrink-0 rounded-md bg-muted/55 sm:w-20" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-3 py-3 sm:px-6">
                    <Skeleton className="h-3 w-14 bg-muted/55" />
                  </th>
                  <th className="px-3 py-3 text-left sm:px-6">
                    <Skeleton className="h-3 w-24 bg-muted/55" />
                  </th>
                  <th className="px-3 py-3 text-right sm:px-6">
                    <Skeleton className="ml-auto h-3 w-16 bg-muted/55" />
                  </th>
                  <th className="px-3 py-3 sm:px-6">
                    <Skeleton className="mx-auto h-3 w-14 bg-muted/55" />
                  </th>
                  <th className="px-3 py-3 sm:px-6">
                    <Skeleton className="mx-auto h-3 w-16 bg-muted/55" />
                  </th>
                  <th className="px-3 py-3 sm:px-6">
                    <Skeleton className="ml-auto h-3 w-10 bg-muted/55" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {transactionRows.map((_, index) => (
                  <tr key={index}>
                    <td className="px-3 py-4 sm:px-6">
                      <Skeleton className="h-3.5 w-20 bg-muted/45" />
                    </td>
                    <td className="min-w-55 px-3 py-4 sm:px-6">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40 bg-muted/65 sm:w-52" />
                        <Skeleton className="h-3 w-28 bg-muted/40 sm:w-36" />
                        <Skeleton className="h-2.5 w-20 bg-muted/35" />
                      </div>
                    </td>
                    <td className="px-3 py-4 sm:px-6">
                      <Skeleton className="ml-auto h-4 w-24 bg-muted/60" />
                    </td>
                    <td className="px-3 py-4 sm:px-6">
                      <Skeleton className="mx-auto h-6 w-20 rounded-md bg-muted/55" />
                    </td>
                    <td className="px-3 py-4 sm:px-6">
                      <Skeleton className="mx-auto h-12 w-12 rounded-lg bg-muted/50" />
                    </td>
                    <td className="px-3 py-4 sm:px-6">
                      <Skeleton className="ml-auto h-8 w-8 rounded-md bg-muted/50" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
