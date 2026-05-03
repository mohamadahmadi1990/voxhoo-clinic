import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { ClinicResultsView } from "@/components/clinic-results-view";
import { DataNotice } from "@/components/data-notice";
import { ResultsSortSelect } from "@/components/results-sort-select";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { getClinicsByCategoryLocationAndDate } from "@/db";
import { getCategoryBySlug } from "@/lib/clinic-categories";
import { refineClinicsForResults } from "@/lib/clinic-results";
import {
  formatSearchDateLabel,
  normalizeLocationParam,
  normalizeSearchDateParam,
  normalizeSortParam,
  normalizeUserLocationParams,
} from "@/lib/clinic-search";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ClinicsByCategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    date?: string | string[];
    location?: string | string[];
    lat?: string | string[];
    lng?: string | string[];
    sort?: string | string[];
  }>;
};

export async function generateMetadata({
  params,
}: ClinicsByCategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const currentCategory = getCategoryBySlug(category);

  if (!currentCategory) {
    return {
      title: "Clinics not found | Voxhoo Clinic",
    };
  }

  return {
    title: `${currentCategory.label} Clinics | Voxhoo Clinic`,
    description: `Explore ${currentCategory.label.toLowerCase()} clinics on a list and map.`,
  };
}

export default async function ClinicsByCategoryPage({
  params,
  searchParams,
}: ClinicsByCategoryPageProps) {
  const { category } = await params;
  const { date, location, lat, lng, sort } = await searchParams;
  const currentCategory = getCategoryBySlug(category);

  if (!currentCategory) {
    notFound();
  }

  const selectedDate = normalizeSearchDateParam(date);
  const selectedLocation = normalizeLocationParam(location);
  const userLocation = normalizeUserLocationParams({ lat, lng });
  const selectedSort = normalizeSortParam(sort);
  const storedClinics = await getClinicsByCategoryLocationAndDate(currentCategory.slug, {
    selectedLocation,
    userLocation,
    date: selectedDate,
  });
  const { clinics, isLocationFallback } = refineClinicsForResults({
    clinics: storedClinics,
    selectedDate,
    selectedLocation,
    userLocation,
    sort: selectedSort,
  });

  const selectedDateLabel = selectedDate
    ? formatSearchDateLabel(selectedDate)
    : null;
  const selectedLocationLabel = selectedLocation?.label ?? null;
  const locationFallbackNotice =
    isLocationFallback && selectedLocation
      ? `No ${currentCategory.label.toLowerCase()} clinics are listed in ${selectedLocation.label} yet, so we're showing nearby Toronto-area clinics instead.`
      : null;

  return (
    <>
      <SiteHeader
        mobileBackHref="/"
        mobileBackLabel="Back"
        searchState={{
          category: currentCategory.slug,
          date: selectedDate,
          location: selectedLocation?.slug ?? null,
          userLocation,
        }}
      />

      <main className="mx-auto -mt-[61px] w-full max-w-7xl px-0 py-0 md:mt-0 md:px-4 md:py-6 lg:px-10">
        <div className="flex flex-col gap-6">
          <div className="hidden md:flex">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "rounded-full px-3 text-muted-foreground",
              )}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </div>

          {locationFallbackNotice ? <DataNotice message={locationFallbackNotice} /> : null}

          <ClinicResultsView
            categoryLabel={currentCategory.label}
            categorySlug={currentCategory.slug}
            clinics={clinics}
            selectedDateLabel={selectedDateLabel}
            selectedLocationLabel={selectedLocationLabel}
            selectedAreaCenter={selectedLocation?.center ?? null}
            selectedSort={selectedSort}
            userLocation={userLocation}
          />
        </div>
      </main>
    </>
  );
}
