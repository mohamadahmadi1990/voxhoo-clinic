'use server'

import { createAppointmentRequest } from "@/db";

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
    await createAppointmentRequest(input);
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
