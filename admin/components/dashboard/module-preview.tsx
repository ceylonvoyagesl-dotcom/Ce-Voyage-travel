import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check, Clock3, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ModulePreview({
  icon: Icon,
  title,
  description,
  capabilities,
  phase,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  capabilities: string[];
  phase: string;
}) {
  return (
    <div className="animate-fade">
      <div className="mx-auto max-w-4xl pt-5 lg:pt-10">
        <section className="relative overflow-hidden rounded-[24px] bg-[#0a3d33] p-7 text-white shadow-2xl shadow-emerald-950/10 sm:p-10">
          <div className="absolute -right-24 -top-28 size-80 rounded-full border-[55px] border-white/5" />
          <div className="absolute -bottom-28 left-1/3 size-56 rounded-full bg-[#d5aa56]/8 blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10"><Icon className="size-5 text-[#e1bd74]" /></span>
              <Badge className="bg-[#d5aa56]/12 text-[#e5c886] ring-[#d5aa56]/20"><Clock3 className="size-3" /> {phase}</Badge>
            </div>
            <p className="mt-10 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#dfba70]">Operations roadmap</p>
            <h2 className="display-serif mt-2 text-3xl tracking-tight sm:text-4xl">{title}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50/62">{description}</p>
          </div>
        </section>

        <section className="card relative -mt-4 mx-3 grid gap-3 p-5 sm:grid-cols-2 sm:p-7">
          {capabilities.map((capability) => (
            <div key={capability} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/55 p-3.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Check className="size-3.5" /></span>
              <span className="text-xs font-bold text-slate-600">{capability}</span>
            </div>
          ))}
        </section>

        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-5 py-7 text-center">
          <Construction className="size-5 text-[#ad8436]" />
          <p className="mt-3 text-sm font-extrabold text-slate-700">Foundation ready for implementation</p>
          <p className="mt-1 max-w-md text-xs leading-5 text-slate-400">The database, permissions and navigation for this module are defined. Its full operational view is scheduled for the next build phase.</p>
          <Link href="/inquiries" className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-900">Return to active inquiries <ArrowRight className="size-3.5" /></Link>
        </div>
      </div>
    </div>
  );
}
