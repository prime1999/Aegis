import {
  fetchTransactionByHashViaRPC,
  type WalletScanTransfer,
} from "@/lib/alchemy";
import { resolveSepoliaProtocol } from "@/lib/scan/protocolRegistry";

export type ScanInfoResult = WalletScanTransfer & {
  tokenName: string | null;
  txTo: string | null;
  protocol: string | null;
  protocolKind: "dapp" | "bridge" | null;
};

async function getTxToByHash(transfers: WalletScanTransfer[]) {
  const txToByHash = new Map<string, string | null>();
  const uniqueHashes = Array.from(new Set(transfers.map((transfer) => transfer.txHash)));

  await Promise.all(
    uniqueHashes.map(async (hash) => {
      const tx = await fetchTransactionByHashViaRPC(hash).catch(() => null);
      txToByHash.set(hash, tx?.to ? tx.to.toLowerCase() : null);
    }),
  );

  return txToByHash;
}

export async function buildErc20ScanInfo(transfers: WalletScanTransfer[]) {
  const erc20Transfers = transfers.filter((transfer) => transfer.category === "erc20");
  const txToByHash = await getTxToByHash(erc20Transfers);

  return erc20Transfers.map((transfer) => {
    const txTo = txToByHash.get(transfer.txHash) || null;
    const protocolEntry = resolveSepoliaProtocol(txTo);

    return {
      ...transfer,
      tokenName: transfer.asset ?? null,
      txTo,
      protocol: protocolEntry?.protocol ?? null,
      protocolKind: protocolEntry?.kind ?? null,
    } satisfies ScanInfoResult;
  });
}

export default buildErc20ScanInfo;
