/**
 * Helper function to encode/truncate wallet addresses for display
 * Shows first 6 characters and last 4 characters with ellipsis
 * Example: 0x33rtf89...986c becomes display format
 * @param address - Full wallet address to encode
 * @returns Encoded address string (e.g., '0x33rt...986c')
 */
export function encodeWalletAddress(address: string): string {
  if (!address || address.length < 12) {
    return address;
  }
  const start = address.slice(0, 6);
  const end = address.slice(-3);
  return `${start}......${end}`;
}
