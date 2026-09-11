// Deliberately does NOT cache anything. This app has been bitten before by
// stale cached builds after deploys — this worker exists only to satisfy
// PWA "installable" requirements in some browsers, and always lets every
// request pass straight through to the network.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Intentionally no-op: always fall through to normal network fetching.
});
