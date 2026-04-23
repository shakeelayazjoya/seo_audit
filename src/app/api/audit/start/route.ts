import { NextRequest, NextResponse } from 'next/server';
import { enqueueAuditJob } from '@/lib/audit-store';
import { getSessionFromRequest } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import { logAppEvent } from '@/lib/monitoring';
import { triggerBackgroundAuditDrain } from '@/lib/audit-worker-runtime';

const DOMAIN_REGEX = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
export const runtime = 'nodejs';

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
      action: 'audit_start',
      limit: session ? 12 : 5,
      windowMs: 1000 * 60 * 15,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many audit requests. Please try again shortly.' }, { status: 429 });
    }

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

    const now = new Date();
    const auditId = crypto.randomUUID();

    await enqueueAuditJob({
      auditId,
      domain: normalized,
      userId: session?.user?.id ?? null,
    });

    await logAppEvent({
      level: 'info',
      type: 'audit.queued',
      message: 'Audit job queued',
      context: {
        auditId,
        domain: normalized,
        userId: session?.user?.id ?? null,
      },
    });

    triggerBackgroundAuditDrain();

    return NextResponse.json(
      {
        id: auditId,
        domain: normalized,
        status: 'queued',
        overallScore: 0,
        createdAt: now,
        updatedAt: now,
        isPartial: false,
        partialReason: null,
        modules: null,
        history: [],
      }
    );
  } catch (error) {
    console.error('[POST /api/audit/start] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
