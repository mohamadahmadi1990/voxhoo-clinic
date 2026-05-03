"use client";

import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Compass, MapPin, Phone, Star } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { ClinicDetailDrawer } from "@/components/clinic-detail-drawer";
import { ClinicMap } from "@/components/clinic-map";
import { ResultsSortSelect } from "@/components/results-sort-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ClinicListItem } from "@/db";
import type { ClinicCategorySlug } from "@/lib/clinic-categories";
import {
  formatDistanceLabel,
  getDistanceInKilometers,
  type ClinicSortOption,
  type UserLocation,
} from "@/lib/clinic-search";
import { getCategoryTheme } from "@/lib/category-theme";
import { cn } from "@/lib/utils";

type ClinicResultsViewProps = {
  categoryLabel: string;
  categorySlug: ClinicCategorySlug;
  clinics: ClinicListItem[];
  selectedDateLabel?: string | null;
  selectedLocationLabel?: string | null;
  selectedAreaCenter?: UserLocation | null;
  selectedSort: ClinicSortOption;
  userLocation?: UserLocation | null;
};

export function ClinicResultsView({
  categoryLabel,
  categorySlug,
  clinics,
  selectedDateLabel = null,
  selectedLocationLabel = null,
  selectedAreaCenter = null,
  selectedSort,
  userLocation = null,
}: ClinicResultsViewProps) {
  const [activeClinicId, setActiveClinicId] = useState<number | null>(null);
  const [detailClinicId, setDetailClinicId] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [drawerHeight, setDrawerHeight] = useState<"collapsed" | "mid" | "expanded">("mid");
  const mapSectionRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const drawerTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!activeClinicId) {
      return;
    }

    cardRefs.current[activeClinicId]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeClinicId]);

  function focusClinic(clinicId: number | null, scrollToMap = false) {
    setActiveClinicId(clinicId);
    setDetailClinicId((currentDetailClinicId) =>
      currentDetailClinicId === clinicId ? currentDetailClinicId : null,
    );

    if (scrollToMap && clinicId && window.innerWidth < 1024) {
      mapSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function selectClinicFromCard(clinicId: number) {
    drawerTriggerRef.current = null;

    flushSync(() => {
      setActiveClinicId(clinicId);
      setDetailClinicId(null);
    });
  }

  function openClinicDetails(clinicId: number, triggerElement: HTMLElement | null) {
    drawerTriggerRef.current = triggerElement;
    focusClinic(clinicId);
    setDetailClinicId(clinicId);
    setSelectedTimeSlot(null);
  }

  function closeClinicDetails(returnFocusTo: HTMLElement | null = drawerTriggerRef.current) {
    setDetailClinicId(null);

    if (!returnFocusTo || !document.contains(returnFocusTo)) {
      return;
    }

    requestAnimationFrame(() => {
      returnFocusTo.focus();
    });
  }

  function focusClinicOnMap(clinicId: number) {
    focusClinic(clinicId, true);
    closeClinicDetails(mapSectionRef.current);
  }

  const theme = getCategoryTheme(categorySlug);
  const clinicsWithDistance = clinics.map((clinic) => ({
    clinic,
    distanceKm: userLocation ? getDistanceInKilometers(userLocation, clinic) : null,
  }));
  const detailClinic = clinics.find((clinic) => clinic.id === detailClinicId) ?? null;
  const mobileDrawerHeightClass =
    drawerHeight === "collapsed"
      ? "h-[4.5rem]"
      : drawerHeight === "expanded"
        ? "h-[88vh]"
        : "h-[50vh]";

  function toggleDrawerHeight() {
    setDrawerHeight((currentHeight) => {
      if (currentHeight === "collapsed") {
        return "mid";
      }

      if (currentHeight === "mid") {
        return "expanded";
      }

      return "collapsed";
    });
  }

  return (
    <>
      <section className="relative -mx-4 h-[100dvh] min-h-[100dvh] overflow-hidden md:hidden">
        <div
          ref={mapSectionRef}
          tabIndex={-1}
          className="relative h-[100dvh]"
        >
          <ClinicMap
            clinics={clinics}
            activeClinicId={activeClinicId}
            onSelectClinic={(clinicId) => {
              if (clinicId === null) {
                focusClinic(null);
                closeClinicDetails();
                return;
              }

              openClinicDetails(clinicId, mapSectionRef.current);
            }}
            categoryLabel={categoryLabel}
            preferredCenter={selectedAreaCenter}
            preferredCenterLabel={selectedLocationLabel}
            userLocation={userLocation}
          />
        </div>

        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-10 flex flex-col rounded-t-[28px] border-t border-border bg-white shadow-[0_-18px_48px_rgba(0,0,0,0.22)] transition-[height] duration-300",
            mobileDrawerHeightClass,
          )}
        >
          <div className="flex shrink-0 flex-col gap-3 border-b border-border px-4 pb-3 pt-3">
            <button
              type="button"
              aria-label="Toggle clinic list height"
              className="flex items-center justify-center"
              onClick={toggleDrawerHeight}
            >
              <span className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
            </button>

            <div className={cn("flex items-start justify-between gap-3", drawerHeight === "collapsed" && "hidden")}>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Clinic list</h2>
                <p className="text-sm text-muted-foreground">
                  {userLocation
                    ? "Clinics are sorted by distance from your location."
                    : "Browse clinics and open details."}
                </p>
              </div>
              <Badge variant="outline" className="bg-white px-3 py-1 shadow-sm">
                {clinics.length} results
              </Badge>
            </div>

            <div className={cn("flex flex-wrap gap-2", drawerHeight === "collapsed" && "hidden")}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full px-3.5"
                onClick={() => {
                  setDrawerHeight("collapsed");
                }}
              >
                Show map
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full px-3.5"
                onClick={() => {
                  setDrawerHeight("expanded");
                }}
              >
                Show list
              </Button>
              <ResultsSortSelect
                value={selectedSort}
                className="h-9 rounded-full border-border bg-white px-3.5 shadow-none"
              />
            </div>

            {drawerHeight === "collapsed" ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Clinics</p>
                  <p className="text-xs text-muted-foreground">{clinics.length} results</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full px-3.5"
                  onClick={() => {
                    setDrawerHeight("mid");
                  }}
                >
                  Show clinics
                </Button>
              </div>
            ) : null}
          </div>

          <div className={cn("flex-1 overflow-y-auto overscroll-contain px-4 py-4 scrollbar-hide", drawerHeight === "collapsed" && "hidden")}>
            {clinics.length === 0 ? (
              <Card className="surface-panel rounded-[24px] border border-border py-0">
                <CardContent className="px-5 py-7 text-sm leading-7 text-muted-foreground">
                  {selectedDateLabel
                    ? `No ${categoryLabel.toLowerCase()} clinics are available on ${selectedDateLabel}. Try another date or browse the category without a date filter.`
                    : "No clinics are available in this category right now. Try another care type or check back after more clinics are added."}
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-4">
              {clinicsWithDistance.map(({ clinic, distanceKm }) => {
                const isActive = clinic.id === activeClinicId;
                const distanceLabel = distanceKm === null ? null : formatDistanceLabel(distanceKm);

                return (
                  <div
                    key={clinic.id}
                    ref={(node) => {
                      cardRefs.current[clinic.id] = node;
                    }}
                  >
                    <Card
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        selectClinicFromCard(clinic.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectClinicFromCard(clinic.id);
                        }
                      }}
                      className={cn(
                        "flex h-full cursor-pointer flex-col overflow-hidden rounded-[24px] border border-border bg-white py-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(0,0,0,0.12)]",
                        isActive
                          ? "border-primary/30 shadow-[0_18px_34px_rgba(255,56,92,0.16)] ring-2 ring-primary/16 ring-offset-2 ring-offset-transparent"
                          : "",
                      )}
                    >
                      <div className={cn("relative min-h-[60px] border-b border-border/70 px-4 py-2", theme.background)}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.95),transparent_36%)]" />
                        <div className="relative z-10 flex h-full items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <Badge className="rounded-full bg-white px-2.5 py-1 text-[0.68rem] font-semibold text-foreground shadow-sm">
                              {categoryLabel}
                            </Badge>
                            <div
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl shadow-sm",
                                theme.iconBg,
                              )}
                            >
                              <CategoryIcon
                                category={categorySlug}
                                className={cn("h-4.5 w-4.5", theme.iconColor)}
                              />
                            </div>
                          </div>

                          <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-sm font-medium text-foreground shadow-sm">
                            <Star className="h-3.5 w-3.5 fill-current text-foreground" />
                            {clinic.rating.toFixed(1)}
                          </div>
                        </div>
                      </div>

                      <div className="flex h-full flex-1 flex-col">
                        <CardHeader className="flex-1 space-y-0 px-4 pb-0 pt-2.5">
                          <CardTitle className="line-clamp-2 min-h-[2.5rem] text-[1rem] font-semibold leading-5.5">
                            {clinic.name}
                          </CardTitle>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {categoryLabel} clinic in {clinic.area}
                          </p>
                          <div className="mt-1.5 flex items-start gap-2.5 text-sm leading-5.5 text-muted-foreground">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span className="line-clamp-2 min-h-[2.5rem]">{clinic.address}</span>
                          </div>
                        </CardHeader>

                        <CardContent className="px-4 pb-2.5 pt-2">
                          <div className="flex min-h-[40px] flex-wrap content-start gap-2">
                            {distanceLabel ? (
                              <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm text-foreground">
                                <Compass className="h-4 w-4 text-primary" />
                                {distanceLabel}
                              </div>
                            ) : null}
                            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm text-foreground">
                              <Phone className="h-4 w-4 text-primary" />
                              {clinic.phone}
                            </div>
                          </div>
                          {clinic.availabilityDate && clinic.availableTimeSlots?.length ? (
                            <p className="mt-2 text-xs font-medium text-muted-foreground">
                              Earliest available:{" "}
                              {selectedDateLabel
                                ? clinic.availableTimeSlots[0]
                                : `${formatAvailabilityDate(clinic.availabilityDate)} at ${clinic.availableTimeSlots[0]}`}
                            </p>
                          ) : null}
                        </CardContent>

                        <CardFooter className="mt-auto border-t border-border bg-white px-4 py-2.5">
                          <div className="flex w-full flex-wrap items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                              {isActive ? "Selected on map" : "Click card to focus on map"}
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="ml-auto rounded-full px-3.5"
                              onClick={(event) => {
                                event.stopPropagation();
                                openClinicDetails(clinic.id, event.currentTarget);
                              }}
                            >
                              Check availability
                            </Button>
                          </div>
                        </CardFooter>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="hidden gap-4 sm:gap-6 md:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        <div className="order-2 space-y-4 scrollbar-hide lg:order-1 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-2">
          <div className="flex flex-col items-start justify-between gap-3 px-1 sm:flex-row sm:items-center sm:gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Clinic list</h2>
              <p className="text-sm text-muted-foreground">
                {userLocation
                  ? "Clinics are sorted by distance from your location. Select a card to center the map or open more details."
                  : "Select a card to center the map or open more clinic details."}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {userLocation ? (
                <Badge variant="outline" className="bg-white px-3 py-1 shadow-sm">
                  Nearest first
                </Badge>
              ) : null}
              <Badge variant="outline" className="bg-white px-3 py-1 shadow-sm">
                {clinics.length} results
              </Badge>
            </div>
          </div>

          {clinics.length === 0 ? (
            <Card className="surface-panel rounded-[24px] border border-border py-0 sm:rounded-[28px]">
              <CardContent className="px-5 py-7 text-sm leading-7 text-muted-foreground sm:px-6 sm:py-8">
                {selectedDateLabel
                  ? `No ${categoryLabel.toLowerCase()} clinics are available on ${selectedDateLabel}. Try another date or browse the category without a date filter.`
                  : "No clinics are available in this category right now. Try another care type or check back after more clinics are added."}
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            {clinicsWithDistance.map(({ clinic, distanceKm }) => {
              const isActive = clinic.id === activeClinicId;
              const distanceLabel = distanceKm === null ? null : formatDistanceLabel(distanceKm);

              return (
                <div
                  key={clinic.id}
                  ref={(node) => {
                    cardRefs.current[clinic.id] = node;
                  }}
                >
                  <Card
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      selectClinicFromCard(clinic.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectClinicFromCard(clinic.id);
                      }
                    }}
                    className={cn(
                      "flex h-full cursor-pointer flex-col overflow-hidden rounded-[24px] border border-border bg-white py-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(0,0,0,0.12)] sm:rounded-[26px]",
                      isActive
                        ? "border-primary/30 shadow-[0_18px_34px_rgba(255,56,92,0.16)] ring-2 ring-primary/16 ring-offset-2 ring-offset-transparent"
                        : "",
                    )}
                  >
                    <div className={cn("relative min-h-[60px] border-b border-border/70 px-4 py-2 sm:px-5 sm:py-2.5", theme.background)}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.95),transparent_36%)]" />
                      <div className="relative z-10 flex h-full items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Badge className="rounded-full bg-white px-2.5 py-1 text-[0.68rem] font-semibold text-foreground shadow-sm">
                            {categoryLabel}
                          </Badge>
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl shadow-sm",
                              theme.iconBg,
                            )}
                          >
                            <CategoryIcon
                              category={categorySlug}
                              className={cn("h-4.5 w-4.5", theme.iconColor)}
                            />
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-sm font-medium text-foreground shadow-sm">
                          <Star className="h-3.5 w-3.5 fill-current text-foreground" />
                          {clinic.rating.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    <div className="flex h-full flex-1 flex-col">
                      <CardHeader className="flex-1 space-y-0 px-4 pb-0 pt-2.5 sm:px-5 sm:pt-3">
                        <CardTitle className="line-clamp-2 min-h-[2.5rem] text-[1rem] font-semibold leading-5.5 sm:text-[1.03rem]">
                          {clinic.name}
                        </CardTitle>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {categoryLabel} clinic in {clinic.area}
                        </p>
                        <div className="mt-1.5 flex items-start gap-2.5 text-sm leading-5.5 text-muted-foreground">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="line-clamp-2 min-h-[2.5rem]">{clinic.address}</span>
                        </div>
                      </CardHeader>

                      <CardContent className="px-4 pb-2.5 pt-2 sm:px-5 sm:pb-3">
                        <div className="flex min-h-[40px] flex-wrap content-start gap-2">
                          {distanceLabel ? (
                            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm text-foreground">
                              <Compass className="h-4 w-4 text-primary" />
                              {distanceLabel}
                            </div>
                          ) : null}
                          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm text-foreground">
                            <Phone className="h-4 w-4 text-primary" />
                            {clinic.phone}
                          </div>
                        </div>
                        {clinic.availabilityDate && clinic.availableTimeSlots?.length ? (
                          <p className="mt-2 text-xs font-medium text-muted-foreground">
                            Earliest available:{" "}
                            {selectedDateLabel
                              ? clinic.availableTimeSlots[0]
                              : `${formatAvailabilityDate(clinic.availabilityDate)} at ${clinic.availableTimeSlots[0]}`}
                          </p>
                        ) : null}
                      </CardContent>

                      <CardFooter className="mt-auto border-t border-border bg-white px-4 py-2.5 sm:px-5 sm:py-3">
                        <div className="flex w-full flex-wrap items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {isActive ? "Selected on map" : "Click card to focus on map"}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="ml-auto rounded-full px-3.5"
                            onClick={(event) => {
                              event.stopPropagation();
                              openClinicDetails(clinic.id, event.currentTarget);
                            }}
                          >
                            Check availability
                          </Button>
                        </div>
                      </CardFooter>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        <div
          ref={mapSectionRef}
          tabIndex={-1}
          className="order-1 h-[50vh] lg:order-2 lg:h-auto lg:sticky lg:top-6 lg:self-start"
        >
          <div className="overflow-hidden rounded-[24px] sm:rounded-[28px]">
            <div className="h-[300px] overflow-hidden rounded-[22px] sm:h-[360px] sm:rounded-[24px] lg:h-[calc(100vh-9rem)]">
              <ClinicMap
                clinics={clinics}
                activeClinicId={activeClinicId}
                onSelectClinic={(clinicId) => {
                  if (clinicId === null) {
                    focusClinic(null);
                    closeClinicDetails();
                    return;
                  }

                  openClinicDetails(clinicId, mapSectionRef.current);
                }}
                categoryLabel={categoryLabel}
                preferredCenter={selectedAreaCenter}
                preferredCenterLabel={selectedLocationLabel}
                userLocation={userLocation}
              />
            </div>
          </div>
        </div>
      </section>

      <ClinicDetailDrawer
        clinic={detailClinic}
        categoryLabel={categoryLabel}
        categorySlug={categorySlug}
        selectedDateLabel={selectedDateLabel}
        selectedTimeSlot={selectedTimeSlot}
        onSelectTimeSlot={setSelectedTimeSlot}
        onClose={closeClinicDetails}
        onFocusOnMap={() => {
          if (detailClinicId) {
            focusClinicOnMap(detailClinicId);
          }
        }}
      />
    </>
  );
}

function formatAvailabilityDate(date: string) {
  return format(new Date(`${date}T00:00:00`), "MMM d");
}
