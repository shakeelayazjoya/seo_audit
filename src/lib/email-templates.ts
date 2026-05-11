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
  modules: AuditModules;
}) {
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

  const subject = `Your SEO audit report for ${params.domain}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.6">
      <h1 style="margin-bottom:8px;">Your SEO audit is ready</h1>
      <p>We generated a fresh audit for <strong>${escapeHtml(params.domain)}</strong>.</p>
      <p style="font-size:16px;">Overall score: <strong>${params.overallScore}/100</strong></p>
      <p>You can open the live report anytime here:</p>
      <p><a href="${escapeHtml(params.reportUrl)}" style="display:inline-block;background:#0f172a;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;">Open audit report</a></p>
      <h2 style="margin-top:28px;">Top recommendations</h2>
      ${topIssuesHtml}
      <p style="margin-top:28px;">We also attached the PDF version for easy sharing.</p>
    </div>
  `;

  const text = [
    `Your SEO audit for ${params.domain} is ready.`,
    `Overall score: ${params.overallScore}/100`,
    `Open report: ${params.reportUrl}`,
    '',
    'Top recommendations:',
    ...topIssues.map((issue) => `- ${issue.title}: ${issue.fixGuide}`),
  ].join('\n');

  return { subject, html, text };
}

export function buildAuditCompletedAdminEmail(params: {
  domain: string;
  auditId: string;
  overallScore: number;
  reportUrl: string;
  requesterEmail?: string | null;
  isPartial?: boolean;
  partialReason?: string | null;
}) {
  const requesterEmail = params.requesterEmail?.trim() || 'Not available';
  const coverageLabel = params.isPartial ? 'Degraded coverage' : 'Full coverage';
  const subject = `SEO audit completed: ${params.domain} (${params.overallScore}/100)`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.6">
      <h1 style="margin-bottom:8px;">SEO audit completed</h1>
      <p>A website audit has finished and is ready to review.</p>
      <div style="padding:14px 16px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
        <p><strong>Domain:</strong> ${escapeHtml(params.domain)}</p>
        <p><strong>Overall score:</strong> ${params.overallScore}/100</p>
        <p><strong>Audit ID:</strong> ${escapeHtml(params.auditId)}</p>
        <p><strong>Requester email:</strong> ${escapeHtml(requesterEmail)}</p>
        <p><strong>Coverage:</strong> ${escapeHtml(coverageLabel)}</p>
        ${params.partialReason ? `<p><strong>Coverage note:</strong> ${escapeHtml(params.partialReason)}</p>` : ''}
      </div>
      <p style="margin-top:18px;"><a href="${escapeHtml(params.reportUrl)}" style="display:inline-block;background:#f97316;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;">Open audit report</a></p>
    </div>
  `;

  const text = [
    'SEO audit completed',
    `Domain: ${params.domain}`,
    `Overall score: ${params.overallScore}/100`,
    `Audit ID: ${params.auditId}`,
    `Requester email: ${requesterEmail}`,
    `Coverage: ${coverageLabel}`,
    params.partialReason ? `Coverage note: ${params.partialReason}` : null,
    `Open report: ${params.reportUrl}`,
  ].filter(Boolean).join('\n');

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
  const displayName = params.name.trim() || 'Website visitor';
  const displayPhone = params.phone.trim() || 'Not provided';
  const subject = `New contact inquiry from ${displayName}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.6">
      <h1 style="margin-bottom:8px;">New contact inquiry</h1>
      <p><strong>Name:</strong> ${escapeHtml(displayName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(params.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(displayPhone)}</p>
      <p><strong>Message:</strong></p>
      <div style="padding:12px 14px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;white-space:pre-wrap;">${escapeHtml(params.message)}</div>
    </div>
  `;
  const text = [
    'New contact inquiry',
    `Name: ${displayName}`,
    `Email: ${params.email}`,
    `Phone: ${displayPhone}`,
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
  const greetingName = params.name.trim() || 'there';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.6">
      <h1 style="margin-bottom:8px;">Thanks for reaching out, ${escapeHtml(greetingName)}</h1>
      <p>We received your message and will get back to you shortly.</p>
    </div>
  `;
  const text = `Thanks for reaching out, ${greetingName}. We received your message and will get back to you shortly.`;
  return { subject, html, text };
}

export function buildPasswordResetEmail(params: {
  resetUrl: string;
  recipientEmail: string;
  expiresInMinutes: number;
}) {
  const subject = 'Reset your All In One SEO Audit password';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.6">
      <h1 style="margin-bottom:8px;">Reset your password</h1>
      <p>We received a request to reset the password for <strong>${escapeHtml(params.recipientEmail)}</strong>.</p>
      <p>This link expires in ${params.expiresInMinutes} minutes.</p>
      <p><a href="${escapeHtml(params.resetUrl)}" style="display:inline-block;background:#f97316;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;">Reset password</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `;
  const text = [
    'Reset your All In One SEO Audit password',
    `Email: ${params.recipientEmail}`,
    `This link expires in ${params.expiresInMinutes} minutes.`,
    `Reset link: ${params.resetUrl}`,
    '',
    'If you did not request this, you can safely ignore this email.',
  ].join('\n');

  return { subject, html, text };
}
