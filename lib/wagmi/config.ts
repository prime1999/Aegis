import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { mantle, mantleTestnet } from "./chains";

/**
 * Wagmi configuration with injected wallet connector
 * Supports MetaMask, Rabby, and other injected providers
 * Uses Mantle mainnet and testnet
 */
export const wagmiConfig = createConfig({
  chains: [mantle, mantleTestnet],
  connectors: [injected()],
  transports: {
    [mantle.id]: http(),
    [mantleTestnet.id]: http(),
  },
  ssr: true,
});
