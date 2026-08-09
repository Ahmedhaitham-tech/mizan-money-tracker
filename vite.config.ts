// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages project sites are served from https://<user>.github.io/<repo>/, so the
// bundle must be built with that sub-path as its base. The Pages workflow sets
// BASE_PATH=/<repo>/ automatically; locally and on Lovable hosting it stays "/".
const requestedBasePath = process.env["BASE_PATH"] ?? "/";
const basePath = `/${requestedBasePath.replace(/^\/+|\/+$/g, "")}${requestedBasePath === "/" ? "" : "/"}`;
const isStaticBuild = process.env["STATIC_BUILD"] === "true";

export default defineConfig({
  // The static export needs Start's plain server build (dist/server/server.js) for
  // the prerender pass; nitro's worker bundle is irrelevant for GitHub Pages.
  ...(isStaticBuild ? { nitro: false as const } : {}),
  vite: {
    base: basePath,
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this. Skipped for the static export: the prerender
    // preview server resolves the default entry name.
    ...(isStaticBuild ? {} : { server: { entry: "server" } }),
    // Static export for GitHub Pages: prerender every route to HTML and ship an
    // SPA fallback so client-side routing works on deep links / refreshes.
    ...(isStaticBuild
      ? {
          spa: { enabled: true },
          prerender: { enabled: true, crawlLinks: true },
          pages: [
            { path: "/" },
            { path: "/signin" },
            { path: "/signup" },
            { path: "/reset-password" },
            { path: "/dashboard" },
          ],
        }
      : {}),
  },
});
