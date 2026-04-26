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
      variant="destructive"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  );
}
