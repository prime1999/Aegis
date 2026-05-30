import { NextResponse } from "next/server";

const API_KEY =
  process.env.CRYPTOCOMPARE_API_KEY ||
  process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY ||
  "";

function parseSymbols(raw?: string | null) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.toUpperCase());
}

async function fetchUpdates(symbols: string[]) {
  const fsyms = symbols.join(",");
  const tsyms = "USD";
  const url = `https://min-api.cryptocompare.com/data/v2/news/?categories=${encodeURIComponent(
    fsyms,
  )}`;

  const headers: Record<string, string> = {};
  if (API_KEY) headers["authorization"] = `Apikey ${API_KEY}`;

  const res = await fetch(url, { headers });
  const data = await res.json();
  console.log("[api/updates] CryptoCompare response:", data);
  console.log("[api/updates] Parsed symbols from raw body:", fsyms);
  return data;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("symbols");
  const symbols = parseSymbols(raw);
  if (symbols.length === 0) {
    return NextResponse.json(
      { error: "missing symbols query param" },
      { status: 400 },
    );
  }
  const data = await fetchUpdates(symbols);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  let symbols: string[] = [];
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const raw = body?.symbols || body?.symbol || body?.q || body?.query;
      symbols = parseSymbols(typeof raw === "string" ? raw : undefined);
    } else {
      const text = await request.text();
      // allow raw comma-separated body
      symbols = parseSymbols(text);
    }
  } catch (e) {
    return NextResponse.json(
      { error: "invalid request body" },
      { status: 400 },
    );
  }

  if (symbols.length === 0) {
    return NextResponse.json({ error: "no symbols provided" }, { status: 400 });
  }

  const data = await fetchUpdates(symbols);
  return NextResponse.json({ data });
}

export const runtime = "nodejs";
