import { ProfilManager } from "@/components/profil/profil-manager";
import { getMyProfile } from "@/actions/profil";
import { getUsers } from "@/actions/admin-users";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const [profile, users] = await Promise.all([
    getMyProfile(),
    getUsers(),
  ]);

  if (!profile) {
    redirect("/login");
  }

  return <ProfilManager profile={profile} users={users || []} />;
}

