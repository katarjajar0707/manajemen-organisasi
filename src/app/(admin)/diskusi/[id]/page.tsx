import { getDiskusiById, getDiskusiBalasans } from "@/actions/diskusi";
import { createClient, getProfile } from "@/lib/supabase/server";
import { DiskusiDetailManager } from "@/components/diskusi/diskusi-detail-manager";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ThreadDiskusiDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [thread, replies, { data: bagianList }, profile] = await Promise.all([
    getDiskusiById(id),
    getDiskusiBalasans(id),
    supabase.from("bagian").select("id, nama, slug").order("nama"),
    getProfile(),
  ]);

  if (!thread) {
    notFound();
  }

  return (
    <DiskusiDetailManager
      initialThread={thread}
      initialReplies={replies}
      bagianList={bagianList || []}
      currentUserId={profile?.id}
      userRole={profile?.role || "anggota"}
      currentUserBagianId={profile?.bagian_id}
    />
  );
}
