import { BagianCatatanManager } from "@/components/bagian/bagian-catatan-manager";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BagianDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <BagianCatatanManager slug={slug} />;
}
