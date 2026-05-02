const DEFAULT_SUPPORT_EMAIL = 'ahmad@allinoneseoaudit.com';
const DEFAULT_SUPPORT_WHATSAPP = '+358449568407';

export function getSupportEmail() {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL;
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
