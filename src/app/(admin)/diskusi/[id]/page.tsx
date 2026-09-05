import { DiskusiDetailManager } from "@/components/diskusi/diskusi-detail-manager";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ThreadDiskusiDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <DiskusiDetailManager id={id} />;
}
