export const formDefaults = {
  theme: "Malaysia National Day",
  subject: "Language and communication",
  skillFocus: "Words ending with -ing",
  studentLevel: "Level 1.5",
  materialType: "Classroom Poster",
  outputType: "Classroom Poster",
  language: "English",
  numberOfItems: "6",
  difficulty: "Gentle",
  stylePreference: "Minimal, pastel, picture-supported",
  extraInstruction:
    "Use simple high-frequency vocabulary, short model sentences, and clear visual cues."
};

export const blankFormDefaults = {
  theme: "",
  subject: "",
  skillFocus: "",
  studentLevel: "Level 1.5",
  materialType: "Worksheet",
  outputType: "Worksheet",
  language: "English",
  numberOfItems: "6",
  difficulty: "Gentle",
  stylePreference: "",
  extraInstruction: ""
};

/**
 * History filters keyed by resourceKind so every saved resource type maps to a
 * single, teacher-friendly category chip (instead of a mix of labels + slugs).
 */
export const historyFilters: Array<{ label: string; match: string }> = [
  { label: "All", match: "All" },
  { label: "Materials", match: "material" },
  { label: "Teaching Plans", match: "teaching-plan" },
  { label: "Theme Packs", match: "theme-pack" },
  { label: "Theme Planner", match: "theme-plan" },
  { label: "EIP Toolkit", match: "eip-toolkit" },
  { label: "Activity Ideas", match: "activity-ideas" }
];

/** Human-friendly labels for the resourceKind stored on each saved row. */
export const resourceKindLabels: Record<string, string> = {
  material: "Material",
  "teaching-plan": "Teaching Plan",
  "theme-plan": "Theme Planner",
  "theme-pack": "Theme Pack",
  "eip-toolkit": "EIP Toolkit",
  "activity-ideas": "Activity Ideas"
};
