import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getOptionalUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";

export default async function LoginPage() {
  const configured = hasSupabaseEnv();
  const user = configured ? await getOptionalUser() : null;

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-14 h-56 w-56 rounded-full bg-mint/55 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 animate-drift rounded-full bg-blush/65 blur-3xl" />
        <div className="absolute bottom-10 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-lilac/55 blur-3xl" />
      </div>

      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="animate-fade-up">
          <span className="inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-sage">
            Early Intervention Program Workspace
          </span>
          <h1 className="mt-6 max-w-2xl font-display text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
            Build calm, supportive EIP materials with less prep stress.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-ink/72 sm:text-lg">
            Create visual cards, worksheets, posters, songs, and more with a
            gentle private tool designed around clear routines and simple
            classroom support.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {["Worksheets", "Visual cards", "Behaviour support", "Canva prompts"].map(
              (item, index) => (
                <span
                  key={item}
                  className={`animate-fade-up rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-ink stagger-${Math.min(index + 1, 3)}`}
                >
                  {item}
                </span>
              )
            )}
          </div>
        </section>

        <section className="soft-panel animate-fade-up rounded-[34px] p-6 sm:p-8">
          <div className="mb-8">
            <p className="font-display text-3xl font-bold text-ink">
              Welcome back
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              Sign in with Supabase to open your private dashboard and save materials.
            </p>
          </div>

          {configured ? <LoginForm /> : <SupabaseSetupNotice />}

          <div className="mt-8 grid gap-3 rounded-[28px] bg-gradient-to-r from-cream to-blush p-4 text-sm text-ink/75 sm:grid-cols-3">
            <div>
              <p className="font-bold text-ink">Soft design</p>
              <p className="mt-1">Calm pastel layout for focused prep.</p>
            </div>
            <div>
              <p className="font-bold text-ink">Sample outputs</p>
              <p className="mt-1">Preview materials before any API work.</p>
            </div>
            <div>
              <p className="font-bold text-ink">Private feel</p>
              <p className="mt-1">Made to feel personal, not corporate.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
