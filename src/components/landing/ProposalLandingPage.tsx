import Link from 'next/link';
import { ArrowRight, CheckCircle2, Search, Shield, Zap, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProposalLandingPageProps {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  focusChecks: string[];
  ctaLabel: string;
}

export function ProposalLandingPage({
  eyebrow,
  title,
  description,
  bullets,
  focusChecks,
  ctaLabel,
}: ProposalLandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-gradient-to-b from-muted/60 via-background to-background">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="mr-1 size-3" />
            {eyebrow}
          </Badge>
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/">
                    <Search className="mr-2 size-4" />
                    {ctaLabel}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/#features">
                    View Full Platform
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-primary/20 bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">What This Page Focuses On</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {focusChecks.map((check) => (
                  <div key={check} className="rounded-lg border bg-muted/40 p-3 text-sm">
                    {check}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Shield className="size-5" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Built For Real Audit Workflows</h2>
            <p className="text-sm text-muted-foreground">
              These landing pages connect directly into the same live crawl and scoring engine used by the platform.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 rounded-lg bg-primary/10 p-2 text-primary w-fit">
                <Search className="size-4" />
              </div>
              <h3 className="mb-2 font-semibold">Live Crawl</h3>
              <p className="text-sm text-muted-foreground">
                Audits are generated from the current crawl output, not hard-coded score presets.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 rounded-lg bg-primary/10 p-2 text-primary w-fit">
                <Zap className="size-4" />
              </div>
              <h3 className="mb-2 font-semibold">Performance Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                Performance scoring now supports PageSpeed/Lighthouse-backed analysis with runtime fallbacks.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 rounded-lg bg-primary/10 p-2 text-primary w-fit">
                <Sparkles className="size-4" />
              </div>
              <h3 className="mb-2 font-semibold">Actionable Modules</h3>
              <p className="text-sm text-muted-foreground">
                Every route funnels users into the same 7-module dashboard with issues, quick wins, and trend history.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
