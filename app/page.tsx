import Link from "next/link";
import { ArrowRight, LayoutGrid, Sparkles, Tag, Zap } from "lucide-react";

export const metadata = {
  title: "FlowTrack - Cashbook for daily money tracking",
  description: "FlowTrack is a simple cashbook app for tracking money in and money out in seconds.",
};

const FEATURES = [
  {
    icon: Sparkles,
    title: "One-line entry",
    desc: "Type 500 in salary or 300 out food and FlowTrack handles the rest.",
  },
  {
    icon: LayoutGrid,
    title: "Instant balance",
    desc: "See total balance, total IN, and total OUT the moment you add a transaction.",
  },
  {
    icon: Tag,
    title: "Built for mobile",
    desc: "Fast, clean, and easy to use with one hand when you are on the move.",
  },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border/40 bg-background/60 px-6 py-4 backdrop-blur-xl md:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">FlowTrack</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            id="nav-login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            id="nav-signup"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden px-6 py-24 text-center md:py-32">
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-sm transition-colors hover:bg-primary/10">
          <Zap className="h-4 w-4" />
          Free to use &middot; No ads &middot; No tracking
        </div>

        <div className="max-w-3xl space-y-6">
          <h1 className="text-balance text-5xl font-extrabold tracking-tight md:text-7xl">
            Track every rupee <span className="bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">in and out</span> without the clutter.
          </h1>
          <p className="mx-auto max-w-xl text-balance text-lg leading-relaxed text-muted-foreground md:text-xl">
            FlowTrack is a minimal cashbook for daily money tracking. Add a line, see your balance,
            and keep moving.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/signup"
            id="hero-cta-primary"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
          >
            Start tracking for free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            id="hero-cta-secondary"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background/50 px-8 text-base font-semibold backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-muted active:scale-[0.98]"
          >
            I already have an account
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          No credit card required - takes 30 seconds to set up.
        </p>
      </section>

      <section className="relative overflow-hidden border-t border-border/40 bg-muted/20 px-6 py-20 backdrop-blur-sm md:px-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/5 to-transparent" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <p className="mb-12 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
            Everything you need, nothing you do not
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-background/50 p-8 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-primary/20 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mb-2.5 text-lg font-bold tracking-tight">{title}</h2>
                <p className="text-base leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center gap-5 px-6 py-20 text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          Ready to take control?
        </h2>
        <Link
          href="/signup"
          id="bottom-cta"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-10 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Create your free account
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} FlowTrack. Built for speed.
      </footer>
    </main>
  );
}
