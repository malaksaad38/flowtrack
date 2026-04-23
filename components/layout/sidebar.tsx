"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, List, PlusCircle, Settings, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
    href: "/reports",
    label: "Reports",
    icon: PieChart,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
      <aside className="sticky top-0 h-screen w-64 flex flex-col border-r border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-border/40 px-6 py-6 transition-all duration-300 hover:opacity-80">
        <Image src="/logo.png" alt="FlowTrack Logo" width={36} height={36} className="h-9 w-9 rounded-xl shadow-md shadow-primary/20 object-cover" />
        <span className="font-bold text-lg tracking-tight text-foreground">FlowTrack</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "group/nav flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
              pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:-translate-y-0.5"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-2 border-t border-border p-4">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
