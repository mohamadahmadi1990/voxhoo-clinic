import Link from "next/link";
import { Cross, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  className?: string;
};

export function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <header className={cn("sticky top-0 z-40 bg-background/95 backdrop-blur-md air-divider", className)}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-8 lg:px-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Cross className="h-4 w-4" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-primary">Care Atlas</p>
            <p className="text-xs text-muted-foreground">Discover clinics</p>
          </div>
        </Link>

        <div className="hidden min-w-[420px] max-w-[520px] flex-1 items-center justify-center md:flex">
          <div className="flex w-full items-center rounded-full border border-border bg-white px-2 py-2 shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_10px_26px_rgba(0,0,0,0.12)]">
            <div className="min-w-0 flex-1 rounded-full px-5 py-2">
              <p className="text-xs font-semibold text-foreground">Care type</p>
              <p className="truncate text-sm text-muted-foreground">
                Dental, family doctor, physio...
              </p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="px-5 py-2">
              <p className="text-xs font-semibold text-foreground">Where</p>
              <p className="text-sm text-muted-foreground">Toronto</p>
            </div>
            <div className="ml-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Search className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="inline-flex items-center rounded-full border border-border bg-white px-4 py-3 text-sm font-medium text-foreground shadow-sm">
          Toronto, ON
        </div>
      </div>
    </header>
  );
}
