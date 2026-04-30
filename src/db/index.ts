import { neon } from "@neondatabase/serverless";
import { addDays, format } from "date-fns";
import { eq } from "drizzle-orm";
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
import { getNearestClinicArea, type ClinicArea, type UserLocation } from "../lib/clinic-search";

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
  if (!hasDatabaseUrl()) {
    return [];
  }

  const { clinics } = await import("./schema");
  const db = getDb();
  const rows = await db
    .select()
    .from(clinics)
    .where(eq(clinics.category, category));

  return rows
    .map((clinic) => ({
      id: clinic.id,
      name: clinic.name,
      category: clinic.category,
      address: clinic.address,
      lat: clinic.lat,
      lng: clinic.lng,
      rating: clinic.rating,
      phone: clinic.phone,
      area: getNearestClinicArea({
        lat: clinic.lat,
        lng: clinic.lng,
      }).label,
      availableDates: generateAvailableDatesForStoredClinic(category, clinic.name),
    }))
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

const availabilityStartDate = new Date("2026-05-10T00:00:00");
const availabilityDatePool = Array.from({ length: 7 }, (_, index) =>
  format(addDays(availabilityStartDate, index), "yyyy-MM-dd"),
);

function generateAvailableDatesForStoredClinic(category: ClinicCategorySlug, name: string) {
  const random = createSeededRandom(`${category}::${name}`);
  const shuffledDates = [...availabilityDatePool];

  for (let index = shuffledDates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const currentDate = shuffledDates[index];

    shuffledDates[index] = shuffledDates[swapIndex];
    shuffledDates[swapIndex] = currentDate;
  }

  const dateCount = 2 + Math.floor(random() * 3);

  return shuffledDates.slice(0, dateCount).sort((left, right) => left.localeCompare(right));
}

function createSeededRandom(seed: string) {
  let state = hashSeed(seed) || 1;

  return () => {
    state += 0x6d2b79f5;

    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed: string) {
  let hash = 2166136261;

  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
