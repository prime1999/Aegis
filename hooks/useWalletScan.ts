"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import { useAuth } from "@/hooks/useAuthUser";
import { supabase } from "@/lib/supabase/client";

export const walletAnalysisQueryKey = ["wallet-analysis"] as const;

type AnalysisCategory = "external" | "erc20" | "erc721";

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

type WalletScanTransfer = {
  uniqueId: string;
  category: string;
  direction: "incoming" | "outgoing";
  blockNumber: string;
  blockTimestamp: string;
  txHash: string;
  from: string;
  to: string | null;
  contractAddress?: string;
  asset?: string;
  tokenId?: string;
  value?: string;
};

type WalletScanPayload = {
  walletAddress: string;
  scannedAt: string;
  lookbackDays: number;
  categories: string[];
  transferCount: number;
  transfers: WalletScanTransfer[];
  erc20Scans: unknown[];
};

type WalletScanResponse = {
  success: boolean;
  error?: string;
  scan?: WalletScanPayload;
};

type WalletScanAnalysisItem = {
  protocols: Array<{
    name: string;
    confidence: string;
    evidence: string;
  }>;
  summary: string;
};

type WalletAnalyzerResponse = {
  analysis?: WalletScanAnalysisItem[];
  error?: string;
};

export type WalletAnalysisEntry = {
  category: AnalysisCategory;
  summary: string;
  confidence: string;
  evidence: string;
  transactionHash: string;
  timestamp: string;
  asset: string;
  direction: WalletScanTransfer["direction"];
  protocols: Array<{
    name: string;
    confidence: string;
    evidence: string;
  }>;
};

export type WalletAnalysisSnapshot = {
  walletAddress: string;
  scannedAt: string;
  transferCount: number;
  items: WalletAnalysisEntry[];
};

function normalizeWalletAddress(value: string) {
  return value.trim().toLowerCase();
}

export function useWalletScan() {
  const { address, isConnected } = useAccount();
  const { data: user } = useAuth();
  const queryClient = useQueryClient();

  const scanMutation = useMutation({
    mutationFn: async ({
      walletAddress,
      accessToken,
    }: {
      walletAddress: string;
      accessToken: string;
    }) => {
      const response = await fetch("/api/wallet/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ walletAddress }),
      });

      const payload = (await response
        .json()
        .catch(() => null)) as WalletScanResponse | null;

      if (!response.ok || !payload?.success || !payload.scan) {
        throw new Error(payload?.error || "Wallet scan request failed");
      }

      return payload.scan;
    },
  });

  const analyzerMutation = useMutation({
    mutationFn: async (scanResults: WalletScanTransfer[]) => {
      const response = await fetch("/api/aiWalletAnalyzer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scanResults }),
      });

      const payload = (await response
        .json()
        .catch(() => null)) as WalletAnalyzerResponse | null;

      if (!response.ok || !payload?.analysis) {
        throw new Error(payload?.error || "AI analyzer request failed");
      }

      return payload.analysis;
    },
  });

  const scanWallet = useCallback(async () => {
    const authenticatedUser = user as AuthUser | null;
    const connectedWalletAddress = address
      ? normalizeWalletAddress(address)
      : "";
    const authWalletAddress = authenticatedUser
      ? ((
          authenticatedUser.user_metadata?.custom_claims as
            | { address?: string }
            | undefined
        )?.address ?? "")
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

    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        console.error("Missing Supabase access token for wallet scan.");
        return;
      }

      const scanResult = await scanMutation.mutateAsync({
        walletAddress: connectedWalletAddress,
        accessToken,
      });

      console.log("Wallet scan finished:", scanResult);

      const aiAnalysis = await analyzerMutation.mutateAsync(
        scanResult.transfers,
      );
      const expected = scanResult.transfers.length;
      const actual = aiAnalysis.length;

      if (expected !== actual) {
        console.warn("AI analysis count does not match scan transfers:", {
          expected,
          actual,
        });
      }

      const snapshot: WalletAnalysisSnapshot = {
        walletAddress: scanResult.walletAddress,
        scannedAt: scanResult.scannedAt,
        transferCount: scanResult.transferCount,
        items: scanResult.transfers.map((transfer, index) => {
          const analysis = aiAnalysis[index];
          const protocolNames = analysis?.protocols.map(
            (protocol) => protocol.name,
          );

          return {
            category: transfer.category as AnalysisCategory,
            summary:
              analysis?.summary ||
              `AI analysis was not returned for this ${transfer.category} transfer.`,
            confidence: analysis?.protocols[0]?.confidence ?? "unrated",
            evidence:
              protocolNames && protocolNames.length > 0
                ? protocolNames.join(", ")
                : transfer.contractAddress || transfer.asset || transfer.txHash,
            transactionHash: transfer.txHash,
            timestamp: transfer.blockTimestamp,
            asset: transfer.asset || transfer.category,
            direction: transfer.direction,
            protocols: analysis?.protocols ?? [],
          };
        }),
      };

      queryClient.setQueryData(walletAnalysisQueryKey, snapshot);

      console.log("Wallet scan AI analysis:", aiAnalysis);
      console.log("Wallet scan + AI pipeline result:", {
        scan: scanResult,
        aiAnalysis,
      });
    } catch (error) {
      console.error("Wallet scan error:", error);
    }
  }, [address, isConnected, user, scanMutation, analyzerMutation, queryClient]);

  const isScanning = scanMutation.isPending;
  const isAnalyzing = analyzerMutation.isPending;
  const isProcessing = isScanning || isAnalyzing;
  const scanError = scanMutation.error;
  const analyzerError = analyzerMutation.error;

  const scanStep = isScanning
    ? "Scanning wallet activity..."
    : isAnalyzing
      ? "Analyzing scan results..."
      : scanError
        ? "Scan failed"
        : analyzerError
          ? "AI analysis failed"
          : scanMutation.isSuccess && analyzerMutation.isSuccess
            ? "Scan and analysis completed"
            : "Idle";

  return {
    scanWallet,
    isScanning,
    isAnalyzing,
    isProcessing,
    scanStep,
    scanError,
    analyzerError,
    scanSuccess: scanMutation.isSuccess,
    analysisSuccess: analyzerMutation.isSuccess,
  };
}
