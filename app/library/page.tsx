import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { ResourceLibraryClient } from "@/components/library/resource-library-client";
import type { MaterialRow } from "@/lib/supabase/types";

export default async function LibraryPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseSetupNotice />;
  }

  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("materials")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <ResourceLibraryClient
      rows={(data ?? []) as MaterialRow[]}
      userEmail={user.email ?? "Teacher"}
    />
  );
}
