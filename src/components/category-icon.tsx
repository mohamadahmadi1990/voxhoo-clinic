import type { LucideIcon, LucideProps } from "lucide-react";
import {
  Activity,
  Bone,
  Brain,
  Glasses,
  Smile,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import type { ClinicCategorySlug } from "@/lib/clinic-categories";

const iconMap: Record<ClinicCategorySlug, LucideIcon> = {
  dental: Smile,
  physiotherapy: Activity,
  "skin-hair": Sparkles,
  "family-doctor": Stethoscope,
  chiropractic: Bone,
  optometry: Glasses,
  "mental-health": Brain,
};

type CategoryIconProps = LucideProps & {
  category: ClinicCategorySlug;
};

export function CategoryIcon({ category, ...props }: CategoryIconProps) {
  const Icon = iconMap[category];
  return <Icon {...props} />;
}
