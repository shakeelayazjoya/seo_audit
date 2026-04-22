'use client';

import { useMemo } from 'react';
import { Zap, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AuditIssue } from '@/lib/types';
import { motion } from 'framer-motion';

interface QuickWinsProps {
  issues: AuditIssue[];
}

export function QuickWins({ issues }: QuickWinsProps) {
  const quickWins = useMemo(() => {
    return issues
      .filter((i) => i.impactScore >= 7 && i.effortScore <= 4)
      .sort((a, b) => b.impactScore - a.impactScore)
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
          High impact, low effort fixes you can implement today
        </p>
      </CardHeader>
      <CardContent>
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
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium truncate">{issue.title}</h4>
                  <Badge className="shrink-0 bg-emerald-600 text-white border-0 text-[10px] px-1.5 py-0">
                    <TrendingUp className="size-2.5 mr-0.5" />
                    {issue.impactScore}/10
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{issue.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
