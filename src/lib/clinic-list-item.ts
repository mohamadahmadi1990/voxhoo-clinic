import type { ClinicCategorySlug } from "./clinic-categories";
import type { ClinicAreaLabel } from "./clinic-search";

export type ClinicTimeSlotListItem = {
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "cancelled";
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
