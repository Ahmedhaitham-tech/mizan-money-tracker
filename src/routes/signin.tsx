import { createFileRoute, Link } from "@tanstack/react-router";

import { AuthShell, Field, SubmitButton, GoogleButton } from "@/components/site";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — Mizan" },
      { name: "description", content: "Sign in to your Mizan account to continue to your dashboard." },
      { property: "og:title", content: "Sign in — Mizan" },
      { property: "og:description", content: "Sign in to continue to your private Mizan dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignIn,
});

function SignIn() {
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
      <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          trailing={
            <span className="text-xs text-muted-foreground hover:text-foreground">
              Forgot password?
            </span>
          }
        />
        <SubmitButton>Sign in</SubmitButton>
      </form>
      <GoogleButton>Continue with Google</GoogleButton>
    </AuthShell>
  );
}
