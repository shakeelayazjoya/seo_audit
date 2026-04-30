import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { generateAuditPdfVariant, persistAuditPdfReport } from '@/lib/report-pdf';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromRequest(_request);

    if (session?.user?.id) {
      const { pdf, filename, cloudinary } = await persistAuditPdfReport(id);

      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${filename}"`,
          'X-Cloudinary-Url': cloudinary.secureUrl,
          'X-Cloudinary-Public-Id': cloudinary.publicId,
        },
      });
    }

    const { pdf, filename } = await generateAuditPdfVariant(id, 'preview');

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'X-Report-Variant': 'preview',
      },
    });
  } catch (error) {
    console.error('[GET /api/report/[id]] Error:', error);
    const message = error instanceof Error ? error.message : 'Unable to generate PDF report';
    return NextResponse.json({ error: message }, { status: message === 'Audit not found' ? 404 : 500 });
  }
}
