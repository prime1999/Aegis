import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function wait(ms: number) {
  await new Promise((res) => setTimeout(res, ms));
}

async function generateWithRetry(
  prompt: string,
  modelName: string,
  maxAttempts = 3,
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "text/plain",
          temperature: 0.2,
        },
      });
    } catch (err: unknown) {
      lastError = err;
      if (attempt === maxAttempts) break;
      const backoff =
        400 * 2 ** (attempt - 1) + Math.floor(Math.random() * 200);
      await wait(backoff);
    }
  }

  throw lastError;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body?.text;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const prompt = `You are an expert financial and crypto reporter. Translate the following update into very simple, easy-to-understand language suitable for a beginner. Use a short, relatable analogy to explain what the update means, and then briefly state how this update might affect the market or token holders. Keep the translation concise (3-6 short paragraphs). Use plain language and avoid jargon.

Update to translate:
${text}`;

    const modelCandidates = ["gemini-2.5-flash", "gemini-2.0-flash"];

    let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null =
      null;
    let lastError: unknown;

    for (const model of modelCandidates) {
      try {
        response = await generateWithRetry(prompt, model, 3);
        break;
      } catch (err: unknown) {
        lastError = err;
      }
    }

    if (!response || !response.text) {
      console.error("AI translate failed:", lastError);
      return NextResponse.json(
        { error: "AI translate failed" },
        { status: 503 },
      );
    }

    return NextResponse.json({ translation: response.text });
  } catch (err: unknown) {
    console.error("AI translate error:", err);
    const message =
      err instanceof Error ? err.message : String(err ?? "unknown");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const runtime = "nodejs";
