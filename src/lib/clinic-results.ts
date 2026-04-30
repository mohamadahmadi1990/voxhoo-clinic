import {
  clinicAreas,
  getDistanceInKilometers,
  type ClinicSortOption,
  type ClinicArea,
  type UserLocation,
} from "./clinic-search";

type ClinicResultListItem = {
  availableDates: string[];
  area: string;
  lat: number;
  lng: number;
  name: string;
  rating: number;
};

export function refineClinicsForResults<T extends ClinicResultListItem>({
  clinics,
  selectedDate,
  selectedLocation,
  userLocation,
  sort = "nearest",
}: {
  clinics: T[];
  selectedDate?: string | null;
  selectedLocation?: ClinicArea | null;
  userLocation?: UserLocation | null;
  sort?: ClinicSortOption;
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

  refinedClinics = sortClinics(refinedClinics, {
    sort,
    selectedLocation,
    userLocation,
  });

  return {
    clinics: refinedClinics,
    isLocationFallback,
  };
}

function sortClinics<T extends { lat: number; lng: number; name: string; rating: number }>(
  clinics: T[],
  {
    sort,
    selectedLocation,
    userLocation,
  }: {
    sort: ClinicSortOption;
    selectedLocation?: ClinicArea | null;
    userLocation?: UserLocation | null;
  },
) {
  if (sort === "rating") {
    return [...clinics].sort((left, right) => {
      if (right.rating !== left.rating) {
        return right.rating - left.rating;
      }

      return left.name.localeCompare(right.name);
    });
  }

  if (sort === "name") {
    return [...clinics].sort((left, right) => left.name.localeCompare(right.name));
  }

  return sortClinicsByDistance(
    clinics,
    userLocation ?? selectedLocation?.center ?? clinicAreas[0].center,
  );
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
