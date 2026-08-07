import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-primary font-display text-base font-bold text-primary-foreground">
        M
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">Mizan</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Brand />
        <nav className="flex items-center gap-2">
          <Link
            to="/signin"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Mizan never asks for card numbers, CVV, PINs or banking passwords.</p>
        <p>&copy; {new Date().getFullYear()} Mizan</p>
      </div>
    </footer>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="hero-surface flex min-h-screen flex-col">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-5">
        <Brand />
      </div>
      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="panel w-full max-w-md p-7">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </main>
    </div>
  );
}

export function Field({
  label,
  type = "text",
  name,
  autoComplete,
  trailing,
}: {
  label: string;
  type?: string;
  name: string;
  autoComplete?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={name} className="text-sm font-medium">
          {label} <span className="text-primary">*</span>
        </label>
        {trailing}
      </div>
      <input
        id={name}
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        className="h-11 w-full rounded-lg border border-input bg-background/60 px-3.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
    >
      {children}
    </button>
  );
}

export function GoogleButton({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <button
        type="button"
        className="h-11 w-full rounded-lg border border-input bg-secondary text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted"
      >
        {children}
      </button>
    </>
  );
}
