"use client";

import { QueryProvider } from "@/components/providers/query-provider";
import { PropsWithChildren } from "react";

import { ThemeProvider } from "@/components/providers/theme-provider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
