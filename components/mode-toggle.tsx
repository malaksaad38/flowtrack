"use client";

import * as React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const options = [
    { id: "light",  label: "Light",  Icon: Sun },
    { id: "system", label: "System", Icon: Monitor },
    { id: "dark",   label: "Dark",   Icon: Moon },
] as const;

export function ModeToggle() {
    const { theme, setTheme } = useTheme();
    const current = theme ?? "system";

    const containerRef = React.useRef<HTMLDivElement>(null);
    const [pillStyle, setPillStyle] = React.useState({ left: 0, width: 0 });

    const updatePill = (el: HTMLButtonElement) => {
        const container = containerRef.current;
        if (!container) return;
        const cr = container.getBoundingClientRect();
        const br = el.getBoundingClientRect();
        setPillStyle({ left: br.left - cr.left, width: br.width });
    };

    const activeRef = React.useCallback(
        (el: HTMLButtonElement | null) => { if (el) updatePill(el); },
        [current]
    );

    return (
        <div
            ref={containerRef}
            className="relative inline-flex items-center rounded-full border border-border bg-muted p-1 gap-0.5"
        >
            {/* Sliding pill */}
            <span
                className="absolute top-1 h-[calc(100%-8px)] rounded-full bg-background border border-border shadow-sm transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
                style={{ left: pillStyle.left, width: pillStyle.width }}
            />

            {options.map(({ id, label, Icon }) => (
                <button
                    key={id}
                    ref={current === id ? activeRef : undefined}
                    onClick={(e) => { setTheme(id); updatePill(e.currentTarget); }}
                    aria-label={`${label} mode`}
                    className={cn(
                        "relative z-10 flex items-center justify-center rounded-full transition-colors duration-200",
                        // Mobile: square icon button. sm+: pill with label
                        "h-9 w-9 sm:w-auto sm:gap-1.5 sm:px-3.5 sm:py-1.5",
                        current === id
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline text-sm font-medium">{label}</span>
                </button>
            ))}
        </div>
    );
}