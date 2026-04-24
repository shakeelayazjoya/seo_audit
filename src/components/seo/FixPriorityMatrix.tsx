'use client';

import { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { AuditIssue } from '@/lib/types';
import { compareIssuesByPriority, getPriorityScore, getSeverityColor } from '@/lib/types';
import { motion } from 'framer-motion';

interface FixPriorityMatrixProps {
  issues: AuditIssue[];
}

const PADDING = 40;
const CHART_SIZE = 320;
const DOMAIN = 10;

export function FixPriorityMatrix({ issues }: FixPriorityMatrixProps) {
  const quadrants = useMemo(() => {
    const qw = issues.filter((i) => i.impactScore >= 5 && i.effortScore <= 5).sort(compareIssuesByPriority);
    const mp = issues.filter((i) => i.impactScore >= 5 && i.effortScore > 5).sort(compareIssuesByPriority);
    const fi = issues.filter((i) => i.impactScore < 5 && i.effortScore <= 5).sort(compareIssuesByPriority);
    const lp = issues.filter((i) => i.impactScore < 5 && i.effortScore > 5).sort(compareIssuesByPriority);
    return { qw, mp, fi, lp };
  }, [issues]);

  const toX = (effort: number) => PADDING + ((effort - 0.5) / DOMAIN) * (CHART_SIZE - PADDING * 2);
  const toY = (impact: number) => CHART_SIZE - PADDING - ((impact - 0.5) / DOMAIN) * (CHART_SIZE - PADDING * 2);
  const midX = toX(5);
  const midY = toY(5);

  const tooltipContent = (issue: AuditIssue) => (
    <div className="text-xs space-y-1 max-w-[220px]">
      <p className="font-semibold">{issue.title}</p>
      <p className="text-muted-foreground">{issue.description}</p>
      <div className="flex gap-3 pt-1 border-t border-border/50">
        <span>Priority: <strong>{getPriorityScore(issue)}</strong></span>
        <span>Impact: <strong>{issue.impactScore}</strong></span>
        <span>Effort: <strong>{issue.effortScore}</strong></span>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Fix Priority Matrix</h3>
      <p className="text-xs text-muted-foreground">Impact vs Effort analysis to prioritize your fixes</p>
      <svg
        viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
        className="w-full max-w-[380px] mx-auto"
      >
        {/* Quadrant backgrounds */}
        {/* Quick Wins (top-left) - green */}
        <rect x={PADDING} y={PADDING} width={midX - PADDING} height={midY - PADDING} fill="#22c55e" fillOpacity={0.06} rx="4" />
        {/* Major Projects (top-right) */}
        <rect x={midX} y={PADDING} width={CHART_SIZE - PADDING - midX} height={midY - PADDING} fill="#f97316" fillOpacity={0.04} rx="4" />
        {/* Low Priority (bottom-right) */}
        <rect x={midX} y={midY} width={CHART_SIZE - PADDING - midX} height={CHART_SIZE - PADDING - midY} fill="#ef4444" fillOpacity={0.04} rx="4" />
        {/* Fill-ins (bottom-left) */}
        <rect x={PADDING} y={midY} width={midX - PADDING} height={CHART_SIZE - PADDING - midY} fill="#eab308" fillOpacity={0.04} rx="4" />

        {/* Grid lines */}
        <line x1={PADDING} y1={midY} x2={CHART_SIZE - PADDING} y2={midY} className="stroke-border" strokeDasharray="4 4" />
        <line x1={midX} y1={PADDING} x2={midX} y2={CHART_SIZE - PADDING} className="stroke-border" strokeDasharray="4 4" />

        {/* Axes */}
        <line x1={PADDING} y1={CHART_SIZE - PADDING} x2={CHART_SIZE - PADDING} y2={PADDING} className="stroke-border" />
        <line x1={PADDING} y1={CHART_SIZE - PADDING} x2={CHART_SIZE - PADDING} y2={CHART_SIZE - PADDING} className="stroke-border" />

        {/* Quadrant labels */}
        <text x={(PADDING + midX) / 2} y={PADDING + 14} textAnchor="middle" fontSize="9" fill="#16a34a" fontWeight="600">Quick Wins</text>
        <text x={(midX + CHART_SIZE - PADDING) / 2} y={PADDING + 14} textAnchor="middle" fontSize="9" fill="#ea580c" fontWeight="600">Major Projects</text>
        <text x={(PADDING + midX) / 2} y={CHART_SIZE - PADDING - 6} textAnchor="middle" fontSize="9" fill="#ca8a04" fontWeight="600">Fill-ins</text>
        <text x={(midX + CHART_SIZE - PADDING) / 2} y={CHART_SIZE - PADDING - 6} textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="600">Low Priority</text>

        {/* Y-axis label */}
        <text x={12} y={CHART_SIZE / 2} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)" transform={`rotate(-90, 12, ${CHART_SIZE / 2})`}>Impact →</text>

        {/* X-axis label */}
        <text x={CHART_SIZE / 2} y={CHART_SIZE - 4} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">Effort →</text>

        {/* Axis ticks */}
        {[1, 3, 5, 7, 9].map((v) => (
          <g key={`tick-${v}`}>
            <text x={PADDING - 6} y={toY(v) + 3} textAnchor="end" fontSize="8" fill="var(--muted-foreground)">{v}</text>
            <text x={toX(v)} y={CHART_SIZE - PADDING + 12} textAnchor="middle" fontSize="8" fill="var(--muted-foreground)">{v}</text>
          </g>
        ))}

        {/* Data points */}
        {issues.map((issue, idx) => (
          <foreignObject
            key={idx}
            x={toX(issue.effortScore) - 8}
            y={toY(issue.impactScore) - 8}
            width={16}
            height={16}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="w-4 h-4 rounded-full cursor-pointer border-2 border-background shadow-sm hover:scale-125 transition-transform"
                  style={{ backgroundColor: getSeverityColor(issue.severity) }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                {tooltipContent(issue)}
              </TooltipContent>
            </Tooltip>
          </foreignObject>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Critical</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="text-muted-foreground">Warning</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">Opportunity</span>
        </div>
      </div>
    </div>
  );
}
