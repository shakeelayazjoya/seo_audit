'use client';

import Link from 'next/link';
import { BarChart3, Clock, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AuditData } from '@/lib/types';
import { getGrade, getGradeColor } from '@/lib/types';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface AuditHistoryProps {
  audits: AuditData[];
  onSelectAudit: (audit: AuditData) => void;
  limit?: number;
  variant?: 'list' | 'cards';
}

export function AuditHistory({ audits, onSelectAudit, limit, variant = 'list' }: AuditHistoryProps) {
  if (audits.length === 0) {
    return null;
  }

  const visibleAudits = limit ? audits.slice(0, limit) : audits;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">Recent Audits</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight">Latest website checks</h3>
        </div>
        <Link href="/history" className="text-sm font-semibold text-orange-600 hover:underline">
          View all history
        </Link>
      </div>

      <div className={variant === 'cards' ? 'grid gap-4 md:grid-cols-3' : 'space-y-2'}>
        {visibleAudits.map((audit, idx) => {
          const grade = getGrade(audit.overallScore);
          const gradeColor = getGradeColor(grade);
          return (
            <motion.div
              key={audit.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.06 }}
            >
              <Card
                className={
                  variant === 'cards'
                    ? 'group h-full cursor-pointer overflow-hidden border-slate-200 bg-white py-0 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl'
                    : 'cursor-pointer transition-all hover:shadow-md hover:border-foreground/20 group py-0 gap-0'
                }
                onClick={() => onSelectAudit(audit)}
              >
                <CardContent className={variant === 'cards' ? 'p-5' : 'flex items-center gap-4 p-4'}>
                  {variant === 'cards' ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                          <Globe className="size-5" />
                        </div>
                        <Badge
                          className="shrink-0 border text-xs"
                          style={{
                            backgroundColor: `${gradeColor}12`,
                            color: gradeColor,
                            borderColor: `${gradeColor}35`,
                          }}
                        >
                          {grade} / {audit.overallScore}
                        </Badge>
                      </div>
                      <div>
                        <p className="truncate text-base font-semibold text-slate-950">{audit.domain}</p>
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="size-3.5" />
                          <span>{format(new Date(audit.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <BarChart3 className="size-3.5" />
                          Open report
                        </span>
                        {audit.isPartial && <Badge variant="outline" className="text-[10px]">Partial</Badge>}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
                        <Globe className="size-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium truncate">{audit.domain}</p>
                          <Badge
                            className="shrink-0 text-[10px] px-1.5 py-0"
                            style={{
                              backgroundColor: `${gradeColor}15`,
                              color: gradeColor,
                              borderColor: `${gradeColor}30`,
                            }}
                          >
                            {grade} - {audit.overallScore}
                          </Badge>
                          {audit.isPartial && (
                            <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0">
                              Partial
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          <span>{format(new Date(audit.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
