"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { SectionTitle, Surface } from "@/components/ui";
import { SignOutButton } from "@/components/sign-out-button";
import {
  clearDraftIdeasForm,
  generateActivityIdeas,
  getCurrentIdeas,
  getDraftIdeasForm,
  saveCurrentIdeas,
  saveDraftIdeasForm,
  toActivityIdeasInsert,
  type ActivityIdeasFormValues,
  type GeneratedActivityIdeas
} from "@/lib/activity-ideas";
import { activityIdeaPrompts, studentLevelOptions } from "@/lib/resource-options";
import { createClient } from "@/lib/supabase/client";

const defaultForm: ActivityIdeasFormValues = {
  query: activityIdeaPrompts[0],
  theme: "Malaysia National Day",
  ageGroup: "2-5",
  studentLevel: "Level 1.5",
  focus: "Cohesive Play",
  constraints: "Use simple classroom materials only."
};

export function ActivityIdeasClient({ userEmail }: { userEmail: string }) {
  const [form, setForm] = useState<ActivityIdeasFormValues>(defaultForm);
  const [result, setResult] = useState<GeneratedActivityIdeas | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const draft = getDraftIdeasForm();
    const current = getCurrentIdeas();
    if (draft) setForm({ ...defaultForm, ...draft });
    if (current) setResult(current);
  }, []);

  function updateField<K extends keyof ActivityIdeasFormValues>(
    key: K,
    value: ActivityIdeasFormValues[K]
  ) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      saveDraftIdeasForm(next);
      return next;
    });
  }

  function handleGenerate() {
    const next = generateActivityIdeas(form);
    saveCurrentIdeas(next);
    setResult(next);
    setMessage("Activity ideas generated");
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("materials")
      .insert(toActivityIdeasInsert(result))
      .select("id")
      .single();
    setSaving(false);
    setMessage(error ? error.message : "Saved to library");
  }

  return (
    <AppShell
      title="Activity Ideas"
      description="Generate quick, level-appropriate activity ideas — with classroom setup and printable suggestions — for your theme and focus."
      userEmail={userEmail}
      headerAction={<SignOutButton />}
    >
      <div className="space-y-5">
        <Surface className="animate-fade-up">
          <SectionTitle
            eyebrow="Activity Request"
            title="What do you need ideas for?"
            description="Describe what you're planning, set the theme, focus, and student level, then generate a pack of ready-to-try ideas."
          />

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">
              Describe what you need
            </span>
            <div className="field-shell rounded-[24px] px-4 py-3">
              <textarea
                rows={5}
                value={form.query}
                onChange={(event) => updateField("query", event.target.value)}
                className="w-full resize-none border-0 bg-transparent text-ink outline-none"
              />
            </div>
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Theme">
              <input
                value={form.theme}
                onChange={(event) => updateField("theme", event.target.value)}
                className="w-full border-0 bg-transparent text-ink outline-none"
              />
            </Field>
            <Field label="Age Group">
              <input
                value={form.ageGroup}
                onChange={(event) => updateField("ageGroup", event.target.value)}
                className="w-full border-0 bg-transparent text-ink outline-none"
              />
            </Field>
            <Field label="Focus">
              <input
                value={form.focus}
                onChange={(event) => updateField("focus", event.target.value)}
                className="w-full border-0 bg-transparent text-ink outline-none"
              />
            </Field>
            <Field label="Student Level">
              <select
                value={form.studentLevel}
                onChange={(event) => updateField("studentLevel", event.target.value)}
                className="w-full border-0 bg-transparent text-ink outline-none"
              >
                {studentLevelOptions.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </Field>
            <Field label="Constraints">
              <input
                value={form.constraints}
                onChange={(event) => updateField("constraints", event.target.value)}
                className="w-full border-0 bg-transparent text-ink outline-none"
              />
            </Field>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              className="rounded-full bg-sage px-5 py-3 text-sm font-bold text-white"
            >
              Generate Ideas
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(defaultForm);
                clearDraftIdeasForm();
              }}
              className="rounded-full bg-white px-5 py-3 text-sm font-bold text-ink"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={!result || saving}
              className="rounded-full bg-white px-5 py-3 text-sm font-bold text-ink disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save to Library"}
            </button>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-sage">
              Try one of these
            </p>
            <div className="flex flex-wrap gap-2">
              {activityIdeaPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => updateField("query", prompt)}
                  title={prompt}
                  className="max-w-full rounded-full bg-cream px-3 py-2 text-left text-xs font-semibold text-ink/75 transition hover:bg-mint/50"
                >
                  {prompt.length > 52 ? `${prompt.slice(0, 52)}…` : prompt}
                </button>
              ))}
            </div>
          </div>

          {message ? <p className="mt-3 text-sm font-semibold text-sage">{message}</p> : null}
        </Surface>

        <Surface className="animate-fade-up stagger-1">
          <SectionTitle
            eyebrow="Ideas Result"
            title={result?.title || "No ideas generated yet"}
            description={
              result?.summary ||
              "Generate a search result pack to see activity ideas, printable suggestions, and setup ideas."
            }
          />

          {result ? (
            <div className="space-y-4">
              <div className="rounded-[24px] bg-mint/30 px-4 py-3 text-sm font-semibold text-ink/75">
                Student Level: {result.form.studentLevel}
              </div>
              {result.activityIdeas.map((idea, index) => (
                <div
                  key={`${idea.title}-${index}`}
                  className="rounded-[26px] bg-gradient-to-r from-white to-cream p-4"
                >
                  <h3 className="font-display text-2xl font-bold text-ink">{idea.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-sage">{idea.type}</p>
                  <p className="mt-3 text-sm leading-7 text-ink/78">{idea.description}</p>
                  <p className="mt-2 text-sm leading-7 text-ink/76">
                    <span className="font-semibold text-ink">Setup:</span>{" "}
                    {idea.classroomSetup}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-ink/76">
                    <span className="font-semibold text-ink">Printable:</span>{" "}
                    {idea.printableMaterialSuggestion}
                  </p>
                </div>
              ))}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[26px] bg-mint/25 p-4">
                  <h3 className="font-display text-xl font-bold text-ink">
                    Classroom setup ideas
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {result.classroomSetupIdeas.map((item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="flex gap-2 text-sm leading-7 text-ink/78"
                      >
                        <span className="text-sage">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[26px] bg-blush/30 p-4">
                  <h3 className="font-display text-xl font-bold text-ink">
                    Printable suggestions
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {result.printableSuggestions.map((item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="flex gap-2 text-sm leading-7 text-ink/78"
                      >
                        <span className="text-sage">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </Surface>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <div className="field-shell rounded-2xl px-4 py-3">{children}</div>
    </label>
  );
}
