// ---------------------------------------------------------------------------
// The Hockey Lab — NHL API edge layer (shared helpers)
//
// Direct TypeScript port of app/Http/Controllers/NhlApiController.php.
// Cloudflare's edge Cache API (caches.default) replaces Laravel's 5-minute
// Cache::put / Cache::get. Response shapes are byte-for-byte compatible with
// the original controller so the React data layer (lib/nhl.ts -> fetchNhl)
// needs no changes.
// ---------------------------------------------------------------------------

export const API_BASE = 'https://api-web.nhle.com/v1';
export const STATS_API_BASE = 'https://api.nhle.com/stats/rest/en';
export const RECORDS_API_BASE = 'https://records.nhl.com/site/api';
export const CACHE_SECONDS = 300;

/** Thrown when an upstream NHL endpoint fails; mapped to a 502 by the router. */
export class UpstreamError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

/** JSON response with the same cache hint we store at the edge. */
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${CACHE_SECONDS}`,
    },
  });
}

export function errorJson(message: string, status = 502, extra: Record<string, unknown> = {}): Response {
  return new Response(JSON.stringify({ error: true, message, ...extra }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/**
 * Fetch JSON from an upstream URL, caching the parsed payload at the edge for
 * CACHE_SECONDS. Mirrors NhlApiController's Cache::has / Cache::put pattern,
 * but keyed by the fully-qualified upstream URL so it is shared across requests.
 */
export async function fetchUpstream(url: string): Promise<unknown> {
  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKey = new Request(url, { method: 'GET' });

  const hit = await cache.match(cacheKey);
  if (hit) {
    return hit.json();
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      headers: { accept: 'application/json' },
      // Belt-and-suspenders: also let the Cloudflare cache hold the origin body.
      cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true },
    } as RequestInit);
  } catch {
    throw new UpstreamError('Unable to reach the NHL API.');
  }

  if (!upstream.ok) {
    throw new UpstreamError('NHL API responded with an error.', 502);
  }

  const body = await upstream.text();
  const stored = new Response(body, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${CACHE_SECONDS}`,
    },
  });
  // Store a clone; do not await the network round-trip of put() unnecessarily.
  await cache.put(cacheKey, stored.clone());
  return JSON.parse(body);
}

/** Build an upstream URL with an optional query object. */
export function withQuery(base: string, query: Record<string, string | number | undefined> = {}): string {
  const entries = Object.entries(query).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return base;
  const qs = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
  return `${base}?${qs.toString()}`;
}

/** Equivalent of the controller's `proxy()` helper for api-web.nhle.com. */
export async function proxyWeb(path: string, query: Record<string, string | number | undefined> = {}): Promise<Response> {
  try {
    const data = await fetchUpstream(withQuery(`${API_BASE}/${path}`, query));
    return json(data);
  } catch (e) {
    if (e instanceof UpstreamError) {
      return errorJson(e.message, 502);
    }
    return errorJson('Unable to reach the NHL API.', 502);
  }
}

/** Equivalent of the controller's `statsRequest()` (api.nhle.com/stats). Throws on failure. */
export async function statsRequest(path: string, query: Record<string, string | number | undefined> = {}): Promise<any> {
  return fetchUpstream(withQuery(`${STATS_API_BASE}/${path}`, query));
}

/** records.nhl.com — all-time franchise records, award history, record book. Throws on failure. */
export async function recordsRequest(path: string, query: Record<string, string | number | undefined> = {}): Promise<any> {
  return fetchUpstream(withQuery(`${RECORDS_API_BASE}/${path}`, query));
}

// ----- nested-value access (PHP data_get equivalent) -----------------------
export function dataGet(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

// ----- schedule range (controller scheduleRange) ---------------------------
export async function scheduleRange(start: string, end: string): Promise<Response> {
  const daysByDate: Record<string, any> = {};
  let currentStart = start;

  for (let i = 0; i < 12; i++) {
    const payload: any = await fetchUpstream(`${API_BASE}/schedule/${currentStart}`);
    const gameWeek: any[] = payload?.gameWeek ?? [];

    for (const day of gameWeek) {
      const date = day?.date;
      if (date) daysByDate[date] = day;
    }

    let lastDate: string | null = null;
    if (gameWeek.length > 0) {
      lastDate = gameWeek[gameWeek.length - 1]?.date ?? null;
    }
    if (!lastDate || lastDate >= end) break;

    const nextStart = payload?.nextStartDate;
    if (!nextStart || nextStart === currentStart) break;
    currentStart = nextStart;
  }

  const filtered = Object.values(daysByDate).filter((day: any) => {
    const date = day?.date ?? '';
    return date >= start && date <= end;
  });
  filtered.sort((a: any, b: any) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  return json({ gameWeek: filtered });
}

// ----- teams (derived from standings/now) ----------------------------------
export async function teams(): Promise<Response> {
  let payload: any;
  try {
    payload = await fetchUpstream(`${API_BASE}/standings/now`);
  } catch {
    return errorJson('Unable to reach the NHL API.', 502);
  }
  const standings: any[] = payload?.standings ?? [];
  const list = standings.map((row, index) => {
    const name =
      dataGet(row, 'teamName.default') ||
      row?.teamName ||
      dataGet(row, 'teamCommonName.default') ||
      dataGet(row, 'placeName.default') ||
      'Unknown';
    const abbrev = dataGet(row, 'teamAbbrev.default') || row?.teamAbbrev;
    const id = row?.teamId || abbrev || name || index;
    return { id, name, abbrev };
  });
  return json({ teams: list });
}

// ----- stats team map (triCode -> { id, name }) ----------------------------
export async function statsTeamMap(): Promise<Record<string, { id: number; name: string }>> {
  const data: any = await statsRequest('team');
  const map: Record<string, { id: number; name: string }> = {};
  for (const row of data?.data ?? []) {
    if (row?.triCode != null && row?.id != null) {
      map[String(row.triCode).toUpperCase()] = { id: row.id, name: row.fullName ?? row.triCode };
    }
  }
  return map;
}

export async function statsTeamReport(report: string, teamId: number, season: string, gameType: string): Promise<any> {
  return statsRequest(`team/${report}`, {
    isAggregate: 'false',
    isGame: 'false',
    start: 0,
    limit: 1,
    cayenneExp: `seasonId=${season} and gameTypeId=${gameType} and teamId=${teamId}`,
  });
}

export async function statsSeasonMeta(seasonId: number): Promise<{ id: number; numberOfGames: number | null }> {
  const data: any = await statsRequest('season');
  const season = (data?.data ?? []).find((row: any) => row?.id === seasonId);
  return { id: seasonId, numberOfGames: season?.numberOfGames ?? null };
}

export function rankFromList(rows: any[], field: string, teamId: number, direction: 'asc' | 'desc' = 'desc'): number | null {
  const sorted = (rows ?? [])
    .filter((row) => row?.[field] != null && !Number.isNaN(Number(row[field])))
    .sort((a, b) => (direction === 'asc' ? a[field] - b[field] : b[field] - a[field]));
  const index = sorted.findIndex((row) => (row?.teamId ?? null) === teamId);
  return index === -1 ? null : index + 1;
}

// ----- team-stats aggregator (controller teamStats) ------------------------
export async function teamStats(teamAbbrev: string, season: string, gameType: string): Promise<Response> {
  const teamKey = teamAbbrev.toUpperCase();

  let teamMap: Record<string, { id: number; name: string }>;
  try {
    teamMap = await statsTeamMap();
  } catch {
    return errorJson('Unable to reach the NHL stats API.', 502);
  }
  if (!teamMap[teamKey]) {
    return errorJson('Team stats are unavailable.', 404);
  }
  const teamId = teamMap[teamKey].id;

  try {
    const summaryAll: any = await statsRequest('team/summary', {
      isAggregate: 'false', isGame: 'false', start: 0, limit: 200,
      cayenneExp: `seasonId=${season} and gameTypeId=${gameType}`,
    });
    const percentagesAll: any = await statsRequest('team/percentages', {
      isAggregate: 'false', isGame: 'false', start: 0, limit: 200,
      cayenneExp: `seasonId=${season} and gameTypeId=${gameType}`,
    });
    const summaryRow = (summaryAll?.data ?? []).find((r: any) => r?.teamId === teamId) ?? null;

    const report = (name: string) => statsTeamReport(name, teamId, season, gameType);
    const [
      saveRow, percentagesRow, summaryShootingRow, powerPlayRow, penaltyKillRow,
      faceoffPercentagesRow, faceoffWinsRow, penaltiesRow, goalsByPeriodRow,
      goalsForByStrengthRow, goalsAgainstByStrengthRow, goalsForByStrengthPullRow,
      goalsAgainstByStrengthPullRow, leadingTrailingRow, scoreTrailFirstRow,
      shootoutRow, shotTypeRow, realtimeRow, outshootRow, goalGamesRow,
      powerPlayTimeRow, penaltyKillTimeRow,
    ] = await Promise.all([
      report('savePercentage'), report('percentages'), report('summaryshooting'),
      report('powerplay'), report('penaltykill'), report('faceoffpercentages'),
      report('faceoffwins'), report('penalties'), report('goalsbyperiod'),
      report('goalsforbystrength'), report('goalsagainstbystrength'),
      report('goalsforbystrengthgoaliepull'), report('goalsagainstbystrengthgoaliepull'),
      report('leadingtrailing'), report('scoretrailfirst'), report('shootout'),
      report('shottype'), report('realtime'), report('outshootoutshotby'),
      report('goalgames'), report('powerplaytime'), report('penaltykilltime'),
    ]);

    const seasonInfo = await statsSeasonMeta(parseInt(season, 10));

    const summaryData: any[] = summaryAll?.data ?? [];
    const percentagesData: any[] = percentagesAll?.data ?? [];
    const first = (row: any) => row?.data?.[0] ?? null;

    return json({
      summary: summaryRow,
      savePercentage: first(saveRow),
      percentages: first(percentagesRow),
      summaryShooting: first(summaryShootingRow),
      powerPlay: first(powerPlayRow),
      penaltyKill: first(penaltyKillRow),
      faceoffPercentages: first(faceoffPercentagesRow),
      faceoffWins: first(faceoffWinsRow),
      penalties: first(penaltiesRow),
      goalsByPeriod: first(goalsByPeriodRow),
      goalsForByStrength: first(goalsForByStrengthRow),
      goalsAgainstByStrength: first(goalsAgainstByStrengthRow),
      goalsForByStrengthGoaliePull: first(goalsForByStrengthPullRow),
      goalsAgainstByStrengthGoaliePull: first(goalsAgainstByStrengthPullRow),
      leadingTrailing: first(leadingTrailingRow),
      scoreTrailFirst: first(scoreTrailFirstRow),
      shootout: first(shootoutRow),
      shotType: first(shotTypeRow),
      realtime: first(realtimeRow),
      outshootOutshot: first(outshootRow),
      goalGames: first(goalGamesRow),
      powerPlayTime: first(powerPlayTimeRow),
      penaltyKillTime: first(penaltyKillTimeRow),
      season: seasonInfo,
      ranks: {
        powerPlayPct: rankFromList(summaryData, 'powerPlayPct', teamId),
        penaltyKillPct: rankFromList(summaryData, 'penaltyKillPct', teamId),
        pointPct: rankFromList(summaryData, 'pointPct', teamId),
        goalsForPerGame: rankFromList(summaryData, 'goalsForPerGame', teamId),
        goalsAgainstPerGame: rankFromList(summaryData, 'goalsAgainstPerGame', teamId, 'asc'),
        shotsForPerGame: rankFromList(summaryData, 'shotsForPerGame', teamId),
        shotsAgainstPerGame: rankFromList(summaryData, 'shotsAgainstPerGame', teamId, 'asc'),
        faceoffWinPct: rankFromList(summaryData, 'faceoffWinPct', teamId),
        satPct: rankFromList(percentagesData, 'satPct', teamId),
        usatPct: rankFromList(percentagesData, 'usatPct', teamId),
        shootingPct5v5: rankFromList(percentagesData, 'shootingPct5v5', teamId),
        savePct5v5: rankFromList(percentagesData, 'savePct5v5', teamId),
        shootingPlusSavePct5v5: rankFromList(percentagesData, 'shootingPlusSavePct5v5', teamId),
        zoneStartPct5v5: rankFromList(percentagesData, 'zoneStartPct5v5', teamId),
      },
    });
  } catch {
    return errorJson('Unable to reach the NHL stats API.', 502);
  }
}
