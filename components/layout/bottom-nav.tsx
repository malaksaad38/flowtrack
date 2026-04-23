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
    <nav className="fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-around border-t border-border/40 bg-background/80 px-1 py-2 shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.1)] backdrop-blur-2xl pb-safe lg:hidden">
      {NAV.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
        <Link
          key={href}
          href={href}
          className={cn(
            "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-all duration-300",
            isActive
              ? "text-primary scale-105"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {isActive && (
            <span className="absolute -top-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_10px_0] shadow-primary/40" />
          )}
          <Icon className="h-5 w-5" />
          <span className="line-clamp-1">{label}</span>
        </Link>
        );
      })}
    </nav>
  );
}
