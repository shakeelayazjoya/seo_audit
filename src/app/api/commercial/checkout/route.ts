import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import { buildCheckoutEmail } from '@/lib/email-templates';
import { sendEmail } from '@/lib/email';
import { logAppEvent } from '@/lib/monitoring';

const PRICE_ENV_MAP: Record<string, string | undefined> = {
  diy: process.env.STRIPE_PRICE_DIY,
  strategy: process.env.STRIPE_PRICE_STRATEGY,
  implementation: process.env.STRIPE_PRICE_IMPLEMENTATION,
};

function getRequesterKey(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'
  );
}

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const rateLimit = await enforceRateLimit({
      key: session?.user.id ?? getRequesterKey(request),
      action: 'commercial_checkout',
      limit: 8,
      windowMs: 1000 * 60 * 30,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many checkout attempts. Please try later.' }, { status: 429 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
    }

    const body = await request.json();
    const plan = String(body.plan ?? 'diy');
    const price = PRICE_ENV_MAP[plan];

    if (!price) {
      return NextResponse.json({ error: 'Unknown or unconfigured plan' }, { status: 400 });
    }

    const form = new URLSearchParams();
    form.set('mode', 'payment');
    form.set('success_url', `${appUrl}/?checkout=success`);
    form.set('cancel_url', `${appUrl}/?checkout=cancelled`);
    form.set('line_items[0][price]', price);
    form.set('line_items[0][quantity]', '1');
    if (session?.user.email) {
      form.set('customer_email', session.user.email);
    }

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text();
      return NextResponse.json({ error: `Stripe checkout failed: ${errorText}` }, { status: 502 });
    }

    const stripeSession = await stripeResponse.json() as { id: string; url?: string };

    const record = await db.commercialRequest.create({
      data: {
        type: 'checkout',
        provider: 'stripe',
        status: 'created',
        userId: session?.user.id ?? null,
        email: session?.user.email ?? null,
        externalId: stripeSession.id,
        externalUrl: stripeSession.url ?? null,
        payload: { plan },
      },
    });

    let emailDelivery: { success: boolean; provider: string; skippedReason?: string | null } | null = null;
    if (session?.user.email && stripeSession.url) {
      const email = buildCheckoutEmail({
        recipientEmail: session.user.email,
        plan,
        checkoutUrl: stripeSession.url,
      });
      emailDelivery = await sendEmail({
        to: session.user.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
    }

    await logAppEvent({
      level: emailDelivery?.success === false ? 'warn' : 'info',
      type: 'commercial.checkout_created',
      message: 'Checkout flow created',
      context: {
        requestId: record.id,
        plan,
        sessionId: stripeSession.id,
        emailDelivery,
      },
    });

    return NextResponse.json({
      url: stripeSession.url ?? null,
      sessionId: stripeSession.id,
      requestId: record.id,
      emailDelivery,
    });
  } catch (error) {
    console.error('[POST /api/commercial/checkout] Error:', error);
    return NextResponse.json({ error: 'Unable to create checkout session' }, { status: 500 });
  }
}
