import { UsersRound } from "lucide-react";
import { ModulePreview } from "@/components/dashboard/module-preview";

export default function StaffPage() {
  return <ModulePreview icon={UsersRound} title="Staff & HR Management" phase="Phase 03" description="Support chauffeur guides, drivers and office staff with transparent attendance, tour-day and compensation records." capabilities={["Staff profiles & document records", "Attendance and tour-day tracking", "Driver payouts & daily Batta", "Commission and payroll summaries"]} />;
}
