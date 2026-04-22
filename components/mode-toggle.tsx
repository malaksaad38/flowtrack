"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const options = [
    { id: "light", Icon: Sun },
    { id: "system", Icon: Monitor },
    { id: "dark", Icon: Moon },
] as const;

export function ModeToggle() {
    const { theme, setTheme } = useTheme();
    const current = theme ?? "system";

    return (
        <div className="relative inline-flex items-center rounded-full border bg-muted/40 p-1 backdrop-blur supports-[backdrop-filter]:bg-muted/30">

            {/* Animated pill */}
            <div
                className={cn(
                    "absolute top-1 bottom-1 w-8 rounded-full bg-background shadow-sm transition-all duration-300",
                    current === "light" && "left-1",
                    current === "system" && "left-1/2 -translate-x-1/2",
                    current === "dark" && "right-1"
                )}
            />

            {options.map(({ id, Icon }) => {
                const isActive = current === id;

                return (
                    <button
                        key={id}
                        onClick={() => setTheme(id)}
                        aria-label={`${id} mode`}
                        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                    >
                        <Icon
                            className={cn(
                                "h-4 w-4 transition-all duration-200",
                                isActive
                                    ? "text-foreground scale-100"
                                    : "text-muted-foreground scale-90 hover:scale-100"
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
}