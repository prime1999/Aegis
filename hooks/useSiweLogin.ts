"use client";

import { useCallback } from "react";
import { useAccount } from "wagmi";

interface UseLoginReturn {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Consolidated SIWE hook
 * Returns `login` and `logout` placeholders for future SIWE integration.
 */
export function useSiweLogin(): UseLoginReturn {
  const { address, isConnected } = useAccount();

  const login = useCallback(async () => {
    // Placeholder: SIWE signing will be implemented later
    return;
  }, []);

  const logout = useCallback(async () => {
    // Placeholder: SIWE logout will be implemented later
    return;
  }, []);

  return {
    address,
    isConnected,
    isLoading: false,
    error: null,
    login,
    logout,
  };
}
