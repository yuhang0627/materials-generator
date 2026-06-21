"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { AppShell } from "@/components/app-shell";
import { SectionTitle, Surface } from "@/components/ui";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/client";
import {
  clearDraftThemePlanForm,
  generateThemePlan,
  getCurrentThemePlan,
  getDraftThemePlanForm,
  saveCurrentThemePlan,
  saveDraftThemePlanForm,
  toThemePlanInsert,
  type GeneratedThemePlan,
  type ThemePlannerFormValues
} from "@/lib/theme-planner";
import { studentLevelOptions } from "@/lib/resource-options";

const defaultForm: ThemePlannerFormValues = {
  theme: "Malaysia National Day",
  ageGroup: "2-5",
  studentLevel: "Level 1.5",
  duration: "4 Weeks",
  mainLearningGoals: "Cohesive Play\nTurn Taking\nJoint Attention\nCommunication",
  classroomSize: "Small group",
  additionalNotes: "Use simple language, visual supports, and short transitions."
};

export function ThemePlannerClient({ userEmail }: { userEmail: string }) {
  const [form, setForm] = useState<ThemePlannerFormValues>(defaultForm);
  const [plan, setPlan] = useState<GeneratedThemePlan | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<"" | "pdf">("");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const draft = getDraftThemePlanForm();
    const current = getCurrentThemePlan();
    if (draft) setForm({ ...defaultForm, ...draft });
    if (current) setPlan(current);
  }, []);

  function updateField<K extends keyof ThemePlannerFormValues>(
    key: K,
    value: ThemePlannerFormValues[K]
  ) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      saveDraftThemePlanForm(next);
      return next;
    });
  }

  function handleGenerate() {
    const next = generateThemePlan(form);
    saveCurrentThemePlan(next);
    setPlan(next);
    setMessage("Theme plan generated");
  }

  function handleDuplicate() {
    if (!plan) return;
    saveDraftThemePlanForm(plan.form);
    saveCurrentThemePlan(plan);
    setForm(plan.form);
    setMessage("Theme plan duplicated into the planner");
  }

  async function handleSave() {
    if (!plan) return;
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("materials")
      .insert(toThemePlanInsert(plan))
      .select("id")
      .single();
    setSaving(false);
    setMessage(error ? error.message : "Theme plan saved");
  }

  function handleReset() {
    setForm(defaultForm);
    setPlan(null);
    clearDraftThemePlanForm();
    setMessage("Planner reset");
  }

  function createExportNode(source: HTMLDivElement) {
    const exportNode = source.cloneNode(true) as HTMLDivElement;
    exportNode.style.width = "794px";
    exportNode.style.minWidth = "794px";
    exportNode.style.maxWidth = "794px";
    exportNode.style.margin = "0";
    exportNode.style.position = "fixed";
    exportNode.style.left = "-10000px";
    exportNode.style.top = "0";
    document.body.appendChild(exportNode);
    return exportNode;
  }

  async function handleExportPdf() {
    if (!previewRef.current) return;
    let exportNode: HTMLDivElement | null = null;

    try {
      setExporting("pdf");
      exportNode = createExportNode(previewRef.current);
      const canvas = await html2canvas(exportNode, {
        scale: 2,
        backgroundColor: "#fffaf6",
        useCORS: true,
        width: 794,
        height: exportNode.scrollHeight,
        windowWidth: 794,
        windowHeight: exportNode.scrollHeight
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: false
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const imageWidth = pageWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        position,
        imageWidth,
        imageHeight,
        undefined,
        "SLOW"
      );
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          position,
          imageWidth,
          imageHeight,
          undefined,
          "SLOW"
        );
        heightLeft -= pageHeight;
      }

      pdf.save(`${slugify(plan?.title || "theme-plan")}.pdf`);
      setMessage("Theme plan PDF exported");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to export PDF");
    } finally {
      exportNode?.remove();
      setExporting("");
    }
  }

  return (
    <AppShell
      title="Theme Planner"
      description="Plan a full weekly or monthly teaching roadmap instead of building one worksheet at a time."
      userEmail={userEmail}
      headerAction={<SignOutButton />}
    >
      <div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
        <Surface className="animate-fade-up">
          <SectionTitle
            eyebrow="Planner Inputs"
            title="Build a theme roadmap"
            description="Generate a whole teaching sequence with weekly goals, classroom setup, printable suggestions, and family communication focus."
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
            <Field label="Duration">
              <select
                value={form.duration}
                onChange={(event) =>
                  updateField(
                    "duration",
                    event.target.value as ThemePlannerFormValues["duration"]
                  )
                }
                className="w-full border-0 bg-transparent text-ink outline-none"
              >
                {["1 Week", "2 Weeks", "4 Weeks"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
            <Field label="Classroom Size">
              <input
                value={form.classroomSize}
                onChange={(event) => updateField("classroomSize", event.target.value)}
                className="w-full border-0 bg-transparent text-ink outline-none"
              />
            </Field>
            <div className="sm:col-span-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">
                  Main Learning Goals
                </span>
                <div className="field-shell rounded-[24px] px-4 py-3">
                  <textarea
                    rows={4}
                    value={form.mainLearningGoals}
                    onChange={(event) =>
                      updateField("mainLearningGoals", event.target.value)
                    }
                    className="w-full resize-none border-0 bg-transparent text-ink outline-none"
                  />
                </div>
              </label>
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
              Generate Theme Plan
            </button>
            <button
              type="button"
              onClick={handleReset}
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
              {saving ? "Saving..." : "Save Theme Plan"}
            </button>
            <button
              type="button"
              onClick={() => void handleExportPdf()}
              disabled={!plan || exporting !== ""}
              className="rounded-full bg-white px-5 py-3 text-sm font-bold text-ink disabled:opacity-60"
            >
              {exporting === "pdf" ? "Exporting..." : "Export PDF"}
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              disabled={!plan}
              className="rounded-full bg-white px-5 py-3 text-sm font-bold text-ink disabled:opacity-60"
            >
              Duplicate Theme Plan
            </button>
          </div>

          {message ? <p className="mt-3 text-sm font-semibold text-sage">{message}</p> : null}
        </Surface>

        <Surface className="animate-fade-up stagger-1">
          <SectionTitle
            eyebrow="Theme Roadmap"
            title={plan?.title || "No theme plan generated yet"}
            description={
              plan?.summary ||
              "Generate a weekly roadmap to preview weekly goals, printables, preparation, and classroom setup."
            }
          />

          {plan ? (
            <div className="overflow-auto rounded-[30px] bg-gradient-to-b from-blush/35 via-cream to-mint/30 p-4 sm:p-5">
              <div ref={previewRef} className="mx-auto min-w-[794px] max-w-[794px] rounded-[32px] border border-[#e8ddd3] bg-[#fffaf6] p-6">
                <div className="rounded-[28px] bg-gradient-to-r from-mint/35 via-cream to-blush/35 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage">
                    Theme Planner
                  </p>
                  <h2 className="mt-3 font-display text-4xl font-bold text-ink">
                    {plan.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-ink/75">{plan.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.12em] text-sage">
                    <span className="rounded-full bg-white/80 px-3 py-2">
                      {plan.form.studentLevel}
                    </span>
                    <span className="rounded-full bg-white/80 px-3 py-2">
                      {plan.form.ageGroup}
                    </span>
                    <span className="rounded-full bg-white/80 px-3 py-2">
                      {plan.form.duration}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-4">
                  {plan.weeklyPlan.map((week) => (
                    <div
                      key={week.weekLabel}
                      className="rounded-[28px] bg-gradient-to-r from-white to-cream p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
                            {week.weekLabel}
                          </p>
                          <h3 className="mt-2 font-display text-3xl font-bold text-ink">
                            {week.focusTitle}
                          </h3>
                        </div>
                        <span className="rounded-full bg-mint/45 px-4 py-2 text-sm font-bold text-ink">
                          {plan.form.duration}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <Block title="Learning Goals" items={week.learningGoals} />
                        <Block title="Vocabulary Focus" items={week.vocabularyFocus} />
                        <Block title="Suggested Materials" items={week.suggestedMaterials} />
                        <Block
                          title="Printable Resources"
                          items={week.suggestedPrintableResources}
                        />
                        <Block
                          title="Preparation Checklist"
                          items={week.teacherPreparationChecklist}
                        />
                        <Block title="Teacher Tips" items={week.teacherTips} />
                        <Block title="Sensory Activities" items={week.sensoryActivities} />
                        <Block title="Small Group Activities" items={week.smallGroupActivities} />
                        <Block
                          title="Visual Supports Needed"
                          items={week.visualSupportsNeeded}
                        />
                        <Block
                          title="Cooperative Play Activities"
                          items={week.cooperativePlayActivities}
                        />
                        <Block title="Flashcard Ideas" items={week.flashcardIdeas} />
                        <Block title="Social Story Ideas" items={week.socialStoryIdeas} />
                        <Block title="Review Activities" items={week.reviewActivities} />
                        <Block title="Assessment Activities" items={week.assessmentActivities} />
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <Detail title="Circle Time Activity" text={week.circleTimeActivity} />
                        <Detail title="Teaching Plan" text={week.teachingPlan} />
                        <Detail
                          title="Parent Communication Focus"
                          text={week.parentCommunicationFocus}
                        />
                        <Detail title="Classroom Setup" text={week.classroomSetup} />
                        <Detail
                          title="Behaviour Support Focus"
                          text={week.behaviourSupportFocus}
                        />
                        <Detail
                          title="Parent Communication Summary"
                          text={week.parentCommunicationSummary}
                        />
                        <Detail
                          title="Celebration Activity"
                          text={week.celebrationActivity}
                        />
                      </div>
                    </div>
                  ))}
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
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <div className="field-shell rounded-2xl px-4 py-3">{children}</div>
    </label>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[22px] bg-white/84 p-4">
      <p className="font-display text-xl font-bold text-ink">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <p key={item} className="text-sm leading-7 text-ink/76">
            • {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function Detail({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[22px] bg-white/84 p-4">
      <p className="font-display text-xl font-bold text-ink">{title}</p>
      <p className="mt-3 text-sm leading-7 text-ink/76">{text}</p>
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
