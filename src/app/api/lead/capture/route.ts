import { NextRequest, NextResponse } from 'next/server';
import { saveLeadRecord } from '@/lib/audit-store';
import { getSessionFromRequest } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import { logAppEvent } from '@/lib/monitoring';
import { generateAuditPdf } from '@/lib/report-pdf';
import { sendEmail } from '@/lib/email';
import { buildReportDeliveryEmail } from '@/lib/email-templates';
import { db } from '@/lib/db';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRequesterKey(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const rateLimit = await enforceRateLimit({
      key: session?.user?.id ?? getRequesterKey(request),
      action: 'lead_capture',
      limit: 10,
      windowMs: 1000 * 60 * 30,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many lead submissions. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const { email, domain, auditId, source } = body as {
      email?: string;
      domain?: string;
      auditId?: string;
      source?: string;
    };

    // ── Validate email ────────────────────────────────────────────────────
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const trimmed = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmed)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // ── Validate source if provided ───────────────────────────────────────
    const validSources = ['pdf_gate', 'calendly', 'stripe', 'website', 'referral'];
    const leadSource = source && validSources.includes(source) ? source : 'pdf_gate';

    // ── Create lead record ────────────────────────────────────────────────
    const lead = await saveLeadRecord({
      email: trimmed,
      domain: domain || null,
      auditId: auditId || null,
      source: leadSource,
      userId: session?.user?.id ?? null,
    });

    let emailDelivery: { success: boolean; provider: string; skippedReason?: string | null } | null = null;

    if (auditId) {
      try {
        const { audit, modules, pdf, filename } = await generateAuditPdf(auditId);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
        const reportUrl = `${appUrl}/?audit=${audit.id}`;
        const email = buildReportDeliveryEmail({
          domain: audit.domain,
          recipientEmail: trimmed,
          overallScore: audit.overallScore,
          reportUrl,
          modules,
        });

        emailDelivery = await sendEmail({
          to: trimmed,
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

        await db.lead.update({
          where: { id: lead.id },
          data: {
            status: emailDelivery.success ? 'emailed' : 'captured',
          },
        }).catch(() => {});
      } catch (emailError) {
        emailDelivery = {
          success: false,
          provider: 'report',
          skippedReason: emailError instanceof Error ? emailError.message : 'Failed to prepare report email',
        };
      }
    }

    await logAppEvent({
      level: emailDelivery?.success === false ? 'warn' : 'info',
      type: 'lead.captured',
      message: 'Lead captured',
      context: {
        leadId: lead.id,
        domain: domain || null,
        auditId: auditId || null,
        source: leadSource,
        emailDelivery,
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: lead.id,
        email: lead.email,
        source: lead.source,
        createdAt: lead.createdAt,
        emailDelivery,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/lead/capture] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
