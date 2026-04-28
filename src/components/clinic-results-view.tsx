"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Phone, Star } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { ClinicMap } from "@/components/clinic-map";
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
import { getCategoryTheme } from "@/lib/category-theme";
import { cn } from "@/lib/utils";

type ClinicResultsViewProps = {
  categoryLabel: string;
  categorySlug: ClinicCategorySlug;
  clinics: ClinicListItem[];
};

export function ClinicResultsView({
  categoryLabel,
  categorySlug,
  clinics,
}: ClinicResultsViewProps) {
  const [activeClinicId, setActiveClinicId] = useState<number | null>(null);
  const mapSectionRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

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

    if (scrollToMap && clinicId && window.innerWidth < 1024) {
      mapSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  const theme = getCategoryTheme(categorySlug);

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
      <div className="order-1 space-y-4 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-2">
        <div className="flex items-center justify-between gap-4 px-1">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Clinic list</h2>
            <p className="text-sm text-muted-foreground">
              Select a card to center the map on that clinic.
            </p>
          </div>
          <Badge variant="outline" className="bg-white px-3 py-1 shadow-sm">
            {clinics.length} results
          </Badge>
        </div>

        {clinics.length === 0 ? (
          <Card className="surface-panel rounded-[28px] border border-border py-0">
            <CardContent className="px-6 py-8 text-sm leading-7 text-muted-foreground">
              No clinics are available in this category yet. Add your Neon
              connection string, push the schema, and run the seed script to load
              the Toronto sample clinics.
            </CardContent>
          </Card>
        ) : null}

        {clinics.map((clinic, index) => {
          const isActive = clinic.id === activeClinicId;

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
                  focusClinic(clinic.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    focusClinic(clinic.id);
                  }
                }}
                className={cn(
                  "cursor-pointer overflow-hidden rounded-[28px] border border-border bg-white py-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(0,0,0,0.12)]",
                  isActive
                    ? "border-primary/30 shadow-[0_18px_34px_rgba(255,56,92,0.16)] ring-2 ring-primary/16 ring-offset-2 ring-offset-transparent"
                    : "",
                )}
              >
                <div className="grid gap-0 md:grid-cols-[260px_minmax(0,1fr)]">
                  <div className={cn("relative min-h-[220px] px-5 py-5", theme.background)}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.95),transparent_36%)]" />
                    <div className="relative z-10 flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <Badge className="rounded-full bg-white px-3 py-1 text-[0.72rem] font-semibold text-foreground shadow-sm">
                          {categoryLabel}
                        </Badge>
                        <div
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-full shadow-sm",
                            theme.iconBg,
                          )}
                        >
                          <CategoryIcon
                            category={categorySlug}
                            className={cn("h-5 w-5", theme.iconColor)}
                          />
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                          Care Atlas pick
                        </p>
                        <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <CardHeader className="pt-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-[1.32rem] font-semibold leading-8">
                            {clinic.name}
                          </CardTitle>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Clinic in Toronto
                          </p>
                        </div>

                        <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                          <Star className="h-4 w-4 fill-current text-foreground" />
                          {clinic.rating.toFixed(1)}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-4 pb-5">
                      <div className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{clinic.address}</span>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <div className="rounded-full bg-secondary px-4 py-2 text-sm text-foreground">
                          {isActive ? "Focused on the map" : "Select to focus on map"}
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-foreground">
                          <Phone className="h-4 w-4 text-primary" />
                          {clinic.phone}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="justify-between border-t border-border bg-white">
                      <p className="text-sm text-muted-foreground">
                        Compare this clinic on the map with the rest of the category.
                      </p>
                      <Button
                        type="button"
                        variant={isActive ? "default" : "secondary"}
                        size="lg"
                        className="rounded-full px-5"
                        onClick={(event) => {
                          event.stopPropagation();
                          focusClinic(clinic.id, true);
                        }}
                      >
                        View Clinic
                      </Button>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      <div ref={mapSectionRef} className="order-2 lg:sticky lg:top-6 lg:self-start">
        <div className="surface-panel overflow-hidden rounded-[28px] border border-border p-3">
          <div className="flex items-center justify-between gap-4 px-3 pb-3 pt-1">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Map view</h2>
              <p className="text-sm text-muted-foreground">
                Tap a pin to highlight the matching clinic card.
              </p>
            </div>
            <div className="rounded-full bg-white/72 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary shadow-sm">
              Interactive map
            </div>
          </div>

          <div className="h-[380px] overflow-hidden rounded-[24px] bg-secondary shadow-inner lg:h-[calc(100vh-12rem)]">
            <ClinicMap
              clinics={clinics}
              activeClinicId={activeClinicId}
              onSelectClinic={(clinicId) => {
                focusClinic(clinicId);
              }}
              categoryLabel={categoryLabel}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
