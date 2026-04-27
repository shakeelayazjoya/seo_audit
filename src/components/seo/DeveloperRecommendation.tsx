'use client';

import { Code2, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { IssueRecommendation, RecommendationFramework, RecommendationSnippet } from '@/lib/types';

const FRAMEWORK_ORDER: RecommendationFramework[] = ['vanilla', 'react', 'next'];

const FRAMEWORK_LABELS: Record<RecommendationFramework, string> = {
  vanilla: 'Vanilla JS',
  react: 'React.js',
  next: 'Next.js',
};

function snippetMap(snippets: RecommendationSnippet[]) {
  return snippets.reduce<Record<RecommendationFramework, RecommendationSnippet | null>>(
    (acc, snippet) => {
      acc[snippet.framework] = snippet;
      return acc;
    },
    {
      vanilla: null,
      react: null,
      next: null,
    }
  );
}

interface DeveloperRecommendationProps {
  recommendation: IssueRecommendation;
}

export function DeveloperRecommendation({ recommendation }: DeveloperRecommendationProps) {
  const snippets = snippetMap(recommendation.snippets);
  const availableFrameworks = FRAMEWORK_ORDER.filter((framework) => snippets[framework]);
  const defaultFramework = availableFrameworks[0] ?? 'vanilla';

  return (
    <div className="rounded-lg border bg-slate-50/70 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-slate-900 p-2 text-white">
          <Sparkles className="size-4" />
        </div>
        <div className="space-y-4 flex-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Developer Recommendation
            </p>
            <h5 className="mt-1 text-sm font-semibold text-slate-900">{recommendation.headline}</h5>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md bg-white p-3 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Problem</p>
              <p className="mt-1 text-sm text-slate-700">{recommendation.explanation}</p>
            </div>
            <div className="rounded-md bg-white p-3 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Best Practice</p>
              <p className="mt-1 text-sm text-slate-700">{recommendation.bestPractice}</p>
            </div>
          </div>

          <Tabs defaultValue={defaultFramework} className="gap-3">
            <TabsList className="w-full justify-start overflow-x-auto">
              {availableFrameworks.map((framework) => (
                <TabsTrigger key={framework} value={framework} className="min-w-[110px]">
                  {FRAMEWORK_LABELS[framework]}
                </TabsTrigger>
              ))}
            </TabsList>

            {availableFrameworks.map((framework) => {
              const snippet = snippets[framework];
              if (!snippet) return null;

              return (
                <TabsContent key={framework} value={framework}>
                  <div className="rounded-md bg-slate-950 text-slate-100 shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Code2 className="size-4" />
                        <span>{snippet.title}</span>
                      </div>
                      <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-300">
                        {snippet.language}
                      </span>
                    </div>
                    <pre className="overflow-x-auto p-4 text-xs leading-6">
                      <code>{snippet.code}</code>
                    </pre>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
