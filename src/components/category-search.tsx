"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ClinicCategory } from "@/lib/clinic-categories";
import { findCategoryByQuery } from "@/lib/clinic-categories";

type CategorySearchProps = {
  categories: readonly ClinicCategory[];
};

export function CategorySearch({ categories }: CategorySearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const match = findCategoryByQuery(query);

    if (!match) {
      setError("Try Dental, Family Doctor, or Mental Health.");
      return;
    }

    setError("");

    startTransition(() => {
      router.push(`/clinics/${match.slug}`);
    });
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-5xl">
      <form
        onSubmit={handleSubmit}
        className="rounded-[32px] border border-border bg-white p-3 shadow-[0_10px_36px_rgba(0,0,0,0.12)] md:rounded-full"
      >
        <div className="grid gap-2 md:grid-cols-[minmax(0,1.45fr)_minmax(180px,0.6fr)_auto] md:items-center">
          <div className="rounded-[26px] px-5 py-3 transition-colors hover:bg-secondary">
            <p className="text-xs font-semibold text-foreground">What kind of care?</p>
            <div className="mt-1 flex items-center gap-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Dental, family doctor, mental health..."
                className="h-auto border-0 bg-transparent px-0 text-sm shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                aria-label="Search clinic categories"
              />
            </div>
          </div>

          <div className="rounded-[26px] px-5 py-3 transition-colors hover:bg-secondary">
            <p className="text-xs font-semibold text-foreground">Where</p>
            <p className="mt-1 text-sm text-muted-foreground">Toronto</p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-14 rounded-full px-8 text-sm font-semibold md:min-w-40"
          >
            {isPending ? "Opening..." : "Search"}
          </Button>
        </div>
      </form>

      <p className="mt-4 text-center text-sm leading-6 text-muted-foreground">
        {error || "Or jump straight into a category, just like Airbnb-style browsing."}
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
