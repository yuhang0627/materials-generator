import { requireUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { EipToolkitClient } from "@/components/toolkit/eip-toolkit-client";

export default async function ToolkitPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseSetupNotice />;
  }

  const user = await requireUser();

  return <EipToolkitClient userEmail={user.email ?? "Teacher"} />;
}
