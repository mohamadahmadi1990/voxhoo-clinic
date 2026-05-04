import { AdminRequestStatusSelect } from "@/components/admin-request-status-select";
import { getAppointmentRequests } from "@/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminRequestsPage() {
  const requests = await getAppointmentRequests();

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">
          Appointment requests
        </h1>
        <p className="text-sm text-muted-foreground">
          Simple admin view of incoming appointment requests.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-white">
        <table className="min-w-full divide-y divide-border text-left text-sm">
          <thead className="bg-secondary/40">
            <tr>
              <th className="px-4 py-3 font-medium text-foreground">Clinic name</th>
              <th className="px-4 py-3 font-medium text-foreground">Date</th>
              <th className="px-4 py-3 font-medium text-foreground">Time</th>
              <th className="px-4 py-3 font-medium text-foreground">Patient name</th>
              <th className="px-4 py-3 font-medium text-foreground">Contact</th>
              <th className="px-4 py-3 font-medium text-foreground">Note</th>
              <th className="px-4 py-3 font-medium text-foreground">Status</th>
              <th className="px-4 py-3 font-medium text-foreground">Created at</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No appointment requests yet.
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="align-top">
                  <td className="px-4 py-3 text-foreground">
                    <div className="min-w-[180px] font-medium">{request.clinicName}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{request.slotDate}</td>
                  <td className="px-4 py-3 text-muted-foreground">{request.startTime}</td>
                  <td className="px-4 py-3 text-foreground">{request.patientName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="min-w-[220px] space-y-1">
                      {request.patientEmail ? (
                        <div className="break-all text-foreground">{request.patientEmail}</div>
                      ) : null}
                      {request.patientPhone ? <div>{request.patientPhone}</div> : null}
                      {!request.patientEmail && !request.patientPhone ? (
                        <span>&mdash;</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="max-w-[260px] whitespace-pre-wrap break-words">
                      {request.note || <span>&mdash;</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <AdminRequestStatusSelect
                      requestId={request.id}
                      value={normalizeRequestStatus(request.status)}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatCreatedAt(request.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function formatCreatedAt(createdAt: Date | string) {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);

  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function normalizeRequestStatus(status: string) {
  if (status === "contacted" || status === "closed") {
    return status;
  }

  return "pending";
}
