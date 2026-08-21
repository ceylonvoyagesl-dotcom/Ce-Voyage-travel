"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  CalendarDays,
  CarFront,
  ChevronDown,
  Clock3,
  Download,
  Filter,
  LoaderCircle,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoBookings } from "@/lib/demo-data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { cn, formatMoney, initials, titleCase } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";

const bookingTones = {
  draft: "slate",
  confirmed: "blue",
  in_progress: "emerald",
  completed: "teal",
  cancelled: "rose",
} as const;

export function BookingsView() {
  const [bookings, setBookings] = useState<Booking[]>(demoBookings);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BookingStatus | "all">("all");

  useEffect(() => {
    if (!supabase) return;
    async function load() {
      const { data } = await supabase!.from("bookings").select("*").order("start_date");
      if (data) setBookings(data as Booking[]);
      setLoading(false);
    }
    void load();
  }, []);

  const filtered = useMemo(() => bookings.filter((booking) => {
    const term = query.toLowerCase();
    return (!term || `${booking.guest_name} ${booking.booking_number} ${booking.tour_name}`.toLowerCase().includes(term)) && (status === "all" || booking.status === status);
  }), [bookings, query, status]);

  const outstanding = bookings.reduce((sum, booking) => sum + Math.max(booking.total_amount - booking.paid_amount, 0), 0);

  return (
    <div className="animate-fade space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-sm text-slate-500">Coordinate confirmed journeys, guest payments and dispatch readiness.</p><div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400"><CalendarDays className="size-3" /> 4 journeys from August to September {!isSupabaseConfigured && <Badge tone="amber">Preview data</Badge>}</div></div>
        <div className="flex gap-2"><Button variant="secondary" size="sm"><Download className="size-3.5" /> Export manifest</Button><Link href="/inquiries?new=1" className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#0b513f] px-3 text-xs font-semibold text-white shadow-sm"><Plus className="size-3.5" /> New booking</Link></div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={CalendarDays} label="Upcoming tours" value="3" detail="Next 30 days" tone="blue" />
        <Metric icon={MapPin} label="Currently on tour" value="1" detail="2 guests · Ella" tone="emerald" />
        <Metric icon={CarFront} label="Awaiting dispatch" value="1" detail="Driver or vehicle needed" tone="amber" />
        <Metric icon={Banknote} label="Balance due" value={formatMoney(outstanding, "EUR")} detail="Across active bookings" tone="violet" />
      </section>

      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="relative min-w-0 flex-1 sm:max-w-md"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search booking, guest or tour…" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs outline-none focus:border-emerald-700/35 focus:bg-white focus:ring-4 focus:ring-emerald-700/5" /></div>
          <div className="relative"><Filter className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" /><select value={status} onChange={(e) => setStatus(e.target.value as BookingStatus | "all")} className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-8 pr-8 text-[11px] font-bold text-slate-600 outline-none"><option value="all">All bookings</option>{Object.keys(bookingTones).map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-slate-400" /></div>
        </div>
        {loading ? <div className="flex h-72 items-center justify-center"><LoaderCircle className="size-6 animate-spin text-emerald-700" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px] text-left">
              <thead><tr className="border-b border-slate-100 bg-slate-50/55 text-[9px] font-extrabold uppercase tracking-[.12em] text-slate-400"><th className="px-5 py-3">Guest / booking</th><th className="px-3 py-3">Journey</th><th className="px-3 py-3">Travel dates</th><th className="px-3 py-3">Dispatch</th><th className="px-3 py-3">Payment</th><th className="px-3 py-3">Status</th><th className="w-12 px-3 py-3" /></tr></thead>
              <tbody>{filtered.map((booking) => {
                const percentage = booking.total_amount ? Math.round(booking.paid_amount / booking.total_amount * 100) : 0;
                return <tr key={booking.id} className="group border-b border-slate-100 last:border-0 hover:bg-[#f7faf8]"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-[10px] font-black text-emerald-800">{initials(booking.guest_name)}</span><div><p className="text-xs font-extrabold text-slate-700">{booking.guest_name}</p><p className="mt-1 text-[9px] font-bold text-[#ad8436]">{booking.booking_number}</p></div></div></td><td className="px-3 py-4"><p className="max-w-[175px] truncate text-[11px] font-bold text-slate-600">{booking.tour_name}</p><p className="mt-1 flex items-center gap-1 text-[9px] text-slate-400"><UsersRound className="size-2.5" /> {booking.travellers} guests</p></td><td className="px-3 py-4"><p className="text-[11px] font-bold text-slate-600">{new Date(`${booking.start_date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — {new Date(`${booking.end_date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p><p className="mt-1 flex items-center gap-1 text-[9px] text-slate-400"><Clock3 className="size-2.5" /> {Math.max(1, Math.round((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / 86400000))} nights</p></td><td className="px-3 py-4">{booking.driver_name ? <><p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600"><UserRound className="size-3 text-emerald-700" /> {booking.driver_name}</p><p className="mt-1 max-w-[150px] truncate text-[9px] text-slate-400">{booking.vehicle_label}</p></> : <Badge tone="amber">Assignment needed</Badge>}</td><td className="px-3 py-4"><div className="flex items-center justify-between gap-3"><span className="text-[10px] font-extrabold text-slate-600">{formatMoney(booking.paid_amount, booking.currency)}</span><span className="text-[9px] font-bold text-slate-400">{percentage}%</span></div><div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100"><div className={cn("h-full rounded-full", percentage === 100 ? "bg-emerald-500" : "bg-[#d5aa56]")} style={{ width: `${percentage}%` }} /></div><p className="mt-1 text-[9px] text-slate-400">of {formatMoney(booking.total_amount, booking.currency)}</p></td><td className="px-3 py-4"><Badge tone={bookingTones[booking.status]} dot>{titleCase(booking.status)}</Badge></td><td className="px-3 py-4"><button className="flex size-8 items-center justify-center rounded-lg text-slate-400 opacity-0 hover:bg-slate-100 group-hover:opacity-100"><MoreHorizontal className="size-4" /></button></td></tr>;
              })}</tbody>
            </table>
          </div>
        )}
        <footer className="border-t border-slate-100 bg-slate-50/40 px-5 py-3 text-[10px] text-slate-400">Showing <b className="text-slate-600">{filtered.length}</b> of {bookings.length} bookings</footer>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail, tone }: { icon: typeof CalendarDays; label: string; value: string; detail: string; tone: "blue" | "emerald" | "amber" | "violet" }) {
  const styles = { blue: "bg-blue-50 text-blue-700", emerald: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", violet: "bg-violet-50 text-violet-700" };
  return <article className="card flex items-center gap-4 p-4"><span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", styles[tone])}><Icon className="size-[19px]" /></span><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-0.5 truncate text-xl font-extrabold tracking-tight text-[#173c32]">{value}</p><p className="mt-0.5 truncate text-[10px] text-slate-400">{detail}</p></div></article>;
}
