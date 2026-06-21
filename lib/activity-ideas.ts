import type { MaterialInsert, MaterialRow } from "@/lib/supabase/types";
import {
  getStudentLevelProfile,
  normalizeStudentLevel
} from "@/lib/student-level-engine";

export type ActivityIdeasFormValues = {
  query: string;
  theme: string;
  ageGroup: string;
  studentLevel: string;
  focus: string;
  constraints: string;
};

export type ActivityIdea = {
  title: string;
  type: string;
  description: string;
  classroomSetup: string;
  printableMaterialSuggestion: string;
};

export type GeneratedActivityIdeas = {
  id: string;
  title: string;
  createdAt: string;
  form: ActivityIdeasFormValues;
  summary: string;
  activityIdeas: ActivityIdea[];
  classroomSetupIdeas: string[];
  printableSuggestions: string[];
};

const STORAGE_KEYS = {
  current: "materials-generator/current-ideas",
  draft: "materials-generator/draft-ideas-form"
} as const;

function formatNow(date = new Date()) {
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function ideasId() {
  return `IDEA-${Date.now().toString().slice(-6)}`;
}

export function generateActivityIdeas(
  form: ActivityIdeasFormValues
): GeneratedActivityIdeas {
  const theme = form.theme || "Classroom";
  const focus = form.focus || "Engagement";
  const level = getStudentLevelProfile(form.studentLevel);

  const activityIdeas: ActivityIdea[] = [
    {
      title: `${theme} Turn-Taking Tray`,
      type:
        level.level === "Level 1" || level.level === "Level 1.5"
          ? "Simple turn game"
          : level.level === "Level 3"
            ? "Partner tabletop task"
            : "Small-group game",
      description:
        level.level === "Level 1"
          ? "Children look, point, and pass one theme item with one-step support."
          : level.level === "Level 1.5"
            ? "Children take turns matching and naming one item using short phrase models."
            : level.level === "Level 2"
              ? "Children take turns picking, naming, and placing theme items in a small group."
              : level.level === "Level 2.5"
                ? "Children follow a short two-step turn routine using theme items and matching spaces."
                : "Children take turns leading the tray task, naming items, and checking peer responses.",
      classroomSetup:
        level.level === "Level 1"
          ? "Use a very small tray with 2 to 3 large items and one clear turn space."
          : "Use a small tray at table height with only a few visible items and a clear turn marker.",
      printableMaterialSuggestion:
        level.level === "Level 3"
          ? "Turn card, labels, response checklist, and short written prompt."
          : "Turn card, mini labels, and picture choices."
    },
    {
      title: `${theme} Movement Match`,
      type: level.level === "Level 3" ? "Movement challenge" : "Gross motor",
      description:
        level.level === "Level 1"
          ? "Teacher shows one picture card and children copy one matching action."
          : level.level === "Level 1.5"
            ? "Teacher shows a card and children match the action using two-word phrases."
            : level.level === "Level 2.5" || level.level === "Level 3"
              ? "Teacher leads a short action sequence and children copy, match, and respond."
              : "Teacher shows a picture or word card and children copy the matching action together.",
      classroomSetup:
        level.level === "Level 1"
          ? "Create one clear standing spot for each child with strong visual boundaries."
          : "Create a clear standing space with a visual boundary line.",
      printableMaterialSuggestion:
        level.level === "Level 2.5" || level.level === "Level 3"
          ? "Action cards, movement strip, and follow-the-sequence board."
          : "Action cards and a simple movement poster."
    },
    {
      title: `${theme} Sensory Explore Station`,
      type: "Sensory play",
      description:
        level.level === "Level 1"
          ? "Children explore one themed texture while practising look, touch, and choose."
          : level.level === "Level 3"
            ? "Children explore themed textures, answer short questions, and complete a simple follow-up task."
            : "Children explore themed textures or objects while practising request words and shared attention.",
      classroomSetup:
        level.level === "Level 2.5" || level.level === "Level 3"
          ? "Offer one sensory bin with a finish tray, matching mat, and one guided follow-up station."
          : "Offer one sensory bin with clear start and finish visuals.",
      printableMaterialSuggestion:
        level.level === "Level 1"
          ? "Sensory choice board and first-then strip."
          : "Sensory choice board, first-then strip, and simple matching mat."
    },
    {
      title: `${theme} Sticker Reward Mission`,
      type: "Motivation support",
      description:
        level.level === "Level 3"
          ? "Complete a short sequence of tasks to earn stickers while tracking progress independently."
          : "Complete short tasks to earn stickers while practising the chosen focus skill.",
      classroomSetup:
        level.level === "Level 1"
          ? "Use a tiny reward board with one clear target beside the activity table."
          : "Use a small reward board beside the main activity table.",
      printableMaterialSuggestion:
        level.level === "Level 2.5" || level.level === "Level 3"
          ? "Reward chart, goal badge strip, and mini completion checklist."
          : "Reward chart and goal badge strip."
    }
  ];

  return {
    id: ideasId(),
    title: `${focus} Activity Ideas • ${level.label}`,
    createdAt: formatNow(),
    form,
    summary: `A quick search pack for ${focus.toLowerCase()} with ${level.label.toLowerCase()} supports for ${form.ageGroup || "young learners"}.`,
    activityIdeas,
    classroomSetupIdeas: [
      `Level focus: ${level.learnerSnapshot}`,
      "Keep visual clutter low and only place one task in view at a time.",
      level.level === "Level 3"
        ? "Prepare a short independent follow-up space after the main task."
        : "Use a first-then card and a clear finish basket.",
      "Prepare both seated and movement options for regulation."
    ],
    printableSuggestions: [
      level.level === "Level 1" ? "Large visual cards" : "Mini visual cards",
      level.level === "Level 2.5" || level.level === "Level 3"
        ? "Short worksheet strip"
        : "Routine strip",
      level.level === "Level 1" ? "Picture choice board" : "Matching board",
      "Reward chart"
    ]
  };
}

export function saveCurrentIdeas(result: GeneratedActivityIdeas) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.current, JSON.stringify(result));
}

export function getCurrentIdeas() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.current);
  return raw ? (JSON.parse(raw) as GeneratedActivityIdeas) : null;
}

export function saveDraftIdeasForm(form: ActivityIdeasFormValues) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(form));
}

export function getDraftIdeasForm() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.draft);
  return raw ? (JSON.parse(raw) as ActivityIdeasFormValues) : null;
}

export function clearDraftIdeasForm() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.draft);
}

export function toActivityIdeasInsert(
  result: GeneratedActivityIdeas
): MaterialInsert {
  return {
    theme: result.form.theme || result.form.focus || "Ideas",
    subject: result.form.focus || "Activity Ideas",
    skill_focus: result.form.query,
    student_level: result.form.studentLevel || "Level 1.5",
    output_type: "Search Ideas",
    language: "English",
    difficulty: "Flexible",
    input_data: {
      ...result.form,
      resourceKind: "activity-ideas"
    },
    generated_content: {
      resourceKind: "activity-ideas",
      title: result.title,
      createdAt: result.createdAt,
      summary: result.summary,
      activityIdeas: result.activityIdeas,
      classroomSetupIdeas: result.classroomSetupIdeas,
      printableSuggestions: result.printableSuggestions,
      isFavorite: false
    }
  };
}

export function fromActivityIdeasRow(row: MaterialRow): GeneratedActivityIdeas {
  const input = (row.input_data ?? {}) as Partial<ActivityIdeasFormValues>;
  const generated = (row.generated_content ?? {}) as Record<string, unknown>;

  return {
    id: row.id,
    title:
      typeof generated.title === "string"
        ? generated.title
        : "Activity Ideas",
    createdAt: row.created_at,
    form: {
      query: typeof input.query === "string" ? input.query : row.skill_focus,
      theme: typeof input.theme === "string" ? input.theme : row.theme,
      ageGroup:
        typeof input.ageGroup === "string" ? input.ageGroup : "2-5",
      studentLevel:
        typeof input.studentLevel === "string"
          ? normalizeStudentLevel(input.studentLevel)
          : normalizeStudentLevel(row.student_level),
      focus: typeof input.focus === "string" ? input.focus : row.subject,
      constraints:
        typeof input.constraints === "string" ? input.constraints : ""
    },
    summary:
      typeof generated.summary === "string"
        ? generated.summary
        : `Activity idea pack for ${row.theme}.`,
    activityIdeas: Array.isArray(generated.activityIdeas)
      ? generated.activityIdeas
          .map((activity) => activity as ActivityIdea)
          .filter((activity) => typeof activity?.title === "string")
      : [],
    classroomSetupIdeas: Array.isArray(generated.classroomSetupIdeas)
      ? generated.classroomSetupIdeas.filter(
          (item): item is string => typeof item === "string"
        )
      : [],
    printableSuggestions: Array.isArray(generated.printableSuggestions)
      ? generated.printableSuggestions.filter(
          (item): item is string => typeof item === "string"
        )
      : []
  };
}
