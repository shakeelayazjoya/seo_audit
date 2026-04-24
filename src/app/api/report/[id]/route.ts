import { NextRequest, NextResponse } from 'next/server';
import { generateAuditPdf } from '@/lib/report-pdf';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { pdf, filename } = await generateAuditPdf(id);

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[GET /api/report/[id]] Error:', error);
    const message = error instanceof Error ? error.message : 'Unable to generate PDF report';
    return NextResponse.json({ error: message }, { status: message === 'Audit not found' ? 404 : 500 });
  }
}
