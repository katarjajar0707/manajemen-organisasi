import { LoadingPageHeader, LoadingTableCard, LoadingToolbar } from '@/components/common/loading-skeletons';

export default function AnggotaLoading() {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <LoadingPageHeader actionCount={1} />
      <LoadingToolbar withTabs />
      <LoadingTableCard columns={7} rows={7} minWidth="min-w-190" />
    </div>
  );
}
