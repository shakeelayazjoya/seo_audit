import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, CheckCircle2, Mail, Sparkles } from 'lucide-react';
import { db } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function StrategyBookingPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const request = await db.commercialRequest.findUnique({
    where: { id },
  });

  if (!request || request.type !== 'booking') {
    notFound();
  }

  const bookingUrl = request.externalUrl ?? process.env.CALENDLY_URL ?? '';
  if (!bookingUrl) {
    return (
      <div className="min-h-screen bg-background px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Calendly is not configured for this environment yet.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <Button asChild variant="ghost" size="sm" className="mb-5">
            <Link href="/">
              <ArrowLeft className="mr-1 size-4" />
              Back
            </Link>
          </Button>
          <Badge variant="outline" className="mb-4">
            <CalendarDays className="mr-1 size-3" />
            Strategy Call Booking
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Book your SEO strategy session</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Choose a time that works for you, then we will review the audit and build a practical action plan.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What you will get</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {[
                'A live walkthrough of your latest SEO audit and highest-priority issues.',
                'A practical 30-60-90 day roadmap tailored to your site and goals.',
                'Clear recommendations for technical SEO, content, CRO, and local opportunities.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span>Request ID: {request.id}</span>
              </div>
              {request.domain && (
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <span>Domain: {request.domain}</span>
                </div>
              )}
              {request.email && (
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-primary" />
                  <span>{request.email}</span>
                </div>
              )}
              <Button asChild variant="outline" size="sm">
                <Link href={bookingUrl} target="_blank">
                  Open Calendly in a new tab
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <iframe
              title="Calendly booking"
              src={bookingUrl}
              className="h-[860px] w-full border-0"
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
