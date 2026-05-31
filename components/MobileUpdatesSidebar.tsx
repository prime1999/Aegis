"use client";

import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  type UpdateFeedSnapshot,
  updateFeedQueryKey,
} from "@/lib/updates/feed";
import { cn } from "@/lib/utils";
import { UpdatesSidebar } from "./updatesSidebar";

type MobileUpdatesSidebarProps = {
  className?: string;
};

export function MobileUpdatesSidebar({ className }: MobileUpdatesSidebarProps) {
  const { data: feed } = useQuery<UpdateFeedSnapshot | null>({
    queryKey: updateFeedQueryKey,
    enabled: false,
    staleTime: Infinity,
    initialData: null,
  });

  const updates = feed?.updates ?? [];

  if (updates.length === 0) {
    return null;
  }

  return (
    <div className={cn("lg:hidden", className)}>
      <Sheet key="right">
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-4xl border border-border-default bg-bg-surface px-4 text-sm font-medium text-text-primary shadow-sm hover:bg-bg-elevated"
          >
            Open updates
          </Button>
        </SheetTrigger>

        <SheetContent
          side="bottom"
          className="h-[86dvh] rounded-t-[1.75rem] border border-border-default/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.82))] text-text-primary shadow-[0_-24px_80px_rgba(9,15,30,0.18)] backdrop-blur-3xl"
        >
          <UpdatesSidebar className="lg:sticky lg:top-24" />
        </SheetContent>
      </Sheet>
    </div>
  );
}
