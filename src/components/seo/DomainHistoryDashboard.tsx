'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowRight, BarChart3, Clock3, TrendingUp } from 'lucide-react';
import { AuditTrendChart } from '@/components/seo/AuditTrendChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DomainAuditHistory } from '@/lib/types';
import { getGrade, getGradeColor } from '@/lib/types';

interface DomainHistoryDashboardProps {
  history: DomainAuditHistory[];
}

export function DomainHistoryDashboard({ history }: DomainHistoryDashboardProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            No completed audits have been saved yet. Run a site audit to start building domain history.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {history.map((entry) => {
        const grade = getGrade(entry.latestScore);
        const gradeColor = getGradeColor(grade);

        return (
          <Card key={entry.domain} className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">{entry.domain}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Last audited {format(new Date(entry.lastAuditedAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: `${gradeColor}12`,
                      color: gradeColor,
                      borderColor: `${gradeColor}30`,
                    }}
                  >
                    Latest {entry.latestScore}
                  </Badge>
                  <Button asChild size="sm">
                    <Link href={`/?audit=${entry.latestAuditId}`}>
                      Open Audit
                      <ArrowRight className="ml-1 size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <BarChart3 className="size-3.5" />
                    Audits
                  </div>
                  <p className="text-2xl font-semibold">{entry.auditCount}</p>
                </div>
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <TrendingUp className="size-3.5" />
                    Best Score
                  </div>
                  <p className="text-2xl font-semibold">{entry.bestScore}</p>
                </div>
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <BarChart3 className="size-3.5" />
                    Average
                  </div>
                  <p className="text-2xl font-semibold">{entry.averageScore}</p>
                </div>
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    Latest Grade
                  </div>
                  <p className="text-2xl font-semibold">{grade}</p>
                </div>
              </div>

              {entry.history.length > 1 ? (
                <AuditTrendChart history={entry.history} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Trend insights will appear after this domain has been audited at least twice.
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
