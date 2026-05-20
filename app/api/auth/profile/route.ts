import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const wallet =
      url.searchParams.get("walletAddress") || url.searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Missing walletAddress" },
        { status: 400 },
      );
    }

    const address = wallet.toLowerCase();

    const { data, error } = await supabaseServer
      .from("aegisuser")
      .select("*")
      .eq("wallet_address", address)
      .maybeSingle();

    if (error) {
      console.error("Failed to load profile:", error);
      return NextResponse.json(
        { success: false, error: "DB error" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 },
    );
  }
}
