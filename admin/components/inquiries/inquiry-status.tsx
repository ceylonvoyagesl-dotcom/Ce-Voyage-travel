import { Badge } from "@/components/ui/badge";
import { titleCase } from "@/lib/utils";
import type { InquiryStatus } from "@/types";

export const inquiryStatuses: InquiryStatus[] = [
  "new",
  "contacted",
  "quoted",
  "confirmed",
  "completed",
  "cancelled",
];

export const statusTone = {
  new: "blue",
  contacted: "violet",
  quoted: "amber",
  confirmed: "teal",
  completed: "emerald",
  cancelled: "rose",
} as const;

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  return <Badge tone={statusTone[status]} dot>{titleCase(status)}</Badge>;
}
