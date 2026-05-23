"use client";

import { useCallback, useState } from "react";
import { useAccount } from "wagmi";

import { useAuth } from "@/hooks/useAuthUser";
import { supabase } from "@/lib/supabase/client";

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

function normalizeWalletAddress(value: string) {
  return value.trim().toLowerCase();
}

function getAuthWalletAddress(email?: string | null) {
  const normalizedEmail = normalizeWalletAddress(email || "");

  if (!normalizedEmail.includes("@")) {
    return "";
  }

  return normalizedEmail.split("@")[0] || "";
}

export function useWalletScan() {
  const { address, isConnected } = useAccount();
  const { data: user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);

  const scanWallet = useCallback(async () => {
    const authenticatedUser = user as AuthUser | null;
    const connectedWalletAddress = address
      ? normalizeWalletAddress(address)
      : "";
    const authWalletAddress = authenticatedUser
      ? authenticatedUser?.user_metadata?.custom_claims?.address
      : "";

    if (!isConnected || !connectedWalletAddress || !authenticatedUser) {
      console.error("Wallet scan requires a connected authenticated wallet.");
      return;
    }

    if (connectedWalletAddress !== authWalletAddress) {
      console.error(
        "Connected wallet does not match the authenticated email wallet.",
      );
      return;
    }

    setIsScanning(true);

    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        console.error("Missing Supabase access token for wallet scan.");
        return;
      }

      const response = await fetch("/api/wallet/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ walletAddress: connectedWalletAddress }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        console.error("Wallet scan request failed:", errorPayload?.error);
        return;
      }

      const payload = (await response.json()) as {
        scan?: unknown;
      };

      console.log("Wallet scan finished:", payload.scan);
    } catch (error) {
      console.error("Wallet scan error:", error);
    } finally {
      setIsScanning(false);
    }
  }, [address, isConnected, user]);

  return { scanWallet, isScanning };
}
