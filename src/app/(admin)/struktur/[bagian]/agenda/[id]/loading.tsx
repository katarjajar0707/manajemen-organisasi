import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AgendaDetailLoading() {
  return <div className="space-y-6 animate-in fade-in duration-300"><div className="space-y-2"><Skeleton className="h-8 w-64 bg-muted/70" /><Skeleton className="h-4 w-80 bg-muted/45" /></div><Card className="border-border/50 bg-card/60"><CardHeader><Skeleton className="h-5 w-48 bg-muted/65" /></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-48 rounded-xl bg-muted/45" /><Skeleton className="h-48 rounded-xl bg-muted/45" /><Skeleton className="h-48 rounded-xl bg-muted/45" /></CardContent></Card></div>;
}
