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
    <main className="flex min-h-screen flex-col">
      <nav className="flex items-center justify-between border-b border-border px-6 py-4 md:px-10">
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

      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center md:py-32">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Free to use · No ads · No tracking
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="text-balance text-4xl font-extrabold tracking-tight md:text-6xl">
            Track every rupee <span className="text-primary">in and out</span> without the clutter.
          </h1>
          <p className="mx-auto max-w-xl text-balance text-base text-muted-foreground md:text-lg">
            FlowTrack is a minimal cashbook for daily money tracking. Add a line, see your balance,
            and keep moving.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            id="hero-cta-primary"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
          >
            Start tracking for free
          </Link>
          <Link
            href="/login"
            id="hero-cta-secondary"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-8 text-sm font-semibold transition-colors hover:bg-muted"
          >
            I already have an account
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          No credit card required - takes 30 seconds to set up.
        </p>
      </section>

      <section className="border-t border-border bg-muted/30 px-6 py-16 md:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Everything you need, nothing you do not
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {icon}
                </div>
                <h2 className="mb-1.5 text-sm font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{desc}</p>
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
