import type { MaterialInsert, MaterialRow } from "@/lib/supabase/types";

export type ActivityIdeasFormValues = {
  query: string;
  theme: string;
  ageGroup: string;
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

  const activityIdeas: ActivityIdea[] = [
    {
      title: `${theme} Turn-Taking Tray`,
      type: "Simple game",
      description:
        "Children take turns picking, naming, and placing theme items with one-step support.",
      classroomSetup: "Use a small tray at table height with only 3–4 items visible.",
      printableMaterialSuggestion: "Turn card, mini labels, and picture choices."
    },
    {
      title: `${theme} Movement Match`,
      type: "Gross motor",
      description:
        "Teacher shows a picture or word card and children copy the matching action together.",
      classroomSetup: "Create a clear standing space with a visual boundary line.",
      printableMaterialSuggestion: "Action cards and a simple movement poster."
    },
    {
      title: `${theme} Sensory Explore Station`,
      type: "Sensory play",
      description:
        "Children explore themed textures or objects while practising request words and shared attention.",
      classroomSetup: "Offer one sensory bin with clear start and finish visuals.",
      printableMaterialSuggestion: "Sensory choice board and first-then strip."
    },
    {
      title: `${theme} Sticker Reward Mission`,
      type: "Motivation support",
      description:
        "Complete short tasks to earn stickers while practising the chosen focus skill.",
      classroomSetup: "Use a small reward board beside the main activity table.",
      printableMaterialSuggestion: "Reward chart and goal badge strip."
    }
  ];

  return {
    id: ideasId(),
    title: `${focus} Activity Ideas`,
    createdAt: formatNow(),
    form,
    summary: `A quick search pack for ${focus.toLowerCase()} with child-friendly activities for ${form.ageGroup || "young learners"}.`,
    activityIdeas,
    classroomSetupIdeas: [
      "Keep visual clutter low and only place one task in view at a time.",
      "Use a first-then card and a clear finish basket.",
      "Prepare both seated and movement options for regulation."
    ],
    printableSuggestions: [
      "Mini visual cards",
      "Routine strip",
      "Matching board",
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
    student_level: result.form.ageGroup || "2-5",
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
        typeof input.ageGroup === "string" ? input.ageGroup : row.student_level,
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
