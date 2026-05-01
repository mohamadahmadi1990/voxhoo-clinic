import {
  date,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { clinicCategorySlugs } from "../lib/clinic-categories";

export const clinicCategoryEnum = pgEnum("clinic_category", clinicCategorySlugs);
export const clinicTimeSlotStatusEnum = pgEnum("clinic_time_slot_status", [
  "available",
  "booked",
  "cancelled",
]);

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

export const clinicTimeSlots = pgTable("clinic_time_slots", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id")
    .references(() => clinics.id, { onDelete: "cascade" })
    .notNull(),
  slotDate: date("slot_date", { mode: "string" }).notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  status: clinicTimeSlotStatusEnum("status").notNull().default("available"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Clinic = typeof clinics.$inferSelect;
export type NewClinic = typeof clinics.$inferInsert;
export type ClinicTimeSlot = typeof clinicTimeSlots.$inferSelect;
export type NewClinicTimeSlot = typeof clinicTimeSlots.$inferInsert;
