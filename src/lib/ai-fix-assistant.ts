import type {
  AIFixProvider,
  AIFixResponse,
  AIFixApplyLocation,
  AIFixTokenUsage,
  AuditIssue,
  IssueRecommendation,
  RecommendationFramework,
} from '@/lib/types';

interface ProviderResult {
  model: string;
  text: string;
  usage?: AIFixTokenUsage;
}

function extractJsonObject(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;

  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i) ?? trimmed.match(/```\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  throw new Error('AI provider returned a non-JSON response.');
}

function buildPrompt(input: {
  domain: string;
  issue: AuditIssue;
  framework: RecommendationFramework;
  frameworkReason?: string;
  staticRecommendation: IssueRecommendation;
  codeContext: { path: string; score: number; startLine: number; endLine: number; excerpt: string }[];
}) {
  const contextBlock = input.codeContext.length
    ? input.codeContext
        .map(
          (file, index) =>
            `File ${index + 1}: ${file.path}:${file.startLine}-${file.endLine} (score: ${file.score})\n${file.excerpt}`
        )
        .join('\n\n---\n\n')
    : 'No high-confidence code context was retrieved from the repository.';

  return `You are a senior web performance and SEO engineer analyzing an audited website.

Return only valid JSON with this exact shape:
{
  "summary": "string",
  "rootCause": "string",
  "implementationSteps": ["string"],
  "validationSteps": ["string"],
  "warnings": ["string"],
  "touchedFiles": ["string"],
  "applyLocations": [
    {
      "path": "string",
      "startLine": 1,
      "endLine": 1,
      "reason": "string"
    }
  ],
  "codeSnippet": {
    "title": "string",
    "language": "string",
    "code": "string",
    "rationale": "string"
  }
}

Rules:
- Be specific to the provided website source context.
- Prefer edits that fit a modern ${input.framework === 'next' ? 'Next.js' : input.framework === 'react' ? 'React.js' : 'vanilla JavaScript'} implementation.
- Mention real file paths and line ranges when the retrieved context supports it.
- Use applyLocations to point to the exact place the developer should start editing.
- Provide one high-quality copy-paste-ready code snippet.
- Do not invent local repository files.
- If the site is external and the real source file name is unknowable, use the affected URL in path and explain that the line range comes from fetched page source, not the private repo.
- If context is weak, say so in warnings and give the safest likely integration point.

Issue:
- Domain: ${input.domain}
- Severity: ${input.issue.severity}
- Title: ${input.issue.title}
- Description: ${input.issue.description}
- Existing fix guide: ${input.issue.fixGuide}

Static recommendation baseline:
- Headline: ${input.staticRecommendation.headline}
- Explanation: ${input.staticRecommendation.explanation}
- Best practice: ${input.staticRecommendation.bestPractice}
- Framework selection reason: ${input.frameworkReason ?? 'No explicit framework reason provided.'}

Retrieved website source context:
${contextBlock}`;
}

async function callOpenAI(prompt: string): Promise<ProviderResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-5.4';

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: 'medium' },
      text: { format: { type: 'text' } },
      max_output_tokens: 1800,
      input: prompt,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI request failed: ${detail}`);
  }

  const payload = await response.json();
  const text =
    payload.output_text ??
    payload.output?.[0]?.content?.find((part: { type?: string }) => part.type === 'output_text')?.text;

  if (!text || typeof text !== 'string') {
    throw new Error('OpenAI returned no text output.');
  }

  return {
    model,
    text,
    usage: {
      inputTokens: Number(payload.usage?.input_tokens ?? 0) || 0,
      outputTokens: Number(payload.usage?.output_tokens ?? 0) || 0,
      totalTokens: Number(payload.usage?.total_tokens ?? 0) || 0,
    },
  };
}

async function callGemini(prompt: string): Promise<ProviderResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-pro';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini request failed: ${detail}`);
  }

  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('')?.trim();

  if (!text) {
    throw new Error('Gemini returned no text output.');
  }

  return {
    model,
    text,
    usage: {
      inputTokens: Number(payload.usageMetadata?.promptTokenCount ?? 0) || 0,
      outputTokens: Number(payload.usageMetadata?.candidatesTokenCount ?? 0) || 0,
      totalTokens: Number(payload.usageMetadata?.totalTokenCount ?? 0) || 0,
    },
  };
}

async function callDeepSeek(prompt: string): Promise<ProviderResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured.');
  }

  const model = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are a senior web performance and SEO engineer. Return only valid JSON that matches the requested schema.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      stream: false,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`DeepSeek request failed: ${detail}`);
  }

  const payload = await response.json();
  const text = payload.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error('DeepSeek returned no text output.');
  }

  return {
    model,
    text,
    usage: {
      inputTokens: Number(payload.usage?.prompt_tokens ?? 0) || 0,
      outputTokens: Number(payload.usage?.completion_tokens ?? 0) || 0,
      totalTokens: Number(payload.usage?.total_tokens ?? 0) || 0,
    },
  };
}

function normalizeApplyLocations(
  locations: AIFixApplyLocation[] | undefined,
  codeContext: { path: string; startLine: number; endLine: number }[]
): AIFixApplyLocation[] {
  if (Array.isArray(locations) && locations.length > 0) {
    return locations.map((location) => ({
      path: location.path,
      startLine: Number(location.startLine) || 1,
      endLine: Number(location.endLine) || Number(location.startLine) || 1,
      reason: location.reason || 'Apply the change here.',
    }));
  }

  return codeContext.slice(0, 2).map((file) => ({
    path: file.path,
    startLine: file.startLine,
    endLine: file.endLine,
    reason: 'High-confidence context match for this issue.',
  }));
}

export async function generateAIFixRecommendation(input: {
  provider: AIFixProvider;
  framework: RecommendationFramework;
  issue: AuditIssue;
  domain: string;
  frameworkReason?: string;
  staticRecommendation: IssueRecommendation;
  codeContext: { path: string; score: number; startLine: number; endLine: number; excerpt: string }[];
}): Promise<AIFixResponse> {
  const prompt = buildPrompt(input);
  const providerResult =
    input.provider === 'gemini'
      ? await callGemini(prompt)
      : input.provider === 'deepseek'
        ? await callDeepSeek(prompt)
        : await callOpenAI(prompt);

  const parsed = JSON.parse(extractJsonObject(providerResult.text)) as Omit<
    AIFixResponse,
    'provider' | 'model' | 'framework' | 'retrievedContext'
  >;

  return {
    provider: input.provider,
    model: providerResult.model,
    framework: input.framework,
    detectedFramework: input.framework,
    frameworkReason: input.frameworkReason,
    summary: parsed.summary,
    rootCause: parsed.rootCause,
    implementationSteps: parsed.implementationSteps ?? [],
    validationSteps: parsed.validationSteps ?? [],
    warnings: parsed.warnings ?? [],
    touchedFiles: parsed.touchedFiles ?? [],
    applyLocations: normalizeApplyLocations(parsed.applyLocations, input.codeContext),
    codeSnippet: parsed.codeSnippet,
    retrievedContext: input.codeContext,
    usage: providerResult.usage,
  };
}
