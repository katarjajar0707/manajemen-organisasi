import { BagianCatatanManager } from "@/components/bagian/bagian-catatan-manager";
import { getCatatanList } from "@/actions/catatan";
import { getProfile } from "@/lib/supabase/server";
import { getCachedBagianBySlug } from "@/lib/cache/bagian";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BagianDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [profile, bagian] = await Promise.all([getProfile(), getCachedBagianBySlug(slug)]);

  if (!bagian) notFound();

  const isSupervisor = profile?.role === "admin" || profile?.role === "ketua";
  if (!profile || (!isSupervisor && profile.bagian_id !== bagian.id)) {
    redirect("/dashboard");
  }

  const catatanList = await getCatatanList(slug);

  return <BagianCatatanManager slug={slug} initialCatatan={catatanList} />;
}
