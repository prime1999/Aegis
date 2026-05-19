import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-dvh w-full flex-col border border-border-default bg-bg-base lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:w-80 lg:rounded-3xl",
        className,
      )}
    >
      <div className="flex items-center justify-end border-b border-border-subtle px-4 py-4 lg:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full border border-border-default bg-bg-base text-text-secondary shadow-sm hover:bg-bg-elevated hover:text-text-primary"
          aria-label="Close right panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-1" aria-hidden="true" />
    </aside>
  );
}
