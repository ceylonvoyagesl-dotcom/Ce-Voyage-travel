import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function OperationsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
