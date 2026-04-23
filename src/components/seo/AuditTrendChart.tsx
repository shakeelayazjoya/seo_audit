'use client';

import { format } from 'date-fns';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import type { AuditTrendPoint } from '@/lib/types';

interface AuditTrendChartProps {
  history: AuditTrendPoint[];
}

export function AuditTrendChart({ history }: AuditTrendChartProps) {
  if (history.length < 2) return null;

  const data = history.map((point) => ({
    label: format(new Date(point.createdAt), 'MMM d'),
    overall: point.overallScore,
    technical: point.technicalScore ?? undefined,
    onPage: point.onPageScore ?? undefined,
    performance: point.performanceScore ?? undefined,
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" dataKey="overall" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="technical" stroke="#ef4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="onPage" stroke="#f97316" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="performance" stroke="#eab308" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
