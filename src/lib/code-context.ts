import { promises as fs } from 'node:fs';
import path from 'node:path';
import type {
  AuditIssue,
  RecommendationFramework,
  RecommendationFrameworkMode,
  AIFixCodeContextFile,
} from '@/lib/types';

const SEARCH_ROOTS = ['src', 'prisma'];
const ALLOWED_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.prisma', '.mdx']);
const IGNORED_DIRS = new Set(['node_modules', '.next', '.git', '.next-release']);
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'your', 'have', 'into', 'what', 'when', 'where',
  'which', 'will', 'should', 'would', 'there', 'their', 'them', 'than', 'then', 'only', 'page', 'pages',
  'meta', 'title', 'issue', 'issues', 'warning', 'critical', 'opportunity', 'found', 'missing',
]);

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s/_-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function buildSearchTerms(issue: AuditIssue, framework: RecommendationFramework): string[] {
  const baseTerms = tokenize([issue.title, issue.description, issue.fixGuide].join(' '));
  const frameworkTerms =
    framework === 'next'
      ? ['next', 'metadata', 'layout', 'page', 'route']
      : framework === 'react'
        ? ['react', 'component', 'tsx']
        : ['html', 'script', 'css'];

  return [...new Set([...baseTerms, ...frameworkTerms])].slice(0, 18);
}

function inferFrameworkFromPath(filePath: string): RecommendationFramework {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase();

  if (normalized.includes('/src/app/') || normalized.includes('/src/pages/') || normalized.endsWith('layout.tsx') || normalized.endsWith('page.tsx')) {
    return 'next';
  }

  if (normalized.endsWith('.tsx') || normalized.endsWith('.jsx')) {
    return 'react';
  }

  return 'vanilla';
}

function detectFrameworkFromFiles(filePaths: string[]): {
  framework: RecommendationFramework;
  reason: string;
} {
  let nextScore = 0;
  let reactScore = 0;
  let vanillaScore = 0;

  for (const filePath of filePaths) {
    const inferred = inferFrameworkFromPath(filePath);
    if (inferred === 'next') nextScore += 3;
    else if (inferred === 'react') reactScore += 2;
    else vanillaScore += 1;
  }

  if (nextScore >= reactScore && nextScore > 0) {
    return {
      framework: 'next',
      reason: 'Relevant files are concentrated in Next.js app/page/layout patterns.',
    };
  }

  if (reactScore > 0) {
    return {
      framework: 'react',
      reason: 'Relevant files are primarily React component files (.tsx/.jsx).',
    };
  }

  return {
    framework: 'vanilla',
    reason: 'Relevant files look like plain HTML/CSS/JS assets rather than framework components.',
  };
}

async function walkFiles(dir: string, found: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walkFiles(fullPath, found);
      continue;
    }

    if (!ALLOWED_EXTENSIONS.has(path.extname(entry.name))) continue;
    found.push(fullPath);
  }

  return found;
}

function scoreFile(filePath: string, content: string, terms: string[]): number {
  const normalizedPath = normalizeText(filePath);
  const normalizedContent = normalizeText(content);

  return terms.reduce((score, term) => {
    const pathHits = normalizedPath.includes(term) ? 6 : 0;
    const contentHits = normalizedContent.split(term).length - 1;
    return score + pathHits + Math.min(contentHits, 8);
  }, 0);
}

function buildExcerpt(content: string, terms: string[]): {
  excerpt: string;
  startLine: number;
  endLine: number;
} {
  const lines = content.split(/\r?\n/);
  const matchIndex = lines.findIndex((line) => {
    const normalizedLine = normalizeText(line);
    return terms.some((term) => normalizedLine.includes(term));
  });

  if (matchIndex === -1) {
    return {
      excerpt: lines.slice(0, 60).join('\n').slice(0, 3000),
      startLine: 1,
      endLine: Math.min(lines.length, 60),
    };
  }

  const start = Math.max(0, matchIndex - 10);
  const end = Math.min(lines.length, matchIndex + 18);
  return {
    excerpt: lines.slice(start, end).join('\n').slice(0, 3000),
    startLine: start + 1,
    endLine: end,
  };
}

export async function retrieveCodeContext(input: {
  issue: AuditIssue;
  framework: RecommendationFrameworkMode;
  limit?: number;
}): Promise<{
  framework: RecommendationFramework;
  frameworkReason: string;
  files: AIFixCodeContextFile[];
}> {
  const workspaceRoot = process.cwd();
  const limit = input.limit ?? 4;
  const baseFramework = input.framework === 'auto' ? 'next' : input.framework;
  const searchTerms = buildSearchTerms(input.issue, baseFramework);

  const filePaths = (
    await Promise.all(
      SEARCH_ROOTS.map((root) => walkFiles(path.join(workspaceRoot, root)))
    )
  ).flat();

  const scoredFiles: AIFixCodeContextFile[] = [];

  for (const filePath of filePaths) {
    const content = await fs.readFile(filePath, 'utf8').catch(() => '');
    if (!content) continue;

    const score = scoreFile(filePath, content, searchTerms);
    if (score <= 0) continue;

    const excerpt = buildExcerpt(content, searchTerms);

    scoredFiles.push({
      path: path.relative(workspaceRoot, filePath).replace(/\\/g, '/'),
      score,
      startLine: excerpt.startLine,
      endLine: excerpt.endLine,
      excerpt: excerpt.excerpt,
    });
  }

  const matchedFiles = scoredFiles.sort((a, b) => b.score - a.score).slice(0, limit);
  const detection = input.framework === 'auto'
    ? detectFrameworkFromFiles(matchedFiles.map((file) => file.path))
    : {
        framework: input.framework,
        reason: `Framework was explicitly selected as ${input.framework}.`,
      };

  return {
    framework: detection.framework,
    frameworkReason: detection.reason,
    files: matchedFiles,
  };
}
