"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { Expand, Loader2, MapPinned, Minus, Plus, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ClinicListItem } from "@/db";
import type { UserLocation } from "@/lib/clinic-search";

type ClinicMapProps = {
  clinics: ClinicListItem[];
  activeClinicId: number | null;
  onSelectClinic: (clinicId: number | null) => void;
  categoryLabel: string;
  preferredCenter?: UserLocation | null;
  preferredCenterLabel?: string | null;
  userLocation?: UserLocation | null;
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultTorontoCenter = {
  lat: 43.6532,
  lng: -79.3832,
};

export function ClinicMap(props: ClinicMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [apiStatus, setApiStatus] = useState<"loading" | "loaded" | "error">("loading");

  if (!apiKey) {
    return (
      <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-[24px] border border-dashed border-border/80 bg-white px-6 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-secondary text-primary">
          <MapPinned className="h-6 w-6" />
        </div>
        <h3 className="mt-5 font-heading text-2xl text-foreground">
          Google Maps is ready to plug in
        </h3>
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your environment to
          turn on live map pins for this MVP.
        </p>
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={apiKey}
      libraries={["marker"]}
      disableUsageAttribution
      solutionChannel=""
      onLoad={() => {
        setApiStatus("loaded");
      }}
      onError={() => {
        setApiStatus("error");
      }}
    >
      {apiStatus === "error" ? (
        <MapLoadError />
      ) : apiStatus !== "loaded" ? (
        <MapLoadingState categoryLabel={props.categoryLabel} />
      ) : (
        <LoadedClinicMap {...props} />
      )}
    </APIProvider>
  );
}

function LoadedClinicMap({
  clinics,
  activeClinicId,
  onSelectClinic,
  preferredCenter = null,
  preferredCenterLabel = null,
  userLocation = null,
}: ClinicMapProps) {
  const selectedClinic = clinics.find((clinic) => clinic.id === activeClinicId) ?? null;
  const activeClinicIdRef = useRef<number | null>(activeClinicId);
  const infoWindowContentRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    activeClinicIdRef.current = activeClinicId;
  }, [activeClinicId]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isExpanded]);

  useEffect(() => {
    const element = infoWindowContentRef.current;

    if (!element) {
      return;
    }

    const popupElements: HTMLElement[] = [];
    let currentElement: HTMLElement | null = element;

    for (let index = 0; index < 6 && currentElement; index += 1) {
      popupElements.push(currentElement);
      currentElement = currentElement.parentElement;
    }

    function stopPopupScroll(event: WheelEvent | TouchEvent) {
      event.preventDefault();
      event.stopPropagation();
      if ("stopImmediatePropagation" in event) {
        event.stopImmediatePropagation();
      }
    }

    popupElements.forEach((popupElement) => {
      popupElement.addEventListener("wheel", stopPopupScroll, { passive: false });
      popupElement.addEventListener("touchmove", stopPopupScroll, { passive: false });
    });

    return () => {
      popupElements.forEach((popupElement) => {
        popupElement.removeEventListener("wheel", stopPopupScroll);
        popupElement.removeEventListener("touchmove", stopPopupScroll);
      });
    };
  }, [selectedClinic?.id]);

  return (
    <>
      {isExpanded ? (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]"
          onClick={() => {
            setIsExpanded(false);
          }}
        />
      ) : null}

      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-[22px] sm:rounded-[24px]",
          isExpanded
            ? "fixed inset-4 z-50 rounded-[28px] bg-white shadow-[0_26px_80px_rgba(0,0,0,0.28)]"
            : "shadow-[0_14px_34px_rgba(0,0,0,0.12)]",
        )}
      >
        <Map
          id="clinic-results-map"
          mapId="DEMO_MAP_ID"
          defaultCenter={preferredCenter ?? defaultTorontoCenter}
          defaultZoom={11}
          style={mapContainerStyle}
          disableDefaultUI
          zoomControl={false}
          clickableIcons={false}
          fullscreenControl={false}
          streetViewControl={false}
          mapTypeControl={false}
          gestureHandling="greedy"
          onClick={() => {
            onSelectClinic(null);
          }}
        >
          <MapViewportController
            clinics={clinics}
            selectedClinic={selectedClinic}
            preferredCenter={preferredCenter}
            userLocation={userLocation}
          />
          <MapChrome
            isExpanded={isExpanded}
            onToggleExpanded={() => {
              setIsExpanded((currentValue) => !currentValue);
            }}
          />

          {clinics.map((clinic) => {
            const isActive = clinic.id === activeClinicId;

            return (
              <AdvancedMarker
                key={clinic.id}
                position={{ lat: clinic.lat, lng: clinic.lng }}
                title={clinic.name}
                zIndex={isActive ? 10 : 1}
                onClick={() => {
                  onSelectClinic(clinic.id);
                }}
              >
                <Pin
                  background={isActive ? "#222222" : "#ff385c"}
                  borderColor="#ffffff"
                  glyphColor="#ffffff"
                  scale={isActive ? 1.15 : 1}
                />
              </AdvancedMarker>
            );
          })}

          {userLocation ? (
            <AdvancedMarker
              position={userLocation}
              title="Your location"
              zIndex={20}
            >
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[rgba(37,99,235,0.16)]">
                <div className="h-4 w-4 rounded-full border-[3px] border-white bg-[#2563eb]" />
              </div>
            </AdvancedMarker>
          ) : null}

          {!userLocation && preferredCenter ? (
            <AdvancedMarker
              position={preferredCenter}
              title={preferredCenterLabel ? `${preferredCenterLabel} area` : "Selected area"}
              zIndex={5}
            >
              <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-[#ff385c] bg-[rgba(255,56,92,0.12)]">
                <div className="h-[7px] w-[7px] rounded-full bg-[#ff385c]" />
              </div>
            </AdvancedMarker>
          ) : null}

          {selectedClinic ? (
            <InfoWindow
              position={{ lat: selectedClinic.lat, lng: selectedClinic.lng }}
              onClose={() => {
                if (activeClinicIdRef.current !== selectedClinic.id) {
                  return;
                }

                onSelectClinic(null);
              }}
            >
              <div
                ref={infoWindowContentRef}
                className="max-w-[220px] space-y-1 pr-3"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {selectedClinic.name}
                </p>
                <p className="text-xs leading-5 text-slate-600">
                  {selectedClinic.address}
                </p>
                <p className="text-xs font-medium text-slate-700">
                  {selectedClinic.phone || "Phone unavailable"}
                </p>
              </div>
            </InfoWindow>
          ) : null}
        </Map>
      </div>
    </>
  );
}

function MapViewportController({
  clinics,
  selectedClinic,
  preferredCenter,
  userLocation,
}: {
  clinics: ClinicListItem[];
  selectedClinic: ClinicListItem | null;
  preferredCenter: UserLocation | null;
  userLocation: UserLocation | null;
}) {
  const map = useMap("clinic-results-map");

  useEffect(() => {
    if (!map || selectedClinic) {
      return;
    }

    if (userLocation) {
      map.panTo(userLocation);
      map.setZoom(Math.max(map.getZoom() ?? 11, 11));
      return;
    }

    if (preferredCenter && clinics.length === 0) {
      map.panTo(preferredCenter);
      map.setZoom(11);
      return;
    }

    if (clinics.length === 0) {
      map.setCenter(defaultTorontoCenter);
      map.setZoom(11);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();

    if (preferredCenter) {
      bounds.extend(preferredCenter);
    }

    clinics.forEach((clinic) => {
      bounds.extend({
        lat: clinic.lat,
        lng: clinic.lng,
      });
    });

    map.fitBounds(bounds, 72);
  }, [clinics, map, preferredCenter, selectedClinic, userLocation]);

  useEffect(() => {
    if (!map || !selectedClinic) {
      return;
    }

    map.panTo({
      lat: selectedClinic.lat,
      lng: selectedClinic.lng,
    });

    const currentZoom = map.getZoom() ?? 12;
    map.setZoom(Math.max(currentZoom, 14));
  }, [map, selectedClinic]);

  return null;
}

function MapChrome({
  isExpanded,
  onToggleExpanded,
}: {
  isExpanded: boolean;
  onToggleExpanded: () => void;
}) {
  const map = useMap("clinic-results-map");

  return (
    <>
      <MapControlShell position="top-right">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label={isExpanded ? "Close expanded map" : "Expand map"}
          className="rounded-full bg-white/96 shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur-sm"
          onClick={(event) => {
            event.stopPropagation();
            onToggleExpanded();
          }}
        >
          {isExpanded ? <X className="h-4.5 w-4.5" /> : <Expand className="h-4.5 w-4.5" />}
        </Button>
      </MapControlShell>

      <MapControlShell position="bottom-right">
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Zoom in"
            className="rounded-full bg-white/96 shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur-sm"
            onClick={(event) => {
              event.stopPropagation();
              if (!map) {
                return;
              }

              map.setZoom((map.getZoom() ?? 11) + 1);
            }}
          >
            <Plus className="h-4.5 w-4.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Zoom out"
            className="rounded-full bg-white/96 shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur-sm"
            onClick={(event) => {
              event.stopPropagation();
              if (!map) {
                return;
              }

              map.setZoom((map.getZoom() ?? 11) - 1);
            }}
          >
            <Minus className="h-4.5 w-4.5" />
          </Button>
        </div>
      </MapControlShell>
    </>
  );
}

function MapControlShell({
  children,
  position,
}: {
  children: ReactNode;
  position: "top-right" | "bottom-right";
}) {
  const map = useMap("clinic-results-map");

  if (!map) {
    return null;
  }

  const positionClassName =
    position === "top-right"
      ? "absolute right-3 top-3 z-10"
      : "absolute bottom-4 right-4 z-10";

  return <div className={positionClassName}>{children}</div>;
}

function MapLoadingState({ categoryLabel }: Pick<ClinicMapProps, "categoryLabel">) {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-[24px] bg-white px-6 py-10 text-center">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <p className="mt-4 text-sm font-medium text-muted-foreground">
        Loading {categoryLabel.toLowerCase()} clinic pins...
      </p>
    </div>
  );
}

function MapLoadError() {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-[24px] border border-dashed border-border/80 bg-white px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#fce7dc] text-[#af5239]">
        <TriangleAlert className="h-6 w-6" />
      </div>
      <h3 className="mt-5 font-heading text-2xl text-foreground">
        We couldn&apos;t load the map
      </h3>
      <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
        The clinic list is still available, but the Google Maps script failed to
        load for this session.
      </p>
    </div>
  );
}
