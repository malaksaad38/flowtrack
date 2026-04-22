"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button 
      variant="outline"
      onClick={handleLogout} 
      className="flex items-center gap-2 w-full sm:w-auto hover:bg-destructive/90 transition-colors shadow-sm"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  );
}
