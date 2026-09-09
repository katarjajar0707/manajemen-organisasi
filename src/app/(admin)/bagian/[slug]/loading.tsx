import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingPageHeader, LoadingToolbar } from '@/components/common/loading-skeletons';

export default function BagianDetailLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <LoadingPageHeader actionCount={1} />
      <LoadingToolbar withTabs={false} />
      <Card className="border-border/50 bg-card/60">
        <CardHeader>
          <Skeleton className="h-5 w-44 bg-muted/65" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="space-y-2 border-b border-border/50 pb-4 last:border-0">
              <Skeleton className="h-5 w-3/5 bg-muted/60" />
              <Skeleton className="h-3.5 w-full bg-muted/40" />
              <Skeleton className="h-3.5 w-4/5 bg-muted/35" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
