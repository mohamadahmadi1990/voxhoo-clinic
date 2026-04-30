import assert from "node:assert/strict";
import { getClinicAreaBySlug } from "./clinic-search";
import { refineClinicsForResults } from "./clinic-results";

const sampleClinics = [
  {
    id: 1,
    name: "Alpha Care",
    area: "Toronto",
    lat: 43.65,
    lng: -79.39,
    rating: 4.7,
    availableDates: ["2026-05-10", "2026-05-12"],
  },
  {
    id: 2,
    name: "Bravo Care",
    area: "North York",
    lat: 43.76,
    lng: -79.41,
    rating: 4.9,
    availableDates: ["2026-05-11"],
  },
  {
    id: 3,
    name: "Charlie Care",
    area: "Toronto",
    lat: 43.64,
    lng: -79.52,
    rating: 4.5,
    availableDates: ["2026-05-10"],
  },
];

function testDateFiltering() {
  const result = refineClinicsForResults({
    clinics: sampleClinics,
    selectedDate: "2026-05-10",
  });

  assert.deepEqual(
    result.clinics.map((clinic) => clinic.name),
    ["Alpha Care", "Charlie Care"],
  );
  assert.equal(result.isLocationFallback, false);
}

function testExactAreaFiltering() {
  const result = refineClinicsForResults({
    clinics: sampleClinics,
    selectedLocation: getClinicAreaBySlug("north-york"),
  });

  assert.deepEqual(
    result.clinics.map((clinic) => clinic.name),
    ["Bravo Care"],
  );
  assert.equal(result.isLocationFallback, false);
}

function testAreaFallbackSorting() {
  const result = refineClinicsForResults({
    clinics: sampleClinics,
    selectedDate: "2026-05-10",
    selectedLocation: getClinicAreaBySlug("etobicoke"),
  });

  assert.deepEqual(
    result.clinics.map((clinic) => clinic.name),
    ["Charlie Care", "Alpha Care"],
  );
  assert.equal(result.isLocationFallback, true);
}

function testUserLocationSorting() {
  const result = refineClinicsForResults({
    clinics: sampleClinics,
    userLocation: {
      lat: 43.76,
      lng: -79.41,
    },
  });

  assert.deepEqual(
    result.clinics.map((clinic) => clinic.name),
    ["Bravo Care", "Alpha Care", "Charlie Care"],
  );
  assert.equal(result.isLocationFallback, false);
}

export async function runClinicResultsTests() {
  testDateFiltering();
  testExactAreaFiltering();
  testAreaFallbackSorting();
  testUserLocationSorting();

  return 4;
}
