import { createFileRoute, Link } from "@tanstack/react-router";

import { AuthShell, Field, SubmitButton, GoogleButton } from "@/components/site";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — Mizan" },
      {
        name: "description",
        content: "Create a free Mizan account and start tracking your money privately in under a minute.",
      },
      { property: "og:title", content: "Create your account — Mizan" },
      {
        property: "og:description",
        content: "Free, private money tracking with budgets, goals and analytics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Free, private, and takes less than a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/signin" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
        <Field label="Full name" name="name" autoComplete="name" />
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Password" name="password" type="password" autoComplete="new-password" />
        <Field
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
        />
        <SubmitButton>Create account</SubmitButton>
      </form>
      <GoogleButton>Sign up with Google</GoogleButton>
      <p className="mt-5 text-center text-xs text-muted-foreground">
        Mizan never asks for card numbers, CVV, PINs or banking passwords.
      </p>
    </AuthShell>
  );
}
