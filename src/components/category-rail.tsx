import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import type { ClinicCategory, ClinicCategorySlug } from "@/lib/clinic-categories";
import { cn } from "@/lib/utils";

type CategoryRailProps = {
  categories: readonly ClinicCategory[];
  activeCategory?: ClinicCategorySlug;
  queryString?: string;
};

export function CategoryRail({
  categories,
  activeCategory,
  queryString = "",
}: CategoryRailProps) {
  return (
    <div className="hidden air-divider md:block">
      <div className="mx-auto flex w-full max-w-7xl gap-5 overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:gap-7 sm:px-8 sm:py-4 lg:px-10 [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => {
          const isActive = category.slug === activeCategory;

          return (
            <Link
              key={category.slug}
              href={`/clinics/${category.slug}${queryString}`}
              className={cn(
                "group flex min-w-fit flex-col items-center gap-1.5 border-b-2 pb-2.5 text-[0.8rem] transition-colors sm:gap-2 sm:pb-3 sm:text-sm",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              <CategoryIcon
                category={category.slug}
                className={cn(
                  "h-4 w-4 transition-transform group-hover:-translate-y-0.5 sm:h-5 sm:w-5",
                  isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span className="font-medium">{category.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
