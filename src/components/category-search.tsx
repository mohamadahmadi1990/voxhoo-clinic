"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { isValid, parseISO, startOfToday } from "date-fns";
import { CalendarDays, Search } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClinicCategory, ClinicCategorySlug } from "@/lib/clinic-categories";
import {
  buildClinicSearchHref,
  clinicAreas,
  type ClinicAreaSlug,
  formatSearchDateLabel,
  type UserLocation,
} from "@/lib/clinic-search";
import { cn } from "@/lib/utils";

type CategorySearchProps = {
  categories: readonly ClinicCategory[];
  variant?: "default" | "compact";
  initialCategory?: ClinicCategorySlug | null;
  initialDate?: string | null;
  initialLocation?: ClinicAreaSlug | null;
  initialUserLocation?: UserLocation | null;
  showHelperText?: boolean;
  showCategoryMarquee?: boolean;
  className?: string;
};

const locationOptions = [
  { label: "Current location", value: "current-location" },
  ...clinicAreas.map((area) => ({
    label: area.label,
    value: area.slug,
  })),
] as const;

export function CategorySearch({
  categories,
  variant = "default",
  initialCategory = null,
  initialDate = null,
  initialLocation = null,
  initialUserLocation = null,
  showHelperText = true,
  showCategoryMarquee = true,
  className,
}: CategorySearchProps) {
  const router = useRouter();
  const isCompact = variant === "compact";
  const [selectedCategory, setSelectedCategory] = useState<ClinicCategorySlug | null>(
    initialCategory,
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (!initialDate) {
      return undefined;
    }

    const parsedDate = parseISO(initialDate);

    return isValid(parsedDate) ? parsedDate : undefined;
  });
  const [selectedLocation, setSelectedLocation] = useState<ClinicAreaSlug | null>(
    initialLocation,
  );
  const [userLocation, setUserLocation] = useState<UserLocation | null>(initialUserLocation);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCategory) {
      setValidationMessage("Please select a clinic category");
      return;
    }

    setValidationMessage("");

    startTransition(() => {
      router.push(
        buildClinicSearchHref(selectedCategory, {
          date: selectedDate,
          location: selectedLocation,
          userLocation,
        }),
      );
    });
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Location access is not available in this browser.");
      setUserLocation(null);
      return;
    }

    setIsLocating(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setSelectedLocation(null);
        setUserLocation({
          lat: coords.latitude,
          lng: coords.longitude,
        });
        setLocationMessage("Using your current location to sort clinics by distance.");
        setIsLocating(false);
      },
      () => {
        setSelectedLocation(null);
        setUserLocation(null);
        setLocationMessage(
          "We couldn't access your location. You can still search by category and date.",
        );
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 300000,
        timeout: 10000,
      },
    );
  }

  const helperMessage =
    validationMessage ||
    locationMessage ||
    "Start by choosing a clinic category.";
  const hasLocationError = Boolean(locationMessage && !userLocation);
  const helperTone = validationMessage || hasLocationError
    ? "text-destructive"
    : userLocation
      ? "text-primary"
      : "text-muted-foreground";
  const selectedDateLabel = selectedDate ? formatSearchDateLabel(selectedDate) : null;
  const selectedLocationLabel = selectedLocation
    ? locationOptions.find((option) => option.value === selectedLocation)?.label ?? null
    : null;
  const locationValue = isLocating
    ? "Finding nearby clinics..."
    : userLocation
      ? "Using your location"
      : selectedLocationLabel ?? "Current location";
  const containerClass = isCompact
    ? "mx-auto w-full max-w-[760px]"
    : "mx-auto mt-8 w-full max-w-5xl sm:mt-10";
  const formClass = isCompact
    ? "rounded-[22px] border border-border bg-white px-2 py-[3px] shadow-[0_5px_14px_rgba(0,0,0,0.08)] md:rounded-full md:px-2.5"
    : "rounded-[28px] border border-border bg-white p-1.5 shadow-[0_10px_36px_rgba(0,0,0,0.12)] sm:p-2 md:rounded-full";
  const gridClass = isCompact
    ? "grid gap-1 md:grid-cols-[minmax(0,1.12fr)_minmax(182px,0.8fr)_minmax(174px,0.76fr)_auto] md:gap-0 md:items-stretch"
    : "grid gap-1.5 sm:gap-2 md:grid-cols-[minmax(0,1.05fr)_minmax(240px,0.9fr)_minmax(220px,0.85fr)_auto] md:gap-0 md:items-stretch";
  const segmentClass = isCompact
    ? "relative flex min-h-[56px] flex-col justify-center px-3 py-2 text-left transition-colors duration-200 hover:bg-secondary focus-within:bg-secondary sm:min-h-[52px] md:min-h-[44px] md:rounded-none md:px-3 md:py-1.5"
    : "relative flex min-h-[72px] flex-col justify-center px-4 py-3 text-left transition-colors duration-200 hover:bg-secondary focus-within:bg-secondary sm:min-h-[84px] sm:px-5 sm:py-4 md:min-h-[80px] md:rounded-none md:px-6 md:py-4";
  const segmentLabelClass = isCompact
    ? "text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
    : "text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-[0.7rem] sm:tracking-[0.18em]";
  const segmentValueClass = isCompact
    ? "mt-0.5 text-[0.9rem] font-medium text-foreground md:text-[0.8rem]"
    : "mt-1 text-[0.92rem] font-medium text-foreground sm:text-[0.98rem]";
  const triggerTextClass = isCompact ? "text-[0.9rem] md:text-[0.8rem]" : "text-[0.92rem] sm:text-base";
  const submitButtonClass = isCompact
    ? "h-10 w-full rounded-[18px] p-0 md:ml-0.5 md:mr-0 md:size-8 md:self-center md:rounded-full"
    : "h-12 w-full rounded-[18px] p-0 sm:h-14 md:ml-2 md:mr-0 md:size-16 md:self-center md:rounded-full";

  return (
    <div className={cn(containerClass, className)}>
      <form
        onSubmit={handleSubmit}
        className={formClass}
      >
        <div className={gridClass}>
          <div
            className={cn(
              segmentClass,
              "rounded-[26px] md:rounded-l-full md:rounded-r-none md:border-r md:border-border/70",
            )}
          >
            <p className={segmentLabelClass}>Category</p>
            <div className="mt-1">
              <Select
                value={selectedCategory ?? ""}
                items={categories.map((category) => ({
                  label: category.label,
                  value: category.slug,
                }))}
                onValueChange={(value) => {
                  setSelectedCategory(value as ClinicCategorySlug | null);
                  if (validationMessage) {
                    setValidationMessage("");
                  }
                }}
              >
                <SelectTrigger
                  aria-label="Select clinic category"
                  className={cn(
                    "h-auto min-h-0 rounded-none border-0 bg-transparent px-0 py-0 font-medium shadow-none hover:bg-transparent focus-visible:ring-0 data-[popup-open]:bg-transparent",
                    triggerTextClass,
                    !selectedCategory && "text-muted-foreground",
                  )}
                >
                  <SelectValue placeholder="Choose clinic type" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div
            className={cn(
              segmentClass,
              "rounded-[26px] md:rounded-none md:border-r md:border-border/70",
            )}
          >
            <p className={segmentLabelClass}>Date</p>
            <div className="mt-1">
              <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                <PopoverTrigger
                  type="button"
                  aria-label="Select clinic availability date"
                  className="inline-flex min-h-0 w-full items-center justify-between gap-4 rounded-none border-0 bg-transparent px-0 py-0 text-left outline-none transition-colors hover:bg-transparent focus-visible:ring-0"
                >
                  <span
                    className={selectedDateLabel
                      ? segmentValueClass
                      : cn("mt-1 font-medium text-muted-foreground", triggerTextClass)}
                  >
                    {selectedDateLabel ?? "Choose a date"}
                  </span>
                  <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent
                  className="w-[min(308px,calc(100vw-2rem))] overflow-hidden rounded-[28px] border border-border bg-white p-0"
                  sideOffset={12}
                >
                  <div className="bg-white">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      disabled={{ before: startOfToday() }}
                      fixedWeeks
                      onSelect={(date) => {
                        setSelectedDate(date);

                        if (date) {
                          setIsDateOpen(false);
                        }
                      }}
                      initialFocus
                    />
                    <div className="flex items-center justify-between border-t border-border bg-white px-4 pb-4 pt-3">
                      <p className="text-xs text-muted-foreground">
                        Single-date availability only
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                        onClick={() => {
                          setSelectedDate(undefined);
                          setIsDateOpen(false);
                        }}
                      >
                        Clear date
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div
            className={cn(
              segmentClass,
              "rounded-[26px] md:rounded-r-full md:rounded-l-none",
            )}
          >
            <p className={segmentLabelClass}>Location</p>
            <div className="mt-1">
              <Select
                value={selectedLocation ?? ""}
                items={locationOptions.map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
                onValueChange={(value) => {
                  const nextValue = value as ClinicAreaSlug | "current-location" | null;

                  if (nextValue === "current-location") {
                    handleUseMyLocation();
                    return;
                  }

                  setSelectedLocation(nextValue);
                  setUserLocation(null);
                  setLocationMessage("");
                  setIsLocating(false);
                }}
              >
                <SelectTrigger
                  aria-label="Choose a location"
                  className={cn(
                    "h-auto min-h-0 rounded-none border-0 bg-transparent px-0 py-0 font-medium shadow-none hover:bg-transparent focus-visible:ring-0 data-[popup-open]:bg-transparent",
                    triggerTextClass,
                    !selectedLocationLabel && !userLocation && !isLocating && "text-muted-foreground",
                  )}
                >
                  <SelectValue placeholder={locationValue} />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            aria-label="Search clinics"
            className={submitButtonClass}
          >
            <Search className={isCompact ? "h-3.5 w-3.5" : "h-[18px] w-[18px] sm:h-5 sm:w-5"} />
          </Button>
        </div>
      </form>

      {showHelperText ? (
        <p className={cn("mt-4 text-center text-sm leading-6", helperTone)}>
          {helperMessage}
        </p>
      ) : null}

      {showCategoryMarquee ? (
        <div className="relative mt-5 overflow-hidden sm:mt-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background via-background/88 to-transparent sm:w-12" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background via-background/88 to-transparent sm:w-12" />

          <div className="category-marquee">
            {[0, 1].map((copyIndex) => (
              <div
                key={copyIndex}
                className="flex shrink-0 items-center gap-3 pr-3"
                aria-hidden={copyIndex === 1}
              >
                {categories.map((category) => (
                  <Link
                    key={`${copyIndex}-${category.slug}`}
                    href={buildClinicSearchHref(category.slug, {
                      date: selectedDate,
                      location: selectedLocation,
                      userLocation,
                    })}
                    tabIndex={copyIndex === 1 ? -1 : undefined}
                    className="group inline-flex shrink-0 items-center gap-3 rounded-full border border-border bg-white px-3.5 py-2.5 text-sm font-medium whitespace-nowrap text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:px-4 sm:py-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors group-hover:bg-accent group-hover:text-primary sm:h-9 sm:w-9">
                      <CategoryIcon category={category.slug} className="h-4 w-4" />
                    </div>
                    <span>{category.label}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
