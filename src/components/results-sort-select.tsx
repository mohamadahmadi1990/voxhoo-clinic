"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClinicSortOption } from "@/lib/clinic-search";

type ResultsSortSelectProps = {
  value: ClinicSortOption;
};

const sortLabels: Record<ClinicSortOption, string> = {
  nearest: "Nearest",
  rating: "Highest rating",
  name: "A-Z",
};

export function ResultsSortSelect({ value }: ResultsSortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Select
      value={value}
      items={Object.entries(sortLabels).map(([sortValue, label]) => ({
        label,
        value: sortValue,
      }))}
      onValueChange={(nextValue) => {
        const params = new URLSearchParams(searchParams.toString());

        if (!nextValue || nextValue === "nearest") {
          params.delete("sort");
        } else {
          params.set("sort", nextValue);
        }

        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
      }}
    >
      <SelectTrigger
        aria-label="Sort clinics"
        className="h-10 min-w-[156px] rounded-full bg-white text-sm shadow-sm"
      >
        <SelectValue placeholder={sortLabels[value]} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(sortLabels).map(([sortValue, label]) => (
          <SelectItem key={sortValue} value={sortValue}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
