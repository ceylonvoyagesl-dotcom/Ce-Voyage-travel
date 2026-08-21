import { CarFront } from "lucide-react";
import { ModulePreview } from "@/components/dashboard/module-preview";

export default function FleetPage() {
  return <ModulePreview icon={CarFront} title="Fleet & Driver Dispatcher" phase="Phase 02" description="Assign the right chauffeur and vehicle to every journey, with live trip notes and compliance details in one operational view." capabilities={["Driver availability & contact directory", "Vehicle, chassis & insurance records", "Tour assignment board", "Live trip status and dispatcher notes"]} />;
}
