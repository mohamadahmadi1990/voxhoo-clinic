'use server'

import { createAppointmentRequest } from "@/db";
import { sendAppointmentRequestEmails } from "@/lib/appointment-request-email";

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

    await sendAppointmentRequestEmails(notificationInput);

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
