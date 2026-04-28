import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getClinicsByCategory, hasDatabaseUrl } from "@/db";
import { CategoryRail } from "@/components/category-rail";
import { ClinicResultsView } from "@/components/clinic-results-view";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { clinicCategories, getCategoryBySlug } from "@/lib/clinic-categories";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ClinicsByCategoryPageProps = {params: Promise<{ category: string }>;};

export async function generateMetadata({params,}: ClinicsByCategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const currentCategory = getCategoryBySlug(category);

  if (!currentCategory) {
    return {
      title: "Clinics not found | Care Atlas",
    };
  }

  return {
    title: `${currentCategory.label} Clinics | Care Atlas`,
    description: `Explore ${currentCategory.label.toLowerCase()} clinics on a list and map.`,
  };
}

export default async function ClinicsByCategoryPage({
  params,
}: ClinicsByCategoryPageProps) {
  const { category } = await params;
  const currentCategory = getCategoryBySlug(category);

  if (!currentCategory) {
    notFound();
  }

  const databaseReady = hasDatabaseUrl();
  const clinics = databaseReady
    ? await getClinicsByCategory(currentCategory.slug)
    : [];
  const alternateCategories = clinicCategories.filter(
    (entry) => entry.slug !== currentCategory.slug,
  );

  return (
    <>
      <SiteHeader />
      <CategoryRail
        categories={clinicCategories}
        activeCategory={currentCategory.slug}
      />

      <main className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "mb-3 rounded-full px-3 text-muted-foreground",
                )}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
              <p className="text-sm text-muted-foreground">
                Toronto clinics
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {clinics.length} {currentCategory.label} clinics
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                Compare clinics, ratings, addresses, and map positions in one calm
                browsing flow.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {alternateCategories.slice(0, 3).map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/clinics/${entry.slug}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "rounded-full px-4",
                  )}
                >
                  {entry.label}
                </Link>
              ))}
            </div>
          </div>

          {!databaseReady ? (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
              Add <code>DATABASE_URL</code> to <code>.env.local</code>, then run
              <code> npm run db:push</code> and <code> npm run db:seed</code> to
              load the Neon-backed clinic data for this page.
            </div>
          ) : null}

          <ClinicResultsView
            categoryLabel={currentCategory.label}
            categorySlug={currentCategory.slug}
            clinics={clinics}
          />
        </div>
      </main>
    </>
  );
}
