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
type SearchAnalyticsRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

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

async function authorizedFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const token = process.env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN;
  if (!token) throw new Error('Missing GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN');

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(20000),
  });

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
