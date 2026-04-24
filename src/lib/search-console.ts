export interface SearchConsoleSnapshot {
  connected: boolean;
  property: string | null;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  averagePosition: number | null;
  topQueries: Array<{ query: string; clicks: number; impressions: number }>;
  indexedPages: number | null;
  sitemapCount: number | null;
  notes: string[];
}

const SEARCH_CONSOLE_BASE = 'https://searchconsole.googleapis.com/webmasters/v3';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
type SearchAnalyticsRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type OAuthTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
};

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

function dateDaysAgo(days: number): string {
  const target = new Date();
  target.setUTCDate(target.getUTCDate() - days);
  return target.toISOString().slice(0, 10);
}

function candidateProperties(domain: string): string[] {
  return [
    `sc-domain:${domain}`,
    `https://${domain}/`,
    `https://www.${domain}/`,
    `http://${domain}/`,
  ];
}

function getStaticAccessToken() {
  const token = process.env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN?.trim();
  return token ? token : null;
}

function getRefreshTokenConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN?.trim();

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  return { clientId, clientSecret, refreshToken };
}

async function refreshSearchConsoleAccessToken(): Promise<string> {
  const config = getRefreshTokenConfig();
  if (!config) {
    throw new Error('Missing Search Console OAuth refresh-token configuration');
  }

  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60_000) {
    return cachedAccessToken.token;
  }

  const form = new URLSearchParams();
  form.set('client_id', config.clientId);
  form.set('client_secret', config.clientSecret);
  form.set('refresh_token', config.refreshToken);
  form.set('grant_type', 'refresh_token');

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
    signal: AbortSignal.timeout(20000),
  });

  const payload = (await response.json().catch(() => ({}))) as OAuthTokenResponse;
  if (!response.ok || !payload.access_token) {
    throw new Error(
      payload.error_description ||
      payload.error ||
      `Search Console token refresh failed with ${response.status}`
    );
  }

  cachedAccessToken = {
    token: payload.access_token,
    expiresAt: now + Math.max(60, payload.expires_in ?? 3600) * 1000,
  };

  return cachedAccessToken.token;
}

async function getSearchConsoleAccessToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh) {
    const staticToken = getStaticAccessToken();
    if (staticToken) {
      return staticToken;
    }

    if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
      return cachedAccessToken.token;
    }
  }

  return refreshSearchConsoleAccessToken();
}

async function authorizedFetch<T>(url: string, init?: RequestInit, hasRetried = false): Promise<T> {
  const token = await getSearchConsoleAccessToken(hasRetried);

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(20000),
  });

  if (response.status === 401 && !hasRetried && getRefreshTokenConfig()) {
    cachedAccessToken = null;
    return authorizedFetch<T>(url, init, true);
  }

  if (!response.ok) {
    throw new Error(`Search Console request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function fetchPropertySnapshot(property: string) {
  const [searchAnalytics, sitemaps] = await Promise.all([
    authorizedFetch<{ rows?: SearchAnalyticsRow[] }>(
      `${SEARCH_CONSOLE_BASE}/sites/${encodeURIComponent(property)}/searchAnalytics/query`,
      {
        method: 'POST',
        body: JSON.stringify({
          startDate: dateDaysAgo(28),
          endDate: dateDaysAgo(1),
          dimensions: ['query'],
          rowLimit: 5,
        }),
      }
    ),
    authorizedFetch<{ sitemap?: Array<{ path?: string }> }>(
      `${SEARCH_CONSOLE_BASE}/sites/${encodeURIComponent(property)}/sitemaps`
    ),
  ]);

  return { searchAnalytics, sitemaps };
}

export async function fetchSearchConsoleSnapshot(domain: string): Promise<SearchConsoleSnapshot> {
  const notes: string[] = [];

  try {
    let property: string | null = null;
    let searchAnalytics: { rows?: SearchAnalyticsRow[] } | null = null;
    let sitemaps: { sitemap?: Array<{ path?: string }> } | null = null;

    for (const candidate of candidateProperties(domain)) {
      try {
        const snapshot = await fetchPropertySnapshot(candidate);
        property = candidate;
        searchAnalytics = snapshot.searchAnalytics;
        sitemaps = snapshot.sitemaps;
        break;
      } catch {
        continue;
      }
    }

    if (!property || !searchAnalytics || !sitemaps) {
      throw new Error('No accessible Search Console property found for this domain');
    }

    const rows = searchAnalytics.rows ?? [];
    const totals = rows.reduce<{ clicks: number; impressions: number; position: number }>(
      (acc, row) => {
        acc.clicks += row.clicks ?? 0;
        acc.impressions += row.impressions ?? 0;
        acc.position += row.position ?? 0;
        return acc;
      },
      { clicks: 0, impressions: 0, position: 0 }
    );

    return {
      connected: true,
      property,
      impressions: totals.impressions > 0 ? totals.impressions : null,
      clicks: totals.clicks > 0 ? totals.clicks : null,
      ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : null,
      averagePosition: rows.length > 0 ? totals.position / rows.length : null,
      topQueries: rows.map((row) => ({
        query: row.keys?.[0] ?? '(unknown)',
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
      })),
      indexedPages: null,
      sitemapCount: sitemaps.sitemap?.length ?? 0,
      notes,
    };
  } catch (error) {
    notes.push(error instanceof Error ? error.message : 'Search Console unavailable');
    return {
      connected: false,
      property: null,
      impressions: null,
      clicks: null,
      ctr: null,
      averagePosition: null,
      topQueries: [],
      indexedPages: null,
      sitemapCount: null,
      notes,
    };
  }
}
