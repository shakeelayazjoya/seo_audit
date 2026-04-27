import { db } from './db.ts';

interface RawEventContext {
  auditId?: string | null;
  email?: string | null;
  userEmail?: string | null;
  userId?: string | null;
  provider?: string | null;
  skippedReason?: string | null;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  } | null;
  requestId?: string | null;
  plan?: string | null;
  sessionId?: string | null;
  domain?: string | null;
  issueTitle?: string | null;
  warning?: string | null;
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
    userCount: number;
    activeSessionCount: number;
    loginCount: number;
    signupCount: number;
    aiCallCount: number;
    aiTokenTotal: number;
    subscriptionIntentCount: number;
  };
  auth: {
    recentLogins24h: number;
    recentSignups24h: number;
  };
  aiUsage: {
    totalCalls: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    byProvider: Array<{
      provider: string;
      calls: number;
      totalTokens: number;
    }>;
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
  aiCalls: Array<{
    id: string;
    createdAt: string;
    provider: string | null;
    framework: string | null;
    email: string | null;
    domain: string | null;
    issueTitle: string | null;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    warning: string | null;
  }>;
  users: Array<{
    id: string;
    email: string;
    role: string;
    createdAt: string;
    auditCount: number;
    activeSessionCount: number;
    lastLoginAt: string | null;
    aiCallCount: number;
    aiTokenTotal: number;
    checkoutCount: number;
  }>;
}

function parseEventContext(context: unknown): RawEventContext {
  if (!context || typeof context !== 'object' || Array.isArray(context)) {
    return {};
  }

  const raw = context as Record<string, unknown>;
  const usageRaw =
    raw.usage && typeof raw.usage === 'object' && !Array.isArray(raw.usage)
      ? (raw.usage as Record<string, unknown>)
      : null;

  return {
    auditId: typeof raw.auditId === 'string' ? raw.auditId : null,
    email: typeof raw.email === 'string' ? raw.email : null,
    userEmail: typeof raw.userEmail === 'string' ? raw.userEmail : null,
    userId: typeof raw.userId === 'string' ? raw.userId : null,
    provider: typeof raw.provider === 'string' ? raw.provider : null,
    skippedReason: typeof raw.skippedReason === 'string' ? raw.skippedReason : null,
    requestId: typeof raw.requestId === 'string' ? raw.requestId : null,
    plan: typeof raw.plan === 'string' ? raw.plan : null,
    sessionId: typeof raw.sessionId === 'string' ? raw.sessionId : null,
    domain: typeof raw.domain === 'string' ? raw.domain : null,
    issueTitle: typeof raw.issueTitle === 'string' ? raw.issueTitle : null,
    warning: typeof raw.warning === 'string' ? raw.warning : null,
    usage: usageRaw
      ? {
          inputTokens: Number(usageRaw.inputTokens ?? 0) || 0,
          outputTokens: Number(usageRaw.outputTokens ?? 0) || 0,
          totalTokens: Number(usageRaw.totalTokens ?? 0) || 0,
        }
      : null,
  };
}

export async function getAdminCommercialOverview(limit = 50): Promise<AdminCommercialOverview> {
  const now = new Date();
  const dayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24);

  const [users, activeSessionCount, leads, requests, reportEvents, authEvents, aiEvents] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        audits: { select: { id: true } },
        sessions: {
          where: { expiresAt: { gt: now } },
          select: { id: true, expiresAt: true },
        },
      },
      take: Math.max(limit, 100),
    }),
    db.session.count({
      where: { expiresAt: { gt: now } },
    }),
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
      take: limit * 3,
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
    db.appEvent.findMany({
      where: {
        type: { in: ['auth.login', 'auth.signup', 'auth.login_failed', 'auth.logout'] },
      },
      orderBy: { createdAt: 'desc' },
      take: limit * 5,
    }),
    db.appEvent.findMany({
      where: {
        type: { in: ['ai.fix.generated', 'ai.fix.fallback'] },
      },
      orderBy: { createdAt: 'desc' },
      take: limit * 5,
    }),
  ]);

  const loginEvents = authEvents.filter((event) => event.type === 'auth.login');
  const signupEvents = authEvents.filter((event) => event.type === 'auth.signup');

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

  const aiCalls = aiEvents.slice(0, limit).map((event) => {
    const context = parseEventContext(event.context);
    return {
      id: event.id,
      createdAt: event.createdAt.toISOString(),
      provider: context.provider ?? null,
      framework:
        event.context && typeof event.context === 'object' && !Array.isArray(event.context)
          ? ((event.context as Record<string, unknown>).framework as string | null) ?? null
          : null,
      email: context.userEmail ?? context.email ?? null,
      domain: context.domain ?? null,
      issueTitle: context.issueTitle ?? null,
      inputTokens: context.usage?.inputTokens ?? 0,
      outputTokens: context.usage?.outputTokens ?? 0,
      totalTokens: context.usage?.totalTokens ?? 0,
      warning: context.warning ?? null,
    };
  });

  const aiUsageSummary = aiCalls.reduce(
    (acc, call) => {
      acc.totalCalls += 1;
      acc.totalInputTokens += call.inputTokens;
      acc.totalOutputTokens += call.outputTokens;
      acc.totalTokens += call.totalTokens;
      const provider = call.provider ?? 'unknown';
      const bucket = acc.byProvider.get(provider) ?? { provider, calls: 0, totalTokens: 0 };
      bucket.calls += 1;
      bucket.totalTokens += call.totalTokens;
      acc.byProvider.set(provider, bucket);
      return acc;
    },
    {
      totalCalls: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      byProvider: new Map<string, { provider: string; calls: number; totalTokens: number }>(),
    }
  );

  const lastLoginByEmail = new Map<string, string>();
  for (const event of loginEvents) {
    const context = parseEventContext(event.context);
    const email = context.email ?? context.userEmail;
    if (email && !lastLoginByEmail.has(email)) {
      lastLoginByEmail.set(email, event.createdAt.toISOString());
    }
  }

  const aiByEmail = new Map<string, { calls: number; tokens: number }>();
  for (const call of aiCalls) {
    if (!call.email) continue;
    const bucket = aiByEmail.get(call.email) ?? { calls: 0, tokens: 0 };
    bucket.calls += 1;
    bucket.tokens += call.totalTokens;
    aiByEmail.set(call.email, bucket);
  }

  const checkoutCountByEmail = new Map<string, number>();
  for (const checkout of checkouts) {
    const email = checkout.email ?? checkout.userEmail;
    if (!email) continue;
    checkoutCountByEmail.set(email, (checkoutCountByEmail.get(email) ?? 0) + 1);
  }

  const userRows = users.slice(0, limit).map((user) => ({
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    auditCount: user.audits.length,
    activeSessionCount: user.sessions.length,
    lastLoginAt: lastLoginByEmail.get(user.email) ?? null,
    aiCallCount: aiByEmail.get(user.email)?.calls ?? 0,
    aiTokenTotal: aiByEmail.get(user.email)?.tokens ?? 0,
    checkoutCount: checkoutCountByEmail.get(user.email) ?? 0,
  }));

  return {
    summary: {
      leadCount: leads.length,
      reportSendCount: reportSends.length,
      bookingCount: bookings.length,
      checkoutCount: checkouts.length,
      userCount: users.length,
      activeSessionCount,
      loginCount: loginEvents.length,
      signupCount: signupEvents.length,
      aiCallCount: aiUsageSummary.totalCalls,
      aiTokenTotal: aiUsageSummary.totalTokens,
      subscriptionIntentCount: checkouts.length,
    },
    auth: {
      recentLogins24h: loginEvents.filter((event) => event.createdAt >= dayAgo).length,
      recentSignups24h: signupEvents.filter((event) => event.createdAt >= dayAgo).length,
    },
    aiUsage: {
      totalCalls: aiUsageSummary.totalCalls,
      totalInputTokens: aiUsageSummary.totalInputTokens,
      totalOutputTokens: aiUsageSummary.totalOutputTokens,
      totalTokens: aiUsageSummary.totalTokens,
      byProvider: [...aiUsageSummary.byProvider.values()],
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
    aiCalls,
    users: userRows,
  };
}
