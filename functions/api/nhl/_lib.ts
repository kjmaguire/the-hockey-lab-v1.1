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

// ---------------------------------------------------------------------------
// Tiered edge-cache TTLs. A flat 5-minute cache is wrong in both directions:
// a FINAL game's box score / play-by-play never changes again (no reason to
// re-pull it every 5 min), while a LIVE game wants fresher data. We classify
// each upstream URL by volatility, and for game feeds we peek at `gameState`
// so finals are cached for a day and live games for ~20s.
// ---------------------------------------------------------------------------
const TTL = {
  live: 20,      // a game in progress — refresh fast
  slate: 30,     // today's scoreboard / date slates
  pre: 120,      // pre-game (lineups, odds still firming)
  medium: 300,   // leaders, rosters, club-stats, standings, player landing (default)
  long: 3600,    // season meta
  day: 86400,    // immutable: finals, records book, league meta, historical drafts
};

/** Normalize a payload's game state to 'live' | 'final' | 'pre' | null. */
function gameStateOf(payload: any): 'live' | 'final' | 'pre' | null {
  if (!payload || typeof payload !== 'object') return null;
  // score/schedule slates carry games[].gameState — classify by the set
  if (!payload.gameState && Array.isArray(payload.games) && payload.games.length) {
    const states = payload.games.map((g: any) => String(g?.gameState || '').toUpperCase());
    if (states.some((s: string) => s === 'LIVE' || s === 'CRIT')) return 'live';
    if (states.length && states.every((s: string) => s === 'OFF' || s === 'FINAL')) return 'final';
    return null; // mixed / upcoming
  }
  const st = String(payload.gameState || '').toUpperCase();
  if (st === 'LIVE' || st === 'CRIT') return 'live';
  if (st === 'OFF' || st === 'FINAL') return 'final';
  if (st === 'FUT' || st === 'PRE') return 'pre';
  return null;
}

/** Decide the edge-cache lifetime (seconds) for an upstream URL + (optional) parsed body. */
export function ttlFor(url: string, payload?: any): number {
  // immutable / rarely-changing reference data
  if (url.startsWith(RECORDS_API_BASE)) return TTL.day;
  if (/\/(meta|config|glossary|country|franchise)(\b|\/)/.test(url)) return TTL.day;
  if (/\/season(\b|\/)/.test(url)) return TTL.long;
  if (/\/draft\/(rankings|picks)\/\d{4}(\b|\/)/.test(url)) return TTL.day; // a specific draft year
  // season-list metadata (which seasons exist / a club has stats for) — changes ~yearly.
  // Must precede the /standings/ rule below, which would otherwise catch standings-season.
  if (/\/(standings-season|club-stats-season)(\b|\/|$)/.test(url)) return TTL.long;

  const isNow = /\/now(\b|\/|$)/.test(url);
  const gs = gameStateOf(payload);
  if (gs === 'live') return TTL.live;            // always refresh a live game fast
  if (gs === 'final' && !isNow) return TTL.day;  // a specific final game/date never changes
  if (gs === 'pre' && !isNow) return TTL.pre;

  if (/\/standings(\b|\/)/.test(url)) return TTL.medium;
  if (isNow || /\/(score|scoreboard)(\b|\/)/.test(url)) return TTL.slate; // live-ish slates

  // leaders, rosters, club-stats, prospects, player landing, schedule, edge, …
  return TTL.medium;
}

/** Thrown when an upstream NHL endpoint fails; mapped to a 502 by the router. */
export class UpstreamError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

/** Security headers attached to every API response (and mirrored onto static assets in worker.ts). */
export const SECURITY_HEADERS: Record<string, string> = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'SAMEORIGIN',
  'permissions-policy': 'geolocation=(), microphone=(), camera=()',
};

/** Cache-Control with stale-while-revalidate (serve stale instantly, refresh in bg)
 *  + stale-if-error (tolerate an upstream outage for a week, matching our fallback copy). */
function cacheControl(maxAge: number): string {
  const swr = Math.max(30, maxAge);
  return `public, max-age=${maxAge}, stale-while-revalidate=${swr}, stale-if-error=604800`;
}

/** JSON response with the same cache hint we store at the edge. */
export function json(data: unknown, status = 200, maxAge = CACHE_SECONDS): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cacheControl(maxAge),
      ...SECURITY_HEADERS,
    },
  });
}

export function errorJson(message: string, status = 502, extra: Record<string, unknown> = {}): Response {
  return new Response(JSON.stringify({ error: true, message, ...extra }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...SECURITY_HEADERS },
  });
}

// ---------------------------------------------------------------------------
// Abuse / overload protection (worker.ts wires these in front of the router).
// ---------------------------------------------------------------------------

/** Validate a generic-passthrough sub-path: printable URL chars only, no traversal, bounded length. */
export function sanitizeRest(rest: string): boolean {
  if (!rest || rest.length > 160) return false;
  if (rest.includes('..')) return false;
  return /^[A-Za-z0-9._~\-\/]+$/.test(rest);
}

/** Hotlink guard: if the request carries a browser Origin/Referer, its host must be allow-listed.
 *  Header-less callers (curl, server-to-server) are deferred to rate limiting / Cloudflare WAF. */
export function isRefererAllowed(origin: string | null, referer: string | null, allowedHosts: string[]): boolean {
  const hostOf = (v: string | null) => { if (!v) return null; try { return new URL(v).host; } catch { return null; } };
  const o = hostOf(origin), r = hostOf(referer);
  if (!o && !r) return true;
  const ok = (h: string | null) => h == null || allowedHosts.includes(h);
  return ok(o) && ok(r);
}

/** Soft per-IP fixed-window limiter. Uses a KV namespace if one is bound; otherwise a no-op
 *  (deployments without KV should lean on a Cloudflare WAF rate-limit rule — see README). */
export async function rateLimit(kv: any, ip: string, limit: number): Promise<boolean> {
  if (!kv || !ip) return true;
  const key = `rl:${ip}:${Math.floor(Date.now() / 60000)}`;
  let n = 0;
  try { n = parseInt((await kv.get(key)) || '0', 10) || 0; } catch { return true; }
  if (n >= limit) return false;
  try { await kv.put(key, String(n + 1), { expirationTtl: 70 }); } catch { /* best-effort */ }
  return true;
}

/** Memoize an assembled (multi-upstream) JSON response at the edge under a synthetic key,
 *  so composition work (e.g. teamStats' ~24 reports) isn't re-run on every hit. */
export async function edgeMemo(key: string, ttl: number, build: () => Promise<Response>): Promise<Response> {
  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKey = new Request(`https://memo.thehockeylab.invalid/${key}`, { method: 'GET' });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;
  const resp = await build();
  if (resp.ok) {
    const body = await resp.clone().text();
    const stored = new Response(body, {
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cacheControl(ttl), ...SECURITY_HEADERS },
    });
    try { await cache.put(cacheKey, stored.clone()); } catch { /* best-effort */ }
    return stored;
  }
  return resp;
}

// ---------------------------------------------------------------------------
// Optional durable L2 cache (Cloudflare D1). The edge Cache API (caches.default)
// is per-colo and can be evicted, so a year you viewed an hour ago in one region
// may be a cold miss in another — and a slow/blocked upstream then drops that year
// back to mock until a refresh. D1 is a global, durable store: we persist ONLY
// immutable endpoints (a specific historical draft year, the records book, league
// meta, finals) so a cold edge anywhere still answers instantly instead of
// round-tripping to api-web.nhle.com. Inert until a D1 database is bound as `DB`
// (see wrangler.toml) — mirrors the optional-RATE_LIMIT pattern.
// ---------------------------------------------------------------------------
type D1Like = {
  prepare: (q: string) => {
    bind: (...a: any[]) => { first: <T = any>() => Promise<T | null>; run: () => Promise<any> };
  };
};
let _cacheDb: D1Like | null = null;
/** Wire the request's D1 binding (env.DB) into the cache layer. Safe to pass undefined. */
export function setCacheDb(db: any): void { _cacheDb = db || null; }

/** Only immutable-ish URLs (long/day TTL) are worth persisting durably. */
function isDurable(url: string): boolean { return ttlFor(url) >= TTL.long; }

async function d1Get(url: string): Promise<unknown | undefined> {
  if (!_cacheDb) return undefined;
  try {
    const row = await _cacheDb.prepare('SELECT body, exp FROM nhl_cache WHERE k = ?')
      .bind(url).first<{ body: string; exp: number }>();
    if (!row) return undefined;
    if (row.exp && row.exp < Math.floor(Date.now() / 1000)) return undefined; // expired
    return JSON.parse(row.body);
  } catch { return undefined; }
}
async function d1Put(url: string, body: string, ttl: number): Promise<void> {
  if (!_cacheDb) return;
  const now = Math.floor(Date.now() / 1000);
  try {
    await _cacheDb.prepare('INSERT OR REPLACE INTO nhl_cache (k, body, exp, updated) VALUES (?, ?, ?, ?)')
      .bind(url, body, now + ttl, now).run();
  } catch { /* best-effort */ }
}

/**
 * Fetch JSON from an upstream URL, caching the parsed payload at the edge for
 * CACHE_SECONDS. Mirrors NhlApiController's Cache::has / Cache::put pattern, but
 * keyed by the fully-qualified upstream URL so it is shared across requests. For
 * immutable endpoints a durable D1 copy (when bound) backs the per-colo edge cache.
 */
export async function fetchUpstream(url: string): Promise<unknown> {
  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKey = new Request(url, { method: 'GET' });
  // Long-lived "last-known-good" copy under a sibling key, served only when the
  // NHL API is unreachable (stale-if-error). Kept ~7 days.
  const fallbackKey = new Request(url + (url.includes('?') ? '&' : '?') + '__fb=1', { method: 'GET' });
  const serveFallback = async (): Promise<unknown | undefined> => {
    const fb = await cache.match(fallbackKey);
    return fb ? fb.json() : undefined;
  };

  const hit = await cache.match(cacheKey);
  if (hit) {
    return hit.json();
  }

  // Edge miss. For immutable endpoints, try the durable L2 (D1) before the network:
  // a cold colo or a slow/blocked upstream then still answers instantly + identically,
  // which is what keeps flipping between draft years reliable across regions.
  const durable = isDurable(url);
  if (durable) {
    const d1 = await d1Get(url);
    if (d1 !== undefined) {
      // warm this colo's edge cache so subsequent same-colo hits skip D1 too
      try {
        await cache.put(cacheKey, new Response(JSON.stringify(d1), {
          headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': `public, max-age=${ttlFor(url, d1)}` },
        }));
      } catch { /* best-effort */ }
      return d1;
    }
  }

  const baseTtl = ttlFor(url); // URL-only guess for the origin fetch hint
  let upstream: Response;
  try {
    upstream = await fetch(url, {
      headers: { accept: 'application/json' },
      // Belt-and-suspenders: also let the Cloudflare cache hold the origin body.
      cf: { cacheTtl: baseTtl, cacheEverything: true },
    } as RequestInit);
  } catch {
    // NHL unreachable → serve the last-known-good copy if we have one.
    const stale = await serveFallback();
    if (stale !== undefined) return stale;
    const d1 = durable ? await d1Get(url) : undefined;
    if (d1 !== undefined) return d1;
    throw new UpstreamError('Unable to reach the NHL API.');
  }

  if (!upstream.ok) {
    const stale = await serveFallback();
    if (stale !== undefined) return stale;
    const d1 = durable ? await d1Get(url) : undefined;
    if (d1 !== undefined) return d1;
    throw new UpstreamError('NHL API responded with an error.', 502);
  }

  const body = await upstream.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    // upstream returned non-JSON (e.g. an HTML error page) → prefer last-known-good
    const stale = await serveFallback();
    if (stale !== undefined) return stale;
    throw new UpstreamError('NHL API returned an unexpected response.', 502);
  }
  // Now that we can see the payload, refine the TTL (e.g. a FINAL game → 24h).
  const ttl = ttlFor(url, parsed);
  const stored = new Response(body, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${ttl}`,
    },
  });
  // Primary (tiered TTL) + long-lived fallback, both from this single fetch.
  await cache.put(cacheKey, stored.clone());
  await cache.put(fallbackKey, new Response(body, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=604800',
    },
  }));
  // Persist immutable payloads durably (D1) so other colos / later cold edges hit it.
  if (durable) { await d1Put(url, body, ttl); }
  return parsed;
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
  const url = withQuery(`${API_BASE}/${path}`, query);
  try {
    const data = await fetchUpstream(url);
    return json(data, 200, ttlFor(url, data));
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
// Public entry: memoize the assembled blob at the edge (its ~24 sub-reports are
// each cached individually too, but this skips re-composing them on every hit).
export async function teamStats(teamAbbrev: string, season: string, gameType: string): Promise<Response> {
  return edgeMemo(`team-stats/${teamAbbrev.toUpperCase()}/${season}/${gameType}`, TTL.medium,
    () => buildTeamStats(teamAbbrev, season, gameType));
}
async function buildTeamStats(teamAbbrev: string, season: string, gameType: string): Promise<Response> {
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


// NHL season id for "now" — season starts in October; treat Sept+ as the new season.
// NOTE: this is a calendar HEURISTIC and can disagree with the NHL's official
// `currentSeason` for a few days around rollover / through the offseason. It's the
// fallback only — prefer resolveCurrentSeason() (authoritative) wherever possible.
export function currentSeason(): string {
  const d = new Date();
  const y = d.getFullYear();
  return d.getMonth() >= 8 ? String(y) + String(y + 1) : String(y - 1) + String(y);
}

// Authoritative current season id, straight from the NHL. The /season endpoint
// returns every season id ever; the largest is the current/most-recent one. We
// cache it two ways so it costs essentially nothing per request: a 6h module-level
// memo (per isolate) in front of the edge/D1-cached upstream fetch. Any failure
// falls back to the date heuristic, so a season default is never missing.
let _seasonMemo: { id: string; t: number } | null = null;
const SEASON_MEMO_TTL = 6 * 3600 * 1000;
export async function resolveCurrentSeason(): Promise<string> {
  if (_seasonMemo && Date.now() - _seasonMemo.t < SEASON_MEMO_TTL) return _seasonMemo.id;
  try {
    const data: any = await fetchUpstream(`${API_BASE}/season`);
    const ids = (Array.isArray(data) ? data : (data && data.seasons) || [])
      .map((v: any) => Number(v)).filter((n: number) => n >= 19000000 && n <= 21000000);
    const id = ids.length ? String(Math.max(...ids)) : currentSeason();
    _seasonMemo = { id, t: Date.now() };
    return id;
  } catch {
    return currentSeason();
  }
}
