import { BaganDetailManager } from "@/components/struktur/bagan-detail-manager";

interface PageProps {
  params: Promise<{
    bagian: string;
    id: string;
  }>;
}

export default async function PeriodeBaganPage({ params }: PageProps) {
  const { bagian, id } = await params;
  return <BaganDetailManager bagian={bagian} id={id} />;
}
