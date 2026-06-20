"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { InfoPill, SectionTitle, Surface } from "@/components/ui";
import { SignOutButton } from "@/components/sign-out-button";
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
    const { error } = await supabase.from("materials").insert(toMaterialInsert(material));

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage("Saved to Supabase history");
    setSaving(false);
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
      description="This result is generated locally from the teacher's form values, then can be saved into Supabase for real history and reuse."
      userEmail={userEmail}
      headerAction={<SignOutButton />}
    >
      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-5">
          <Surface className="animate-fade-up">
            <SectionTitle
              eyebrow="Prompt Summary"
              title="Source settings"
              description="These values were used to create the current sample output."
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
              title="Quick actions"
              description="Copy the most useful sections or save this result into Supabase."
            />

            <div className="flex flex-wrap gap-3">
              <ActionButton
                onClick={() => handleCopy("Word list", material.wordList.join(", "))}
              >
                Copy Word List
              </ActionButton>
              <ActionButton
                onClick={() =>
                  handleCopy(
                    "Worksheet",
                    material.worksheetActivity
                      .map((item, index) => `${index + 1}. ${item}`)
                      .join("\n")
                  )
                }
              >
                Copy Worksheet
              </ActionButton>
              <ActionButton
                onClick={() => handleCopy("Canva prompt", material.canvaPrompt)}
              >
                Copy Canva Prompt
              </ActionButton>
              <ActionButton onClick={() => void handleSave()} disabled={saving}>
                {saving ? "Saving..." : "Save to History"}
              </ActionButton>
              <Link
                href="/materials/create"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-cream"
              >
                Clear Form
              </Link>
            </div>

            {message ? <p className="mt-3 text-sm font-semibold text-sage">{message}</p> : null}
          </Surface>
        </div>

        <Surface className="animate-fade-up stagger-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <SectionTitle
                eyebrow="Generated Output"
                title={material.title}
                description={material.summary}
              />
            </div>
            <InfoPill>Local Preview</InfoPill>
          </div>

          <div className="rounded-[30px] bg-gradient-to-b from-white to-cream p-5 sm:p-6">
            <div className="rounded-[24px] bg-white/80 p-4">
              <h3 className="font-display text-xl font-bold text-ink">Word List</h3>
              <p className="mt-3 text-sm leading-7 text-ink/78">
                {material.wordList.join(", ")}
              </p>
            </div>

            <div className="mt-4 rounded-[24px] bg-white/80 p-4">
              <h3 className="font-display text-xl font-bold text-ink">Simple Sentences</h3>
              <div className="mt-3 space-y-2 text-sm leading-7 text-ink/78">
                {material.sentences.map((sentence) => (
                  <p key={sentence}>{sentence}</p>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-[24px] bg-white/80 p-4">
              <h3 className="font-display text-xl font-bold text-ink">Worksheet Activity</h3>
              <div className="mt-3 space-y-2 text-sm leading-7 text-ink/78">
                {material.worksheetActivity.map((question, index) => (
                  <p key={question}>
                    {index + 1}. {question}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {material.visualCardText.map((card, index) => (
                <div
                  key={`${card}-${index}`}
                  className="rounded-[26px] bg-mint/45 p-5"
                >
                  <p className="whitespace-pre-line text-sm leading-7 text-ink/78">{card}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[24px] bg-white/80 p-4">
              <h3 className="font-display text-xl font-bold text-ink">Canva Prompt</h3>
              <p className="mt-3 text-sm leading-7 text-ink/78">{material.canvaPrompt}</p>
            </div>

            <div className="mt-4 rounded-[24px] bg-white/80 p-4">
              <h3 className="font-display text-xl font-bold text-ink">Teacher Notes</h3>
              <div className="mt-3 space-y-2 text-sm leading-7 text-ink/78">
                {material.teacherNotes.map((note) => (
                  <p key={note}>• {note}</p>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-[24px] bg-white/80 p-4">
              <h3 className="font-display text-xl font-bold text-ink">
                Suggested Difficulty Adjustment
              </h3>
              <p className="mt-3 text-sm leading-7 text-ink/78">
                {material.suggestedDifficultyAdjustment}
              </p>
            </div>
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
