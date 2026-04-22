import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
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
    const lead = await db.lead.create({
      data: {
        email: trimmed,
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
