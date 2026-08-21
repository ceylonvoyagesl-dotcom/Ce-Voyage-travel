"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Profile, UserRole } from "@/types";

type AuthContextValue = {
  profile: Profile | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInDemo: (role?: UserRole) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const demoProfiles: Record<UserRole, Profile> = {
  super_admin: {
    id: "demo-super-admin",
    full_name: "Ayesh Fernando",
    email: "admin@ce-voyage.com",
    role: "super_admin",
  },
  operations_manager: {
    id: "demo-operations",
    full_name: "Nadeesha Perera",
    email: "operations@ce-voyage.com",
    role: "operations_manager",
  },
  finance_hr: {
    id: "demo-finance",
    full_name: "Ishara Silva",
    email: "finance@ce-voyage.com",
    role: "finance_hr",
  },
  dispatcher: {
    id: "demo-dispatcher",
    full_name: "Kasun Silva",
    email: "dispatch@ce-voyage.com",
    role: "dispatcher",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string, email = "") => {
    if (!supabase) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (data) {
      setProfile(data as Profile);
      return;
    }

    setProfile({
      id: userId,
      full_name: email.split("@")[0] || "Ce Voyage User",
      email,
      role: "dispatcher",
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initialise() {
      if (!supabase) {
        const storedRole = window.localStorage.getItem("cv-demo-role") as UserRole | null;
        if (mounted && storedRole && demoProfiles[storedRole]) {
          setProfile(demoProfiles[storedRole]);
        }
        if (mounted) setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session?.user && mounted) {
        await loadProfile(data.session.user.id, data.session.user.email);
      }
      if (mounted) setLoading(false);
    }

    initialise();

    const { data: listener } = supabase?.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void loadProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
      }
    }) ?? { data: { subscription: null } };

    return () => {
      mounted = false;
      listener.subscription?.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { error: "Supabase is not configured. Use the secure demo workspace below." };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  }, []);

  const signInDemo = useCallback((role: UserRole = "operations_manager") => {
    window.localStorage.setItem("cv-demo-role", role);
    setProfile(demoProfiles[role]);
  }, []);

  const signOut = useCallback(async () => {
    window.localStorage.removeItem("cv-demo-role");
    if (supabase) await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({ profile, loading, configured: isSupabaseConfigured, signIn, signInDemo, signOut }),
    [profile, loading, signIn, signInDemo, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
