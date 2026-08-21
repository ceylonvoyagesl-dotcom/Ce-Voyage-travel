import { WalletCards } from "lucide-react";
import { ModulePreview } from "@/components/dashboard/module-preview";

export default function FinancePage() {
  return <ModulePreview icon={WalletCards} title="Accounts, Billing & Invoicing" phase="Phase 03" description="Create multi-currency guest documents, record every tour cost and understand the true profitability of each journey." capabilities={["EUR, USD & LKR invoices", "Income and guest payment ledger", "Hotel, ticket, fuel & driver expenses", "Net profit and monthly revenue reports"]} />;
}
