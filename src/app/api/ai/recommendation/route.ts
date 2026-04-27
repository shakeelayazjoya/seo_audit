import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import { logAppEvent } from '@/lib/monitoring';
import { getIssueRecommendation } from '@/lib/recommendations';
import { retrieveWebsiteContext } from '@/lib/website-context';
import { generateAIFixRecommendation } from '@/lib/ai-fix-assistant';
import type {
  AuditIssue,
  AIFixProvider,
  RecommendationFramework,
  RecommendationFrameworkMode,
  AIFixResponse,
} from '@/lib/types';

export const runtime = 'nodejs';

function getRequesterKey(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'
  );
}

function buildFallbackResponse(input: {
  provider: AIFixProvider;
  framework: RecommendationFramework;
  issue: AuditIssue;
  domain: string;
  frameworkReason: string;
  recommendation: ReturnType<typeof getIssueRecommendation>;
  codeContext: Awaited<ReturnType<typeof retrieveWebsiteContext>>['files'];
  warning: string;
}): AIFixResponse {
  const snippet =
    input.recommendation.snippets.find((item) => item.framework === input.framework) ??
    input.recommendation.snippets[0];

  return {
    provider: input.provider,
    model: 'static-fallback',
    framework: input.framework,
    detectedFramework: input.framework,
    frameworkReason: input.frameworkReason,
    summary: `${input.issue.title} needs a site-aware implementation pass for ${input.domain}.`,
    rootCause: input.recommendation.explanation,
    implementationSteps: [
      input.recommendation.bestPractice,
      'Apply the change on the affected page template or source file that renders the retrieved website markup.',
      'Re-run the audit and verify the issue count drops for the affected URLs.',
    ],
    validationSteps: [
      'Check the rendered HTML or page output in the browser.',
      'Confirm the affected issue no longer appears in the next audit run.',
    ],
    warnings: [input.warning],
    touchedFiles: input.codeContext.map((file) => file.path),
    applyLocations: input.codeContext.slice(0, 2).map((file) => ({
      path: file.path,
      startLine: file.startLine,
      endLine: file.endLine,
      reason: 'Closest matched location in the fetched page source.',
    })),
    codeSnippet: {
      title: snippet?.title ?? 'Implementation example',
      language: snippet?.language ?? 'txt',
      code: snippet?.code ?? input.issue.fixGuide,
      rationale: input.recommendation.headline,
    },
    retrievedContext: input.codeContext,
    fallbackUsed: true,
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const requesterKey = session?.user?.id ?? getRequesterKey(request);

    const rateLimit = await enforceRateLimit({
      key: requesterKey,
      action: 'ai_fix_recommendation',
      limit: 20,
      windowMs: 1000 * 60 * 30,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many AI fix requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const issue = body.issue as AuditIssue | undefined;
    const provider = (body.provider as AIFixProvider | undefined) ?? 'openai';
    const frameworkMode = (body.framework as RecommendationFrameworkMode | undefined) ?? 'auto';
    const domain = typeof body.domain === 'string' ? body.domain : '';

    if (!issue || !issue.title || !domain) {
      return NextResponse.json({ error: 'Domain and issue details are required.' }, { status: 400 });
    }

    const recommendation = getIssueRecommendation(issue);
    const codeContext = await retrieveWebsiteContext({ issue, domain, framework: frameworkMode });
    const framework = codeContext.framework;

    try {
      const aiResult = await generateAIFixRecommendation({
        provider,
        framework,
        issue,
        domain,
        frameworkReason: codeContext.frameworkReason,
        staticRecommendation: recommendation,
        codeContext: codeContext.files,
      });

      await logAppEvent({
        level: 'info',
        type: 'ai.fix.generated',
        message: 'AI fix recommendation generated',
        context: {
          provider,
          framework,
          domain,
          issueTitle: issue.title,
          userId: session?.user?.id ?? null,
          userEmail: session?.user?.email ?? null,
          touchedFiles: aiResult.touchedFiles,
          usage: aiResult.usage ?? null,
        },
      });

      return NextResponse.json(aiResult);
    } catch (providerError) {
      const fallback = buildFallbackResponse({
        provider,
        framework,
        issue,
        domain,
        frameworkReason: codeContext.frameworkReason,
        recommendation,
        codeContext: codeContext.files,
        warning: providerError instanceof Error ? providerError.message : 'AI provider unavailable.',
      });

      await logAppEvent({
        level: 'warn',
        type: 'ai.fix.fallback',
        message: 'AI fix recommendation fell back to static guidance',
        context: {
          provider,
          framework,
          domain,
          issueTitle: issue.title,
          warning: fallback.warnings[0],
          userId: session?.user?.id ?? null,
          userEmail: session?.user?.email ?? null,
        },
      });

      return NextResponse.json(fallback);
    }
  } catch (error) {
    await logAppEvent({
      level: 'error',
      type: 'ai.fix.error',
      message: 'AI fix recommendation request failed',
      context: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json({ error: 'Unable to generate AI fix recommendation right now.' }, { status: 500 });
  }
}
