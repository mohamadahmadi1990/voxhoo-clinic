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

    await sendAppointmentRequestNotification({
      clinicId: appointmentRequest.clinicId,
      slotDate: appointmentRequest.slotDate,
      startTime: appointmentRequest.startTime,
      patientName: appointmentRequest.patientName,
      patientEmail: appointmentRequest.patientEmail,
      patientPhone: appointmentRequest.patientPhone,
      note: appointmentRequest.note,
    });

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

    const { error } = await resend.emails.send({
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
    }
  } catch (error) {
    console.error("Failed to send appointment request email.", error);
  }
}
