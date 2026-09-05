import { BagianCatatanManager } from "@/components/bagian/bagian-catatan-manager";
import { getCatatanList } from "@/actions/catatan";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BagianDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const catatanList = await getCatatanList(slug);
  
  return <BagianCatatanManager slug={slug} initialCatatan={catatanList} />;
}
