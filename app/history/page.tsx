import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { MaterialRow } from "@/lib/supabase/types";
import { HistoryClient } from "@/components/materials/history-client";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";

export default async function HistoryPage() {
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
    <HistoryClient
      initialRows={(data ?? []) as MaterialRow[]}
      userEmail={user.email ?? "Teacher"}
    />
  );
}
