import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import {
  AuthShell,
  Field,
  SubmitButton,
} from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import {
  EMAIL_PATTERN,
  absoluteUrl,
  authErrorMessage,
} from "@/lib/auth-utils";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — Mizan" },
      {
        name: "description",
        content:
          "Create a free Mizan account and start tracking your money privately in under a minute.",
      },
      {
        property: "og:title",
        content: "Create your account — Mizan",
      },
      {
        property: "og:description",
        content:
          "Free, private money tracking with budgets, goals and analytics.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState<"signup" | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) return;

    // Save the form reference BEFORE the async Supabase request.
    // This prevents the "reading 'reset' of null" error.
    const form = event.currentTarget;

    setError("");
    setSuccess("");

    const formData = new FormData(form);

    const name = String(formData.get("name") || "").trim();

    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();

    const password = String(formData.get("password") || "");

    const confirmPassword = String(
      formData.get("confirmPassword") || "",
    );

    // Required fields
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    // Email validation
    if (!EMAIL_PATTERN.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Password validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // Password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending("signup");

    try {
      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: absoluteUrl("signin"),
            data: {
              full_name: name,
            },
          },
        });

      // Supabase returned an authentication error.
      if (signUpError) {
        setError(authErrorMessage(signUpError));
        return;
      }

      // If a session exists immediately, the user is already authenticated.
      if (data.session) {
        setSuccess(
          "Account created successfully. Redirecting to your dashboard...",
        );

        navigate({
          to: "/dashboard",
        });

        return;
      }

      // No session normally means email confirmation is required.
      setSuccess(
        `Account created for ${email}. Check your inbox and click the verification link, then sign in.`,
      );

      // Safe because the form was saved before the async request.
      form.reset();
    } catch (unknownError) {
      setError(authErrorMessage(unknownError));
    } finally {
      setPending(null);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free, private, and takes less than a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        <Field
          label="Full name"
          name="name"
          autoComplete="name"
        />

        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
        />

        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
        />

        <Field
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
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
          {pending === "signup"
            ? "Creating account..."
            : "Create account"}
        </SubmitButton>
      </form>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Mizan never asks for card numbers, CVV, PINs or banking passwords.
      </p>
    </AuthShell>
  );
}
