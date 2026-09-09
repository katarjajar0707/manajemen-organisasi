import { LoadingCardGrid, LoadingPageHeader, LoadingToolbar } from '@/components/common/loading-skeletons';

export default function PengumumanLoading() {
  return <div className="animate-in fade-in space-y-6 duration-300"><LoadingPageHeader actionCount={1} /><LoadingToolbar withTabs /><LoadingCardGrid count={6} /></div>;
}
