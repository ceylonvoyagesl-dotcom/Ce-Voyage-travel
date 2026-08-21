import { PanelsTopLeft } from "lucide-react";
import { ModulePreview } from "@/components/dashboard/module-preview";

export default function ContentPage() {
  return <ModulePreview icon={PanelsTopLeft} title="Website & Content Settings" phase="Phase 04" description="Keep the public Ce Voyage experience fresh without editing code or waiting for a deployment." capabilities={["Live Feed post publishing", "Seasonal tour price updates", "Hotel partner listings", "Website settings and audit history"]} />;
}
