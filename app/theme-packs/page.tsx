import { requireUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { ThemePacksClient } from "@/components/theme-packs/theme-packs-client";

export default async function ThemePacksPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseSetupNotice />;
  }

  const user = await requireUser();

  return <ThemePacksClient userEmail={user.email ?? "Teacher"} />;
}
