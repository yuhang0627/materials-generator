import { requireUser } from "@/lib/auth";
import { CreateMaterialClient } from "@/components/materials/create-material-client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";

export default async function CreateMaterialPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseSetupNotice />;
  }

  const user = await requireUser();

  return <CreateMaterialClient userEmail={user.email ?? "Teacher"} />;
}
