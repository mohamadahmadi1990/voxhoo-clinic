import { neon } from "@neondatabase/serverless";
import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import type { ClinicCategorySlug } from "../lib/clinic-categories";
import {
  attachClinicMetadataList,
  getMockClinicsByCategory,
  getTopMockClinics,
  type MockClinic,
} from "../lib/mock-clinics";
import { clinics } from "./schema";

export type ClinicListItem = MockClinic;

export type SafeClinicFetchResult = {
  clinics: ClinicListItem[];
  source: "database" | "mock";
  warning?: string;
};

export function hasDatabaseUrl() {
  return Boolean(getDatabaseUrl());
}

export function getDb() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is missing. Add your Neon connection string to .env.local before querying clinics.",
    );
  }

  const sql = neon(databaseUrl);

  return drizzle({ client: sql });
}

const clinicSelectFields = {
  id: clinics.id,
  name: clinics.name,
  category: clinics.category,
  address: clinics.address,
  lat: clinics.lat,
  lng: clinics.lng,
  rating: clinics.rating,
  phone: clinics.phone,
};

export async function getClinicsByCategory(
  category: ClinicCategorySlug,
): Promise<ClinicListItem[]> {
  const db = getDb();

  const rows = await db
    .select(clinicSelectFields)
    .from(clinics)
    .where(eq(clinics.category, category))
    .orderBy(asc(clinics.name));

  return attachClinicMetadataList(rows);
}

export async function getTopClinics(limit = 8): Promise<ClinicListItem[]> {
  const db = getDb();

  const rows = await db
    .select(clinicSelectFields)
    .from(clinics)
    .orderBy(desc(clinics.rating), asc(clinics.name))
    .limit(limit);

  return attachClinicMetadataList(rows);
}

export async function getClinicsByCategorySafe(
  category: ClinicCategorySlug,
): Promise<SafeClinicFetchResult> {
  return fetchClinicsSafely(
    () => getClinicsByCategory(category),
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
  if (!hasDatabaseUrl()) {
    return {
      clinics: fallback(),
      source: "mock",
      warning: "Showing sample Toronto clinics while the live database is still being connected.",
    };
  }

  try {
    return {
      clinics: await query(),
      source: "database",
    };
  } catch (error) {
    console.error(
      `Falling back to mock clinics because the database query failed: ${getErrorMessage(error)}`,
    );

    return {
      clinics: fallback(),
      source: "mock",
      warning: "Showing sample Toronto clinics while the live database is temporarily unavailable.",
    };
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
