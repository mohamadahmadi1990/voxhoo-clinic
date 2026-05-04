"use server";

import {
  appointmentRequestStatuses,
  updateAppointmentRequestStatus,
  type AppointmentRequestStatus,
} from "@/db";
import { revalidatePath } from "next/cache";

type UpdateAppointmentRequestStatusResult = {
  error?: string;
  success?: boolean;
};

export async function updateAppointmentRequestStatusAction(
  requestId: number,
  status: string,
): Promise<UpdateAppointmentRequestStatusResult> {
  if (!Number.isInteger(requestId) || requestId <= 0) {
    return { error: "Invalid request." };
  }

  if (!appointmentRequestStatuses.includes(status as AppointmentRequestStatus)) {
    return { error: "Invalid status." };
  }

  try {
    await updateAppointmentRequestStatus(
      requestId,
      status as AppointmentRequestStatus,
    );
    revalidatePath("/admin/requests");

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update the request.";

    return { error: message };
  }
}
