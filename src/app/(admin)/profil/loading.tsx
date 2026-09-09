import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingTableCard, LoadingToolbar } from '@/components/common/loading-skeletons';

export default function ProfilLoading() {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <Card className="border-border/50 bg-card/60">
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start">
          <Skeleton className="h-24 w-24 shrink-0 rounded-full bg-muted/60" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-6 w-48 bg-muted/70" />
            <Skeleton className="h-4 w-32 bg-muted/45" />
            <Skeleton className="h-10 w-full max-w-xl bg-muted/40" />
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Skeleton className="h-8 flex-1 rounded-md bg-muted/55 sm:w-28" />
            <Skeleton className="h-8 flex-1 rounded-md bg-muted/55 sm:w-28" />
          </div>
        </CardContent>
      </Card>
      <LoadingToolbar withTabs={false} />
      <LoadingTableCard columns={6} rows={6} minWidth="min-w-190" />
    </div>
  );
}
