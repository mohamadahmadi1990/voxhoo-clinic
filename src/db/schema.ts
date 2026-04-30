import { doublePrecision, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { clinicCategorySlugs } from "../lib/clinic-categories";

export const clinicCategoryEnum = pgEnum("clinic_category", clinicCategorySlugs);

export const clinics = pgTable("clinics", {
  id: serial("id").primaryKey(),
  googlePlaceId: text("google_place_id"),
  source: text("source"),
  name: text("name").notNull(),
  category: clinicCategoryEnum("category").notNull(),
  address: text("address").notNull(),
  area: text("area"),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  rating: doublePrecision("rating").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Clinic = typeof clinics.$inferSelect;
export type NewClinic = typeof clinics.$inferInsert;
