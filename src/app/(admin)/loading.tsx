import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 sm:w-64 bg-muted/60" />
          <Skeleton className="h-4 w-72 sm:w-96 bg-muted/40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg bg-muted/60" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50 bg-card/60">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <Skeleton className="h-4 w-24 bg-muted/50" />
              <Skeleton className="h-8 w-8 rounded-md bg-muted/60" />
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2">
              <Skeleton className="h-7 w-32 bg-muted/70" />
              <Skeleton className="h-3 w-40 bg-muted/40" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area Skeleton (Table / List / Cards) */}
      <Card className="border-border/50 bg-card/60">
        <CardHeader className="p-5 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-40 bg-muted/60" />
              <Skeleton className="h-3.5 w-60 bg-muted/40" />
            </div>
            <Skeleton className="h-8 w-24 rounded-md bg-muted/50" />
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full bg-muted/60" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 sm:w-48 bg-muted/60" />
                  <Skeleton className="h-3 w-20 sm:w-28 bg-muted/40" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-full bg-muted/50" />
                <Skeleton className="h-8 w-8 rounded-md bg-muted/40" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
