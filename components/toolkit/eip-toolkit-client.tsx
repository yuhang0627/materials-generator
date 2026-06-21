"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { AppShell } from "@/components/app-shell";
import { MaterialPreview } from "@/components/materials/material-preview";
import { SignOutButton } from "@/components/sign-out-button";
import { InfoPill, SectionTitle, Surface } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { studentLevelOptions } from "@/lib/resource-options";
import {
  clearDraftToolkitForm,
  generateToolkitResource,
  getCurrentToolkitResource,
  getDraftToolkitForm,
  saveCurrentToolkitResource,
  saveDraftToolkitForm,
  socialStoryExamples,
  toolkitResourceOptions,
  toToolkitInsert,
  type EipToolkitFormValues,
  type GeneratedToolkitResource
} from "@/lib/eip-toolkit";

const defaultForm: EipToolkitFormValues = {
  resourceType: "Social Story",
  scenario: "Waiting Turn",
  theme: "Waiting Turn",
  ageGroup: "2-5",
  studentLevel: "Level 1.5",
  additionalNotes: "Keep the design calm, visual, and easy to repeat across the week."
};

export function EipToolkitClient({ userEmail }: { userEmail: string }) {
  const [form, setForm] = useState<EipToolkitFormValues>(defaultForm);
  const [resource, setResource] = useState<GeneratedToolkitResource | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const draft = getDraftToolkitForm();
    const current = getCurrentToolkitResource();
    if (draft) setForm({ ...defaultForm, ...draft });
    if (current) setResource(current);
  }, []);

  function updateField<K extends keyof EipToolkitFormValues>(
    key: K,
    value: EipToolkitFormValues[K]
  ) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      saveDraftToolkitForm(next);
      return next;
    });
  }

  function handleResourceTypeChange(value: EipToolkitFormValues["resourceType"]) {
    const next = {
      ...form,
      resourceType: value,
      scenario: value === "Social Story" ? socialStoryExamples[0] : value,
      theme: value === "Social Story" ? socialStoryExamples[0] : value
    };
    setForm(next);
    saveDraftToolkitForm(next);
  }

  function handleGenerate() {
    const next = generateToolkitResource(form);
    saveCurrentToolkitResource(next);
    setResource(next);
    setMessage("Toolkit resource generated");
  }

  function handleReset() {
    setForm(defaultForm);
    setResource(null);
    clearDraftToolkitForm();
    setMessage("Toolkit form reset");
  }

  function handleExampleSelect(example: string) {
    const next = { ...form, scenario: example, theme: example };
    setForm(next);
    saveDraftToolkitForm(next);
  }

  async function handleSave() {
    if (!resource) return;
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("materials")
      .insert(toToolkitInsert(resource))
      .select("id")
      .single();
    setSaving(false);
    setMessage(error ? error.message : "Toolkit resource saved to library");
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
      setExporting(true);
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
      const imageData = canvas.toDataURL("image/png");

      pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight, undefined, "SLOW");
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;
        pdf.addPage();
        pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight, undefined, "SLOW");
        heightLeft -= pageHeight;
      }

      pdf.save(slugify(resource?.title || "eip-toolkit") + ".pdf");
      setMessage("Toolkit PDF exported");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to export toolkit PDF");
    } finally {
      exportNode?.remove();
      setExporting(false);
    }
  }

  return (
    <AppShell
      title="EIP Toolkit"
      description="Generate high-use classroom supports like social stories, token boards, visual schedules, and emotion tools with a soft printable design."
      userEmail={userEmail}
      headerAction={<SignOutButton />}
    >
      <div className="space-y-5">
        <Surface className="animate-fade-up">
          <SectionTitle
            eyebrow="Toolkit Builder"
            title="Create a reusable classroom support"
            description="Generate one focused EIP classroom resource with printable layout, teacher notes, visual placeholders, and export tools."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Resource Type">
              <select
                value={form.resourceType}
                onChange={(event) =>
                  handleResourceTypeChange(
                    event.target.value as EipToolkitFormValues["resourceType"]
                  )
                }
                className="w-full border-0 bg-transparent text-ink outline-none"
              >
                {toolkitResourceOptions.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </Field>
            <Field label="Theme / Focus">
              <input
                value={form.theme}
                onChange={(event) => updateField("theme", event.target.value)}
                className="w-full border-0 bg-transparent text-ink outline-none"
              />
            </Field>
            <Field label="Scenario / Target">
              <input
                value={form.scenario}
                onChange={(event) => updateField("scenario", event.target.value)}
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

          {form.resourceType === "Social Story" ? (
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-ink">Social Story Examples</p>
              <div className="flex flex-wrap gap-2">
                {socialStoryExamples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => handleExampleSelect(example)}
                    className="rounded-full bg-cream px-3 py-2 text-xs font-semibold text-ink/75"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton onClick={handleGenerate}>Generate Resource</ActionButton>
            <ActionButton onClick={handleReset} subtle>
              Reset
            </ActionButton>
            <ActionButton onClick={() => void handleExportPdf()} subtle disabled={!resource || exporting}>
              {exporting ? "Exporting..." : "Export PDF"}
            </ActionButton>
            <ActionButton onClick={() => void handleSave()} subtle disabled={!resource || saving}>
              {saving ? "Saving..." : "Save to Library"}
            </ActionButton>
          </div>

          {message ? <p className="mt-3 text-sm font-semibold text-sage">{message}</p> : null}
        </Surface>

        <div className="space-y-5">
          <Surface className="animate-fade-up stagger-1">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <SectionTitle
                  eyebrow="Toolkit Preview"
                  title={resource?.title || "No toolkit resource generated yet"}
                  description={
                    resource?.summary ||
                    "Generate a toolkit resource to preview the printable layout and teacher notes."
                  }
                />
              </div>
              {resource ? <InfoPill>{resource.form.resourceType}</InfoPill> : null}
            </div>

            {resource ? (
              <div className="overflow-auto rounded-[30px] bg-gradient-to-b from-blush/35 via-cream to-mint/30 p-4 sm:p-5">
                <div className="min-w-[794px]">
                  <MaterialPreview ref={previewRef} material={resource.material} />
                </div>
              </div>
            ) : null}
          </Surface>

          {resource ? (
            <Surface className="animate-fade-up stagger-2">
              <SectionTitle
                eyebrow="Teacher Notes"
                title="Support details"
                description="Use these notes while teaching or when handing the resource to another teacher."
              />

              <div className="space-y-4 rounded-[30px] bg-gradient-to-b from-white to-cream p-5">
                <SummaryRow label="Resource Type" value={resource.form.resourceType} />
                <SummaryRow label="Scenario" value={resource.form.scenario} />
                <SummaryRow label="Student Level" value={resource.form.studentLevel} />
                <SummaryRow label="Theme" value={resource.form.theme} />

                <div className="rounded-[24px] bg-mint/20 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
                    Teacher Notes
                  </p>
                  <div className="mt-3 space-y-2 text-sm leading-7 text-ink/78">
                    {resource.material.teacherNotes.map((note) => (
                      <p key={note}>• {note}</p>
                    ))}
                  </div>
                </div>
              </div>
            </Surface>
          ) : null}
        </div>
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-bold text-ink">{label}:</span>
      <span className="text-ink/75">{value}</span>
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
