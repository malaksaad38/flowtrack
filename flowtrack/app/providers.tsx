"use client";

import { QueryProvider } from "@/components/providers/query-provider";
import { PropsWithChildren } from "react";

export function AppProviders({ children }: PropsWithChildren) {
  return <QueryProvider>{children}</QueryProvider>;
}
