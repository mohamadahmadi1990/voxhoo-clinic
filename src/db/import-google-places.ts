import { config } from "dotenv";
import { sql } from "drizzle-orm";
import type { NewClinic } from "./schema";
import { getDb } from "./index";
import { clinicCategorySlugs, type ClinicCategorySlug } from "../lib/clinic-categories";
import { getGooglePlacesTextQuery } from "../lib/google-places";
import { clinicAreas, type ClinicArea } from "../lib/clinic-search";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const googlePlacesTextSearchUrl = "https://places.googleapis.com/v1/places:searchText";
const googlePlaceDetailsUrl = "https://places.googleapis.com/v1/places";
const missingPhoneLabel = "Phone unavailable";

type GooglePlacesSearchResponse = {
  places?: GooglePlace[];
};

type GooglePlace = {
  id?: string;
  displayName?: {
    text?: string;
  };
  formattedAddress?: string;
  rating?: number;
  location?: {
    latitude?: number;
    longitude?: number;
  };
};

type ImportedClinic = NewClinic & {
  googlePlaceId: string;
  source: string;
};

type DatabaseClient = ReturnType<typeof getDb>;

async function main() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is missing.");
  }

  const { clinics } = await import("./schema");
  const db = getDb();

  await db.execute(sql`ALTER TABLE clinics ADD COLUMN IF NOT EXISTS google_place_id text`);
  await db.execute(sql`ALTER TABLE clinics ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual'`);

  const databaseName = await getCurrentDatabaseName(db);
  const countBeforeImport = await getClinicCount(db);

  const existingGooglePlaceIds = new Set(
    (
      await db.execute<{ google_place_id: string | null }>(
        sql`SELECT google_place_id FROM clinics WHERE google_place_id IS NOT NULL`,
      )
    ).rows
      .map((row) => row.google_place_id)
      .filter((value): value is string => Boolean(value)),
  );

  const imports = new Map<string, ImportedClinic>();
  let fetchedCount = 0;
  let skippedDuplicateCount = 0;

  for (const category of clinicCategorySlugs) {
    for (const area of clinicAreas) {
      const places = await fetchPlacesForCategoryAndArea(apiKey, category, area);
      fetchedCount += places.length;

      for (const place of places) {
        const clinic = await mapPlaceToClinic(apiKey, place, category);

        if (!clinic) {
          continue;
        }

        if (existingGooglePlaceIds.has(clinic.googlePlaceId) || imports.has(clinic.googlePlaceId)) {
          skippedDuplicateCount += 1;
          continue;
        }

        imports.set(clinic.googlePlaceId, clinic);
      }
    }
  }

  const rows = [...imports.values()];
  let insertedCount = 0;

  if (rows.length > 0) {
    const insertedRows = await db.insert(clinics).values(rows).returning({
      id: clinics.id,
    });
    insertedCount = insertedRows.length;
  }

  const countAfterImport = await getClinicCount(db);

  console.info(`database: ${databaseName}`);
  console.info(`count before import: ${countBeforeImport}`);
  console.info(`fetched count: ${fetchedCount}`);
  console.info(`inserted count: ${insertedCount}`);
  console.info(`skipped duplicate count: ${skippedDuplicateCount}`);
  console.info(`count after import: ${countAfterImport}`);
}

async function fetchPlacesForCategoryAndArea(
  apiKey: string,
  category: ClinicCategorySlug,
  area: ClinicArea,
) {
  const response = await fetch(googlePlacesTextSearchUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.rating",
    },
    body: JSON.stringify({
      textQuery: getGooglePlacesTextQuery(category),
      pageSize: 10,
      locationBias: {
        circle: {
          center: {
            latitude: area.center.lat,
            longitude: area.center.lng,
          },
          radius: 12000,
        },
      },
      languageCode: "en",
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Google Places import failed for ${category} in ${area.slug}: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as GooglePlacesSearchResponse;

  return data.places ?? [];
}

function mapPlaceToClinic(
  apiKey: string,
  place: GooglePlace,
  category: ClinicCategorySlug,
): Promise<ImportedClinic | null> {
  return buildImportedClinic(apiKey, place, category);
}

async function buildImportedClinic(
  apiKey: string,
  place: GooglePlace,
  category: ClinicCategorySlug,
): Promise<ImportedClinic | null> {
  const googlePlaceId = place.id?.trim();
  const name = place.displayName?.text?.trim();
  const address = place.formattedAddress?.trim();
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;

  if (
    !googlePlaceId ||
    !name ||
    !address ||
    typeof lat !== "number" ||
    typeof lng !== "number"
  ) {
    return null;
  }

  const phone = (await fetchPlacePhoneNumber(apiKey, googlePlaceId)) ?? missingPhoneLabel;

  return {
    googlePlaceId,
    source: "google_places",
    name,
    category,
    address,
    lat,
    lng,
    rating: typeof place.rating === "number" ? place.rating : 0,
    phone,
  };
}

async function fetchPlacePhoneNumber(apiKey: string, googlePlaceId: string) {
  const response = await fetch(`${googlePlaceDetailsUrl}/${googlePlaceId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "nationalPhoneNumber",
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    nationalPhoneNumber?: string;
  };

  return data.nationalPhoneNumber?.trim() || null;
}

async function getCurrentDatabaseName(db: DatabaseClient) {
  const result = await db.execute<{ current_database: string }>(
    sql`SELECT current_database() AS current_database`,
  );

  return result.rows[0]?.current_database ?? "unknown";
}

async function getClinicCount(db: DatabaseClient) {
  const result = await db.execute<{ count: string }>(sql`SELECT COUNT(*)::text AS count FROM clinics`);

  return Number(result.rows[0]?.count ?? "0");
}

main().catch((error) => {
  console.error("Failed to import Google Places clinics.", error);
  process.exit(1);
});
