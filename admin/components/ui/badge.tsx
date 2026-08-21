import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "emerald" | "blue" | "amber" | "rose" | "slate" | "violet" | "teal";
  dot?: boolean;
};

const tones = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/15",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/15",
  rose: "bg-rose-50 text-rose-700 ring-rose-600/15",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/10",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/15",
  teal: "bg-teal-50 text-teal-700 ring-teal-600/15",
};

export function Badge({ className, tone = "slate", dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold leading-none ring-1 ring-inset",
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className="size-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}
