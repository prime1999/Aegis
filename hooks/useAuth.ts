"use client";

import { useCallback, useEffect, useState } from "react";

export interface AuthSession {
  access_token: string;
  user_email: string;
  address?: string;
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = localStorage.getItem("aegis_session");
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AuthSession;
    } catch (e) {
      console.warn("Failed to parse stored session", e);
      return null;
    }
  });
  const [isLoading] = useState(false);

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
