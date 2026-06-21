import type { MaterialInsert, MaterialRow } from "@/lib/supabase/types";
import {
  getStudentLevelProfile,
  normalizeStudentLevel
} from "@/lib/student-level-engine";

export type ThemePlannerFormValues = {
  theme: string;
  ageGroup: string;
  studentLevel: string;
  duration: "1 Week" | "2 Weeks" | "4 Weeks";
  mainLearningGoals: string;
  classroomSize: string;
  additionalNotes: string;
};

export type ThemePlannerWeek = {
  weekLabel: string;
  focusTitle: string;
  learningGoals: string[];
  vocabularyFocus: string[];
  circleTimeActivity: string;
  teachingPlan: string;
  suggestedMaterials: string[];
  parentCommunicationFocus: string;
  sensoryActivities: string[];
  smallGroupActivities: string[];
  visualSupportsNeeded: string[];
  suggestedPrintableResources: string[];
  cooperativePlayActivities: string[];
  flashcardIdeas: string[];
  socialStoryIdeas: string[];
  behaviourSupportFocus: string;
  reviewActivities: string[];
  assessmentActivities: string[];
  parentCommunicationSummary: string;
  celebrationActivity: string;
  teacherPreparationChecklist: string[];
  classroomSetup: string;
  teacherTips: string[];
};

export type GeneratedThemePlan = {
  id: string;
  title: string;
  createdAt: string;
  form: ThemePlannerFormValues;
  summary: string;
  weeklyPlan: ThemePlannerWeek[];
};

const STORAGE_KEYS = {
  current: "materials-generator/current-theme-plan",
  draft: "materials-generator/draft-theme-plan-form"
} as const;

function formatNow(date = new Date()) {
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function plannerId() {
  return `THEME-${Date.now().toString().slice(-6)}`;
}

function titleCase(text: string) {
  return text
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getWeekCount(duration: ThemePlannerFormValues["duration"]) {
  if (duration === "1 Week") return 1;
  if (duration === "2 Weeks") return 2;
  return 4;
}

function parseGoals(text: string) {
  return text
    .split(/\n|,/)
    .map((item) => item.replace(/^\*\s*/, "").trim())
    .filter(Boolean);
}

function weekTitle(theme: string, week: number) {
  if (week === 1) return `${titleCase(theme)} Foundations`;
  if (week === 2) return `${titleCase(theme)} Exploration`;
  if (week === 3) return `${titleCase(theme)} Cooperative Learning`;
  return `${titleCase(theme)} Review And Celebration`;
}

export function generateThemePlan(
  form: ThemePlannerFormValues
): GeneratedThemePlan {
  const goals = parseGoals(form.mainLearningGoals);
  const weekCount = getWeekCount(form.duration);
  const level = getStudentLevelProfile(form.studentLevel);
  const weeklyPlan: ThemePlannerWeek[] = Array.from({ length: weekCount }, (_, index) =>
    buildWeekPlan(form, goals, index + 1, weekCount)
  );

  return {
    id: plannerId(),
    title: `${titleCase(form.theme || "Classroom")} Theme Planner • ${level.label}`,
    createdAt: formatNow(),
    form,
    summary: `${form.duration} roadmap for ${form.theme}, designed for ${form.ageGroup} learners at ${level.label}.`,
    weeklyPlan
  };
}

function buildWeekPlan(
  form: ThemePlannerFormValues,
  goals: string[],
  week: number,
  totalWeeks: number
): ThemePlannerWeek {
  const theme = form.theme || "Theme";
  const level = getStudentLevelProfile(form.studentLevel);
  const baseWords =
    theme.toLowerCase().includes("malaysia") || theme.toLowerCase().includes("national")
      ? ["flag", "march", "sing", "tower", "friend", "play"]
      : ["look", "match", "listen", "play", "share", "talk"];

  const rotatingGoals = goals.length > 0 ? goals : ["Communication", "Turn Taking"];
  const focusGoal = rotatingGoals[(week - 1) % rotatingGoals.length];

  return {
    weekLabel: `Week ${week}`,
    focusTitle: weekTitle(theme, week),
    learningGoals: rotatingGoals.slice(0, Math.min(3, rotatingGoals.length)),
    vocabularyFocus:
      level.level === "Level 1"
        ? baseWords.slice(0, 3)
        : level.level === "Level 3"
          ? baseWords.slice(0, 5)
          : baseWords.slice(0, 4),
    circleTimeActivity:
      week === 1
        ? level.level === "Level 1"
          ? `${titleCase(theme)} hello circle with large picture cards and one action song.`
          : `${titleCase(theme)} hello circle with picture cards and action songs.`
        : week === 2
          ? `Sensory circle using ${theme.toLowerCase()} objects, textures, or songs.`
          : week === 3
            ? `Cooperative circle game using turn cards and shared movement cues.`
            : `Review circle using flashcards, songs, and simple recall prompts.`,
    teachingPlan:
      week === 1
        ? level.level === "Level 3"
          ? "Introduce key theme words, model routines, and add a short independent follow-up."
          : "Introduce key theme words, model routines, and establish group expectations."
        : week === 2
          ? "Expand language through sensory tasks and small-group imitation."
          : week === 3
            ? "Build cooperative play and group attention through partner tasks."
            : "Review, assess, and celebrate progress across the theme.",
    suggestedMaterials:
      week === 1
        ? level.level === "Level 1"
          ? ["Large visual cards", "Song props", "Theme objects"]
          : ["Visual cards", "Song props", "Theme objects"]
        : week === 2
          ? ["Sensory tray", "Sorting mats", "Small manipulatives"]
        : week === 3
            ? ["Turn-taking cards", "Flashcards", "Social story cards"]
            : ["Assessment checklist", "Reward stickers", "Celebration props"],
    parentCommunicationFocus:
      week === 1
        ? level.level === "Level 1"
          ? "Share the new theme words and one simple home pointing activity."
          : "Share the new theme vocabulary and one home talking prompt."
        : week === 2
          ? "Suggest one sensory activity and one simple home routine idea."
        : week === 3
            ? "Encourage turn-taking games and shared play at home."
            : "Summarise progress, favourite activities, and next-step ideas.",
    sensoryActivities:
      week >= 2
        ? [
            `${titleCase(theme)} sensory tray with matching objects.`,
            level.level === "Level 3"
              ? "Texture search with simple request words and a short sorting follow-up."
              : "Texture search with simple request words."
          ]
        : ["Simple tactile warm-up with one focus object."],
    smallGroupActivities: [
      level.level === "Level 3"
        ? `Picture-to-object matching plus short recall for ${theme.toLowerCase()} vocabulary.`
        : `Picture-to-object matching for ${theme.toLowerCase()} vocabulary.`,
      `${focusGoal} tabletop game with visual turn cues.`
    ],
    visualSupportsNeeded: [
      "First-then board",
      "Turn card",
      "Choice board",
      level.level === "Level 3" ? "Simple task checklist" : "Visual schedule strip"
    ],
    suggestedPrintableResources:
      week === 1
        ? level.level === "Level 1"
          ? ["Theme poster", "Large visual cards", "Vocabulary mat"]
          : ["Theme poster", "Visual cards", "Vocabulary mat"]
        : week === 2
          ? level.level === "Level 2.5" || level.level === "Level 3"
            ? ["Sensory checklist", "Matching activity", "Short worksheet strip"]
            : ["Sensory checklist", "Matching activity", "Routine strip"]
          : week === 3
            ? ["Flashcards", "Social story", "Behaviour reminder chart"]
            : ["Assessment sheet", "Review game cards", "Celebration certificate"],
    cooperativePlayActivities:
      week >= 3
        ? [
            "Pass-and-share game with one theme object.",
            "Build together using blocks or large pieces."
          ]
        : ["Partner imitation game with movement cues."],
    flashcardIdeas:
      week >= 3
        ? level.level === "Level 1"
          ? ["Large theme flashcards", "Action flashcards", "Emotion cue flashcards"]
          : ["Theme vocabulary flashcards", "Action flashcards", "Emotion cue flashcards"]
        : ["Large picture cards with one focus word each."],
    socialStoryIdeas:
      week >= 3
        ? [
            level.level === "Level 1"
              ? `I play during ${theme.toLowerCase()}.`
              : `I play with my friends during ${theme.toLowerCase()}.`,
            level.level === "Level 3" ? "I wait, share, listen, and try again." : "I wait, share, and listen."
          ]
        : ["I join circle time.", "I look and listen."],
    behaviourSupportFocus:
      week === 1
        ? "Clear transitions, visual expectations, and short directions."
        : week === 2
          ? "Support regulation during sensory tasks with movement breaks."
          : week === 3
            ? "Prompt turn waiting, joint attention, and shared space."
            : "Use review prompts, praise, and calm transitions during assessment.",
    reviewActivities:
      week === totalWeeks
        ? level.level === "Level 3"
          ? ["Theme song review", "Word hunt review", "Picture match review", "Independent recap task"]
          : ["Theme song review", "Word hunt review", "Picture match review"]
        : ["Quick flashcard recap", "One-song warm-up review"],
    assessmentActivities:
      week === totalWeeks
        ? [
            "Observe vocabulary recognition.",
            "Check response to one-step directions.",
            "Note turn-taking and shared attention."
          ]
        : ["Informal observation during group activity."],
    parentCommunicationSummary:
      week === totalWeeks
        ? "Share favourite activities, progress notes, and one suggested home extension."
        : "Send one short weekly update with one skill highlight.",
    celebrationActivity:
      week === totalWeeks
        ? `${titleCase(theme)} mini celebration with song, stickers, and group display.`
        : "Simple finish activity with praise and sticker choice.",
    teacherPreparationChecklist: [
      `Level focus: ${level.printableGuidance}`,
      "Print visual supports and key resources.",
      "Prepare one sensory or movement option.",
      "Set up calm transition supports.",
      "Plan one easy and one advanced adaptation."
    ],
    classroomSetup:
      week === 1
        ? level.level === "Level 1"
          ? "Create a clear circle area, one table station, and a low-clutter display board with large visuals."
          : "Create a clear circle area, one table station, and a simple display board."
        : week === 2
          ? "Set up one sensory station and one visual matching table."
          : week === 3
            ? "Arrange a partner-play area with turn cues and shared materials."
            : "Prepare review stations and a small celebration display.",
    teacherTips: [
      level.teacherScriptGuidance,
      "Keep directions under one sentence when possible.",
      "Model first, then invite participation.",
      "Alternate active and seated tasks to support regulation."
    ]
  };
}

export function saveCurrentThemePlan(plan: GeneratedThemePlan) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.current, JSON.stringify(plan));
}

export function getCurrentThemePlan() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.current);
  return raw ? (JSON.parse(raw) as GeneratedThemePlan) : null;
}

export function saveDraftThemePlanForm(form: ThemePlannerFormValues) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(form));
}

export function getDraftThemePlanForm() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.draft);
  return raw ? (JSON.parse(raw) as ThemePlannerFormValues) : null;
}

export function clearDraftThemePlanForm() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.draft);
}

export function toThemePlanInsert(plan: GeneratedThemePlan): MaterialInsert {
  return {
    theme: plan.form.theme,
    subject: plan.form.mainLearningGoals,
    skill_focus: plan.form.classroomSize,
    student_level: plan.form.studentLevel,
    output_type: "Theme Planner",
    language: "English",
    difficulty: plan.form.duration,
    input_data: {
      ...plan.form,
      resourceKind: "theme-plan"
    },
    generated_content: {
      resourceKind: "theme-plan",
      title: plan.title,
      createdAt: plan.createdAt,
      summary: plan.summary,
      weeklyPlan: plan.weeklyPlan,
      isFavorite: false
    }
  };
}

export function fromThemePlanRow(row: MaterialRow): GeneratedThemePlan {
  const input = (row.input_data ?? {}) as Partial<ThemePlannerFormValues>;
  const generated = (row.generated_content ?? {}) as Record<string, unknown>;

  return {
    id: row.id,
    title:
      typeof generated.title === "string"
        ? generated.title
        : `${titleCase(row.theme)} Theme Planner`,
    createdAt: row.created_at,
    form: {
      theme: row.theme,
      ageGroup:
        typeof input.ageGroup === "string" ? input.ageGroup : "",
      studentLevel:
        typeof input.studentLevel === "string"
          ? normalizeStudentLevel(input.studentLevel)
          : normalizeStudentLevel(row.student_level),
      duration:
        typeof input.duration === "string"
          ? (input.duration as ThemePlannerFormValues["duration"])
          : "4 Weeks",
      mainLearningGoals:
        typeof input.mainLearningGoals === "string" ? input.mainLearningGoals : row.subject,
      classroomSize:
        typeof input.classroomSize === "string" ? input.classroomSize : "Small group",
      additionalNotes:
        typeof input.additionalNotes === "string" ? input.additionalNotes : ""
    },
    summary:
      typeof generated.summary === "string"
        ? generated.summary
        : `Theme plan for ${row.theme}.`,
    weeklyPlan: Array.isArray(generated.weeklyPlan)
      ? generated.weeklyPlan
          .map((week) => week as ThemePlannerWeek)
          .filter((week) => typeof week?.weekLabel === "string")
      : []
  };
}
