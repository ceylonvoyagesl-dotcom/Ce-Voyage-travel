"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownUp,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Columns3,
  Download,
  Filter,
  Globe2,
  Inbox,
  LayoutList,
  LoaderCircle,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InquiryDrawer } from "./inquiry-drawer";
import { InquiryStatusBadge, inquiryStatuses, statusTone } from "./inquiry-status";
import { NewInquiryModal, type NewInquiryInput } from "./new-inquiry-modal";
import { demoInquiries } from "@/lib/demo-data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { cn, formatMoney, initials, relativeTime, titleCase } from "@/lib/utils";
import type { Inquiry, InquiryStatus } from "@/types";

const sourceLabels: Record<string, string> = {
  website: "Website",
  my_trip: "My Trip",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  manual: "Manual",
};

const pipelineStatuses: InquiryStatus[] = ["new", "contacted", "quoted", "confirmed"];

export function InquiriesHub() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(demoInquiries);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InquiryStatus | "all">("all");
  const [source, setSource] = useState("all");
  const [view, setView] = useState<"list" | "pipeline">("list");
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [toast, setToast] = useState("");

  const loadInquiries = useCallback(async () => {
    if (!supabase) {
      setInquiries(demoInquiries);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: requestError } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (requestError) setError(requestError.message);
    else setInquiries((data ?? []) as Inquiry[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadInquiries();
      const params = new URLSearchParams(window.location.search);
      if (params.get("new") === "1") setNewOpen(true);
      if (params.get("followup") === "today") setStatus("contacted");
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadInquiries]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return inquiries.filter((inquiry) => {
      const searchable = `${inquiry.full_name} ${inquiry.email} ${inquiry.phone} ${inquiry.inquiry_number} ${inquiry.interest}`.toLowerCase();
      return (!term || searchable.includes(term)) &&
        (status === "all" || inquiry.status === status) &&
        (source === "all" || inquiry.source === source);
    });
  }, [inquiries, query, source, status]);

  const counts = useMemo(() => Object.fromEntries(inquiryStatuses.map((item) => [item, inquiries.filter((inquiry) => inquiry.status === item).length])), [inquiries]);
  const potential = inquiries.filter((item) => !["cancelled", "completed"].includes(item.status)).reduce((sum, item) => sum + (item.estimated_value ?? 0), 0);

  async function updateStatus(nextStatus: InquiryStatus) {
    if (!selected) return;
    const id = selected.id;
    if (supabase) {
      const { error: updateError } = await supabase.from("inquiries").update({ status: nextStatus }).eq("id", id);
      if (updateError) {
        setError(updateError.message);
        return;
      }
    }
    setInquiries((items) => items.map((item) => item.id === id ? { ...item, status: nextStatus } : item));
    setSelected((item) => item ? { ...item, status: nextStatus } : item);
    setToast(`Inquiry moved to ${titleCase(nextStatus)}`);
  }

  async function createInquiry(input: NewInquiryInput) {
    const record = { ...input, status: "new" as const, estimated_value: 0, currency: "EUR" as const };
    if (supabase) {
      const { data, error: insertError } = await supabase.from("inquiries").insert(record).select("*").single();
      if (insertError) {
        setError(insertError.message);
        return;
      }
      setInquiries((items) => [data as Inquiry, ...items]);
    } else {
      const next: Inquiry = {
        ...record,
        id: `demo-${Date.now()}`,
        inquiry_number: `INQ-${1049 + inquiries.length}`,
        created_at: new Date().toISOString(),
        end_date: null,
        hotel_level: null,
        language: "en",
        assigned_to: null,
      };
      setInquiries((items) => [next, ...items]);
    }
    setNewOpen(false);
    setToast("New inquiry added to the pipeline");
  }

  async function convertToBooking() {
    if (!selected) return;
    const travellers = Number.parseInt(selected.travellers ?? "1", 10) || 1;
    const record = {
      inquiry_id: selected.id,
      guest_name: selected.full_name ?? "Guest",
      guest_email: selected.email,
      guest_phone: selected.phone,
      tour_name: selected.interest ?? "Private Sri Lanka Journey",
      start_date: selected.travel_date ?? new Date().toISOString().slice(0, 10),
      end_date: selected.end_date ?? selected.travel_date ?? new Date().toISOString().slice(0, 10),
      travellers,
      status: "draft",
      total_amount: selected.estimated_value ?? 0,
      paid_amount: 0,
      currency: selected.currency ?? "EUR",
    };
    if (supabase) {
      const { error: bookingError } = await supabase.from("bookings").insert(record);
      if (bookingError) {
        setError(bookingError.message);
        return;
      }
      await supabase.from("inquiries").update({ status: "confirmed" }).eq("id", selected.id);
    }
    setInquiries((items) => items.map((item) => item.id === selected.id ? { ...item, status: "confirmed" } : item));
    setSelected((item) => item ? { ...item, status: "confirmed" } : null);
    setToast("Draft booking created successfully");
  }

  function exportCsv() {
    const headings = ["Inquiry", "Guest", "Email", "Phone", "Type", "Status", "Source", "Travel date", "Value", "Currency"];
    const rows = filtered.map((item) => [item.inquiry_number, item.full_name, item.email, item.phone, item.inquiry_type, item.status, item.source, item.travel_date, item.estimated_value, item.currency]);
    const csv = [headings, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = `ce-voyage-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="animate-fade space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="max-w-2xl text-sm text-slate-500">Capture every request, follow up on time and turn travel ideas into confirmed journeys.</p>
          <div className="mt-2 flex items-center gap-3 text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1.5"><RefreshCw className="size-3" /> Updated just now</span>
            {!isSupabaseConfigured && <Badge tone="amber">Preview data</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={exportCsv}><Download className="size-3.5" /> Export</Button>
          <Link href="/bookings" className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"><CalendarDays className="size-3.5" /> View bookings</Link>
          <Button size="sm" onClick={() => setNewOpen(true)}><Plus className="size-3.5" /> Add inquiry</Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <CircleAlert className="mt-0.5 size-4 shrink-0" /><span className="flex-1">{error}</span><button onClick={() => setError("")}><X className="size-4" /></button>
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={Inbox} label="Open inquiries" value={String(inquiries.filter((item) => !["completed", "cancelled"].includes(item.status)).length)} detail={`${counts.new ?? 0} need first response`} tone="blue" />
        <SummaryCard icon={Sparkles} label="New this week" value={String(counts.new ?? 0)} detail="Website & app requests" tone="emerald" />
        <SummaryCard icon={CheckCircle2} label="Conversion rate" value="32%" detail="+4.8% vs last month" tone="violet" />
        <SummaryCard icon={UsersRound} label="Pipeline value" value={formatMoney(potential, "EUR")} detail="Estimated open opportunities" tone="amber" />
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1 xl:max-w-md">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search guest, email, phone or inquiry ID…" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs outline-none transition focus:border-emerald-700/35 focus:bg-white focus:ring-4 focus:ring-emerald-700/5" />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                <select value={status} onChange={(e) => setStatus(e.target.value as InquiryStatus | "all")} className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-8 pr-8 text-[11px] font-bold text-slate-600 outline-none hover:border-slate-300">
                  <option value="all">All statuses</option>{inquiryStatuses.map((item) => <option key={item} value={item}>{titleCase(item)} ({counts[item] ?? 0})</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-slate-400" />
              </div>
              <div className="relative">
                <Globe2 className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                <select value={source} onChange={(e) => setSource(e.target.value)} className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-8 pr-8 text-[11px] font-bold text-slate-600 outline-none hover:border-slate-300">
                  <option value="all">All sources</option>{Object.entries(sourceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-slate-400" />
              </div>
              <button className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50" aria-label="More filters"><SlidersHorizontal className="size-4" /></button>
              <span className="mx-1 hidden h-8 w-px self-center bg-slate-200 sm:block" />
              <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button onClick={() => setView("list")} className={cn("flex size-8 items-center justify-center rounded-lg transition", view === "list" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-400")} aria-label="List view"><LayoutList className="size-4" /></button>
                <button onClick={() => setView("pipeline")} className={cn("flex size-8 items-center justify-center rounded-lg transition", view === "pipeline" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-400")} aria-label="Pipeline view"><Columns3 className="size-4" /></button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-72 items-center justify-center"><LoaderCircle className="size-6 animate-spin text-emerald-700" /></div>
        ) : view === "list" ? (
          <InquiryTable inquiries={filtered} onSelect={setSelected} />
        ) : (
          <Pipeline inquiries={filtered} onSelect={setSelected} />
        )}

        <footer className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/40 px-4 py-3 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <span>Showing <b className="text-slate-600">{filtered.length}</b> of {inquiries.length} inquiries</span>
          <span className="flex items-center gap-1"><ArrowDownUp className="size-3" /> Sorted by newest activity</span>
        </footer>
      </section>

      <InquiryDrawer inquiry={selected} onClose={() => setSelected(null)} onStatusChange={updateStatus} onConvert={convertToBooking} />
      <NewInquiryModal open={newOpen} onClose={() => setNewOpen(false)} onCreate={createInquiry} />

      {toast && (
        <div className="fixed bottom-5 right-5 z-[90] flex items-center gap-2 rounded-xl bg-[#0a3d33] px-4 py-3 text-xs font-bold text-white shadow-2xl animate-enter"><CheckCircle2 className="size-4 text-[#e2bd72]" /> {toast}</div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, detail, tone }: { icon: typeof Inbox; label: string; value: string; detail: string; tone: "blue" | "emerald" | "violet" | "amber" }) {
  const styles = { blue: "bg-blue-50 text-blue-700", emerald: "bg-emerald-50 text-emerald-700", violet: "bg-violet-50 text-violet-700", amber: "bg-amber-50 text-amber-700" };
  return <article className="card flex items-center gap-4 p-4"><span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", styles[tone])}><Icon className="size-[19px]" /></span><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-0.5 truncate text-xl font-extrabold tracking-tight text-[#173c32]">{value}</p><p className="mt-0.5 truncate text-[10px] text-slate-400">{detail}</p></div></article>;
}

function InquiryTable({ inquiries, onSelect }: { inquiries: Inquiry[]; onSelect: (inquiry: Inquiry) => void }) {
  if (!inquiries.length) return <EmptyState />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1050px] text-left">
        <thead><tr className="border-b border-slate-100 bg-slate-50/55 text-[9px] font-extrabold uppercase tracking-[.12em] text-slate-400">
          <th className="w-10 px-4 py-3"><input type="checkbox" className="accent-emerald-700" aria-label="Select all inquiries" /></th><th className="px-3 py-3">Guest</th><th className="px-3 py-3">Request</th><th className="px-3 py-3">Travel</th><th className="px-3 py-3">Value</th><th className="px-3 py-3">Owner</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Received</th><th className="w-12 px-3 py-3" />
        </tr></thead>
        <tbody>
          {inquiries.map((inquiry) => (
            <tr key={inquiry.id} onClick={() => onSelect(inquiry)} className="group cursor-pointer border-b border-slate-100 last:border-0 hover:bg-[#f7faf8]">
              <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="accent-emerald-700" aria-label={`Select ${inquiry.full_name}`} /></td>
              <td className="px-3 py-3.5"><div className="flex items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-slate-100 text-[10px] font-black text-emerald-800 ring-1 ring-emerald-900/5">{initials(inquiry.full_name)}</span><div className="min-w-0"><p className="max-w-[155px] truncate text-xs font-extrabold text-slate-700">{inquiry.full_name || "Unnamed guest"}</p><p className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-slate-400"><Mail className="size-2.5" /> <span className="max-w-[145px] truncate">{inquiry.email ?? inquiry.phone ?? "No contact"}</span></p></div></div></td>
              <td className="px-3 py-3.5"><p className="max-w-[180px] truncate text-[11px] font-bold text-slate-600">{inquiry.interest || titleCase(inquiry.inquiry_type)}</p><div className="mt-1 flex items-center gap-1.5"><Badge className="px-1.5 py-0.5 text-[8px]" tone={inquiry.source === "website" ? "teal" : "slate"}>{sourceLabels[inquiry.source] ?? titleCase(inquiry.source)}</Badge><span className="text-[9px] font-semibold uppercase text-slate-400">{inquiry.language ?? "en"}</span></div></td>
              <td className="px-3 py-3.5"><p className="text-[11px] font-bold text-slate-600">{inquiry.travel_date ? new Date(`${inquiry.travel_date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "Flexible"}</p><p className="mt-1 flex items-center gap-1 text-[9px] text-slate-400"><UsersRound className="size-2.5" /> {inquiry.travellers ?? "TBC"}</p></td>
              <td className="px-3 py-3.5"><p className="text-[11px] font-extrabold text-slate-700">{formatMoney(inquiry.estimated_value ?? 0, inquiry.currency ?? "EUR")}</p><p className="mt-1 text-[9px] font-semibold text-slate-400">{inquiry.currency ?? "EUR"}</p></td>
              <td className="px-3 py-3.5">{inquiry.assigned_to ? <span className="flex items-center gap-2 text-[10px] font-bold text-slate-600"><span className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-[8px]">{initials(inquiry.assigned_to)}</span><span className="max-w-20 truncate">{inquiry.assigned_to.split(" ")[0]}</span></span> : <span className="text-[10px] font-semibold text-amber-600">Unassigned</span>}</td>
              <td className="px-3 py-3.5"><InquiryStatusBadge status={inquiry.status} /></td>
              <td className="px-3 py-3.5"><p className="text-[10px] font-bold text-slate-500">{relativeTime(inquiry.created_at)}</p><p className="mt-1 text-[9px] text-slate-400">{inquiry.inquiry_number ?? inquiry.id.slice(0, 8)}</p></td>
              <td className="px-3 py-3.5"><button onClick={(e) => { e.stopPropagation(); onSelect(inquiry); }} className="flex size-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-slate-100 group-hover:opacity-100"><MoreHorizontal className="size-4" /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pipeline({ inquiries, onSelect }: { inquiries: Inquiry[]; onSelect: (inquiry: Inquiry) => void }) {
  return (
    <div className="overflow-x-auto bg-slate-50/50 p-4">
      <div className="grid min-w-[1000px] grid-cols-4 gap-3">
        {pipelineStatuses.map((column) => {
          const items = inquiries.filter((inquiry) => inquiry.status === column);
          return <div key={column} className="rounded-xl border border-slate-200/80 bg-[#f7f9f8] p-2.5"><div className="mb-3 flex items-center justify-between px-1"><span className="flex items-center gap-2 text-[11px] font-extrabold text-slate-600"><span className={cn("size-2 rounded-full", statusTone[column] === "blue" ? "bg-blue-500" : statusTone[column] === "violet" ? "bg-violet-500" : statusTone[column] === "amber" ? "bg-amber-500" : "bg-teal-500")} />{titleCase(column)}</span><span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-black text-slate-400 ring-1 ring-slate-200">{items.length}</span></div><div className="space-y-2.5">{items.map((inquiry) => <button key={inquiry.id} onClick={() => onSelect(inquiry)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-700/20 hover:shadow-md"><div className="flex items-start justify-between gap-2"><span className="text-[9px] font-bold text-[#ad8436]">{inquiry.inquiry_number}</span><span className="text-[9px] text-slate-400">{relativeTime(inquiry.created_at)}</span></div><p className="mt-2 truncate text-xs font-extrabold text-slate-700">{inquiry.full_name}</p><p className="mt-1 line-clamp-2 min-h-8 text-[10px] leading-4 text-slate-400">{inquiry.interest ?? inquiry.message}</p><div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5"><span className="flex items-center gap-1 text-[9px] font-semibold text-slate-400"><CalendarDays className="size-3" /> {inquiry.travel_date ?? "Flexible"}</span><span className="text-[10px] font-extrabold text-slate-600">{formatMoney(inquiry.estimated_value ?? 0, inquiry.currency ?? "EUR")}</span></div></button>)}</div>{!items.length && <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-200 text-[10px] text-slate-400">No inquiries</div>}</div>;
        })}
      </div>
    </div>
  );
}

function EmptyState() {
  return <div className="flex h-72 flex-col items-center justify-center px-4 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Search className="size-5" /></span><p className="mt-4 text-sm font-extrabold text-slate-700">No inquiries found</p><p className="mt-1 text-xs text-slate-400">Try changing your search or filter selection.</p></div>;
}
