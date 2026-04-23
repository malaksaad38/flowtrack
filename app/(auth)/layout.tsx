import Link from "next/link";
import { PropsWithChildren } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary p-12">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/10">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-primary-foreground">FlowTrack</span>
          </div>
        </div>
        <div className="space-y-6">
          <blockquote className="space-y-3">
            <p className="text-2xl font-semibold leading-snug text-primary-foreground">
              &quot;Know where every rupee goes — before it&apos;s gone.&quot;
            </p>
          </blockquote>
          <div className="space-y-3">
            {[
              "Track expenses in seconds",
              "Visualise spending by category",
              "Monthly insights at a glance",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-primary-foreground/80">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} FlowTrack. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-center gap-2 lg:hidden sm:mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <Link href="/" className="text-lg font-bold">FlowTrack</Link>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
