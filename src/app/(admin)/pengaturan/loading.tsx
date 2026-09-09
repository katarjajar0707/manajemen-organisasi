import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingPageHeader } from '@/components/common/loading-skeletons';

export default function PengaturanLoading() {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <LoadingPageHeader actionCount={0} />
      <div className="flex gap-2 overflow-x-auto border-b border-border/60 pb-2">
        <Skeleton className="h-8 w-28 shrink-0 rounded-md bg-muted/55" />
        <Skeleton className="h-8 w-28 shrink-0 rounded-md bg-muted/55" />
        <Skeleton className="h-8 w-28 shrink-0 rounded-md bg-muted/55" />
        <Skeleton className="h-8 w-28 shrink-0 rounded-md bg-muted/55" />
      </div>
      <Card className="border-border/50 bg-card/60">
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-44 bg-muted/65" />
          <Skeleton className="h-3.5 w-72 bg-muted/40" />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full rounded-md bg-muted/50" />
          <Skeleton className="h-10 w-full rounded-md bg-muted/50" />
          <Skeleton className="h-24 w-full rounded-md bg-muted/45 sm:col-span-2" />
          <Skeleton className="h-10 w-32 rounded-md bg-muted/60" />
        </CardContent>
      </Card>
    </div>
  );
}
