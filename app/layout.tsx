import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowTrack",
  description: "Minimal cashbook app built for speed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
