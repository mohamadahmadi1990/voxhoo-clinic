import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, LocateFixed, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { CategoryRail } from "@/components/category-rail";
import { ClinicResultsView } from "@/components/clinic-results-view";
import { DataNotice } from "@/components/data-notice";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { getClinicsByCategorySafe } from "@/db";
import { clinicCategories, getCategoryBySlug } from "@/lib/clinic-categories";
import {
  buildClinicSearchQuery,
  formatSearchDateLabel,
  getDistanceInKilometers,
  normalizeLocationParam,
  normalizeSearchDateParam,
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
  }>;
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
  const { date, location, lat, lng } = await searchParams;
  const currentCategory = getCategoryBySlug(category);

  if (!currentCategory) {
    notFound();
  }

  const clinicsResult = await getClinicsByCategorySafe(currentCategory.slug);
  const selectedDate = normalizeSearchDateParam(date);
  const selectedLocation = normalizeLocationParam(location);
  const userLocation = normalizeUserLocationParams({ lat, lng });
  const clinicsForDate = selectedDate
    ? clinicsResult.clinics.filter((clinic) => clinic.availableDates.includes(selectedDate))
    : clinicsResult.clinics;
  const exactAreaClinics = selectedLocation
    ? clinicsForDate.filter((clinic) => clinic.area === selectedLocation.label)
    : clinicsForDate;
  const isLocationFallback =
    Boolean(selectedLocation) && clinicsForDate.length > 0 && exactAreaClinics.length === 0;

  let clinics = exactAreaClinics;

  if (isLocationFallback && selectedLocation) {
    clinics = sortClinicsByDistance(clinicsForDate, selectedLocation.center);
  }

  if (userLocation) {
    clinics = sortClinicsByDistance(clinics, userLocation);
  }

  const selectedDateLabel = selectedDate
    ? formatSearchDateLabel(selectedDate)
    : null;
  const selectedLocationLabel = selectedLocation?.label ?? null;
  const sharedQuery = buildClinicSearchQuery({
    date: selectedDate,
    location: selectedLocation?.slug ?? null,
    userLocation,
  });
  const locationFallbackNotice =
    isLocationFallback && selectedLocation
      ? `No ${currentCategory.label.toLowerCase()} clinics are listed in ${selectedLocation.label} yet, so we're showing nearby Toronto-area clinics instead.`
      : null;

  return (
    <>
      <SiteHeader
        searchState={{
          category: currentCategory.slug,
          date: selectedDate,
          location: selectedLocation?.slug ?? null,
          userLocation,
        }}
      />
      <CategoryRail
        categories={clinicCategories}
        activeCategory={currentCategory.slug}
        queryString={sharedQuery}
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
              <p className="text-sm font-medium text-muted-foreground">
                Toronto clinic search
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {clinics.length} {currentCategory.label} clinics
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                {selectedLocationLabel && selectedDateLabel
                  ? `Showing ${currentCategory.label.toLowerCase()} clinics for ${selectedLocationLabel} with mock availability on ${selectedDateLabel}.`
                  : selectedLocationLabel
                    ? `Showing ${currentCategory.label.toLowerCase()} clinics for ${selectedLocationLabel}.`
                    : selectedDateLabel
                      ? `Showing ${currentCategory.label.toLowerCase()} clinics with mock availability on ${selectedDateLabel}.`
                      : "Compare clinics, ratings, addresses, and map positions in one calm browsing flow."}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Toronto clinics</span>
                </div>

                {userLocation ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/18 bg-accent px-4 py-2 text-sm font-medium text-foreground shadow-sm">
                    <LocateFixed className="h-4 w-4 text-primary" />
                    <span>Near your location</span>
                  </div>
                ) : selectedLocationLabel ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/18 bg-accent px-4 py-2 text-sm font-medium text-foreground shadow-sm">
                    <LocateFixed className="h-4 w-4 text-primary" />
                    <span>{selectedLocationLabel}</span>
                  </div>
                ) : null}

                {selectedDateLabel ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/18 bg-accent px-4 py-2 text-sm font-medium text-foreground shadow-sm">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span>{selectedDateLabel}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {clinicsResult.warning ? <DataNotice message={clinicsResult.warning} /> : null}
          {locationFallbackNotice ? <DataNotice message={locationFallbackNotice} /> : null}

          <ClinicResultsView
            categoryLabel={currentCategory.label}
            categorySlug={currentCategory.slug}
            clinics={clinics}
            selectedDateLabel={selectedDateLabel}
            selectedLocationLabel={selectedLocationLabel}
            selectedAreaCenter={selectedLocation?.center ?? null}
            userLocation={userLocation}
          />
        </div>
      </main>
    </>
  );
}

function sortClinicsByDistance<T extends { lat: number; lng: number; name: string }>(
  clinics: T[],
  origin: { lat: number; lng: number },
) {
  return [...clinics].sort((left, right) => {
    const leftDistance = getDistanceInKilometers(origin, left);
    const rightDistance = getDistanceInKilometers(origin, right);

    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    return left.name.localeCompare(right.name);
  });
}
