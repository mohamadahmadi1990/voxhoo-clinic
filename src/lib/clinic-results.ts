import {
  getDistanceInKilometers,
  type ClinicArea,
  type UserLocation,
} from "./clinic-search";

type ClinicResultListItem = {
  availableDates: string[];
  area: string;
  lat: number;
  lng: number;
  name: string;
};

export function refineClinicsForResults<T extends ClinicResultListItem>({
  clinics,
  selectedDate,
  selectedLocation,
  userLocation,
}: {
  clinics: T[];
  selectedDate?: string | null;
  selectedLocation?: ClinicArea | null;
  userLocation?: UserLocation | null;
}) {
  const clinicsForDate = selectedDate
    ? clinics.filter((clinic) => clinic.availableDates.includes(selectedDate))
    : clinics;
  const exactAreaClinics = selectedLocation
    ? clinicsForDate.filter((clinic) => clinic.area === selectedLocation.label)
    : clinicsForDate;
  const isLocationFallback =
    Boolean(selectedLocation) && clinicsForDate.length > 0 && exactAreaClinics.length === 0;

  let refinedClinics = exactAreaClinics;

  if (isLocationFallback && selectedLocation) {
    refinedClinics = sortClinicsByDistance(clinicsForDate, selectedLocation.center);
  }

  if (userLocation) {
    refinedClinics = sortClinicsByDistance(refinedClinics, userLocation);
  }

  return {
    clinics: refinedClinics,
    isLocationFallback,
  };
}

export function sortClinicsByDistance<T extends { lat: number; lng: number; name: string }>(
  clinics: T[],
  origin: { lat: number; lng: number },
) {
  return [...clinics].sort((left, right) => {
    const leftDistance = getDistanceInKilometers(origin, left);
    const rightDistance = getDistanceInKilometers(origin, right);

    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    return left.name.localeCompare(right.name);
  });
}
