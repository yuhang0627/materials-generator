import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { AppShell } from "@/components/app-shell";
import { InfoPill, PrimaryLink, SectionTitle, Surface } from "@/components/ui";
import { fromMaterialRow } from "@/lib/material-generator";
import { fromActivityIdeasRow } from "@/lib/activity-ideas";
import type { MaterialRow } from "@/lib/supabase/types";
import { materialTypeOptions } from "@/lib/resource-options";
import { SignOutButton } from "@/components/sign-out-button";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { fromTeachingPlanRow } from "@/lib/teaching-plan";
import { fromThemePlanRow } from "@/lib/theme-planner";
import { fromThemePackRow } from "@/lib/theme-packs";
import { fromToolkitRow } from "@/lib/eip-toolkit";

const startActions = [
  {
    href: "/materials/create",
    icon: "🎨",
    title: "Create Material",
    description: "Worksheets, flashcards, posters, social stories and more."
  },
  {
    href: "/toolkit",
    icon: "🧰",
    title: "EIP Toolkit",
    description: "Token boards, visual schedules, first–then and emotion boards."
  },
  {
    href: "/theme-packs",
    icon: "📦",
    title: "Theme Packs",
    description: "A full bundle of resources around one classroom theme."
  },
  {
    href: "/theme-planner",
    icon: "🗓️",
    title: "Theme Planner",
    description: "Map a 1–4 week thematic roadmap for your class."
  },
  {
    href: "/plans/create",
    icon: "📋",
    title: "Teaching Plans",
    description: "A structured, activity-based lesson plan."
  },
  {
    href: "/ideas",
    icon: "💡",
    title: "Activity Ideas",
    description: "Quick, level-appropriate activity suggestions."
  }
];

function getResourceKind(row: MaterialRow) {
  const generated = (row.generated_content ?? {}) as Record<string, unknown>;
  const input = (row.input_data ?? {}) as Record<string, unknown>;

  return typeof generated.resourceKind === "string"
    ? generated.resourceKind
    : typeof input.resourceKind === "string"
      ? input.resourceKind
      : "material";
}

function resourceFromRow(row: MaterialRow) {
  const kind = getResourceKind(row);

  return kind === "teaching-plan"
    ? fromTeachingPlanRow(row)
    : kind === "eip-toolkit"
      ? fromToolkitRow(row)
      : kind === "theme-pack"
        ? fromThemePackRow(row)
        : kind === "theme-plan"
          ? fromThemePlanRow(row)
          : kind === "activity-ideas"
            ? fromActivityIdeasRow(row)
            : fromMaterialRow(row);
}

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseSetupNotice />;
  }

  const user = await requireUser();
  const supabase = await createClient();

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count }, { count: weekCount }, { data }] = await Promise.all([
    supabase.from("materials").select("*", { count: "exact", head: true }),
    supabase
      .from("materials")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    supabase
      .from("materials")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3)
  ]);

  const recent = ((data ?? []) as MaterialRow[]).map((row) => {
    const resource = resourceFromRow(row);

    return {
      id: row.id,
      title: resource.title,
      outputType: row.output_type,
      level: row.student_level,
      createdAt: new Date(row.created_at).toLocaleString("en-MY"),
      description: resource.summary
    };
  });

  const stats = [
    {
      label: "Saved materials",
      value: String(count ?? 0),
      note: "In your library"
    },
    {
      label: "Created this week",
      value: String(weekCount ?? 0),
      note: "Last 7 days"
    },
    {
      label: "Material formats",
      value: String(materialTypeOptions.length),
      note: "Ready to generate"
    },
    {
      label: "Export options",
      value: "3",
      note: "PDF · PNG · Print"
    }
  ];

  return (
    <AppShell
      title={`Welcome back${user.email ? `, ${user.email.split("@")[0]}` : ""}`}
      description="Keep your teaching materials organised, reuse calm templates, and prepare supportive classroom resources with less friction."
      userEmail={user.email ?? "Teacher"}
      headerAction={<SignOutButton />}
    >
      <Surface className="animate-fade-up">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
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
      </Surface>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <Surface className="animate-fade-up stagger-1">
          <SectionTitle
            eyebrow="Start something"
            title="What would you like to make?"
            description="Pick a tool to begin. Everything you create can be previewed, exported, and saved to your library."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {startActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-[26px] border border-sage/15 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:border-sage/30 hover:bg-white"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-mint/70 to-cream text-2xl">
                    {action.icon}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-ink/70">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Surface>

        <Surface className="animate-fade-up stagger-2">
          <SectionTitle
            eyebrow="Suggested focus"
            title="A calm batch for this week"
            description="A gentle starting point — not a requirement."
          />

          <div className="space-y-3">
            <div className="rounded-[24px] bg-mint/45 p-4">
              <p className="text-sm font-semibold text-ink/75">Theme idea</p>
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
            <PrimaryLink href="/materials/create">Create New Material</PrimaryLink>
          </div>
        </Surface>
      </div>

      <Surface className="mt-5 animate-fade-up stagger-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionTitle
            eyebrow="Recent"
            title="Recently saved"
            description="Your latest saved resources from Supabase."
          />
          <Link href="/library" className="text-sm font-bold text-sage">
            View library
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-[26px] bg-gradient-to-r from-white to-cream p-6 text-center">
            <p className="text-3xl">🌱</p>
            <p className="mt-3 font-display text-xl font-bold text-ink">
              Nothing saved yet
            </p>
            <p className="mt-2 text-sm leading-7 text-ink/70">
              Create a material and click “Save to History” — it will appear here.
            </p>
            <Link
              href="/materials/create"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-sage px-5 py-3 text-sm font-bold text-white transition hover:bg-[#8cab99]"
            >
              Create your first material
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {recent.map((item) => (
              <div
                key={item.id}
                className="rounded-[26px] bg-gradient-to-br from-white to-cream p-4"
              >
                <InfoPill>{item.outputType}</InfoPill>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink/72">
                  {item.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-ink/60">
                  <span>{item.level}</span>
                  <span>•</span>
                  <span>{item.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Surface>
    </AppShell>
  );
}
