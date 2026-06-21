"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { InfoPill, SectionTitle, Surface } from "@/components/ui";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/client";
import { fromActivityIdeasRow } from "@/lib/activity-ideas";
import { fromMaterialRow, saveCurrentMaterial } from "@/lib/material-generator";
import type { MaterialRow } from "@/lib/supabase/types";
import { fromTeachingPlanRow, saveCurrentPlan, saveDraftPlanForm } from "@/lib/teaching-plan";

type ResourceLibraryClientProps = {
  rows: MaterialRow[];
  userEmail: string;
};

function getResourceKind(row: MaterialRow) {
  const generated = (row.generated_content ?? {}) as Record<string, unknown>;
  const input = (row.input_data ?? {}) as Record<string, unknown>;

  const direct =
    typeof generated.resourceKind === "string"
      ? generated.resourceKind
      : typeof input.resourceKind === "string"
        ? input.resourceKind
        : "material";

  return direct;
}

function isFavorite(row: MaterialRow) {
  const generated = (row.generated_content ?? {}) as Record<string, unknown>;
  return generated.isFavorite === true;
}

export function ResourceLibraryClient({
  rows,
  userEmail
}: ResourceLibraryClientProps) {
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
        filter === row.output_type ||
        filter === kind;

      const text =
        `${row.theme} ${row.subject} ${row.output_type} ${row.skill_focus}`.toLowerCase();

      return matchesFilter && text.includes(query.toLowerCase());
    });
  }, [filter, library, query]);

  async function handleFavorite(row: MaterialRow) {
    const supabase = createClient();
    const generated = ((row.generated_content ?? {}) as Record<string, unknown>) || {};
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

  function handleDuplicate(row: MaterialRow) {
    const kind = getResourceKind(row);

    if (kind === "teaching-plan") {
      const plan = fromTeachingPlanRow(row);
      saveCurrentPlan(plan);
      saveDraftPlanForm(plan.form);
      setMessage("Teaching plan loaded for editing");
      return;
    }

    if (kind === "activity-ideas") {
      setMessage("Open Search Mode to generate or save another idea pack.");
      return;
    }

    const material = fromMaterialRow(row);
    saveCurrentMaterial(material);
    setMessage("Material loaded as current preview");
  }

  return (
    <AppShell
      title="Resource Library"
      description="Browse saved materials, teaching plans, and search idea packs in one place."
      userEmail={userEmail}
      headerAction={<SignOutButton />}
    >
      <Surface className="animate-fade-up">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            eyebrow="Library"
            title="Saved resources"
            description="Search, filter, favourite, duplicate, and reopen stored teaching resources."
          />
          <div className="field-shell flex w-full max-w-sm items-center rounded-full px-4 py-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search theme, goal, type, or focus"
              className="w-full border-0 bg-transparent text-sm text-ink/65 outline-none"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["All", "Favorites", "material", "teaching-plan", "activity-ideas"].map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  filter === item ? "bg-sage text-white" : "bg-white text-ink"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        {message ? <p className="mt-4 text-sm font-semibold text-sage">{message}</p> : null}

        <div className="mt-6 grid gap-4">
          {filtered.map((row) => {
            const kind = getResourceKind(row);
            const summary =
              kind === "teaching-plan"
                ? fromTeachingPlanRow(row).summary
                : kind === "activity-ideas"
                  ? fromActivityIdeasRow(row).summary
                  : fromMaterialRow(row).summary;

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
                      <InfoPill>{kind}</InfoPill>
                      {isFavorite(row) ? <InfoPill>Favorite</InfoPill> : null}
                    </div>
                    <h3 className="mt-3 font-display text-2xl font-bold text-ink">
                      {row.theme}
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

                <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold text-sage">
                  <button type="button" onClick={() => void handleFavorite(row)}>
                    {isFavorite(row) ? "Unfavourite" : "Favourite"}
                  </button>
                  <button type="button" onClick={() => handleDuplicate(row)}>
                    Duplicate
                  </button>
                  {kind === "teaching-plan" ? (
                    <Link href="/plans/create">Edit</Link>
                  ) : kind === "activity-ideas" ? (
                    <Link href="/ideas">Edit</Link>
                  ) : (
                    <Link href="/materials/result">Edit</Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Surface>
    </AppShell>
  );
}
