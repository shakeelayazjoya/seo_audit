'use client';

import { useMemo } from 'react';
import { Clock3, Flame, TrendingUp, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AuditIssue } from '@/lib/types';
import { compareIssuesByPriority, getPriorityScore } from '@/lib/types';
import { motion } from 'framer-motion';

interface QuickWinsProps {
  issues: AuditIssue[];
}

function getFixPreview(fixGuide: string) {
  const preview = fixGuide.split(/(?<=[.!?])\s+/)[0]?.trim() ?? fixGuide.trim();
  return preview.length > 90 ? `${preview.slice(0, 87)}...` : preview;
}

function getEffortLabel(effort: number) {
  if (effort <= 2) return 'Fast fix';
  if (effort <= 4) return 'This week';
  return 'Short sprint';
}

export function QuickWins({ issues }: QuickWinsProps) {
  const quickWins = useMemo(() => {
    return issues
      .filter((i) => i.impactScore >= 6 && i.effortScore <= 5)
      .sort(compareIssuesByPriority)
      .slice(0, 5);
  }, [issues]);

  if (quickWins.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="size-4 text-emerald-500" />
            Quick Wins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-4 text-center">
            No quick wins identified. Focus on improving high-impact items first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="size-4 text-emerald-500" />
          Quick Wins
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Fastest low-effort fixes most likely to move rankings, click-through, or conversions
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-900">
            <Flame className="size-4" />
            Top {Math.min(quickWins.length, 5)} fixes to act on first
          </div>
          <p className="mt-1 text-xs text-emerald-800">
            If you only tackle a few items this week, start here. These are the clearest low-effort wins with immediate perceived value.
          </p>
        </div>
        <div className="space-y-2">
          {quickWins.map((issue, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.08 }}
              className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 transition-colors hover:bg-emerald-50"
            >
              <div className="flex items-center justify-center size-6 rounded-full bg-emerald-100 text-emerald-700 shrink-0 text-xs font-bold mt-0.5">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium truncate">{issue.title}</h4>
                  <Badge className="shrink-0 bg-emerald-600 text-white border-0 text-[10px] px-1.5 py-0">
                    <TrendingUp className="size-2.5 mr-0.5" />
                    Impact {issue.impactScore}/10
                  </Badge>
                  <Badge className="shrink-0 bg-foreground text-background border-0 text-[10px] px-1.5 py-0">
                    Priority {getPriorityScore(issue)}
                  </Badge>
                  <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0">
                    <Clock3 className="size-2.5 mr-0.5" />
                    {getEffortLabel(issue.effortScore)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{issue.description}</p>
                <p className="mt-2 text-[11px] font-medium text-emerald-900 line-clamp-2">
                  Preview: {getFixPreview(issue.fixGuide)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
