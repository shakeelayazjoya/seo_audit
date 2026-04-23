import { NextRequest, NextResponse } from 'next/server';
import { createRequire } from 'node:module';
import type { AuditModules } from '@/lib/audit-engine';
import { getAuditRecord } from '@/lib/audit-store';

const require = createRequire(import.meta.url);

export const runtime = 'nodejs';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderIssues(title: string, module: AuditModules[keyof AuditModules] | null): string {
  if (!module) return '';

  const issueItems = module.issues.slice(0, 6).map((issue) => `
    <div class="issue">
      <div class="issue-head">
        <span class="severity severity-${issue.severity}">${escapeHtml(issue.severity.toUpperCase())}</span>
        <strong>${escapeHtml(issue.title)}</strong>
      </div>
      <p>${escapeHtml(issue.description)}</p>
      <p class="guide"><strong>Fix:</strong> ${escapeHtml(issue.fixGuide)}</p>
    </div>
  `).join('');

  return `
    <section class="module">
      <div class="module-header">
        <div>
          <h2>${escapeHtml(title)}</h2>
          <p>${module.score}/100</p>
        </div>
        <span class="grade grade-${module.grade}">Grade ${module.grade}</span>
      </div>
      ${issueItems || '<p class="muted">No issues detected in this module.</p>'}
    </section>
  `;
}

function buildReportHtml(params: {
  domain: string;
  overallScore: number;
  createdAt: string;
  modules: AuditModules;
}) {
  const modules = [
    ['Technical SEO', params.modules.technical],
    ['On-Page & Content', params.modules.onPage],
    ['Performance / CWV', params.modules.performance],
    ['CRO Analysis', params.modules.cro],
    ['Local SEO', params.modules.localSeo],
    ['AI SEO / E-E-A-T', params.modules.aiSeo],
    ['Schema Markup', params.modules.schema],
  ] as const;

  const topIssues = modules
    .flatMap(([moduleName, module]) =>
      (module?.issues ?? []).map((issue) => ({ moduleName, issue }))
    )
    .sort((a, b) => b.issue.impactScore - a.issue.impactScore)
    .slice(0, 8)
    .map(
      ({ moduleName, issue }) => `
        <tr>
          <td>${escapeHtml(moduleName)}</td>
          <td>${escapeHtml(issue.title)}</td>
          <td>${escapeHtml(issue.severity)}</td>
          <td>${issue.impactScore}/10</td>
          <td>${issue.effortScore}/10</td>
        </tr>
      `
    )
    .join('');

  const moduleSections = modules.map(([title, module]) => renderIssues(title, module)).join('');

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>SEO Audit Report - ${escapeHtml(params.domain)}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #111827; background: #f8fafc; }
          .page { padding: 36px; }
          .hero { background: linear-gradient(135deg, #0f172a, #1d4ed8); color: white; padding: 28px; border-radius: 20px; }
          .hero-grid { display: grid; grid-template-columns: 1.4fr 0.6fr; gap: 24px; align-items: center; }
          .score { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18); border-radius: 16px; padding: 20px; text-align: center; }
          .score strong { display: block; font-size: 46px; line-height: 1; margin-bottom: 6px; }
          .summary, .module, .top-issues { background: white; border-radius: 18px; padding: 24px; margin-top: 24px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06); }
          .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 18px; }
          .stat { background: #eff6ff; padding: 14px; border-radius: 14px; }
          .stat span { display: block; font-size: 12px; color: #475569; margin-bottom: 4px; }
          .stat strong { font-size: 20px; }
          .module-header { display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 18px; }
          .grade { padding: 8px 12px; border-radius: 999px; font-weight: 700; font-size: 12px; }
          .grade-A { background: #dcfce7; color: #166534; }
          .grade-B { background: #d1fae5; color: #065f46; }
          .grade-C { background: #fef3c7; color: #92400e; }
          .grade-D { background: #fed7aa; color: #9a3412; }
          .grade-F { background: #fee2e2; color: #991b1b; }
          .issue { border-top: 1px solid #e2e8f0; padding: 14px 0; }
          .issue:first-of-type { border-top: 0; padding-top: 0; }
          .issue-head { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; }
          .severity { padding: 4px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
          .severity-critical { background: #fee2e2; color: #991b1b; }
          .severity-warning { background: #ffedd5; color: #9a3412; }
          .severity-opportunity { background: #dcfce7; color: #166534; }
          .guide { color: #334155; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          th { color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
          .muted { color: #64748b; }
        </style>
      </head>
      <body>
        <main class="page">
          <section class="hero">
            <div class="hero-grid">
              <div>
                <p>SEO Audit Report</p>
                <h1>${escapeHtml(params.domain)}</h1>
                <p>Generated on ${escapeHtml(new Date(params.createdAt).toLocaleString())}</p>
                <div class="stats">
                  <div class="stat"><span>Technical</span><strong>${params.modules.technical?.score ?? 'N/A'}</strong></div>
                  <div class="stat"><span>On-Page</span><strong>${params.modules.onPage?.score ?? 'N/A'}</strong></div>
                  <div class="stat"><span>Performance</span><strong>${params.modules.performance?.score ?? 'N/A'}</strong></div>
                  <div class="stat"><span>CRO</span><strong>${params.modules.cro?.score ?? 'N/A'}</strong></div>
                </div>
              </div>
              <div class="score">
                <strong>${params.overallScore}</strong>
                <span>Overall SEO Score</span>
              </div>
            </div>
          </section>

          <section class="top-issues">
            <h2>Highest Priority Issues</h2>
            <table>
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Issue</th>
                  <th>Severity</th>
                  <th>Impact</th>
                  <th>Effort</th>
                </tr>
              </thead>
              <tbody>
                ${topIssues || '<tr><td colspan="5">No high-priority issues detected.</td></tr>'}
              </tbody>
            </table>
          </section>

          ${moduleSections}
        </main>
      </body>
    </html>
  `;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const audit = await getAuditRecord(id);

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    const modules = audit.rawModules ? (JSON.parse(audit.rawModules) as AuditModules) : null;
    if (!modules) {
      return NextResponse.json({ error: 'Audit modules unavailable' }, { status: 500 });
    }

    const { chromium } = require('playwright') as typeof import('playwright');
    const browser = await chromium.launch({ headless: true });

    try {
      const page = await browser.newPage();
      await page.setContent(
        buildReportHtml({
          domain: audit.domain,
          overallScore: audit.overallScore,
          createdAt: audit.createdAt,
          modules,
        }),
        { waitUntil: 'load' }
      );

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '12mm', right: '10mm', bottom: '12mm', left: '10mm' },
      });

      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${audit.domain.replace(/[^a-z0-9]+/gi, '-')}-seo-audit.pdf"`,
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('[GET /api/report/[id]] Error:', error);
    return NextResponse.json({ error: 'Unable to generate PDF report' }, { status: 500 });
  }
}
