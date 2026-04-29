"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { startOfToday } from "date-fns";
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
  formatSearchDateLabel,
  type UserLocation,
} from "@/lib/clinic-search";
import { cn } from "@/lib/utils";

type CategorySearchProps = {
  categories: readonly ClinicCategory[];
};

const locationOptions = [
  { label: "Use my current location", value: "current-location" },
  { label: "Toronto", value: "toronto" },
  { label: "North York", value: "north-york" },
  { label: "Scarborough", value: "scarborough" },
  { label: "Etobicoke", value: "etobicoke" },
  { label: "Mississauga", value: "mississauga" },
  { label: "Markham", value: "markham" },
] as const;

export function CategorySearch({ categories }: CategorySearchProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ClinicCategorySlug | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
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
      : selectedLocationLabel ?? "Use my current location";
  const segmentClass =
    "relative flex min-h-[84px] flex-col justify-center px-5 py-4 text-left transition-colors duration-200 hover:bg-secondary focus-within:bg-secondary md:min-h-[80px] md:rounded-none md:px-6 md:py-4";
  const segmentLabelClass =
    "text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground";
  const segmentValueClass = "mt-1 text-[0.98rem] font-medium text-foreground";

  return (
    <div className="mx-auto mt-10 w-full max-w-5xl">
      <form
        onSubmit={handleSubmit}
        className="rounded-[32px] border border-border bg-white p-2 shadow-[0_10px_36px_rgba(0,0,0,0.12)] md:rounded-full"
      >
        <div className="grid gap-2 md:grid-cols-[minmax(0,1.05fr)_minmax(240px,0.9fr)_minmax(220px,0.85fr)_auto] md:gap-0 md:items-stretch">
          <div
            className={cn(
              segmentClass,
              "rounded-[26px] md:rounded-l-full md:rounded-r-none md:border-r md:border-border/70",
            )}
          >
            <p className={segmentLabelClass}>Category</p>
            <div className="mt-1">
              <Select
                value={selectedCategory}
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
                    "h-auto min-h-0 rounded-none border-0 bg-transparent px-0 py-0 text-base font-medium shadow-none hover:bg-transparent focus-visible:ring-0 data-[popup-open]:bg-transparent",
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
                  <span className={selectedDateLabel ? segmentValueClass : "mt-1 text-[0.98rem] font-medium text-muted-foreground"}>
                    {selectedDateLabel ?? "Choose a date"}
                  </span>
                  <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent
                  className="w-[308px] overflow-hidden rounded-[28px] border border-border bg-white p-0"
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
                value={selectedLocation}
                items={locationOptions.map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
                onValueChange={(value) => {
                  if (value === "current-location") {
                    handleUseMyLocation();
                    return;
                  }

                  setSelectedLocation(value);
                  setUserLocation(null);
                  setLocationMessage("");
                  setIsLocating(false);
                }}
              >
                <SelectTrigger
                  aria-label="Choose a location"
                  className={cn(
                    "h-auto min-h-0 rounded-none border-0 bg-transparent px-0 py-0 text-base font-medium shadow-none hover:bg-transparent focus-visible:ring-0 data-[popup-open]:bg-transparent",
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
            className="mx-auto size-16 rounded-full p-0 md:ml-2 md:mr-0 md:self-center"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </form>

      <p className={cn("mt-4 text-center text-sm leading-6", helperTone)}>
        {helperMessage}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={buildClinicSearchHref(category.slug, {
              date: selectedDate,
              userLocation,
            })}
            className="group inline-flex items-center gap-3 rounded-full border border-border bg-white px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors group-hover:bg-accent group-hover:text-primary">
              <CategoryIcon category={category.slug} className="h-4 w-4" />
            </div>
            <span>{category.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
