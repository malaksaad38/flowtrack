/**
 * Service Worker registration utility.
 * Call once from a client component at app startup.
 */

export async function registerServiceWorker(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "activated" &&
          navigator.serviceWorker.controller
        ) {
          // New service worker activated — could show update prompt
          console.log("[SW] New service worker activated");
        }
      });
    });

    console.log("[SW] Service worker registered:", registration.scope);
  } catch (error) {
    console.error("[SW] Registration failed:", error);
  }
}
