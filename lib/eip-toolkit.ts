import {
  generateMaterial,
  normalizeGeneratedMaterial,
  type GeneratedMaterial,
  type MaterialFormValues
} from "@/lib/material-generator";
import { normalizeStudentLevel } from "@/lib/student-level-engine";
import type { MaterialInsert, MaterialRow } from "@/lib/supabase/types";

export const toolkitResourceOptions = [
  "Social Story",
  "Behaviour Chart",
  "Reward Chart",
  "Token Board",
  "Visual Schedule",
  "First Then Board",
  "Classroom Rules Poster",
  "Emotion Board"
] as const;

export const socialStoryExamples = [
  "Waiting Turn",
  "Sharing Toys",
  "Lining Up",
  "Toilet Routine",
  "Snack Time",
  "Circle Time",
  "Going Home"
] as const;

export type ToolkitResourceType = (typeof toolkitResourceOptions)[number];

export type EipToolkitFormValues = {
  resourceType: ToolkitResourceType;
  scenario: string;
  theme: string;
  ageGroup: string;
  studentLevel: string;
  additionalNotes: string;
};

export type GeneratedToolkitResource = {
  id: string;
  title: string;
  createdAt: string;
  form: EipToolkitFormValues;
  summary: string;
  material: GeneratedMaterial;
};

const STORAGE_KEYS = {
  current: "materials-generator/current-eip-toolkit",
  draft: "materials-generator/draft-eip-toolkit-form"
} as const;

function formatNow(date = new Date()) {
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function toolkitId() {
  return `TOOL-${Date.now().toString().slice(-6)}`;
}

function buildToolkitMaterialForm(form: EipToolkitFormValues): MaterialFormValues {
  const base: MaterialFormValues = {
    theme: form.theme || form.scenario || form.resourceType,
    subject: "Early Intervention Program Toolkit",
    skillFocus: form.scenario || form.resourceType,
    studentLevel: form.studentLevel,
    materialType: "Worksheet",
    outputType: form.resourceType,
    language: "English",
    numberOfItems: "4",
    difficulty: "Gentle",
    stylePreference: "Pastel, child-friendly, calm, printable",
    extraInstruction: form.additionalNotes
  };

  if (form.resourceType === "Social Story") {
    return {
      ...base,
      theme: form.scenario || "Social Story",
      subject: "Social understanding",
      materialType: "Social Story",
      outputType: "Social Story",
      numberOfItems: "4",
      extraInstruction: `Create a simple social story about ${form.scenario}. Include visual placeholders and predictable wording. ${form.additionalNotes}`
    };
  }

  if (form.resourceType === "Behaviour Chart") {
    return {
      ...base,
      subject: "Behaviour support",
      materialType: "Behaviour Chart",
      outputType: "Behaviour Chart",
      extraInstruction: `Create a child-friendly behaviour chart with expected routines, simple icons, and clear praise spaces. ${form.additionalNotes}`
    };
  }

  if (form.resourceType === "Reward Chart") {
    return {
      ...base,
      subject: "Motivation support",
      materialType: "Reward Chart",
      outputType: "Reward Chart",
      extraInstruction: `Create a pastel reward chart with clear token spaces and simple encouragement wording. ${form.additionalNotes}`
    };
  }

  if (form.resourceType === "Token Board") {
    return {
      ...base,
      subject: "Token support",
      materialType: "Reward Chart",
      outputType: "Token Board",
      numberOfItems: "5",
      extraInstruction: `Create a token board with five clear token spaces, one reward box, and minimal wording. ${form.additionalNotes}`
    };
  }

  if (form.resourceType === "Visual Schedule") {
    return {
      ...base,
      subject: "Routine support",
      materialType: "Routine Chart",
      outputType: "Visual Schedule",
      extraInstruction: `Create a visual schedule with clear morning-to-home routine steps and picture placeholders. ${form.additionalNotes}`
    };
  }

  if (form.resourceType === "First Then Board") {
    return {
      ...base,
      subject: "Transition support",
      materialType: "Routine Chart",
      outputType: "First Then Board",
      numberOfItems: "2",
      extraInstruction: `Create a simple first-then board with large visual placeholders and low text load. ${form.additionalNotes}`
    };
  }

  if (form.resourceType === "Classroom Rules Poster") {
    return {
      ...base,
      subject: "Classroom expectations",
      materialType: "Classroom Poster",
      outputType: "Classroom Rules Poster",
      numberOfItems: "4",
      extraInstruction: `Create a classroom rules poster with short positive rule statements and child-friendly visuals. ${form.additionalNotes}`
    };
  }

  return {
    ...base,
    subject: "Emotion support",
    materialType: "Visual Cards",
    outputType: "Emotion Board",
    numberOfItems: "6",
    extraInstruction: `Create an emotion board with calm feeling labels, mirror cues, and visual placeholders. ${form.additionalNotes}`
  };
}

export function generateToolkitResource(form: EipToolkitFormValues): GeneratedToolkitResource {
  const material = generateMaterial(buildToolkitMaterialForm(form));

  return {
    id: toolkitId(),
    title: `${form.resourceType} • ${form.scenario || form.theme || "Toolkit Resource"}`,
    createdAt: formatNow(),
    form,
    summary: `Printable ${form.resourceType.toLowerCase()} resource for ${form.studentLevel} learners with teacher notes and visual placeholders.`,
    material
  };
}

export function saveCurrentToolkitResource(resource: GeneratedToolkitResource) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.current, JSON.stringify(resource));
}

export function getCurrentToolkitResource() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.current);
  return raw ? (JSON.parse(raw) as GeneratedToolkitResource) : null;
}

export function saveDraftToolkitForm(form: EipToolkitFormValues) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(form));
}

export function getDraftToolkitForm() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.draft);
  return raw ? (JSON.parse(raw) as EipToolkitFormValues) : null;
}

export function clearDraftToolkitForm() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.draft);
}

export function toToolkitInsert(resource: GeneratedToolkitResource): MaterialInsert {
  const material = normalizeGeneratedMaterial(resource.material);

  return {
    theme: material.form.theme,
    subject: resource.form.resourceType,
    skill_focus: resource.form.scenario || material.form.skillFocus,
    student_level: resource.form.studentLevel,
    output_type: resource.form.resourceType,
    language: material.form.language,
    difficulty: material.form.difficulty,
    input_data: {
      ...resource.form,
      resourceKind: "eip-toolkit"
    },
    generated_content: {
      resourceKind: "eip-toolkit",
      title: resource.title,
      createdAt: resource.createdAt,
      summary: resource.summary,
      material,
      isFavorite: false
    }
  };
}

export function fromToolkitRow(row: MaterialRow): GeneratedToolkitResource {
  const input = (row.input_data ?? {}) as Partial<EipToolkitFormValues>;
  const generated = (row.generated_content ?? {}) as Record<string, unknown>;

  return {
    id: row.id,
    title:
      typeof generated.title === "string"
        ? generated.title
        : `${row.output_type} Toolkit Resource`,
    createdAt: row.created_at,
    form: {
      resourceType:
        typeof input.resourceType === "string"
          ? (input.resourceType as ToolkitResourceType)
          : "Social Story",
      scenario: typeof input.scenario === "string" ? input.scenario : row.skill_focus,
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
        : `Toolkit resource for ${row.theme}.`,
    material: normalizeGeneratedMaterial(
      (generated.material ?? {
        title: row.output_type,
        createdAt: row.created_at
      }) as GeneratedMaterial
    )
  };
}
