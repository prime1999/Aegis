import { SiweMessage } from "siwe";

/**
 * Verifies a signed SIWE message
 * Should only be called from server/API routes
 */
export async function verifySiweMessage(
  message: string,
  signature: string,
): Promise<{
  success: boolean;
  address?: string;
  error?: string;
}> {
  try {
    const siweMessage = new SiweMessage(message);
    const isValid = await siweMessage.verify({ signature });

    if (!isValid) {
      return {
        success: false,
        error: "Invalid signature",
      };
    }

    return {
      success: true,
      address: siweMessage.address,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}
