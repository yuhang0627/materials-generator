import type { MaterialInsert, MaterialRow } from "@/lib/supabase/types";
import {
  getStudentLevelProfile,
  normalizeStudentLevel
} from "@/lib/student-level-engine";

export type MaterialFormValues = {
  theme: string;
  subject: string;
  skillFocus: string;
  studentLevel: string;
  materialType: string;
  outputType: string;
  language: string;
  numberOfItems: string;
  difficulty: string;
  stylePreference: string;
  extraInstruction: string;
};

export type GeneratedMaterial = {
  id: string;
  title: string;
  createdAt: string;
  form: MaterialFormValues;
  wordList: string[];
  sentences: string[];
  worksheetActivity: string[];
  visualCardText: string[];
  canvaPrompt: string;
  teacherNotes: string[];
  suggestedDifficultyAdjustment: string;
  summary: string;
  visualLayout: MaterialVisualLayout;
};

export type MaterialVisualCard = {
  emoji: string;
  title: string;
  subtitle?: string;
  body?: string;
};

export type MaterialVisualSection = {
  heading: string;
  lines: string[];
};

export type MaterialVisualLayout = {
  kind:
    | "word-list"
    | "worksheet"
    | "visual-cards"
    | "poster"
    | "social-story"
    | "behaviour-worksheet"
    | "matching-activity"
    | "cut-paste"
    | "colouring-sheet"
    | "routine-chart"
    | "behaviour-chart"
    | "reward-chart"
    | "song-chant"
    | "canva-prompt";
  title: string;
  subtitle: string;
  instructions?: string;
  cards: MaterialVisualCard[];
  sections: MaterialVisualSection[];
};

const STORAGE_KEYS = {
  current: "materials-generator/current"
} as const;

const themeWordBanks: Array<{ matchers: string[]; words: string[] }> = [
  {
    matchers: ["malaysia", "national day", "merdeka"],
    words: ["wave", "march", "sing", "dance", "carry", "fly", "clap", "smile", "cheer", "salute"]
  },
  {
    matchers: ["ocean", "sea"],
    words: ["swim", "splash", "float", "dive", "glide", "jump", "shine", "wiggle"]
  },
  {
    matchers: ["transport", "vehicle"],
    words: ["drive", "ride", "stop", "go", "turn", "park", "roll", "zoom"]
  },
  {
    matchers: ["feelings", "emotion"],
    words: ["smile", "calm", "breathe", "share", "rest", "hug", "listen", "notice"]
  }
];

const fallbackWords = [
  "look",
  "point",
  "match",
  "trace",
  "colour",
  "choose",
  "listen",
  "talk",
  "move",
  "play"
];

function formatNow(date = new Date()) {
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function slugId() {
  return `MAT-${Date.now().toString().slice(-6)}`;
}

function clampItemCount(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return 6;
  }

  return Math.min(12, Math.max(3, parsed));
}

function findWordBank(theme: string) {
  const lower = theme.toLowerCase();

  for (const group of themeWordBanks) {
    if (group.matchers.some((matcher) => lower.includes(matcher))) {
      return group.words;
    }
  }

  return fallbackWords;
}

function toIng(word: string) {
  if (word.endsWith("ie")) {
    return `${word.slice(0, -2)}ying`;
  }

  if (word.endsWith("e") && !word.endsWith("ee")) {
    return `${word.slice(0, -1)}ing`;
  }

  return `${word}ing`;
}

function titleCase(text: string) {
  return text
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sentenceForWord(word: string, sentence: string | undefined) {
  if (sentence && sentence.trim()) {
    return sentence.trim();
  }

  return `We are learning ${word.toLowerCase()}.`;
}

function emojiForWord(word: string, theme: string) {
  const lower = `${word} ${theme}`.toLowerCase();
  if (lower.includes("flag") || lower.includes("wave")) return "🚩";
  if (lower.includes("march")) return "🥁";
  if (lower.includes("sing") || lower.includes("song")) return "🎵";
  if (lower.includes("dance")) return "💃";
  if (lower.includes("carry")) return "👜";
  if (lower.includes("fly")) return "🪁";
  if (lower.includes("happy")) return "😊";
  if (lower.includes("sad")) return "😔";
  if (lower.includes("calm")) return "🫶";
  if (lower.includes("help")) return "🤝";
  if (lower.includes("stop")) return "🛑";
  if (lower.includes("go")) return "➡️";
  if (lower.includes("wash")) return "🧼";
  if (lower.includes("listen")) return "👂";
  return "🌟";
}

function buildWordList(form: MaterialFormValues, count: number) {
  const skill = form.skillFocus.toLowerCase();
  const baseWords = findWordBank(form.theme);
  const selected = baseWords.slice(0, count);

  if (
    skill.includes("-ing") ||
    skill.includes("ending with ing") ||
    skill.includes("ending with -ing")
  ) {
    return selected.map(toIng);
  }

  if (skill.includes("cvc")) {
    return ["cat", "sun", "hat", "pig", "bus", "pen"].slice(0, count);
  }

  if (skill.includes("emotion") || skill.includes("feeling")) {
    return ["happy", "calm", "proud", "sad", "worried", "excited"].slice(0, count);
  }

  return selected;
}

function buildSentences(wordList: string[], form: MaterialFormValues) {
  const level = getStudentLevelProfile(form.studentLevel);

  if (level.level === "Level 1") {
    return wordList.slice(0, 4).map((word) => `${titleCase(word)}.`);
  }

  if (level.level === "Level 1.5") {
    return wordList.slice(0, 4).map((word) => `${titleCase(word)} together.`);
  }

  return wordList.slice(0, 4).map((word, index) => {
    const starters = [
      `I can see ${word}.`,
      `We are ${word} today.`,
      `Let's try ${word} together.`,
      `${titleCase(form.theme)} is for ${word}.`
    ];

    return starters[index] ?? `We can practise ${word}.`;
  });
}

function buildWorksheetActivity(wordList: string[], form: MaterialFormValues) {
  const level = getStudentLevelProfile(form.studentLevel);

  if (level.level === "Level 1") {
    return [
      `Look at the picture for ${wordList[0] ?? "the theme"}.`,
      `Point to ${wordList[0] ?? "the word"}.`,
      `Say ${wordList[0] ?? "the word"} together.`
    ];
  }

  if (level.level === "Level 1.5") {
    return [
      `Match the picture to these words: ${wordList.slice(0, 2).join(", ")}.`,
      `Point and say: ${wordList[0] ?? "theme word"}.`,
      `Trace one word: ${wordList[1] ?? wordList[0] ?? "practice"}.`
    ];
  }

  if (level.level === "Level 3") {
    return [
      `Read the focus words: ${wordList.slice(0, 4).join(", ")}.`,
      `Write one short sentence using ${wordList[0] ?? "a focus word"}.`,
      `Sort the words by picture, action, or place.`,
      `Complete the sentence: "We use ${wordList[1] ?? "the theme word"} during ${form.theme}."`
    ];
  }

  return [
    `Circle the ${Math.min(3, wordList.length)} words that match the theme "${form.theme}".`,
    `Trace these words: ${wordList.slice(0, 3).join(", ")}.`,
    `Complete the sentence: "We are ______ on ${form.theme}."`,
    `Draw a picture for this word: ${wordList[0] ?? "practice"}.`
  ];
}

function buildVisualCards(wordList: string[], form: MaterialFormValues) {
  return wordList.map(
    (word) => `${titleCase(word)}\n${form.theme}\nPoint and say the word.`
  );
}

function buildTeacherNotes(form: MaterialFormValues, wordList: string[]) {
  const level = getStudentLevelProfile(form.studentLevel);

  return [
    `${level.label}: ${level.learnerSnapshot}`,
    level.teacherScriptGuidance,
    `Use ${form.difficulty.toLowerCase()} pacing with gesture or picture support for ${level.label.toLowerCase()} learners.`,
    `Start with ${wordList.slice(0, 2).join(" and ")}, then add the remaining words after a quick success.`
  ];
}

function buildCanvaPrompt(form: MaterialFormValues, wordList: string[]) {
  const level = getStudentLevelProfile(form.studentLevel);

  return [
    "Create a calm pastel classroom resource for an Early Intervention Program teacher.",
    `Theme: ${form.theme}. Subject: ${form.subject}. Skill focus: ${form.skillFocus}.`,
    `Material type: ${form.materialType}. Output type: ${form.outputType}. Student level: ${level.label}. Difficulty: ${form.difficulty}.`,
    `Student level guidance: ${level.vocabularyGuidance} ${level.sentenceGuidance} ${level.printableGuidance}`,
    `Include these focus words: ${wordList.join(", ")}.`,
    "Use simple icons, large readable text, soft cream, mint, blush, and sage colours, with lots of spacing and visual clarity."
  ].join(" ");
}

function detectLayoutKind(form: MaterialFormValues): MaterialVisualLayout["kind"] {
  const value = `${form.materialType || form.outputType}`.toLowerCase();

  if (value.includes("flashcard")) return "visual-cards";
  if (value.includes("visual card")) return "visual-cards";
  if (value.includes("classroom poster")) return "poster";
  if (value.includes("poster")) return "poster";
  if (value.includes("social story")) return "social-story";
  if (value.includes("behaviour worksheet")) return "behaviour-worksheet";
  if (value.includes("matching")) return "matching-activity";
  if (value.includes("cut and paste")) return "cut-paste";
  if (value.includes("colouring")) return "colouring-sheet";
  if (value.includes("routine")) return "routine-chart";
  if (value.includes("behaviour chart")) return "behaviour-chart";
  if (value.includes("reward chart")) return "reward-chart";
  if (value.includes("song")) return "song-chant";
  if (value.includes("worksheet")) return "worksheet";
  if (value.includes("canva")) return "canva-prompt";
  return "word-list";
}

export function generateMaterial(form: MaterialFormValues): GeneratedMaterial {
  const count = clampItemCount(form.numberOfItems);
  const wordList = buildWordList(form, count);
  const layoutKind = detectLayoutKind(form);
  const level = getStudentLevelProfile(form.studentLevel);
  const sentences = buildSentences(wordList, form);
  const worksheetActivity = buildWorksheetActivity(wordList, form);
  const teacherNotes = buildTeacherNotes(form, wordList);

  return {
    id: slugId(),
    title: `${titleCase(form.theme || "Classroom")} ${form.materialType || form.outputType}`,
    createdAt: formatNow(),
    form,
    wordList,
    sentences,
    worksheetActivity,
    visualCardText: buildVisualCards(wordList, form),
    canvaPrompt: buildCanvaPrompt(form, wordList),
    teacherNotes,
    suggestedDifficultyAdjustment:
      level.level === "Level 1" || level.level === "Level 1.5"
        ? "If the child needs more support, reduce to 2 or 3 words with large pictures. If the child is ready for more, add one matching or pointing step."
        : level.level === "Level 3"
          ? "If the child needs more support, shorten the worksheet and model one example first. If the child is ready for more, add one independent sentence or sorting task."
          : "If the child needs more support, use 3 words first with picture choices. If the child is ready for a challenge, ask for one extra sentence using a target word.",
    summary: `Created ${count} ${form.skillFocus || "target"} items for ${level.label} in a ${form.difficulty.toLowerCase()} ${(form.materialType || form.outputType).toLowerCase()} set around ${form.theme || "the chosen theme"}.`,
    visualLayout: {
      kind: layoutKind,
      title: `${titleCase(form.theme || "Classroom")} ${form.materialType || form.outputType}`,
      subtitle: `${level.label} • ${form.subject || form.skillFocus || "Teaching material"}`,
      instructions:
        layoutKind === "poster"
          ? `${level.printableGuidance} Display this poster at eye level and point to each key word together.`
          : layoutKind === "worksheet"
            ? `${level.activityGuidance} Circle, match, write, or colour using one short direction at a time.`
            : `${level.teacherScriptGuidance} Say each word, point to the picture, and read the sentence.`,
      cards: wordList.map((word, index) => ({
        emoji: emojiForWord(word, form.theme),
        title: titleCase(word),
        subtitle: sentenceForWord(word, sentences[index]),
        body:
          layoutKind === "visual-cards"
            ? `${level.label} cue: ${word.slice(-3).toUpperCase()}`
            : undefined
      })),
      sections: [
        {
          heading:
            layoutKind === "worksheet"
              ? "Activities"
              : layoutKind === "poster"
                ? "Content Blocks"
                : "Teacher Notes",
          lines:
            layoutKind === "worksheet"
              ? worksheetActivity
              : layoutKind === "poster"
                ? sentences
                : teacherNotes
        }
      ]
    }
  };
}

export function copyText(text: string) {
  return navigator.clipboard.writeText(text);
}

export function getCurrentMaterial() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.current);
  return raw ? normalizeGeneratedMaterial(JSON.parse(raw)) : null;
}

export function saveCurrentMaterial(material: GeneratedMaterial) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEYS.current,
    JSON.stringify(normalizeGeneratedMaterial(material))
  );
}

export function clearCurrentMaterial() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.current);
}

export function toMaterialInsert(material: GeneratedMaterial): MaterialInsert {
  const normalized = normalizeGeneratedMaterial(material);

  return {
    theme: normalized.form.theme,
    subject: normalized.form.subject,
    skill_focus: normalized.form.skillFocus,
    student_level: normalized.form.studentLevel,
    output_type: normalized.form.outputType,
    language: normalized.form.language,
    difficulty: normalized.form.difficulty,
    input_data: {
      ...normalized.form,
      resourceKind: "material"
    },
    generated_content: {
      resourceKind: "material",
      title: normalized.title,
      createdAt: normalized.createdAt,
      summary: normalized.summary,
      wordList: normalized.wordList,
      sentences: normalized.sentences,
      worksheetActivity: normalized.worksheetActivity,
      visualCardText: normalized.visualCardText,
      canvaPrompt: normalized.canvaPrompt,
      teacherNotes: normalized.teacherNotes,
      suggestedDifficultyAdjustment: normalized.suggestedDifficultyAdjustment,
      visualLayout: normalized.visualLayout,
      isFavorite: false
    }
  };
}

function ensureStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function normalizeGeneratedMaterial(material: unknown): GeneratedMaterial {
  const value = (material ?? {}) as Partial<GeneratedMaterial> & {
    worksheetQuestions?: unknown;
  };
  const form = (value.form ?? {}) as Partial<MaterialFormValues>;

  return {
    id: typeof value.id === "string" ? value.id : slugId(),
    title: typeof value.title === "string" ? value.title : "Generated Material",
    createdAt:
      typeof value.createdAt === "string" ? value.createdAt : formatNow(),
    form: {
      theme: typeof form.theme === "string" ? form.theme : "",
      subject: typeof form.subject === "string" ? form.subject : "",
      skillFocus: typeof form.skillFocus === "string" ? form.skillFocus : "",
      studentLevel:
        typeof form.studentLevel === "string"
          ? normalizeStudentLevel(form.studentLevel)
          : "Level 1.5",
      materialType:
        typeof form.materialType === "string"
          ? form.materialType
          : typeof form.outputType === "string"
            ? form.outputType
            : "Worksheet",
      outputType: typeof form.outputType === "string" ? form.outputType : "Word list",
      language: typeof form.language === "string" ? form.language : "English",
      numberOfItems:
        typeof form.numberOfItems === "string" ? form.numberOfItems : "6",
      difficulty: typeof form.difficulty === "string" ? form.difficulty : "Gentle",
      stylePreference:
        typeof form.stylePreference === "string" ? form.stylePreference : "",
      extraInstruction:
        typeof form.extraInstruction === "string" ? form.extraInstruction : ""
    },
    wordList: ensureStringArray(value.wordList),
    sentences: ensureStringArray(value.sentences),
    worksheetActivity: ensureStringArray(
      value.worksheetActivity ?? value.worksheetQuestions
    ),
    visualCardText: ensureStringArray(value.visualCardText),
    canvaPrompt: typeof value.canvaPrompt === "string" ? value.canvaPrompt : "",
    teacherNotes: ensureStringArray(value.teacherNotes),
    suggestedDifficultyAdjustment:
      typeof value.suggestedDifficultyAdjustment === "string"
        ? value.suggestedDifficultyAdjustment
        : "If the child needs more support, reduce the number of items and add picture choices. If the child is ready for more, ask for one extra speaking or writing step.",
    summary:
      typeof value.summary === "string"
        ? value.summary
        : "Generated teaching content preview.",
    visualLayout: normalizeVisualLayout(
      (value as { visualLayout?: unknown }).visualLayout,
      {
        title: typeof value.title === "string" ? value.title : "Generated Material",
        subtitle:
          typeof form.subject === "string" && form.subject
            ? form.subject
            : "Teaching material",
        outputType:
          typeof form.outputType === "string" ? form.outputType : "Word list",
        theme: typeof form.theme === "string" ? form.theme : "",
        wordList: ensureStringArray(value.wordList),
        sentences: ensureStringArray(value.sentences),
        worksheetActivity: ensureStringArray(
          value.worksheetActivity ?? value.worksheetQuestions
        ),
        visualCardText: ensureStringArray(value.visualCardText),
        canvaPrompt:
          typeof value.canvaPrompt === "string" ? value.canvaPrompt : "",
        teacherNotes: ensureStringArray(value.teacherNotes)
      }
    )
  };
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function fromMaterialRow(row: MaterialRow): GeneratedMaterial {
  const input = (row.input_data ?? {}) as Partial<MaterialFormValues>;
  const generated = (row.generated_content ?? {}) as Record<string, unknown>;

  return {
    id: row.id,
    title:
      typeof generated.title === "string"
        ? generated.title
        : `${titleCase(row.theme)} ${row.output_type}`,
    createdAt: row.created_at,
    form: {
      theme: row.theme,
      subject: row.subject,
      skillFocus: row.skill_focus,
      studentLevel: normalizeStudentLevel(row.student_level),
      materialType:
        typeof input.materialType === "string" ? input.materialType : row.output_type,
      outputType: row.output_type,
      language: row.language,
      numberOfItems:
        typeof input.numberOfItems === "string" ? input.numberOfItems : "6",
      difficulty: row.difficulty,
      stylePreference:
        typeof input.stylePreference === "string" ? input.stylePreference : "",
      extraInstruction:
        typeof input.extraInstruction === "string" ? input.extraInstruction : ""
    },
    wordList: readStringArray(generated.wordList),
    sentences: readStringArray(generated.sentences),
    worksheetActivity: readStringArray(
      generated.worksheetActivity ?? generated.worksheetQuestions
    ),
    visualCardText: readStringArray(generated.visualCardText),
    canvaPrompt:
      typeof generated.canvaPrompt === "string" ? generated.canvaPrompt : "",
    teacherNotes: readStringArray(generated.teacherNotes),
    suggestedDifficultyAdjustment:
      typeof generated.suggestedDifficultyAdjustment === "string"
        ? generated.suggestedDifficultyAdjustment
        : "If the child needs more support, reduce the number of words and add picture matching. If the child is ready for more, ask for a short speaking or writing task.",
    summary:
      typeof generated.summary === "string"
        ? generated.summary
        : `Saved ${row.output_type.toLowerCase()} for ${row.theme}.`,
    visualLayout: normalizeVisualLayout(generated.visualLayout, {
      title:
        typeof generated.title === "string"
          ? generated.title
          : `${titleCase(row.theme)} ${row.output_type}`,
      subtitle: row.subject,
      outputType: row.output_type,
      theme: row.theme,
      wordList: readStringArray(generated.wordList),
      sentences: readStringArray(generated.sentences),
      worksheetActivity: readStringArray(
        generated.worksheetActivity ?? generated.worksheetQuestions
      ),
      visualCardText: readStringArray(generated.visualCardText),
      canvaPrompt:
        typeof generated.canvaPrompt === "string" ? generated.canvaPrompt : "",
      teacherNotes: readStringArray(generated.teacherNotes)
    })
  };
}

function normalizeVisualLayout(
  value: unknown,
  fallback: {
    title: string;
    subtitle: string;
    outputType: string;
    theme: string;
    wordList: string[];
    sentences: string[];
    worksheetActivity: string[];
    visualCardText: string[];
    canvaPrompt: string;
    teacherNotes: string[];
  }
): MaterialVisualLayout {
  const existing = (value ?? {}) as Partial<MaterialVisualLayout>;
  const outputType = fallback.outputType.toLowerCase();
  const kind: MaterialVisualLayout["kind"] =
    existing.kind ||
    (outputType === "worksheet"
      ? "worksheet"
      : outputType === "flashcards"
        ? "visual-cards"
      : outputType === "visual cards"
        ? "visual-cards"
        : outputType === "classroom poster"
          ? "poster"
        : outputType === "poster content"
          ? "poster"
        : outputType === "social story"
          ? "social-story"
        : outputType === "behaviour worksheet"
          ? "behaviour-worksheet"
          : outputType === "matching activity"
            ? "matching-activity"
            : outputType === "cut and paste activity"
              ? "cut-paste"
              : outputType === "colouring sheet"
                ? "colouring-sheet"
                : outputType === "routine chart"
                  ? "routine-chart"
                  : outputType === "behaviour chart"
                    ? "behaviour-chart"
                    : outputType === "reward chart"
                      ? "reward-chart"
              : outputType === "song or chant"
                ? "song-chant"
                : outputType === "song poster"
                  ? "song-chant"
                : outputType === "canva prompt"
                  ? "canva-prompt"
                  : "word-list");

  const cards: MaterialVisualCard[] = Array.isArray(existing.cards)
    ? existing.cards.reduce<MaterialVisualCard[]>((acc, card) => {
        const item = card as Partial<MaterialVisualCard>;
        if (!item.title) return acc;
        acc.push({
          emoji: typeof item.emoji === "string" ? item.emoji : "🌟",
          title: String(item.title),
          subtitle:
            typeof item.subtitle === "string" ? item.subtitle : undefined,
          body: typeof item.body === "string" ? item.body : undefined
        });
        return acc;
      }, [])
    : [];

  const sections: MaterialVisualSection[] = Array.isArray(existing.sections)
    ? existing.sections.reduce<MaterialVisualSection[]>((acc, section) => {
        const item = section as Partial<MaterialVisualSection>;
        if (!item.heading) return acc;
        acc.push({
          heading: String(item.heading),
          lines: ensureStringArray(item.lines)
        });
        return acc;
      }, [])
    : [];

  if (cards.length > 0 || sections.length > 0) {
    return {
      kind,
      title:
        typeof existing.title === "string" ? existing.title : fallback.title,
      subtitle:
        typeof existing.subtitle === "string"
          ? existing.subtitle
          : fallback.subtitle,
      instructions:
        typeof existing.instructions === "string"
          ? existing.instructions
          : undefined,
      cards,
      sections
    };
  }

  return {
    kind,
    title: fallback.title,
    subtitle: fallback.subtitle,
    instructions:
      kind === "worksheet"
        ? "Read the directions, then circle, match, or write your answers."
        : "Point, say, read, and practice together.",
    cards:
      kind === "poster"
        ? [
            {
              emoji: "🌈",
              title: fallback.theme || fallback.title,
              subtitle: "Key ideas for the classroom"
            }
          ]
        : kind === "song-chant"
          ? fallback.sentences.map((line, index) => ({
              emoji: index % 2 === 0 ? "👏" : "🎵",
              title: line,
              subtitle: "Clap and say it together."
            }))
          : kind === "social-story"
            ? fallback.sentences.map((line, index) => ({
                emoji: ["👋", "👀", "🧠", "🤝", "😊", "🌟"][index % 6],
                title: `Step ${index + 1}`,
                subtitle: line
              }))
            : kind === "behaviour-worksheet"
              ? [
                  {
                    emoji: "✅",
                    title: "Expected",
                    subtitle: fallback.sentences[0] || "I use kind hands."
                  },
                  {
                    emoji: "❌",
                    title: "Unexpected",
                    subtitle:
                      fallback.worksheetActivity[0] || "I do not grab or shout."
                  },
                  {
                    emoji: "💭",
                    title: "Think",
                    subtitle: "How do I help my body feel calm?"
                  },
                  {
                    emoji: "🫶",
                    title: "Do",
                    subtitle: "Stop, breathe, and choose a calm action."
                  }
                ]
              : kind === "canva-prompt"
                ? fallback.wordList.map((word, index) => ({
                    emoji: emojiForWord(word, fallback.theme),
                    title: titleCase(word),
                    subtitle: sentenceForWord(word, fallback.sentences[index])
                  }))
                : kind === "visual-cards" || kind === "word-list"
                  ? fallback.wordList.map((word, index) => ({
                      emoji: emojiForWord(word, fallback.theme),
                      title: titleCase(word),
                      subtitle: sentenceForWord(word, fallback.sentences[index])
                    }))
                  : [],
    sections:
      kind === "worksheet"
        ? [
            {
              heading: "Instructions",
              lines: ["Say the word, look carefully, then complete the activity."]
            },
            {
              heading: "Activities",
              lines:
                fallback.worksheetActivity.length > 0
                  ? fallback.worksheetActivity
                  : ["Circle the correct word.", "Write one simple answer."]
            }
          ]
        : kind === "matching-activity"
          ? [
              {
                heading: "Match It",
                lines: [
                  "Match the picture to the word.",
                  "Point to the same ending sound.",
                  "Say the word after matching."
                ]
              }
            ]
          : kind === "cut-paste"
            ? [
                {
                  heading: "Cut And Paste",
                  lines: [
                    "Cut out the cards.",
                    "Paste them under the correct heading.",
                    "Say each word after pasting."
                  ]
                }
              ]
            : kind === "colouring-sheet"
              ? [
                  {
                    heading: "Colour And Talk",
                    lines: [
                      "Colour the big picture.",
                      "Point to the target word.",
                      "Say one short sentence."
                    ]
                  }
                ]
              : kind === "routine-chart"
                ? [
                    {
                      heading: "Routine Steps",
                      lines: fallback.wordList.length > 0
                        ? fallback.wordList.slice(0, 6).map((word) => titleCase(word))
                        : ["Wash Hands", "Snack Time", "Reading", "Play Time", "Clean Up", "Home Time"]
                    }
                  ]
                : kind === "behaviour-chart"
                  ? [
                      {
                        heading: "Check In",
                        lines: ["Expected behaviour", "How friends feel", "What to do next"]
                      }
                    ]
                  : kind === "reward-chart"
                    ? [
                        {
                          heading: "Reward Goals",
                          lines: ["I try", "I wait", "I listen", "I finish"]
                        }
                      ]
        : kind === "poster"
          ? [
              {
                heading: "Key Points",
                lines:
                  fallback.sentences.length > 0
                    ? fallback.sentences.slice(0, 5)
                    : fallback.teacherNotes.slice(0, 5)
              }
            ]
          : kind === "canva-prompt"
            ? [
                {
                  heading: "Sample Canva Prompt",
                  lines: [fallback.canvaPrompt]
                }
              ]
            : kind === "song-chant"
              ? [
                  {
                    heading: "Action Prompts",
                    lines: [
                      "Clap on each key word.",
                      "Point to the picture.",
                      "March, wave, or tap together."
                    ]
                  }
                ]
              : kind === "behaviour-worksheet"
                ? [
                    {
                      heading: "Feel / Think / Do",
                      lines: [
                        "Feel: How does my body feel?",
                        "Think: What is the safe choice?",
                        "Do: What calm action can I try?"
                      ]
                    }
                  ]
                : kind === "social-story"
                  ? [
                      {
                        heading: "Story Reminder",
                        lines:
                          fallback.teacherNotes.length > 0
                            ? fallback.teacherNotes.slice(0, 2)
                            : ["Read each step slowly and point to the icon."]
                      }
                    ]
                  : [
                      {
                        heading: "Teacher Notes",
                        lines:
                          fallback.teacherNotes.length > 0
                            ? fallback.teacherNotes
                            : ["Use the cards one at a time."]
                      }
                    ]
  };
}
