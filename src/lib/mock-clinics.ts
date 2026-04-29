import type { ClinicCategorySlug } from "./clinic-categories";

export type MockClinicSeed = {
  name: string;
  category: ClinicCategorySlug;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  phone: string;
  availableDates: string[];
};

export type MockClinic = MockClinicSeed & {
  id: number;
};

export const mockClinicSeeds: MockClinicSeed[] = [
  {
    name: "Queen West Dental House",
    category: "dental",
    address: "720 Queen St W, Toronto, ON M6J 1E8",
    lat: 43.6459,
    lng: -79.4103,
    rating: 4.8,
    phone: "(416) 555-0141",
    availableDates: ["2026-05-10", "2026-05-12", "2026-05-15"],
  },
  {
    name: "Bay & Bloor Family Dentistry",
    category: "dental",
    address: "110 Bloor St W, Toronto, ON M5S 2W7",
    lat: 43.6697,
    lng: -79.3887,
    rating: 4.7,
    phone: "(416) 555-0184",
    availableDates: ["2026-05-11", "2026-05-13"],
  },
  {
    name: "Danforth Smile Clinic",
    category: "dental",
    address: "2402 Danforth Ave, Toronto, ON M4C 1K8",
    lat: 43.6876,
    lng: -79.2898,
    rating: 4.9,
    phone: "(416) 555-0117",
    availableDates: ["2026-05-10", "2026-05-14"],
  },
  {
    name: "Liberty Village Physio",
    category: "physiotherapy",
    address: "85 East Liberty St, Toronto, ON M6K 3R4",
    lat: 43.6383,
    lng: -79.4194,
    rating: 4.8,
    phone: "(416) 555-0103",
    availableDates: ["2026-05-10", "2026-05-11", "2026-05-13"],
  },
  {
    name: "Midtown Recovery Physio",
    category: "physiotherapy",
    address: "1849 Yonge St, Toronto, ON M4S 1Y2",
    lat: 43.7047,
    lng: -79.3984,
    rating: 4.6,
    phone: "(416) 555-0136",
    availableDates: ["2026-05-12", "2026-05-14"],
  },
  {
    name: "North York Movement Lab",
    category: "physiotherapy",
    address: "5095 Yonge St, Toronto, ON M2N 6Z4",
    lat: 43.7684,
    lng: -79.4127,
    rating: 4.7,
    phone: "(416) 555-0195",
    availableDates: ["2026-05-11", "2026-05-15"],
  },
  {
    name: "Yorkville Skin Studio",
    category: "skin-hair",
    address: "1240 Bay St, Toronto, ON M5R 2A7",
    lat: 43.6708,
    lng: -79.3882,
    rating: 4.9,
    phone: "(416) 555-0178",
    availableDates: ["2026-05-10", "2026-05-12"],
  },
  {
    name: "King West Derm Clinic",
    category: "skin-hair",
    address: "525 King St W, Toronto, ON M5V 1M5",
    lat: 43.6451,
    lng: -79.3947,
    rating: 4.7,
    phone: "(416) 555-0152",
    availableDates: ["2026-05-13", "2026-05-15"],
  },
  {
    name: "Scarborough Skin & Scalp",
    category: "skin-hair",
    address: "300 Borough Dr, Toronto, ON M1P 4P5",
    lat: 43.7755,
    lng: -79.2576,
    rating: 4.8,
    phone: "(416) 555-0161",
    availableDates: ["2026-05-11", "2026-05-14"],
  },
  {
    name: "Harbourfront Family Practice",
    category: "family-doctor",
    address: "8 York St, Toronto, ON M5J 2Y2",
    lat: 43.6416,
    lng: -79.3817,
    rating: 4.7,
    phone: "(416) 555-0187",
    availableDates: ["2026-05-10", "2026-05-13", "2026-05-15"],
  },
  {
    name: "Annex Primary Care",
    category: "family-doctor",
    address: "340 Bloor St W, Toronto, ON M5S 1W9",
    lat: 43.6673,
    lng: -79.4051,
    rating: 4.6,
    phone: "(416) 555-0129",
    availableDates: ["2026-05-12", "2026-05-14"],
  },
  {
    name: "East York Family Health",
    category: "family-doctor",
    address: "840 Coxwell Ave, Toronto, ON M4C 5T2",
    lat: 43.6896,
    lng: -79.3288,
    rating: 4.8,
    phone: "(416) 555-0149",
    availableDates: ["2026-05-11", "2026-05-12"],
  },
  {
    name: "Adelaide Spine Clinic",
    category: "chiropractic",
    address: "250 Adelaide St W, Toronto, ON M5H 1X6",
    lat: 43.6488,
    lng: -79.3884,
    rating: 4.7,
    phone: "(416) 555-0110",
    availableDates: ["2026-05-10", "2026-05-14"],
  },
  {
    name: "Junction Chiropractic Co",
    category: "chiropractic",
    address: "3075 Dundas St W, Toronto, ON M6P 1Z7",
    lat: 43.6658,
    lng: -79.4704,
    rating: 4.8,
    phone: "(416) 555-0133",
    availableDates: ["2026-05-11", "2026-05-13", "2026-05-15"],
  },
  {
    name: "Lakeshore Posture Studio",
    category: "chiropractic",
    address: "110 Marine Parade Dr, Toronto, ON M8V 0A3",
    lat: 43.6369,
    lng: -79.4753,
    rating: 4.6,
    phone: "(416) 555-0179",
    availableDates: ["2026-05-12", "2026-05-15"],
  },
  {
    name: "Yonge Vision Centre",
    category: "optometry",
    address: "2300 Yonge St, Toronto, ON M4P 1E4",
    lat: 43.7092,
    lng: -79.3989,
    rating: 4.8,
    phone: "(416) 555-0190",
    availableDates: ["2026-05-10", "2026-05-11"],
  },
  {
    name: "Distillery Eye Clinic",
    category: "optometry",
    address: "33 Mill St, Toronto, ON M5A 3R3",
    lat: 43.6503,
    lng: -79.3594,
    rating: 4.7,
    phone: "(416) 555-0107",
    availableDates: ["2026-05-13", "2026-05-14"],
  },
  {
    name: "Etobicoke Eyecare House",
    category: "optometry",
    address: "300 The East Mall, Toronto, ON M9B 6B7",
    lat: 43.6216,
    lng: -79.5488,
    rating: 4.9,
    phone: "(416) 555-0157",
    availableDates: ["2026-05-12", "2026-05-15"],
  },
  {
    name: "Queen Street Counseling Collective",
    category: "mental-health",
    address: "955 Queen St W, Toronto, ON M6J 1G9",
    lat: 43.6435,
    lng: -79.4171,
    rating: 4.8,
    phone: "(416) 555-0138",
    availableDates: ["2026-05-10", "2026-05-12", "2026-05-14"],
  },
  {
    name: "North Toronto Therapy Rooms",
    category: "mental-health",
    address: "245 Eglinton Ave E, Toronto, ON M4P 3B7",
    lat: 43.7082,
    lng: -79.3928,
    rating: 4.7,
    phone: "(416) 555-0166",
    availableDates: ["2026-05-11", "2026-05-13"],
  },
  {
    name: "Riverdale Mind Clinic",
    category: "mental-health",
    address: "747 Broadview Ave, Toronto, ON M4K 2P6",
    lat: 43.6766,
    lng: -79.3577,
    rating: 4.9,
    phone: "(416) 555-0120",
    availableDates: ["2026-05-12", "2026-05-15"],
  },
];

export const mockClinics: MockClinic[] = mockClinicSeeds.map((clinic, index) => ({
  id: index + 1,
  ...clinic,
}));

export function getMockClinicsByCategory(category: ClinicCategorySlug) {
  return mockClinics
    .filter((clinic) => clinic.category === category)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getTopMockClinics(limit = 8) {
  return [...mockClinics]
    .sort((left, right) => {
      if (right.rating !== left.rating) {
        return right.rating - left.rating;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, limit);
}

export function attachClinicAvailability<T extends {
  category: ClinicCategorySlug;
  name: string;
}>(clinic: T): T & { availableDates: string[] } {
  return {
    ...clinic,
    availableDates: getClinicAvailability(clinic.category, clinic.name),
  };
}

export function attachClinicAvailabilityList<T extends {
  category: ClinicCategorySlug;
  name: string;
}>(clinics: T[]) {
  return clinics.map((clinic) => attachClinicAvailability(clinic));
}

function getClinicAvailability(category: ClinicCategorySlug, name: string) {
  return availabilityLookup.get(buildClinicAvailabilityKey(category, name)) ?? [];
}

const availabilityLookup = new Map(
  mockClinicSeeds.map((clinic) => [
    buildClinicAvailabilityKey(clinic.category, clinic.name),
    clinic.availableDates,
  ]),
);

function buildClinicAvailabilityKey(category: ClinicCategorySlug, name: string) {
  return `${category}::${name}`;
}
