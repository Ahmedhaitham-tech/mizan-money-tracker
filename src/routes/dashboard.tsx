import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { RequireAuth } from "@/components/require-auth";
import { Brand, SiteFooter } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard — Mizan" },
      {
        name: "description",
        content:
          "Your private Mizan dashboard: transactions, budgets and savings goals in one place.",
      },
      { property: "og:title", content: "Your dashboard — Mizan" },
      {
        property: "og:description",
        content: "Private money tracking with transactions, budgets and savings goals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  ),
});

type Counts = { transactions: number; budgets: number; goals: number };

function Dashboard() {
  const { user, signOut } = useAuth();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;

    void (async () => {
      const [transactions, budgets, goals, profile] = await Promise.all([
        supabase.from("transactions").select("id", { count: "exact", head: true }),
        supabase.from("budgets").select("id", { count: "exact", head: true }),
        supabase.from("goals").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      ]);

      if (!active) return;
      setCounts({
        transactions: transactions.count ?? 0,
        budgets: budgets.count ?? 0,
        goals: goals.count ?? 0,
      });
      setFullName(
        profile.data?.full_name ??
          (user.user_metadata?.["full_name"] as string | undefined) ??
          null,
      );
    })();

    return () => {
      active = false;
    };
  }, [user]);

  const cards = [
    { label: "Transactions", value: counts?.transactions },
    { label: "Budgets", value: counts?.budgets },
    { label: "Savings goals", value: counts?.goals },
  ];

  return (
    <div className="hero-surface flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Brand />
          <button
            type="button"
            onClick={async () => {
              setSigningOut(true);
              await signOut();
            }}
            disabled={signingOut}
            className="rounded-lg border border-input bg-secondary px-3.5 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted disabled:opacity-60"
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        <h1 className="text-2xl font-semibold">
          Welcome back{fullName ? `, ${fullName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Signed in as {user?.email}. Everything here is private to your account.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className="panel p-6">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold">
                {card.value === undefined ? "—" : card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="panel mt-6 p-6">
          <h2 className="text-lg font-semibold">Your private ledger is ready</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Transactions, budgets and goals are stored against your account only. Nobody else can
            read or change them.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Back to overview
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
