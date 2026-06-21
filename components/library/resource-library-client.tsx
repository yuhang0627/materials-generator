"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { InfoPill, SectionTitle, Surface } from "@/components/ui";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/client";
import { fromActivityIdeasRow } from "@/lib/activity-ideas";
import { fromMaterialRow, saveCurrentMaterial } from "@/lib/material-generator";
import type { MaterialRow } from "@/lib/supabase/types";
import { historyFilters } from "@/lib/mock-data";
import { fromTeachingPlanRow, saveCurrentPlan, saveDraftPlanForm } from "@/lib/teaching-plan";
import {
  fromThemePlanRow,
  saveCurrentThemePlan,
  saveDraftThemePlanForm
} from "@/lib/theme-planner";
import {
  fromThemePackRow,
  saveCurrentThemePack,
  saveDraftThemePackForm
} from "@/lib/theme-packs";
import {
  fromToolkitRow,
  saveCurrentToolkitResource,
  saveDraftToolkitForm
} from "@/lib/eip-toolkit";

type ResourceLibraryClientProps = {
  rows: MaterialRow[];
  userEmail: string;
};

type KindConfig = {
  label: string;
  editHref: string;
  parse: (row: MaterialRow) => { title: string; summary: string };
  /** Loads the resource into the editor draft; returns a status message. */
  load: (row: MaterialRow) => string;
};

/**
 * Single source of truth per resourceKind — replaces the previously duplicated
 * 4× `kind === ...` dispatch ladders (label, parse, edit link, load).
 */
const KIND_REGISTRY: Record<string, KindConfig> = {
  material: {
    label: "Material",
    editHref: "/materials/result",
    parse: (row) => fromMaterialRow(row),
    load: (row) => {
      saveCurrentMaterial(fromMaterialRow(row));
      return "Material loaded as current preview";
    }
  },
  "teaching-plan": {
    label: "Teaching Plan",
    editHref: "/plans/create",
    parse: (row) => fromTeachingPlanRow(row),
    load: (row) => {
      const plan = fromTeachingPlanRow(row);
      saveCurrentPlan(plan);
      saveDraftPlanForm(plan.form);
      return "Teaching plan loaded for editing";
    }
  },
  "theme-plan": {
    label: "Theme Planner",
    editHref: "/theme-planner",
    parse: (row) => fromThemePlanRow(row),
    load: (row) => {
      const themePlan = fromThemePlanRow(row);
      saveCurrentThemePlan(themePlan);
      saveDraftThemePlanForm(themePlan.form);
      return "Theme planner loaded for editing";
    }
  },
  "theme-pack": {
    label: "Theme Pack",
    editHref: "/theme-packs",
    parse: (row) => fromThemePackRow(row),
    load: (row) => {
      const themePack = fromThemePackRow(row);
      saveCurrentThemePack(themePack);
      saveDraftThemePackForm(themePack.form);
      return "Theme pack loaded for editing";
    }
  },
  "eip-toolkit": {
    label: "EIP Toolkit",
    editHref: "/toolkit",
    parse: (row) => fromToolkitRow(row),
    load: (row) => {
      const toolkit = fromToolkitRow(row);
      saveCurrentToolkitResource(toolkit);
      saveDraftToolkitForm(toolkit.form);
      return "Toolkit resource loaded for editing";
    }
  },
  "activity-ideas": {
    label: "Activity Ideas",
    editHref: "/ideas",
    parse: (row) => fromActivityIdeasRow(row),
    load: () => "Opening Activity Ideas — generate or save another idea pack."
  }
};

const libraryFilters = [
  { label: "All", match: "All" },
  { label: "Favourites", match: "Favorites" },
  ...historyFilters.slice(1)
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

function configFor(kind: string) {
  return KIND_REGISTRY[kind] ?? KIND_REGISTRY.material;
}

function isFavorite(row: MaterialRow) {
  const generated = (row.generated_content ?? {}) as Record<string, unknown>;
  return generated.isFavorite === true;
}

export function ResourceLibraryClient({
  rows,
  userEmail
}: ResourceLibraryClientProps) {
  const router = useRouter();
  const [library, setLibrary] = useState(rows);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    return library.filter((row) => {
      const kind = getResourceKind(row);
      const matchesFilter =
        filter === "All" ||
        (filter === "Favorites" && isFavorite(row)) ||
        filter === kind;

      const text =
        `${row.theme} ${row.subject} ${row.output_type} ${row.skill_focus}`.toLowerCase();

      return matchesFilter && text.includes(query.toLowerCase());
    });
  }, [filter, library, query]);

  async function handleFavorite(row: MaterialRow) {
    const supabase = createClient();
    const generated = (row.generated_content ?? {}) as Record<string, unknown>;
    const next = {
      ...generated,
      isFavorite: !isFavorite(row)
    };

    const { error } = await supabase
      .from("materials")
      .update({ generated_content: next })
      .eq("id", row.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setLibrary((current) =>
      current.map((item) =>
        item.id === row.id ? { ...item, generated_content: next } : item
      )
    );
    setMessage(next.isFavorite ? "Added to favourites" : "Removed from favourites");
  }

  function handleOpen(row: MaterialRow) {
    const config = configFor(getResourceKind(row));
    setMessage(config.load(row));
    router.push(config.editHref);
  }

  return (
    <AppShell
      title="Resource Library"
      description="Browse, favourite, and reopen everything you've saved — materials, plans, packs, and idea sets — in one place."
      userEmail={userEmail}
      headerAction={<SignOutButton />}
    >
      <Surface className="animate-fade-up">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            eyebrow="Library"
            title="Saved resources"
            description="Search, filter, favourite, and reopen any stored teaching resource."
          />
          <div className="field-shell flex w-full max-w-sm items-center gap-2 rounded-full px-4 py-3">
            <span className="text-ink/40">🔍</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search theme, subject, type, or focus"
              className="w-full border-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink/45"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {libraryFilters.map((item) => (
            <button
              key={item.match}
              type="button"
              onClick={() => setFilter(item.match)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                filter === item.match
                  ? "bg-sage text-white"
                  : "bg-white text-ink hover:bg-cream"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {message ? (
          <p className="mt-4 text-sm font-semibold text-sage">{message}</p>
        ) : null}

        <div className="mt-6 grid gap-4">
          {filtered.length === 0 ? (
            <div className="rounded-[28px] bg-gradient-to-r from-white to-cream p-8 text-center">
              <p className="text-3xl">📚</p>
              <p className="mt-3 font-display text-2xl font-bold text-ink">
                {library.length === 0
                  ? "Your library is empty"
                  : "No resources match this filter"}
              </p>
              <p className="mt-2 text-sm leading-7 text-ink/70">
                {library.length === 0
                  ? "Create a material, plan, or pack and save it — it will show up here."
                  : "Try a different category or clear your search."}
              </p>
              {library.length === 0 ? (
                <Link
                  href="/materials/create"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-sage px-5 py-3 text-sm font-bold text-white transition hover:bg-[#8cab99]"
                >
                  Create your first resource
                </Link>
              ) : null}
            </div>
          ) : null}

          {filtered.map((row) => {
            const kind = getResourceKind(row);
            const config = configFor(kind);
            const { title, summary } = config.parse(row);

            return (
              <div
                key={row.id}
                className="rounded-[28px] bg-gradient-to-r from-white to-cream p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
                        {new Date(row.created_at).toLocaleString("en-MY")}
                      </p>
                      <InfoPill>{config.label}</InfoPill>
                      {isFavorite(row) ? <InfoPill>★ Favourite</InfoPill> : null}
                    </div>
                    <h3 className="mt-3 font-display text-2xl font-bold text-ink">
                      {title}
                    </h3>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-ink/75">
                      {summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-mint/55 px-3 py-2 text-xs font-bold text-ink/75">
                      {row.output_type}
                    </span>
                    <span className="rounded-full bg-blush/60 px-3 py-2 text-xs font-bold text-ink/75">
                      {row.subject}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpen(row)}
                    className="rounded-full bg-sage px-4 py-2 text-sm font-bold text-white transition hover:bg-[#8cab99]"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleFavorite(row)}
                    className="rounded-full bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-cream"
                  >
                    {isFavorite(row) ? "Unfavourite" : "Favourite"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Surface>
    </AppShell>
  );
}
