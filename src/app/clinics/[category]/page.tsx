import type { Metadata } from "next";
import { format, isValid, parseISO } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { CategoryRail } from "@/components/category-rail";
import { ClinicResultsView } from "@/components/clinic-results-view";
import { DataNotice } from "@/components/data-notice";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { getClinicsByCategorySafe } from "@/db";
import { clinicCategories, getCategoryBySlug } from "@/lib/clinic-categories";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ClinicsByCategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ date?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: ClinicsByCategoryPageProps): Promise<Metadata> {
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
  searchParams,
}: ClinicsByCategoryPageProps) {
  const { category } = await params;
  const { date } = await searchParams;
  const currentCategory = getCategoryBySlug(category);

  if (!currentCategory) {
    notFound();
  }

  const clinicsResult = await getClinicsByCategorySafe(currentCategory.slug);
  const selectedDate = normalizeSelectedDate(date);
  const clinics = selectedDate
    ? clinicsResult.clinics.filter((clinic) => clinic.availableDates.includes(selectedDate))
    : clinicsResult.clinics;
  const selectedDateLabel = selectedDate
    ? format(parseISO(selectedDate), "MMMM d, yyyy")
    : null;
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
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>Toronto clinics</span>
                {selectedDateLabel ? (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span>Availability on {selectedDateLabel}</span>
                  </>
                ) : null}
              </div>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {clinics.length} {currentCategory.label} clinics
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                {selectedDateLabel
                  ? `Showing ${currentCategory.label.toLowerCase()} clinics with mock availability on ${selectedDateLabel}.`
                  : "Compare clinics, ratings, addresses, and map positions in one calm browsing flow."}
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

          {clinicsResult.warning ? <DataNotice message={clinicsResult.warning} /> : null}

          <ClinicResultsView
            categoryLabel={currentCategory.label}
            categorySlug={currentCategory.slug}
            clinics={clinics}
            selectedDateLabel={selectedDateLabel}
          />
        </div>
      </main>
    </>
  );
}

function normalizeSelectedDate(value: string | string[] | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const parsedDate = parseISO(value);

  if (!isValid(parsedDate)) {
    return null;
  }

  return format(parsedDate, "yyyy-MM-dd") === value ? value : null;
}
