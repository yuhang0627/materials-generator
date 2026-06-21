"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { AppShell } from "@/components/app-shell";
import { InfoPill, SectionTitle, Surface } from "@/components/ui";
import { SignOutButton } from "@/components/sign-out-button";
import { MaterialPreview } from "@/components/materials/material-preview";
import {
  copyText,
  getCurrentMaterial,
  toMaterialInsert,
  type GeneratedMaterial
} from "@/lib/material-generator";
import { createClient } from "@/lib/supabase/client";

export function GeneratedResultClient({ userEmail }: { userEmail: string }) {
  const [material, setMaterial] = useState<GeneratedMaterial | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<"" | "png" | "pdf" | "print">("");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMaterial(getCurrentMaterial());
  }, []);

  async function handleCopy(label: string, text: string) {
    await copyText(text);
    setMessage(`${label} copied`);
  }

  async function handleSave() {
    if (!material) {
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase
      .from("materials")
      .insert(toMaterialInsert(material));

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage("Saved to Supabase history");
    setSaving(false);
  }

  async function createCanvas() {
    if (!previewRef.current) {
      throw new Error("Preview is not ready yet.");
    }

    return html2canvas(previewRef.current, {
      scale: 2,
      backgroundColor: "#fffaf6",
      useCORS: true
    });
  }

  async function handleDownloadPng() {
    try {
      setExporting("png");
      const canvas = await createCanvas();
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${slugify(material?.title || "material-preview")}.png`;
      link.click();
      setMessage("PNG downloaded");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to export PNG");
    } finally {
      setExporting("");
    }
  }

  async function handleDownloadPdf() {
    try {
      setExporting("pdf");
      const canvas = await createCanvas();
      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      const pageWidth = 210;
      const pageHeight = 297;
      pdf.addImage(imageData, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save(`${slugify(material?.title || "material-preview")}.pdf`);
      setMessage("PDF downloaded");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to export PDF");
    } finally {
      setExporting("");
    }
  }

  async function handlePrint() {
    if (!previewRef.current) {
      return;
    }

    try {
      setExporting("print");
      const printWindow = window.open("", "_blank", "width=900,height=1200");

      if (!printWindow) {
        throw new Error("Unable to open print window.");
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>${material?.title || "Material Preview"}</title>
            <style>
              body { margin: 0; padding: 20px; background: #f8f0ea; font-family: "Avenir Next", "Trebuchet MS", sans-serif; }
              @page { size: A4; margin: 12mm; }
            </style>
          </head>
          <body>${previewRef.current.outerHTML}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      setMessage("Print dialog opened");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to print preview");
    } finally {
      setExporting("");
    }
  }

  if (!material) {
    return (
      <AppShell
        title="Generated Result"
        description="Generate a material first, then the latest preview will appear here."
        userEmail={userEmail}
        headerAction={<SignOutButton />}
      >
        <Surface>
          <SectionTitle
            eyebrow="No Result Yet"
            title="Nothing has been generated yet"
            description="Open the create page, fill in the prompt, and click Generate to build a local sample result."
          />
          <Link href="/materials/create" className="text-sm font-bold text-sage">
            Go to Create Material
          </Link>
        </Surface>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Generated Result"
      description="Review the structured text output and a printable Canva-style material preview, then export or save the result to Supabase."
      userEmail={userEmail}
      headerAction={<SignOutButton />}
    >
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <Surface className="animate-fade-up">
            <SectionTitle
              eyebrow="Prompt Summary"
              title="Source settings"
              description="These values were used to create the current teaching material."
            />

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Theme", material.form.theme],
                ["Subject", material.form.subject],
                ["Skill focus", material.form.skillFocus],
                ["Student level", material.form.studentLevel],
                ["Output type", material.form.outputType],
                ["Language", material.form.language],
                ["Number of items", material.form.numberOfItems],
                ["Difficulty", material.form.difficulty]
              ].map(([label, value]) => (
                <div key={label} className="rounded-[22px] bg-white/80 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>
          </Surface>

          <Surface className="animate-fade-up stagger-1">
            <SectionTitle
              eyebrow="Actions"
              title="Export and save"
              description="Download the preview, print it, copy the Canva prompt, or save the whole result and visual layout into Supabase."
            />

            <div className="flex flex-wrap gap-3">
              <ActionButton
                onClick={() => void handleDownloadPdf()}
                disabled={exporting !== ""}
              >
                {exporting === "pdf" ? "Preparing PDF..." : "Download as PDF"}
              </ActionButton>
              <ActionButton
                onClick={() => void handleDownloadPng()}
                disabled={exporting !== ""}
              >
                {exporting === "png" ? "Preparing PNG..." : "Download as PNG"}
              </ActionButton>
              <ActionButton
                onClick={() => void handlePrint()}
                disabled={exporting !== ""}
              >
                {exporting === "print" ? "Opening..." : "Print"}
              </ActionButton>
              <ActionButton
                onClick={() => handleCopy("Canva prompt", material.canvaPrompt)}
              >
                Copy Canva Prompt
              </ActionButton>
              <ActionButton onClick={() => void handleSave()} disabled={saving}>
                {saving ? "Saving..." : "Save to History"}
              </ActionButton>
            </div>

            {message ? (
              <p className="mt-3 text-sm font-semibold text-sage">{message}</p>
            ) : null}
          </Surface>

          <Surface className="animate-fade-up stagger-2">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <SectionTitle
                  eyebrow="Text Output"
                  title={material.title}
                  description={material.summary}
                />
              </div>
              <InfoPill>Structured Content</InfoPill>
            </div>

            <div className="space-y-4 rounded-[30px] bg-gradient-to-b from-white to-cream p-5">
              <TextPanel title="Word List">
                <p>{material.wordList.join(", ")}</p>
              </TextPanel>

              <TextPanel title="Simple Sentences">
                {material.sentences.map((sentence) => (
                  <p key={sentence}>{sentence}</p>
                ))}
              </TextPanel>

              <TextPanel title="Worksheet Activity">
                {material.worksheetActivity.map((question, index) => (
                  <p key={question}>
                    {index + 1}. {question}
                  </p>
                ))}
              </TextPanel>

              <TextPanel title="Visual Card Content">
                {material.visualCardText.map((card) => (
                  <p key={card} className="whitespace-pre-line">
                    {card}
                  </p>
                ))}
              </TextPanel>

              <TextPanel title="Canva Prompt">
                <p>{material.canvaPrompt}</p>
              </TextPanel>

              <TextPanel title="Teacher Notes">
                {material.teacherNotes.map((note) => (
                  <p key={note}>• {note}</p>
                ))}
              </TextPanel>

              <TextPanel title="Suggested Difficulty Adjustment">
                <p>{material.suggestedDifficultyAdjustment}</p>
              </TextPanel>
            </div>
          </Surface>
        </div>

        <Surface className="animate-fade-up stagger-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <SectionTitle
                eyebrow="Material Preview"
                title="Canva-style printable layout"
                description="A soft A4 teaching material preview generated from the result content, ready for export as PDF, PNG, or print."
              />
            </div>
            <InfoPill>A4 Preview</InfoPill>
          </div>

          <div className="overflow-auto rounded-[30px] bg-gradient-to-b from-blush/35 via-cream to-mint/30 p-4 sm:p-5">
            <MaterialPreview ref={previewRef} material={material} />
          </div>
        </Surface>
      </div>
    </AppShell>
  );
}

function ActionButton({
  children,
  disabled = false,
  onClick
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-70"
    >
      {children}
    </button>
  );
}

function TextPanel({
  children,
  title
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-[24px] bg-white/82 p-4">
      <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
      <div className="mt-3 space-y-2 text-sm leading-7 text-ink/78">{children}</div>
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
