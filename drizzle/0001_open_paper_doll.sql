CREATE TYPE "public"."clinic_time_slot_status" AS ENUM('available', 'booked', 'cancelled');--> statement-breakpoint
CREATE TABLE "appointment_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"clinic_id" integer NOT NULL,
	"slot_date" date NOT NULL,
	"start_time" text NOT NULL,
	"patient_name" text NOT NULL,
	"patient_email" text,
	"patient_phone" text,
	"note" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic_time_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"clinic_id" integer NOT NULL,
	"slot_date" date NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"status" "clinic_time_slot_status" DEFAULT 'available' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "google_place_id" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "area" text;--> statement-breakpoint
ALTER TABLE "appointment_requests" ADD CONSTRAINT "appointment_requests_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_time_slots" ADD CONSTRAINT "clinic_time_slots_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;