import { LoadingPageHeader, LoadingTableCard } from '@/components/common/loading-skeletons';

export default function AspirasiLoading() {
  return <div className="animate-in fade-in space-y-6 duration-300"><LoadingPageHeader actionCount={0} /><LoadingTableCard columns={5} rows={6} minWidth="min-w-180" /></div>;
}
