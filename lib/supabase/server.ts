import { createClient } from "@supabase/supabase-js";

/**
 * Supabase server client
 * Uses service role key - only use in server/API routes
 * NEVER expose this to the browser
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Supabase server environment variables not configured");
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
