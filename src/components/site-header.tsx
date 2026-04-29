import Link from "next/link";
import { Cross } from "lucide-react";
import { CategorySearch } from "@/components/category-search";
import { clinicCategories, type ClinicCategorySlug } from "@/lib/clinic-categories";
import type { ClinicAreaSlug, UserLocation } from "@/lib/clinic-search";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  className?: string;
  showSearch?: boolean;
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
  searchState,
}: SiteHeaderProps) {
  return (
    <header className={cn("sticky top-0 z-40 bg-background/95 backdrop-blur-md air-divider", className)}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-8 py-2 sm:px-10 lg:px-14">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Cross className="h-3 w-3" />
          </div>
          <div>
            <p className="text-[0.9rem] font-semibold tracking-tight text-primary">Care Atlas</p>
            <p className="text-[0.66rem] text-muted-foreground">Discover clinics</p>
          </div>
        </Link>

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
    </header>
  );
}
