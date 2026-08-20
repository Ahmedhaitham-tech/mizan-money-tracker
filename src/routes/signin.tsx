import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AuthShell, Field, SubmitButton, GoogleButton } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { EMAIL_PATTERN, absoluteUrl, authErrorMessage } from "@/lib/auth-utils";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — Mizan" },
      {
        name: "description",
        content: "Sign in to your Mizan account to continue to your dashboard.",
      },
      { property: "og:title", content: "Sign in — Mizan" },
      {
        property: "og:description",
        content: "Sign in to continue to your private Mizan dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState<"password" | "google" | "reset" | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!EMAIL_PATTERN.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setPending("password");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(authErrorMessage(signInError));
        return;
      }

      if (!data.session) {
        setError("We couldn't start your session. Please try again.");
        return;
      }

      setSuccess("Signed in. Redirecting to your dashboard...");
      navigate({ to: "/dashboard" });
    } catch (unknownError) {
      setError(authErrorMessage(unknownError));
    } finally {
      setPending(null);
    }
  }

  async function handleGoogleSignin() {
    if (pending) return;
    setError("");
    setSuccess("");
    setPending("google");

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: absoluteUrl("dashboard") },
      });

      if (googleError) {
        setError(authErrorMessage(googleError));
        setPending(null);
        return;
      }
      // Supabase performs the browser redirect to Google.
    } catch (unknownError) {
      setError(authErrorMessage(unknownError));
      setPending(null);
    }
  }

  async function handleForgotPassword() {
    if (pending) return;
    setError("");
    setSuccess("");

    const email = String(
      (document.getElementById("email") as HTMLInputElement | null)?.value || "",
    ).trim();

    if (!email || !EMAIL_PATTERN.test(email)) {
      setError("Enter your email address above, then select “Forgot password?” again.");
      return;
    }

    setPending("reset");

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: absoluteUrl("reset-password"),
      });

      if (resetError) {
        setError(authErrorMessage(resetError));
        return;
      }

      setSuccess(`We've sent a password reset link to ${email}. Check your inbox.`);
    } catch (unknownError) {
      setError(authErrorMessage(unknownError));
    } finally {
      setPending(null);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your dashboard."
      footer={
        <>
          New to Mizan?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Email" name="email" type="email" autoComplete="email" />

        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          trailing={
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={pending !== null}
              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-60"
            >
              {pending === "reset" ? "Sending link..." : "Forgot password?"}
            </button>
          }
        />

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
            {success}
          </p>
        )}

        <SubmitButton disabled={pending !== null}>
          {pending === "password" ? "Signing in..." : "Sign in"}
        </SubmitButton>
      </form>

      <GoogleButton onClick={handleGoogleSignin} disabled={pending !== null}>
        {pending === "google" ? "Connecting to Google..." : "Continue with Google"}
      </GoogleButton>
    </AuthShell>
  );
}
