import type { MaterialInsert, MaterialRow } from "@/lib/supabase/types";

export type MaterialFormValues = {
  theme: string;
  subject: string;
  skillFocus: string;
  studentLevel: string;
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
  return [
    "Keep instructions short and model each word aloud before independent work.",
    `Use ${form.difficulty.toLowerCase()} pacing with gesture or picture support for ${form.studentLevel.toLowerCase()} learners.`,
    `Start with ${wordList.slice(0, 2).join(" and ")}, then add the remaining words after a quick success.`
  ];
}

function buildCanvaPrompt(form: MaterialFormValues, wordList: string[]) {
  return [
    "Create a calm pastel classroom resource for an Early Intervention Program teacher.",
    `Theme: ${form.theme}. Subject: ${form.subject}. Skill focus: ${form.skillFocus}.`,
    `Output type: ${form.outputType}. Student level: ${form.studentLevel}. Difficulty: ${form.difficulty}.`,
    `Include these focus words: ${wordList.join(", ")}.`,
    "Use simple icons, large readable text, soft cream, mint, blush, and sage colours, with lots of spacing and visual clarity."
  ].join(" ");
}

export function generateMaterial(form: MaterialFormValues): GeneratedMaterial {
  const count = clampItemCount(form.numberOfItems);
  const wordList = buildWordList(form, count);

  return {
    id: slugId(),
    title: `${titleCase(form.theme || "Classroom")} ${form.outputType}`,
    createdAt: formatNow(),
    form,
    wordList,
    sentences: buildSentences(wordList, form),
    worksheetActivity: buildWorksheetActivity(wordList, form),
    visualCardText: buildVisualCards(wordList, form),
    canvaPrompt: buildCanvaPrompt(form, wordList),
    teacherNotes: buildTeacherNotes(form, wordList),
    suggestedDifficultyAdjustment:
      "If the child needs more support, use 3 words first with picture choices. If the child is ready for a challenge, ask for one extra sentence using a target word.",
    summary: `Created ${count} ${form.skillFocus || "target"} items for ${form.studentLevel || "early learners"} in a ${form.difficulty.toLowerCase()} ${form.outputType.toLowerCase()} set around ${form.theme || "the chosen theme"}.`
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
    input_data: normalized.form,
    generated_content: {
      title: normalized.title,
      createdAt: normalized.createdAt,
      summary: normalized.summary,
      wordList: normalized.wordList,
      sentences: normalized.sentences,
      worksheetActivity: normalized.worksheetActivity,
      visualCardText: normalized.visualCardText,
      canvaPrompt: normalized.canvaPrompt,
      teacherNotes: normalized.teacherNotes,
      suggestedDifficultyAdjustment: normalized.suggestedDifficultyAdjustment
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
        typeof form.studentLevel === "string" ? form.studentLevel : "",
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
        : "Generated teaching content preview."
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
      studentLevel: row.student_level,
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
        : `Saved ${row.output_type.toLowerCase()} for ${row.theme}.`
  };
}
