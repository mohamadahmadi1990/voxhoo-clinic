import assert from "node:assert/strict";
import { getClinicsByCategorySafe } from "./index";

export async function runDatabaseFallbackTests() {
  const originalPlacesApiKey = process.env.GOOGLE_PLACES_API_KEY;
  const originalPublicMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  delete process.env.GOOGLE_PLACES_API_KEY;
  delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  try {
    const result = await getClinicsByCategorySafe("dental");

    assert.equal(result.source, "mock");
    assert.equal(
      result.warning,
      "Showing sample Toronto clinics while the Google Places API is still being connected.",
    );
    assert.deepEqual(
      result.clinics.map((clinic) => clinic.name),
      [
        "Bay & Bloor Family Dentistry",
        "Danforth Smile Clinic",
        "Queen West Dental House",
      ],
    );
  } finally {
    if (originalPlacesApiKey) {
      process.env.GOOGLE_PLACES_API_KEY = originalPlacesApiKey;
    } else {
      delete process.env.GOOGLE_PLACES_API_KEY;
    }

    if (originalPublicMapsKey) {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = originalPublicMapsKey;
    } else {
      delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    }
  }
 
  return 1;
}
