// ---------------------------------------------------------------------------
// The Hockey Lab — Cloudflare Worker (static assets + /api/nhl/* proxy)
//
// Deployed via `wrangler deploy` (Workers Static Assets). Static files in
// ./public are served directly by the platform; any request the assets layer
// doesn't match (i.e. /api/nhl/*) falls through to this Worker, which runs the
// same NHL proxy/router logic the Pages Function used (ported verbatim).
// ---------------------------------------------------------------------------

import {
  proxyWeb,
  statsRequest,
  recordsRequest,
  scheduleRange,
  teams,
  teamStats,
  errorJson,
  json,
  resolveCurrentSeason,
  isRefererAllowed,
  rateLimit,
  sanitizeRest,
  setCacheDb,
  setCacheKv,
  setMetrics,
  SECURITY_HEADERS,
} from './functions/api/nhl/_lib';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  // Optional KV namespace for soft per-IP rate limiting (see wrangler.toml / README).
  RATE_LIMIT?: { get: (k: string) => Promise<string | null>; put: (k: string, v: string, o?: any) => Promise<void> };
  // Optional comma-separated extra browser hosts allowed to call /api/nhl/* (same-origin always allowed).
  ALLOWED_HOSTS?: string;
  // Optional D1 database for the durable L2 cache of immutable endpoints (see wrangler.toml).
  DB?: any;
  // Optional globally-replicated KV namespace: a cross-colo warm cache + last-known-good
  // so a cold edge serves real data instead of the client's demo (see wrangler.toml).
  CACHE_KV?: any;
  // Optional Analytics Engine dataset for cache-tier / latency metrics (see wrangler.toml).
  nhl_proxy_metrics?: any;
}

// Content-Security-Policy for the HTML app. `strict` (Babel-free) is used when we
// serve a precompiled *.prod.html; the build-free app.html needs 'unsafe-eval'
// for in-browser Babel. cloudflareinsights.* is allowed for optional CF Web Analytics.
function cspFor(strict: boolean): string {
  const script = strict
    ? "script-src 'self' 'unsafe-inline' https://unpkg.com https://static.cloudflareinsights.com"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://static.cloudflareinsights.com";
  return [
    "default-src 'self'",
    script,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://cloudflareinsights.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
  ].join('; ');
}

/** Attach security headers to a static-asset response (CSP only on HTML; strict for prod builds). */
function withAppHeaders(resp: Response, strict = false): Response {
  const h = new Headers(resp.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) h.set(k, v);
  if ((h.get('content-type') || '').includes('text/html')) {
    h.set('content-security-policy', cspFor(strict));
    // RFC 8288 agent-discovery hints: advertise the public read API catalog + the docs.
    h.set('link', '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json", </learn>; rel="service-doc"');
  }
  return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers: h });
}

// --- /api/nhl/* router (ported from functions/api/nhl/[[path]].ts) ----------
async function handleNhl(url: URL): Promise<Response> {
  const segments = url.pathname.replace(/^\/api\/nhl\/?/, '').split('/').filter(Boolean);
  const q = (key: string, fallback?: string) => url.searchParams.get(key) ?? fallback;
  const [a, b, c] = segments;

  try {
    switch (a) {
      case 'schedule': {
        const start = q('start');
        const end = q('end');
        const date = q('date');
        if (start && end) return scheduleRange(start, end);
        if (date) return proxyWeb(`schedule/${date}`);
        return proxyWeb('schedule/now');
      }
      case 'scoreboard': {
        const date = q('date');
        return date ? proxyWeb(`score/${date}`) : proxyWeb('score/now');
      }
      case 'gamecenter': {
        const gameId = b;
        const kind = c;
        if (!gameId || !kind) break;
        if (kind === 'boxscore') return proxyWeb(`gamecenter/${gameId}/boxscore`);
        if (kind === 'play-by-play') return proxyWeb(`gamecenter/${gameId}/play-by-play`);
        if (kind === 'right-rail') return proxyWeb(`gamecenter/${gameId}/right-rail`);
        break;
      }
      case 'teams':
        return teams();
      case 'standings': {
        const date = (b && /^\d{4}-\d{2}-\d{2}$/.test(b)) ? b : q('date');
        return proxyWeb(date ? `standings/${date}` : 'standings/now');
      }
      case 'roster': {
        if (!b) break;
        const season = (q('season') ?? await resolveCurrentSeason());
        const gameType = q('gameType', '2')!;
        return proxyWeb(`roster/${b}/${season}`, { gameType });
      }
      case 'roster-season':
        if (!b) break;
        return proxyWeb(`roster-season/${b}`);
      case 'club-schedule': {
        if (!b) break;
        const season = (q('season') ?? await resolveCurrentSeason());
        return proxyWeb(`club-schedule-season/${b}/${season}`);
      }
      case 'club-schedule-view': {
        if (!b) break;
        const view = q('view', 'month')!;
        if (view !== 'month' && view !== 'week') return errorJson('Invalid schedule view.', 400);
        const date = q('date');
        const slug = date || 'now';
        return proxyWeb(`club-schedule/${b}/${view}/${slug}`);
      }
      case 'club-stats': {
        if (!b) break;
        const season = (q('season') ?? await resolveCurrentSeason());
        const gameType = q('gameType', '2')!;
        return proxyWeb(`club-stats/${b}/${season}/${gameType}`);
      }
      case 'club-stats-season':
        if (!b) break;
        return proxyWeb(`club-stats-season/${b}`);
      case 'prospects':
        if (!b) break;
        return proxyWeb(`prospects/${b}`);
      case 'team-stats': {
        if (!b) break;
        const season = (q('season') ?? await resolveCurrentSeason());
        const gameType = q('gameType', '2')!;
        return teamStats(b, season, gameType);
      }
      case 'player': {
        const playerId = b;
        const kind = c;
        if (!playerId || !kind) break;
        if (kind === 'landing') return proxyWeb(`player/${playerId}/landing`);
        if (kind === 'game-log') {
          const season = (q('season') ?? await resolveCurrentSeason());
          const gameType = q('gameType', '2')!;
          return proxyWeb(`player/${playerId}/game-log/${season}/${gameType}`);
        }
        break;
      }
      case 'goalie-leaders': {
        const season = (q('season') ?? await resolveCurrentSeason());
        const gameType = q('gameType', '2')!;
        try {
          const data = await statsRequest('goalie/summary', {
            // UN-aggregated so each stint carries its team (aggregating drops teamAbbrevs
            // → goalies render with no color). The client re-sums stints into one line.
            isAggregate: 'false', isGame: 'false', start: 0, limit: 400,
            sort: '[{"property":"wins","direction":"DESC"},{"property":"savePct","direction":"DESC"}]',
            cayenneExp: `seasonId=${season} and gameTypeId=${gameType}`,
          });
          return json(data);
        } catch {
          return errorJson('Unable to reach the NHL stats API.', 502);
        }
      }
      case 'skater-leaders': {
        const season = (q('season') ?? await resolveCurrentSeason());
        const gameType = q('gameType', '2')!;
        try {
          const data = await statsRequest('skater/summary', {
            // UN-aggregated so each stint carries its team (aggregating server-side drops
            // teamAbbrevs → every leader rendered gray). The client re-sums a traded
            // player's stints into one true season total and picks their current club.
            isAggregate: 'false', isGame: 'false', start: 0, limit: 2500,
            sort: '[{"property":"points","direction":"DESC"},{"property":"goals","direction":"DESC"},{"property":"gamesPlayed","direction":"ASC"}]',
            cayenneExp: `seasonId=${season} and gameTypeId=${gameType}`,
          });
          return json(data);
        } catch {
          return errorJson('Unable to reach the NHL stats API.', 502);
        }
      }
      case 'edge': {
        const kind = b;
        const season = (q('season') ?? await resolveCurrentSeason());
        const group = q('group', '2')!;
        if (kind === 'skater-landing') return proxyWeb(`edge/skater-landing/${season}/${group}`);
        if (kind === 'goalie-landing') return proxyWeb(`edge/goalie-landing/${season}/${group}`);
        if (kind === 'skater-detail' && c) return proxyWeb(`edge/skater-detail/${c}/${season}/${group}`);
        if (kind === 'goalie-detail' && c) return proxyWeb(`edge/goalie-detail/${c}/${season}/${group}`);
        if (kind === 'skater-comparison' && c) return proxyWeb(`edge/skater-comparison/${c}/${season}/${group}`);
        const rest = segments.slice(1).join('/');
        if (rest) {
          if (!sanitizeRest(rest)) return errorJson('Invalid path.', 400);
          const endsWithSeason = /\/\d{8}(\/\d+)?$/.test(rest) || /\/now$/.test(rest);
          const full = endsWithSeason ? `edge/${rest}` : `edge/${rest}/${season}/${group}`;
          return proxyWeb(full);
        }
        break;
      }
      case 'spotlight':
        return proxyWeb('player-spotlight');
      case 'playoff-bracket':
        return proxyWeb('playoff-bracket/now');
      case 'playoff-series-carousel': {
        if (!b) break;
        return proxyWeb(`playoff-series/carousel/${b}`);
      }
      case 'edge-team': {
        const kind = b;
        const season = (q('season') ?? await resolveCurrentSeason());
        const group = q('group', '2')!;
        if (kind === 'skating-speed' && c) return proxyWeb(`edge/team-skating-speed-top-10/${c}/points/${season}/${group}`);
        if (kind === 'shot-location' && c) return proxyWeb(`edge/team-shot-location-top-10/${c}/all/points/${season}/${group}`);
        break;
      }
      case 'schedule-calendar':
        return proxyWeb(b ? `schedule-calendar/${b}` : 'schedule-calendar/now');
      case 'gamecenter-landing':
        if (!b) break;
        return proxyWeb(`gamecenter/${b}/landing`);
      case 'game-story':
        if (!b) break;
        return proxyWeb(`wsc/game-story/${b}`);
      case 'where-to-watch':
        return proxyWeb('where-to-watch');
      case 'tv-schedule':
        return proxyWeb(b ? `network/tv-schedule/${b}` : 'network/tv-schedule/now');
      case 'partner-odds':
        return proxyWeb(`partner-game/${b || 'US'}/now`);
      case 'team-scoreboard':
        if (!b) break;
        return proxyWeb(`scoreboard/${b}/now`);
      case 'standings-season':
        return proxyWeb('standings-season');
      case 'season':
        return proxyWeb('season');
      case 'meta':
        if (b === 'game' && c) return proxyWeb(`meta/game/${c}`);
        return proxyWeb('meta');
      case 'draft': {
        const sub = b;
        if (sub === 'rankings') {
          const cat = q('category');
          if (c) return proxyWeb(`draft/rankings/${c}/${cat || '1'}`);
          // For category 2/3/4 (international skaters/goalies), /now only returns cat 1.
          // Use explicit current-draft year so all four Central Scouting lists are fetched.
          if (cat && cat !== '1') {
            const _d = new Date();
            const _yr = _d.getMonth() >= 9 ? String(_d.getFullYear() + 1) : String(_d.getFullYear());
            return proxyWeb(`draft/rankings/${_yr}/${cat}`);
          }
          return proxyWeb('draft/rankings/now');
        }
        if (sub === 'picks') return proxyWeb(c ? `draft/picks/${c}/${q('round', 'all')}` : 'draft/picks/now');
        if (sub === 'tracker') return proxyWeb('draft-tracker/picks/now');
        break;
      }
      case 'stats': {
        const rest = segments.slice(1).join('/');
        if (!rest) break;
        if (!sanitizeRest(rest)) return errorJson('Invalid path.', 400);
        try {
          const data = await statsRequest(rest, Object.fromEntries(url.searchParams.entries()));
          return json(data);
        } catch {
          return errorJson('Unable to reach the NHL stats API.', 502);
        }
      }
      case 'shift-charts': {
        if (!b) break;
        try {
          const data = await statsRequest('shiftcharts', { cayenneExp: `gameId=${b}` });
          return json(data);
        } catch {
          return errorJson('Unable to reach the NHL stats API.', 502);
        }
      }
      case 'ppt-replay': {
        const rest = segments.slice(1).join('/');
        if (!rest) break;
        if (!sanitizeRest(rest)) return errorJson('Invalid path.', 400);
        return proxyWeb(`ppt-replay/${rest}`);
      }
      case 'wsc-pbp':
        if (!b) break;
        return proxyWeb(`wsc/play-by-play/${b}`);
      case 'location':
        return proxyWeb('location');
      case 'postal-lookup':
        if (!b) break;
        return proxyWeb(`postal-lookup/${b}`);
      case 'playoff-series-schedule': {
        if (!b || !c) break;
        return proxyWeb(`schedule/playoff-series/${b}/${c}`);
      }
      case 'records': {
        const rest = segments.slice(1).join('/');
        if (!rest) break;
        if (!sanitizeRest(rest)) return errorJson('Invalid path.', 400);
        try {
          const data = await recordsRequest(rest, Object.fromEntries(url.searchParams.entries()));
          return json(data);
        } catch {
          return errorJson('Unable to reach the NHL records API.', 502);
        }
      }
      case 'wsc': {
        const kind = b;
        if (kind === 'game-story' && c) return proxyWeb(`wsc/game-story/${c}`);
        if (kind === 'play-by-play' && c) return proxyWeb(`wsc/play-by-play/${c}`);
        break;
      }
      case 'config':
        try {
          return json(await statsRequest('config'));
        } catch {
          return errorJson('Unable to reach the NHL stats API.', 502);
        }
    }
  } catch {
    return errorJson('Unable to reach the NHL API.', 502);
  }

  return errorJson('Unknown NHL endpoint.', 404, { path: segments.join('/') });
}

// --- Social "Buzz" feed helpers (free, key-less sources fetched server-side) -------
const SOCIAL_TEAM_NAME: Record<string, string> = {
  ANA: 'Anaheim Ducks', BOS: 'Boston Bruins', BUF: 'Buffalo Sabres', CGY: 'Calgary Flames',
  CAR: 'Carolina Hurricanes', CHI: 'Chicago Blackhawks', COL: 'Colorado Avalanche',
  CBJ: 'Columbus Blue Jackets', DAL: 'Dallas Stars', DET: 'Detroit Red Wings',
  EDM: 'Edmonton Oilers', FLA: 'Florida Panthers', LAK: 'Los Angeles Kings',
  MIN: 'Minnesota Wild', MTL: 'Montreal Canadiens', NSH: 'Nashville Predators',
  NJD: 'New Jersey Devils', NYI: 'New York Islanders', NYR: 'New York Rangers',
  OTT: 'Ottawa Senators', PHI: 'Philadelphia Flyers', PIT: 'Pittsburgh Penguins',
  SJS: 'San Jose Sharks', SEA: 'Seattle Kraken', STL: 'St. Louis Blues',
  TBL: 'Tampa Bay Lightning', TOR: 'Toronto Maple Leafs', UTA: 'Utah Mammoth',
  VAN: 'Vancouver Canucks', VGK: 'Vegas Golden Knights', WSH: 'Washington Capitals',
  WPG: 'Winnipeg Jets',
};
function relTime(d: string): string {
  const t = Date.parse(d); if (!t) return '';
  const s = (Date.now() - t) / 1000;
  if (s < 3600) return Math.max(1, Math.round(s / 60)) + 'm';
  if (s < 86400) return Math.round(s / 3600) + 'h';
  return Math.round(s / 86400) + 'd';
}
function parseGoogleNews(xml: string): any[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  const strip = (s: string) => s.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
  const g = (blk: string, tag: string) => { const m = blk.match(new RegExp('<' + tag + '(?:[^>]*)>([\\s\\S]*?)</' + tag + '>')); return m ? strip(m[1]) : ''; };
  return items.map((m) => {
    const blk = m[1];
    const rawTitle = g(blk, 'title');
    const src = g(blk, 'source');
    // Google News titles end with " - Outlet"; lift the outlet out for a cleaner card
    const cut = rawTitle.lastIndexOf(' - ');
    const title = (cut > 20 ? rawTitle.slice(0, cut) : rawTitle).trim();
    const outlet = src || (cut > 20 ? rawTitle.slice(cut + 3).trim() : '');
    return { kind: 'news', source: outlet || 'Google News', title, text: outlet ? `via ${outlet}` : '', link: g(blk, 'link'), time: relTime(g(blk, 'pubDate')) };
  }).filter((p) => p.title);
}

const SOCIAL_SUBREDDIT: Record<string, string> = {
  ANA: 'AnaheimDucks', BOS: 'BostonBruins', BUF: 'sabres', CGY: 'CalgaryFlames', CAR: 'canes',
  CHI: 'hawks', COL: 'ColoradoAvalanche', CBJ: 'BlueJackets', DAL: 'DallasStars', DET: 'DetroitRedWings',
  EDM: 'EdmontonOilers', FLA: 'FloridaPanthers', LAK: 'losangeleskings', MIN: 'wildhockey', MTL: 'Habs',
  NSH: 'Predators', NJD: 'devils', NYI: 'NewYorkIslanders', NYR: 'rangers', OTT: 'OttawaSenators',
  PHI: 'Flyers', PIT: 'penguins', SJS: 'SanJoseSharks', SEA: 'SeattleKraken', STL: 'stlouisblues',
  TBL: 'TampaBayLightning', TOR: 'leafs', UTA: 'utahhockey', VAN: 'canucks', VGK: 'goldenknights',
  WSH: 'caps', WPG: 'winnipegjets',
};
function parseReddit(j: any, sub: string): any[] {
  const ch = (j && j.data && j.data.children) || [];
  return ch.map((c: any) => c && c.data).filter((d: any) => d && d.title && !d.stickied)
    .map((d: any) => ({
      kind: 'reddit', source: 'r/' + sub, handle: 'r/' + sub,
      title: String(d.title || '').slice(0, 240),
      text: String(d.selftext || '').replace(/\s+/g, ' ').trim().slice(0, 240),
      likes: d.ups || 0, replies: d.num_comments || 0,
      time: d.created_utc ? relTime(new Date(d.created_utc * 1000).toISOString()) : '',
      link: 'https://www.reddit.com' + (d.permalink || ''),
    }));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    setCacheDb(env.DB); // wire the durable L2 cache (no-op unless a D1 DB is bound)
    setCacheKv(env.CACHE_KV); // wire the global KV warm/fallback cache (no-op unless bound)
    setMetrics(env.nhl_proxy_metrics); // wire cache-tier/latency metrics (no-op unless bound)

    // Edge hygiene: short-circuit the common exploit-probe paths bots spray at every site
    // (WordPress, env/secret files, VCS dirs, PHP shells). This app has none of them, so a
    // flat 403 here cuts log noise and work before the asset layer — a code-side complement
    // to the dashboard WAF managed rules. Method-agnostic; only matches obvious junk.
    if (/(^|\/)(wp-(admin|login|content|includes)|xmlrpc\.php|phpmyadmin|\.env|\.git|\.aws|\.ssh|wp-config)/i.test(url.pathname)) {
      return new Response('Not found.', { status: 403, headers: { 'cache-control': 'no-store', ...SECURITY_HEADERS } });
    }

    // API routes → live NHL proxy
    if (url.pathname === '/api/nhl' || url.pathname.startsWith('/api/nhl/')) {
      if (request.method !== 'GET') return errorJson('Method not allowed.', 405);
      // Hotlink guard: browser callers must come from an allow-listed host.
      const allowed = (env.ALLOWED_HOSTS ? env.ALLOWED_HOSTS.split(',') : [])
        .map((s) => s.trim()).filter(Boolean).concat(url.host);
      if (!isRefererAllowed(request.headers.get('origin'), request.headers.get('referer'), allowed)) {
        return errorJson('Forbidden.', 403);
      }
      // Soft per-IP rate limit (no-op unless a RATE_LIMIT KV namespace is bound).
      const ip = request.headers.get('cf-connecting-ip') || '';
      if (!(await rateLimit(env.RATE_LIMIT, ip, 120))) return errorJson('Too many requests.', 429);
      return handleNhl(url);
    }

    // SEO: robots.txt + sitemap.xml generated from the live origin (domain-agnostic,
    // so there's no hard-coded host to drift). Served before the static-asset layer
    // so they override any committed fallback copy. Diagnostics pages are disallowed.
    // Social "Buzz" feed — free, key-less sources fetched server-side, merged + cached.
    // Increment 1: Google News RSS per team (Reddit/YouTube/recaps layer in next).
    // Lightweight client error beacon sink → visible in Cloudflare logs (wrangler tail /
    // Logpush). No storage; just surfaces what's actually breaking for real users.
    if (url.pathname === '/api/log') {
      if (request.method !== 'POST') return new Response(null, { status: 405 });
      // Rate-limit the unauthenticated beacon so it can't be used to spam logs/metrics.
      const lip = request.headers.get('cf-connecting-ip') || '';
      if (!(await rateLimit(env.RATE_LIMIT, 'log:' + lip, 20))) return new Response(null, { status: 429 });
      try { const t = await request.text(); console.error('[client-error]', t.slice(0, 1000)); } catch { /* ignore */ }
      return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
    }

    // security.txt (RFC 9116): standardized contact for vulnerability reports. Served at both
    // the canonical /.well-known path and the legacy root path. Origin-derived so no host drifts.
    if (url.pathname === '/.well-known/security.txt' || url.pathname === '/security.txt') {
      const exp = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 19) + 'Z';
      const body = [
        '# Security contact for The Hockey Lab',
        'Contact: mailto:security@' + url.hostname.replace(/^www\./, ''),
        'Expires: ' + exp,
        'Preferred-Languages: en',
        'Canonical: ' + url.origin + '/.well-known/security.txt',
        '',
      ].join('\n');
      return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400', ...SECURITY_HEADERS } });
    }

    if (url.pathname.startsWith('/api/social/team/')) {
      if (request.method !== 'GET') return errorJson('Method not allowed.', 405);
      const ab = decodeURIComponent(url.pathname.split('/').pop() || '').toUpperCase();
      const name = SOCIAL_TEAM_NAME[ab];
      if (!name) return errorJson('Unknown team.', 404);
      const debug = url.searchParams.get('debug');
      const sub = SOCIAL_SUBREDDIT[ab];
      const newsP = (async () => {
        try {
          const q = encodeURIComponent(`${name} NHL`);
          const r = await fetch(`https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`, {
            headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36', accept: 'application/rss+xml,application/xml,text/xml,*/*' },
            redirect: 'follow', cf: { cacheTtl: 600, cacheEverything: true },
          } as RequestInit);
          return r.ok ? parseGoogleNews(await r.text()).slice(0, 10) : [];
        } catch { return []; }
      })();
      const redditP = (async () => {
        if (!sub) return [];
        try {
          const r = await fetch(`https://www.reddit.com/r/${sub}/top.json?t=week&limit=12`, {
            headers: { 'user-agent': 'web:thehockeylab:v1.0 (by /u/thehockeylab)', accept: 'application/json' },
            cf: { cacheTtl: 600, cacheEverything: true },
          } as RequestInit);
          return r.ok ? parseReddit(await r.json(), sub).slice(0, 6) : [];
        } catch { return []; }
      })();
      const [news, reddit] = await Promise.all([newsP, redditP]);
      const posts = [...reddit, ...news];
      if (debug) return json({ sub, redditCount: reddit.length, newsCount: news.length, total: posts.length }, 200, 5);
      return json({ posts }, 200, 600);
    }

    // RFC 9727 API catalog: a machine-readable index of the public read API so agents can
    // discover it (the live NHL proxy), its health endpoint, and the docs. No auth advertised
    // because the API is public + read-only.
    if (url.pathname === '/.well-known/api-catalog') {
      const o = url.origin;
      const body = JSON.stringify({ linkset: [{
        anchor: `${o}/api/nhl/`,
        'service-doc': [{ href: `${o}/learn` }],
        status: [{ href: `${o}/api-health.html` }],
        author: [{ href: `${o}/` }],
      }] });
      return new Response(body, { headers: { 'content-type': 'application/linkset+json', 'cache-control': 'public, max-age=86400', ...SECURITY_HEADERS } });
    }

    if (url.pathname === '/robots.txt') {
      const body =
        `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /mappers-test.html\nDisallow: /api-health.html\nDisallow: /live-qa.html\nDisallow: /dark-feeds.html\n\nSitemap: ${url.origin}/sitemap.xml\n`;
      return new Response(body, {
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400', ...SECURITY_HEADERS },
      });
    }
    if (url.pathname === '/sitemap.xml') {
      // The hash-routed app views aren't separately crawlable, so the app counts as
      // one URL (the root). The static /learn guides ARE real, indexable pages.
      const o = url.origin;
      const rows: [string, string, string][] = [
        ['/', '1.0', 'hourly'],
        ['/learn', '0.7', 'monthly'],
        ['/learn/nhl-edge', '0.6', 'monthly'],
      ];
      const body =
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        rows.map(([p, pr, cf]) => `  <url><loc>${o}${p}</loc><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join('\n') +
        `\n</urlset>\n`;
      return new Response(body, {
        headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600', ...SECURITY_HEADERS },
      });
    }

    // Everything else → static assets. Prefer a precompiled *.prod.html for the app
    // entry points (faster first paint, no runtime Babel → stricter CSP). This covers
    // BOTH /app and the site root "/" (index.html is the same runtime-Babel app, so
    // serving prod there spares every homepage visitor the ~3MB Babel download + the
    // in-browser transpile of ~550KB of JSX). Falls back to the build-free HTML when
    // no prod build is present, so this is always safe.
    let resp: Response | undefined;
    let servedProd = false;
    // NOTE: this project is maintained WITHOUT a local build step, so a precompiled
    // app.prod.html bundle goes stale the moment any .jsx changes. We therefore serve
    // the runtime-Babel build (index.html / app.html) as the source of truth — always
    // current, at the cost of an in-browser transpile on first paint. app.prod.html
    // stays on disk for anyone who later runs `npm run build`; it's simply not preferred
    // here. (servedProd stays false → the looser CSP that allows in-browser Babel.)
    if (!resp) {
      resp = await env.ASSETS.fetch(request);
      // Clean/extensionless route that didn't match (e.g. /app) → retry as .html
      // so /app serves app.html regardless of the platform's html-handling mode.
      if (resp.status === 404 && !/\.[a-z0-9]+$/i.test(url.pathname)) {
        const path = url.pathname.replace(/\/$/, '') || '/index';
        const htmlReq = new Request(new URL(path + '.html' + url.search, url), request);
        const htmlResp = await env.ASSETS.fetch(htmlReq);
        if (htmlResp.status !== 404) resp = htmlResp;
      }
    }

    // SEO: inject an absolute canonical + og:url into every served HTML page. The app
    // shell is one URL served at both "/" and "/app" (hash views share it) → canonical
    // to the site root, consolidating the duplicates. Standalone pages (the /learn
    // guides) get a self-canonical with any .html stripped to the clean path. Origin-
    // derived, so there's no hard-coded host to drift.
    if ((resp.headers.get('content-type') || '').includes('text/html')) {
      const isApp = servedProd || url.pathname === '/' || url.pathname === '/index.html'
        || url.pathname === '/app' || url.pathname === '/app.html';
      const cleanPath = url.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
      const canonical = isApp ? `${url.origin}/` : `${url.origin}${cleanPath}`;
      resp = new HTMLRewriter()
        .on('head', {
          element(e) {
            e.append(`<link rel="canonical" href="${canonical}"/>`, { html: true });
            e.append(`<meta property="og:url" content="${canonical}"/>`, { html: true });
          },
        })
        .transform(resp);
    }

    return withAppHeaders(resp, servedProd);
  },

  // Cron warming (see [triggers] in wrangler.toml): pre-fetch the hot endpoints on a
  // schedule so the per-colo cache, D1, and global KV are already warm when a real user
  // arrives — they hit cached real data instead of triggering a cold upstream fetch (or
  // falling back to demo). Each fetchUpstream writes Cache + D1 + KV as configured.
  async scheduled(_event: any, env: Env, ctx: any): Promise<void> {
    setCacheDb(env.DB);
    setCacheKv(env.CACHE_KV);
    setMetrics(env.nhl_proxy_metrics);
    const HOT = ['standings', 'scoreboard/now', 'skater-leaders', 'goalie-leaders', 'spotlight', 'partner-odds/US'];
    const warm = Promise.all(HOT.map((p) =>
      handleNhl(new URL('https://warm.thehockeylab.invalid/api/nhl/' + p)).catch(() => undefined)));
    if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(warm); else await warm;
  },
};
