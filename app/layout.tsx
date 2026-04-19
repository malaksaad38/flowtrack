import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "./providers";
import "./globals.css";
import {ThemeProvider} from "next-themes";

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
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
      >
        <AppProviders>{children}</AppProviders>
      </ThemeProvider>
      </body>
    </html>
  );
}
