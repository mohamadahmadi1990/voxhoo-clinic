CREATE TYPE "public"."clinic_category" AS ENUM('dental', 'physiotherapy', 'skin-hair', 'family-doctor', 'chiropractic', 'optometry', 'mental-health');--> statement-breakpoint
CREATE TABLE "clinics" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" "clinic_category" NOT NULL,
	"address" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"rating" double precision NOT NULL,
	"phone" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
