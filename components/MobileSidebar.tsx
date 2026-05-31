"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  type WalletAnalysisSnapshot,
  walletAnalysisQueryKey,
} from "@/hooks/useWalletScan";
import { cn } from "@/lib/utils";
import { Sidebar } from "./layouts/sidebar";

type MobileSidebarProps = {
  className?: string;
};

export function MobileSidebar({ className }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const { data } = useQuery<WalletAnalysisSnapshot | null>({
    queryKey: walletAnalysisQueryKey,
    enabled: false,
    staleTime: Infinity,
    initialData: null,
  });

  const analysisItems = data?.items ?? [];

  if (analysisItems.length === 0) {
    return null;
  }

  return (
    <div className={cn("lg:hidden", className)}>
      <Sheet key="left" open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2 rounded-4xl border bg-black px-4 text-sm font-medium text-white/80 shadow-sm duration-500 hover:bg-black/70"
          >
            <PanelLeftOpen className="h-5 w-5" />
            See analysis
          </Button>
        </SheetTrigger>

        <SheetContent
          side="bottom"
          className="h-[86dvh] rounded-t-[1.75rem] border border-border-default/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.82))] text-text-primary shadow-[0_-24px_80px_rgba(9,15,30,0.18)] backdrop-blur-3xl"
        >
          <Sidebar
            className="lg:sticky lg:top-24"
            onUpdateFetched={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
