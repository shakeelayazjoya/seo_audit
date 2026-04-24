import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { generateAuditPdf } from '@/lib/report-pdf';
import { sendEmail } from '@/lib/email';
import { buildReportDeliveryEmail } from '@/lib/email-templates';
import { logAppEvent } from '@/lib/monitoring';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromRequest(request);
    const body = await request.json().catch(() => ({}));
    const requestedEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const targetEmail = requestedEmail || session?.user.email || '';

    if (!EMAIL_REGEX.test(targetEmail)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const { audit, modules, pdf, filename } = await generateAuditPdf(id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const reportUrl = `${appUrl}/?audit=${audit.id}`;
    const email = buildReportDeliveryEmail({
      domain: audit.domain,
      recipientEmail: targetEmail,
      overallScore: audit.overallScore,
      reportUrl,
      modules,
    });

    const delivery = await sendEmail({
      to: targetEmail,
      subject: email.subject,
      html: email.html,
      text: email.text,
      attachments: [
        {
          filename,
          content: pdf,
          contentType: 'application/pdf',
        },
      ],
    });

    await logAppEvent({
      level: delivery.success ? 'info' : 'warn',
      type: 'report.email_sent',
      message: delivery.success ? 'Audit report email sent' : 'Audit report email skipped',
      context: {
        auditId: audit.id,
        email: targetEmail,
        provider: delivery.provider,
        skippedReason: delivery.skippedReason ?? null,
      },
    });

    return NextResponse.json({
      success: delivery.success,
      provider: delivery.provider,
      skippedReason: delivery.skippedReason ?? null,
    });
  } catch (error) {
    console.error('[POST /api/report/[id]/send] Error:', error);
    const message = error instanceof Error ? error.message : 'Unable to send report email';
    return NextResponse.json({ error: message }, { status: message === 'Audit not found' ? 404 : 500 });
  }
}
