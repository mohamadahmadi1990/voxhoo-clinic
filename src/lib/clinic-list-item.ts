import type { ClinicCategorySlug } from "./clinic-categories";
import type { ClinicAreaLabel } from "./clinic-search";
import type { ClinicTimeSlotStatus } from "../db/schema";

export type ClinicTimeSlotListItem = {
  startTime: string;
  endTime: string;
  status: ClinicTimeSlotStatus;
};

export type ClinicListItem = {
  id: number;
  name: string;
  category: ClinicCategorySlug;
  address: string;
  area: ClinicAreaLabel;
  lat: number;
  lng: number;
  rating: number;
  phone: string;
  availableDates: string[];
  availabilityDate?: string | null;
  availableTimeSlots?: string[];
  timeSlots?: ClinicTimeSlotListItem[];
};
