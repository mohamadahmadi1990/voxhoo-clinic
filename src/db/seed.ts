import { addDays, format, startOfToday } from "date-fns";
import { config } from "dotenv";
import { sql } from "drizzle-orm";
import type { NewClinicTimeSlot } from "./schema";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const dailySlotTimes = [
  { startTime: "09:00", endTime: "10:00" },
  { startTime: "10:00", endTime: "11:00" },
  { startTime: "11:00", endTime: "12:00" },
  { startTime: "13:00", endTime: "14:00" },
  { startTime: "14:00", endTime: "15:00" },
  { startTime: "15:00", endTime: "16:00" },
] as const;
const batchSize = 500;

async function main() {
  const { getDb } = await import("./index");
  const { clinics, clinicTimeSlots } = await import("./schema");
  const db = getDb();

  const existingClinics = await db
    .select({
      id: clinics.id,
      name: clinics.name,
    })
    .from(clinics);

  if (existingClinics.length === 0) {
    throw new Error(
      "No clinics found in the clinics table. Import or create clinics before seeding clinic_time_slots.",
    );
  }

  await db.execute(sql`TRUNCATE TABLE ${clinicTimeSlots} RESTART IDENTITY CASCADE`);
  const clinicTimeSlotsToInsert = buildClinicTimeSlots(existingClinics);

  for (let index = 0; index < clinicTimeSlotsToInsert.length; index += batchSize) {
    const batch = clinicTimeSlotsToInsert.slice(index, index + batchSize);
    await db.insert(clinicTimeSlots).values(batch);
  }

  console.info(`Found ${existingClinics.length} existing clinics.`);
  console.info(`Seeded ${clinicTimeSlotsToInsert.length} clinic time slots.`);
}

function buildClinicTimeSlots(
  clinics: Array<{ id: number; name: string }>,
): NewClinicTimeSlot[] {
  const slotRows: NewClinicTimeSlot[] = [];
  const startDate = startOfToday();

  for (const clinic of clinics) {
    for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
      const slotDate = format(addDays(startDate, dayOffset), "yyyy-MM-dd");
      const baseRandom = createSeededRandom(`${clinic.id}::${clinic.name}::${slotDate}`);
      const statusRandom = createSeededRandom(`${clinic.id}::status::${slotDate}`);
      const hasNoSlots = baseRandom() < 0.1;

      if (hasNoSlots) {
        continue;
      }

      const slotTimes = [...dailySlotTimes];
      const slotsToRemove = 1 + Math.floor(baseRandom() * 2);

      for (let removalIndex = 0; removalIndex < slotsToRemove; removalIndex += 1) {
        const slotIndex = Math.floor(baseRandom() * slotTimes.length);
        slotTimes.splice(slotIndex, 1);
      }

      const bookedRate = getBookedRate(baseRandom);

      for (const slot of slotTimes) {
        slotRows.push({
          clinicId: clinic.id,
          slotDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: statusRandom() < bookedRate ? "booked" : "available",
        });
      }
    }
  }

  return slotRows;
}

function getBookedRate(random: () => number) {
  const dayTypeRoll = random();

  if (dayTypeRoll < 0.3) {
    return 0.7 + random() * 0.2;
  }

  if (dayTypeRoll < 0.7) {
    return 0.4 + random() * 0.2;
  }

  return 0.1 + random() * 0.2;
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
