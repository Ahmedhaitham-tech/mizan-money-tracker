import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AuthShell, Field, SubmitButton } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage } from "@/lib/auth-utils";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Mizan" },
      {
        name: "description",
        content: "Choose a new password for your Mizan account and get back to your dashboard.",
      },
      { property: "og:title", content: "Set a new password — Mizan" },
      {
        property: "og:description",
        content: "Complete your Mizan password reset and sign back in securely.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(authErrorMessage(updateError));
        return;
      }

      setSuccess("Your password has been updated. Redirecting to your dashboard...");
      navigate({ to: "/dashboard" });
    } catch (unknownError) {
      setError(authErrorMessage(unknownError));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a new password for your Mizan account."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/signin" className="font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Checking your reset link...</p>
      ) : !session ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          This password reset link is invalid or has expired. Request a new one from the sign-in
          page.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
          />

          <Field
            label="Confirm new password"
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

          <SubmitButton disabled={pending}>
            {pending ? "Updating password..." : "Update password"}
          </SubmitButton>
        </form>
      )}
    </AuthShell>
  );
}
