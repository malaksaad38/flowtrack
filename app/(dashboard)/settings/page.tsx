import { ModeToggle } from "@/components/mode-toggle";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { MonitorCog, Palette, UserRound } from "lucide-react";

export default async function SettingsPage() {
  const user = await getSession();

  return (
    <div className="mx-auto max-w-2xl space-y-5 sm:space-y-6">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <MonitorCog className="h-6 w-6 text-primary" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of FlowTrack.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium leading-none">Theme</span>
              <span className="text-sm text-muted-foreground">Switch between light and dark mode.</span>
            </div>
            <ModeToggle />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-primary" />
              Account
            </CardTitle>
            <CardDescription>Manage your authentication session.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {/* Profile Details */}
              <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/20 p-4">
                {user?.image ? (
                  <img src={user.image} alt={user.name || "User"} className="h-12 w-12 rounded-full object-cover shadow-sm bg-muted" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg shadow-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="min-w-0 flex flex-col">
                  <span className="truncate text-sm font-semibold text-foreground lg:text-base">{user?.name || "FlowTrack User"}</span>
                  <span className="truncate text-xs text-muted-foreground lg:text-sm">{user?.email || "Signed in"}</span>
                </div>
              </div>

              {/* Enhanced Logout */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-border/50">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium leading-none">Log out</span>
                  <span className="text-sm text-muted-foreground">Disconnect your current session across this device.</span>
                </div>
                <LogoutButton />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
