import type { MaterialInsert, MaterialRow } from "@/lib/supabase/types";

export type TeachingPlanFormValues = {
  theme: string;
  ageGroup: string;
  studentAbility: string;
  goal: string;
  duration: string;
  groupSize: string;
  materialsAvailable: string;
  additionalNotes: string;
};

export type TeachingPlanActivity = {
  title: string;
  objective: string;
  materials: string[];
  duration: string;
  setup: string;
  teacherScript: string;
  expectedStudentResponse: string[];
  adaptationIdeas: string[];
  behaviourSupportStrategies: string[];
  transitionSuggestion: string;
  easyVersion: string;
  mediumVersion: string;
  advancedVersion: string;
};

export type GeneratedTeachingPlan = {
  id: string;
  title: string;
  createdAt: string;
  form: TeachingPlanFormValues;
  summary: string;
  setupNotes: string[];
  activities: TeachingPlanActivity[];
};

const STORAGE_KEYS = {
  current: "materials-generator/current-plan",
  draft: "materials-generator/draft-plan-form"
} as const;

function formatNow(date = new Date()) {
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function planId() {
  return `PLAN-${Date.now().toString().slice(-6)}`;
}

function titleCase(text: string) {
  return text
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function baseActivityTitles(theme: string) {
  const lower = theme.toLowerCase();

  if (lower.includes("malaysia") || lower.includes("national day") || lower.includes("merdeka")) {
    return [
      "Flag Pass Circle",
      "Malaysia Dance Together",
      "Build Petronas Towers",
      "Flag Colour Hunt"
    ];
  }

  if (lower.includes("ocean")) {
    return [
      "Shell Pass Circle",
      "Fish Match Dance",
      "Build a Blue Sea",
      "Treasure Hunt Sorting"
    ];
  }

  return [
    `${titleCase(theme || "Theme")} Warm-Up Circle`,
    `${titleCase(theme || "Theme")} Move Together`,
    `${titleCase(theme || "Theme")} Build and Play`,
    `${titleCase(theme || "Theme")} Calm Finish`
  ];
}

export function generateTeachingPlan(
  form: TeachingPlanFormValues
): GeneratedTeachingPlan {
  const titles = baseActivityTitles(form.theme);
  const durations = splitDuration(form.duration);

  const activities: TeachingPlanActivity[] = titles.slice(0, 4).map((title, index) => ({
    title,
    objective:
      index === 0
        ? "Turn Taking"
        : index === 1
          ? "Joint Attention"
          : index === 2
            ? "Cooperative Play"
            : form.goal,
    materials: pickMaterials(form.materialsAvailable, index),
    duration: durations[index] || "5 minutes",
    setup:
      index === 0
        ? "Sit in a small circle with one clear visual item in the middle."
        : index === 1
          ? "Stand with enough space to move and copy simple actions."
          : index === 2
            ? "Place building or matching materials in the centre for shared access."
            : "Prepare a simple table activity with one-step instructions.",
    teacherScript:
      index === 0
        ? `"Let's pass it to our friend. My turn, your turn."`
        : index === 1
          ? `"Look at me. We move together. Ready, go."`
          : index === 2
            ? `"Let's build together. You do one, I do one."`
            : `"Let's finish together. First this, then all done."`,
    expectedStudentResponse: [
      "Looks at the material or teacher.",
      "Waits briefly for a turn with support.",
      "Joins the activity with gesture, word, or action."
    ],
    adaptationIdeas: [
      "Use a smaller group and shorter turns for children who need more support.",
      "Add a visual choice board or first-then card.",
      "Reduce language and model the action before asking."
    ],
    behaviourSupportStrategies: [
      "Offer clear turn cues and immediate praise.",
      "Use a calm body reminder and a visual timer.",
      "Keep materials limited to reduce overload."
    ],
    transitionSuggestion:
      "Sing a short transition line and show the next activity card.",
    easyVersion: "Use hand-over-hand support or one-step imitation only.",
    mediumVersion: "Encourage one independent action or one clear verbal response.",
    advancedVersion: "Add peer interaction, longer wait time, or a second instruction."
  }));

  return {
    id: planId(),
    title: `${titleCase(form.theme || "Classroom")} Teaching Plan`,
    createdAt: formatNow(),
    form,
    summary: `A ${form.duration.toLowerCase()} Early Intervention Program teaching plan focused on ${form.goal.toLowerCase()} for ${form.ageGroup.toLowerCase()} learners.`,
    setupNotes: [
      "Prepare visual cues before the session starts.",
      "Keep language short and concrete.",
      "Alternate active and seated tasks to support regulation."
    ],
    activities
  };
}

function pickMaterials(text: string, index: number) {
  const cleaned = text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (cleaned.length > 0) {
    return cleaned.slice(0, Math.min(cleaned.length, 3));
  }

  const defaults = [
    ["Small flags", "Visual turn card"],
    ["Music speaker", "Movement cards"],
    ["Blocks", "Tower picture card"],
    ["Colour cards", "Reward stickers"]
  ];

  return defaults[index] || ["Picture cards"];
}

function splitDuration(duration: string) {
  const total = Number.parseInt(duration, 10);

  if (Number.isNaN(total) || total <= 0) {
    return ["5 minutes", "8 minutes", "10 minutes", "5 minutes"];
  }

  const part = Math.max(4, Math.floor(total / 4));
  return Array.from({ length: 4 }, (_, index) =>
    `${index === 3 ? total - part * 3 : part} minutes`
  );
}

export function saveCurrentPlan(plan: GeneratedTeachingPlan) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.current, JSON.stringify(plan));
}

export function getCurrentPlan() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.current);
  return raw ? (JSON.parse(raw) as GeneratedTeachingPlan) : null;
}

export function saveDraftPlanForm(form: TeachingPlanFormValues) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(form));
}

export function getDraftPlanForm() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.draft);
  return raw ? (JSON.parse(raw) as TeachingPlanFormValues) : null;
}

export function clearDraftPlanForm() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.draft);
}

export function toTeachingPlanInsert(
  plan: GeneratedTeachingPlan
): MaterialInsert {
  return {
    theme: plan.form.theme,
    subject: plan.form.goal,
    skill_focus: plan.form.studentAbility,
    student_level: plan.form.ageGroup,
    output_type: "Teaching Plan",
    language: "English",
    difficulty: "Teacher Guided",
    input_data: {
      ...plan.form,
      resourceKind: "teaching-plan"
    },
    generated_content: {
      resourceKind: "teaching-plan",
      title: plan.title,
      createdAt: plan.createdAt,
      summary: plan.summary,
      setupNotes: plan.setupNotes,
      activities: plan.activities,
      isFavorite: false
    }
  };
}

export function fromTeachingPlanRow(row: MaterialRow): GeneratedTeachingPlan {
  const input = (row.input_data ?? {}) as Partial<TeachingPlanFormValues>;
  const generated = (row.generated_content ?? {}) as Record<string, unknown>;

  return {
    id: row.id,
    title:
      typeof generated.title === "string"
        ? generated.title
        : `${titleCase(row.theme)} Teaching Plan`,
    createdAt: row.created_at,
    form: {
      theme: row.theme,
      ageGroup:
        typeof input.ageGroup === "string" ? input.ageGroup : row.student_level,
      studentAbility:
        typeof input.studentAbility === "string" ? input.studentAbility : row.skill_focus,
      goal: typeof input.goal === "string" ? input.goal : row.subject,
      duration: typeof input.duration === "string" ? input.duration : "30 minutes",
      groupSize: typeof input.groupSize === "string" ? input.groupSize : "Small group",
      materialsAvailable:
        typeof input.materialsAvailable === "string"
          ? input.materialsAvailable
          : "",
      additionalNotes:
        typeof input.additionalNotes === "string" ? input.additionalNotes : ""
    },
    summary:
      typeof generated.summary === "string"
        ? generated.summary
        : `Teaching plan for ${row.theme}.`,
    setupNotes: Array.isArray(generated.setupNotes)
      ? generated.setupNotes.filter((item): item is string => typeof item === "string")
      : [],
    activities: Array.isArray(generated.activities)
      ? generated.activities
          .map((activity) => activity as TeachingPlanActivity)
          .filter((activity) => typeof activity?.title === "string")
      : []
  };
}
