'use client';

import { useMemo } from 'react';
import { AlertTriangle, AlertCircle, Lightbulb, Lock, ExternalLink } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AuditIssue } from '@/lib/types';
import { getSeverityColor } from '@/lib/types';
import { motion } from 'framer-motion';

interface IssueAccordionProps {
  issues: AuditIssue[];
  isPaid?: boolean;
  onCTAClick?: () => void;
}

interface SeverityGroup {
  severity: 'critical' | 'warning' | 'opportunity';
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  issues: AuditIssue[];
}

export function IssueAccordion({ issues, isPaid = false, onCTAClick }: IssueAccordionProps) {
  const groups = useMemo((): SeverityGroup[] => {
    const critical = issues.filter((i) => i.severity === 'critical');
    const warnings = issues.filter((i) => i.severity === 'warning');
    const opportunities = issues.filter((i) => i.severity === 'opportunity');

    return [
      {
        severity: 'critical',
        label: 'Critical Issues',
        icon: <AlertCircle className="size-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        issues: critical,
      },
      {
        severity: 'warning',
        label: 'Warnings',
        icon: <AlertTriangle className="size-4" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 border-orange-200',
        issues: warnings,
      },
      {
        severity: 'opportunity',
        label: 'Opportunities',
        icon: <Lightbulb className="size-4" />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 border-emerald-200',
        issues: opportunities,
      },
    ].filter((g) => g.issues.length > 0);
  }, [issues]);

  if (issues.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No issues found. Great job!</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" defaultValue={groups.map((g) => g.severity)} className="w-full">
      {groups.map((group) => (
        <AccordionItem key={group.severity} value={group.severity}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-md ${group.bgColor} ${group.color}`}>
                {group.icon}
              </div>
              <span className="font-semibold">{group.label}</span>
              <Badge variant="secondary" className="ml-1">
                {group.issues.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pl-1">
              {group.issues.map((issue, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-medium text-sm leading-snug">{issue.title}</h4>
                    <Badge
                      className="shrink-0"
                      style={{
                        backgroundColor: `${getSeverityColor(issue.severity)}15`,
                        color: getSeverityColor(issue.severity),
                        borderColor: `${getSeverityColor(issue.severity)}30`,
                      }}
                    >
                      {issue.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{issue.description}</p>

                  {/* Scores */}
                  <div className="flex gap-4 mb-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Impact:</span>
                      <span className="font-semibold text-foreground">{issue.impactScore}/10</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Effort:</span>
                      <span className="font-semibold text-foreground">{issue.effortScore}/10</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ExternalLink className="size-3" />
                      <span className="font-semibold text-foreground">{issue.affectedUrls.length}</span>
                      <span>URL{issue.affectedUrls.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Fix Guide */}
                  {isPaid ? (
                    <div className="rounded-md bg-muted/50 p-3 text-sm">
                      <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">Fix Guide</p>
                      <p>{issue.fixGuide}</p>
                    </div>
                  ) : (
                    <div className="relative rounded-md bg-muted/50 p-3">
                      <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-md bg-background/60 z-10">
                        <Button variant="outline" size="sm" className="gap-2" onClick={onCTAClick}>
                          <Lock className="size-3" />
                          Unlock Fix Guide
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground blur-sm select-none">{issue.fixGuide}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
