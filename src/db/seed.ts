import { addDays, format, startOfToday } from "date-fns";
import { config } from "dotenv";
import { sql } from "drizzle-orm";
import type { NewClinic, NewClinicTimeSlot } from "./schema";
import { mockClinicSeeds } from "../lib/mock-clinics";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const torontoClinics: NewClinic[] = mockClinicSeeds.map((clinic) => ({
  name: clinic.name,
  category: clinic.category,
  address: clinic.address,
  area: clinic.area,
  lat: clinic.lat,
  lng: clinic.lng,
  rating: clinic.rating,
  phone: clinic.phone,
}));

const dailySlotTimes = [
  { startTime: "09:00", endTime: "10:00" },
  { startTime: "10:00", endTime: "11:00" },
  { startTime: "11:00", endTime: "12:00" },
  { startTime: "13:00", endTime: "14:00" },
  { startTime: "14:00", endTime: "15:00" },
  { startTime: "15:00", endTime: "16:00" },
] as const;

async function main() {
  const { getDb } = await import("./index");
  const { clinics, clinicTimeSlots } = await import("./schema");
  const db = getDb();

  await db.execute(sql`TRUNCATE TABLE ${clinicTimeSlots} RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE ${clinics} RESTART IDENTITY CASCADE`);

  const insertedClinics = await db.insert(clinics).values(torontoClinics).returning({
    id: clinics.id,
    name: clinics.name,
  });
  const clinicTimeSlotsToInsert = buildClinicTimeSlots(insertedClinics);

  await db.insert(clinicTimeSlots).values(clinicTimeSlotsToInsert);

  console.info(
    `Seeded ${insertedClinics.length} Toronto clinics and ${clinicTimeSlotsToInsert.length} available time slots.`,
  );
}

function buildClinicTimeSlots(
  clinics: Array<{ id: number; name: string }>,
): NewClinicTimeSlot[] {
  const slotRows: NewClinicTimeSlot[] = [];
  const startDate = startOfToday();

  for (const clinic of clinics) {
    for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
      const slotDate = format(addDays(startDate, dayOffset), "yyyy-MM-dd");
      const random = createSeededRandom(`${clinic.id}::${clinic.name}::${slotDate}`);
      const shuffledSlotTimes = [...dailySlotTimes];

      for (let index = shuffledSlotTimes.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        const currentSlot = shuffledSlotTimes[index];

        shuffledSlotTimes[index] = shuffledSlotTimes[swapIndex];
        shuffledSlotTimes[swapIndex] = currentSlot;
      }

      const slotCount = 2 + Math.floor(random() * 4);

      for (const slot of shuffledSlotTimes.slice(0, slotCount)) {
        slotRows.push({
          clinicId: clinic.id,
          slotDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: "available",
        });
      }
    }
  }

  return slotRows;
}

function createSeededRandom(seed: string) {
  let state = hashSeed(seed) || 1;

  return () => {
    state += 0x6d2b79f5;

    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed: string) {
  let hash = 2166136261;

  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

main().catch((error) => {
  console.error("Failed to seed clinics.", error);
  process.exit(1);
});
