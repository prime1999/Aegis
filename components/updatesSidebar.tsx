"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import { Newspaper, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type WalletAnalysisSnapshot,
  walletAnalysisQueryKey,
} from "@/hooks/useWalletScan";
import { cn } from "@/lib/utils";
import Link from "next/link";

type UpdatesSidebarProps = {
  className?: string;
};

type CryptoCompareUpdate = {
  title?: string;
  body?: string;
  url?: string;
  categories?: string;
  categoriesTags?: string;
  source_info?: {
    name?: string;
  };
  source?: string;
  published_on?: number;
  imageurl?: string;
};

type UpdatesApiResponse = {
  data?: {
    Data?: CryptoCompareUpdate[];
  };
  error?: string;
};

function formatPublishedOn(publishedOn?: number) {
  if (!publishedOn) {
    return "Recently updated";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(publishedOn * 1000));
}

function getPreviewText(text?: string) {
  if (!text) {
    return "No update summary is available for this update.";
  }

  if (text.length <= 180) {
    return text;
  }

  return `${text.slice(0, 180).trimEnd()}...`;
}

export function UpdatesSidebar({ className }: UpdatesSidebarProps) {
  const [selectedUpdate, setSelectedUpdate] =
    useState<CryptoCompareUpdate | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const { data: analysis } = useQuery<WalletAnalysisSnapshot | null>({
    queryKey: walletAnalysisQueryKey,
    enabled: false,
    staleTime: Infinity,
    initialData: null,
  });

  const symbols = useMemo(() => {
    const uniqueSymbols = new Set(
      (analysis?.items ?? [])
        .map((item) => item.symbol?.trim())
        .filter((symbol): symbol is string => Boolean(symbol)),
    );

    return Array.from(uniqueSymbols);
  }, [analysis?.items]);

  const symbolKey = symbols.join(",");

  const { data: updates = [], isFetching } = useQuery<CryptoCompareUpdate[]>({
    queryKey: ["updates", symbolKey],
    enabled: symbols.length > 0,
    staleTime: 60_000,
    queryFn: async () => {
      const response = await fetch(
        `/api/updates?symbols=${encodeURIComponent(symbolKey)}`,
      );

      const payload = (await response
        .json()
        .catch(() => null)) as UpdatesApiResponse | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Updates request failed");
      }

      const rawUpdates = payload?.data?.Data;

      return Array.isArray(rawUpdates) ? rawUpdates : [];
    },
  });

  const hasWalletAnalysis = symbols.length > 0;
  const hasReadyUpdates = updates.length > 0;

  useLayoutEffect(() => {
    if (!hasWalletAnalysis || isFetching || !hasReadyUpdates) {
      return;
    }

    const ctx = gsap.context(() => {
      if (!containerRef.current) {
        return;
      }

      const cards = containerRef.current.querySelectorAll("[data-update-card]");

      gsap.fromTo(
        containerRef.current,
        {
          opacity: 0,
          x: 28,
          filter: "blur(12px)",
        },
        {
          opacity: 1,
          x: 0,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power3.out",
        },
      );

      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 18,
            scale: 0.98,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.08,
            ease: "power2.out",
            delay: 0.12,
          },
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [
    hasReadyUpdates,
    hasWalletAnalysis,
    isFetching,
    updates.length,
    symbols.length,
  ]);

  if (!hasWalletAnalysis || isFetching || !hasReadyUpdates) {
    return null;
  }

  return (
    <>
      <aside
        ref={containerRef}
        className={cn(
          "flex h-96 w-full flex-col overflow-hidden rounded-4xl border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] p-5 text-text-primary shadow-[0_28px_90px_rgba(9,15,30,0.16)] backdrop-blur-3xl sm:h-120 lg:h-105",
          className,
        )}
      >
        <div className="border-b border-white/10 pb-4">
          <p className="text-xs uppercase tracking-[0.35em] text-text-secondary/80">
            Updates
          </p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-(--font-jura) text-2xl text-text-primary sm:text-[2rem]">
                Wallet update feed
              </h2>
            </div>
          </div>
        </div>

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-thin [scrollbar-color:rgba(255,255,255,0.35)_transparent]">
          <ul className="space-y-3 pb-2">
            {symbols.length === 0 ? (
              <li className="rounded-[1.4rem] border border-dashed border-white/10 bg-bg-base/25 p-5 text-sm leading-6 text-text-secondary backdrop-blur-xl">
                Run the wallet scan and AI analysis to populate this panel with
                the latest updates for the detected symbols.
              </li>
            ) : updates.length > 0 ? (
              updates.map((update, index) => (
                <li
                  key={`${update.title ?? "update"}-${index}`}
                  data-update-card
                  className="rounded-[1.4rem] border border-white/10 bg-bg-base/40 p-2 backdrop-blur-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-text-primary shadow-inner shadow-black/10">
                      <Newspaper className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-primary">
                            {update.title || "Market update"}
                          </h3>
                          <p className="mt-1 h-12.5 text-[11px] uppercase tracking-[0.18em] text-text-secondary/80">
                            {update.source_info?.name ||
                              update.source ||
                              "CryptoCompare"}
                          </p>
                        </div>

                        <Button
                          type="button"
                          onClick={() => setSelectedUpdate(update)}
                          className="shrink-0 rounded-full border bg-black px-2.5 py-1 text-[11px] font-medium capitalize cursor-pointer duration-500 text-white hover:bg-black/80"
                        >
                          View Update
                        </Button>
                      </div>

                      <p className="text-xs text-text-secondary">
                        {getPreviewText(update.body)}
                      </p>

                      <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-text-secondary/80">
                        {formatPublishedOn(update.published_on)}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            ) : isFetching ? (
              <li className="rounded-[1.4rem] border border-dashed border-white/10 bg-bg-base/25 p-5 text-sm leading-6 text-text-secondary backdrop-blur-xl">
                Loading updates for the detected symbols.
              </li>
            ) : (
              <li className="rounded-[1.4rem] border border-dashed border-white/10 bg-bg-base/25 p-5 text-sm leading-6 text-text-secondary backdrop-blur-xl">
                No updates were returned for the current wallet analysis.
              </li>
            )}
          </ul>
        </div>
      </aside>

      <Dialog
        open={selectedUpdate !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUpdate(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl h-100 overflow-auto no-scrollbar bg-bg-base text-text-primary shadow-[0_28px_90px_rgba(9,15,30,0.16)]">
          <div className="flex min-h-full flex-col">
            <div className="flex-1 space-y-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-jura font-semibold">
                  {selectedUpdate?.title || "Market update"}
                </DialogTitle>
                <DialogDescription className="text-xs text-text-secondary">
                  {selectedUpdate
                    ? `${selectedUpdate.source_info?.name || selectedUpdate.source || "CryptoCompare"} · ${formatPublishedOn(selectedUpdate.published_on)}`
                    : ""}
                </DialogDescription>
              </DialogHeader>

              {selectedUpdate ? (
                <div className="font-geist-sans space-y-4 text-sm text-text-secondary">
                  <p className="leading-6 text-text-primary">
                    {selectedUpdate.body ||
                      "No article body was returned for this update."}
                  </p>

                  <div className="space-y-2">
                    <p>
                      <span className="font-medium text-text-primary">
                        Source:{" "}
                      </span>
                      {selectedUpdate.source_info?.name ||
                        selectedUpdate.source ||
                        "CryptoCompare"}
                    </p>

                    <Link
                      href={selectedUpdate.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold font-geist-sans text-xs text-white px-4 py-2 rounded-full bg-black duration-500 hover:bg-black/70"
                    >
                      Visit Site
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="sticky bottom-0 -mx-4 -mb-8 mt-6 px-2 py-2 w-full">
              <Button
                type="button"
                className="flex items-center justify-center w-8/12 ml-14 rounded-full border border-white/10 bg-black/70 px-4 py-3 text-sm font-medium text-white backdrop-blur-xl cursor-pointer duration-500 hover:bg-black/80"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Ask AI to translate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
