import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { clinicCategories } from "@/lib/clinic-categories";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="surface-panel w-full max-w-2xl rounded-[32px] border border-white/60 px-8 py-10 backdrop-blur">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary text-primary">
          <Compass className="h-7 w-7" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
          Clinic category not found
        </p>
        <h1 className="mt-3 font-heading text-4xl text-foreground sm:text-5xl">
          Try another care category.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          This MVP currently supports a fixed set of clinic categories. Pick one
          below to jump back into the discovery flow.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {clinicCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/clinics/${category.slug}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-full border-white/70 bg-white/70 px-5 backdrop-blur hover:bg-white",
              )}
            >
              {category.label}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "lg" }),
            "mt-8 inline-flex rounded-full text-foreground hover:bg-white/70",
          )}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to homepage
        </Link>
      </div>
    </main>
  );
}
