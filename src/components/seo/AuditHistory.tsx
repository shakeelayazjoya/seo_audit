'use client';

import Link from 'next/link';
import { Globe, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AuditData } from '@/lib/types';
import { getGrade, getGradeColor } from '@/lib/types';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface AuditHistoryProps {
  audits: AuditData[];
  onSelectAudit: (audit: AuditData) => void;
}

export function AuditHistory({ audits, onSelectAudit }: AuditHistoryProps) {
  if (audits.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Recent Audits</h3>
        <Link href="/history" className="text-xs font-medium text-primary hover:underline">
          View all history
        </Link>
      </div>
      <div className="space-y-2">
        {audits.map((audit, idx) => {
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
                className="cursor-pointer transition-all hover:shadow-md hover:border-foreground/20 group py-0 gap-0"
                onClick={() => onSelectAudit(audit)}
              >
                <CardContent className="flex items-center gap-4 p-4">
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
                        {grade} — {audit.overallScore}
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
                  <ChevronRight className="size-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
