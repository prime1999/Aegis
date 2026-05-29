import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize the client once outside the handler.
// It will automatically pick up process.env.GEMINI_API_KEY.
// If you use GOOGLE_API_KEY, pass it explicitly: new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
const ai = new GoogleGenAI({});

// Define strict JSON Schema output matching your required structure
const analysisSchema = {
  type: "OBJECT",
  properties: {
    analysis: {
      type: "ARRAY",
      description:
        "An array containing an element for every single transaction scanned, in the exact same order.",
      items: {
        type: "OBJECT",
        properties: {
          protocols: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: {
                  type: "STRING",
                  description:
                    "Name of the protocol or ecosystem (e.g., 'Mantle Network', 'Uniswap')",
                },
                confidence: {
                  type: "STRING",
                  description: "High, Medium, or Low",
                },
                evidence: {
                  type: "STRING",
                  description:
                    "On-chain data or naming pattern that points to this conclusion",
                },
              },
              required: ["name", "confidence", "evidence"],
            },
          },
          summary: {
            type: "STRING",
            description:
              "Short plain-text summary of findings for this specific transaction.",
          },
        },
        required: ["protocols", "summary"],
      },
    },
  },
  required: ["analysis"],
};

export type WalletScanAnalysisItem = {
  protocols: Array<{
    name: string;
    confidence: string;
    evidence: string;
  }>;
  summary: string;
};

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  // 1. Check for standard SDK error structures or nested property wrappers
  const errObj = error as Record<string, any>;

  if (typeof errObj.status === "number") return errObj.status;
  if (typeof errObj.statusCode === "number") return errObj.statusCode;

  // 2. Parse the nested response body variant {"error": {"code": 503}}
  if (
    errObj.error &&
    typeof errObj.error === "object" &&
    typeof errObj.error.code === "number"
  ) {
    return errObj.error.code;
  }

  return undefined;
}

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  const errObj = error as Record<string, any>;
  if (typeof errObj.code === "string") return errObj.code;

  // Check nested payload object {"error": {"status": "UNAVAILABLE"}}
  if (
    errObj.error &&
    typeof errObj.error === "object" &&
    typeof errObj.error.status === "string"
  ) {
    return errObj.error.status; // e.g. "UNAVAILABLE"
  }

  const cause = errObj.cause;
  if (
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    typeof (cause as any).code === "string"
  ) {
    return (cause as any).code;
  }

  return undefined;
}
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error ?? "");
}

function isTransientUpstreamError(error: unknown) {
  const status = getErrorStatus(error);
  if (status === 503 || status === 504 || status === 429) {
    return true;
  }

  const code = getErrorCode(error);
  if (
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "UND_ERR_HEADERS_TIMEOUT" ||
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "ENETUNREACH" ||
    code === "EAI_AGAIN" ||
    code === "UNAVAILABLE" // Added explicitly to catch the code token from the API JSON
  ) {
    return true;
  }

  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes("fetch failed") ||
    message.includes("connect timeout") ||
    message.includes("timed out") ||
    message.includes("experiencing high demand") || // Added context keyword
    message.includes("unavailable")
  );
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateAnalysisWithRetry(
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
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
          temperature: 0.1,
        },
      });
    } catch (error: unknown) {
      lastError = error;
      if (!isTransientUpstreamError(error) || attempt === maxAttempts) {
        break;
      }

      const backoffMs =
        500 * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
      console.warn(
        `Gemini ${modelName} unavailable (attempt ${attempt}/${maxAttempts}). Retrying in ${backoffMs}ms.`,
      );
      await wait(backoffMs);
    }
  }

  throw lastError;
}

export async function analyzeWalletScanResults(scanResults: unknown[]) {
  if (scanResults.length === 0) {
    return [] as WalletScanAnalysisItem[];
  }

  const modelCandidates = ["gemini-2.5-flash", "gemini-2.0-flash"];

  const prompt = `You are an expert blockchain forensics analyst. Analyze the provided wallet scan results JSON array.
For each element, deduce the underlying protocol or ecosystem it belongs to.
Pay close attention to testnet naming patterns (e.g., 'SepoliaMNT' implies the Mantle Network ecosystem).

Return an array containing exactly ${scanResults.length} analysis objects matching the order of the input.

Array to analyze:
${JSON.stringify(scanResults, null, 2)}`;

  let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null =
    null;
  let finalError: unknown;

  for (const modelName of modelCandidates) {
    try {
      response = await generateAnalysisWithRetry(prompt, modelName, 3);
      break;
    } catch (error: unknown) {
      finalError = error;
      const status = getErrorStatus(error);

      if (!isTransientUpstreamError(error)) {
        throw error;
      }

      console.warn(
        `Model ${modelName} temporarily unavailable after retries (status: ${status ?? "n/a"}). Trying fallback model.`,
      );
    }
  }

  if (!response) {
    throw finalError ?? new Error("Failed to get AI analysis response");
  }

  if (!response.text) {
    throw new Error("Empty response received from Gemini API");
  }

  const payload = JSON.parse(response.text) as {
    analysis?: WalletScanAnalysisItem[];
  };

  return payload.analysis || [];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const scanResults = body?.scanResults;

    if (!Array.isArray(scanResults)) {
      return NextResponse.json(
        { error: "scanResults must be an array" },
        { status: 400 },
      );
    }

    if (scanResults.length === 0) {
      return NextResponse.json({ analysis: [] });
    }

    const analysis = await analyzeWalletScanResults(scanResults);

    console.log("AI analysis result:", analysis);

    return NextResponse.json({ analysis });
  } catch (err: unknown) {
    console.error("aiWalletAnalyzer error:", err);

    const status = getErrorStatus(err) ?? 500;
    if (status === 503 || status === 504 || isTransientUpstreamError(err)) {
      return NextResponse.json(
        {
          error:
            "AI analyzer is temporarily unavailable due to upstream network/load conditions. Please try again shortly.",
        },
        { status: 503 },
      );
    }

    const message =
      err instanceof Error ? err.message : "internal server error";
    return NextResponse.json({ error: message }, { status });
  }
}

export const runtime = "nodejs";
