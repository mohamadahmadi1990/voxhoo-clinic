export const clinicCategorySlugs = [
  "dental",
  "physiotherapy",
  "skin-hair",
  "family-doctor",
  "chiropractic",
  "optometry",
  "mental-health",
] as const;

export type ClinicCategorySlug = (typeof clinicCategorySlugs)[number];

type ClinicCategoryDefinition = {
  slug: ClinicCategorySlug;
  label: string;
  description: string;
};

export const clinicCategories = [
  {
    slug: "dental",
    label: "Dental",
    description: "General dentistry, cosmetic care, and family checkups.",
  },
  {
    slug: "physiotherapy",
    label: "Physiotherapy",
    description: "Recovery, rehab, and movement-focused treatment.",
  },
  {
    slug: "skin-hair",
    label: "Skin & Hair",
    description: "Dermatology, aesthetic consults, and scalp care.",
  },
  {
    slug: "family-doctor",
    label: "Family Doctor",
    description: "Primary care clinics for ongoing everyday health needs.",
  },
  {
    slug: "chiropractic",
    label: "Chiropractic",
    description: "Spine, posture, and musculoskeletal alignment support.",
  },
  {
    slug: "optometry",
    label: "Optometry",
    description: "Eye exams, prescription updates, and vision care.",
  },
  {
    slug: "mental-health",
    label: "Mental Health",
    description: "Therapy and counseling clinics with supportive care teams.",
  },
] as const satisfies readonly ClinicCategoryDefinition[];

export type ClinicCategory = (typeof clinicCategories)[number];

export function getCategoryBySlug(slug: string) {
  return clinicCategories.find((category) => category.slug === slug);
}

export function findCategoryByQuery(query: string) {
  const normalizedQuery = normalizeCategoryValue(query);

  if (!normalizedQuery) {
    return null;
  }

  return (
    clinicCategories.find((category) => {
      const normalizedLabel = normalizeCategoryValue(category.label);
      const normalizedSlug = normalizeCategoryValue(category.slug);

      return (
        normalizedLabel.includes(normalizedQuery) ||
        normalizedSlug.includes(normalizedQuery) ||
        normalizedQuery.includes(normalizedLabel)
      );
    }) ?? null
  );
}

function normalizeCategoryValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
