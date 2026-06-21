import OpenAI from "openai";
import type {
  GeneratedMaterial,
  MaterialFormValues
} from "@/lib/material-generator";
import { normalizeGeneratedMaterial } from "@/lib/material-generator";

type AIContentShape = {
  wordList: string[];
  simpleSentences: string[];
  worksheetActivity: string[];
  visualCardContent: string[];
  canvaDesignPrompt: string;
  teacherNotes: string[];
  suggestedDifficultyAdjustment: string;
  summary: string;
};

const defaultOpenAIModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const defaultAnthropicModel =
  process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

function titleCase(text: string) {
  return text
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildPrompt(form: MaterialFormValues) {
  return [
    "You create teaching materials for an Early Intervention Program teacher.",
    "Return only valid JSON.",
    "Keep all language simple, warm, child-friendly, and easy to understand.",
    "Make the content suitable for early learners and special needs students.",
    "Avoid complex words, scary content, too many instructions, or overloaded worksheets.",
    "Prefer concrete everyday words and short sentence models.",
    "If the requested output type is narrow, still return all sections below.",
    "",
    "Teacher request:",
    `Theme: ${form.theme}`,
    `Subject: ${form.subject}`,
    `Skill focus: ${form.skillFocus}`,
    `Student level: ${form.studentLevel}`,
    `Material type: ${form.materialType}`,
    `Output type: ${form.outputType}`,
    `Language: ${form.language}`,
    `Number of items: ${form.numberOfItems}`,
    `Difficulty: ${form.difficulty}`,
    `Style preference: ${form.stylePreference}`,
    `Extra instruction: ${form.extraInstruction}`,
    "",
    "Return JSON with exactly these keys:",
    "{",
    '  "wordList": string[],',
    '  "simpleSentences": string[],',
    '  "worksheetActivity": string[],',
    '  "visualCardContent": string[],',
    '  "canvaDesignPrompt": string,',
    '  "teacherNotes": string[],',
    '  "suggestedDifficultyAdjustment": string,',
    '  "summary": string',
    "}",
    "",
    "Requirements:",
    "- wordList should match the requested number of items when possible.",
    "- simpleSentences should be short and easy to model aloud.",
    "- worksheetActivity should be a few simple steps or questions only.",
    "- visualCardContent should be short card text, one item per array entry.",
    "- canvaDesignPrompt should describe a classroom-ready educational resource with clear visual hierarchy.",
    "- teacherNotes should be practical and brief.",
    "- suggestedDifficultyAdjustment should include both easier and harder ideas in one short paragraph."
  ].join("\n");
}

function parseAIJson(text: string): AIContentShape {
  const trimmed = text.trim();
  const match = trimmed.match(/\{[\s\S]*\}/);
  const raw = match ? match[0] : trimmed;
  const parsed = JSON.parse(raw) as Partial<AIContentShape>;

  const ensureStrings = (value: unknown) =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];

  return {
    wordList: ensureStrings(parsed.wordList),
    simpleSentences: ensureStrings(parsed.simpleSentences),
    worksheetActivity: ensureStrings(parsed.worksheetActivity),
    visualCardContent: ensureStrings(parsed.visualCardContent),
    canvaDesignPrompt:
      typeof parsed.canvaDesignPrompt === "string" ? parsed.canvaDesignPrompt : "",
    teacherNotes: ensureStrings(parsed.teacherNotes),
    suggestedDifficultyAdjustment:
      typeof parsed.suggestedDifficultyAdjustment === "string"
        ? parsed.suggestedDifficultyAdjustment
        : "",
    summary: typeof parsed.summary === "string" ? parsed.summary : ""
  };
}

async function generateWithOpenAI(form: MaterialFormValues) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: defaultOpenAIModel,
    instructions:
      "You are a careful teaching assistant for Early Intervention Program educators.",
    input: buildPrompt(form)
  });

  return parseAIJson(response.output_text);
}

async function generateWithAnthropic(form: MaterialFormValues) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: defaultAnthropicModel,
      max_tokens: 1400,
      system:
        "You are a careful teaching assistant for Early Intervention Program educators. Return only valid JSON.",
      messages: [
        {
          role: "user",
          content: buildPrompt(form)
        }
      ]
    })
  });

  const data = (await response.json()) as {
    error?: { type?: string; message?: string };
    content?: Array<{ type: string; text?: string }>;
  };

  if (!response.ok) {
    const error = new Error(
      data.error?.message || "Anthropic request failed."
    ) as Error & { code?: string };
    error.code = data.error?.type || String(response.status);
    throw error;
  }

  const text =
    data.content
      ?.filter((item) => item.type === "text" && typeof item.text === "string")
      .map((item) => item.text)
      .join("\n") || "";

  return parseAIJson(text);
}

export async function generateMaterialWithAI(
  form: MaterialFormValues
): Promise<GeneratedMaterial> {
  const parsed = process.env.ANTHROPIC_API_KEY
    ? await generateWithAnthropic(form)
    : await generateWithOpenAI(form);

  return normalizeGeneratedMaterial({
    id: `MAT-${Date.now().toString().slice(-6)}`,
    title: `${titleCase(form.theme || "Classroom")} ${form.outputType}`,
    createdAt: new Date().toISOString(),
    form,
    wordList: parsed.wordList,
    sentences: parsed.simpleSentences,
    worksheetActivity: parsed.worksheetActivity,
    visualCardText: parsed.visualCardContent,
    canvaPrompt: parsed.canvaDesignPrompt,
    teacherNotes: parsed.teacherNotes,
    suggestedDifficultyAdjustment: parsed.suggestedDifficultyAdjustment,
    summary:
      parsed.summary ||
      `Generated ${form.outputType.toLowerCase()} content for ${form.theme}.`
  });
}
