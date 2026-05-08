const DEFAULT_SUPPORT_EMAIL = 'ahmad@allinoneseoaudit.com';
const DEFAULT_SUPPORT_WHATSAPP = '+358449568407';

export function getSupportEmail() {
  const configuredEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL;
  const normalizedEmail = configuredEmail
    .replace(/^mailto:/i, '')
    .replace(/^:+/, '')
    .replace(/^["']|["']$/g, '')
    .trim();

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ? normalizedEmail : DEFAULT_SUPPORT_EMAIL;
}

export function getSupportWhatsappNumber() {
  return process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.trim() || DEFAULT_SUPPORT_WHATSAPP;
}

export function getSupportWhatsappUrl(message?: string) {
  const number = getSupportWhatsappNumber().replace(/[^\d]/g, '');
  const url = new URL(`https://wa.me/${number}`);
  if (message?.trim()) {
    url.searchParams.set('text', message.trim());
  }

  return url.toString();
}

export function getPricingInquiryMailto(planName: string) {
  const subject = `Pricing inquiry - ${planName}`;
  const body = `Hi, I am interested in the ${planName}. Please send me the next steps.`;

  return `mailto:${getSupportEmail()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
