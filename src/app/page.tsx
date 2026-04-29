import Link from "next/link";
import { ArrowRight, MapPinned, SearchCheck, ShieldCheck, Stethoscope } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { CategorySearch } from "@/components/category-search";
import { DataNotice } from "@/components/data-notice";
import { SiteHeader } from "@/components/site-header";
import { TopClinicsCarousel } from "@/components/top-clinics-carousel";
import { getTopClinicsSafe } from "@/db";
import { clinicCategories } from "@/lib/clinic-categories";
import { getCategoryTheme } from "@/lib/category-theme";
import { cn } from "@/lib/utils";

export const revalidate = 60;

const valueProps = [
  {
    title: "Fast category discovery",
    description: "Jump from homepage to relevant clinics in one tap.",
    icon: SearchCheck,
  },
  {
    title: "Simple map + list flow",
    description: "Compare clinic cards while keeping locations visible.",
    icon: MapPinned,
  },
  {
    title: "Credible clinic data",
    description: "Live clinic data can fall back to trusted Toronto samples if the database is unavailable.",
    icon: ShieldCheck,
  },
  {
    title: "Designed for calm scanning",
    description: "Large type, softer surfaces, and clearer spacing reduce visual noise.",
    icon: Stethoscope,
  },
];

export default async function Home() {
  const topClinicsResult = await getTopClinicsSafe(8);
  const topClinics = topClinicsResult.clinics;
  const topClinicsBadgeLabel =
    topClinicsResult.source === "database"
      ? "Toronto clinics from Neon"
      : "Showing Toronto sample clinics";

  return (
    <>
      <SiteHeader showSearch={false} />
      <main className="min-h-screen">
        <section className="mx-auto w-full max-w-7xl px-6 pb-10 pt-12 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Clinic discovery, inspired by travel-style browsing
            </p>
            <h1 className="mt-5 text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              What Clinic are you looking for?
            </h1>
          </div>

          <CategorySearch categories={clinicCategories} />
        </section>

        {topClinicsResult.warning ? (
          <section className="mx-auto w-full max-w-7xl px-6 pt-8 sm:px-8 lg:px-10">
            <DataNotice message={topClinicsResult.warning} />
          </section>
        ) : null}

        <TopClinicsCarousel clinics={topClinics} />

        <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Browse by care type
              </h2>
              <p className="mt-2 text-muted-foreground">
                Each category takes you straight into a list-and-map results view.
              </p>
            </div>

            <div className="hidden rounded-full bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground md:block">
              {topClinicsBadgeLabel}
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {clinicCategories.map((category) => {
              const theme = getCategoryTheme(category.slug);

              return (
                <Link
                  key={category.slug}
                  href={`/clinics/${category.slug}`}
                  className="group overflow-hidden rounded-[28px] border border-border bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)]"
                >
                  <div className={cn("relative h-44 px-5 py-5", theme.background)}>
                    <div className="absolute inset-x-5 bottom-5 flex items-end justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                          Care Atlas
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                          {category.label}
                        </h3>
                      </div>

                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm",
                          theme.iconBg,
                        )}
                      >
                        <CategoryIcon
                          category={category.slug}
                          className={cn("h-6 w-6", theme.iconColor)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-5">
                    <p className="text-sm leading-6 text-muted-foreground">
                      {category.description}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      Explore clinics
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 pb-14 sm:px-8 lg:px-10">
          <div className="grid gap-4 lg:grid-cols-3">
            {valueProps.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="surface-panel rounded-[24px] border border-border px-6 py-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">{title}</h2>
                </div>
                <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
