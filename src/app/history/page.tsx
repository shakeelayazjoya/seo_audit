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
    <div className="min-h-screen px-4 py-12 bg-[#0A0F1C] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/15 blur-[140px] rounded-full" />
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293720_1px,transparent_1px),linear-gradient(to_bottom,#1E293720_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl">
          <div className="px-4 py-14 sm:px-6">
            <div className="mb-5 flex items-center gap-3">
              <Button asChild variant="ghost" size="sm" className="text-slate-300">
                <Link href="/">
                  <ArrowLeft className="mr-1 size-4" />
                  Back
                </Link>
              </Button>
            </div>
            <Badge variant="outline" className="mb-4 text-sm font-medium text-slate-300 ">
              <BarChart3 className="mr-1 size-3 " />
              Domain Trend History
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {session ? 'Your audit history by domain' : 'Audit history by domain'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
              {session
                ? 'Review score movement, best runs, and recent audit performance across the domains tied to your account.'
                : 'Review score movement, best runs, and recent audit performance across every domain stored in the platform.'}
            </p>
          </div>
        </section>

        <section className="px-4 py-8 sm:px-6">
          <DomainHistoryDashboard history={history} />
        </section>
      </div>
    </div>
  );
}
