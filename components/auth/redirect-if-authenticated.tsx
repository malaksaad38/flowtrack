"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

/**
 * Covers the case where the home page was served from the service worker cache
 * and the server redirect never ran. A live session still goes to the dashboard.
 */
export function RedirectIfAuthenticated() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace("/dashboard");
    }
  }, [isPending, session, router]);

  return null;
}
