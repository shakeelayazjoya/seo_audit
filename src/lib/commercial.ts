export function buildCalendlyBookingUrl(params: {
  calendlyUrl: string;
  email?: string | null;
  name?: string | null;
  domain?: string | null;
}) {
  const url = new URL(params.calendlyUrl);
  if (params.email) {
    url.searchParams.set('email', params.email);
  }
  if (params.name) {
    url.searchParams.set('name', params.name);
  }
  if (params.domain) {
    url.searchParams.set('utm_content', params.domain);
  }
  url.searchParams.set('hide_gdpr_banner', '1');
  return url.toString();
}
