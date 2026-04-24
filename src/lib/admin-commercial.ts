import { db } from './db.ts';

interface RawEventContext {
  auditId?: string | null;
  email?: string | null;
  provider?: string | null;
  skippedReason?: string | null;
}

export interface ReportSendRow {
  id: string;
  createdAt: string;
  auditId: string | null;
  email: string | null;
  provider: string | null;
  status: 'sent' | 'skipped';
  skippedReason: string | null;
}

export interface AdminCommercialOverview {
  summary: {
    leadCount: number;
    reportSendCount: number;
    bookingCount: number;
    checkoutCount: number;
  };
  leads: Array<{
    id: string;
    email: string;
    domain: string | null;
    auditId: string | null;
    userEmail: string | null;
    source: string;
    status: string;
    createdAt: string;
  }>;
  reportSends: ReportSendRow[];
  bookings: Array<{
    id: string;
    status: string;
    email: string | null;
    domain: string | null;
    auditId: string | null;
    userEmail: string | null;
    provider: string;
    externalUrl: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  checkouts: Array<{
    id: string;
    status: string;
    email: string | null;
    domain: string | null;
    auditId: string | null;
    userEmail: string | null;
    provider: string;
    externalId: string | null;
    externalUrl: string | null;
    plan: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
}

function parseEventContext(context: unknown): RawEventContext {
  if (!context || typeof context !== 'object' || Array.isArray(context)) {
    return {};
  }

  const raw = context as Record<string, unknown>;
  return {
    auditId: typeof raw.auditId === 'string' ? raw.auditId : null,
    email: typeof raw.email === 'string' ? raw.email : null,
    provider: typeof raw.provider === 'string' ? raw.provider : null,
    skippedReason: typeof raw.skippedReason === 'string' ? raw.skippedReason : null,
  };
}

export async function getAdminCommercialOverview(limit = 50): Promise<AdminCommercialOverview> {
  const [leads, requests, reportEvents] = await Promise.all([
    db.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    }),
    db.commercialRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit * 2,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    }),
    db.appEvent.findMany({
      where: {
        type: 'report.email_sent',
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
  ]);

  const bookings = requests
    .filter((request) => request.type === 'booking')
    .slice(0, limit)
    .map((request) => ({
      id: request.id,
      status: request.status,
      email: request.email,
      domain: request.domain,
      auditId: request.auditId,
      userEmail: request.user?.email ?? null,
      provider: request.provider,
      externalUrl: request.externalUrl,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    }));

  const checkouts = requests
    .filter((request) => request.type === 'checkout')
    .slice(0, limit)
    .map((request) => {
      const payload =
        request.payload && typeof request.payload === 'object' && !Array.isArray(request.payload)
          ? (request.payload as Record<string, unknown>)
          : null;

      return {
        id: request.id,
        status: request.status,
        email: request.email,
        domain: request.domain,
        auditId: request.auditId,
        userEmail: request.user?.email ?? null,
        provider: request.provider,
        externalId: request.externalId,
        externalUrl: request.externalUrl,
        plan: typeof payload?.plan === 'string' ? payload.plan : null,
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString(),
      };
    });

  const reportSends = reportEvents.map((event) => {
    const context = parseEventContext(event.context);
    return {
      id: event.id,
      createdAt: event.createdAt.toISOString(),
      auditId: context.auditId ?? null,
      email: context.email ?? null,
      provider: context.provider ?? null,
      status: context.skippedReason ? 'skipped' : 'sent',
      skippedReason: context.skippedReason ?? null,
    } satisfies ReportSendRow;
  });

  return {
    summary: {
      leadCount: leads.length,
      reportSendCount: reportSends.length,
      bookingCount: bookings.length,
      checkoutCount: checkouts.length,
    },
    leads: leads.map((lead) => ({
      id: lead.id,
      email: lead.email,
      domain: lead.domain,
      auditId: lead.auditId,
      userEmail: lead.user?.email ?? null,
      source: lead.source,
      status: lead.status,
      createdAt: lead.createdAt.toISOString(),
    })),
    reportSends,
    bookings,
    checkouts,
  };
}
