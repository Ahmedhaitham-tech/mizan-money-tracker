import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import {
  AuthShell,
  Field,
  SubmitButton,
  GoogleButton,
} from "@/components/site";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — Mizan" },
      {
        name: "description",
        content:
          "Sign in to your Mizan account to continue to your dashboard.",
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }

    setSuccess("Sign in details are valid. Redirecting...");

    setTimeout(() => {
      navigate({ to: "/" });
    }, 1000);
  }

  function handleGoogleSignin() {
    setError("");
    setSuccess("");

    setError(
      "Google sign-in is not connected yet. Connect an authentication provider to enable it.",
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your dashboard."
      footer={
        <>
          New to Mizan?{" "}
          <Link
            to="/signup"
            className="font-semibold text-primary hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
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
          autoComplete="current-password"
          trailing={
            <button
              type="button"
              onClick={() =>
                setError("Password recovery is not connected yet.")
              }
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot password?
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

        <SubmitButton>Sign in</SubmitButton>
      </form>

      <div onClick={handleGoogleSignin}>
        <GoogleButton>Continue with Google</GoogleButton>
      </div>
    </AuthShell>
  );
}
