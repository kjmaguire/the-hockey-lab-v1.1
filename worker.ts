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
} from './functions/api/nhl/_lib';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
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
      case 'standings':
        return proxyWeb('standings/now');
      case 'roster': {
        if (!b) break;
        const season = q('season', '20242025')!;
        const gameType = q('gameType', '2')!;
        return proxyWeb(`roster/${b}/${season}`, { gameType });
      }
      case 'roster-season':
        if (!b) break;
        return proxyWeb(`roster-season/${b}`);
      case 'club-schedule': {
        if (!b) break;
        const season = q('season', '20242025')!;
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
        const season = q('season', '20242025')!;
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
        const season = q('season', '20242025')!;
        const gameType = q('gameType', '2')!;
        return teamStats(b, season, gameType);
      }
      case 'player': {
        const playerId = b;
        const kind = c;
        if (!playerId || !kind) break;
        if (kind === 'landing') return proxyWeb(`player/${playerId}/landing`);
        if (kind === 'game-log') {
          const season = q('season', '20242025')!;
          const gameType = q('gameType', '2')!;
          return proxyWeb(`player/${playerId}/game-log/${season}/${gameType}`);
        }
        break;
      }
      case 'goalie-leaders': {
        const season = q('season', '20242025')!;
        const gameType = q('gameType', '2')!;
        try {
          const data = await statsRequest('goalie/summary', {
            isAggregate: 'false', isGame: 'false', start: 0, limit: 200,
            cayenneExp: `seasonId=${season} and gameTypeId=${gameType}`,
          });
          return json(data);
        } catch {
          return errorJson('Unable to reach the NHL stats API.', 502);
        }
      }
      case 'skater-leaders': {
        const season = q('season', '20242025')!;
        const gameType = q('gameType', '2')!;
        try {
          const data = await statsRequest('skater/summary', {
            isAggregate: 'false', isGame: 'false', start: 0, limit: 1000,
            cayenneExp: `seasonId=${season} and gameTypeId=${gameType}`,
          });
          return json(data);
        } catch {
          return errorJson('Unable to reach the NHL stats API.', 502);
        }
      }
      case 'edge': {
        const kind = b;
        const season = q('season', '20242025')!;
        const group = q('group', '2')!;
        if (kind === 'skater-landing') return proxyWeb(`edge/skater-landing/${season}/${group}`);
        if (kind === 'goalie-landing') return proxyWeb(`edge/goalie-landing/${season}/${group}`);
        if (kind === 'skater-detail' && c) return proxyWeb(`edge/skater-detail/${c}/${season}/${group}`);
        if (kind === 'goalie-detail' && c) return proxyWeb(`edge/goalie-detail/${c}/${season}/${group}`);
        if (kind === 'skater-comparison' && c) return proxyWeb(`edge/skater-comparison/${c}/${season}/${group}`);
        const rest = segments.slice(1).join('/');
        if (rest) {
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
        const season = q('season', '20242025')!;
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
        if (sub === 'rankings') return proxyWeb(c ? `draft/rankings/${c}/${q('category', '1')}` : 'draft/rankings/now');
        if (sub === 'picks') return proxyWeb(c ? `draft/picks/${c}/${q('round', 'all')}` : 'draft/picks/now');
        if (sub === 'tracker') return proxyWeb('draft-tracker/picks/now');
        break;
      }
      case 'stats': {
        const rest = segments.slice(1).join('/');
        if (!rest) break;
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API routes → live NHL proxy
    if (url.pathname === '/api/nhl' || url.pathname.startsWith('/api/nhl/')) {
      if (request.method !== 'GET') return errorJson('Method not allowed.', 405);
      return handleNhl(url);
    }

    // Everything else → static assets.
    let resp = await env.ASSETS.fetch(request);

    // Clean/extensionless route that didn't match (e.g. /app) → retry as .html
    // so /app serves app.html regardless of the platform's html-handling mode.
    if (resp.status === 404 && !/\.[a-z0-9]+$/i.test(url.pathname)) {
      const path = url.pathname.replace(/\/$/, '') || '/index';
      const htmlReq = new Request(new URL(path + '.html' + url.search, url), request);
      const htmlResp = await env.ASSETS.fetch(htmlReq);
      if (htmlResp.status !== 404) resp = htmlResp;
    }

    return resp;
  },
};
