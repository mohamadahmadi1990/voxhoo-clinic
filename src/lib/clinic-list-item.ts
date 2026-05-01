import type { ClinicCategorySlug } from "./clinic-categories";
import type { ClinicAreaLabel } from "./clinic-search";

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
  availableTimeSlots?: string[];
};
