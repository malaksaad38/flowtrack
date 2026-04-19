"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const options = [
    { id: "light",  label: "Light",  Icon: Sun,     activeClass: "border-amber-400 text-amber-600" },
    { id: "system", label: "System", Icon: Monitor, activeClass: "border-blue-500 text-blue-600"  },
    { id: "dark",   label: "Dark",   Icon: Moon,    activeClass: "border-violet-500 text-violet-600" },
] as const;

export function ModeToggle() {
    const { theme, setTheme } = useTheme();
    const current = theme ?? "system";

    return (
        <div className="inline-flex items-center gap-0.5 md:gap-2">
            {options.map(({ id, label, Icon, activeClass }) => {
                const isActive = current === id;
                return (
                    <button
                        key={id}
                        onClick={() => setTheme(id)}
                        aria-label={`${label} mode`}
                        className={cn(
                            "flex items-center gap-1.5 rounded-full border  p-2 text-[13px] font-medium tracking-wide transition-all duration-150",
                            isActive
                                ? activeClass
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                    >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                );
            })}
        </div>
    );
}