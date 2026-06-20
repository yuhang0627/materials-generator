import { requireUser } from "@/lib/auth";
import { GeneratedResultClient } from "@/components/materials/generated-result-client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";

export default async function GeneratedResultPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseSetupNotice />;
  }

  const user = await requireUser();

  return <GeneratedResultClient userEmail={user.email ?? "Teacher"} />;
}
