import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  MapPin,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { recentActivity } from "@/lib/demo-data";
import { formatMoney } from "@/lib/utils";

const stats = [
  { label: "New inquiries", value: "8", detail: "+3 since yesterday", icon: MessageSquareText, trend: "+18%", tone: "emerald" },
  { label: "Active tours", value: "6", detail: "14 guests on the road", icon: MapPin, trend: "Live", tone: "blue" },
  { label: "August revenue", value: "€42.8K", detail: "€7.2K awaiting payment", icon: CircleDollarSign, trend: "+12.4%", tone: "gold" },
  { label: "Fleet available", value: "9/12", detail: "2 assigned · 1 service", icon: CarFront, trend: "75%", tone: "slate" },
];

const tours = [
  { id: "CV-3019", guest: "Mia Robinson", route: "Nuwara Eliya → Ella", date: "Today", time: "08:30", driver: "Chaminda P.", status: "On tour", tone: "emerald" as const },
  { id: "CV-3020", guest: "Jules Bernard", route: "CMB Airport → Negombo", date: "Aug 24", time: "14:15", driver: "Ruwan F.", status: "Ready", tone: "blue" as const },
  { id: "CV-3021", guest: "Mehmet Kaya", route: "10-Day Classic Sri Lanka", date: "Sep 12", time: "09:00", driver: "Dinesh J.", status: "Confirmed", tone: "amber" as const },
];

const chart = [28, 41, 36, 58, 49, 65, 78, 61, 83, 72, 88, 95];

export default function DashboardPage() {
  return (
    <div className="animate-fade space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Here&apos;s what is happening across Ce Voyage today.</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5 text-emerald-700" /> Friday, 21 August 2026</span>
            <span className="hidden size-1 rounded-full bg-slate-300 sm:block" />
            <span className="flex items-center gap-1.5"><Clock3 className="size-3.5 text-emerald-700" /> Sri Lanka · 1:48 PM</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-slate-300"><FileText className="size-4" /> New quotation</button>
          <Link href="/inquiries?new=1" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0b513f] px-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#084536]"><Plus className="size-4" /> Add inquiry</Link>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="card group p-4 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/[.055] lg:p-5">
              <div className="flex items-start justify-between">
                <div className={`flex size-10 items-center justify-center rounded-xl ${
                  stat.tone === "emerald" ? "bg-emerald-50 text-emerald-700" :
                  stat.tone === "blue" ? "bg-blue-50 text-blue-700" :
                  stat.tone === "gold" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"
                }`}><Icon className="size-[18px]" strokeWidth={1.9} /></div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${stat.trend.startsWith("+") ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{stat.trend}</span>
              </div>
              <p className="mt-5 text-[11px] font-bold uppercase tracking-[.08em] text-slate-400">{stat.label}</p>
              <p className="mt-1 text-[1.7rem] font-extrabold tracking-[-.04em] text-[#183c33]">{stat.value}</p>
              <p className="mt-1 text-[11px] text-slate-400">{stat.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <article className="card min-w-0 overflow-hidden">
          <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-extrabold text-[#193d34]">Upcoming journeys</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">Next departures and live guest movements</p>
            </div>
            <Link href="/bookings" className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900">View calendar <ArrowRight className="size-3.5" /></Link>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/55 text-[9px] font-bold uppercase tracking-[.13em] text-slate-400">
                  <th className="px-6 py-3">Guest / booking</th>
                  <th className="px-4 py-3">Journey</th>
                  <th className="px-4 py-3">Departure</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="w-12 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {tours.map((tour) => (
                  <tr key={tour.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/45">
                    <td className="px-6 py-4"><p className="text-xs font-bold text-slate-800">{tour.guest}</p><p className="mt-1 text-[10px] font-semibold text-slate-400">{tour.id}</p></td>
                    <td className="px-4 py-4"><p className="max-w-[170px] truncate text-xs font-semibold text-slate-600">{tour.route}</p></td>
                    <td className="px-4 py-4"><p className="text-xs font-bold text-slate-700">{tour.date}</p><p className="mt-1 text-[10px] text-slate-400">{tour.time}</p></td>
                    <td className="px-4 py-4"><span className="flex items-center gap-2 text-xs font-semibold text-slate-600"><span className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">{tour.driver.split(" ").map((p) => p[0]).join("")}</span>{tour.driver}</span></td>
                    <td className="px-4 py-4"><Badge tone={tour.tone} dot>{tour.status}</Badge></td>
                    <td className="px-3 py-4"><button className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><MoreHorizontal className="size-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card overflow-hidden">
          <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div><h2 className="text-sm font-extrabold text-[#193d34]">Recent activity</h2><p className="mt-0.5 text-[11px] text-slate-400">Live team updates</p></div>
            <button className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><MoreHorizontal className="size-4" /></button>
          </header>
          <div className="px-5 py-2">
            {recentActivity.map((item, index) => (
              <div key={item.id} className="relative flex gap-3 py-3.5">
                {index < recentActivity.length - 1 && <span className="absolute left-[6px] top-8 h-[calc(100%-12px)] w-px bg-slate-100" />}
                <span className={`relative mt-1.5 size-3 shrink-0 rounded-full border-[3px] border-white ring-1 ${
                  item.tone === "emerald" ? "bg-emerald-500 ring-emerald-200" : item.tone === "blue" ? "bg-blue-500 ring-blue-200" : item.tone === "amber" ? "bg-amber-500 ring-amber-200" : "bg-slate-400 ring-slate-200"
                }`} />
                <div className="min-w-0 flex-1"><p className="text-xs font-bold text-slate-700">{item.label}</p><p className="mt-1 truncate text-[11px] text-slate-400">{item.detail}</p></div>
                <time className="shrink-0 text-[9px] font-semibold text-slate-400">{item.time}</time>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <article className="card p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div><p className="text-sm font-extrabold text-[#193d34]">Revenue performance</p><p className="mt-1 text-[11px] text-slate-400">Confirmed revenue · February to August</p></div>
            <select className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-500 outline-none"><option>Last 7 months</option></select>
          </div>
          <div className="mt-5 flex items-end gap-3"><span className="text-2xl font-extrabold tracking-tight text-[#173c32]">€164,280</span><span className="mb-1 flex items-center gap-1 text-[10px] font-bold text-emerald-700"><TrendingUp className="size-3" /> 14.2%</span></div>
          <div className="mt-6 flex h-36 items-end gap-2.5 border-b border-slate-100 px-2 sm:gap-4">
            {chart.map((height, index) => (
              <div key={index} className="group relative flex h-full flex-1 items-end">
                <div className="w-full rounded-t-md bg-gradient-to-t from-[#0b513f] to-[#2d8a70] opacity-85 transition group-hover:opacity-100" style={{ height: `${height}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between px-2 text-[9px] font-semibold text-slate-400"><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span></div>
        </article>

        <article className="relative overflow-hidden rounded-[18px] bg-[#0a3d33] p-5 text-white shadow-xl shadow-emerald-950/10 sm:p-6">
          <div className="absolute -right-20 -top-20 size-56 rounded-full border-[40px] border-white/5" />
          <div className="relative">
            <div className="flex items-center justify-between"><span className="flex size-10 items-center justify-center rounded-xl bg-white/10"><CheckCircle2 className="size-[18px] text-[#e1bd74]" /></span><Badge className="bg-white/10 text-emerald-100 ring-white/10">TEAM FOCUS</Badge></div>
            <h2 className="display-serif mt-7 text-2xl leading-8">Four follow-ups are due today.</h2>
            <p className="mt-3 text-xs leading-5 text-emerald-50/60">Keep warm leads moving. Two quotations above €3,000 are awaiting guest confirmation.</p>
            <Link href="/inquiries?followup=today" className="mt-7 inline-flex h-10 items-center gap-2 rounded-xl bg-[#d5aa56] px-4 text-xs font-extrabold text-[#17372f] transition hover:bg-[#e0ba71]">Open follow-up queue <ArrowUpRight className="size-3.5" /></Link>
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
              <div><p className="text-[10px] text-emerald-50/45">Lead value</p><p className="mt-1 text-sm font-bold">{formatMoney(14_250, "EUR")}</p></div>
              <div><p className="text-[10px] text-emerald-50/45">Assigned to</p><p className="mt-1 flex items-center gap-1.5 text-sm font-bold"><UsersRound className="size-3.5 text-[#dfba70]" /> 3 agents</p></div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
