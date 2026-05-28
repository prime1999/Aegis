const alchemyRpcUrl = process.env.ALCHEMY_RPC_URL || "";

if (!alchemyRpcUrl) {
  console.warn(
    "Alchemy RPC URL not configured — wallet scans will fail until set.",
  );
}

export const walletScanCategories = ["external", "erc20", "erc721"] as const;

export const walletScanLookbackDays = 90;

export type WalletScanCategory = (typeof walletScanCategories)[number];

export type WalletScanTransfer = {
  uniqueId: string;
  category: WalletScanCategory;
  direction: "incoming" | "outgoing";
  blockNumber: string;
  blockTimestamp: string;
  txHash: string;
  from: string;
  to: string | null;
  contractAddress?: string;
  asset?: string | null;
  tokenId?: string;
  value?: string;
};

type RpcResponse<T> = {
  jsonrpc: "2.0";
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
};

type RpcBlock = {
  number: string;
  timestamp: string;
  transactions: Array<{
    hash: string;
    from: string;
    to: string | null;
    value: string;
  }>;
};

type RpcTransaction = {
  hash: string;
  from: string;
  to: string | null;
  value: string;
};

type AlchemyAssetTransfer = {
  uniqueId: string;
  category: WalletScanCategory;
  blockNum: string;
  from: string;
  to: string | null;
  value: number | null;
  erc721TokenId: string | null;
  tokenId: string | null;
  asset: string | null;
  hash: string;
  rawContract: {
    address: string;
    decimals: string | null;
    value: string | null;
  };
  metadata?: {
    blockTimestamp: string;
  };
};

type AlchemyAssetTransfersResponse = {
  transfers: AlchemyAssetTransfer[];
  pageKey?: string;
};

type TransferQueryParams = {
  fromBlock: number;
  toBlock: number;
  fromAddress?: string;
  toAddress?: string;
  categories: readonly WalletScanCategory[];
  pageKey?: string;
  pageSize?: number;
  withMetadata?: boolean;
};

function toHexBlockNumber(blockNumber: number) {
  return `0x${blockNumber.toString(16)}`;
}

async function fetchRpc<T>(method: string, params: unknown[]): Promise<T> {
  if (!alchemyRpcUrl) {
    throw new Error("Alchemy RPC URL is missing");
  }
  console.log("RPC CALL:", method, params);
  const response = await fetch(alchemyRpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  const payload = (await response.json()) as RpcResponse<T>;

  if (payload.error) {
    throw new Error(payload.error.message);
  }

  if (!response.ok) {
    throw new Error(`RPC request failed (${response.status})`);
  }

  if (payload.result === undefined || payload.result === null) {
    throw new Error("RPC response missing result");
  }

  return payload.result;
}

export async function fetchLatestBlockNumberViaRPC() {
  const latestBlock = await fetchRpc<string>("eth_blockNumber", []);
  return Number.parseInt(latestBlock, 16);
}

export async function fetchBlockByNumberViaRPC(blockNumber: number) {
  return fetchRpc<RpcBlock>("eth_getBlockByNumber", [
    toHexBlockNumber(blockNumber),
    true,
  ]);
}

export async function fetchTransactionByHashViaRPC(txHash: string) {
  return fetchRpc<RpcTransaction>("eth_getTransactionByHash", [txHash]);
}

function normalizeAddress(value: string) {
  return value.trim().toLowerCase();
}

function toAlchemyBlockTag(blockNumber: number | string) {
  const num =
    typeof blockNumber === "string" ? Number(blockNumber) : blockNumber;

  if (Number.isNaN(num)) {
    throw new Error(`Invalid block number: ${blockNumber}`);
  }

  return `0x${num.toString(16)}`;
}

export async function fetchAssetTransfersViaRPC(params: TransferQueryParams) {
  if (typeof params.fromBlock !== "number") {
    throw new Error("fromBlock must be number");
  }

  if (typeof params.toBlock !== "number") {
    throw new Error("toBlock must be number");
  }
  console.log(
    "ALCHEMY RAW REQUEST:",
    JSON.stringify(
      {
        fromBlock: params.fromBlock,
        toBlock: params.toBlock,
        pageSize: params.pageSize,
      },
      null,
      2,
    ),
  );
  const response = await fetchRpc<AlchemyAssetTransfersResponse>(
    "alchemy_getAssetTransfers",
    [
      {
        fromBlock: toAlchemyBlockTag(Number(params.fromBlock)),
        toBlock: toAlchemyBlockTag(Number(params.toBlock)),
        fromAddress: params.fromAddress
          ? normalizeAddress(params.fromAddress)
          : undefined,
        toAddress: params.toAddress
          ? normalizeAddress(params.toAddress)
          : undefined,
        category: params.categories,
        pageSize: params.pageSize ?? 1000,
        pageKey: params.pageKey,
        withMetadata: params.withMetadata ?? true,
      },
    ],
  );

  return response;
}

export async function fetchAllAssetTransfersViaRPC(
  params: Omit<TransferQueryParams, "pageKey">,
) {
  const transfers: AlchemyAssetTransfer[] = [];
  let pageKey: string | undefined;

  do {
    const response = await fetchAssetTransfersViaRPC({
      ...params,
      pageKey,
    });

    transfers.push(...response.transfers);
    pageKey = response.pageKey;
  } while (pageKey);

  return transfers;
}
