"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  FileDown,
  Hotel,
  Languages,
  Mail,
  MapPinned,
  MessageSquareText,
  Phone,
  Send,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InquiryStatusBadge, inquiryStatuses } from "./inquiry-status";
import { currencySymbols, formatMoney, titleCase } from "@/lib/utils";
import type { Inquiry, InquiryStatus } from "@/types";

export function InquiryDrawer({
  inquiry,
  onClose,
  onStatusChange,
  onConvert,
}: {
  inquiry: Inquiry | null;
  onClose: () => void;
  onStatusChange: (status: InquiryStatus) => Promise<void>;
  onConvert: () => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  if (!inquiry) return null;
  const activeInquiry = inquiry;

  async function changeStatus(status: InquiryStatus) {
    setUpdating(true);
    await onStatusChange(status);
    setUpdating(false);
  }

  async function convert() {
    setConverting(true);
    await onConvert();
    setConverting(false);
  }

  function generateQuotation() {
    const inquiry = activeInquiry;
    const popup = window.open("", "_blank", "width=900,height=720");
    if (!popup) return;
    const currency = inquiry.currency ?? "EUR";
    const value = inquiry.estimated_value ?? 0;
    const quoteNumber = escapeHtml(inquiry.inquiry_number ?? inquiry.id);
    const guestName = escapeHtml(inquiry.full_name ?? "Guest");
    const guestEmail = escapeHtml(inquiry.email ?? "");
    const guestPhone = escapeHtml(inquiry.phone ?? "");
    const travelDate = escapeHtml(inquiry.travel_date ?? "To be confirmed");
    const travellers = escapeHtml(inquiry.travellers ?? "To be confirmed");
    const hotelLevel = escapeHtml(inquiry.hotel_level ?? "As per itinerary");
    const tourName = escapeHtml(inquiry.interest ?? "Private Sri Lanka Journey");
    popup.document.write(`<!doctype html><html><head><title>Quotation ${inquiry.inquiry_number ?? inquiry.id}</title><style>
      @page{size:A4;margin:18mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#17372f;margin:0}.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0a3d33;padding-bottom:22px}.brand{font-family:Georgia,serif;font-size:30px;font-weight:700;color:#0a3d33}.tag{color:#ad8436;font-size:10px;letter-spacing:2px;margin-top:5px}.quote{text-align:right}.quote h1{font:26px Georgia,serif;margin:0}.quote p{font-size:11px;color:#64748b}.meta{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin:35px 0}.label{font-size:9px;text-transform:uppercase;letter-spacing:1.4px;color:#94a3b8;font-weight:700;margin-bottom:7px}.value{font-size:13px;line-height:1.7}.box{background:#f4f7f5;border:1px solid #dce7e2;border-radius:10px;padding:18px;margin:20px 0}.tour{font:20px Georgia,serif;margin:0 0 8px}.row{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid #e2e8f0;font-size:13px}.total{display:flex;justify-content:space-between;background:#0a3d33;color:white;padding:18px;border-radius:9px;margin-top:10px;font-weight:700}.foot{margin-top:60px;border-top:1px solid #e2e8f0;padding-top:18px;font-size:10px;line-height:1.7;color:#64748b}.print{position:fixed;right:20px;top:20px;border:0;border-radius:8px;background:#d5aa56;padding:11px 18px;font-weight:700;color:#17372f}@media print{.print{display:none}}</style></head><body>
      <button class="print" onclick="window.print()">Print / Save PDF</button><div class="head"><div><div class="brand">Ce Voyage</div><div class="tag">JOURNEYS BEYOND BORDERS</div></div><div class="quote"><h1>Travel Quotation</h1><p>${quoteNumber}<br>${new Date().toLocaleDateString("en-GB")}</p></div></div>
      <div class="meta"><div><div class="label">Prepared for</div><div class="value"><b>${guestName}</b><br>${guestEmail}<br>${guestPhone}</div></div><div><div class="label">Travel details</div><div class="value">Travel date: <b>${travelDate}</b><br>Guests: <b>${travellers}</b><br>Hotel: <b>${hotelLevel}</b></div></div></div>
      <div class="box"><p class="tour">${tourName}</p><div class="value">A personalised private journey prepared by the Ce Voyage travel team. Final inclusions, accommodation and day-by-day itinerary will be confirmed with the guest.</div></div>
      <div class="row"><span>Private tour arrangement</span><b>${currencySymbols[currency]} ${value.toLocaleString()}</b></div><div class="row"><span>Quotation validity</span><span>14 days</span></div><div class="total"><span>Estimated tour total</span><span>${currencySymbols[currency]} ${value.toLocaleString()} ${currency}</span></div>
      <div class="foot"><b>Ce Voyage · Journeys Beyond Borders</b><br>ceylonvoyage.sl@gmail.com · +94 77 66 55 493 · www.ce-voyage.com<br><br>This is an indicative quotation. Final rates are subject to hotel availability and confirmed itinerary.</div>
      </body></html>`);
    popup.document.close();
  }

  const currentIndex = inquiryStatuses.indexOf(inquiry.status);

  return (
    <div className="fixed inset-0 z-[60]">
      <button aria-label="Close details" className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[580px] animate-enter flex-col bg-[#f8faf9] shadow-2xl">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><p className="text-[10px] font-extrabold tracking-[.13em] text-[#ad8436]">{inquiry.inquiry_number ?? inquiry.id.toUpperCase()}</p><InquiryStatusBadge status={inquiry.status} /></div>
            <h2 className="mt-1.5 truncate text-xl font-extrabold tracking-[-.02em] text-[#173c32]">{inquiry.full_name || "Unnamed guest"}</h2>
          </div>
          <button onClick={onClose} className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"><X className="size-[18px]" /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <section className="card p-4">
            <div className="mb-4 flex items-center justify-between"><p className="text-xs font-extrabold text-slate-700">Pipeline progress</p><span className="text-[10px] font-semibold text-slate-400">{inquiry.status === "cancelled" ? "Lead cancelled" : `${Math.min(currentIndex + 1, 5)} of 5`}</span></div>
            <div className="relative flex items-start justify-between">
              <span className="absolute left-4 right-4 top-3.5 h-0.5 bg-slate-100" />
              <span className="absolute left-4 top-3.5 h-0.5 bg-emerald-700 transition-all" style={{ width: inquiry.status === "cancelled" ? "0" : `calc(${Math.min(currentIndex, 4) / 4 * 100}% - 16px)` }} />
              {inquiryStatuses.slice(0, 5).map((status, index) => (
                <button key={status} onClick={() => changeStatus(status)} disabled={updating} className="relative z-10 flex w-16 flex-col items-center gap-2">
                  <span className={`flex size-7 items-center justify-center rounded-full border-2 text-[10px] font-black transition ${index <= currentIndex && inquiry.status !== "cancelled" ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-200 bg-white text-slate-400"}`}>{index < currentIndex && inquiry.status !== "cancelled" ? <Check className="size-3.5" /> : index + 1}</span>
                  <span className="text-[9px] font-bold text-slate-500">{titleCase(status)}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
              <div className="relative flex-1">
                <select value={inquiry.status} onChange={(e) => changeStatus(e.target.value as InquiryStatus)} disabled={updating} className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 outline-none focus:border-emerald-700/40">
                  {inquiryStatuses.map((status) => <option key={status} value={status}>Move to {titleCase(status)}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              </div>
              <Button size="sm" variant="secondary" onClick={() => changeStatus("cancelled")} disabled={updating || inquiry.status === "cancelled"}>Cancel lead</Button>
            </div>
          </section>

          <section className="card mt-4 overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-3.5"><h3 className="text-xs font-extrabold text-slate-700">Guest &amp; trip details</h3></div>
            <div className="grid sm:grid-cols-2">
              <Info icon={Mail} label="Email" value={inquiry.email ?? "Not provided"} href={inquiry.email ? `mailto:${inquiry.email}` : undefined} />
              <Info icon={Phone} label="Phone / WhatsApp" value={inquiry.phone ?? inquiry.contact ?? "Not provided"} href={inquiry.phone ? `tel:${inquiry.phone}` : undefined} />
              <Info icon={CalendarDays} label="Travel date" value={inquiry.travel_date ? new Date(`${inquiry.travel_date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Flexible"} />
              <Info icon={UsersRound} label="Travellers" value={inquiry.travellers ?? "Not confirmed"} />
              <Info icon={MapPinned} label="Tour interest" value={inquiry.interest ?? "Custom journey"} />
              <Info icon={Hotel} label="Hotel preference" value={inquiry.hotel_level ?? "Not selected"} />
              <Info icon={Languages} label="Guest language" value={(inquiry.language ?? "en").toUpperCase()} />
              <Info icon={UserRound} label="Assigned agent" value={inquiry.assigned_to ?? "Unassigned"} />
            </div>
          </section>

          <section className="card mt-4 p-4">
            <div className="flex items-center justify-between"><h3 className="flex items-center gap-2 text-xs font-extrabold text-slate-700"><MessageSquareText className="size-4 text-emerald-700" /> Guest request</h3><span className="text-[10px] font-semibold text-slate-400">via {titleCase(inquiry.source)}</span></div>
            <p className="mt-3 text-[13px] leading-6 text-slate-600">{inquiry.message || "No additional message was included with this inquiry."}</p>
            {Boolean(inquiry.trip_items?.length) && (
              <div className="mt-3 flex flex-wrap gap-1.5">{inquiry.trip_items?.map((item, index) => <span key={index} className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">{String(item)}</span>)}</div>
            )}
          </section>

          <section className="mt-4 rounded-2xl border border-[#d9c28f]/30 bg-[#fffbf2] p-4">
            <div className="flex items-start justify-between gap-3">
              <div><p className="flex items-center gap-2 text-xs font-extrabold text-[#604a1e]"><CircleDollarSign className="size-4 text-[#ad8436]" /> Estimated value</p><p className="mt-2 text-xl font-extrabold tracking-tight text-[#46391d]">{formatMoney(inquiry.estimated_value ?? 0, inquiry.currency ?? "EUR")}</p></div>
              <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-[#8b6c2b] ring-1 ring-[#d7bc7e]/30">{inquiry.currency ?? "EUR"}</span>
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="flex items-center gap-2 text-xs font-extrabold text-slate-700"><Clock3 className="size-4 text-emerald-700" /> Follow-up</h3>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">{inquiry.next_follow_up_at ? `Next action scheduled for ${new Date(inquiry.next_follow_up_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}.` : "No next action scheduled. Add a reminder to keep this lead moving."}</p>
            <button className="mt-3 text-[11px] font-bold text-emerald-700 hover:text-emerald-900">+ Schedule follow-up</button>
          </section>
        </div>

        <footer className="grid grid-cols-2 gap-2 border-t border-slate-200 bg-white p-4 sm:flex sm:px-6">
          <Button variant="secondary" onClick={generateQuotation} className="sm:flex-1"><FileDown className="size-4" /> Create quote</Button>
          <Button variant="secondary" onClick={() => inquiry.email && (window.location.href = `mailto:${inquiry.email}`)} className="sm:flex-1"><Send className="size-4" /> Contact guest</Button>
          <Button onClick={convert} disabled={converting || ["confirmed", "completed"].includes(inquiry.status)} className="col-span-2 sm:flex-1">{converting ? "Creating…" : inquiry.status === "confirmed" ? "Booking created" : "Convert to booking"} <ArrowRight className="size-4" /></Button>
        </footer>
      </aside>
    </div>
  );
}

function escapeHtml(value: unknown) {
  const characters: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(value ?? "").replace(/[&<>"']/g, (character) => characters[character]);
}

function Info({ icon: Icon, label, value, href }: { icon: typeof Mail; label: string; value: string; href?: string }) {
  const content = <><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400"><Icon className="size-3.5" /></span><span className="min-w-0"><span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span><span className="mt-1 block truncate text-[11px] font-bold text-slate-600">{value}</span></span></>;
  return href ? <a href={href} className="flex items-center gap-2.5 border-b border-slate-100 p-3.5 hover:bg-slate-50 sm:border-r">{content}</a> : <div className="flex items-center gap-2.5 border-b border-slate-100 p-3.5 sm:border-r">{content}</div>;
}
