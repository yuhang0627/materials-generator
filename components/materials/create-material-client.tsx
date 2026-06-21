"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SectionTitle, Surface } from "@/components/ui";
import {
  copyText,
  type GeneratedMaterial,
  type MaterialFormValues,
  saveCurrentMaterial
} from "@/lib/material-generator";
import { blankFormDefaults, formDefaults } from "@/lib/mock-data";
import { SignOutButton } from "@/components/sign-out-button";
import { materialTypeOptions, studentLevelOptions } from "@/lib/resource-options";

const selectClassName =
  "w-full appearance-none border-0 bg-transparent text-ink outline-none";

export function CreateMaterialClient({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [form, setForm] = useState<MaterialFormValues>(formDefaults);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  function updateField<K extends keyof MaterialFormValues>(
    key: K,
    value: MaterialFormValues[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function handleGenerate() {
    setError("");
    setIsGenerating(true);

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const data = (await response.json()) as {
      error?: string;
      material?: GeneratedMaterial;
    };

    if (!response.ok || !data.material) {
      setError(data.error || "Failed to generate material.");
      setIsGenerating(false);
      return;
    }

    saveCurrentMaterial(data.material);
    router.push("/materials/result");
    router.refresh();
  }

  async function handleCopyWordList() {
    await copyText(
      `Theme: ${form.theme}\nSkill focus: ${form.skillFocus}\nTarget items: ${form.numberOfItems}`
    );
    setCopied("Prompt summary copied");
  }

  return (
    <AppShell
      title="Create Material"
      description="Fill in the prompt, generate a useful sample, and save good results to Supabase while keeping the generator itself simple and teacher-friendly."
      userEmail={userEmail}
      headerAction={<SignOutButton />}
    >
      <div className="space-y-5">
        <Surface className="animate-fade-up">
          <SectionTitle
            eyebrow="Material Builder"
            title="Prepare a new prompt"
            description="Generate builds a local result preview from the fields below. You can then save that generated material into Supabase."
          />

          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              void handleGenerate();
            }}
          >
            <Field label="Theme">
              <input
                value={form.theme}
                onChange={(event) => updateField("theme", event.target.value)}
                className={selectClassName}
              />
            </Field>
            <Field label="Subject">
              <input
                value={form.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                className={selectClassName}
              />
            </Field>
            <Field label="Skill focus">
              <input
                value={form.skillFocus}
                onChange={(event) => updateField("skillFocus", event.target.value)}
                className={selectClassName}
              />
            </Field>
            <Field label="Student level">
              <select
                value={form.studentLevel}
                onChange={(event) => updateField("studentLevel", event.target.value)}
                className={selectClassName}
              >
                {studentLevelOptions.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </Field>
            <Field label="Material type">
              <select
                value={form.materialType}
                onChange={(event) => {
                  updateField("materialType", event.target.value);
                  updateField("outputType", event.target.value);
                }}
                className={selectClassName}
              >
                {materialTypeOptions.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </Field>
            <Field label="Language">
              <input
                value={form.language}
                onChange={(event) => updateField("language", event.target.value)}
                className={selectClassName}
              />
            </Field>
            <Field label="Number of items">
              <input
                value={form.numberOfItems}
                onChange={(event) => updateField("numberOfItems", event.target.value)}
                className={selectClassName}
              />
            </Field>
            <Field label="Difficulty">
              <input
                value={form.difficulty}
                onChange={(event) => updateField("difficulty", event.target.value)}
                className={selectClassName}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Style preference">
                <input
                  value={form.stylePreference}
                  onChange={(event) =>
                    updateField("stylePreference", event.target.value)
                  }
                  className={selectClassName}
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">
                  Extra instruction
                </span>
                <div className="field-shell rounded-[24px] px-4 py-3">
                  <textarea
                    value={form.extraInstruction}
                    onChange={(event) =>
                      updateField("extraInstruction", event.target.value)
                    }
                    rows={5}
                    className="w-full resize-none border-0 bg-transparent text-ink outline-none"
                  />
                </div>
              </label>
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={isGenerating}
                className="inline-flex items-center justify-center rounded-full bg-sage px-5 py-3 text-sm font-bold text-white transition hover:translate-y-[-1px] hover:bg-[#8cab99]"
              >
                {isGenerating ? "Generating..." : "Generate"}
              </button>
              <button
                type="button"
                onClick={() => setForm(blankFormDefaults)}
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-cream"
              >
                Clear Form
              </button>
              <button
                type="button"
                onClick={() => setForm(formDefaults)}
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-cream"
              >
                Load Sample
              </button>
              <button
                type="button"
                onClick={() => void handleCopyWordList()}
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-cream"
              >
                Copy Prompt Summary
              </button>
            </div>

            {copied ? (
              <p className="sm:col-span-2 text-sm font-semibold text-sage">{copied}</p>
            ) : null}
            {error ? (
              <p className="sm:col-span-2 text-sm font-semibold text-[#b35f5f]">
                {error}
              </p>
            ) : null}
          </form>
        </Surface>

        <div className="space-y-5">
          <Surface className="animate-fade-up stagger-1">
            <SectionTitle
              eyebrow="Material Types"
              title="Available classroom-ready formats"
              description="Each material type will shape the preview differently so the output feels closer to a printable teaching resource."
            />

            <div className="flex flex-wrap gap-2">
              {materialTypeOptions.map((type) => (
                <span
                  key={type}
                  className="rounded-full bg-cream px-3 py-2 text-sm font-semibold text-ink/75"
                >
                  {type}
                </span>
              ))}
            </div>
          </Surface>

          <Surface className="animate-fade-up stagger-2">
            <SectionTitle
              eyebrow="Preview Intent"
              title="Current prompt summary"
              description="This updates as the teacher changes the form."
            />

            <div className="rounded-[26px] bg-gradient-to-br from-white to-blush/55 p-5">
              <p className="text-sm leading-7 text-ink/80">
                Create <strong>{form.numberOfItems || "6"}</strong>{" "}
                <strong>{(form.materialType || form.outputType).toLowerCase()}</strong> for{" "}
                <strong>{form.subject || "language activities"}</strong> around{" "}
                <strong>{form.theme || "the selected theme"}</strong>, focused on{" "}
                <strong>{form.skillFocus || "the selected skill"}</strong> for{" "}
                <strong>{form.studentLevel || "early learners"}</strong>.
              </p>
            </div>
          </Surface>

          <Surface className="animate-fade-up stagger-3">
            <SectionTitle
              eyebrow="Navigation"
              title="Review saved work"
              description="Generate first, then open the result page to save a useful material into Supabase history."
            />
            <div className="flex flex-wrap gap-3">
              <Link href="/materials/result" className="text-sm font-bold text-sage">
                Open Generated Result
              </Link>
              <Link href="/history" className="text-sm font-bold text-sage">
                Open History
              </Link>
            </div>
          </Surface>
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
