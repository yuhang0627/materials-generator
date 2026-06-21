import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { AppShell } from "@/components/app-shell";
import { InfoPill, PrimaryLink, SectionTitle, SecondaryLink, Surface } from "@/components/ui";
import { dashboardStats, quickTemplates, recentMaterials } from "@/lib/mock-data";
import { fromMaterialRow } from "@/lib/material-generator";
import { fromActivityIdeasRow } from "@/lib/activity-ideas";
import type { MaterialRow } from "@/lib/supabase/types";
import { SignOutButton } from "@/components/sign-out-button";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { fromTeachingPlanRow } from "@/lib/teaching-plan";
import { fromThemePlanRow } from "@/lib/theme-planner";
import { fromThemePackRow } from "@/lib/theme-packs";

function getResourceKind(row: MaterialRow) {
  const generated = (row.generated_content ?? {}) as Record<string, unknown>;
  const input = (row.input_data ?? {}) as Record<string, unknown>;

  return typeof generated.resourceKind === "string"
    ? generated.resourceKind
    : typeof input.resourceKind === "string"
      ? input.resourceKind
      : "material";
}

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseSetupNotice />;
  }

  const user = await requireUser();
  const supabase = await createClient();
  const [{ count }, { data }] = await Promise.all([
    supabase.from("materials").select("*", { count: "exact", head: true }),
    supabase
      .from("materials")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3)
  ]);

  const recentFromSupabase = ((data ?? []) as MaterialRow[]).map((row) => {
    const kind = getResourceKind(row);
    const resource =
      kind === "teaching-plan"
        ? fromTeachingPlanRow(row)
        : kind === "theme-pack"
          ? fromThemePackRow(row)
        : kind === "theme-plan"
          ? fromThemePlanRow(row)
          : kind === "activity-ideas"
            ? fromActivityIdeasRow(row)
            : fromMaterialRow(row);

    return {
      id: row.id,
      title: resource.title,
      status: "Saved",
      outputType: row.output_type,
      level: row.student_level,
      createdAt: new Date(row.created_at).toLocaleString("en-MY"),
      description: resource.summary
    };
  });

  const visibleRecent = recentFromSupabase.length > 0 ? recentFromSupabase : recentMaterials;
  const visibleStats = dashboardStats.map((stat, index) =>
    index === 0 ? { ...stat, value: String(count ?? 0), note: "Saved in Supabase" } : stat
  );

  return (
    <AppShell
      title="Dashboard"
      description="Keep your teaching materials organised, reuse calm templates, and prepare supportive classroom resources with less friction."
      userEmail={user.email ?? "Teacher"}
      headerAction={<SignOutButton />}
    >
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Surface className="animate-fade-up">
          <SectionTitle
            eyebrow="Today"
            title="A gentle workspace for your next material set"
            description="Browse quick templates, continue recent work, or start a fresh prompt using sample data."
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {visibleStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[24px] bg-gradient-to-br from-white to-cream p-4"
              >
                <p className="text-sm font-semibold text-ink/70">{stat.label}</p>
                <p className="mt-2 font-display text-3xl font-bold text-ink">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-sage">
                  {stat.note}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <PrimaryLink href="/materials/create">Create New Material</PrimaryLink>
            <SecondaryLink href="/theme-packs">Open Theme Packs</SecondaryLink>
            <SecondaryLink href="/theme-planner">Open Theme Planner</SecondaryLink>
            <SecondaryLink href="/plans/create">Open Teaching Plans</SecondaryLink>
            <SecondaryLink href="/library">Open Resource Library</SecondaryLink>
          </div>
        </Surface>

        <Surface className="animate-fade-up stagger-1">
          <SectionTitle
            eyebrow="Teacher Snapshot"
            title="This week"
            description="A quick view of what is ready to teach."
          />

          <div className="space-y-3">
            <div className="rounded-[24px] bg-mint/45 p-4">
              <p className="text-sm font-semibold text-ink/75">Upcoming focus</p>
              <p className="mt-2 font-display text-xl font-bold text-ink">
                Feelings, routines, and self-regulation
              </p>
            </div>
            <div className="rounded-[24px] bg-blush/55 p-4">
              <p className="text-sm font-semibold text-ink/75">Suggested batch</p>
              <p className="mt-2 text-sm leading-7 text-ink/80">
                Create one visual card set, one behaviour worksheet, and one
                short chant to support repetition across the week.
              </p>
            </div>
          </div>
        </Surface>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <Surface className="animate-fade-up stagger-2">
          <SectionTitle
            eyebrow="Quick Start"
            title="Template ideas"
            description="Sample starting points for common Early Intervention Program teaching needs."
          />

          <div className="space-y-4">
            {quickTemplates.map((template) => (
              <div
                key={template.title}
                className="rounded-[26px] border border-sage/15 bg-white/70 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-bold text-ink">
                    {template.title}
                  </h3>
                  <InfoPill>{template.tag}</InfoPill>
                </div>
                <p className="mt-2 text-sm leading-6 text-ink/72">
                  {template.description}
                </p>
              </div>
            ))}
          </div>
        </Surface>

        <Surface className="animate-fade-up stagger-3">
          <SectionTitle
            eyebrow="Recent"
            title="Recent materials"
            description="Sample history cards showing the kind of output this tool will organise."
          />

          <div className="space-y-4">
            {visibleRecent.map((item) => (
              <div
                key={item.id}
                className="rounded-[26px] bg-gradient-to-r from-white to-cream p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
                      {item.id}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-bold text-ink">
                      {item.title}
                    </h3>
                  </div>
                  <InfoPill>{item.status}</InfoPill>
                </div>
                <p className="mt-3 text-sm leading-6 text-ink/72">
                  {item.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-ink/70">
                  <span>{item.outputType}</span>
                  <span>•</span>
                  <span>{item.level}</span>
                  <span>•</span>
                  <span>{item.createdAt}</span>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/library"
            className="mt-5 inline-flex text-sm font-bold text-sage"
          >
            View saved resources
          </Link>
        </Surface>
      </div>
    </AppShell>
  );
}
