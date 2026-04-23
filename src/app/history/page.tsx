import Link from 'next/link';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { DomainHistoryDashboard } from '@/components/seo/DomainHistoryDashboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { listDomainAuditHistory } from '@/lib/audit-store';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const session = await getSessionFromRequest();
  const history = await listDomainAuditHistory(30, session?.userId ?? null);

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-5 flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="mr-1 size-4" />
                Back
              </Link>
            </Button>
          </div>
          <Badge variant="outline" className="mb-4">
            <BarChart3 className="mr-1 size-3" />
            Domain Trend History
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {session ? 'Your audit history by domain' : 'Audit history by domain'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {session
              ? 'Review score movement, best runs, and recent audit performance across the domains tied to your account.'
              : 'Review score movement, best runs, and recent audit performance across every domain stored in the platform.'}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <DomainHistoryDashboard history={history} />
      </section>
    </div>
  );
}
