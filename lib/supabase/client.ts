import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for frontend usage
 * Uses anon key only - safe for browser exposure
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables not configured");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
