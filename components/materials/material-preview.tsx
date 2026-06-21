"use client";

import { forwardRef } from "react";
import type {
  GeneratedMaterial,
  MaterialVisualCard,
  MaterialVisualLayout
} from "@/lib/material-generator";

const pageClassName =
  "mx-auto min-h-[1123px] w-full max-w-[794px] overflow-hidden rounded-[32px] border border-[#e8ddd3] bg-[#fffaf6] p-8 text-ink shadow-soft";

export const MaterialPreview = forwardRef<
  HTMLDivElement,
  { material: GeneratedMaterial }
>(function MaterialPreview({ material }, ref) {
  const layout = material.visualLayout;

  return (
    <div ref={ref} className={pageClassName}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage">
            Material Preview
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink">
            {layout.title}
          </h2>
          <p className="mt-2 text-lg text-ink/70">{layout.subtitle}</p>
        </div>
        <div className="rounded-[22px] bg-white/85 px-4 py-3 text-right">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
            Output Type
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">
            {material.form.outputType}
          </p>
        </div>
      </div>

      {layout.kind === "word-list" ? <WordListPreview layout={layout} /> : null}
      {layout.kind === "worksheet" ? <WorksheetPreview layout={layout} /> : null}
      {layout.kind === "visual-cards" ? <VisualCardsPreview layout={layout} /> : null}
      {layout.kind === "poster" ? <PosterPreview layout={layout} /> : null}
      {layout.kind === "social-story" ? <SocialStoryPreview layout={layout} /> : null}
      {layout.kind === "behaviour-worksheet" ? (
        <BehaviourWorksheetPreview layout={layout} />
      ) : null}
      {layout.kind === "song-chant" ? <SongPreview layout={layout} /> : null}
      {layout.kind === "canva-prompt" ? <CanvaPromptPreview layout={layout} /> : null}
    </div>
  );
});

function WordListPreview({ layout }: { layout: MaterialVisualLayout }) {
  return (
    <div>
      <Hint text={layout.instructions} />
      <div className="grid gap-4 md:grid-cols-2">
        {layout.cards.slice(0, 6).map((card, index) => (
          <PreviewCard key={`${card.title}-${index}`} card={card} />
        ))}
      </div>
    </div>
  );
}

function WorksheetPreview({ layout }: { layout: MaterialVisualLayout }) {
  const activities =
    layout.sections.find((section) => section.heading === "Activities")?.lines ?? [];

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <LineField label="Name" />
        <LineField label="Date" />
      </div>
      <Hint text={layout.instructions} />
      <div className="space-y-4">
        {activities.map((line, index) => (
          <div key={`${line}-${index}`} className="rounded-[24px] bg-white/85 p-4">
            <p className="text-sm font-semibold text-ink">
              {index + 1}. {line}
            </p>
            <div className="mt-4 h-10 rounded-2xl border border-dashed border-sage/35 bg-cream/60" />
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualCardsPreview({ layout }: { layout: MaterialVisualLayout }) {
  return (
    <div>
      <Hint text={layout.instructions} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {layout.cards.map((card, index) => (
          <div
            key={`${card.title}-${index}`}
            className="rounded-[26px] border-2 border-sage/20 bg-white/88 p-5 text-center"
          >
            <div className="text-4xl">{card.emoji}</div>
            <p className="mt-4 font-display text-2xl font-bold text-ink">
              {card.title}
            </p>
            <p className="mt-3 text-sm leading-7 text-ink/75">{card.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PosterPreview({ layout }: { layout: MaterialVisualLayout }) {
  const points = layout.sections[0]?.lines ?? [];
  const icons = ["🌟", "🫶", "🎨", "📚", "😊"];

  return (
    <div className="rounded-[30px] bg-gradient-to-b from-blush/55 via-cream to-mint/40 p-6">
      <Hint text={layout.instructions} />
      <div className="space-y-4">
        {points.slice(0, 5).map((point, index) => (
          <div
            key={`${point}-${index}`}
            className="flex items-start gap-4 rounded-[24px] bg-white/80 p-4"
          >
            <div className="text-3xl">{icons[index % icons.length]}</div>
            <p className="pt-1 text-base font-semibold leading-7 text-ink">
              {point}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialStoryPreview({ layout }: { layout: MaterialVisualLayout }) {
  return (
    <div>
      <Hint text={layout.instructions} />
      <div className="grid gap-4 md:grid-cols-2">
        {layout.cards.slice(0, 6).map((card, index) => (
          <div
            key={`${card.title}-${index}`}
            className="rounded-[24px] bg-white/88 p-5"
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{card.emoji}</div>
              <p className="font-display text-2xl font-bold text-ink">
                {card.title}
              </p>
            </div>
            <p className="mt-3 text-sm leading-7 text-ink/78">{card.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BehaviourWorksheetPreview({ layout }: { layout: MaterialVisualLayout }) {
  return (
    <div>
      <Hint text={layout.instructions} />
      <div className="grid gap-4 md:grid-cols-2">
        {layout.cards.slice(0, 4).map((card, index) => (
          <div
            key={`${card.title}-${index}`}
            className={`rounded-[24px] p-5 ${
              index === 0
                ? "bg-mint/45"
                : index === 1
                  ? "bg-peach/55"
                  : "bg-white/88"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{card.emoji}</div>
              <p className="font-display text-2xl font-bold text-ink">
                {card.title}
              </p>
            </div>
            <p className="mt-3 text-sm leading-7 text-ink/78">{card.subtitle}</p>
          </div>
        ))}
      </div>

      {layout.sections.map((section) => (
        <div key={section.heading} className="mt-4 rounded-[24px] bg-white/88 p-5">
          <p className="font-display text-2xl font-bold text-ink">
            {section.heading}
          </p>
          <div className="mt-3 space-y-2">
            {section.lines.map((line) => (
              <p key={line} className="text-sm leading-7 text-ink/78">
                {line}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SongPreview({ layout }: { layout: MaterialVisualLayout }) {
  return (
    <div className="rounded-[30px] bg-gradient-to-b from-lilac/50 via-white to-cream p-6">
      <Hint text={layout.instructions} />
      <div className="space-y-4 text-center">
        {layout.cards.map((card, index) => (
          <div key={`${card.title}-${index}`} className="rounded-[24px] bg-white/82 p-4">
            <p className="text-base font-semibold leading-8 text-ink">{card.title}</p>
            <p className="mt-2 text-sm leading-6 text-ink/65">{card.subtitle}</p>
          </div>
        ))}
      </div>
      {layout.sections.length > 0 ? (
        <div className="mt-6 rounded-[24px] bg-white/84 p-5">
          <p className="font-display text-xl font-bold text-ink">
            {layout.sections[0].heading}
          </p>
          <div className="mt-3 space-y-2">
            {layout.sections[0].lines.map((line) => (
              <p key={line} className="text-sm leading-7 text-ink/78">
                {line}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CanvaPromptPreview({ layout }: { layout: MaterialVisualLayout }) {
  return (
    <div>
      <Hint text={layout.instructions} />
      <div className="grid gap-4 md:grid-cols-2">
        {layout.cards.slice(0, 6).map((card, index) => (
          <PreviewCard key={`${card.title}-${index}`} card={card} />
        ))}
      </div>
      {layout.sections.map((section) => (
        <div key={section.heading} className="mt-4 rounded-[24px] bg-white/85 p-5">
          <p className="font-display text-xl font-bold text-ink">
            {section.heading}
          </p>
          <div className="mt-3 space-y-2">
            {section.lines.map((line) => (
              <p key={line} className="text-sm leading-7 text-ink/78">
                {line}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PreviewCard({ card }: { card: MaterialVisualCard }) {
  return (
    <div className="rounded-[26px] bg-white/88 p-5">
      <div className="text-4xl">{card.emoji}</div>
      <p className="mt-4 font-display text-2xl font-bold uppercase text-ink">
        {card.title}
      </p>
      {card.subtitle ? (
        <p className="mt-3 text-sm leading-7 text-ink/78">{card.subtitle}</p>
      ) : null}
      {card.body ? (
        <p className="mt-2 text-sm leading-7 text-ink/68">{card.body}</p>
      ) : null}
    </div>
  );
}

function LineField({ label }: { label: string }) {
  return (
    <div className="rounded-[20px] bg-white/85 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
        {label}
      </p>
      <div className="mt-4 h-px bg-sage/35" />
    </div>
  );
}

function Hint({ text }: { text?: string }) {
  if (!text) return null;

  return (
    <div className="mb-5 rounded-[22px] bg-white/82 px-4 py-3">
      <p className="text-sm leading-7 text-ink/72">{text}</p>
    </div>
  );
}
