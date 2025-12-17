import { cookies } from "next/headers";
import { StudioStreamPageClient } from "@/features/studio/components/StudioStreamPageClient";

export default async function StudioPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  return <StudioStreamPageClient token={token} />;
}
