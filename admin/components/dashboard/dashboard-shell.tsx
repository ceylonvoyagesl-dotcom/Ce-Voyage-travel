"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  BookOpenCheck,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  CircleUserRound,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  PanelLeftClose,
  Search,
  Settings2,
  ShieldCheck,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import { cn, initials, titleCase } from "@/lib/utils";
import type { UserRole } from "@/types";

const allRoles: UserRole[] = ["super_admin", "operations_manager", "finance_hr", "dispatcher"];

const navGroups = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: allRoles },
      { label: "Inquiries", href: "/inquiries", icon: ClipboardList, badge: "8", roles: ["super_admin", "operations_manager", "dispatcher"] as UserRole[] },
      { label: "Bookings", href: "/bookings", icon: BookOpenCheck, roles: allRoles },
      { label: "Calendar", href: "/dashboard#calendar", icon: CalendarDays, roles: allRoles },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Fleet & dispatch", href: "/fleet", icon: PanelLeftClose, roles: ["super_admin", "operations_manager", "dispatcher"] as UserRole[] },
      { label: "Staff & HR", href: "/staff", icon: UsersRound, roles: ["super_admin", "finance_hr"] as UserRole[] },
      { label: "Finance", href: "/finance", icon: WalletCards, roles: ["super_admin", "finance_hr"] as UserRole[] },
      { label: "Reports", href: "/dashboard#reports", icon: BarChart3, roles: ["super_admin", "operations_manager", "finance_hr"] as UserRole[] },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Website content", href: "/content", icon: FileText, roles: ["super_admin", "operations_manager"] as UserRole[] },
      { label: "Settings", href: "/content#settings", icon: Settings2, roles: ["super_admin"] as UserRole[] },
    ],
  },
];

const routeAccess: Record<string, UserRole[]> = {
  "/dashboard": allRoles,
  "/inquiries": ["super_admin", "operations_manager", "dispatcher"],
  "/bookings": allRoles,
  "/fleet": ["super_admin", "operations_manager", "dispatcher"],
  "/staff": ["super_admin", "finance_hr"],
  "/finance": ["super_admin", "finance_hr"],
  "/content": ["super_admin", "operations_manager"],
};

const routeTitles: Record<string, { title: string; eyebrow: string }> = {
  "/dashboard": { title: "Good morning", eyebrow: "Operations overview" },
  "/inquiries": { title: "Inquiries hub", eyebrow: "Sales pipeline" },
  "/bookings": { title: "Bookings", eyebrow: "Guest journeys" },
  "/fleet": { title: "Fleet & dispatch", eyebrow: "Operations" },
  "/staff": { title: "Staff & HR", eyebrow: "People operations" },
  "/finance": { title: "Finance", eyebrow: "Accounts & billing" },
  "/content": { title: "Website content", eyebrow: "Content management" },
};

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading, configured, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const route = routeTitles[pathname] ?? routeTitles["/dashboard"];

  useEffect(() => {
    if (!loading && !profile) router.replace("/login");
  }, [loading, profile, router]);

  const availableGroups = useMemo(() => {
    if (!profile) return [];
    return navGroups
      .map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(profile.role)) }))
      .filter((group) => group.items.length > 0);
  }, [profile]);

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f6]">
        <div className="text-center">
          <div className="mx-auto size-9 animate-spin rounded-full border-[3px] border-emerald-800/20 border-t-emerald-700" />
          <p className="mt-3 text-xs font-semibold tracking-wide text-slate-500">OPENING WORKSPACE</p>
        </div>
      </div>
    );
  }

  const canAccessRoute = (routeAccess[pathname] ?? allRoles).includes(profile.role);

  const sidebar = (
    <div className="flex h-full flex-col bg-[#082f29] text-white">
      <div className="flex h-[78px] items-center border-b border-white/8 px-5">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          <Image src="/ce-voyage-logo.webp" width={150} height={56} alt="Ce Voyage" priority className="h-auto w-[132px]" />
          <span className="h-7 w-px shrink-0 bg-white/15" />
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold tracking-[.18em] text-[#e2bd72]">OPS</p>
            <p className="truncate text-[9px] tracking-wide text-emerald-100/45">WORKSPACE</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {availableGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[.18em] text-emerald-100/35">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = item.href.split("#")[0] === pathname;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => { setMobileOpen(false); setProfileOpen(false); }}
                    className={cn(
                      "group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition",
                      active
                        ? "bg-white/[.105] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.045)]"
                        : "text-emerald-50/57 hover:bg-white/[.055] hover:text-white",
                    )}
                  >
                    {active && <span className="absolute -left-3 h-5 w-[3px] rounded-r-full bg-[#d9ad58]" />}
                    <Icon className={cn("size-[17px]", active ? "text-[#dfba70]" : "text-emerald-100/45 group-hover:text-emerald-100/75")} strokeWidth={1.8} />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.badge && <span className="rounded-full bg-[#d5aa56] px-1.5 py-0.5 text-[9px] font-black text-[#19362f]">{item.badge}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3">
        {!configured && (
          <div className="mb-3 rounded-xl border border-[#d5aa56]/15 bg-[#d5aa56]/8 p-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#e4c581]"><ShieldCheck className="size-3.5" /> Demo mode</div>
            <p className="mt-1.5 text-[10px] leading-4 text-emerald-50/42">Connect Supabase to use live operations data.</p>
          </div>
        )}
        <button className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-xs font-semibold text-emerald-50/52 hover:bg-white/5 hover:text-white">
          <CircleHelp className="size-[17px]" /> Help &amp; support
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f7f6]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[244px] xl:block">{sidebar}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[270px] animate-enter shadow-2xl">
            {sidebar}
            <button aria-label="Close menu" className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-lg bg-white/10 text-white" onClick={() => setMobileOpen(false)}><X className="size-4" /></button>
          </aside>
        </div>
      )}

      <div className="xl:pl-[244px]">
        <header className="sticky top-0 z-30 flex h-[78px] items-center border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <button className="mr-3 flex size-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 xl:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu className="size-5" /></button>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#ad8436]">{route.eyebrow}</p>
            <h1 className="mt-0.5 truncate text-lg font-bold tracking-[-.02em] text-[#173b32]">
              {route.title}{pathname === "/dashboard" ? `, ${profile.full_name.split(" ")[0]}` : ""}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input placeholder="Search anything…" className="h-10 w-48 rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3 text-xs outline-none transition focus:w-56 focus:border-emerald-700/30 focus:bg-white focus:ring-4 focus:ring-emerald-700/5" />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">⌘K</span>
            </div>
            <button className="relative flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800" aria-label="Notifications">
              <Bell className="size-[17px]" />
              <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-[#d4a347]" />
            </button>
            <span className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="relative">
              <button onClick={() => setProfileOpen((value) => !value)} className="flex h-11 items-center gap-2 rounded-xl p-1.5 pr-2 transition hover:bg-slate-50">
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#e7f0ec] text-[11px] font-black text-emerald-800 ring-1 ring-emerald-900/8">{initials(profile.full_name)}</span>
                <span className="hidden text-left md:block">
                  <span className="block max-w-28 truncate text-xs font-bold text-slate-700">{profile.full_name}</span>
                  <span className="block text-[9px] font-semibold text-slate-400">{titleCase(profile.role)}</span>
                </span>
                <ChevronDown className="hidden size-3.5 text-slate-400 md:block" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-56 animate-enter rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
                  <div className="border-b border-slate-100 px-3 py-2.5">
                    <p className="truncate text-xs font-bold text-slate-800">{profile.email}</p>
                    <Badge tone="emerald" className="mt-2">{titleCase(profile.role)}</Badge>
                  </div>
                  <button className="mt-1 flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"><CircleUserRound className="size-4" /> My profile</button>
                  <button onClick={handleSignOut} className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50"><LogOut className="size-4" /> Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1580px] p-4 sm:p-6 lg:p-8">
          {canAccessRoute ? children : (
            <div className="flex min-h-[65vh] items-center justify-center animate-fade">
              <div className="card max-w-md px-7 py-9 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><LockKeyhole className="size-5" /></span>
                <h2 className="mt-5 text-lg font-extrabold text-[#173c32]">This area is restricted</h2>
                <p className="mt-2 text-xs leading-5 text-slate-500">Your {titleCase(profile.role)} role does not include access to this module. Ask a Super Admin if your responsibilities have changed.</p>
                <Link href="/dashboard" className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#0b513f] px-4 text-xs font-bold text-white">Return to overview</Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
