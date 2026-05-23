const alchemyRpcUrl = process.env.ALCHEMY_RPC_URL || "";

if (!alchemyRpcUrl) {
  console.warn(
    "Alchemy RPC URL not configured — wallet scans will fail until set.",
  );
}

export const walletScanCategories = ["external", "erc20", "erc721"] as const;

export const walletScanLookbackDays = 1;

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

type RpcLog = {
  address: string;
  blockNumber: string;
  blockHash: string;
  transactionHash: string;
  transactionIndex: string;
  logIndex: string;
  topics: string[];
  data: string;
};

function toHexBlockNumber(blockNumber: number) {
  return `0x${blockNumber.toString(16)}`;
}

async function fetchRpc<T>(method: string, params: unknown[]): Promise<T> {
  if (!alchemyRpcUrl) {
    throw new Error("Alchemy RPC URL is missing");
  }

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
  console.log("payload: ", payload);

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

export async function fetchTransfersViaRPC(params: any) {
  return fetchRpc<RpcLog[]>("eth_getLogs", [params]);
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
