"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { SectionTitle, Surface } from "@/components/ui";
import { SignOutButton } from "@/components/sign-out-button";
import {
  clearDraftPlanForm,
  generateTeachingPlan,
  getCurrentPlan,
  getDraftPlanForm,
  saveCurrentPlan,
  saveDraftPlanForm,
  toTeachingPlanInsert,
  type GeneratedTeachingPlan,
  type TeachingPlanFormValues
} from "@/lib/teaching-plan";
import { createClient } from "@/lib/supabase/client";
import { studentLevelOptions, teachingPlanGoalOptions } from "@/lib/resource-options";

const defaultForm: TeachingPlanFormValues = {
  theme: "Malaysia National Day",
  ageGroup: "2-5",
  studentLevel: "Level 1.5",
  studentAbility: "Mixed early support needs",
  goal: "Cohesive Play",
  duration: "30 minutes",
  groupSize: "Small group",
  materialsAvailable: "small flags, blocks, music speaker, stickers",
  additionalNotes: "Use short phrases and lots of modelling."
};

export function CreatePlanClient({ userEmail }: { userEmail: string }) {
  const [form, setForm] = useState<TeachingPlanFormValues>(defaultForm);
  const [plan, setPlan] = useState<GeneratedTeachingPlan | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const draft = getDraftPlanForm();
    const current = getCurrentPlan();
    if (draft) setForm({ ...defaultForm, ...draft });
    if (current) setPlan(current);
  }, []);

  function updateField<K extends keyof TeachingPlanFormValues>(
    key: K,
    value: TeachingPlanFormValues[K]
  ) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      saveDraftPlanForm(next);
      return next;
    });
  }

  function handleGenerate() {
    const nextPlan = generateTeachingPlan(form);
    saveCurrentPlan(nextPlan);
    setPlan(nextPlan);
    setMessage("Teaching plan generated");
  }

  async function handleSave() {
    if (!plan) return;
    setSaving(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase
      .from("materials")
      .insert(toTeachingPlanInsert(plan))
      .select("id")
      .single();

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Teaching plan saved to library");
  }

  return (
    <AppShell
      title="Teaching Plan Generator"
      description="Build activity plans for Early Intervention Program teaching with clear scripts, support ideas, and printable-ready structure."
      userEmail={userEmail}
      headerAction={<SignOutButton />}
    >
      <div className="space-y-5">
        <Surface className="animate-fade-up">
          <SectionTitle
            eyebrow="Plan Builder"
            title="Create a teaching plan"
            description="Generate grouped activities with teacher scripts, expected responses, adaptations, and support strategies."
          />

          <div className="grid gap-4 sm:grid-cols-2">
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
            <Field label="Student Ability">
              <input
                value={form.studentAbility}
                onChange={(event) =>
                  updateField("studentAbility", event.target.value)
                }
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
            <Field label="Goal">
              <select
                value={form.goal}
                onChange={(event) => updateField("goal", event.target.value)}
                className="w-full border-0 bg-transparent text-ink outline-none"
              >
                {teachingPlanGoalOptions.map((goal) => (
                  <option key={goal}>{goal}</option>
                ))}
              </select>
            </Field>
            <Field label="Duration">
              <input
                value={form.duration}
                onChange={(event) => updateField("duration", event.target.value)}
                className="w-full border-0 bg-transparent text-ink outline-none"
              />
            </Field>
            <Field label="Group Size">
              <input
                value={form.groupSize}
                onChange={(event) => updateField("groupSize", event.target.value)}
                className="w-full border-0 bg-transparent text-ink outline-none"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Materials Available">
                <input
                  value={form.materialsAvailable}
                  onChange={(event) =>
                    updateField("materialsAvailable", event.target.value)
                  }
                  className="w-full border-0 bg-transparent text-ink outline-none"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">
                  Additional Notes
                </span>
                <div className="field-shell rounded-[24px] px-4 py-3">
                  <textarea
                    rows={4}
                    value={form.additionalNotes}
                    onChange={(event) =>
                      updateField("additionalNotes", event.target.value)
                    }
                    className="w-full resize-none border-0 bg-transparent text-ink outline-none"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              className="rounded-full bg-sage px-5 py-3 text-sm font-bold text-white"
            >
              Generate Plan
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(defaultForm);
                clearDraftPlanForm();
              }}
              className="rounded-full bg-white px-5 py-3 text-sm font-bold text-ink"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={!plan || saving}
              className="rounded-full bg-white px-5 py-3 text-sm font-bold text-ink disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save to Library"}
            </button>
          </div>

          {message ? <p className="mt-3 text-sm font-semibold text-sage">{message}</p> : null}
        </Surface>

        <Surface className="animate-fade-up stagger-1">
          <SectionTitle
            eyebrow="Plan Preview"
            title={plan?.title || "No plan generated yet"}
            description={
              plan?.summary ||
              "Generate a plan to preview activities, teacher scripts, and adaptations."
            }
          />

          {plan ? (
            <div className="space-y-4">
              <div className="rounded-[24px] bg-mint/30 px-4 py-3 text-sm font-semibold text-ink/75">
                Student Level: {plan.form.studentLevel}
              </div>
              {plan.activities.map((activity, index) => (
                <div
                  key={`${activity.title}-${index}`}
                  className="rounded-[26px] bg-gradient-to-br from-white to-cream p-4"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
                    Activity {index + 1}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold text-ink">
                    {activity.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-ink/78">
                    Objective: {activity.objective}
                  </p>
                  <p className="text-sm leading-7 text-ink/78">
                    Materials: {activity.materials.join(", ")}
                  </p>
                  <p className="text-sm leading-7 text-ink/78">
                    Duration: {activity.duration}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-ink/78">
                    Setup: {activity.setup}
                  </p>
                  <p className="mt-3 rounded-[18px] bg-mint/25 px-4 py-3 text-sm font-semibold text-ink/75">
                    Teacher Script: {activity.teacherScript}
                  </p>
                </div>
              ))}
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
