import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-default/80 bg-bg-base/85 backdrop-blur-xl supports-backdrop-filter:bg-bg-base/75">
      <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <p className="font-jura text-lg font-bold tracking-[0.35em] text-text-primary">
            AEGIS
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-2xl bg-text-primary px-4 text-sm font-medium text-bg-elevated shadow-sm cursor-pointer duration-500 hover:bg-text-primary/90"
          >
            Connect Wallet
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full cursor-pointer text-text-secondary hover:text-text-primary"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
