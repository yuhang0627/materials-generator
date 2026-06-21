"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { InfoPill, SectionTitle, Surface } from "@/components/ui";
import { SignOutButton } from "@/components/sign-out-button";
import { fromMaterialRow, saveCurrentMaterial } from "@/lib/material-generator";
import { fromActivityIdeasRow } from "@/lib/activity-ideas";
import {
  fromThemePlanRow,
  saveCurrentThemePlan,
  saveDraftThemePlanForm
} from "@/lib/theme-planner";
import { createClient } from "@/lib/supabase/client";
import type { MaterialRow } from "@/lib/supabase/types";
import { historyFilters } from "@/lib/mock-data";
import { fromTeachingPlanRow, saveCurrentPlan, saveDraftPlanForm } from "@/lib/teaching-plan";

function getResourceKind(row: MaterialRow) {
  const generated = (row.generated_content ?? {}) as Record<string, unknown>;
  const input = (row.input_data ?? {}) as Record<string, unknown>;

  return typeof generated.resourceKind === "string"
    ? generated.resourceKind
    : typeof input.resourceKind === "string"
      ? input.resourceKind
      : "material";
}

export function HistoryClient({
  initialRows,
  userEmail
}: {
  initialRows: MaterialRow[];
  userEmail: string;
}) {
  const [history, setHistory] = useState<MaterialRow[]>(initialRows);
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setHistory(initialRows);
  }, [initialRows]);

  useEffect(() => {
    const supabase = createClient();

    void (async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setHistory(data as MaterialRow[]);
      }
    })();
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesFilter =
        activeFilter === "All" ||
        item.output_type === activeFilter ||
        getResourceKind(item) === activeFilter;
      const searchText =
        `${item.theme} ${item.subject} ${item.output_type} ${item.skill_focus}`.toLowerCase();
      const matchesQuery = searchText.includes(query.toLowerCase());

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, history, query]);

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("materials").delete().eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setHistory((current) => current.filter((item) => item.id !== id));
    setMessage("Material deleted");
  }

  function handleLoad(item: MaterialRow) {
    const kind = getResourceKind(item);

    if (kind === "teaching-plan") {
      const plan = fromTeachingPlanRow(item);
      saveCurrentPlan(plan);
      saveDraftPlanForm(plan.form);
      setMessage("Teaching plan loaded");
      return;
    }

    if (kind === "theme-plan") {
      const themePlan = fromThemePlanRow(item);
      saveCurrentThemePlan(themePlan);
      saveDraftThemePlanForm(themePlan.form);
      setMessage("Theme planner loaded");
      return;
    }

    if (kind === "activity-ideas") {
      const ideas = fromActivityIdeasRow(item);
      setMessage(`Idea pack ready: ${ideas.title}`);
      return;
    }

    const material = fromMaterialRow(item);
    saveCurrentMaterial(material);
    setMessage("Loaded as current result");
  }

  return (
    <AppShell
      title="History"
      description="Review saved materials from Supabase, reopen a useful result, and delete items you no longer need."
      userEmail={userEmail}
      headerAction={<SignOutButton />}
    >
      <Surface className="animate-fade-up">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            eyebrow="Library"
            title="Generated materials history"
            description="These entries are loaded from Supabase for the current logged-in user."
          />

          <div className="field-shell flex w-full max-w-sm items-center rounded-full px-4 py-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by theme, subject, or type"
              className="w-full border-0 bg-transparent text-sm text-ink/65 outline-none"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {historyFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                activeFilter === filter ? "bg-sage text-white" : "bg-white text-ink"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {message ? <p className="mt-4 text-sm font-semibold text-sage">{message}</p> : null}

        <div className="mt-6 grid gap-4">
          {filteredHistory.length === 0 ? (
            <div className="rounded-[28px] bg-gradient-to-r from-white to-cream p-5">
              <p className="font-display text-2xl font-bold text-ink">No saved materials yet</p>
              <p className="mt-2 text-sm leading-7 text-ink/75">
                Generate a result and click Save to History to store it in Supabase.
              </p>
              <Link href="/materials/create" className="mt-4 inline-flex text-sm font-bold text-sage">
                Create a material
              </Link>
            </div>
          ) : null}

          {filteredHistory.map((item) => {
            const kind = getResourceKind(item);
            const entry =
              kind === "teaching-plan"
                ? fromTeachingPlanRow(item)
                : kind === "theme-plan"
                  ? fromThemePlanRow(item)
                  : kind === "activity-ideas"
                    ? fromActivityIdeasRow(item)
                    : fromMaterialRow(item);

            return (
              <div
                key={item.id}
                className="rounded-[28px] bg-gradient-to-r from-white to-cream p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage">
                        {new Date(item.created_at).toLocaleString("en-MY")}
                      </p>
                      <InfoPill>Saved in Supabase</InfoPill>
                      <InfoPill>{kind}</InfoPill>
                    </div>
                    <h3 className="mt-3 font-display text-2xl font-bold text-ink">
                      {entry.title}
                    </h3>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-ink/75">
                      {entry.summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-mint/55 px-3 py-2 text-xs font-bold text-ink/75">
                      {item.subject}
                    </span>
                    <span className="rounded-full bg-blush/60 px-3 py-2 text-xs font-bold text-ink/75">
                      {item.output_type}
                    </span>
                    <span className="rounded-full bg-lilac/60 px-3 py-2 text-xs font-bold text-ink/75">
                      {item.language}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold text-sage">
                  <button
                    type="button"
                    onClick={() => handleLoad(item)}
                    className="text-left"
                  >
                    {kind === "theme-plan"
                      ? "Load theme planner"
                      : kind === "teaching-plan"
                        ? "Load teaching plan"
                        : "Load as current result"}
                  </button>
                  <Link
                    href={
                      kind === "theme-plan"
                        ? "/theme-planner"
                        : kind === "teaching-plan"
                          ? "/plans/create"
                          : kind === "activity-ideas"
                            ? "/ideas"
                            : "/materials/result"
                    }
                  >
                    Open preview
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item.id)}
                    className="text-left"
                  >
                    Delete saved material
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
