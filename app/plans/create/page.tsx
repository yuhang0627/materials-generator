import { requireUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { CreatePlanClient } from "@/components/plans/create-plan-client";

export default async function TeachingPlanPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseSetupNotice />;
  }

  const user = await requireUser();

  return <CreatePlanClient userEmail={user.email ?? "Teacher"} />;
}
