import { LoadingPageHeader, LoadingTableCard, LoadingToolbar } from '@/components/common/loading-skeletons';

export default function PenggunaLoading() {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <LoadingPageHeader actionCount={1} />
      <LoadingToolbar withTabs={false} />
      <LoadingTableCard columns={5} rows={7} minWidth="min-w-180" />
    </div>
  );
}
