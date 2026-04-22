"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, List, PlusCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  {
    href: "/dashboard",
    label: "Cashbook",
    icon: LayoutGrid,
  },
  {
    href: "/expenses",
    label: "History",
    icon: List,
  },
  {
    href: "/add",
    label: "Quick Add",
    icon: PlusCircle,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-around border-t border-border/40 bg-background/70 backdrop-blur-2xl px-2 py-3 lg:hidden shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.1)] pb-safe">
      {NAV.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
        <Link
          key={href}
          href={href}
          className={cn(
            "relative flex flex-col items-center gap-1 rounded-2xl px-4 py-2 text-[9px] font-bold uppercase tracking-wider transition-all duration-300",
            isActive
              ? "text-primary scale-105"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {isActive && (
            <span className="absolute -top-3 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_8px_0_var(--theme-primary)]" />
          )}
          <Icon className="h-5 w-5" />
          {label}
        </Link>
        );
      })}
    </nav>
  );
}
