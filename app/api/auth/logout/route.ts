import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    // Sign out all sessions for the authenticated user
    const { error } = await supabaseServer.auth.signOut();

    if (error) {
      console.warn("Logout warning:", error);
      // Don't fail if signOut has issues - client clears session anyway
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Logout error:", err);
    // Return success anyway since client-side session is cleared
    return NextResponse.json({ success: true });
  }
}
