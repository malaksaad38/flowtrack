"use client";

import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import { PropsWithChildren, useState, useEffect } from "react";

export function QueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            // Don't throw errors for failed fetches when offline
            retry: (failureCount, error) => {
              if (!navigator.onLine) return false;
              return failureCount < 2;
            },
            // Keep showing stale data when offline
            refetchOnReconnect: true,
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  // Keep TanStack Query's online manager in sync
  useEffect(() => {
    const handleOnline = () => onlineManager.setOnline(true);
    const handleOffline = () => onlineManager.setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set initial state
    onlineManager.setOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
