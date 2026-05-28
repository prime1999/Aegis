import { NextResponse } from "next/server";

export const runtime = "nodejs";

import {
  fetchBlockByNumberViaRPC,
  fetchAllAssetTransfersViaRPC,
  fetchLatestBlockNumberViaRPC,
  walletScanCategories,
  walletScanLookbackDays,
  type WalletScanTransfer,
} from "@/lib/alchemy";
import { supabaseServer } from "@/lib/supabase/server";
import { buildErc20ScanInfo } from "@/lib/scan/scanInfoService";

type WalletScanRequestBody = {
  walletAddress?: string;
};

function normalizeWalletAddress(value: string) {
  return value.trim().toLowerCase();
}

function getAuthenticatedWalletAddressFromEmail(email?: string | null) {
  const normalized = normalizeWalletAddress(email || "");
  if (!normalized.includes("@")) return "";
  return normalized.split("@")[0] || "";
}

async function findBlockByTimestamp(cutoffTime: number) {
  let low = 0;
  let high = await fetchLatestBlockNumberViaRPC();

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const block = await fetchBlockByNumberViaRPC(mid);
    const blockTime = Number.parseInt(block.timestamp, 16) * 1000;

    if (blockTime >= cutoffTime) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  return low;
}

async function scanWalletTransfers(walletAddress: string) {
  const toBlock = await fetchLatestBlockNumberViaRPC();

  // Time-based lookback using `walletScanLookbackDays` to find the earliest
  // block we should scan. This is more robust than a fixed block-count
  // subtraction because block times vary across chains.
  const cutoffTime = Date.now() - walletScanLookbackDays * 24 * 60 * 60 * 1000;
  const fromBlock = await findBlockByTimestamp(cutoffTime);

  console.log({ fromBlock, toBlock, cutoffTime });
  console.log("========== WALLET SCAN START ==========");
  console.log("[SCAN] wallet:", walletAddress);
  console.log("[SCAN] toBlock:", toBlock);
  console.log("[SCAN] fromBlock:", fromBlock);
  console.log("[SCAN] estimated blocks:", toBlock - fromBlock);
  console.log("========================================");

  const normalizedWalletAddress = normalizeWalletAddress(walletAddress);

  const mapTransfer = (transfer: {
    uniqueId: string;
    category: (typeof walletScanCategories)[number];
    blockNum: string;
    from: string;
    to: string | null;
    value: number | null;
    erc721TokenId: string | null;
    tokenId: string | null;
    asset: string | null;
    hash: string;
    rawContract: { address: string };
    metadata?: { blockTimestamp: string };
  }): WalletScanTransfer => ({
    uniqueId: transfer.uniqueId,
    category: transfer.category,
    direction:
      normalizeWalletAddress(transfer.from) === normalizedWalletAddress
        ? "outgoing"
        : "incoming",
    blockNumber: transfer.blockNum,
    blockTimestamp:
      transfer.metadata?.blockTimestamp || new Date().toISOString(),
    txHash: transfer.hash,
    from: transfer.from,
    to: transfer.to,
    contractAddress: transfer.rawContract.address || undefined,
    asset: transfer.asset || undefined,
    tokenId: transfer.erc721TokenId || transfer.tokenId || undefined,
    value: transfer.value === null ? undefined : String(transfer.value),
  });

  const [incomingTransfers, outgoingTransfers] = await Promise.all([
    fetchAllAssetTransfersViaRPC({
      fromBlock,
      toBlock,
      toAddress: normalizedWalletAddress,
      categories: walletScanCategories,
      pageSize: 1000,
      withMetadata: true,
    }),
    fetchAllAssetTransfersViaRPC({
      fromBlock,
      toBlock,
      fromAddress: normalizedWalletAddress,
      categories: walletScanCategories,
      pageSize: 1000,
      withMetadata: true,
    }),
  ]);

  console.log({
    incomingCount: incomingTransfers.length,
    outgoingCount: outgoingTransfers.length,
  });

  return Array.from(
    new Map(
      [...incomingTransfers, ...outgoingTransfers].map((transfer) => [
        transfer.uniqueId,
        mapTransfer(transfer),
      ]),
    ).values(),
  );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as WalletScanRequestBody;
    const requestedWalletAddress = body.walletAddress
      ? normalizeWalletAddress(body.walletAddress)
      : "";

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing access token" },
        { status: 401 },
      );
    }

    if (!requestedWalletAddress) {
      return NextResponse.json(
        { success: false, error: "Missing walletAddress" },
        { status: 400 },
      );
    }

    // Wrap Supabase getUser in a retry loop to handle transient network timeouts
    async function getUserWithRetry(
      token: string | undefined,
      attempts = 3,
    ): Promise<any> {
      const base = 500;
      for (let i = 0; i < attempts; i++) {
        try {
          return await supabaseServer.auth.getUser(token);
        } catch (err) {
          const wait = base * Math.pow(2, i) + Math.floor(Math.random() * 200);
          console.warn(
            `supabase.getUser failed (attempt ${i + 1}), retrying in ${wait}ms`,
            err,
          );
          if (i === attempts - 1) throw err;
          await new Promise((r) => setTimeout(r, wait));
        }
      }
    }

    const { data: userData, error: userErr } = await getUserWithRetry(
      token ?? undefined,
    );

    if (userErr || !userData?.user) {
      console.error("Failed to get user from supabase server:", userErr);
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    const authenticatedWalletAddress =
      userData?.user?.user_metadata?.custom_claims?.address;
    if (!authenticatedWalletAddress) {
      console.error("Authenticated user email missing or invalid", {
        user: userData.user,
      });
      return NextResponse.json(
        { success: false, error: "Authenticated wallet email is invalid" },
        { status: 403 },
      );
    }

    if (authenticatedWalletAddress !== requestedWalletAddress) {
      console.warn("Wallet mismatch: connected vs authenticated", {
        requestedWalletAddress,
        authenticatedWalletAddress,
      });
      return NextResponse.json(
        { success: false, error: "Wallet mismatch" },
        { status: 403 },
      );
    }
    const uniqueTransfers = await scanWalletTransfers(requestedWalletAddress);
    const erc20Scans = await buildErc20ScanInfo(uniqueTransfers);

    const result = {
      walletAddress: requestedWalletAddress,
      scannedAt: new Date().toISOString(),
      lookbackDays: walletScanLookbackDays,
      categories: walletScanCategories,
      transferCount: uniqueTransfers.length,
      transfers: uniqueTransfers,
      erc20Scans,
    };

    console.log("Wallet scan result:", result);

    return NextResponse.json({ success: true, scan: result });
  } catch (error) {
    console.error("Wallet scan error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
