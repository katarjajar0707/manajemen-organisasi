import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingCardGrid, LoadingPageHeader, LoadingStatCards } from '@/components/common/loading-skeletons';

export default function DashboardLoading() {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <LoadingPageHeader actionCount={2} />
      <Card className="border-border/50 bg-card/60 p-4 sm:p-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40 bg-muted/60" />
          <Skeleton className="h-3.5 w-full max-w-96 bg-muted/40" />
        </div>
      </Card>
      <LoadingStatCards count={3} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50 bg-card/60">
          <CardHeader>
            <Skeleton className="h-5 w-32 bg-muted/60" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg bg-muted/45" />
            <Skeleton className="h-16 w-full rounded-lg bg-muted/45" />
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/60">
          <CardHeader>
            <Skeleton className="h-5 w-36 bg-muted/60" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-12 w-full rounded-lg bg-muted/45" />
            <Skeleton className="h-12 w-full rounded-lg bg-muted/45" />
            <Skeleton className="h-12 w-full rounded-lg bg-muted/45" />
          </CardContent>
        </Card>
      </div>
      <LoadingCardGrid count={4} />
    </div>
  );
}
