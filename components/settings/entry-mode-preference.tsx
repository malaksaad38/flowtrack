"use client";

import { Settings2, Sparkles, SlidersHorizontal } from "lucide-react";
import { useEntryMode, setEntryMode } from "@/lib/entry-mode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EntryModePreference() {
  const entryMode = useEntryMode();
  const isManual = entryMode === "manual";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" />
          Entry Mode
        </CardTitle>
        <CardDescription>Choose how the add transaction form works.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Manual entry</p>
            <p className="text-sm text-muted-foreground">
              Turn this on to use separate amount, category, and note inputs.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isManual}
            aria-label="Toggle manual entry mode"
            onClick={() => setEntryMode(isManual ? "automatic" : "manual")}
            className={cn(
              "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors",
              isManual
                ? "border-primary bg-primary"
                : "border-border bg-zinc-300 dark:bg-zinc-700"
            )}
          >
            <span
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
                isManual ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div
            className={cn(
              "rounded-xl border p-4 transition-colors",
              !isManual ? "border-primary/40 bg-primary/5" : "border-border bg-background"
            )}
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              Automatic
            </div>
            <p className="text-sm text-muted-foreground">
              One line input like `500 salary` with quick parsing.
            </p>
          </div>

          <div
            className={cn(
              "rounded-xl border p-4 transition-colors",
              isManual ? "border-primary/40 bg-primary/5" : "border-border bg-background"
            )}
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Manual
            </div>
            <p className="text-sm text-muted-foreground">
              Separate amount, category, and note fields for more control.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
