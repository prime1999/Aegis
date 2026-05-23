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
  const { scanWallet, isScanning } = useWalletScan();

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 sm:bottom-6">
      <nav className="flex h-16 w-60 items-center gap-2 rounded-4xl bg-bg-subtle p-4">
        {bottomNavItems.map(({ label, icon: Icon }, index) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            onClick={index === 0 ? scanWallet : undefined}
            disabled={index === 0 ? isScanning : false}
            aria-label={label}
            className="h-11 flex-1 rounded-4xl border border-transparent bg-transparent px-3 text-text-secondary cursor-pointer hover:bg-bg-surface hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </nav>
    </div>
  );
}
