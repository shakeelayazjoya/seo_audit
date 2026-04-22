'use client';

import { useState, useMemo } from 'react';
import { ArrowLeft, Download, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { ScoreRing } from '@/components/seo/ScoreRing';
import { ModuleRadarChart } from '@/components/seo/RadarChart';
import { IssueAccordion } from '@/components/seo/IssueAccordion';
import { FixPriorityMatrix } from '@/components/seo/FixPriorityMatrix';
import { QuickWins } from '@/components/seo/QuickWins';
import type { AuditData, AuditIssue, ModuleKey } from '@/lib/types';
import { MODULE_CONFIG, getGradeColor } from '@/lib/types';
import { motion } from 'framer-motion';

interface AuditDashboardProps {
  audit: AuditData;
  onBack: () => void;
  isPaid?: boolean;
  onUpgradeClick?: () => void;
}

export function AuditDashboard({ audit, onBack, isPaid = false, onUpgradeClick }: AuditDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const moduleKeys = Object.keys(MODULE_CONFIG) as ModuleKey[];

  const allIssues: AuditIssue[] = useMemo(() => {
    const issues: AuditIssue[] = [];
    for (const key of moduleKeys) {
      const mod = audit[key];
      if (mod) {
        issues.push(...mod.issues);
      }
    }
    return issues;
  }, [audit, moduleKeys]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
                <ArrowLeft className="size-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold truncate">{audit.domain}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">SEO Audit Report</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex">
                <Download className="size-3 mr-1" />
                Export
              </Badge>
              {!isPaid && (
                <Button size="sm" onClick={onUpgradeClick}>
                  <ShieldCheck className="size-3.5" />
                  Get Full Report
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero: Score + Radar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Score Ring */}
          <Card>
            <CardContent className="flex flex-col sm:flex-row items-center gap-6 pt-6">
              <ScoreRing score={audit.overallScore} size={180} />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold mb-1">Overall Score</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {audit.overallScore >= 80
                    ? 'Your site has strong SEO fundamentals. Address remaining issues to reach the top.'
                    : audit.overallScore >= 60
                      ? 'Your site has room for improvement. Focus on critical issues first.'
                      : 'Significant SEO issues detected. Prioritize fixes for maximum impact.'}
                </p>
                <div className="space-y-2">
                  {moduleKeys.map((key) => {
                    const mod = audit[key];
                    if (!mod) return null;
                    const config = MODULE_CONFIG[key];
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-32 truncate">{config.label}</span>
                        <Progress
                          value={mod.score}
                          className="flex-1 h-1.5"
                        />
                        <span className="text-xs font-semibold w-8 text-right" style={{ color: getGradeColor(mod.grade) }}>
                          {mod.score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Module Scores Overview</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <ModuleRadarChart audit={audit} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Module Tabs + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content: Module Tabs */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <ScrollArea className="w-full">
                    <div className="border-b px-4">
                      <TabsList className="bg-transparent h-auto p-0 gap-0 w-full overflow-x-auto">
                        <TabsTrigger
                          value="overview"
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-3"
                        >
                          All Modules
                        </TabsTrigger>
                        {moduleKeys.map((key) => (
                          <TabsTrigger
                            key={key}
                            value={key}
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-3 text-xs sm:text-sm"
                          >
                            <span
                              className="mr-1.5 inline-block size-2 rounded-full"
                              style={{ backgroundColor: MODULE_CONFIG[key].color }}
                            />
                            <span className="hidden sm:inline">{MODULE_CONFIG[key].label}</span>
                            <span className="sm:hidden">{MODULE_CONFIG[key].label.split(' ')[0]}</span>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                  </ScrollArea>

                  {/* All Modules Tab */}
                  <TabsContent value="overview" className="mt-0 p-4 sm:p-6">
                    <div className="space-y-6">
                      {moduleKeys.map((key) => {
                        const mod = audit[key];
                        if (!mod) return null;
                        const config = MODULE_CONFIG[key];
                        return (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <span
                                className="inline-block size-3 rounded-full"
                                style={{ backgroundColor: config.color }}
                              />
                              <h3 className="font-semibold text-sm">{config.label}</h3>
                              <Badge
                                className="text-[10px]"
                                style={{
                                  backgroundColor: `${getGradeColor(mod.grade)}15`,
                                  color: getGradeColor(mod.grade),
                                  borderColor: `${getGradeColor(mod.grade)}30`,
                                }}
                              >
                                {mod.grade} — {mod.score}/100
                              </Badge>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {mod.issues.length} issue{mod.issues.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <IssueAccordion
                              issues={mod.issues}
                              isPaid={isPaid}
                              onCTAClick={onUpgradeClick}
                            />
                            <Separator className="mt-6" />
                          </motion.div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  {/* Individual Module Tabs */}
                  {moduleKeys.map((key) => {
                    const mod = audit[key];
                    if (!mod) return null;
                    const config = MODULE_CONFIG[key];
                    return (
                      <TabsContent key={key} value={key} className="mt-0 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block size-3 rounded-full"
                              style={{ backgroundColor: config.color }}
                            />
                            <h3 className="font-semibold">{config.label}</h3>
                          </div>
                          <Badge
                            style={{
                              backgroundColor: `${getGradeColor(mod.grade)}15`,
                              color: getGradeColor(mod.grade),
                              borderColor: `${getGradeColor(mod.grade)}30`,
                            }}
                          >
                            Grade {mod.grade} — {mod.score}/100
                          </Badge>
                          <span className="text-xs text-muted-foreground sm:ml-auto">
                            Weight: {config.weight}%
                          </span>
                        </div>

                        <div className="mb-4">
                          <Progress value={mod.score} className="h-2" />
                        </div>

                        <IssueAccordion
                          issues={mod.issues}
                          isPaid={isPaid}
                          onCTAClick={onUpgradeClick}
                        />
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickWins issues={allIssues} />

            <Card>
              <CardContent className="pt-6">
                <FixPriorityMatrix issues={allIssues} />
              </CardContent>
            </Card>

            {/* CTA Block */}
            {!isPaid && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card className="bg-primary text-primary-foreground border-0">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-1">Unlock the Full Report</h3>
                    <p className="text-sm text-primary-foreground/80 mb-4">
                      Get detailed fix guides, priority matrices, and actionable recommendations for every issue.
                    </p>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={onUpgradeClick}
                    >
                      <ShieldCheck className="size-4" />
                      Get Full Report
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
