import { requireUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { ThemePlannerClient } from "@/components/theme-planner/theme-planner-client";

export default async function ThemePlannerPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseSetupNotice />;
  }

  const user = await requireUser();

  return <ThemePlannerClient userEmail={user.email ?? "Teacher"} />;
}
