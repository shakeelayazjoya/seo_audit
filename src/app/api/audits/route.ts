import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const audits = await db.audit.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        domain: true,
        status: true,
        overallScore: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ audits });
  } catch (error) {
    console.error('[GET /api/audits] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
