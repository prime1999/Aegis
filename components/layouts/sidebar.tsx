"use client";

import { useEffect, useRef } from "react";

import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { ArrowLeftRight, BadgeCheck, Coins } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  type WalletAnalysisEntry,
  type WalletAnalysisSnapshot,
  walletAnalysisQueryKey,
} from "@/hooks/useWalletScan";

type SidebarProps = {
  className?: string;
};

const categoryIcons = {
  external: ArrowLeftRight,
  erc20: Coins,
  erc721: BadgeCheck,
};

gsap.registerPlugin(ScrollTrigger);

export function Sidebar({ className }: SidebarProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const resultRefs = useRef<Array<HTMLLIElement | null>>([]);
  const { data } = useQuery<WalletAnalysisSnapshot | null>({
    queryKey: walletAnalysisQueryKey,
    enabled: false,
    staleTime: Infinity,
    initialData: null,
  });

  const analysisItems = data?.items ?? [];

  const handleGetUpdate = async (item: WalletAnalysisEntry) => {
    try {
      const response = await fetch(
        `/api/updates?symbols=${encodeURIComponent(item.symbol)}`,
      );
      const payload = await response.json().catch(() => null);

      console.log("Wallet analysis update response:", payload);
    } catch (error) {
      console.error("Wallet analysis update request failed:", error);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current) {
        return;
      }

      gsap.fromTo(
        containerRef.current,
        {
          opacity: 0,
          x: -28,
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

      resultRefs.current.forEach((element) => {
        if (!element || !listRef.current) {
          return;
        }

        gsap.fromTo(
          element,
          {
            opacity: 0,
            y: 18,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              scroller: listRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, [analysisItems.length]);

  return (
    <aside
      ref={containerRef}
      className={cn(
        "flex h-96 w-full flex-col overflow-hidden rounded-4xl border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] p-5 text-text-primary shadow-[0_28px_90px_rgba(9,15,30,0.16)] backdrop-blur-3xl sm:h-120 lg:h-105",
        className,
      )}
    >
      <div className="border-b border-white/10 pb-4">
        <p className="text-xs uppercase tracking-[0.35em] text-text-secondary/80">
          AI Analysis
        </p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-(--font-jura) text-2xl text-text-primary sm:text-[2rem]">
              Wallet activity digest
            </h2>
          </div>
        </div>
      </div>

      <div
        ref={listRef}
        className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-thin [scrollbar-color:rgba(255,255,255,0.35)_transparent]"
      >
        <ul className="space-y-3 pb-2">
          {analysisItems.length > 0 ? (
            analysisItems.map((item: WalletAnalysisEntry, index) => {
              const Icon = categoryIcons[item.category];

              return (
                <li
                  key={`${item.transactionHash}-${index}`}
                  ref={(element) => {
                    resultRefs.current[index] = element;
                  }}
                  className="rounded-[1.4rem] border border-white/10 bg-bg-base/40 p-2 backdrop-blur-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-text-primary shadow-inner shadow-black/10">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-primary">
                          {item.category} {item.direction}
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleGetUpdate(item)}
                          className="shrink-0 rounded-full border bg-black px-2.5 py-1 text-[11px] font-medium capitalize cursor-pointer duration-500 text-white hover:bg-black/80"
                        >
                          Get Update
                        </button>
                      </div>

                      <p className="mt-1 text-xs text-text-secondary">
                        {item.summary}
                      </p>

                      <p className="mt-3 text-xs uppercase tracking-[0.22em] text-text-secondary/80">
                        {item.evidence}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="rounded-[1.4rem] border border-dashed border-white/10 bg-bg-base/25 p-5 text-sm leading-6 text-text-secondary backdrop-blur-xl">
              Run the wallet scan and AI analysis to populate this panel with
              the actual analyzed transactions.
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
}
