'use client';

import { useState } from 'react';
import { Bot, BrainCircuit, Loader2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import type {
  AIFixProvider,
  AIFixResponse,
  AuditIssue,
  RecommendationFrameworkMode,
} from '@/lib/types';

const PROVIDERS: Array<{ key: AIFixProvider; label: string }> = [
  { key: 'deepseek', label: 'DeepSeek' },
  { key: 'openai', label: 'ChatGPT / OpenAI' },
  { key: 'gemini', label: 'Gemini' },
];

const FRAMEWORKS: Array<{ key: RecommendationFrameworkMode; label: string }> = [
  { key: 'auto', label: 'Auto-detect' },
  { key: 'vanilla', label: 'Vanilla JS' },
  { key: 'react', label: 'React.js' },
  { key: 'next', label: 'Next.js' },
];

interface AIFixAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue: AuditIssue | null;
  domain: string;
}

export function AIFixAssistantDialog({
  open,
  onOpenChange,
  issue,
  domain,
}: AIFixAssistantDialogProps) {
  const [provider, setProvider] = useState<AIFixProvider>('deepseek');
  const [framework, setFramework] = useState<RecommendationFrameworkMode>('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AIFixResponse | null>(null);

  const handleGenerate = async () => {
    if (!issue) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          framework,
          domain,
          issue,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate AI fix recommendation.');
      }

      setResult(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to generate AI recommendation.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setError('');
      setResult(null);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            AI Fix Assistant
          </DialogTitle>
          <DialogDescription>
            Generate a site-aware fix plan for
            {issue ? <span className="font-medium text-foreground"> {issue.title}</span> : ' the selected issue'}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[260px,1fr]">
          <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Provider</p>
              <div className="space-y-2">
                {PROVIDERS.map((option) => (
                  <Button
                    key={option.key}
                    type="button"
                    variant={provider === option.key ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setProvider(option.key)}
                  >
                    <BrainCircuit className="size-4" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Target Framework</p>
              <div className="space-y-2">
                {FRAMEWORKS.map((option) => (
                  <Button
                    key={option.key}
                    type="button"
                    variant={framework === option.key ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setFramework(option.key)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button type="button" className="w-full" onClick={handleGenerate} disabled={loading || !issue}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Generate AI Fix
                </>
              )}
            </Button>

            {result && (
              <div className="rounded-lg border bg-background p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">
                  Provider: {result.provider} ({result.model})
                </p>
                <p className="mt-1">Framework: {result.framework}</p>
                {result.frameworkReason && (
                  <p className="mt-1">{result.frameworkReason}</p>
                )}
                {result.fallbackUsed && (
                  <p className="mt-2 text-amber-700">
                    AI provider unavailable, so static guidance with fetched website context was returned.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-background">
            <ScrollArea className="h-[70vh]">
              <div className="p-4 space-y-4">
                {!result && !loading && (
                  <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-center">
                    <p className="text-sm font-medium">Ready for code-aware fix guidance</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Choose ChatGPT or Gemini, let the app auto-detect the stack or force one, and generate a site-aware fix plan from the audited page source.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {result && (
                  <>
                    <div className="rounded-lg border bg-muted/20 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Summary</p>
                      <p className="text-sm">{result.summary}</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Root Cause</p>
                        <p className="text-sm text-muted-foreground">{result.rootCause}</p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Affected URLs / Source Targets</p>
                        <div className="flex flex-wrap gap-2">
                          {result.touchedFiles.length > 0 ? (
                            result.touchedFiles.map((file) => (
                              <Badge key={file} variant="secondary">{file}</Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No high-confidence file targets yet.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-muted/20 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Detected Framework</p>
                      <p className="text-sm font-medium">
                        {(result.detectedFramework ?? result.framework).toUpperCase()}
                      </p>
                      {result.frameworkReason && (
                        <p className="mt-1 text-sm text-muted-foreground">{result.frameworkReason}</p>
                      )}
                    </div>

                    <Tabs defaultValue="implementation" className="gap-3">
                      <TabsList>
                        <TabsTrigger value="implementation">Implementation</TabsTrigger>
                        <TabsTrigger value="apply">Where To Apply</TabsTrigger>
                        <TabsTrigger value="code">Code</TabsTrigger>
                        <TabsTrigger value="context">Code Context</TabsTrigger>
                        <TabsTrigger value="validation">Validation</TabsTrigger>
                      </TabsList>

                      <TabsContent value="implementation" className="space-y-3">
                        <div className="rounded-lg border p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Implementation Steps</p>
                          <ol className="space-y-2 text-sm text-muted-foreground">
                            {result.implementationSteps.map((step, index) => (
                              <li key={index}>
                                <span className="font-medium text-foreground">{index + 1}.</span> {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {result.warnings.length > 0 && (
                          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">Warnings</p>
                            <ul className="space-y-2 text-sm text-amber-800">
                              {result.warnings.map((warning, index) => (
                                <li key={index}>{warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="apply" className="space-y-3">
                        {result.applyLocations.length > 0 ? (
                          result.applyLocations.map((location) => (
                            <div key={`${location.path}:${location.startLine}`} className="rounded-lg border p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-medium text-sm">{location.path}</p>
                                <Badge variant="outline">
                                  Lines {location.startLine}-{location.endLine}
                                </Badge>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">{location.reason}</p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                            No exact apply locations were identified yet.
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="code">
                        <div className="rounded-lg bg-slate-950 text-slate-100 shadow-sm">
                          <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
                            <div>
                              <p className="text-sm font-medium">{result.codeSnippet.title}</p>
                              <p className="text-xs text-slate-400">{result.codeSnippet.rationale}</p>
                            </div>
                            <Badge variant="secondary">{result.codeSnippet.language}</Badge>
                          </div>
                          <pre className="overflow-x-auto p-4 text-xs leading-6">
                            <code>{result.codeSnippet.code}</code>
                          </pre>
                        </div>
                      </TabsContent>

                      <TabsContent value="context" className="space-y-3">
                        {result.retrievedContext.length > 0 ? (
                          result.retrievedContext.map((file) => (
                            <div key={file.path} className="rounded-lg border p-4">
                              <div className="flex items-center justify-between gap-3 mb-2">
                                <p className="font-medium text-sm">{file.path}</p>
                                <Badge variant="outline">Score {file.score} • {file.startLine}-{file.endLine}</Badge>
                              </div>
                              <p className="mb-2 text-xs text-muted-foreground">
                                These line numbers refer to the fetched HTML source for this audited URL, not private repository files on the target site.
                              </p>
                              <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 text-xs leading-6 text-slate-100">
                                <code>{file.excerpt}</code>
                              </pre>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                            No strong repository context was retrieved for this issue yet.
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="validation">
                        <div className="rounded-lg border p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Validation Checklist</p>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {result.validationSteps.map((step, index) => (
                              <li key={index}>
                                <span className="font-medium text-foreground">{index + 1}.</span> {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
