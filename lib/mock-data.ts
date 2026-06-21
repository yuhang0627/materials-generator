export type MaterialRecord = {
  id: string;
  title: string;
  theme: string;
  subject: string;
  outputType: string;
  language: string;
  level: string;
  status: "Ready" | "Draft";
  createdAt: string;
  description: string;
};

export const dashboardStats = [
  { label: "Materials Created", value: "128", note: "This month" },
  { label: "Ready to Reuse", value: "36", note: "Saved favourites" },
  { label: "Student Profiles", value: "12", note: "Sample profiles" },
  { label: "Avg. Prep Time", value: "18 min", note: "With templates" }
];

export const quickTemplates = [
  {
    title: "Feelings Visual Cards",
    description: "Emotion cards with clear labels and soft guidance prompts.",
    tag: "Visual cards"
  },
  {
    title: "Simple Morning Routine",
    description: "Step-by-step visual support for transitions and independence.",
    tag: "Social story"
  },
  {
    title: "CVC Word Practice",
    description: "Short phonics worksheet with tracing and matching tasks.",
    tag: "Worksheet"
  }
];

export const recentMaterials: MaterialRecord[] = [
  {
    id: "MAT-201",
    title: "Ocean Feelings Word List",
    theme: "Ocean",
    subject: "Language",
    outputType: "Word list",
    language: "English",
    level: "Emerging readers",
    status: "Ready",
    createdAt: "Today, 10:15 AM",
    description: "12 emotional vocabulary words with picture cue ideas."
  },
  {
    id: "MAT-198",
    title: "My Calm Body Worksheet",
    theme: "Self-regulation",
    subject: "Life skills",
    outputType: "Behaviour worksheet",
    language: "English",
    level: "Primary support",
    status: "Ready",
    createdAt: "Yesterday",
    description: "Breathing, body check-in, and colour-in calm choices."
  },
  {
    id: "MAT-193",
    title: "Community Helpers Poster",
    theme: "Community",
    subject: "Social studies",
    outputType: "Poster content",
    language: "English",
    level: "Beginner",
    status: "Draft",
    createdAt: "Jun 18",
    description: "Short poster copy with icons and sentence starters."
  }
];

export const formDefaults = {
  theme: "Malaysia National Day",
  subject: "Language and communication",
  skillFocus: "Words ending with -ing",
  studentLevel: "Early primary",
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
  studentLevel: "",
  materialType: "Worksheet",
  outputType: "Worksheet",
  language: "English",
  numberOfItems: "6",
  difficulty: "Gentle",
  stylePreference: "",
  extraInstruction: ""
};

export const historyFilters = [
  "All",
  "Classroom Poster",
  "Worksheet",
  "Visual cards",
  "Behaviour worksheet",
  "Song Poster",
  "Teaching Plan",
  "Theme Planner",
  "theme-plan",
  "activity-ideas"
];
