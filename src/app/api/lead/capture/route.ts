import { NextRequest, NextResponse } from 'next/server';
import { saveLeadRecord } from '@/lib/audit-store';
import { getSessionFromRequest } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import { logAppEvent } from '@/lib/monitoring';

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

    await logAppEvent({
      level: 'info',
      type: 'lead.captured',
      message: 'Lead captured',
      context: {
        leadId: lead.id,
        domain: domain || null,
        auditId: auditId || null,
        source: leadSource,
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: lead.id,
        email: lead.email,
        source: lead.source,
        createdAt: lead.createdAt,
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
