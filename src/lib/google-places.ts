import type { ClinicCategorySlug } from "./clinic-categories";
import { clinicCategorySlugs } from "./clinic-categories";
import type { ClinicListItem } from "./clinic-list-item";
import { clinicAreas, type ClinicArea, type UserLocation } from "./clinic-search";
import { attachClinicMetadataList } from "./mock-clinics";

const googlePlacesTextQueryMap = {
  dental: "dentist",
  physiotherapy: "physiotherapist",
  "skin-hair": "dermatologist",
  "family-doctor": "family doctor",
  chiropractic: "chiropractor",
  optometry: "optometrist",
  "mental-health": "mental health clinic",
} as const satisfies Record<ClinicCategorySlug, string>;

const googlePlacesTextSearchUrl = "https://places.googleapis.com/v1/places:searchText";
const torontoArea = clinicAreas[0];
const missingPhoneLabel = "Phone unavailable";

type GooglePlacesClinicSearchOptions = {
  pageSize?: number;
  selectedLocation?: ClinicArea | null;
  userLocation?: UserLocation | null;
};

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

export function hasGooglePlacesApiKey() {
  return Boolean(getGooglePlacesApiKey());
}

export function getGooglePlacesTextQuery(category: ClinicCategorySlug) {
  return googlePlacesTextQueryMap[category];
}

export function resolveClinicSearchOrigin({
  selectedLocation,
  userLocation,
}: Pick<GooglePlacesClinicSearchOptions, "selectedLocation" | "userLocation"> = {}) {
  return selectedLocation?.center ?? userLocation ?? torontoArea.center;
}

export async function searchGooglePlacesClinicsByCategory(
  category: ClinicCategorySlug,
  options: GooglePlacesClinicSearchOptions = {},
): Promise<ClinicListItem[]> {
  const apiKey = getGooglePlacesApiKey();

  if (!apiKey) {
    throw new Error(
      "GOOGLE_PLACES_API_KEY is missing. Add a Google Places server key to .env.local to fetch live clinics.",
    );
  }

  const origin = resolveClinicSearchOrigin(options);
  const response = await fetch(googlePlacesTextSearchUrl, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.rating",
    },
    body: JSON.stringify({
      textQuery: getGooglePlacesTextQuery(category),
      pageSize: options.pageSize ?? 12,
      locationBias: {
        circle: {
          center: {
            latitude: origin.lat,
            longitude: origin.lng,
          },
          radius: options.userLocation ? 8000 : 12000,
        },
      },
      languageCode: "en",
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Google Places Text Search failed with ${response.status} ${response.statusText}: ${await response.text()}`,
    );
  }

  const data = (await response.json()) as GooglePlacesSearchResponse;
  const clinics = (data.places ?? [])
    .map((place) => mapGooglePlaceToClinic(place, category))
    .filter((clinic): clinic is GooglePlacesClinicRecord => clinic !== null);

  return attachClinicMetadataList(clinics);
}

export async function getTopGooglePlacesClinics(limit = 8): Promise<ClinicListItem[]> {
  const perCategoryLimit = Math.max(1, Math.ceil(limit / clinicCategorySlugs.length));
  const categoryResults = await Promise.all(
    clinicCategorySlugs.map((category) =>
      searchGooglePlacesClinicsByCategory(category, {
        pageSize: perCategoryLimit,
        selectedLocation: torontoArea,
      }),
    ),
  );

  const dedupedClinics = new Map<string, ClinicListItem>();

  for (const clinic of categoryResults.flat()) {
    const dedupeKey = `${clinic.name}::${clinic.address}`;

    if (!dedupedClinics.has(dedupeKey)) {
      dedupedClinics.set(dedupeKey, clinic);
    }
  }

  return [...dedupedClinics.values()]
    .sort((left, right) => {
      if (right.rating !== left.rating) {
        return right.rating - left.rating;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, limit);
}

type GooglePlacesClinicRecord = Omit<ClinicListItem, "area" | "availableDates">;

export function mapGooglePlaceToClinic(
  place: GooglePlace,
  category: ClinicCategorySlug,
): GooglePlacesClinicRecord | null {
  const name = place.displayName?.text?.trim();
  const address = place.formattedAddress?.trim();
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;

  if (!name || !address || typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }

  return {
    id: hashClinicIdentifier(place.id ?? `${category}::${name}::${address}`),
    name,
    category,
    address,
    lat,
    lng,
    rating: typeof place.rating === "number" ? place.rating : 0,
    phone: missingPhoneLabel,
  };
}

function getGooglePlacesApiKey() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim() ?? "";

  return apiKey || null;
}

function hashClinicIdentifier(value: string) {
  let hash = 2166136261;

  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) || 1;
}
