import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateMaterialWithAI } from "@/lib/openai";
import { generateMaterial } from "@/lib/material-generator";
import type { MaterialFormValues } from "@/lib/material-generator";

export const runtime = "nodejs";

function isValidForm(body: unknown): body is MaterialFormValues {
  if (!body || typeof body !== "object") {
    return false;
  }

  const value = body as Record<string, unknown>;
  const requiredKeys: Array<keyof MaterialFormValues> = [
    "theme",
    "subject",
    "skillFocus",
    "studentLevel",
    "materialType",
    "outputType",
    "language",
    "numberOfItems",
    "difficulty",
    "stylePreference",
    "extraInstruction"
  ];

  return requiredKeys.every((key) => typeof value[key] === "string");
}

function friendlyAiError(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code?: unknown }).code);

    if (code === "insufficient_quota") {
      return "OpenAI quota reached — showing an offline sample instead.";
    }

    if (code === "credit_balance_too_low" || code === "rate_limit_error") {
      return "Anthropic credit/rate limit reached — showing an offline sample instead.";
    }
  }

  return "AI generation is unavailable right now — showing an offline sample instead.";
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!isValidForm(body)) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const hasAiKey = Boolean(
      process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY
    );

    // No API key configured: use the built-in offline template engine so the
    // generator always produces a usable, previewable result.
    if (!hasAiKey) {
      return NextResponse.json({
        material: generateMaterial(body),
        source: "offline"
      });
    }

    // A key is configured: try AI, but never dead-end — fall back to the
    // offline engine and tell the teacher why.
    try {
      const material = await generateMaterialWithAI(body);
      return NextResponse.json({ material, source: "ai" });
    } catch (error) {
      return NextResponse.json({
        material: generateMaterial(body),
        source: "offline",
        notice: friendlyAiError(error)
      });
    }
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to generate material.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
