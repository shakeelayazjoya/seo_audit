import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "SEO Audit Platform — Free Website SEO Analysis Tool",
  description:
    "Get a comprehensive SEO audit across 7 dimensions including Technical SEO, Core Web Vitals, On-Page, CRO, Local SEO, AI/E-E-A-T, and Schema Markup. Free instant analysis with prioritized action items.",
  keywords: [
    "SEO audit",
    "SEO analysis tool",
    "website SEO checker",
    "technical SEO audit",
    "Core Web Vitals",
    "free SEO report",
    "SEO optimization",
    "website audit tool",
    "CRO analysis",
    "schema markup validator",
  ],
  authors: [{ name: "SEO Audit Platform" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔍</text></svg>",
  },
  openGraph: {
    title: "SEO Audit Platform — Free Website SEO Analysis",
    description:
      "Analyze your website's SEO health in 60 seconds. Get actionable recommendations across 7 critical dimensions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={
          {
            "--font-geist-sans":
              '"Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif',
            "--font-geist-mono":
              '"Cascadia Code", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
          } as CSSProperties
        }
        className="antialiased bg-background text-foreground"
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
