"use client";

import { QueryProvider } from "@/components/providers/query-provider";
import { PropsWithChildren } from "react";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { OfflineProvider } from "@/components/providers/offline-provider";
import { SyncStatusBar } from "@/components/layout/sync-status";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <OfflineProvider>
          <SyncStatusBar />
          {children}
        </OfflineProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
