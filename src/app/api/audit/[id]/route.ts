import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { AuditModules } from '@/lib/audit-mock';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const audit = await db.audit.findUnique({
      where: { id },
    });

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

    return NextResponse.json({
      id: audit.id,
      domain: audit.domain,
      status: audit.status,
      overallScore: audit.overallScore,
      modules,
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
