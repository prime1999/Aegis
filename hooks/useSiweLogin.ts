"use client";

import { useCallback } from "react";
import { useAccount } from "wagmi";

interface UseLoginReturn {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for basic wallet connection
 * SIWE authentication will be implemented later
 */
export function useSiweLogin(): UseLoginReturn {
  const { address, isConnected } = useAccount();

  const login = useCallback(async () => {
    // Wallet connection happens through wagmi's useAccount
    // SIWE signing will be implemented later
  }, []);

  const logout = useCallback(async () => {
    // Logout functionality will be implemented with SIWE
  }, []);

  return {
    address,
    isConnected,
    isLoading: false,
    error: null,
  };
}
