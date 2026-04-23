'use client';

import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { Payload } from 'recharts/types/component/DefaultTooltipContent';
import type { AuditData } from '@/lib/types';
import { MODULE_CONFIG, type ModuleKey } from '@/lib/types';

interface RadarChartProps {
  audit: AuditData;
}

export function ModuleRadarChart({ audit }: RadarChartProps) {
  const modules = Object.keys(MODULE_CONFIG) as ModuleKey[];
  const data = modules.map((key) => ({
    module: MODULE_CONFIG[key].label.split(' / ')[0].split(' & ')[0].trim(),
    fullName: MODULE_CONFIG[key].label,
    score: audit[key]?.score ?? 0,
    color: MODULE_CONFIG[key].color,
    weight: MODULE_CONFIG[key].weight,
  }));

  return (
    <div className="w-full h-full min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid
            className="stroke-border"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="module"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name="Score"
            dataKey="score"
            className="fill-primary stroke-primary"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '13px',
              color: 'var(--popover-foreground)',
            }}
            formatter={(value: number, _name: string, item: Payload<number, string>) => {
              const label = typeof item.payload?.fullName === 'string' ? item.payload.fullName : 'Score';
              return [`${value}/100`, label];
            }}
            labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
