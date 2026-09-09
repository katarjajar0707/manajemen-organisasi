import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function UangMasukLoading() {
  return (
    <div className="max-w-2xl space-y-6 animate-in fade-in duration-300">
      <Skeleton className="h-8 w-44 rounded-md bg-muted/55" />
      <Card className="border-border/50 bg-card/60">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-md bg-muted/60" />
            <Skeleton className="h-6 w-64 bg-muted/70" />
          </div>
          <Skeleton className="h-3.5 w-72 bg-muted/40" />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-muted/55" />
            <Skeleton className="h-9 w-full rounded-md bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-muted/55" />
            <Skeleton className="h-9 w-full rounded-md bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 bg-muted/55" />
            <Skeleton className="h-9 w-full rounded-md bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-44 bg-muted/55" />
            <Skeleton className="h-32 w-full rounded-lg border border-dashed border-border/70 bg-muted/35" />
          </div>
          <Skeleton className="h-9 w-full rounded-md bg-muted/65" />
        </CardContent>
      </Card>
    </div>
  );
}
