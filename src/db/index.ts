import { neon } from "@neondatabase/serverless";
import { and, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import type { ClinicCategorySlug } from "../lib/clinic-categories";
import type { ClinicListItem } from "../lib/clinic-list-item";
import {
  getTopGooglePlacesClinics,
  hasGooglePlacesApiKey,
  searchGooglePlacesClinicsByCategory,
} from "../lib/google-places";
import {
  getMockClinicsByCategory,
  getTopMockClinics,
} from "../lib/mock-clinics";
import {
  clinicAreas,
  getNearestClinicArea,
  type ClinicArea,
  type ClinicAreaLabel,
  type UserLocation,
} from "../lib/clinic-search";

export type { ClinicListItem } from "../lib/clinic-list-item";

export type SafeClinicFetchResult = {
  clinics: ClinicListItem[];
  source: "places" | "mock";
  warning?: string;
};

export function hasDatabaseUrl() {
  return Boolean(getDatabaseUrl());
}

export function getDb() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is missing. Add your Neon connection string to .env.local before running database scripts.",
    );
  }

  const sql = neon(databaseUrl);

  return drizzle({ client: sql });
}

export async function getClinicsByCategory(
  category: ClinicCategorySlug,
  options: {
    selectedLocation?: ClinicArea | null;
    userLocation?: UserLocation | null;
  } = {},
): Promise<ClinicListItem[]> {
  void options;
  return searchGooglePlacesClinicsByCategory(category, options);
}

export async function getStoredClinicsByCategory(
  category: ClinicCategorySlug,
): Promise<ClinicListItem[]> {
  return getClinicsByCategoryLocationAndDate(category);
}

export async function getClinicsByCategoryLocationAndDate(
  category: ClinicCategorySlug,
  options: {
    selectedLocation?: ClinicArea | null;
    userLocation?: UserLocation | null;
    date?: string | null;
  } = {},
): Promise<ClinicListItem[]> {
  if (!hasDatabaseUrl()) {
    return [];
  }

  void options.selectedLocation;
  void options.userLocation;

  const { clinics, clinicTimeSlots } = await import("./schema");
  const db = getDb();
  const clinicSelection = {
    id: clinics.id,
    name: clinics.name,
    category: clinics.category,
    address: clinics.address,
    area: clinics.area,
    lat: clinics.lat,
    lng: clinics.lng,
    rating: clinics.rating,
    phone: clinics.phone,
  };

  const clinicRows = options.date
    ? await db
        .selectDistinct(clinicSelection)
        .from(clinics)
        .innerJoin(
          clinicTimeSlots,
          and(
            eq(clinicTimeSlots.clinicId, clinics.id),
            eq(clinicTimeSlots.status, "available"),
            eq(clinicTimeSlots.slotDate, options.date),
          ),
        )
        .where(eq(clinics.category, category))
    : await db
        .select(clinicSelection)
        .from(clinics)
        .where(eq(clinics.category, category));

  if (clinicRows.length === 0) {
    return [];
  }

  const clinicIds = clinicRows.map((clinic) => clinic.id);
  const slotRows = await db
    .select({
      clinicId: clinicTimeSlots.clinicId,
      slotDate: clinicTimeSlots.slotDate,
      startTime: clinicTimeSlots.startTime,
      endTime: clinicTimeSlots.endTime,
      status: clinicTimeSlots.status,
    })
    .from(clinicTimeSlots)
    .where(inArray(clinicTimeSlots.clinicId, clinicIds));

  const slotDatesByClinicId = new Map<number, string[]>();
  for (const slot of slotRows) {
    if (slot.status !== "available") {
      continue;
    }

    const currentDates = slotDatesByClinicId.get(slot.clinicId) ?? [];

    if (!currentDates.includes(slot.slotDate)) {
      currentDates.push(slot.slotDate);
      slotDatesByClinicId.set(slot.clinicId, currentDates);
    }
  }

  return clinicRows
    .map((clinic) => {
      const availableDates = (slotDatesByClinicId.get(clinic.id) ?? []).sort((left, right) =>
        left.localeCompare(right),
      );
      const availabilityDate = options.date ?? availableDates[0] ?? null;
      const daySlots = availabilityDate
        ? slotRows
            .filter(
              (slot) =>
                slot.clinicId === clinic.id && slot.slotDate === availabilityDate,
            )
            .sort((left, right) => left.startTime.localeCompare(right.startTime))
        : [];
      const availableTimeSlots = availabilityDate
        ? daySlots
            .filter((slot) => slot.status === "available")
            .map((slot) => slot.startTime)
            .filter((slotTime, index, times) => times.indexOf(slotTime) === index)
            .sort((left, right) => left.localeCompare(right))
        : [];

      return {
        id: clinic.id,
        name: clinic.name,
        category: clinic.category,
        address: clinic.address,
        lat: clinic.lat,
        lng: clinic.lng,
        rating: clinic.rating,
        phone: clinic.phone,
        area: normalizeStoredClinicArea(clinic.area, {
          lat: clinic.lat,
          lng: clinic.lng,
        }),
        availableDates,
        availabilityDate,
        availableTimeSlots,
        timeSlots: daySlots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: slot.status,
        })),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function getTopClinics(limit = 8): Promise<ClinicListItem[]> {
  return getTopGooglePlacesClinics(limit);
}

export async function getClinicsByCategorySafe(
  category: ClinicCategorySlug,
  options: {
    selectedLocation?: ClinicArea | null;
    userLocation?: UserLocation | null;
  } = {},
): Promise<SafeClinicFetchResult> {
  return fetchClinicsSafely(
    () => getClinicsByCategory(category, options),
    () => getMockClinicsByCategory(category),
  );
}

export async function getTopClinicsSafe(
  limit = 8,
): Promise<SafeClinicFetchResult> {
  return fetchClinicsSafely(() => getTopClinics(limit), () => getTopMockClinics(limit));
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  return databaseUrl ? databaseUrl : null;
}

async function fetchClinicsSafely(
  query: () => Promise<ClinicListItem[]>,
  fallback: () => ClinicListItem[],
): Promise<SafeClinicFetchResult> {
  if (!hasGooglePlacesApiKey()) {
    return {
      clinics: fallback(),
      source: "mock",
      warning: "Showing sample Toronto clinics while the Google Places API is still being connected.",
    };
  }

  try {
    return {
      clinics: await query(),
      source: "places",
    };
  } catch (error) {
    console.error(
      `Falling back to mock clinics because the Google Places query failed: ${getErrorMessage(error)}`,
    );

    return {
      clinics: fallback(),
      source: "mock",
      warning: "Showing sample Toronto clinics while live Google Places data is temporarily unavailable.",
    };
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function normalizeStoredClinicArea(
  area: string | null,
  location: { lat: number; lng: number },
): ClinicAreaLabel {
  const matchedArea = clinicAreas.find((clinicArea) => clinicArea.label === area);

  if (matchedArea) {
    return matchedArea.label;
  }

  return getNearestClinicArea(location).label;
}
