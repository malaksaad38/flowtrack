import { ModeToggle } from "@/components/mode-toggle";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";

export default async function SettingsPage() {
  const user = await getSession();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of FlowTrack.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium leading-none">Theme</span>
              <span className="text-sm text-muted-foreground">Switch between light and dark mode.</span>
            </div>
            <ModeToggle />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your authentication session.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {/* Profile Details */}
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/20">
                {user?.image ? (
                  <img src={user.image} alt={user.name || "User"} className="h-12 w-12 rounded-full object-cover shadow-sm bg-muted" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg shadow-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground text-sm lg:text-base">{user?.name || "FlowTrack User"}</span>
                  <span className="text-xs lg:text-sm text-muted-foreground">{user?.email || "Signed in"}</span>
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
