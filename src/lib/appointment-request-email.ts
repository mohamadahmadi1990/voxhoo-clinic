import { Resend } from "resend";

export type AppointmentRequestEmailPayload = {
  clinicId: number;
  slotDate: string;
  startTime: string;
  patientName: string;
  patientEmail: string | null;
  patientPhone: string | null;
  note: string | null;
};

export async function sendAppointmentRequestEmails(
  payload: AppointmentRequestEmailPayload,
) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  const notificationEmail =
    process.env.APPOINTMENT_REQUEST_NOTIFICATION_EMAIL?.trim();

  if (!apiKey) {
    console.error("RESEND_API_KEY is missing. Skipping appointment request emails.");
    return;
  }

  if (!fromEmail) {
    console.error("RESEND_FROM_EMAIL is missing. Skipping appointment request emails.");
    return;
  }

  const resend = new Resend(apiKey);

  await sendAdminNotificationEmail(resend, fromEmail, notificationEmail, payload);
  await sendPatientConfirmationEmail(resend, fromEmail, payload);
}

async function sendAdminNotificationEmail(
  resend: Resend,
  fromEmail: string,
  notificationEmail: string | undefined,
  payload: AppointmentRequestEmailPayload,
) {
  if (!notificationEmail) {
    console.error(
      "APPOINTMENT_REQUEST_NOTIFICATION_EMAIL is missing. Skipping appointment request email.",
    );
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: notificationEmail,
      subject: "New appointment request",
      text: [
        `Clinic ID: ${payload.clinicId}`,
        `Date: ${payload.slotDate}`,
        `Time: ${payload.startTime}`,
        `Patient name: ${payload.patientName}`,
        `Email: ${payload.patientEmail ?? ""}`,
        `Phone: ${payload.patientPhone ?? ""}`,
        `Note: ${payload.note ?? ""}`,
      ].join("\n"),
    });

    if (error) {
      console.error("Failed to send appointment request email.", error);
      return;
    }

    console.info("Appointment request email sent.", {
      emailId: data?.id ?? null,
      to: notificationEmail,
      clinicId: payload.clinicId,
    });
  } catch (error) {
    console.error("Failed to send appointment request email.", error);
  }
}

async function sendPatientConfirmationEmail(
  resend: Resend,
  fromEmail: string,
  payload: AppointmentRequestEmailPayload,
) {
  if (!payload.patientEmail) {
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: payload.patientEmail,
      subject: "We received your appointment request",
      text: [
        `Hi ${payload.patientName},`,
        "",
        "We received your appointment request.",
        `Requested date: ${payload.slotDate}`,
        `Requested time: ${payload.startTime}`,
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
      to: payload.patientEmail,
      clinicId: payload.clinicId,
    });
  } catch (error) {
    console.error("Failed to send patient confirmation email.", error);
  }
}
