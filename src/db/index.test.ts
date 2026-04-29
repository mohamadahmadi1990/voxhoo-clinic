import assert from "node:assert/strict";
import { getClinicsByCategorySafe } from "./index";

export async function runDatabaseFallbackTests() {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  delete process.env.DATABASE_URL;

  try {
    const result = await getClinicsByCategorySafe("dental");

    assert.equal(result.source, "mock");
    assert.equal(
      result.warning,
      "Showing sample Toronto clinics while the live database is still being connected.",
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
    if (originalDatabaseUrl) {
      process.env.DATABASE_URL = originalDatabaseUrl;
    } else {
      delete process.env.DATABASE_URL;
    }
  }
 
  return 1;
}
