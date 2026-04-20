"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    try {
      setIsPending(true);
      await signOut();
      router.push("/");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      variant="destructive"
      onClick={handleLogout}
      disabled={isPending}
      className="flex w-full items-center gap-2 shadow-sm transition-colors hover:bg-destructive/90 sm:w-auto"
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "Signing Out..." : "Sign Out"}
    </Button>
  );
}
