"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight, MapPin, Phone, Star } from "lucide-react";
import type { ClinicListItem } from "@/db";
import { getCategoryTheme } from "@/lib/category-theme";
import { clinicCategories } from "@/lib/clinic-categories";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";
import { Button } from "./ui/button";

type TopClinicsCarouselProps = {
  clinics: ClinicListItem[];
};

const categoryLabelMap = Object.fromEntries(
  clinicCategories.map((category) => [category.slug, category.label]),
) as Record<ClinicListItem["category"], string>;

export function TopClinicsCarousel({ clinics }: TopClinicsCarouselProps) {
  const railRef = useRef<HTMLDivElement | null>(null);

  function scrollByAmount(direction: "left" | "right") {
    if (!railRef.current) {
      return;
    }

    const amount = railRef.current.clientWidth * 0.92;

    railRef.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  }

  if (clinics.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Top clinics right now
          </h2>
          <p className="mt-2 text-muted-foreground">
            Highest-rated Toronto clinics across categories, picked for quick browsing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="rounded-full"
            aria-label="Scroll top clinics left"
            onClick={() => {
              scrollByAmount("left");
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="rounded-full"
            aria-label="Scroll top clinics right"
            onClick={() => {
              scrollByAmount("right");
            }}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={railRef}
        className="relative mt-8 overflow-x-hidden pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background via-background/88 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background via-background/88 to-transparent" />

        <div className="top-clinics-marquee">
          <div className="flex shrink-0 items-stretch gap-5 pr-5">
            {clinics.map((clinic) => renderClinicCard(clinic))}
          </div>

          <div className="flex shrink-0 items-stretch gap-5 pr-5" aria-hidden="true">
            {clinics.map((clinic) => renderClinicCard(clinic, true))}
          </div>
        </div>
      </div>
    </section>
  );
}

function renderClinicCard(clinic: ClinicListItem, isDuplicate = false) {
  const theme = getCategoryTheme(clinic.category);

  return (
    <article
      key={`${isDuplicate ? "duplicate" : "primary"}-${clinic.id}`}
      className="min-w-[320px] max-w-[320px] shrink-0 overflow-hidden rounded-[28px] border border-border bg-white shadow-[0_12px_28px_rgba(0,0,0,0.1)] transition-transform duration-200 hover:-translate-y-1 sm:min-w-[360px] sm:max-w-[360px]"
    >
      <div className={cn("relative h-52 px-5 py-5", theme.background)}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.96),transparent_34%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm">
              Featured
            </div>
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm",
                theme.iconBg,
              )}
            >
              <CategoryIcon
                category={clinic.category}
                className={cn("h-5 w-5", theme.iconColor)}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {categoryLabelMap[clinic.category]}
            </p>
            <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-foreground">
              {clinic.name}
            </h3>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="rounded-full bg-secondary px-3 py-2 text-sm font-medium text-foreground">
            {categoryLabelMap[clinic.category]}
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <Star className="h-4 w-4 fill-current text-foreground" />
            {clinic.rating.toFixed(1)}
          </div>
        </div>

        <div className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{clinic.address}</span>
        </div>

        <div className="inline-flex items-center gap-2 text-sm text-foreground">
          <Phone className="h-4 w-4 text-primary" />
          {clinic.phone}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-sm text-muted-foreground">
            Explore this category on the map.
          </p>
          <Link
            href={`/clinics/${clinic.category}`}
            tabIndex={isDuplicate ? -1 : undefined}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/88"
          >
            View
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
