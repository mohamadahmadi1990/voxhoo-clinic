"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Cross, Menu, X } from "lucide-react";
import { CategorySearch } from "@/components/category-search";
import { Button } from "@/components/ui/button";
import { clinicCategories, type ClinicCategorySlug } from "@/lib/clinic-categories";
import type { ClinicAreaSlug, UserLocation } from "@/lib/clinic-search";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  className?: string;
  showSearch?: boolean;
  mobileBackHref?: string | null;
  mobileBackLabel?: string;
  searchState?: {
    category?: ClinicCategorySlug | null;
    date?: string | null;
    location?: ClinicAreaSlug | null;
    userLocation?: UserLocation | null;
  };
};

export function SiteHeader({
  className,
  showSearch = true,
  mobileBackHref = null,
  mobileBackLabel = "Back",
  searchState,
}: SiteHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className={cn("sticky top-0 z-40 bg-background/95 backdrop-blur-md air-divider", className)}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8 lg:px-14">
        {mobileBackHref ? (
          <Link
            href={mobileBackHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            {mobileBackLabel}
          </Link>
        ) : null}

        <Link
          href="/"
          className={cn(
            "inline-flex items-center gap-2.5 sm:gap-3",
            mobileBackHref ? "hidden md:inline-flex" : "",
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Cross className="h-3 w-3" />
          </div>
          <div>
            <p className="text-[0.9rem] font-semibold tracking-tight text-primary">
              Voxhoo Clinic
            </p>
            <p className="text-[0.66rem] text-muted-foreground">Discover clinics</p>
          </div>
        </Link>

        {showSearch ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={isMobileMenuOpen ? "Close search menu" : "Open search menu"}
            className="size-10 rounded-full md:hidden"
            onClick={() => {
              setIsMobileMenuOpen((currentValue) => !currentValue);
            }}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        ) : null}

        {showSearch ? (
          <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            <CategorySearch
              categories={clinicCategories}
              variant="compact"
              initialCategory={searchState?.category ?? null}
              initialDate={searchState?.date ?? null}
              initialLocation={searchState?.location ?? null}
              initialUserLocation={searchState?.userLocation ?? null}
              showHelperText={false}
              showCategoryMarquee={false}
            />
          </div>
        ) : (
          <div className="hidden flex-1 md:block" />
        )}

        <div className="hidden items-center rounded-full border border-border bg-white px-3 py-1 text-[0.68rem] font-medium text-foreground shadow-sm xl:inline-flex">
          Toronto, ON
        </div>
      </div>

      {showSearch && isMobileMenuOpen ? (
        <div className="border-t border-border bg-background px-4 pb-4 pt-3 md:hidden">
          <CategorySearch
            categories={clinicCategories}
            variant="compact"
            initialCategory={searchState?.category ?? null}
            initialDate={searchState?.date ?? null}
            initialLocation={searchState?.location ?? null}
            initialUserLocation={searchState?.userLocation ?? null}
            showHelperText={false}
            showCategoryMarquee={false}
          />
        </div>
      ) : null}
    </header>
  );
}
