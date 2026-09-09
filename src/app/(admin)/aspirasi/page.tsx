import { getAspirasiWarga } from "@/actions/transparansi";
import { AspirasiManager } from "@/components/aspirasi/aspirasi-manager";

export default async function AspirasiPage() {
  const aspirasi = await getAspirasiWarga();

  return <AspirasiManager initialAspirasi={aspirasi} />;
}
