'use server'

import { createAppointmentRequest } from "@/db";
import { Resend } from "resend";

type CreateAppointmentRequestInput = {
  clinicId: number;
  slotDate: string;
  startTime: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  note?: string;
};

type CreateAppointmentRequestResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitAppointmentRequest(
  input: CreateAppointmentRequestInput,
): Promise<CreateAppointmentRequestResult> {
  try {
    const appointmentRequest = await createAppointmentRequest(input);

    const notificationInput = {
      clinicId: appointmentRequest.clinicId,
      slotDate: appointmentRequest.slotDate,
      startTime: appointmentRequest.startTime,
      patientName: appointmentRequest.patientName,
      patientEmail: appointmentRequest.patientEmail,
      patientPhone: appointmentRequest.patientPhone,
      note: appointmentRequest.note,
    };

    await sendAppointmentRequestNotification(notificationInput);
    await sendPatientConfirmationEmail(notificationInput);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to send request right now.",
    };
  }
}

async function sendAppointmentRequestNotification(input: {
  clinicId: number;
  slotDate: string;
  startTime: string;
  patientName: string;
  patientEmail: string | null;
  patientPhone: string | null;
  note: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  const notificationEmail =
    process.env.APPOINTMENT_REQUEST_NOTIFICATION_EMAIL?.trim();

  if (!apiKey) {
    console.error("RESEND_API_KEY is missing. Skipping appointment request email.");
    return;
  }

  if (!fromEmail) {
    console.error("RESEND_FROM_EMAIL is missing. Skipping appointment request email.");
    return;
  }

  if (!notificationEmail) {
    console.error(
      "APPOINTMENT_REQUEST_NOTIFICATION_EMAIL is missing. Skipping appointment request email.",
    );
    return;
  }

  try {
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: notificationEmail,
      subject: "New appointment request",
      text: [
        `Clinic ID: ${input.clinicId}`,
        `Date: ${input.slotDate}`,
        `Time: ${input.startTime}`,
        `Patient name: ${input.patientName}`,
        `Email: ${input.patientEmail ?? ""}`,
        `Phone: ${input.patientPhone ?? ""}`,
        `Note: ${input.note ?? ""}`,
      ].join("\n"),
    });

    if (error) {
      console.error("Failed to send appointment request email.", error);
      return;
    }

    console.info("Appointment request email sent.", {
      emailId: data?.id ?? null,
      to: notificationEmail,
      clinicId: input.clinicId,
    });
  } catch (error) {
    console.error("Failed to send appointment request email.", error);
  }
}

async function sendPatientConfirmationEmail(input: {
  clinicId: number;
  slotDate: string;
  startTime: string;
  patientName: string;
  patientEmail: string | null;
  patientPhone: string | null;
  note: string | null;
}) {
  if (!input.patientEmail) {
    return;
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey) {
    console.error("RESEND_API_KEY is missing. Skipping patient confirmation email.");
    return;
  }

  if (!fromEmail) {
    console.error("RESEND_FROM_EMAIL is missing. Skipping patient confirmation email.");
    return;
  }

  try {
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: input.patientEmail,
      subject: "We received your appointment request",
      text: [
        `Hi ${input.patientName},`,
        "",
        "We received your appointment request.",
        `Requested date: ${input.slotDate}`,
        `Requested time: ${input.startTime}`,
        "",
        "The clinic will contact you soon.",
      ].join("\n"),
    });

    if (error) {
      console.error("Failed to send patient confirmation email.", error);
      return;
    }

    console.info("Patient confirmation email sent.", {
      emailId: data?.id ?? null,
      to: input.patientEmail,
      clinicId: input.clinicId,
    });
  } catch (error) {
    console.error("Failed to send patient confirmation email.", error);
  }
}
