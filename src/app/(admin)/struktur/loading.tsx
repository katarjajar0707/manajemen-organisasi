import { LoadingCardGrid, LoadingPageHeader, LoadingStatCards, LoadingToolbar } from '@/components/common/loading-skeletons';

export default function StrukturLoading() {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <LoadingPageHeader actionCount={1} />
      <LoadingStatCards count={3} />
      <LoadingToolbar withTabs={false} />
      <LoadingCardGrid count={6} />
    </div>
  );
}
