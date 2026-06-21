export const studentLevelOptions = [
  "Level 1",
  "Level 1.5",
  "Level 2",
  "Level 2.5",
  "Level 3"
] as const;

export type StudentLevel = (typeof studentLevelOptions)[number];

export type StudentLevelProfile = {
  level: StudentLevel;
  label: string;
  learnerSnapshot: string;
  vocabularyGuidance: string;
  sentenceGuidance: string;
  activityGuidance: string;
  teacherScriptGuidance: string;
  printableGuidance: string;
  outputNotes: string[];
};

const profiles: Record<StudentLevel, StudentLevelProfile> = {
  "Level 1": {
    level: "Level 1",
    label: "Level 1",
    learnerSnapshot: "Single words, one-step tasks, large visuals, heavy modelling.",
    vocabularyGuidance: "Use only concrete everyday words with clear picture support.",
    sentenceGuidance: "Use single words or very short repeated models.",
    activityGuidance: "Use one-step activities with immediate prompting and success.",
    teacherScriptGuidance: "Use short cue lines such as look, point, say, and wait.",
    printableGuidance: "Use large visuals, very little text, and one task per section.",
    outputNotes: [
      "Use one-step instructions only.",
      "Keep page layout open with large picture cues.",
      "Model each response before asking the child."
    ]
  },
  "Level 1.5": {
    level: "Level 1.5",
    label: "Level 1.5",
    learnerSnapshot: "Two-word phrases, matching activities, repeated routines.",
    vocabularyGuidance: "Use simple focus words and two-word phrase models.",
    sentenceGuidance: "Use short repeated phrase patterns with picture matching.",
    activityGuidance: "Use matching, pointing, sorting, and simple turn-taking.",
    teacherScriptGuidance: "Use short paired phrases such as my turn, your turn.",
    printableGuidance: "Use large visuals with matching boxes and simple tracing.",
    outputNotes: [
      "Offer matching and sorting supports.",
      "Use two-word phrase models.",
      "Keep tasks short with visual repetition."
    ]
  },
  "Level 2": {
    level: "Level 2",
    label: "Level 2",
    learnerSnapshot: "Simple sentences, small-group activities, early participation.",
    vocabularyGuidance: "Use simple familiar words plus one or two new target words.",
    sentenceGuidance: "Use short complete sentences that can be echoed aloud.",
    activityGuidance: "Use small-group tasks with clear turn-taking and shared attention.",
    teacherScriptGuidance: "Use calm short sentences with one clear action at a time.",
    printableGuidance: "Use simple worksheets with sentence strips and guided blanks.",
    outputNotes: [
      "Add simple sentence models.",
      "Use structured small-group routines.",
      "Give one idea to say and one idea to do."
    ]
  },
  "Level 2.5": {
    level: "Level 2.5",
    label: "Level 2.5",
    learnerSnapshot: "Short worksheets, multi-step tasks, supported independence.",
    vocabularyGuidance: "Use familiar vocabulary with a small challenge set.",
    sentenceGuidance: "Use short sentences and simple question prompts.",
    activityGuidance: "Use two-step or three-step tasks with guided independence.",
    teacherScriptGuidance: "Use slightly longer prompts, then fade support.",
    printableGuidance: "Use short worksheets, tracing, matching, and short writing.",
    outputNotes: [
      "Add short worksheet tasks.",
      "Allow a little independent work time.",
      "Use two-step classroom directions."
    ]
  },
  "Level 3": {
    level: "Level 3",
    label: "Level 3",
    learnerSnapshot: "Independent work, longer sentences, more complex classroom activities.",
    vocabularyGuidance: "Use clear classroom vocabulary with some descriptive detail.",
    sentenceGuidance: "Use longer simple sentences and short discussion prompts.",
    activityGuidance: "Use multi-step activities, independent work, and partner tasks.",
    teacherScriptGuidance: "Use classroom-style prompts with less repetition.",
    printableGuidance: "Use fuller worksheets, short writing, and more detailed tasks.",
    outputNotes: [
      "Include independent practice.",
      "Use longer sentence models.",
      "Add multi-step tasks and reflection."
    ]
  }
};

export function normalizeStudentLevel(value: string | null | undefined): StudentLevel {
  const lower = (value || "").trim().toLowerCase();

  if (lower === "level 1") return "Level 1";
  if (lower === "level 1.5" || lower === "1.5") return "Level 1.5";
  if (lower === "level 2") return "Level 2";
  if (lower === "level 2.5" || lower === "2.5") return "Level 2.5";
  if (lower === "level 3") return "Level 3";

  return "Level 1.5";
}

export function getStudentLevelProfile(value: string | null | undefined) {
  return profiles[normalizeStudentLevel(value)];
}
