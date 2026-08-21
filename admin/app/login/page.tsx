"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  Compass,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types";
import { cn, titleCase } from "@/lib/utils";

const roles: { id: UserRole; label: string }[] = [
  { id: "operations_manager", label: "Operations" },
  { id: "super_admin", label: "Admin" },
  { id: "finance_hr", label: "Finance / HR" },
  { id: "dispatcher", label: "Dispatcher" },
];

export default function LoginPage() {
  const router = useRouter();
  const { profile, loading, configured, signIn, signInDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [demoRole, setDemoRole] = useState<UserRole>("operations_manager");

  useEffect(() => {
    if (!loading && profile) router.replace("/dashboard");
  }, [loading, profile, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);
    if (result.error) setError(result.error);
    else router.replace("/dashboard");
  }

  function handleDemo() {
    signInDemo(demoRole);
    router.replace("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f4f6f4] p-0 lg:p-4">
      <div className="mx-auto grid min-h-screen max-w-[1500px] overflow-hidden bg-white shadow-2xl shadow-emerald-950/10 lg:min-h-[calc(100vh-2rem)] lg:grid-cols-[1.05fr_.95fr] lg:rounded-[28px]">
        <section className="subtle-grid relative hidden overflow-hidden bg-[#073c31] px-14 py-12 text-white lg:flex lg:flex-col xl:px-20">
          <div className="absolute -right-32 -top-36 size-[440px] rounded-full border border-white/10 bg-[#1c725d]/35 blur-sm" />
          <div className="absolute -bottom-52 -left-44 size-[560px] rounded-full border-[90px] border-[#d5aa56]/10" />
          <div className="absolute left-[52%] top-[24%] size-24 rounded-full bg-[#d5aa56]/10 blur-2xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-44 items-center justify-center overflow-hidden rounded-xl bg-black/15 px-3 ring-1 ring-white/10">
              <Image src="/ce-voyage-logo.webp" alt="Ce Voyage" width={300} height={112} priority className="h-auto w-full" />
            </div>
            <span className="h-7 w-px bg-white/20" />
            <div>
              <p className="text-xs font-bold tracking-[.18em] text-white/85">OPERATIONS</p>
              <p className="text-[10px] tracking-wide text-emerald-100/55">BUSINESS WORKSPACE</p>
            </div>
          </div>

          <div className="relative z-10 my-auto max-w-xl pb-2 pt-20">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#e3bf72]/25 bg-[#d5aa56]/10 px-3 py-1.5 text-xs font-semibold text-[#f1d79e]">
              <Sparkles className="size-3.5" /> One team. Every journey.
            </div>
            <h1 className="display-serif max-w-lg text-[3.6rem] leading-[1.04] tracking-[-.035em] text-white xl:text-[4.25rem]">
              Run every journey with <span className="text-[#e0ba6e]">confidence.</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-emerald-50/68">
              A single command centre for guest inquiries, confirmed tours, drivers, fleet and business performance.
            </p>

            <div className="relative mt-12 h-[180px] max-w-lg">
              <div className="absolute left-4 right-3 top-1/2 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
              <div className="absolute left-12 top-6 flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
                <MapPin className="size-5 text-[#e3bd70]" />
              </div>
              <div className="absolute left-[42%] top-[94px] flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
                <Compass className="size-5 text-emerald-200" />
              </div>
              <div className="absolute right-10 top-4 flex size-12 items-center justify-center rounded-2xl border border-[#e0b96b]/25 bg-[#d5aa56]/15 backdrop-blur">
                <BarChart3 className="size-5 text-[#efcf91]" />
              </div>
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 180" fill="none" aria-hidden="true">
                <path d="M60 77C130 9 184 157 258 121C339 81 371 27 458 59" stroke="rgba(213,170,86,.62)" strokeWidth="1.5" strokeDasharray="5 7" />
                <circle cx="60" cy="77" r="3" fill="#d5aa56" />
                <circle cx="258" cy="121" r="3" fill="#9dd7c8" />
                <circle cx="458" cy="59" r="3" fill="#d5aa56" />
              </svg>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-emerald-50/48">
            <span>© 2026 Ce Voyage</span>
            <span className="flex items-center gap-2"><ShieldCheck className="size-3.5" /> Secure operations portal</span>
          </div>
        </section>

        <section className="relative flex items-center justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-24">
          <div className="absolute left-6 top-7 flex items-center gap-2 lg:hidden">
            <Image src="/ce-voyage-logo.webp" alt="Ce Voyage" width={150} height={56} priority className="w-36 rounded-lg bg-[#073c31] px-2 py-1" />
          </div>

          <div className="w-full max-w-[440px] animate-enter pt-16 lg:pt-0">
            <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#ad8436]">Welcome back</p>
            <h2 className="display-serif text-[2.65rem] leading-tight tracking-[-.025em] text-[#153b32]">Sign in to your workspace</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Manage today&apos;s journeys and keep your team moving.</p>

            <form onSubmit={handleSubmit} className="mt-9 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Work email</label>
                <div className="group relative">
                  <Mail className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400 transition group-focus-within:text-emerald-700" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                    placeholder="name@ce-voyage.com"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700/50 focus:ring-4 focus:ring-emerald-700/8"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
                  <button type="button" className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">Forgot password?</button>
                </div>
                <div className="group relative">
                  <LockKeyhole className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400 transition group-focus-within:text-emerald-700" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700/50 focus:ring-4 focus:ring-emerald-700/8"
                  />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                  </button>
                </div>
              </div>

              {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-700">{error}</div>}

              <Button type="submit" size="lg" className="w-full" disabled={submitting || loading}>
                {submitting ? <LoaderCircle className="size-4 animate-spin" /> : <>Sign in securely <ArrowRight className="size-4" /></>}
              </Button>
            </form>

            {!configured && (
              <div className="mt-7 rounded-2xl border border-emerald-900/10 bg-[#f1f6f3] p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white"><Check className="size-4" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#153b32]">Explore the demo workspace</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Choose a role to preview its operations access.</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setDemoRole(role.id)}
                      className={cn(
                        "rounded-lg border px-2.5 py-2 text-left text-[11px] font-bold transition",
                        demoRole === role.id
                          ? "border-emerald-700 bg-white text-emerald-800 ring-2 ring-emerald-700/8"
                          : "border-slate-200/80 bg-white/60 text-slate-500 hover:border-slate-300",
                      )}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={handleDemo} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white text-xs font-bold text-emerald-800 ring-1 ring-slate-200 transition hover:ring-emerald-600/30">
                  Continue as {titleCase(demoRole)} <ArrowRight className="size-3.5" />
                </button>
              </div>
            )}

            <p className="mt-8 text-center text-[11px] leading-5 text-slate-400">
              Protected by Supabase Auth &amp; row-level security.<br />Need access? Contact your workspace administrator.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
