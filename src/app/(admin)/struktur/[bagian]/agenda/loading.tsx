import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingPageHeader, LoadingToolbar } from '@/components/common/loading-skeletons';

export default function AgendaLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <LoadingPageHeader actionCount={1} />
      <LoadingToolbar withTabs={false} />
      <Card className="border-border/50 bg-card/60">
        <CardHeader>
          <Skeleton className="h-5 w-40 bg-muted/65" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-lg border border-border/50 p-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg bg-muted/55" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-3/5 bg-muted/60" />
                <Skeleton className="h-3.5 w-4/5 bg-muted/40" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
