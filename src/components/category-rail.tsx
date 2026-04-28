import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import type { ClinicCategory, ClinicCategorySlug } from "@/lib/clinic-categories";
import { cn } from "@/lib/utils";

type CategoryRailProps = {
  categories: readonly ClinicCategory[];
  activeCategory?: ClinicCategorySlug;
};

export function CategoryRail({
  categories,
  activeCategory,
}: CategoryRailProps) {
  return (
    <div className="air-divider">
      <div className="mx-auto flex w-full max-w-7xl gap-7 overflow-x-auto px-6 py-4 sm:px-8 lg:px-10">
        {categories.map((category) => {
          const isActive = category.slug === activeCategory;

          return (
            <Link
              key={category.slug}
              href={`/clinics/${category.slug}`}
              className={cn(
                "group flex min-w-fit flex-col items-center gap-2 border-b-2 pb-3 text-sm transition-colors",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              <CategoryIcon
                category={category.slug}
                className={cn(
                  "h-5 w-5 transition-transform group-hover:-translate-y-0.5",
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
