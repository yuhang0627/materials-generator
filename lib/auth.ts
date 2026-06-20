import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function getOptionalUser() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser() {
  if (!hasSupabaseEnv()) {
    redirect("/");
  }

  const user = await getOptionalUser();

  if (!user) {
    redirect("/");
  }

  return user;
}
