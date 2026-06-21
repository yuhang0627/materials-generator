"use client";

import { forwardRef } from "react";
import type {
  GeneratedMaterial,
  MaterialVisualCard,
  MaterialVisualLayout
} from "@/lib/material-generator";

const pageClassName =
  "mx-auto min-h-[1123px] w-full max-w-[794px] overflow-hidden rounded-[32px] border border-[#e8ddd3] bg-[#fffaf6] text-ink shadow-soft";

const accentBackgrounds = [
  "from-mint/55 to-white",
  "from-blush/55 to-white",
  "from-lilac/55 to-white",
  "from-peach/55 to-white"
];

export const MaterialPreview = forwardRef<
  HTMLDivElement,
  { material: GeneratedMaterial }
>(function MaterialPreview({ material }, ref) {
  const layout = material.visualLayout;

  return (
    <div ref={ref} className={pageClassName}>
      <div className="relative overflow-hidden px-8 pb-8 pt-7">
        <div className="absolute left-[-4rem] top-[-2rem] h-32 w-32 rounded-full bg-mint/40 blur-3xl" />
        <div className="absolute right-[-3rem] top-8 h-28 w-28 rounded-full bg-blush/45 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-24 w-24 rounded-full bg-lilac/35 blur-3xl" />

        <div className="relative">
          {layout.kind === "word-list" ? null : <TopHeader material={material} />}

          {layout.kind === "word-list" ? (
            <WordListPreview material={material} layout={layout} />
          ) : null}
          {layout.kind === "worksheet" ? <WorksheetPreview layout={layout} /> : null}
          {layout.kind === "visual-cards" ? (
            <VisualCardsPreview layout={layout} />
          ) : null}
          {layout.kind === "poster" ? <PosterPreview layout={layout} /> : null}
          {layout.kind === "social-story" ? (
            <SocialStoryPreview layout={layout} />
          ) : null}
          {layout.kind === "behaviour-worksheet" ? (
            <BehaviourWorksheetPreview layout={layout} />
          ) : null}
          {layout.kind === "song-chant" ? <SongPreview layout={layout} /> : null}
          {layout.kind === "canva-prompt" ? (
            <CanvaPromptPreview layout={layout} />
          ) : null}
        </div>
      </div>
    </div>
  );
});

function TopHeader({ material }: { material: GeneratedMaterial }) {
  const layout = material.visualLayout;

  return (
    <div className="mb-6 rounded-[30px] border border-white/80 bg-white/80 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage">
            Material Preview
          </p>
          <h2 className="mt-3 max-w-[34rem] font-display text-[2rem] font-bold leading-[0.92] text-ink sm:text-[2.4rem]">
            {layout.title}
          </h2>
          <p className="mt-3 text-base leading-7 text-ink/68">{layout.subtitle}</p>
        </div>
        <div className="rounded-[24px] bg-gradient-to-b from-cream to-white px-4 py-4 text-right shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
            Output Type
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">
            {material.form.outputType}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <HeaderInfoCard label="Theme" value={material.form.theme || "Class theme"} />
        <HeaderInfoCard
          label="Skill Focus"
          value={material.form.skillFocus || "Practice target"}
        />
        <HeaderInfoCard
          label="Student Level"
          value={material.form.studentLevel || "Early learners"}
        />
      </div>
    </div>
  );
}

function WordListPreview({
  material,
  layout
}: {
  material: GeneratedMaterial;
  layout: MaterialVisualLayout;
}) {
  const cards = layout.cards.slice(0, 6);
  const endingBadges = getEndingBadges(material.form.skillFocus, material.wordList);

  return (
    <div>
      <CartoonPosterPanel
        material={material}
        cards={cards}
        endingBadges={endingBadges}
      />
    </div>
  );
}

function WorksheetPreview({ layout }: { layout: MaterialVisualLayout }) {
  const activities =
    layout.sections.find((section) => section.heading === "Activities")?.lines ?? [];
  const cards = layout.cards.slice(0, 4);

  return (
    <div className="space-y-5">
      <NameDateRow />
      <Hint text={layout.instructions} />

      <div className="rounded-[30px] bg-white/82 p-5">
        <SectionBanner
          eyebrow="Worksheet"
          title="Let’s do one step at a time"
          helper="Circle, match, trace, and write using short clear directions."
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <WorksheetBlock
            title="Activity 1: Circle"
            tone="mint"
            body={activities[0] || "Circle the correct answer."}
          >
            <ChoiceRow
              choices={cards.map((card) => `${card.emoji} ${card.title}`)}
              fill
            />
          </WorksheetBlock>

          <WorksheetBlock
            title="Activity 2: Match"
            tone="blush"
            body={activities[1] || "Match the picture to the word."}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map((card, index) => (
                <MatchRow
                  key={`${card.title}-${index}`}
                  left={`${String.fromCharCode(65 + index)}. ${card.emoji}`}
                  right={card.title}
                />
              ))}
            </div>
          </WorksheetBlock>

          <WorksheetBlock
            title="Activity 3: Write"
            tone="lilac"
            body={activities[2] || "Write the missing word."}
          >
            <AnswerLines
              lines={[
                "I can ____________.",
                "We are ____________.",
                "I see ____________."
              ]}
            />
          </WorksheetBlock>

          <WorksheetBlock
            title="Activity 4: Draw"
            tone="peach"
            body={activities[3] || "Draw a picture for one focus word."}
          >
            <div className="mt-3 rounded-[24px] border-2 border-dashed border-sage/30 bg-cream/55 p-6">
              <div className="h-28 rounded-[18px] border border-white/80 bg-white/65" />
              <div className="mt-4 h-px bg-sage/30" />
              <p className="mt-3 text-sm font-semibold text-ink/65">
                My drawing and sentence
              </p>
            </div>
          </WorksheetBlock>
        </div>
      </div>
    </div>
  );
}

function VisualCardsPreview({ layout }: { layout: MaterialVisualLayout }) {
  return (
    <div className="space-y-5">
      <Hint text={layout.instructions} />

      <div className="rounded-[30px] bg-gradient-to-br from-white via-cream to-mint/20 p-5">
        <SectionBanner
          eyebrow="Flashcards"
          title="Cut, point, and speak"
          helper="Use these as table cards, wall cards, or a quick matching game."
        />
        <BuddyStrip />

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {layout.cards.map((card, index) => (
            <div
              key={`${card.title}-${index}`}
              className="relative rounded-[28px] border-2 border-dashed border-sage/25 bg-white/92 p-5 text-center"
            >
              <div className="absolute right-3 top-3 rounded-full bg-cream px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-sage">
                Card {index + 1}
              </div>
              <div className="mt-2 text-5xl">{card.emoji}</div>
              <p className="mt-4 font-display text-[1.9rem] font-bold uppercase leading-none text-ink">
                {card.title}
              </p>
              <p className="mt-3 text-sm leading-7 text-ink/72">{card.subtitle}</p>
              <div className="mt-4 rounded-[18px] bg-mint/30 px-3 py-2 text-xs font-semibold text-ink/70">
                Say it. Find it. Show it.
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PosterPreview({ layout }: { layout: MaterialVisualLayout }) {
  const points = layout.sections[0]?.lines ?? [];
  const icons = ["🌟", "🫶", "📚", "🎨", "😊"];

  return (
    <div className="rounded-[34px] bg-gradient-to-b from-mint/35 via-cream to-blush/35 p-6">
      <div className="rounded-[28px] bg-white/85 p-6 text-center">
        <PosterStickers />
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sage">
          Classroom Poster
        </p>
        <h3 className="mt-3 font-display text-[2.4rem] font-bold leading-none text-ink">
          {layout.title}
        </h3>
        <p className="mt-3 text-base leading-7 text-ink/70">{layout.instructions}</p>
      </div>

      <div className="mt-5 space-y-4">
        {points.slice(0, 5).map((point, index) => (
          <div
            key={`${point}-${index}`}
            className="flex items-start gap-4 rounded-[26px] bg-white/82 p-4"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-white to-cream text-3xl">
              {icons[index % icons.length]}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sage">
                Key Point {index + 1}
              </p>
              <p className="mt-1 text-lg font-semibold leading-8 text-ink">{point}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialStoryPreview({ layout }: { layout: MaterialVisualLayout }) {
  return (
    <div className="space-y-5">
      <Hint text={layout.instructions} />

      <div className="rounded-[30px] bg-white/84 p-5">
        <SectionBanner
          eyebrow="Social Story"
          title="Read the steps in order"
          helper="Point to each picture and pause after every sentence."
        />

        <div className="mt-5 space-y-4">
          {layout.cards.slice(0, 6).map((card, index) => (
            <div
              key={`${card.title}-${index}`}
              className="grid gap-4 rounded-[26px] bg-gradient-to-r from-cream/80 to-white p-4 md:grid-cols-[auto_1fr]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white text-3xl shadow-sm">
                  {card.emoji}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage text-sm font-bold text-white">
                  {index + 1}
                </div>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-ink">{card.title}</p>
                <p className="mt-2 text-sm leading-7 text-ink/75">{card.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BehaviourWorksheetPreview({ layout }: { layout: MaterialVisualLayout }) {
  const expected = layout.cards[0];
  const unexpected = layout.cards[1];
  const supportCards = layout.cards.slice(2, 4);

  return (
    <div className="space-y-5">
      <NameDateRow />
      <Hint text={layout.instructions} />

      <div className="grid gap-4 lg:grid-cols-2">
        <BehaviourColumn
          title={expected?.title || "Expected"}
          emoji={expected?.emoji || "✅"}
          tone="mint"
          text={expected?.subtitle || "I use safe and kind actions."}
        />
        <BehaviourColumn
          title={unexpected?.title || "Unexpected"}
          emoji={unexpected?.emoji || "❌"}
          tone="peach"
          text={unexpected?.subtitle || "I do not hit, grab, or shout."}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {layout.sections.flatMap((section) => section.lines).slice(0, 3).map((line, index) => (
          <ReflectionBox
            key={`${line}-${index}`}
            title={["Feel", "Think", "Do"][index] || `Step ${index + 1}`}
            text={line}
            tone={accentBackgrounds[index % accentBackgrounds.length]}
          />
        ))}
      </div>

      {supportCards.length > 0 ? (
        <div className="rounded-[28px] bg-white/82 p-5">
          <SectionBanner
            eyebrow="Calm Choices"
            title="What can I do next?"
            helper="Offer two choices and let the child point first."
          />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {supportCards.map((card, index) => (
              <TeachingCard key={`${card.title}-${index}`} card={card} index={index} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SongPreview({ layout }: { layout: MaterialVisualLayout }) {
  return (
    <div className="rounded-[34px] bg-gradient-to-b from-lilac/45 via-white to-cream p-6">
      <div className="rounded-[28px] bg-white/88 p-5 text-center">
        <PosterStickers />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage">
          Song And Movement
        </p>
        <h3 className="mt-3 font-display text-[2.2rem] font-bold leading-none text-ink">
          {layout.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-ink/72">{layout.instructions}</p>
      </div>

      <div className="mt-5 space-y-4">
        {layout.cards.map((card, index) => (
          <div
            key={`${card.title}-${index}`}
            className="rounded-[26px] bg-white/84 p-4 text-center"
          >
            <div className="mb-2 text-3xl">{card.emoji || (index % 2 === 0 ? "👏" : "🎵")}</div>
            <p className="text-lg font-semibold leading-8 text-ink">{card.title}</p>
            <p className="mt-2 text-sm leading-6 text-ink/68">{card.subtitle}</p>
          </div>
        ))}
      </div>

      {layout.sections[0] ? (
        <div className="mt-5 rounded-[26px] bg-mint/30 p-5">
          <p className="font-display text-xl font-bold text-ink">
            {layout.sections[0].heading}
          </p>
          <div className="mt-3 space-y-2">
            {layout.sections[0].lines.map((line) => (
              <p key={line} className="text-sm leading-7 text-ink/76">
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
    <div className="space-y-5">
      <div className="rounded-[30px] bg-white/84 p-5">
        <SectionBanner
          eyebrow="Design Draft"
          title="Sample visual direction"
          helper="This gives the teacher a clearer layout before moving into Canva."
        />
        <BuddyStrip />

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {layout.cards.slice(0, 4).map((card, index) => (
              <TeachingCard key={`${card.title}-${index}`} card={card} index={index} />
            ))}
          </div>

          <div className="rounded-[28px] bg-gradient-to-b from-cream to-blush/30 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
              Canva Notes
            </p>
            {layout.sections.map((section) => (
              <div key={section.heading} className="mt-4 rounded-[22px] bg-white/78 p-4">
                <p className="font-display text-xl font-bold text-ink">
                  {section.heading}
                </p>
                <div className="mt-2 space-y-2">
                  {section.lines.map((line) => (
                    <p key={line} className="text-sm leading-7 text-ink/75">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-gradient-to-b from-white to-cream px-4 py-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold leading-6 text-ink">{value}</p>
    </div>
  );
}

function SectionBanner({
  eyebrow,
  title,
  helper
}: {
  eyebrow: string;
  title: string;
  helper: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-sage">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-display text-[2rem] font-bold leading-none text-ink">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-ink/70">{helper}</p>
    </div>
  );
}

function CuteHeroPanel({
  title,
  subtitle
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#dff4ff] via-[#fff7cf] to-[#ffe1ea] p-5">
      <div className="absolute -left-2 top-4 h-16 w-16 rounded-full bg-white/45 blur-2xl" />
      <div className="absolute right-5 top-3 flex gap-2 text-2xl">
        <span>🇲🇾</span>
        <span>⭐</span>
        <span>🎈</span>
      </div>
      <div className="relative max-w-[34rem]">
        <p className="inline-flex rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sage">
          EIP Friendly
        </p>
        <h3 className="mt-3 font-display text-[1.9rem] font-bold leading-none text-ink sm:text-[2.2rem]">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-ink/72">{subtitle}</p>
      </div>
    </div>
  );
}

function BuddyStrip() {
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {[
        ["👧", "Say it"],
        ["🧒", "Point to it"],
        ["⭐", "Try again"],
        ["🎵", "Clap together"]
      ].map(([emoji, label]) => (
        <div
          key={label}
          className="inline-flex items-center gap-2 rounded-full bg-white/84 px-3 py-2 text-xs font-semibold text-ink/72 shadow-sm"
        >
          <span className="text-lg">{emoji}</span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function MiniWordChip({ card }: { card: MaterialVisualCard }) {
  return (
    <div className="rounded-[22px] bg-white/88 px-3 py-3 text-center shadow-sm">
      <div className="text-2xl">{card.emoji}</div>
      <p className="mt-2 font-display text-lg font-bold uppercase leading-none text-ink">
        {card.title}
      </p>
    </div>
  );
}

function CartoonPosterPanel({
  material,
  cards,
  endingBadges
}: {
  material: GeneratedMaterial;
  cards: MaterialVisualCard[];
  endingBadges: string[];
}) {
  const posterLines = buildPosterLines(material, cards);
  const primaryEnding = endingBadges[0] ?? "-ing";
  const cardBackgrounds = [
    "from-[#e8f6ff] to-[#f7fffd]",
    "from-[#eef8ff] to-[#fffef6]",
    "from-[#f0fbff] to-[#fff7ef]",
    "from-[#f7f8ff] to-[#fffdf1]",
    "from-[#f6fbef] to-[#fff7ef]",
    "from-[#eef7ff] to-[#fff8f3]"
  ];

  return (
    <div className="relative overflow-hidden rounded-[38px] border-[4px] border-[#74befe] bg-gradient-to-b from-[#7dc8ff] via-[#c8edff] to-[#fff3bd] p-5 shadow-sm">
      <div className="absolute inset-x-5 inset-y-5 rounded-[30px] border-2 border-dashed border-white/80" />
      <div className="absolute left-3 top-2 text-4xl">🇲🇾</div>
      <div className="absolute right-4 top-2 text-4xl">🎇</div>
      <div className="absolute bottom-3 left-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#ffe8a6] text-4xl shadow-sm">
        👧
      </div>
      <div className="absolute bottom-3 right-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#ffe8a6] text-4xl shadow-sm">
        🧒
      </div>
      <div className="absolute left-8 top-20 h-10 w-16 rounded-full bg-white/35 blur-lg" />
      <div className="absolute right-12 top-24 h-10 w-20 rounded-full bg-white/35 blur-lg" />

      <div className="relative px-5 pb-8 pt-5">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-full bg-[#ffe36e] px-6 py-3 text-sm font-black uppercase tracking-[0.22em] text-[#2f4a73] shadow-sm">
            Ending Sounds Fun
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-full bg-[#2748a4] px-8 py-3 text-sm font-black uppercase tracking-[0.22em] text-white shadow-sm">
            {material.form.theme || "Theme Poster"}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {endingBadges.map((badge, index) => (
            <span
              key={badge}
              className={`rounded-[22px] px-5 py-3 font-display text-4xl font-bold lowercase shadow-sm ${
                index % 3 === 0
                  ? "bg-[#fff4cd] text-[#ef476f]"
                  : index % 3 === 1
                    ? "bg-[#ffe9f2] text-[#3968d6]"
                    : "bg-[#ecffd8] text-[#34a853]"
              }`}
            >
              {badge}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {[
            ["👧", "Say it"],
            ["🧒", "Point to it"],
            ["⭐", "Try again"],
            ["🎵", "Clap together"]
          ].map(([emoji, label]) => (
            <div
              key={label}
              className="rounded-full bg-[#9bd8ff]/40 px-4 py-3 text-sm font-bold text-[#315072] shadow-sm backdrop-blur-sm"
            >
              <span className="mr-2">{emoji}</span>
              {label}
            </div>
          ))}
        </div>

        <div className="mx-auto mt-6 max-w-[38rem] rounded-[30px] bg-gradient-to-b from-[#fffdfa] to-[#fff2f7] px-6 py-6 text-center shadow-inner">
          {posterLines.map((line, index) => (
            <p
              key={`${line}-${index}`}
              className="text-[15px] font-semibold leading-8 text-ink sm:text-[17px]"
            >
              {line}
            </p>
          ))}
        </div>

        <div className="mx-auto mt-6 grid max-w-[40rem] gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {cards.map((card, index) => (
            <div
              key={`${card.title}-${index}`}
              className={`rounded-[28px] border-2 border-white/90 bg-gradient-to-b ${cardBackgrounds[index % cardBackgrounds.length]} px-4 py-5 text-center shadow-sm`}
            >
              <div className="text-4xl">{card.emoji}</div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-xl text-[#ffcc29]">✦</span>
                <PosterWordTitle word={card.title} ending={primaryEnding} />
                <span className="text-xl text-[#ffcc29]">✦</span>
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-ink/72">
                {card.subtitle}
              </p>
              <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-[#3f5976]">
                Say it. Point it. Read it.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeachingCard({
  card,
  index
}: {
  card: MaterialVisualCard;
  index: number;
}) {
  return (
    <div className="rounded-[28px] border border-white/90 bg-white/92 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-cream to-white text-3xl">
          {card.emoji}
        </div>
        <div
          className={`rounded-full bg-gradient-to-r px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-sage ${accentBackgrounds[index % accentBackgrounds.length]}`}
        >
          Focus Card
        </div>
      </div>
      <p className="mt-4 break-words font-display text-[1.6rem] font-bold uppercase leading-[0.95] tracking-tight text-ink sm:text-[1.8rem]">
        {card.title}
      </p>
      {card.subtitle ? (
        <p className="mt-3 text-sm leading-7 text-ink/76">{card.subtitle}</p>
      ) : null}
      <div className="mt-4 rounded-[18px] bg-mint/28 px-3 py-2 text-xs font-semibold text-ink/68">
        Point. Say. Repeat.
      </div>
    </div>
  );
}

function ActivityPanel({
  tone,
  title,
  items
}: {
  tone: "mint" | "blush" | "lilac";
  title: string;
  items: string[];
}) {
  const toneClass =
    tone === "mint"
      ? "bg-mint/38"
      : tone === "blush"
        ? "bg-blush/40"
        : "bg-lilac/40";

  return (
    <div className={`rounded-[28px] ${toneClass} p-5`}>
      <p className="font-display text-2xl font-bold text-ink">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <p key={item} className="text-sm leading-7 text-ink/76">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function PosterStickers() {
  return (
    <div className="mb-4 flex items-center justify-center gap-3 text-2xl">
      <span className="rounded-full bg-[#ffe8a3] px-3 py-1 shadow-sm">☁️</span>
      <span className="rounded-full bg-[#ffd7e3] px-3 py-1 shadow-sm">🌈</span>
      <span className="rounded-full bg-[#dff4ff] px-3 py-1 shadow-sm">⭐</span>
      <span className="rounded-full bg-[#e7f8d8] px-3 py-1 shadow-sm">🧒</span>
      <span className="rounded-full bg-[#fff2c9] px-3 py-1 shadow-sm">👧</span>
    </div>
  );
}

function getEndingBadges(skillFocus: string, words: string[]) {
  const explicitBadges = Array.from(
    new Set(
      (skillFocus.match(/-[a-z]+/gi) ?? []).map((badge) => badge.toLowerCase())
    )
  );

  if (explicitBadges.length > 0) {
    return explicitBadges.slice(0, 4);
  }

  const derived = Array.from(
    new Set(
      words
        .map((word) => word.toLowerCase().replace(/[^a-z]/g, ""))
        .filter((word) => word.length >= 3)
        .map((word) => `-${word.slice(-3)}`)
    )
  );

  return (derived.length > 0 ? derived : ["-ing"]).slice(0, 4);
}

function buildPosterLines(material: GeneratedMaterial, cards: MaterialVisualCard[]) {
  const firstWords = cards.slice(0, 4).map((card) => card.title.toLowerCase());
  const lines = [
    `We wave and smile on ${material.form.theme || "our happy day"}!`,
    `We keep ${firstWords[0] || "singing"} and ${firstWords[1] || "marching"} in a playful way.`,
    `We try ${firstWords[2] || "dancing"} and ${firstWords[3] || "carrying"} with cheer,`,
    "Cute little learners can point, read, and hear!"
  ];

  return lines;
}

function PosterWordTitle({ word, ending }: { word: string; ending: string }) {
  const cleanEnding = ending.replace(/^-/, "").toLowerCase();
  const lowerWord = word.toLowerCase();
  const matchesEnding = lowerWord.endsWith(cleanEnding);

  if (!matchesEnding || lowerWord.length <= cleanEnding.length) {
    return (
      <p className="font-display text-[2rem] font-bold uppercase leading-none tracking-tight text-[#33475b]">
        {word}
      </p>
    );
  }

  const base = word.slice(0, word.length - cleanEnding.length).toUpperCase();
  const endingPart = word.slice(word.length - cleanEnding.length).toUpperCase();

  return (
    <p className="font-display text-[2rem] font-bold uppercase leading-none tracking-tight">
      <span className="text-[#33475b]">{base}</span>
      <span className="text-[#ef476f]">{endingPart}</span>
    </p>
  );
}

function WorksheetBlock({
  title,
  tone,
  body,
  children
}: {
  title: string;
  tone: "mint" | "blush" | "lilac" | "peach";
  body: string;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "mint"
      ? "from-mint/35 to-white"
      : tone === "blush"
        ? "from-blush/35 to-white"
        : tone === "lilac"
          ? "from-lilac/35 to-white"
          : "from-peach/35 to-white";

  return (
    <div className={`rounded-[28px] bg-gradient-to-br ${toneClass} p-5`}>
      <p className="font-display text-2xl font-bold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-7 text-ink/74">{body}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ChoiceRow({
  choices,
  fill
}: {
  choices: string[];
  fill?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {choices.map((choice) => (
        <div
          key={choice}
          className={`rounded-full border border-white/80 bg-white/86 px-4 py-3 text-sm font-semibold text-ink ${
            fill ? "min-w-[8rem] text-center" : ""
          }`}
        >
          {choice}
        </div>
      ))}
    </div>
  );
}

function MatchRow({ left, right }: { left: string; right: string }) {
  return (
    <div className="rounded-[20px] bg-white/84 px-4 py-3">
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-ink">{left}</p>
        <div className="h-px flex-1 border-t-2 border-dashed border-sage/30" />
        <p className="text-sm font-semibold text-ink">{right}</p>
      </div>
    </div>
  );
}

function AnswerLines({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-4">
      {lines.map((line) => (
        <div key={line}>
          <p className="text-sm leading-7 text-ink/76">{line}</p>
          <div className="mt-2 h-px bg-sage/30" />
        </div>
      ))}
    </div>
  );
}

function BehaviourColumn({
  title,
  emoji,
  tone,
  text
}: {
  title: string;
  emoji: string;
  tone: "mint" | "peach";
  text: string;
}) {
  return (
    <div
      className={`rounded-[30px] p-5 ${
        tone === "mint" ? "bg-mint/38" : "bg-peach/42"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white text-3xl">
          {emoji}
        </div>
        <p className="font-display text-[2rem] font-bold leading-none text-ink">
          {title}
        </p>
      </div>
      <p className="mt-4 text-sm leading-7 text-ink/76">{text}</p>
      <div className="mt-4 rounded-[20px] bg-white/72 px-4 py-3 text-xs font-semibold text-ink/70">
        Talk about one example together.
      </div>
    </div>
  );
}

function ReflectionBox({
  title,
  text,
  tone
}: {
  title: string;
  text: string;
  tone: string;
}) {
  return (
    <div className={`rounded-[28px] bg-gradient-to-br ${tone} p-5`}>
      <p className="font-display text-2xl font-bold text-ink">{title}</p>
      <p className="mt-3 text-sm leading-7 text-ink/76">{text}</p>
      <div className="mt-5 h-16 rounded-[18px] border border-dashed border-sage/28 bg-white/45" />
    </div>
  );
}

function BottomNote({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[24px] bg-white/84 px-5 py-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
        {title}
      </p>
      <p className="mt-2 text-sm leading-7 text-ink/72">{text}</p>
    </div>
  );
}

function NameDateRow() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <LineField label="Name" />
      <LineField label="Date" />
    </div>
  );
}

function LineField({ label }: { label: string }) {
  return (
    <div className="rounded-[22px] bg-white/82 px-4 py-3">
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
    <div className="rounded-[24px] bg-gradient-to-r from-white to-cream px-4 py-3">
      <p className="text-sm leading-7 text-ink/72">{text}</p>
    </div>
  );
}
