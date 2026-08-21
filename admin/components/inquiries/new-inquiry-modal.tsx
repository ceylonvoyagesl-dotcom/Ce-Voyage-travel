"use client";

import { useState, type FormEvent } from "react";
import { CalendarDays, LoaderCircle, Mail, Phone, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Inquiry, InquiryType } from "@/types";

export type NewInquiryInput = Pick<
  Inquiry,
  "full_name" | "email" | "phone" | "travel_date" | "travellers" | "interest" | "message"
> & { inquiry_type: InquiryType; source: string };

export function NewInquiryModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewInquiryInput) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NewInquiryInput>({
    full_name: "",
    email: "",
    phone: "",
    travel_date: "",
    travellers: "2 adults",
    interest: "",
    message: "",
    inquiry_type: "travel_request",
    source: "manual",
  });

  if (!open) return null;

  function update<K extends keyof NewInquiryInput>(key: K, value: NewInquiryInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    await onCreate(form);
    setSaving(false);
    setForm({ full_name: "", email: "", phone: "", travel_date: "", travellers: "2 adults", interest: "", message: "", inquiry_type: "travel_request", source: "manual" });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <button className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" onClick={onClose} aria-label="Close new inquiry form" />
      <form onSubmit={submit} className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-[24px] bg-white shadow-2xl sm:max-w-2xl sm:rounded-[22px]">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
          <div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#ad8436]">Sales pipeline</p><h2 className="mt-1 text-lg font-extrabold text-[#173c32]">Add a new inquiry</h2></div>
          <button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"><X className="size-4" /></button>
        </header>

        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <Field label="Guest name" icon={UserRound}>
            <input required value={form.full_name ?? ""} onChange={(e) => update("full_name", e.target.value)} placeholder="Full name" className="field-input" />
          </Field>
          <Field label="Inquiry type">
            <select value={form.inquiry_type} onChange={(e) => update("inquiry_type", e.target.value as InquiryType)} className="field-input pl-3">
              <option value="travel_request">Travel request</option><option value="tour_request">10-day tour</option><option value="trip_plan">My Trip plan</option><option value="general">General inquiry</option>
            </select>
          </Field>
          <Field label="Email" icon={Mail}>
            <input type="email" value={form.email ?? ""} onChange={(e) => update("email", e.target.value)} placeholder="guest@example.com" className="field-input" />
          </Field>
          <Field label="Phone / WhatsApp" icon={Phone}>
            <input value={form.phone ?? ""} onChange={(e) => update("phone", e.target.value)} placeholder="+33 …" className="field-input" />
          </Field>
          <Field label="Travel date" icon={CalendarDays}>
            <input type="date" value={form.travel_date ?? ""} onChange={(e) => update("travel_date", e.target.value)} className="field-input" />
          </Field>
          <Field label="Travellers">
            <input value={form.travellers ?? ""} onChange={(e) => update("travellers", e.target.value)} placeholder="2 adults" className="field-input pl-3" />
          </Field>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-xs font-bold text-slate-600">Tour interest</label>
            <input value={form.interest ?? ""} onChange={(e) => update("interest", e.target.value)} placeholder="e.g. 10-Day Classic Sri Lanka" className="field-input pl-3" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-xs font-bold text-slate-600">Notes</label>
            <textarea value={form.message ?? ""} onChange={(e) => update("message", e.target.value)} placeholder="Guest preferences, route ideas, budget…" rows={4} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700/40 focus:ring-4 focus:ring-emerald-700/5" />
          </div>
        </div>

        <footer className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-100 bg-slate-50/95 px-5 py-4 backdrop-blur sm:px-6">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving && <LoaderCircle className="size-4 animate-spin" />} Save inquiry</Button>
        </footer>
        <style jsx>{`
          .field-input { height: 44px; width: 100%; border-radius: 12px; border: 1px solid #e2e8f0; background: white; padding-left: 42px; padding-right: 12px; font-size: 13px; outline: none; transition: .2s; }
          .field-input:focus { border-color: rgba(4,120,87,.45); box-shadow: 0 0 0 4px rgba(4,120,87,.05); }
          .field-input::placeholder { color: #94a3b8; }
        `}</style>
      </form>
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon?: typeof UserRound; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-slate-600">{label}</label>
      <div className="relative">{Icon && <Icon className="absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-slate-400" />}{children}</div>
    </div>
  );
}
