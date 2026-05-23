import { NextResponse } from "next/server";

export const runtime = "nodejs";

import {
  fetchBlockByNumberViaRPC,
  fetchLatestBlockNumberViaRPC,
  fetchTransfersViaRPC,
  walletScanCategories,
  walletScanLookbackDays,
  type WalletScanTransfer,
} from "@/lib/alchemy";
import { supabaseServer } from "@/lib/supabase/server";

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

const transferTopic =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

function toHexBlockNumber(blockNumber: number) {
  return `0x${blockNumber.toString(16)}`;
}

function normalizeRpcAddress(value?: string | null) {
  return value?.trim().toLowerCase() || "";
}

function padAddressTopic(address: string) {
  return `0x${normalizeRpcAddress(address).replace(/^0x/, "").padStart(64, "0")}`;
}

function topicToAddress(topic?: string | null) {
  if (!topic) {
    return "";
  }

  return `0x${topic.slice(-40)}`.toLowerCase();
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

async function getBlockTimestamp(
  blockNumber: number,
  cache: Map<number, string>,
) {
  const cached = cache.get(blockNumber);

  if (cached) {
    return cached;
  }

  const block = await fetchBlockByNumberViaRPC(blockNumber);
  const timestamp = new Date(
    Number.parseInt(block.timestamp, 16) * 1000,
  ).toISOString();

  cache.set(blockNumber, timestamp);
  return timestamp;
}

// async function scanExternalTransfers({
//   walletAddress,
//   fromBlock,
//   toBlock,
//   timestampCache,
// }: {
//   walletAddress: string;
//   fromBlock: number;
//   toBlock: number;
//   timestampCache: Map<number, string>;
// }) {
//   const normalizedWalletAddress = normalizeRpcAddress(walletAddress);
//   const transfers: WalletScanTransfer[] = [];

//   for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber += 1) {
//     const block = await fetchBlockByNumberViaRPC(blockNumber);
//     const cachedTimestamp = timestampCache.get(blockNumber);
//     const blockTimestamp = cachedTimestamp
//       ? cachedTimestamp
//       : new Date(Number.parseInt(block.timestamp, 16) * 1000).toISOString();

//     timestampCache.set(blockNumber, blockTimestamp);
//     const blockHex = toHexBlockNumber(blockNumber);

//     for (const transaction of block.transactions) {
//       const from = normalizeRpcAddress(transaction.from);
//       const to = normalizeRpcAddress(transaction.to);

//       if (from !== normalizedWalletAddress && to !== normalizedWalletAddress) {
//         continue;
//       }

//       transfers.push({
//         uniqueId: `${transaction.hash}:external:${blockHex}`,
//         category: "external",
//         direction: from === normalizedWalletAddress ? "outgoing" : "incoming",
//         blockNumber: blockHex,
//         blockTimestamp,
//         txHash: transaction.hash,
//         from: transaction.from,
//         to: transaction.to,
//         value: transaction.value,
//       });
//     }
//   }

//   return transfers;
// }

async function scanTokenTransfers({
  walletAddress,
  fromBlock,
  toBlock,
  category,
  timestampCache,
}: {
  walletAddress: string;
  fromBlock: number;
  toBlock: number;
  category: "erc20" | "erc721";
  timestampCache: Map<number, string>;
}) {
  const normalizedWalletAddress = normalizeRpcAddress(walletAddress);
  const walletTopic = padAddressTopic(normalizedWalletAddress);
  const transfers: WalletScanTransfer[] = [];

  const CHUNK_SIZE = Number(process.env.ALCHEMY_GETLOGS_MAX_BLOCK_RANGE || 5);
  const CHUNK_DELAY_MS = Number(process.env.ALCHEMY_CHUNK_DELAY_MS || 1000);

  for (
    let chunkStart = fromBlock;
    chunkStart <= toBlock;
    chunkStart += CHUNK_SIZE
  ) {
    const chunkEnd = Math.min(chunkStart + CHUNK_SIZE - 1, toBlock);
    const [outgoingLogs, incomingLogs] = await Promise.all([
      fetchTransfersViaRPC({
        fromBlock: toHexBlockNumber(chunkStart),
        toBlock: toHexBlockNumber(chunkEnd),
        topics: [transferTopic, walletTopic],
      }),
      fetchTransfersViaRPC({
        fromBlock: toHexBlockNumber(chunkStart),
        toBlock: toHexBlockNumber(chunkEnd),
        topics: [transferTopic, null, walletTopic],
      }),
    ]);

    for (const log of [...outgoingLogs, ...incomingLogs]) {
      const isErc721 = log.data === "0x";
      const resolvedCategory = isErc721 ? "erc721" : "erc20";

      if (resolvedCategory !== category) {
        continue;
      }

      const blockNumber = Number.parseInt(log.blockNumber, 16);
      const blockTimestamp = await getBlockTimestamp(
        blockNumber,
        timestampCache,
      );
      const direction =
        log.topics[1]?.toLowerCase() === walletTopic.toLowerCase()
          ? "outgoing"
          : "incoming";

      transfers.push({
        uniqueId: `${log.transactionHash}:${log.logIndex}`,
        category: resolvedCategory,
        direction,
        blockNumber: log.blockNumber,
        blockTimestamp,
        txHash: log.transactionHash,
        from:
          direction === "outgoing"
            ? normalizedWalletAddress
            : topicToAddress(log.topics[1]),
        to:
          direction === "outgoing"
            ? topicToAddress(log.topics[2])
            : normalizedWalletAddress,
        contractAddress: log.address,
        tokenId: isErc721 ? log.topics[3] : undefined,
        value: isErc721 ? undefined : log.data,
      });
    }
    // rate-limit-friendly pause between chunks
    await new Promise((r) => setTimeout(r, CHUNK_DELAY_MS));
  }

  return transfers;
}

async function scanWalletTransfers(walletAddress: string) {
  const toBlock = await fetchLatestBlockNumberViaRPC();

  const BLOCK_LOOKBACK = 500; // adjust (200–1000 is fine for dev)

  const fromBlock = Math.max(toBlock - BLOCK_LOOKBACK, 0);

  const timestampCache = new Map<number, string>();
  console.log({ fromBlock, toBlock, timestampCache });
  const [erc20Transfers, erc721Transfers] = await Promise.all([
    // scanExternalTransfers({
    //   walletAddress,
    //   fromBlock,
    //   toBlock,
    //   timestampCache,
    // }),
    scanTokenTransfers({
      walletAddress,
      fromBlock,
      toBlock,
      category: "erc20",
      timestampCache,
    }),
    scanTokenTransfers({
      walletAddress,
      fromBlock,
      toBlock,
      category: "erc721",
      timestampCache,
    }),
  ]);
  console.log({ erc20Transfers, erc721Transfers });
  return Array.from(
    new Map(
      [...erc20Transfers, ...erc721Transfers].map((transfer) => [
        transfer.uniqueId,
        transfer,
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
    async function getUserWithRetry(token: any, attempts = 3) {
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

    const { data: userData, error: userErr } = (await getUserWithRetry(
      token,
    )) as any;

    if (userErr || !userData?.user) {
      console.error("Failed to get user from supabase server:", userErr);
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    const authenticatedWalletAddress = normalizeWalletAddress(
      userData.user.user_metadata?.custom_claims?.address || "",
    );

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
    console.log("here1");
    const uniqueTransfers = await scanWalletTransfers(requestedWalletAddress);
    console.log("here2");
    const result = {
      walletAddress: requestedWalletAddress,
      scannedAt: new Date().toISOString(),
      lookbackDays: walletScanLookbackDays,
      categories: walletScanCategories,
      transferCount: uniqueTransfers.length,
      transfers: uniqueTransfers,
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
