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

export async function analyzeWalletScanResults(scanResults: unknown[]) {
  if (scanResults.length === 0) {
    return [] as WalletScanAnalysisItem[];
  }

  const modelName = "gemini-2.5-flash";

  const prompt = `You are an expert blockchain forensics analyst. Analyze the provided wallet scan results JSON array.
For each element, deduce the underlying protocol or ecosystem it belongs to.
Pay close attention to testnet naming patterns (e.g., 'SepoliaMNT' implies the Mantle Network ecosystem).

Return an array containing exactly ${scanResults.length} analysis objects matching the order of the input.

Array to analyze:
${JSON.stringify(scanResults, null, 2)}`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
      temperature: 0.1,
    },
  });

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
    const message =
      err instanceof Error ? err.message : "internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const runtime = "nodejs";
