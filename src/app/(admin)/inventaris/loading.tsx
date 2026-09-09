import { LoadingCardGrid, LoadingPageHeader, LoadingStatCards, LoadingToolbar } from '@/components/common/loading-skeletons';

export default function InventarisLoading() {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <LoadingPageHeader actionCount={1} />
      <LoadingStatCards count={4} />
      <LoadingToolbar withTabs />
      <LoadingCardGrid count={6} />
    </div>
  );
}
