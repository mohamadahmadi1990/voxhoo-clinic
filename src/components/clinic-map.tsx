"use client";

import { useEffect, useState } from "react";
import {
  GoogleMap,
  InfoWindowF,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Loader2, MapPinned, TriangleAlert } from "lucide-react";
import type { ClinicListItem } from "@/db";
import type { UserLocation } from "@/lib/clinic-search";

type ClinicMapProps = {
  clinics: ClinicListItem[];
  activeClinicId: number | null;
  onSelectClinic: (clinicId: number | null) => void;
  categoryLabel: string;
  userLocation?: UserLocation | null;
};

type LoadedClinicMapProps = ClinicMapProps & {
  apiKey: string;
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};
const mapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7280" }],
  },
  {
    featureType: "administrative.neighborhood",
    elementType: "labels.text.fill",
    stylers: [{ color: "#717171" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#dbeafe" }],
  },
];
const defaultTorontoCenter = {
  lat: 43.6532,
  lng: -79.3832,
};

export function ClinicMap(props: ClinicMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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

  return <LoadedClinicMap {...props} apiKey={apiKey} />;
}

function LoadedClinicMap({
  clinics,
  activeClinicId,
  onSelectClinic,
  apiKey,
  categoryLabel,
  userLocation = null,
}: LoadedClinicMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "care-atlas-google-map",
    googleMapsApiKey: apiKey,
  });
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const selectedClinic =
    clinics.find((clinic) => clinic.id === activeClinicId) ?? null;

  useEffect(() => {
    if (!map || selectedClinic) {
      return;
    }

    if (userLocation) {
      map.panTo(userLocation);
      map.setZoom(Math.max(map.getZoom() ?? 11, 11));
      return;
    }

    if (clinics.length === 0) {
      map.setCenter(defaultTorontoCenter);
      map.setZoom(11);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    clinics.forEach((clinic) => {
      bounds.extend({
        lat: clinic.lat,
        lng: clinic.lng,
      });
    });

    map.fitBounds(bounds, 72);
  }, [clinics, map, selectedClinic, userLocation]);

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

  if (loadError) {
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

  if (!isLoaded) {
    return (
      <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-[24px] bg-white px-6 py-10 text-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Loading {categoryLabel.toLowerCase()} clinic pins...
        </p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      onLoad={(instance) => {
        instance.setCenter(defaultTorontoCenter);
        instance.setZoom(11);
        setMap(instance);
      }}
      onUnmount={() => {
        setMap(null);
      }}
      onClick={() => {
        onSelectClinic(null);
      }}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        styles: mapStyles,
      }}
    >
      {clinics.map((clinic) => {
        const isActive = clinic.id === activeClinicId;

        return (
          <MarkerF
            key={clinic.id}
            position={{ lat: clinic.lat, lng: clinic.lng }}
            title={clinic.name}
            icon={createMarkerIcon(isActive)}
            zIndex={isActive ? 10 : 1}
            onClick={() => {
              onSelectClinic(clinic.id);
            }}
          />
        );
      })}

      {userLocation ? (
        <MarkerF
          position={userLocation}
          title="Your location"
          icon={createUserMarkerIcon()}
          zIndex={20}
        />
      ) : null}

      {selectedClinic ? (
        <InfoWindowF
          position={{ lat: selectedClinic.lat, lng: selectedClinic.lng }}
          onCloseClick={() => {
            onSelectClinic(null);
          }}
        >
          <div className="max-w-[220px] space-y-1 pr-3">
            <p className="text-sm font-semibold text-slate-900">
              {selectedClinic.name}
            </p>
            <p className="text-xs leading-5 text-slate-600">
              {selectedClinic.address}
            </p>
            <p className="text-xs font-medium text-slate-700">
              {selectedClinic.phone}
            </p>
          </div>
        </InfoWindowF>
      ) : null}
    </GoogleMap>
  );
}

function createMarkerIcon(isActive: boolean) {
  if (typeof window === "undefined" || !window.google?.maps) {
    return undefined;
  }

  const fill = isActive ? "#222222" : "#ff385c";
  const size = isActive ? 38 : 34;
  const height = isActive ? 46 : 42;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${height}" viewBox="0 0 38 46" fill="none">
      <path d="M19 44C19 44 34 31.9 34 19.6C34 11.5 27.1 5 19 5C10.9 5 4 11.5 4 19.6C4 31.9 19 44 19 44Z" fill="${fill}" stroke="white" stroke-width="2"/>
      <circle cx="19" cy="20" r="6.5" fill="white"/>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(size, height),
    anchor: new window.google.maps.Point(size / 2, height),
  };
}

function createUserMarkerIcon() {
  if (typeof window === "undefined" || !window.google?.maps) {
    return undefined;
  }

  const glowSize = 34;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${glowSize}" height="${glowSize}" viewBox="0 0 34 34" fill="none">
      <circle cx="17" cy="17" r="16" fill="rgba(37,99,235,0.16)" />
      <circle cx="17" cy="17" r="8" fill="#2563eb" stroke="white" stroke-width="3" />
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(glowSize, glowSize),
    anchor: new window.google.maps.Point(glowSize / 2, glowSize / 2),
    labelOrigin: new window.google.maps.Point(glowSize / 2, glowSize / 2),
  };
}
