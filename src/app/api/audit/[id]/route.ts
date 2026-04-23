import { NextRequest, NextResponse } from 'next/server';
import type { AuditModules } from '@/lib/audit-engine';
import { getAuditHistoryByDomain, getAuditRecord } from '@/lib/audit-store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const audit = await getAuditRecord(id);

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    // Parse modules from rawModules JSON
    let modules: AuditModules | null = null;
    if (audit.rawModules) {
      try {
        modules = JSON.parse(audit.rawModules) as AuditModules;
      } catch {
        modules = null;
      }
    }

    const history = await getAuditHistoryByDomain(audit.domain);

    return NextResponse.json({
      id: audit.id,
      domain: audit.domain,
      status: audit.status,
      overallScore: audit.overallScore,
      technical: modules?.technical ?? null,
      onPage: modules?.onPage ?? null,
      performance: modules?.performance ?? null,
      cro: modules?.cro ?? null,
      localSeo: modules?.localSeo ?? null,
      aiSeo: modules?.aiSeo ?? null,
      schema: modules?.schema ?? null,
      modules,
      errorMessage: audit.errorMessage,
      isPartial: audit.isPartial,
      partialReason: audit.partialReason,
      history,
      createdAt: audit.createdAt,
      updatedAt: audit.updatedAt,
    });
  } catch (error) {
    console.error(`[GET /api/audit/${_request.nextUrl.pathname.split('/').pop()}] Error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
