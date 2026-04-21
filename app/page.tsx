import Link from "next/link";

export const metadata = {
  title: "FlowTrack - Cashbook for daily money tracking",
  description: "FlowTrack is a simple cashbook app for tracking money in and money out in seconds.",
};

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M2 12h20" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: "One-line entry",
    desc: "Type 500 in salary or 300 out food and FlowTrack handles the rest.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    title: "Instant balance",
    desc: "See total balance, total IN, and total OUT the moment you add a transaction.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    title: "Built for mobile",
    desc: "Fast, clean, and easy to use with one hand when you are on the move.",
  },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <nav className="flex items-center justify-between border-b border-border/40 bg-background/60 backdrop-blur-xl px-6 py-4 md:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
              <path d="M12 2v20M2 12h20" /><circle cx="12" cy="12" r="3" />
            </svg>
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

      <section className="relative flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center md:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-sm transition-colors hover:bg-primary/10">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          Free to use &middot; No ads &middot; No tracking
        </div>

        <div className="max-w-3xl space-y-6">
          <h1 className="text-balance text-5xl font-extrabold tracking-tight md:text-7xl">
            Track every rupee <span className="bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">in and out</span> without the clutter.
          </h1>
          <p className="mx-auto max-w-xl text-balance text-lg text-muted-foreground md:text-xl leading-relaxed">
            FlowTrack is a minimal cashbook for daily money tracking. Add a line, see your balance,
            and keep moving.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row mt-4">
          <Link
            href="/signup"
            id="hero-cta-primary"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
          >
            Start tracking for free
          </Link>
          <Link
            href="/login"
            id="hero-cta-secondary"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background/50 backdrop-blur-sm px-8 text-base font-semibold transition-all hover:bg-muted hover:scale-[1.02] active:scale-[0.98]"
          >
            I already have an account
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          No credit card required - takes 30 seconds to set up.
        </p>
      </section>

      <section className="relative border-t border-border/40 bg-muted/20 px-6 py-20 md:px-10 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/5 to-transparent pointer-events-none" />
        <div className="mx-auto max-w-5xl relative z-10">
          <p className="mb-12 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
            Everything you need, nothing you don't
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-background/50 backdrop-blur-xl p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
              >
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-primary/20 transition-transform duration-300 group-hover:scale-110">
                  {icon}
                </div>
                <h2 className="mb-2.5 text-lg font-bold tracking-tight">{title}</h2>
                <p className="text-base text-muted-foreground leading-relaxed">{desc}</p>
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
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-10 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Create your free account →
        </Link>
      </section>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FlowTrack. Built for speed.
      </footer>
    </main>
  );
}
