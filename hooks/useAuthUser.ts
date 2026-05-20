"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

// export function useAuthUser() {
//   return useQuery(["auth", "user"], async () => {
//     // Try to get the currently authenticated user from Supabase client
//     const { data: current, error: userErr } = await supabase.auth.getUser();
//     if (userErr) {
//       console.warn("supabase.auth.getUser() error", userErr);
//       return null;
//     }

//     const user = current?.user;
//     if (!user) return null;

//     // Lookup profile in aegisuser table by wallet address (stored lowercase in DB)
//     const walletAddress = (
//       user.user_metadata?.wallet_address ||
//       user.email ||
//       ""
//     )
//       .toLowerCase()
//       .replace(/@.*/, "");

//     const { data: profile, error: dbErr } = await supabase
//       .from("aegisuser")
//       .select("*")
//       .eq("wallet_address", walletAddress)
//       .maybeSingle();

//     if (dbErr) {
//       console.warn("Failed to load user profile", dbErr);
//       return null;
//     }

//     return profile || null;
//   });
// }

export function useAuth() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      const accessToken = session?.data?.session?.access_token;
      console.log("session data from supabase client:", session);

      const headers: Record<string, string> = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const res = await fetch("/api/auth/me", { headers });
      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      if (!json.success) return null;

      console.log("Authenticated user data from API:", json.user);
      return json.user || null;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUserProfile(walletAddress?: string) {
  return useQuery({
    queryKey: ["user-profile", walletAddress],
    enabled: !!walletAddress,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aegis_user")
        .select("*")
        .eq("wallet_address", walletAddress)
        .maybeSingle();

      if (error) throw error;

      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
}
