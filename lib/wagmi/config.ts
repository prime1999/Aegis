import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { sepolia } from "./chains";

/**
 * Wagmi configuration with injected wallet connector
 * Supports MetaMask, Rabby, and other injected providers
 * Uses Ethereum Sepolia
 */
export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: true,
});
