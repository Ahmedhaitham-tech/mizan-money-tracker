import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, CreditCard, Target, ShieldCheck } from "lucide-react";

import { SiteHeader, SiteFooter } from "@/components/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mizan — Private Personal Finance Tracking" },
      {
        name: "description",
        content:
          "Track income, expenses, transfers, credit cards and savings goals in one private, beautifully designed dashboard.",
      },
      { property: "og:title", content: "Mizan — Private Personal Finance Tracking" },
      {
        property: "og:description",
        content:
          "Manual, private money tracking with budgets, goals and analytics. No bank logins, no card numbers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  {
    icon: Wallet,
    title: "Every account, one balance",
    body: "Cash, debit, credit and Telda wallets tracked side by side with instant totals.",
  },
  {
    icon: CreditCard,
    title: "Credit handled properly",
    body: "Purchases raise your balance owed; payments clear it and debit the source account.",
  },
  {
    icon: Target,
    title: "Budgets and goals that move",
    body: "Live spending breakdowns, budget progress and savings goals that update as you type.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "No bank logins, no card numbers, no CVV. Your data is locked to your account only.",
  },
];

function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="hero-surface border-b border-border/70">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:py-28">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Personal finance, measured
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] sm:text-6xl">
              Know exactly where your money stands, every single day.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Mizan is a manual money tracker for people who want clarity without handing over bank
              credentials. Log it once, see it everywhere.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Create your account
              </Link>
              <Link
                to="/signin"
                className="rounded-xl border border-input bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-muted"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-20">
          <div className="grid gap-5 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, body }) => (
              <article key={title} className="panel p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-accent text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
