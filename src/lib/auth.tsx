import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  /** True until the persisted session has been restored on first load. */
  loading: boolean;
  /** True when the user arrived through a password-recovery email link. */
  recovery: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Keeps the profile row in sync with the auth user. Runs client-side with the
 * user's own session, so RLS guarantees it can only touch its own row.
 */
async function ensureProfile(user: User) {
  const fullName =
    (user.user_metadata?.["full_name"] as string | undefined) ??
    (user.user_metadata?.["name"] as string | undefined) ??
    null;

  await supabase
    .from("profiles")
    .upsert(
      { id: user.id, email: user.email ?? null, full_name: fullName },
      { onConflict: "id" },
    );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    let active = true;

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      setSession(nextSession);
      setLoading(false);
      if (nextSession?.user && (event === "SIGNED_IN" || event === "USER_UPDATED")) {
        // Deferred so we never block the auth callback.
        void ensureProfile(nextSession.user);
      }
      if (event === "SIGNED_OUT") setRecovery(false);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading,
    recovery,
    signOut: async () => {
      await supabase.auth.signOut();
      setSession(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
