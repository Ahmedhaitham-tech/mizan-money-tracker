import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/lib/auth";

/**
 * Client-side auth gate. The app ships as a static GitHub Pages bundle, so the
 * session lives only in the browser — the guard therefore runs after hydration
 * and sends signed-out visitors to /signin.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/signin", replace: true });
    }
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="hero-surface flex min-h-screen items-center justify-center px-5">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading your account..." : "Redirecting to sign in..."}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
