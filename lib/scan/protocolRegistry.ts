export type SepoliaProtocolEntry = {
  protocol: string;
  kind: "dapp" | "bridge";
};

const sepoliaProtocolRegistry = new Map<string, SepoliaProtocolEntry>([
  // Add explicit Sepolia tx.to addresses here as they are confirmed.
]);

export function resolveSepoliaProtocol(txTo?: string | null) {
  if (!txTo) return null;

  return sepoliaProtocolRegistry.get(txTo.trim().toLowerCase()) || null;
}

export default sepoliaProtocolRegistry;
