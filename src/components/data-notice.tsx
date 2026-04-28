import { AlertCircle } from "lucide-react";

type DataNoticeProps = {
  message: string;
};

export function DataNotice({ message }: DataNoticeProps) {
  return (
    <div className="rounded-[22px] border border-amber-200 bg-amber-50/85 px-4 py-3 text-sm leading-6 text-amber-900">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{message}</p>
      </div>
    </div>
  );
}
