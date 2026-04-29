import { config } from "dotenv";
import { sql } from "drizzle-orm";
import type { NewClinic } from "./schema";
import { mockClinicSeeds } from "../lib/mock-clinics";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const torontoClinics: NewClinic[] = mockClinicSeeds.map((clinic) => ({
  name: clinic.name,
  category: clinic.category,
  address: clinic.address,
  lat: clinic.lat,
  lng: clinic.lng,
  rating: clinic.rating,
  phone: clinic.phone,
}));

async function main() {
  const { getDb } = await import("./index");
  const { clinics } = await import("./schema");
  const db = getDb();

  await db.execute(sql`TRUNCATE TABLE ${clinics} RESTART IDENTITY CASCADE`);
  await db.insert(clinics).values(torontoClinics);

  console.info(`Seeded ${torontoClinics.length} Toronto clinics.`);
}

main().catch((error) => {
  console.error("Failed to seed clinics.", error);
  process.exit(1);
});
