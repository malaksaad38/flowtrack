/// <reference lib="webworker" />

/**
 * FlowTrack Service Worker
 *
 * Strategy:
 *  - App shell (HTML, CSS, JS, fonts): Cache-first with network fallback
 *  - API calls: Network-first with cache fallback (for offline reads)
 *  - Images/icons: Cache-first
 */

const CACHE_NAME = "flowtrack-v1";
const STATIC_CACHE = "flowtrack-static-v1";
const API_CACHE = "flowtrack-api-v1";

// App shell resources to precache
const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

// ──────────────────────────────────────────
// Install — precache app shell
// ──────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS).catch((err) => {
          console.warn("[SW] Precache partial failure:", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// ──────────────────────────────────────────
// Activate — clean up old caches
// ──────────────────────────────────────────

self.addEventListener("activate", (event) => {
  const currentCaches = [STATIC_CACHE, API_CACHE];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => !currentCaches.includes(name))
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ──────────────────────────────────────────
// Fetch — routing strategies
// ──────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PATCH, DELETE are handled by sync engine)
  if (request.method !== "GET") {
    return;
  }

  // Skip auth API routes — never cache these
  if (url.pathname.startsWith("/api/auth")) {
    return;
  }

  // API routes → Network first, cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Next.js internal requests and static assets → Cache first
  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/icon-") ||
    url.pathname.startsWith("/logo") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff")
  ) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Navigation requests (HTML pages) → Network first, cache fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Everything else → Network first
  event.respondWith(networkFirstStrategy(request, STATIC_CACHE));
});

// ──────────────────────────────────────────
// Caching strategies
// ──────────────────────────────────────────

async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    // Only cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed — try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If this is a navigation request, return the cached index page
    if (request.mode === "navigate") {
      const fallback = await caches.match("/");
      if (fallback) return fallback;
    }

    // Nothing in cache either — return offline response
    return new Response(
      JSON.stringify({ error: "You are offline and no cached data is available." }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response("", { status: 408 });
  }
}

// ──────────────────────────────────────────
// Background Sync (if supported)
// ──────────────────────────────────────────

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-transactions") {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "SYNC_REQUESTED" });
        });
      })
    );
  }
});

// Listen for messages from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
