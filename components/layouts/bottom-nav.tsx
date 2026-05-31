"use client";

import { Sparkle, ScanEye, BookType } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWalletScan } from "@/hooks/useWalletScan";

const bottomNavItems = [
  {
    label: "Star Scan",
    icon: ScanEye,
  },
  {
    label: "Translate Scan",
    icon: BookType,
  },
  {
    label: "Suggest Improvement",
    icon: Sparkle,
  },
] as const;

export function BottomNav() {
  const { scanWallet, isProcessing, scanStep } = useWalletScan();

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4 flex flex-col items-center justify-center sm:bottom-6">
      <div className="flex justify-center">
        <div className="flex w-60 flex-col items-center gap-2">
          <p className="text-sm text-black font-semiold bg-white/20 p-2 rounded-full">
            {scanStep}
          </p>
          <nav className="flex h-16 w-full items-center gap-2 rounded-4xl bg-black/40 p-4">
            <Button
              type="button"
              variant="ghost"
              onClick={scanWallet}
              disabled={isProcessing}
              className="h-11 flex-1 rounded-full text-white bg-black px-3 cursor-pointer hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ScanEye className="h-12 w-12" />
            </Button>
          </nav>
        </div>
      </div>
      <div className="flex w-full items-center gap-3 pt-2 mt-2">
        <hr className="flex-1 border-border-default" />
        <h6 className="font-jura text-lg font-bold text-text-primary">
          priime
        </h6>
        <hr className="flex-1 border-border-default" />
      </div>
    </div>
  );
}
