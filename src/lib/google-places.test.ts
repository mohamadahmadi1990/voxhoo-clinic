import assert from "node:assert/strict";
import { getGooglePlacesTextQuery, mapGooglePlaceToClinic, resolveClinicSearchOrigin } from "./google-places";
import { getClinicAreaBySlug } from "./clinic-search";

function testCategoryQueryMapping() {
  assert.equal(getGooglePlacesTextQuery("dental"), "dentist");
  assert.equal(getGooglePlacesTextQuery("physiotherapy"), "physiotherapist");
  assert.equal(getGooglePlacesTextQuery("skin-hair"), "dermatologist");
}

function testSearchOriginPreferenceOrder() {
  const userLocation = { lat: 43.7, lng: -79.4 };
  const northYork = getClinicAreaBySlug("north-york");

  assert.deepEqual(
    resolveClinicSearchOrigin({
      selectedLocation: northYork,
      userLocation,
    }),
    northYork?.center,
  );
  assert.deepEqual(
    resolveClinicSearchOrigin({
      selectedLocation: northYork,
    }),
    northYork?.center,
  );
}

function testGooglePlaceMapping() {
  const clinic = mapGooglePlaceToClinic(
    {
      id: "places/abc123",
      displayName: { text: "Toronto Smile Studio" },
      formattedAddress: "100 Queen St W, Toronto, ON",
      rating: 4.8,
      location: {
        latitude: 43.6532,
        longitude: -79.3832,
      },
    },
    "dental",
  );

  assert.ok(clinic);
  assert.equal(clinic?.category, "dental");
  assert.equal(clinic?.name, "Toronto Smile Studio");
  assert.equal(clinic?.phone, "Phone unavailable");
  assert.equal(clinic?.rating, 4.8);
}

export async function runGooglePlacesTests() {
  testCategoryQueryMapping();
  testSearchOriginPreferenceOrder();
  testGooglePlaceMapping();

  return 3;
}
