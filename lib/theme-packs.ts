import {
  generateMaterial,
  type GeneratedMaterial,
  type MaterialFormValues
} from "@/lib/material-generator";
import {
  generateTeachingPlan,
  type GeneratedTeachingPlan,
  type TeachingPlanFormValues
} from "@/lib/teaching-plan";
import { getStudentLevelProfile, normalizeStudentLevel } from "@/lib/student-level-engine";
import type { MaterialInsert, MaterialRow } from "@/lib/supabase/types";

export type ThemePackFormValues = {
  packName: string;
  theme: string;
  ageGroup: string;
  studentLevel: string;
  additionalNotes: string;
};

export type ThemePackDefinition = {
  name: string;
  theme: string;
  subject: string;
  skillFocus: string;
  planGoal: string;
  studentAbility: string;
  parentFocus: string;
};

export type GeneratedThemePack = {
  id: string;
  title: string;
  createdAt: string;
  form: ThemePackFormValues;
  summary: string;
  teachingPlan: GeneratedTeachingPlan;
  worksheet: GeneratedMaterial;
  flashcards: GeneratedMaterial;
  classroomPoster: GeneratedMaterial;
  socialStory: GeneratedMaterial;
  parentCommunicationNote: string;
};

const STORAGE_KEYS = {
  current: "materials-generator/current-theme-pack",
  draft: "materials-generator/draft-theme-pack-form"
} as const;

export const themePackOptions: ThemePackDefinition[] = [
  {
    name: "National Day",
    theme: "Malaysia National Day",
    subject: "Language and communication",
    skillFocus: "Words ending with -ing",
    planGoal: "Cohesive Play",
    studentAbility: "Joint attention, turn taking, and group participation",
    parentFocus: "Use the theme words during songs, flag play, and simple home routines."
  },
  {
    name: "Animals",
    theme: "Animals",
    subject: "Vocabulary and early science",
    skillFocus: "Animal names and actions",
    planGoal: "Communication",
    studentAbility: "Matching, labelling, and simple pretend play",
    parentFocus: "Name favourite animals together and copy one animal action at home."
  },
  {
    name: "Transport",
    theme: "Transport",
    subject: "Vocabulary and concepts",
    skillFocus: "Vehicle names and movement words",
    planGoal: "Following Instructions",
    studentAbility: "Movement imitation and picture matching",
    parentFocus: "Point out cars, buses, and bikes during outings using short labels."
  },
  {
    name: "Food",
    theme: "Food",
    subject: "Life skills and language",
    skillFocus: "Food words and choice making",
    planGoal: "Communication",
    studentAbility: "Requesting, sorting, and choice routines",
    parentFocus: "Offer two food choices and model simple words during mealtimes."
  },
  {
    name: "Feelings",
    theme: "Feelings",
    subject: "Social and emotional learning",
    skillFocus: "Emotion words",
    planGoal: "Emotional Regulation",
    studentAbility: "Emotion labelling and calming routines",
    parentFocus: "Use the same feeling words at home with face cues and calm body prompts."
  },
  {
    name: "Colours",
    theme: "Colours",
    subject: "Early concepts",
    skillFocus: "Colour naming and sorting",
    planGoal: "Joint Attention",
    studentAbility: "Pointing, matching, and simple sorting",
    parentFocus: "Find one colour each day at home and say it together."
  },
  {
    name: "Shapes",
    theme: "Shapes",
    subject: "Early concepts and fine motor",
    skillFocus: "Shape names and tracing",
    planGoal: "Fine Motor Skills",
    studentAbility: "Tracing, matching, and building",
    parentFocus: "Look for circles, squares, and triangles in the home environment."
  },
  {
    name: "Community Helpers",
    theme: "Community Helpers",
    subject: "Social studies and language",
    skillFocus: "People and jobs vocabulary",
    planGoal: "Social Interaction",
    studentAbility: "Pretend play and role matching",
    parentFocus: "Talk about helpers the child sees in daily life using short labels."
  },
  {
    name: "Hari Raya",
    theme: "Hari Raya",
    subject: "Culture and communication",
    skillFocus: "Celebration words and greetings",
    planGoal: "Cohesive Play",
    studentAbility: "Greeting practice, turn taking, and group routines",
    parentFocus: "Practise one greeting and one celebration word together at home."
  },
  {
    name: "Chinese New Year",
    theme: "Chinese New Year",
    subject: "Culture and communication",
    skillFocus: "Celebration words and colours",
    planGoal: "Joint Attention",
    studentAbility: "Matching symbols, greetings, and movement songs",
    parentFocus: "Use one greeting and point out red, gold, and lucky symbols at home."
  },
  {
    name: "Deepavali",
    theme: "Deepavali",
    subject: "Culture and communication",
    skillFocus: "Light, colour, and celebration words",
    planGoal: "Communication",
    studentAbility: "Vocabulary building and sensory exploration",
    parentFocus: "Talk about lights and colours together using one short phrase at a time."
  },
  {
    name: "Christmas",
    theme: "Christmas",
    subject: "Culture and communication",
    skillFocus: "Holiday words and song participation",
    planGoal: "Turn Taking",
    studentAbility: "Song actions, matching, and social routines",
    parentFocus: "Sing one short line together and point to holiday pictures at home."
  }
];

function formatNow(date = new Date()) {
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function packId() {
  return `PACK-${Date.now().toString().slice(-6)}`;
}

function titleCase(text: string) {
  return text
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getThemePackDefinition(name: string) {
  return (
    themePackOptions.find((pack) => pack.name === name) ??
    themePackOptions[0]
  );
}

function buildMaterialForm(
  pack: ThemePackDefinition,
  base: ThemePackFormValues,
  materialType: string,
  extraInstruction: string
): MaterialFormValues {
  return {
    theme: base.theme,
    subject: pack.subject,
    skillFocus: pack.skillFocus,
    studentLevel: base.studentLevel,
    materialType,
    outputType: materialType,
    language: "English",
    numberOfItems: materialType === "Flashcards" ? "6" : "4",
    difficulty: "Gentle",
    stylePreference: "Pastel, child-friendly, clear visuals",
    extraInstruction
  };
}

function buildTeachingPlanForm(
  pack: ThemePackDefinition,
  base: ThemePackFormValues
): TeachingPlanFormValues {
  return {
    theme: base.theme,
    ageGroup: base.ageGroup,
    studentLevel: base.studentLevel,
    studentAbility: pack.studentAbility,
    goal: pack.planGoal,
    duration: "30 minutes",
    groupSize: "Small group",
    materialsAvailable: "visual cards, music, theme objects, stickers",
    additionalNotes: base.additionalNotes || "Keep routines calm, clear, and repetitive."
  };
}

function buildParentNote(form: ThemePackFormValues, pack: ThemePackDefinition) {
  const level = getStudentLevelProfile(form.studentLevel);

  return [
    `This week we are learning about ${form.theme}.`,
    `Our classroom focus is ${pack.skillFocus.toLowerCase()} with ${level.label.toLowerCase()} supports.`,
    pack.parentFocus,
    `Teacher note: ${level.sentenceGuidance}`
  ].join(" ");
}

export function generateThemePack(form: ThemePackFormValues): GeneratedThemePack {
  const pack = getThemePackDefinition(form.packName);
  const level = getStudentLevelProfile(form.studentLevel);
  const teachingPlan = generateTeachingPlan(buildTeachingPlanForm(pack, form));
  const worksheet = generateMaterial(
    buildMaterialForm(
      pack,
      form,
      "Worksheet",
      `Create a simple worksheet for ${level.label} learners. ${form.additionalNotes}`
    )
  );
  const flashcards = generateMaterial(
    buildMaterialForm(
      pack,
      form,
      "Flashcards",
      `Create clear flashcards with large readable visuals for ${level.label}. ${form.additionalNotes}`
    )
  );
  const classroomPoster = generateMaterial(
    buildMaterialForm(
      pack,
      form,
      "Classroom Poster",
      `Create a display poster for group teaching and repetition for ${level.label}. ${form.additionalNotes}`
    )
  );
  const socialStory = generateMaterial(
    buildMaterialForm(
      pack,
      form,
      "Social Story",
      `Create a reassuring short social story for ${level.label}. ${form.additionalNotes}`
    )
  );

  return {
    id: packId(),
    title: `${pack.name} Theme Pack • ${level.label}`,
    createdAt: formatNow(),
    form: {
      ...form,
      theme: form.theme
    },
    summary: `A complete ${pack.name} bundle with a teaching plan, worksheet, flashcards, poster, social story, and parent note for ${level.label}.`,
    teachingPlan,
    worksheet,
    flashcards,
    classroomPoster,
    socialStory,
    parentCommunicationNote: buildParentNote(form, pack)
  };
}

export function saveCurrentThemePack(pack: GeneratedThemePack) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.current, JSON.stringify(pack));
}

export function getCurrentThemePack() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.current);
  return raw ? (JSON.parse(raw) as GeneratedThemePack) : null;
}

export function saveDraftThemePackForm(form: ThemePackFormValues) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(form));
}

export function getDraftThemePackForm() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.draft);
  return raw ? (JSON.parse(raw) as ThemePackFormValues) : null;
}

export function clearDraftThemePackForm() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.draft);
}

export function toThemePackInsert(pack: GeneratedThemePack): MaterialInsert {
  return {
    theme: pack.form.theme,
    subject: pack.form.packName,
    skill_focus: getThemePackDefinition(pack.form.packName).skillFocus,
    student_level: pack.form.studentLevel,
    output_type: "Theme Pack",
    language: "English",
    difficulty: "Bundle",
    input_data: {
      ...pack.form,
      resourceKind: "theme-pack"
    },
    generated_content: {
      resourceKind: "theme-pack",
      title: pack.title,
      createdAt: pack.createdAt,
      summary: pack.summary,
      teachingPlan: pack.teachingPlan,
      worksheet: pack.worksheet,
      flashcards: pack.flashcards,
      classroomPoster: pack.classroomPoster,
      socialStory: pack.socialStory,
      parentCommunicationNote: pack.parentCommunicationNote,
      isFavorite: false
    }
  };
}

export function fromThemePackRow(row: MaterialRow): GeneratedThemePack {
  const input = (row.input_data ?? {}) as Partial<ThemePackFormValues>;
  const generated = (row.generated_content ?? {}) as Record<string, unknown>;
  const pack = getThemePackDefinition(
    typeof input.packName === "string" ? input.packName : row.subject
  );

  return {
    id: row.id,
    title:
      typeof generated.title === "string"
        ? generated.title
        : `${titleCase(pack.name)} Theme Pack`,
    createdAt: row.created_at,
    form: {
      packName: typeof input.packName === "string" ? input.packName : pack.name,
      theme: typeof input.theme === "string" ? input.theme : row.theme,
      ageGroup: typeof input.ageGroup === "string" ? input.ageGroup : "",
      studentLevel:
        typeof input.studentLevel === "string"
          ? normalizeStudentLevel(input.studentLevel)
          : normalizeStudentLevel(row.student_level),
      additionalNotes:
        typeof input.additionalNotes === "string" ? input.additionalNotes : ""
    },
    summary:
      typeof generated.summary === "string"
        ? generated.summary
        : `Theme pack for ${row.theme}.`,
    teachingPlan: generated.teachingPlan as GeneratedTeachingPlan,
    worksheet: generated.worksheet as GeneratedMaterial,
    flashcards: generated.flashcards as GeneratedMaterial,
    classroomPoster: generated.classroomPoster as GeneratedMaterial,
    socialStory: generated.socialStory as GeneratedMaterial,
    parentCommunicationNote:
      typeof generated.parentCommunicationNote === "string"
        ? generated.parentCommunicationNote
        : ""
  };
}
