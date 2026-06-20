import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateMaterialWithAI } from "@/lib/openai";
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
    "outputType",
    "language",
    "numberOfItems",
    "difficulty",
    "stylePreference",
    "extraInstruction"
  ];

  return requiredKeys.every((key) => typeof value[key] === "string");
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

    const material = await generateMaterialWithAI(body);

    return NextResponse.json({ material });
  } catch (error) {
    let message = "Failed to generate material.";

    if (error && typeof error === "object" && "code" in error) {
      const code = String(error.code);

      if (code === "insufficient_quota") {
        message =
          "OpenAI quota has been reached for this API key. Please check billing or use a key with available credits.";
      }
    }

    if (
      message === "Failed to generate material." &&
      error instanceof Error &&
      error.message
    ) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
