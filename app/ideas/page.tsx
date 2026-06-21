import { requireUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { ActivityIdeasClient } from "@/components/ideas/activity-ideas-client";

export default async function SearchModePage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseSetupNotice />;
  }

  const user = await requireUser();

  return <ActivityIdeasClient userEmail={user.email ?? "Teacher"} />;
}
