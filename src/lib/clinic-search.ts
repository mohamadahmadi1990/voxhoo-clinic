import { format, isValid, parseISO } from "date-fns";
import type { ClinicCategorySlug } from "./clinic-categories";

export type UserLocation = {
  lat: number;
  lng: number;
};

export const clinicAreaSlugs = [
  "toronto",
  "north-york",
  "scarborough",
  "etobicoke",
  "mississauga",
  "vaughan",
  "markham",
  "richmond-hill",
] as const;

export type ClinicAreaSlug = (typeof clinicAreaSlugs)[number];

type SearchParamValue = string | string[] | undefined;

const searchDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export const clinicAreas = [
  {
    slug: "toronto",
    label: "Toronto",
    center: { lat: 43.6532, lng: -79.3832 },
  },
  {
    slug: "north-york",
    label: "North York",
    center: { lat: 43.7615, lng: -79.4111 },
  },
  {
    slug: "scarborough",
    label: "Scarborough",
    center: { lat: 43.7764, lng: -79.2318 },
  },
  {
    slug: "etobicoke",
    label: "Etobicoke",
    center: { lat: 43.6205, lng: -79.5132 },
  },
  {
    slug: "mississauga",
    label: "Mississauga",
    center: { lat: 43.589, lng: -79.6441 },
  },
  {
    slug: "vaughan",
    label: "Vaughan",
    center: { lat: 43.8361, lng: -79.4983 },
  },
  {
    slug: "markham",
    label: "Markham",
    center: { lat: 43.8561, lng: -79.337 },
  },
  {
    slug: "richmond-hill",
    label: "Richmond Hill",
    center: { lat: 43.8828, lng: -79.4403 },
  },
] as const;

export type ClinicArea = (typeof clinicAreas)[number];
export type ClinicAreaLabel = ClinicArea["label"];

export function normalizeSearchDateParam(value: SearchParamValue) {
  if (typeof value !== "string" || !searchDatePattern.test(value)) {
    return null;
  }

  const parsedDate = parseISO(value);

  if (!isValid(parsedDate)) {
    return null;
  }

  return format(parsedDate, "yyyy-MM-dd") === value ? value : null;
}

export function formatSearchDateParam(value: Date) {
  return format(value, "yyyy-MM-dd");
}

export function formatSearchDateLabel(value: Date | string) {
  const parsedDate = typeof value === "string" ? parseISO(value) : value;

  if (!isValid(parsedDate)) {
    return null;
  }

  return format(parsedDate, "MMMM d, yyyy");
}

export function buildClinicSearchQuery({
  date,
  location,
  userLocation,
}: {
  date?: Date | string | null;
  location?: ClinicAreaSlug | null;
  userLocation?: UserLocation | null;
}) {
  const params = new URLSearchParams();
  const normalizedDate =
    typeof date === "string"
      ? normalizeSearchDateParam(date)
      : date
        ? formatSearchDateParam(date)
        : null;

  if (normalizedDate) {
    params.set("date", normalizedDate);
  }

  if (location) {
    params.set("location", location);
  }

  if (userLocation) {
    params.set("lat", formatCoordinate(userLocation.lat));
    params.set("lng", formatCoordinate(userLocation.lng));
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export function buildClinicSearchHref(
  category: ClinicCategorySlug,
  options?: {
    date?: Date | string | null;
    location?: ClinicAreaSlug | null;
    userLocation?: UserLocation | null;
  },
) {
  return `/clinics/${category}${buildClinicSearchQuery(options ?? {})}`;
}

export function normalizeLocationParam(value: SearchParamValue) {
  if (typeof value !== "string") {
    return null;
  }

  return getClinicAreaBySlug(value);
}

export function getClinicAreaBySlug(slug: string) {
  return clinicAreas.find((area) => area.slug === slug) ?? null;
}

export function normalizeUserLocationParams({
  lat,
  lng,
}: {
  lat?: SearchParamValue;
  lng?: SearchParamValue;
}) {
  const normalizedLat = normalizeCoordinate(lat, -90, 90);
  const normalizedLng = normalizeCoordinate(lng, -180, 180);

  if (normalizedLat === null || normalizedLng === null) {
    return null;
  }

  return {
    lat: normalizedLat,
    lng: normalizedLng,
  };
}

export function getDistanceInKilometers(
  origin: UserLocation,
  destination: Pick<UserLocation, "lat" | "lng">,
) {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(destination.lat - origin.lat);
  const deltaLng = toRadians(destination.lng - origin.lng);
  const originLat = toRadians(origin.lat);
  const destinationLat = toRadians(destination.lat);
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(deltaLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function formatDistanceLabel(distanceKm: number) {
  return distanceKm < 10
    ? `${distanceKm.toFixed(1)} km away`
    : `${Math.round(distanceKm)} km away`;
}

function normalizeCoordinate(value: SearchParamValue, min: number, max: number) {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number(value.trim());

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return null;
  }

  return parsed;
}

function formatCoordinate(value: number) {
  return value.toFixed(5);
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
