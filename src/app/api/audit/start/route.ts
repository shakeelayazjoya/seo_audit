import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  generateAuditModules,
  calculateOverallScore,
} from '@/lib/audit-mock';
import type { AuditModules } from '@/lib/audit-mock';

const DOMAIN_REGEX = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain } = body as { domain?: string };

    // ── Validate domain ───────────────────────────────────────────────────
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    const normalized = domain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');

    if (!DOMAIN_REGEX.test(normalized)) {
      return NextResponse.json(
        { error: 'Invalid domain format. Please provide a valid domain (e.g. example.com)' },
        { status: 400 }
      );
    }

    // ── Create audit record (queued) ──────────────────────────────────────
    const audit = await db.audit.create({
      data: {
        domain: normalized,
        status: 'queued',
        overallScore: 0,
      },
    });

    // ── Simulate audit (~2 seconds) ───────────────────────────────────────
    await sleep(2000);

    // ── Generate mock module data ─────────────────────────────────────────
    const modules: AuditModules = generateAuditModules(normalized);
    const overallScore = calculateOverallScore(modules);

    // ── Update audit with results ─────────────────────────────────────────
    const updated = await db.audit.update({
      where: { id: audit.id },
      data: {
        status: 'complete',
        overallScore,
        technical: JSON.stringify(modules.technical),
        onPage: JSON.stringify(modules.onPage),
        performance: JSON.stringify(modules.performance),
        cro: JSON.stringify(modules.cro),
        localSeo: JSON.stringify(modules.localSeo),
        aiSeo: JSON.stringify(modules.aiSeo),
        schema: JSON.stringify(modules.schema),
        rawModules: JSON.stringify(modules),
      },
    });

    // ── Return full audit result ──────────────────────────────────────────
    return NextResponse.json({
      id: updated.id,
      domain: updated.domain,
      status: updated.status,
      overallScore: updated.overallScore,
      modules,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error('[POST /api/audit/start] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
