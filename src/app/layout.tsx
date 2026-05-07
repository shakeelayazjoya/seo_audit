import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { MarketingShell } from '@/components/marketing/MarketingShell';

export const metadata: Metadata = {
  title: "All In One SEO Audit Tool — Free Technical, CRO, Local and AI SEO Check in 60 Seconds",
  description:
    "Run a free all-in-one SEO audit covering Technical SEO, Core Web Vitals, CRO, Local SEO, AI Visibility, and Schema. Get your complete score with a downloadable PDF report instantly.",
  keywords: [
     'all in one SEO audit tool',
    'SEO audit',
    'technical SEO audit',
    'CRO audit',
    'local SEO audit',
    'AI SEO audit',
    'schema audit',
    'free SEO report',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://assets.calendly.com/assets/external/widget.css"
          rel="stylesheet"
        />
        <script
          src="https://assets.calendly.com/assets/external/widget.js"
          type="text/javascript"
          async
        ></script>
      </head>
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
        <MarketingShell>{children}</MarketingShell>
        <Toaster />
      </body>
    </html>
  );
}
