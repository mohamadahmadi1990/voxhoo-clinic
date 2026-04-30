"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { MapPin, Phone, Star, X } from "lucide-react";
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
  onClose: () => void;
  onFocusOnMap: () => void;
};

export function ClinicDetailDrawer({
  clinic,
  categoryLabel,
  categorySlug,
  onClose,
  onFocusOnMap,
}: ClinicDetailDrawerProps) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

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

      <div className="absolute inset-x-0 bottom-0 max-h-[92vh] rounded-t-[28px] bg-white shadow-[0_-18px_48px_rgba(0,0,0,0.22)] md:inset-y-0 md:left-auto md:max-h-none md:w-full md:max-w-xl md:rounded-l-[32px] md:rounded-r-none">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="flex h-full flex-col overflow-hidden"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div className={cn("relative overflow-hidden px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5", theme.background)}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.96),transparent_38%)]" />
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm sm:h-12 sm:w-12",
                      theme.iconBg,
                    )}
                  >
                    <CategoryIcon
                      category={categorySlug}
                      className={cn("h-5 w-5", theme.iconColor)}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Voxhoo Clinic
                    </p>
                    <Badge className="mt-2 rounded-full bg-white px-3 py-1 text-[0.72rem] font-semibold text-foreground shadow-sm">
                      {categoryLabel}
                    </Badge>
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

              <div className="mt-6 sm:mt-8">
                <h2
                  id={titleId}
                  className="max-w-lg text-2xl font-semibold tracking-tight text-foreground sm:text-[2.1rem]"
                >
                  {clinic.name}
                </h2>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm">
                  <Star className="h-4 w-4 fill-current text-foreground" />
                  {clinic.rating.toFixed(1)} rating
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <section className="surface-soft rounded-[24px] px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Address
                </p>
                <div className="mt-3 flex items-start gap-3 text-sm leading-6 text-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{clinic.address}</span>
                </div>
              </section>

              <section className="surface-soft rounded-[24px] px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Phone
                </p>
                <div className="mt-3 flex items-start gap-3 text-sm leading-6 text-foreground">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{clinic.phone}</span>
                </div>
              </section>
            </div>

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
              <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
                This lightweight clinic drawer keeps people inside the browse flow while
                surfacing the most useful details before a deeper profile exists.
              </p>
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
