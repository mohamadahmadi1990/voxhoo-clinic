import { neon } from "@neondatabase/serverless";
import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import type { ClinicCategorySlug } from "../lib/clinic-categories";
import { clinics } from "./schema";

export type ClinicListItem = {
  id: number;
  name: string;
  category: ClinicCategorySlug;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  phone: string;
};

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is missing. Add your Neon connection string to .env.local before querying clinics.",
    );
  }

  const sql = neon(databaseUrl);

  return drizzle({ client: sql });
}

export async function getClinicsByCategory(
  category: ClinicCategorySlug,
): Promise<ClinicListItem[]> {
  const db = getDb();

  return db
    .select({
      id: clinics.id,
      name: clinics.name,
      category: clinics.category,
      address: clinics.address,
      lat: clinics.lat,
      lng: clinics.lng,
      rating: clinics.rating,
      phone: clinics.phone,
    })
    .from(clinics)
    .where(eq(clinics.category, category))
    .orderBy(asc(clinics.name));
}
