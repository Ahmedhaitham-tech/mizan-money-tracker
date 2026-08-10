import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";

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

type Transaction = {
  id: string;
  type: string;
  amount: number;
  category: string | null;
  note: string | null;
  occurred_on: string;
};

type Budget = {
  id: string;
  name: string;
  category: string | null;
  amount: number;
  period: string;
};

type Goal = {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

const inputClass =
  "h-11 w-full rounded-lg border border-input bg-background/60 px-3.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";
const primaryButtonClass =
  "h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";
const ghostButtonClass =
  "rounded-lg border border-input bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60";

function Notice({ error, success }: { error?: string; success?: string }) {
  if (error) {
    return (
      <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p className="mt-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
        {success}
      </p>
    );
  }
  return null;
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="panel p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Dashboard() {
  const { user, signOut } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [fullName, setFullName] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoadError("");

    const [tx, bg, gl, profile] = await Promise.all([
      supabase
        .from("transactions")
        .select("id, type, amount, category, note, occurred_on")
        .order("occurred_on", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("budgets").select("id, name, category, amount, period").order("created_at"),
      supabase
        .from("goals")
        .select("id, name, target_amount, saved_amount, target_date")
        .order("created_at"),
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    ]);

    const firstError = tx.error || bg.error || gl.error;
    if (firstError) setLoadError(errorMessage(firstError));

    setTransactions((tx.data ?? []).map((row) => ({ ...row, amount: Number(row.amount) })));
    setBudgets((bg.data ?? []).map((row) => ({ ...row, amount: Number(row.amount) })));
    setGoals(
      (gl.data ?? []).map((row) => ({
        ...row,
        target_amount: Number(row.target_amount),
        saved_amount: Number(row.saved_amount),
      })),
    );
    setFullName(
      profile.data?.full_name ??
        (user.user_metadata?.["full_name"] as string | undefined) ??
        null,
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type !== "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const visibleTransactions = transactions.filter((t) => {
    if (filter !== "all" && (filter === "income" ? t.type !== "income" : t.type === "income")) {
      return false;
    }
    const needle = search.trim().toLowerCase();
    if (!needle) return true;
    return `${t.category ?? ""} ${t.note ?? ""}`.toLowerCase().includes(needle);
  });

  const summary = [
    { label: "Balance", value: money(income - expenses) },
    { label: "Income", value: money(income) },
    { label: "Expenses", value: money(expenses) },
    { label: "Transactions", value: String(transactions.length) },
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

        {loadError && <Notice error={loadError} />}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summary.map((card) => (
            <div key={card.label} className="panel p-6">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold">{loading ? "—" : card.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6">
          <TransactionsPanel
            userId={user?.id ?? ""}
            loading={loading}
            rows={visibleTransactions}
            filter={filter}
            setFilter={setFilter}
            search={search}
            setSearch={setSearch}
            reload={load}
          />
          <BudgetsPanel
            userId={user?.id ?? ""}
            loading={loading}
            rows={budgets}
            transactions={transactions}
            reload={load}
          />
          <GoalsPanel userId={user?.id ?? ""} loading={loading} rows={goals} reload={load} />
        </div>

        <div className="panel mt-6 p-6">
          <h2 className="text-lg font-semibold">Your private ledger</h2>
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

/* ---------------------------------- transactions --------------------------------- */

function TransactionsPanel({
  userId,
  loading,
  rows,
  filter,
  setFilter,
  search,
  setSearch,
  reload,
}: {
  userId: string;
  loading: boolean;
  rows: Transaction[];
  filter: "all" | "income" | "expense";
  setFilter: (value: "all" | "income" | "expense") => void;
  search: string;
  setSearch: (value: string) => void;
  reload: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);

    const amount = Number(data.get("amount"));
    const type = String(data.get("type") || "expense");
    const category = String(data.get("category") || "").trim();
    const note = String(data.get("note") || "").trim();
    const occurred_on = String(data.get("occurred_on") || today());

    setError("");
    setSuccess("");

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!category) {
      setError("Please add a category.");
      return;
    }

    setPending("save");
    const payload = { type, amount, category, note: note || null, occurred_on };

    const { error: writeError } = editing
      ? await supabase.from("transactions").update(payload).eq("id", editing.id)
      : await supabase.from("transactions").insert({ ...payload, user_id: userId });

    setPending(null);

    if (writeError) {
      setError(errorMessage(writeError));
      return;
    }

    setSuccess(editing ? "Transaction updated." : "Transaction added.");
    setEditing(null);
    form.reset();
    await reload();
  }

  async function handleDelete(id: string) {
    if (pending) return;
    setError("");
    setSuccess("");
    setPending(`delete-${id}`);
    const { error: deleteError } = await supabase.from("transactions").delete().eq("id", id);
    setPending(null);
    if (deleteError) {
      setError(errorMessage(deleteError));
      return;
    }
    if (editing?.id === id) setEditing(null);
    setSuccess("Transaction deleted.");
    await reload();
  }

  return (
    <Panel
      title="Transactions"
      description="Record income and expenses. Everything is saved to your account."
    >
      <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6" onSubmit={handleSubmit}>
        <select
          key={`type-${editing?.id ?? "new"}`}
          name="type"
          defaultValue={editing?.type ?? "expense"}
          className={inputClass}
          aria-label="Transaction type"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input
          key={`amount-${editing?.id ?? "new"}`}
          name="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="Amount"
          defaultValue={editing?.amount ?? ""}
          className={inputClass}
          aria-label="Amount"
        />
        <input
          key={`category-${editing?.id ?? "new"}`}
          name="category"
          placeholder="Category"
          defaultValue={editing?.category ?? ""}
          className={inputClass}
          aria-label="Category"
        />
        <input
          key={`note-${editing?.id ?? "new"}`}
          name="note"
          placeholder="Note (optional)"
          defaultValue={editing?.note ?? ""}
          className={inputClass}
          aria-label="Note"
        />
        <input
          key={`date-${editing?.id ?? "new"}`}
          name="occurred_on"
          type="date"
          defaultValue={editing?.occurred_on ?? today()}
          className={inputClass}
          aria-label="Date"
        />
        <div className="flex gap-2">
          <button type="submit" disabled={pending !== null} className={`${primaryButtonClass} flex-1`}>
            {pending === "save" ? "Saving..." : editing ? "Save" : "Add"}
          </button>
          {editing && (
            <button type="button" onClick={() => setEditing(null)} className={ghostButtonClass}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <Notice error={error} success={success} />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {(["all", "income", "expense"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={`${ghostButtonClass} ${filter === option ? "bg-muted" : ""}`}
          >
            {option === "all" ? "All" : option === "income" ? "Income" : "Expenses"}
          </button>
        ))}
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search category or note"
          className={`${inputClass} sm:max-w-xs`}
          aria-label="Search transactions"
        />
      </div>

      <div className="mt-4 space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading your transactions...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No transactions yet. Add your first one above.
          </p>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {row.category ?? "Uncategorised"}
                  <span className="ml-2 text-xs text-muted-foreground">{row.occurred_on}</span>
                </p>
                {row.note && (
                  <p className="truncate text-xs text-muted-foreground">{row.note}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">
                  {row.type === "income" ? "+" : "−"}
                  {money(row.amount)}
                </span>
                <button type="button" onClick={() => setEditing(row)} className={ghostButtonClass}>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(row.id)}
                  disabled={pending === `delete-${row.id}`}
                  className={ghostButtonClass}
                >
                  {pending === `delete-${row.id}` ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}

/* ------------------------------------ budgets ------------------------------------ */

function BudgetsPanel({
  userId,
  loading,
  rows,
  transactions,
  reload,
}: {
  userId: string;
  loading: boolean;
  rows: Budget[];
  transactions: Transaction[];
  reload: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<Budget | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") || "").trim();
    const category = String(data.get("category") || "").trim();
    const amount = Number(data.get("amount"));
    const period = String(data.get("period") || "monthly");

    setError("");
    setSuccess("");

    if (!name) {
      setError("Please name this budget.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a budget amount greater than zero.");
      return;
    }

    setPending("save");
    const payload = { name, category: category || null, amount, period };
    const { error: writeError } = editing
      ? await supabase.from("budgets").update(payload).eq("id", editing.id)
      : await supabase.from("budgets").insert({ ...payload, user_id: userId });
    setPending(null);

    if (writeError) {
      setError(errorMessage(writeError));
      return;
    }
    setSuccess(editing ? "Budget updated." : "Budget added.");
    setEditing(null);
    form.reset();
    await reload();
  }

  async function handleDelete(id: string) {
    if (pending) return;
    setError("");
    setSuccess("");
    setPending(`delete-${id}`);
    const { error: deleteError } = await supabase.from("budgets").delete().eq("id", id);
    setPending(null);
    if (deleteError) {
      setError(errorMessage(deleteError));
      return;
    }
    if (editing?.id === id) setEditing(null);
    setSuccess("Budget deleted.");
    await reload();
  }

  function spentFor(budget: Budget) {
    if (!budget.category) return 0;
    const needle = budget.category.toLowerCase();
    return transactions
      .filter((t) => t.type !== "income" && (t.category ?? "").toLowerCase() === needle)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  return (
    <Panel
      title="Budgets"
      description="Set spending limits per category and track how much you've used."
    >
      <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" onSubmit={handleSubmit}>
        <input
          key={`name-${editing?.id ?? "new"}`}
          name="name"
          placeholder="Budget name"
          defaultValue={editing?.name ?? ""}
          className={inputClass}
          aria-label="Budget name"
        />
        <input
          key={`bcategory-${editing?.id ?? "new"}`}
          name="category"
          placeholder="Category (optional)"
          defaultValue={editing?.category ?? ""}
          className={inputClass}
          aria-label="Budget category"
        />
        <input
          key={`bamount-${editing?.id ?? "new"}`}
          name="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="Limit"
          defaultValue={editing?.amount ?? ""}
          className={inputClass}
          aria-label="Budget limit"
        />
        <select
          key={`period-${editing?.id ?? "new"}`}
          name="period"
          defaultValue={editing?.period ?? "monthly"}
          className={inputClass}
          aria-label="Budget period"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <div className="flex gap-2">
          <button type="submit" disabled={pending !== null} className={`${primaryButtonClass} flex-1`}>
            {pending === "save" ? "Saving..." : editing ? "Save" : "Add"}
          </button>
          {editing && (
            <button type="button" onClick={() => setEditing(null)} className={ghostButtonClass}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <Notice error={error} success={success} />

      <div className="mt-5 space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading your budgets...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No budgets yet. Add one above.</p>
        ) : (
          rows.map((row) => {
            const spent = spentFor(row);
            const percent = Math.min(100, Math.round((spent / row.amount) * 100));
            return (
              <div key={row.id} className="rounded-lg border border-border/70 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.category ?? "All categories"} · {row.period}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      {money(spent)} / {money(row.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditing(row)}
                      className={ghostButtonClass}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(row.id)}
                      disabled={pending === `delete-${row.id}`}
                      className={ghostButtonClass}
                    >
                      {pending === `delete-${row.id}` ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Panel>
  );
}

/* ------------------------------------- goals ------------------------------------- */

function GoalsPanel({
  userId,
  loading,
  rows,
  reload,
}: {
  userId: string;
  loading: boolean;
  rows: Goal[];
  reload: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<Goal | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") || "").trim();
    const target_amount = Number(data.get("target_amount"));
    const saved_amount = Number(data.get("saved_amount") || 0);
    const target_date = String(data.get("target_date") || "");

    setError("");
    setSuccess("");

    if (!name) {
      setError("Please name this goal.");
      return;
    }
    if (!Number.isFinite(target_amount) || target_amount <= 0) {
      setError("Enter a target amount greater than zero.");
      return;
    }
    if (!Number.isFinite(saved_amount) || saved_amount < 0) {
      setError("Saved amount can't be negative.");
      return;
    }

    setPending("save");
    const payload = {
      name,
      target_amount,
      saved_amount,
      target_date: target_date || null,
    };
    const { error: writeError } = editing
      ? await supabase.from("goals").update(payload).eq("id", editing.id)
      : await supabase.from("goals").insert({ ...payload, user_id: userId });
    setPending(null);

    if (writeError) {
      setError(errorMessage(writeError));
      return;
    }
    setSuccess(editing ? "Goal updated." : "Goal added.");
    setEditing(null);
    form.reset();
    await reload();
  }

  async function handleDelete(id: string) {
    if (pending) return;
    setError("");
    setSuccess("");
    setPending(`delete-${id}`);
    const { error: deleteError } = await supabase.from("goals").delete().eq("id", id);
    setPending(null);
    if (deleteError) {
      setError(errorMessage(deleteError));
      return;
    }
    if (editing?.id === id) setEditing(null);
    setSuccess("Goal deleted.");
    await reload();
  }

  return (
    <Panel title="Savings goals" description="Track what you're saving for and how far along you are.">
      <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" onSubmit={handleSubmit}>
        <input
          key={`gname-${editing?.id ?? "new"}`}
          name="name"
          placeholder="Goal name"
          defaultValue={editing?.name ?? ""}
          className={inputClass}
          aria-label="Goal name"
        />
        <input
          key={`gtarget-${editing?.id ?? "new"}`}
          name="target_amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="Target amount"
          defaultValue={editing?.target_amount ?? ""}
          className={inputClass}
          aria-label="Target amount"
        />
        <input
          key={`gsaved-${editing?.id ?? "new"}`}
          name="saved_amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="Saved so far"
          defaultValue={editing?.saved_amount ?? ""}
          className={inputClass}
          aria-label="Saved so far"
        />
        <input
          key={`gdate-${editing?.id ?? "new"}`}
          name="target_date"
          type="date"
          defaultValue={editing?.target_date ?? ""}
          className={inputClass}
          aria-label="Target date"
        />
        <div className="flex gap-2">
          <button type="submit" disabled={pending !== null} className={`${primaryButtonClass} flex-1`}>
            {pending === "save" ? "Saving..." : editing ? "Save" : "Add"}
          </button>
          {editing && (
            <button type="button" onClick={() => setEditing(null)} className={ghostButtonClass}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <Notice error={error} success={success} />

      <div className="mt-5 space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading your goals...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No goals yet. Add one above.</p>
        ) : (
          rows.map((row) => {
            const percent = Math.min(100, Math.round((row.saved_amount / row.target_amount) * 100));
            return (
              <div key={row.id} className="rounded-lg border border-border/70 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.target_date ? `Target ${row.target_date}` : "No target date"} · {percent}%
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      {money(row.saved_amount)} / {money(row.target_amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditing(row)}
                      className={ghostButtonClass}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(row.id)}
                      disabled={pending === `delete-${row.id}`}
                      className={ghostButtonClass}
                    >
                      {pending === `delete-${row.id}` ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Panel>
  );
}
