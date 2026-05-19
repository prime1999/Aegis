"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LogOut, Repeat2 } from "lucide-react";
import { toHex } from "viem";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";

import { Button } from "@/components/ui/button";
import { encodeWalletAddress } from "@/lib/helperfunctions";
import { useSiweLogin } from "@/hooks/useSiweLogin";
import { mantleTestnet } from "@/lib/wagmi/chains";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const injectedConnector = useMemo(
    () =>
      connectors.find((connector) => connector.id === "injected") ??
      connectors[0],
    [connectors],
  );

  const ensureMantleSepolia = useCallback(async () => {
    if (!injectedConnector) {
      throw new Error("No injected wallet connector available.");
    }

    try {
      await switchChainAsync({ chainId: mantleTestnet.id });
      return;
    } catch (error) {
      const provider = (await injectedConnector.getProvider()) as
        | {
            request?: (args: {
              method: string;
              params?: unknown[];
            }) => Promise<unknown>;
          }
        | undefined;

      if (!provider?.request) {
        throw error;
      }

      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: toHex(mantleTestnet.id),
            chainName: mantleTestnet.name,
            nativeCurrency: mantleTestnet.nativeCurrency,
            rpcUrls: mantleTestnet.rpcUrls.default.http,
            blockExplorerUrls: mantleTestnet.blockExplorers?.default.url
              ? [mantleTestnet.blockExplorers.default.url]
              : undefined,
          },
        ],
      });

      await switchChainAsync({ chainId: mantleTestnet.id });
    }
  }, [injectedConnector, switchChainAsync]);

  const connectWallet = useCallback(async () => {
    if (!injectedConnector) {
      return;
    }

    setIsBusy(true);

    try {
      await connectAsync({ connector: injectedConnector });
      await ensureMantleSepolia();
      setIsPopoverOpen(false);
    } catch (error) {
      console.error("Wallet connection error:", error);
    } finally {
      setIsBusy(false);
    }
  }, [connectAsync, ensureMantleSepolia, injectedConnector]);

  const switchWallet = useCallback(async () => {
    if (!injectedConnector) {
      return;
    }

    setIsBusy(true);

    try {
      setIsPopoverOpen(false);
      await disconnectAsync();
      await connectAsync({ connector: injectedConnector });
      await ensureMantleSepolia();
    } catch (error) {
      console.error("Wallet switch error:", error);
    } finally {
      setIsBusy(false);
    }
  }, [connectAsync, disconnectAsync, ensureMantleSepolia, injectedConnector]);

  const disconnectWallet = useCallback(async () => {
    setIsBusy(true);

    try {
      setIsPopoverOpen(false);
      await disconnectAsync();
    } catch (error) {
      console.error("Wallet disconnect error:", error);
    } finally {
      setIsBusy(false);
    }
  }, [disconnectAsync]);

  const { login: siweLogin } = useSiweLogin();

  const handleSignIn = useCallback(async () => {
    setIsBusy(true);
    try {
      await siweLogin();
      setIsPopoverOpen(false);
    } catch (err) {
      console.error("SIWE sign-in error:", err);
    } finally {
      setIsBusy(false);
    }
  }, [siweLogin]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const buttonLabel = address ? encodeWalletAddress(address) : "Connect Wallet";

  if (!isConnected) {
    return (
      <Button
        type="button"
        onClick={connectWallet}
        disabled={isBusy}
        className="h-10 rounded-2xl bg-text-primary px-4 text-sm font-medium text-bg-elevated shadow-sm cursor-pointer duration-500 hover:bg-text-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isBusy ? "Connecting..." : buttonLabel}
      </Button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        onClick={() => setIsPopoverOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={isPopoverOpen}
        className="h-10 max-w-[11rem] rounded-2xl bg-text-primary px-4 text-sm font-medium text-bg-elevated shadow-sm cursor-pointer duration-500 hover:bg-text-primary/90"
      >
        <span className="truncate">{buttonLabel}</span>
      </Button>

      {isPopoverOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-72 rounded-3xl border border-border-default/80 bg-bg-elevated p-3 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
          <div className="mb-3 space-y-1">
            <p className="text-sm font-semibold text-text-primary">
              Wallet connected
            </p>
            <p className="text-xs leading-5 text-text-secondary">
              Switch to another wallet or disconnect this session.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              onClick={handleSignIn}
              disabled={isBusy}
              variant="outline"
              className="w-full justify-start gap-2 rounded-2xl border-border-default/80 cursor-pointer"
            >
              Sign in
            </Button>

            <Button
              type="button"
              onClick={switchWallet}
              disabled={isBusy}
              variant="outline"
              className="w-full justify-start gap-2 rounded-2xl border-border-default/80 cursor-pointer"
            >
              <Repeat2 className="h-4 w-4" />
              Switch Wallet
            </Button>

            <Button
              type="button"
              onClick={disconnectWallet}
              disabled={isBusy}
              variant="outline"
              className="w-full justify-start gap-2 rounded-2xl border-border-default/80 cursor-pointer text-red-500 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
