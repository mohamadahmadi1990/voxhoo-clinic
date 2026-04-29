"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { format } from "date-fns";
import { CalendarDays, Search } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClinicCategory, ClinicCategorySlug } from "@/lib/clinic-categories";

type CategorySearchProps = {
  categories: readonly ClinicCategory[];
};

export function CategorySearch({ categories }: CategorySearchProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ClinicCategorySlug | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCategory) {
      setError("Please select a clinic category");
      return;
    }

    setError("");

    startTransition(() => {
      const query = selectedDate ? `?date=${format(selectedDate, "yyyy-MM-dd")}` : "";
      router.push(`/clinics/${selectedCategory}${query}`);
    });
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-5xl">
      <form
        onSubmit={handleSubmit}
        className="rounded-[32px] border border-border bg-white p-3 shadow-[0_10px_36px_rgba(0,0,0,0.12)] md:rounded-full"
      >
        <div className="grid gap-2 md:grid-cols-[minmax(0,1.05fr)_minmax(220px,0.85fr)_auto] md:items-center">
          <div className="rounded-[26px] px-5 py-3 transition-colors hover:bg-secondary">
            <p className="text-xs font-semibold text-foreground">Category</p>
            <div className="mt-2">
              <Select
                value={selectedCategory}
                items={categories.map((category) => ({
                  label: category.label,
                  value: category.slug,
                }))}
                onValueChange={(value) => {
                  setSelectedCategory(value as ClinicCategorySlug | null);
                  if (error) {
                    setError("");
                  }
                }}
              >
                <SelectTrigger
                  aria-label="Select clinic category"
                  className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-[26px] px-5 py-3 transition-colors hover:bg-secondary">
            <p className="text-xs font-semibold text-foreground">Date</p>
            <div className="mt-2">
              <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                <PopoverTrigger
                  type="button"
                  aria-label="Select clinic availability date"
                  className="inline-flex h-12 w-full items-center justify-between rounded-full border border-border bg-white px-4 text-left text-sm font-medium text-foreground shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className={selectedDate ? "text-foreground" : "text-muted-foreground"}>
                    {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Any date"}
                  </span>
                  <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" sideOffset={12}>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-14 rounded-full px-8 text-sm font-semibold md:min-w-40"
          >
            <Search className="mr-2 h-4 w-4" />
            {isPending ? "Opening..." : "Search"}
          </Button>
        </div>
      </form>

      <p className="mt-4 text-center text-sm leading-6 text-muted-foreground">
        {error || "Start by choosing a clinic category."}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/clinics/${category.slug}`}
              className="group inline-flex items-center gap-3 rounded-full border border-border bg-white px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors group-hover:bg-accent group-hover:text-primary">
                <CategoryIcon category={category.slug} className="h-4 w-4" />
              </div>
              <span>{category.label}</span>
            </Link>
          ))}
      </div>
    </div>
  );
}
