"use client";

import { format } from "date-fns";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, MapPin, Phone, Star, X } from "lucide-react";
import { submitAppointmentRequest } from "@/app/actions/create-appointment-request";
import { CategoryIcon } from "@/components/category-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ClinicListItem } from "@/db";
import type { ClinicCategorySlug } from "@/lib/clinic-categories";
import { getCategoryTheme } from "@/lib/category-theme";
import { cn } from "@/lib/utils";

type ClinicDetailDrawerProps = {
  clinic: ClinicListItem | null;
  categoryLabel: string;
  categorySlug: ClinicCategorySlug;
  selectedDateLabel?: string | null;
  selectedTimeSlot?: string | null;
  onSelectTimeSlot: (timeSlot: string | null) => void;
  onClose: () => void;
  onFocusOnMap: () => void;
};

export function ClinicDetailDrawer({
  clinic,
  categoryLabel,
  categorySlug,
  selectedDateLabel = null,
  selectedTimeSlot = null,
  onSelectTimeSlot,
  onClose,
  onFocusOnMap,
}: ClinicDetailDrawerProps) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [note, setNote] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  useEffect(() => {
    setIsRequestFormOpen(false);
    setPatientName("");
    setPatientEmail("");
    setPatientPhone("");
    setNote("");
    setRequestError(null);
    setRequestSuccess(null);
    setIsSubmitting(false);
  }, [clinic?.id, selectedTimeSlot, selectedDateLabel]);

  useEffect(() => {
    if (!clinic || !containerRef.current || !dialogRef.current) {
      return;
    }

    const container = containerRef.current;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    const otherBodyChildren = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element !== container,
    );
    const previousStates = otherBodyChildren.map((element) => ({
      element,
      ariaHidden: element.getAttribute("aria-hidden"),
      inert: element.inert,
    }));

    document.body.style.overflow = "hidden";
    otherBodyChildren.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(dialog);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (!activeElement || !dialog.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      previousStates.forEach(({ element, ariaHidden, inert }) => {
        element.inert = inert;

        if (ariaHidden === null) {
          element.removeAttribute("aria-hidden");
          return;
        }

        element.setAttribute("aria-hidden", ariaHidden);
      });
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [clinic, onClose]);

  if (!clinic || typeof document === "undefined") {
    return null;
  }

  const theme = getCategoryTheme(categorySlug);
  const phoneDigits = clinic.phone.replace(/[^\d+]/g, "");
  const canCallClinic = Boolean(phoneDigits);
  const dialHref = canCallClinic ? `tel:${phoneDigits}` : null;
  const timeSlots = clinic.timeSlots ?? [];
  const availabilityDateLabel = selectedDateLabel
    ? selectedDateLabel
    : clinic.availabilityDate
      ? formatAvailabilityDate(clinic.availabilityDate)
      : null;
  const hasAvailability = Boolean(availabilityDateLabel && timeSlots.length);
  const selectedSlotDate = clinic.availabilityDate;
  const canRequestSelectedTime = Boolean(selectedTimeSlot && selectedSlotDate);

  return createPortal(
    <div ref={containerRef} className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close clinic details"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={() => {
          onClose();
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-[92vh] max-h-[92vh] rounded-t-[28px] bg-white shadow-[0_-18px_48px_rgba(0,0,0,0.22)] md:inset-y-0 md:left-auto md:h-full md:max-h-none md:w-full md:max-w-xl md:rounded-l-[32px] md:rounded-r-none">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="flex h-full min-h-0 flex-col overflow-hidden"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div className={cn("relative overflow-hidden px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4", theme.background)}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.96),transparent_38%)]" />
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm sm:h-11 sm:w-11",
                        theme.iconBg,
                      )}
                    >
                      <CategoryIcon
                        category={categorySlug}
                        className={cn("h-5 w-5", theme.iconColor)}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2
                        id={titleId}
                        className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
                      >
                        {clinic.name}
                      </h2>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge className="inline-flex h-8 items-center rounded-full bg-white px-3 py-1 text-sm font-medium text-foreground shadow-sm">
                          {categoryLabel}
                        </Badge>
                        <div className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-medium text-foreground shadow-sm">
                          <Star className="h-4 w-4 fill-current text-foreground" />
                          <span>{clinic.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1.5 text-sm">
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="line-clamp-2">{clinic.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4 shrink-0 text-primary" />
                          <span className="truncate">{clinic.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  ref={closeButtonRef}
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  aria-label="Close clinic details"
                  className="rounded-full bg-white/90"
                  onClick={() => {
                    onClose();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 touch-pan-y sm:px-6 sm:py-6">
            {availabilityDateLabel ? (
              <section className="mt-4 surface-panel rounded-[28px] border border-border px-5 py-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {selectedDateLabel ? "Selected date" : "Next available date"}
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {availabilityDateLabel}
                </p>

                {hasAvailability ? (
                  <>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Time slots
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {timeSlots.map((timeSlot) => {
                        const isAvailable = timeSlot.status === "available";
                        const isSelected =
                          isAvailable && selectedTimeSlot === timeSlot.startTime;

                        return (
                          <button
                            key={`${timeSlot.startTime}-${timeSlot.endTime}`}
                            type="button"
                            disabled={!isAvailable}
                            className={cn(
                              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : isAvailable
                                  ? "border-border bg-white text-foreground hover:bg-secondary"
                                  : "cursor-not-allowed border-border bg-secondary text-muted-foreground opacity-70",
                            )}
                            onClick={() => {
                              if (!isAvailable) {
                                return;
                              }

                              onSelectTimeSlot(timeSlot.startTime);
                            }}
                          >
                            {timeSlot.startTime}
                          </button>
                        );
                      })}
                    </div>
                    {selectedTimeSlot ? (
                      <div className="mt-5">
                        <Button
                          type="button"
                          variant="default"
                          size="lg"
                          className="h-12 rounded-full px-6"
                          disabled={!canRequestSelectedTime || isPending}
                          onClick={() => {
                            setIsRequestFormOpen((currentValue) => !currentValue);
                            setRequestError(null);
                            setRequestSuccess(null);
                          }}
                        >
                          Request this time
                        </Button>

                        {isRequestFormOpen ? (
                          <form
                            className="mt-4 space-y-3 rounded-[24px] border border-border bg-white p-4"
                            onSubmit={(event) => {
                              event.preventDefault();

                              if (isSubmitting) {
                                return;
                              }

                              if (!selectedTimeSlot || !selectedSlotDate) {
                                setRequestError("Choose an available time first.");
                                return;
                              }

                              setRequestError(null);
                              setRequestSuccess(null);
                              setIsSubmitting(true);

                              startTransition(async () => {
                                const result = await submitAppointmentRequest({
                                  clinicId: clinic.id,
                                  slotDate: selectedSlotDate,
                                  startTime: selectedTimeSlot,
                                  patientName,
                                  patientEmail,
                                  patientPhone,
                                  note,
                                });

                                if (!result.ok) {
                                  setRequestError(result.error);
                                  setIsSubmitting(false);
                                  return;
                                }

                                setPatientName("");
                                setPatientEmail("");
                                setPatientPhone("");
                                setNote("");
                                setIsRequestFormOpen(false);
                                setRequestSuccess(
                                  "Request sent. The clinic will contact you.",
                                );
                                setIsSubmitting(false);
                              });
                            }}
                          >
                            <div className="grid gap-3 sm:grid-cols-2">
                              <label className="block text-sm">
                                <span className="mb-1.5 block font-medium text-foreground">
                                  Name
                                </span>
                                <input
                                  type="text"
                                  value={patientName}
                                  onChange={(event) => {
                                    setPatientName(event.target.value);
                                  }}
                                  required
                                  className="h-11 w-full rounded-2xl border border-border px-3 text-sm outline-none transition-colors focus:border-primary"
                                />
                              </label>
                              <label className="block text-sm">
                                <span className="mb-1.5 block font-medium text-foreground">
                                  Email
                                </span>
                                <input
                                  type="email"
                                  value={patientEmail}
                                  onChange={(event) => {
                                    setPatientEmail(event.target.value);
                                  }}
                                  className="h-11 w-full rounded-2xl border border-border px-3 text-sm outline-none transition-colors focus:border-primary"
                                />
                              </label>
                            </div>
                            <label className="block text-sm">
                              <span className="mb-1.5 block font-medium text-foreground">
                                Phone
                              </span>
                              <input
                                type="tel"
                                value={patientPhone}
                                onChange={(event) => {
                                  setPatientPhone(event.target.value);
                                }}
                                className="h-11 w-full rounded-2xl border border-border px-3 text-sm outline-none transition-colors focus:border-primary"
                              />
                            </label>
                            <label className="block text-sm">
                              <span className="mb-1.5 block font-medium text-foreground">
                                Note
                              </span>
                              <textarea
                                value={note}
                                onChange={(event) => {
                                  setNote(event.target.value);
                                }}
                                rows={3}
                                className="w-full rounded-2xl border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                              />
                            </label>
                            <p className="text-xs text-muted-foreground">
                              Please include either an email or phone number.
                            </p>
                            {requestError ? (
                              <p className="text-sm font-medium text-destructive">
                                {requestError}
                              </p>
                            ) : null}
                            {requestSuccess ? (
                              <p className="text-sm font-medium text-primary">
                                {requestSuccess}
                              </p>
                            ) : null}
                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className="h-11 rounded-full px-5"
                                onClick={() => {
                                  setIsRequestFormOpen(false);
                                  setRequestError(null);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                variant="default"
                                size="lg"
                                className="h-11 rounded-full px-5"
                                disabled={isSubmitting || isPending}
                              >
                                {isSubmitting || isPending ? "Sending..." : "Send request"}
                              </Button>
                            </div>
                          </form>
                        ) : null}

                        {requestSuccess && !isRequestFormOpen ? (
                          <p className="mt-3 text-sm font-medium text-primary">
                            {requestSuccess}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-5 text-sm leading-7 text-muted-foreground">
                    No available times are listed right now.
                  </p>
                )}
              </section>
            ) : null}

            <section className="mt-4 surface-panel rounded-[28px] border border-border px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Quick details
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="rounded-full bg-secondary px-4 py-2 text-sm text-foreground">
                  {categoryLabel}
                </div>
                <div className="rounded-full bg-secondary px-4 py-2 text-sm text-foreground">
                  Toronto clinic
                </div>
                <div className="rounded-full bg-secondary px-4 py-2 text-sm text-foreground">
                  Map pin available
                </div>
              </div>
            </section>
          </div>

          <div className="border-t border-border bg-white px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              {dialHref ? (
                <a
                  href={dialHref}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-white px-5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary"
                >
                  <Phone className="h-4 w-4" />
                  Call clinic
                </a>
              ) : (
                <div className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-secondary px-5 text-sm font-semibold text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  Phone unavailable
                </div>
              )}
              <Button
                type="button"
                variant="default"
                size="lg"
                className="h-12 rounded-full px-6"
                onClick={onFocusOnMap}
              >
                Show this clinic on map
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function formatAvailabilityDate(date: string) {
  return format(new Date(`${date}T00:00:00`), "EEEE, MMM d");
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => {
    if (element.hasAttribute("disabled") || element.getAttribute("aria-hidden") === "true") {
      return false;
    }

    return element.getClientRects().length > 0;
  });
}
