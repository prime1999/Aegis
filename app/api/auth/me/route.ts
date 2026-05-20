import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing access token" },
        { status: 401 },
      );
    }

    const { data: userData, error: userErr } =
      await supabaseServer.auth.getUser(token);
    if (userErr || !userData?.user) {
      console.error("Failed to get user from supabase server:", userErr);
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }
    console.log("Authenticated user data from supabase server:", userData);

    const user = userData.user;

    // derive wallet address from user metadata or email
    const walletAddress = (
      user.user_metadata?.wallet_address ||
      user.email ||
      ""
    )
      .toLowerCase()
      .replace(/@.*/, "");

    const { data: profile, error: profileErr } = await supabaseServer
      .from("aegisuser")
      .select("*")
      .eq("wallet_address", walletAddress)
      .maybeSingle();

    if (profileErr) {
      console.warn("Failed to load profile in /api/auth/me:", profileErr);
    }

    return NextResponse.json({ success: true, user, profile: profile || null });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 },
    );
  }
}
