"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { AppShell } from "@/components/app-shell";
import { MaterialPreview } from "@/components/materials/material-preview";
import { SignOutButton } from "@/components/sign-out-button";
import { SectionTitle, Surface } from "@/components/ui";
import type { GeneratedMaterial } from "@/lib/material-generator";
import { createClient } from "@/lib/supabase/client";
import { studentLevelOptions } from "@/lib/resource-options";
import {
  clearDraftThemePackForm,
  generateThemePack,
  getCurrentThemePack,
  getDraftThemePackForm,
  saveCurrentThemePack,
  saveDraftThemePackForm,
  themePackOptions,
  toThemePackInsert,
  type GeneratedThemePack,
  type ThemePackFormValues
} from "@/lib/theme-packs";

const defaultForm: ThemePackFormValues = {
  packName: "National Day",
  theme: "Malaysia National Day",
  ageGroup: "2-5",
  studentLevel: "Level 1.5",
  additionalNotes: "Keep the bundle warm, visual, and easy to teach in short sessions."
};

export function ThemePacksClient({ userEmail }: { userEmail: string }) {
  const [form, setForm] = useState<ThemePackFormValues>(defaultForm);
  const [bundle, setBundle] = useState<GeneratedThemePack | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const draft = getDraftThemePackForm();
    const current = getCurrentThemePack();
    if (draft) setForm({ ...defaultForm, ...draft });
    if (current) setBundle(current);
  }, []);

  function updateField<K extends keyof ThemePackFormValues>(
    key: K,
    value: ThemePackFormValues[K]
  ) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      saveDraftThemePackForm(next);
      return next;
    });
  }

  function handlePackChange(name: string) {
    const selected = themePackOptions.find((item) => item.name === name) ?? themePackOptions[0];
    const next = { ...form, packName: selected.name, theme: selected.theme };
    setForm(next);
    saveDraftThemePackForm(next);
  }

  function handleGenerate() {
    const next = generateThemePack(form);
    saveCurrentThemePack(next);
    setBundle(next);
    setMessage("Theme pack generated");
  }

  function handleReset() {
    setForm(defaultForm);
    setBundle(null);
    clearDraftThemePackForm();
    setMessage("Theme pack form reset");
  }

  function handleDuplicate() {
    if (!bundle) return;
    const duplicated = {
      ...bundle,
      id: `PACK-${Date.now().toString().slice(-6)}`,
      title: `${bundle.title} Copy`,
      createdAt: new Intl.DateTimeFormat("en-MY", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date())
    };
    saveCurrentThemePack(duplicated);
    setBundle(duplicated);
    setMessage("Theme pack duplicated");
  }

  function handleEdit() {
    if (!bundle) return;
    setForm(bundle.form);
    saveDraftThemePackForm(bundle.form);
    setMessage("Bundle loaded into the editor");
  }

  async function handleSave() {
    if (!bundle) return;
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("materials")
      .insert(toThemePackInsert(bundle))
      .select("id")
      .single();
    setSaving(false);
    setMessage(error ? error.message : "Theme pack saved");
  }

  function createExportNode(source: HTMLDivElement) {
    const exportNode = source.cloneNode(true) as HTMLDivElement;
    exportNode.style.width = "820px";
    exportNode.style.minWidth = "820px";
    exportNode.style.maxWidth = "820px";
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
      setExporting(true);
      exportNode = createExportNode(previewRef.current);
      const canvas = await html2canvas(exportNode, {
        scale: 2,
        backgroundColor: "#fffaf6",
        useCORS: true,
        width: 820,
        height: exportNode.scrollHeight,
        windowWidth: 820,
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

      const imageData = canvas.toDataURL("image/png");
      pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight, undefined, "SLOW");
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;
        pdf.addPage();
        pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight, undefined, "SLOW");
        heightLeft -= pageHeight;
      }

      pdf.save(slugify(bundle?.title || "theme-pack-bundle") + ".pdf");
      setMessage("Bundle PDF exported");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to export bundle PDF");
    } finally {
      exportNode?.remove();
      setExporting(false);
    }
  }

  return (
    <AppShell
      title="Theme Packs"
      description="Generate a full teaching resource bundle in one click using your existing plan and material generators."
      userEmail={userEmail}
      headerAction={<SignOutButton />}
    >
      <div className="grid gap-5 xl:grid-cols-[0.86fr_1.14fr]">
        <Surface className="animate-fade-up">
          <SectionTitle
            eyebrow="Bundle Builder"
            title="Create a complete theme bundle"
            description="Each pack generates a teaching plan, worksheet, flashcards, classroom poster, social story, and parent communication note."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Theme Pack">
              <select
                value={form.packName}
                onChange={(event) => handlePackChange(event.target.value)}
                className="w-full border-0 bg-transparent text-ink outline-none"
              >
                {themePackOptions.map((pack) => (
                  <option key={pack.name}>{pack.name}</option>
                ))}
              </select>
            </Field>
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
            <div className="sm:col-span-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">
                  Additional Notes
                </span>
                <div className="field-shell rounded-[24px] px-4 py-3">
                  <textarea
                    rows={4}
                    value={form.additionalNotes}
                    onChange={(event) => updateField("additionalNotes", event.target.value)}
                    className="w-full resize-none border-0 bg-transparent text-ink outline-none"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton onClick={handleGenerate}>Generate Theme Pack</ActionButton>
            <ActionButton onClick={handleReset} subtle>
              Reset
            </ActionButton>
            <ActionButton onClick={() => void handleSave()} subtle disabled={!bundle || saving}>
              {saving ? "Saving..." : "Save Bundle"}
            </ActionButton>
            <ActionButton
              onClick={() => void handleExportPdf()}
              subtle
              disabled={!bundle || exporting}
            >
              {exporting ? "Exporting..." : "Export Bundle PDF"}
            </ActionButton>
            <ActionButton onClick={handleDuplicate} subtle disabled={!bundle}>
              Duplicate Bundle
            </ActionButton>
            <ActionButton onClick={handleEdit} subtle disabled={!bundle}>
              Edit Bundle
            </ActionButton>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {themePackOptions.map((pack) => (
              <button
                key={pack.name}
                type="button"
                onClick={() => handlePackChange(pack.name)}
                className="rounded-full bg-cream px-3 py-2 text-xs font-semibold text-ink/75"
              >
                {pack.name}
              </button>
            ))}
          </div>

          {message ? <p className="mt-3 text-sm font-semibold text-sage">{message}</p> : null}
        </Surface>

        <Surface className="animate-fade-up stagger-1">
          <SectionTitle
            eyebrow="Bundle View"
            title={bundle?.title || "No bundle generated yet"}
            description={
              bundle?.summary ||
              "Generate a bundle to see the full teaching resource set in one place."
            }
          />

          {bundle ? (
            <div className="overflow-auto rounded-[30px] bg-gradient-to-b from-blush/35 via-cream to-mint/30 p-4 sm:p-5">
              <div ref={previewRef} className="mx-auto min-w-[820px] max-w-[820px] space-y-6">
                <BundleHero bundle={bundle} />
                <TeachingPlanPreview plan={bundle.teachingPlan} />
                <BundleMaterial title="Worksheet" material={bundle.worksheet} />
                <BundleMaterial title="Flashcards" material={bundle.flashcards} />
                <BundleMaterial title="Classroom Poster" material={bundle.classroomPoster} />
                <BundleMaterial title="Social Story" material={bundle.socialStory} />
                <ParentNotePreview note={bundle.parentCommunicationNote} />
              </div>
            </div>
          ) : null}
        </Surface>
      </div>
    </AppShell>
  );
}

function BundleHero({ bundle }: { bundle: GeneratedThemePack }) {
  return (
    <div className="rounded-[32px] border border-[#e8ddd3] bg-[#fffaf6] p-6">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage">Theme Pack</p>
      <h2 className="mt-3 font-display text-4xl font-bold text-ink">{bundle.title}</h2>
      <p className="mt-3 text-sm leading-7 text-ink/72">{bundle.summary}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {[
          ["Theme", bundle.form.theme],
          ["Pack", bundle.form.packName],
          ["Age Group", bundle.form.ageGroup],
          ["Student Level", bundle.form.studentLevel]
        ].map(([label, value]) => (
          <div key={label} className="rounded-full bg-mint/30 px-4 py-2 text-xs font-bold text-ink/75">
            {label}: {value}
          </div>
        ))}
      </div>
    </div>
  );
}

function TeachingPlanPreview({ plan }: { plan: GeneratedThemePack["teachingPlan"] }) {
  return (
    <div className="rounded-[32px] border border-[#e8ddd3] bg-[#fffaf6] p-6">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage">1. Teaching Plan</p>
      <h3 className="mt-3 font-display text-3xl font-bold text-ink">{plan.title}</h3>
      <p className="mt-3 text-sm leading-7 text-ink/72">{plan.summary}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {plan.activities.map((activity, index) => (
          <div key={`${activity.title}-${index}`} className="rounded-[24px] bg-gradient-to-br from-white to-cream p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
              Activity {index + 1}
            </p>
            <h4 className="mt-2 font-display text-2xl font-bold text-ink">{activity.title}</h4>
            <p className="mt-2 text-sm leading-7 text-ink/78">Objective: {activity.objective}</p>
            <p className="text-sm leading-7 text-ink/78">Duration: {activity.duration}</p>
            <p className="mt-2 text-sm leading-7 text-ink/78">Setup: {activity.setup}</p>
            <p className="mt-3 rounded-[18px] bg-mint/25 px-4 py-3 text-sm font-semibold text-ink/75">
              Teacher Script: {activity.teacherScript}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BundleMaterial({
  title,
  material
}: {
  title: string;
  material: GeneratedMaterial;
}) {
  return (
    <div className="space-y-3">
      <p className="pl-1 text-xs font-bold uppercase tracking-[0.24em] text-sage">{title}</p>
      <MaterialPreview material={material} />
    </div>
  );
}

function ParentNotePreview({ note }: { note: string }) {
  return (
    <div className="rounded-[32px] border border-[#e8ddd3] bg-[#fffaf6] p-6">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage">
        6. Parent Communication Note
      </p>
      <h3 className="mt-3 font-display text-3xl font-bold text-ink">
        Home Connection Message
      </h3>
      <p className="mt-4 rounded-[24px] bg-gradient-to-r from-blush/35 to-cream px-5 py-5 text-base leading-8 text-ink/78">
        {note}
      </p>
    </div>
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

function ActionButton({
  children,
  onClick,
  subtle,
  disabled
}: {
  children: ReactNode;
  onClick: () => void;
  subtle?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-5 py-3 text-sm font-bold disabled:opacity-60 ${
        subtle ? "bg-white text-ink" : "bg-sage text-white"
      }`}
    >
      {children}
    </button>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
