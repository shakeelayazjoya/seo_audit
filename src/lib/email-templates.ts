import type { AuditModules } from '@/lib/audit-engine';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildReportDeliveryEmail(params: {
  domain: string;
  recipientEmail: string;
  overallScore: number;
  reportUrl: string;
  loginUrl?: string;
  modules: AuditModules;
  variant?: 'full' | 'preview';
}) {
  const variant = params.variant ?? 'full';
  const topIssues = [
    ...params.modules.technical.issues,
    ...params.modules.onPage.issues,
    ...params.modules.performance.issues,
    ...params.modules.cro.issues,
    ...params.modules.localSeo.issues,
    ...params.modules.aiSeo.issues,
    ...params.modules.schema.issues,
  ]
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 3);

  const topIssuesHtml = topIssues.length
    ? `<ul>${topIssues.map((issue) => `<li><strong>${escapeHtml(issue.title)}</strong>: ${escapeHtml(issue.fixGuide)}</li>`).join('')}</ul>`
    : '<p>No critical issues were detected in this run.</p>';

  const subject =
    variant === 'preview'
      ? `Your SEO audit preview for ${params.domain}`
      : `Your SEO audit report for ${params.domain}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.6">
      <h1 style="margin-bottom:8px;">${variant === 'preview' ? 'Your SEO audit preview is ready' : 'Your SEO audit is ready'}</h1>
      <p>We generated a fresh audit for <strong>${escapeHtml(params.domain)}</strong>.</p>
      <p style="font-size:16px;">Overall score: <strong>${params.overallScore}/100</strong></p>
      <p>${variant === 'preview' ? 'You can open the live preview here:' : 'You can open the live report anytime here:'}</p>
      <p><a href="${escapeHtml(params.reportUrl)}" style="display:inline-block;background:#0f172a;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;">Open audit report</a></p>
      <h2 style="margin-top:28px;">Top recommendations</h2>
      ${topIssuesHtml}
      <p style="margin-top:28px;">${variant === 'preview' ? 'We also attached the preview PDF version. Sign in to unlock the full report, full fix plans, and the complete PDF.' : 'We also attached the PDF version for easy sharing.'}</p>
      ${variant === 'preview' && params.loginUrl ? `<p><a href="${escapeHtml(params.loginUrl)}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;">Sign in for the full report</a></p>` : ''}
    </div>
  `;

  const text = [
    variant === 'preview'
      ? `Your SEO audit preview for ${params.domain} is ready.`
      : `Your SEO audit for ${params.domain} is ready.`,
    `Overall score: ${params.overallScore}/100`,
    `Open report: ${params.reportUrl}`,
    ...(variant === 'preview' && params.loginUrl ? [`Sign in for the full report: ${params.loginUrl}`] : []),
    '',
    'Top recommendations:',
    ...topIssues.map((issue) => `- ${issue.title}: ${issue.fixGuide}`),
  ].join('\n');

  return { subject, html, text };
}

export function buildBookingConfirmationEmail(params: {
  recipientEmail: string;
  domain: string | null;
  bookingUrl: string;
}) {
  const subject = params.domain
    ? `Book your SEO strategy call for ${params.domain}`
    : 'Book your SEO strategy call';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.6">
      <h1 style="margin-bottom:8px;">Your strategy call link is ready</h1>
      <p>Use the button below to book your SEO strategy session${params.domain ? ` for <strong>${escapeHtml(params.domain)}</strong>` : ''}.</p>
      <p><a href="${escapeHtml(params.bookingUrl)}" style="display:inline-block;background:#0f172a;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;">Book now</a></p>
      <p>If you are not ready right now, you can come back to this email anytime.</p>
    </div>
  `;
  const text = [
    'Your strategy call link is ready.',
    params.domain ? `Domain: ${params.domain}` : null,
    `Booking link: ${params.bookingUrl}`,
  ].filter(Boolean).join('\n');

  return { subject, html, text };
}

export function buildCheckoutEmail(params: {
  recipientEmail: string;
  plan: string;
  checkoutUrl: string;
}) {
  const subject = `Complete your ${params.plan} SEO plan checkout`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.6">
      <h1 style="margin-bottom:8px;">Your checkout link is ready</h1>
      <p>Continue with the <strong>${escapeHtml(params.plan)}</strong> plan whenever you are ready.</p>
      <p><a href="${escapeHtml(params.checkoutUrl)}" style="display:inline-block;background:#0f172a;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;">Resume checkout</a></p>
    </div>
  `;
  const text = [
    `Your ${params.plan} SEO plan checkout link is ready.`,
    `Checkout link: ${params.checkoutUrl}`,
  ].join('\n');

  return { subject, html, text };
}

export function buildContactInquiryAdminEmail(params: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const subject = `New contact inquiry from ${params.name}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.6">
      <h1 style="margin-bottom:8px;">New contact inquiry</h1>
      <p><strong>Name:</strong> ${escapeHtml(params.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(params.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(params.phone)}</p>
      <p><strong>Message:</strong></p>
      <div style="padding:12px 14px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;white-space:pre-wrap;">${escapeHtml(params.message)}</div>
    </div>
  `;
  const text = [
    'New contact inquiry',
    `Name: ${params.name}`,
    `Email: ${params.email}`,
    `Phone: ${params.phone}`,
    '',
    'Message:',
    params.message,
  ].join('\n');

  return { subject, html, text };
}

export function buildContactConfirmationEmail(params: {
  name: string;
}) {
  const subject = 'We received your message';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.6">
      <h1 style="margin-bottom:8px;">Thanks for reaching out, ${escapeHtml(params.name)}</h1>
      <p>We received your message and will get back to you shortly.</p>
    </div>
  `;
  const text = `Thanks for reaching out, ${params.name}. We received your message and will get back to you shortly.`;
  return { subject, html, text };
}
