import { ProfilManager } from "@/components/profil/profil-manager";
import { getMyProfile } from "@/actions/profil";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const profile = await getMyProfile();

  if (!profile) {
    redirect("/login");
  }

  return <ProfilManager profile={profile} />;
}
