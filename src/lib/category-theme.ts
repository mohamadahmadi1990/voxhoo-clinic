import type { ClinicCategorySlug } from "@/lib/clinic-categories";

type CategoryTheme = {
  background: string;
  iconBg: string;
  iconColor: string;
  accent: string;
};

const categoryThemeMap: Record<ClinicCategorySlug, CategoryTheme> = {
  dental: {
    background: "bg-gradient-to-br from-rose-50 via-white to-orange-50",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    accent: "text-rose-600",
  },
  physiotherapy: {
    background: "bg-gradient-to-br from-orange-50 via-white to-amber-50",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    accent: "text-orange-600",
  },
  "skin-hair": {
    background: "bg-gradient-to-br from-pink-50 via-white to-fuchsia-50",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    accent: "text-pink-600",
  },
  "family-doctor": {
    background: "bg-gradient-to-br from-emerald-50 via-white to-teal-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    accent: "text-emerald-600",
  },
  chiropractic: {
    background: "bg-gradient-to-br from-violet-50 via-white to-indigo-50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    accent: "text-violet-600",
  },
  optometry: {
    background: "bg-gradient-to-br from-sky-50 via-white to-cyan-50",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    accent: "text-sky-600",
  },
  "mental-health": {
    background: "bg-gradient-to-br from-lime-50 via-white to-green-50",
    iconBg: "bg-lime-100",
    iconColor: "text-lime-700",
    accent: "text-lime-700",
  },
};

export function getCategoryTheme(category: ClinicCategorySlug) {
  return categoryThemeMap[category];
}
