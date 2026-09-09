import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DokumentasiLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 bg-muted/70" />
        <Skeleton className="h-4 w-80 bg-muted/45" />
      </div>
      <Card className="border-border/50 bg-card/60">
        <CardHeader>
          <Skeleton className="h-5 w-40 bg-muted/60" />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Skeleton className="aspect-square rounded-xl bg-muted/50" />
          <Skeleton className="aspect-square rounded-xl bg-muted/50" />
          <Skeleton className="aspect-square rounded-xl bg-muted/50" />
          <Skeleton className="aspect-square rounded-xl bg-muted/50" />
        </CardContent>
      </Card>
    </div>
  );
}
