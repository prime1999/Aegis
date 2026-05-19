import { SiweMessage } from "siwe";

/**
 * Creates a SIWE message for wallet signing
 * Used to prove wallet ownership and create authenticated sessions
 */
export function createSiweMessage(
  address: string,
  chainId: number,
  nonce: string,
): SiweMessage {
  return new SiweMessage({
    domain: typeof window !== "undefined" ? window.location.host : "",
    address,
    statement: "Sign in with Ethereum to Aegis",
    uri: typeof window !== "undefined" ? window.location.origin : "",
    version: "1",
    chainId,
    nonce,
  });
}

/**
 * Generates a unique nonce for SIWE message
 */
export function generateNonce(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
