export interface ModuleResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: AuditIssue[];
  rawData: Record<string, unknown>;
}

export interface AuditIssue {
  severity: 'critical' | 'warning' | 'opportunity';
  title: string;
  description: string;
  affectedUrls: string[];
  fixGuide: string;
  impactScore: number;
  effortScore: number;
}

export interface AuditData {
  id: string;
  domain: string;
  status: string;
  overallScore: number;
  technical: ModuleResult | null;
  onPage: ModuleResult | null;
  performance: ModuleResult | null;
  cro: ModuleResult | null;
  localSeo: ModuleResult | null;
  aiSeo: ModuleResult | null;
  schema: ModuleResult | null;
  createdAt: string;
}

export type AppView = 'landing' | 'loading' | 'dashboard';

export const MODULE_CONFIG = {
  technical: { label: 'Technical SEO', weight: 25, color: '#ef4444' },
  onPage: { label: 'On-Page & Content', weight: 20, color: '#f97316' },
  performance: { label: 'Performance / CWV', weight: 20, color: '#eab308' },
  cro: { label: 'CRO Analysis', weight: 15, color: '#22c55e' },
  localSeo: { label: 'Local SEO', weight: 8, color: '#06b6d4' },
  aiSeo: { label: 'AI SEO / E-E-A-T', weight: 7, color: '#8b5cf6' },
  schema: { label: 'Schema Markup', weight: 5, color: '#ec4899' },
} as const;

export type ModuleKey = keyof typeof MODULE_CONFIG;

export function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#22c55e';
    case 'B': return '#10b981';
    case 'C': return '#eab308';
    case 'D': return '#f97316';
    case 'F': return '#ef4444';
    default: return '#6b7280';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#ef4444';
    case 'warning': return '#f97316';
    case 'opportunity': return '#22c55e';
    default: return '#6b7280';
  }
}
