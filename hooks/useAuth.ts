"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export interface AuthSession {
  access_token: string;
  user_email: string;
  address?: string;
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("aegis_session");
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch (e) {
        console.warn("Failed to parse stored session", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (session) {
      localStorage.setItem("aegis_session", JSON.stringify(session));
    } else {
      localStorage.removeItem("aegis_session");
    }
  }, [session]);

  const login = useCallback((newSession: AuthSession) => {
    setSession(newSession);
  }, []);

  const logout = useCallback(async () => {
    try {
      // Invalidate session on server
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("Failed to call logout endpoint", e);
    }
    setSession(null);
  }, []);

  return {
    session,
    isLoading,
    isAuthenticated: !!session,
    login,
    logout,
  };
}
