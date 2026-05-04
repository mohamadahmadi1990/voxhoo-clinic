"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  appointmentRequestStatuses,
  type AppointmentRequestStatus,
} from "@/db";
import { cn } from "@/lib/utils";
import { updateAppointmentRequestStatusAction } from "@/app/actions/update-appointment-request-status";

type AdminRequestStatusSelectProps = {
  requestId: number;
  value: AppointmentRequestStatus;
};

const statusLabels: Record<AppointmentRequestStatus, string> = {
  pending: "Pending",
  contacted: "Contacted",
  closed: "Closed",
};

const statusTriggerClasses: Record<AppointmentRequestStatus, string> = {
  pending:
    "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 focus-visible:border-amber-300",
  contacted:
    "border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100 focus-visible:border-sky-300",
  closed:
    "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 focus-visible:border-emerald-300",
};

export function AdminRequestStatusSelect({
  requestId,
  value,
}: AdminRequestStatusSelectProps) {
  const [status, setStatus] = useState<AppointmentRequestStatus>(value);
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setStatus(value);
  }, [value]);

  return (
    <div className="min-w-[160px] space-y-1.5">
      <Select
        value={status}
        items={appointmentRequestStatuses.map((statusValue) => ({
          label: statusLabels[statusValue],
          value: statusValue,
        }))}
        onValueChange={(nextValue) => {
          if (!nextValue || nextValue === status || isPending) {
            return;
          }

          const previousStatus = status;
          const nextStatus = nextValue as AppointmentRequestStatus;
          setStatus(nextStatus);
          setMessage("");

          startTransition(async () => {
            const result = await updateAppointmentRequestStatusAction(
              requestId,
              nextStatus,
            );

            if (result.error) {
              setStatus(previousStatus);
              setMessage(result.error);
              return;
            }

            setMessage("Saved");
          });
        }}
      >
        <SelectTrigger
          aria-label="Update request status"
          className={cn(
            "h-10 rounded-full text-sm shadow-none",
            statusTriggerClasses[status],
          )}
          disabled={isPending}
        >
          <SelectValue placeholder={statusLabels[status]} />
        </SelectTrigger>
        <SelectContent>
          {appointmentRequestStatuses.map((statusValue) => (
            <SelectItem key={statusValue} value={statusValue}>
              {statusLabels[statusValue]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p
        className={cn(
          "min-h-4 text-xs",
          message && message !== "Saved" ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {isPending ? "Saving..." : message}
      </p>
    </div>
  );
}
