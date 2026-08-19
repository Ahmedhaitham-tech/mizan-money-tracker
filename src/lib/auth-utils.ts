/**
 * Builds an absolute URL that respects the deployment base path (GitHub Pages
 * project sites are served from https://<user>.github.io/<repo>/), so no
 * localhost or hardcoded host ever ends up in an auth redirect.
 */
export function absoluteUrl(path = ""): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
  const suffix = path ? `/${path.replace(/^\/+/, "")}` : "/";
  return `${origin}${base}${suffix}`;
}

/**
 * TEMPORARY DIAGNOSTIC: dumps everything an auth failure carries so stalled
 * network requests can be told apart from real auth rejections. Remove once the
 * "Network error" reports are resolved.
 */
function logRawAuthError(error: unknown): void {
  try {
    const err = error as
      | (Error & { cause?: unknown; status?: unknown; code?: unknown })
      | undefined;
    console.error("[auth] raw error object:", error);
    console.error("[auth] raw error details:", {
      type: typeof error,
      name: err?.name,
      message: err?.message,
      status: (error as { status?: unknown })?.status,
      code: (error as { code?: unknown })?.code,
      cause: err?.cause,
      stack: err?.stack,
      supabaseUrl: import.meta.env["VITE_SUPABASE_URL"],
      online: typeof navigator !== "undefined" ? navigator.onLine : undefined,
      json: (() => {
        try {
          return JSON.stringify(error, Object.getOwnPropertyNames(Object(error)));
        } catch {
          return "<unserializable>";
        }
      })(),
    });
  } catch {
    // Never let diagnostics break the auth flow.
  }
}

/** Turns auth errors into messages a person can act on. */
export function authErrorMessage(error: unknown): string {
  logRawAuthError(error);

  const raw =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
  const message = raw.toLowerCase();

  if (message.includes("invalid login credentials"))
    return "That email and password combination is incorrect.";
  if (message.includes("email not confirmed"))
    return "Please verify your email address first — check your inbox for the confirmation link.";
  if (message.includes("already registered") || message.includes("already been registered"))
    return "An account with this email already exists. Try signing in instead.";
  if (message.includes("user already exists"))
    return "An account with this email already exists. Try signing in instead.";
  if (message.includes("password should be at least") || message.includes("weak password"))
    return "Please choose a stronger password (at least 8 characters).";
  if (message.includes("invalid email") || message.includes("unable to validate email"))
    return "Please enter a valid email address.";
  if (message.includes("rate limit") || message.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  if (message.includes("failed to fetch") || message.includes("network"))
    return "Network error — check your connection and try again.";
  if (message.includes("same as the old password"))
    return "Your new password must be different from your current one.";
  if (message.includes("expired") || message.includes("invalid token"))
    return "This password reset link has expired. Please request a new one.";

  return raw;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
