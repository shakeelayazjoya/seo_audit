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
    <div className="min-h-screen px-4 py-12 bg-white relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl">
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="px-4 py-14 sm:px-6">
            <div className="mb-5 flex items-center gap-3">
              <Button asChild variant="default" size="sm" className="bg-orange-500 text-white hover:bg-orange-600">
                <Link href="/">
                  <ArrowLeft className="mr-1 size-4" />
                  Back
                </Link>
              </Button>
            </div>
            <Badge variant="outline" className="mb-4 text-sm font-medium text-slate-700 border-slate-300">
              <BarChart3 className="mr-1 size-3" />
              Domain Trend History
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {session ? 'Your audit history by domain' : 'Audit history by domain'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              {session
                ? 'Review score movement, best runs, and recent audit performance across the domains tied to your account.'
                : 'Review score movement, best runs, and recent audit performance across every domain stored in the platform.'}
            </p>
          </div>
        </section>

        <section className=" py-8">
          <DomainHistoryDashboard history={history} />
        </section>
      </div>
    </div>
  );
}
