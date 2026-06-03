// ---------------------------------------------------------------------------
// The Hockey Lab — /api/nhl/* router (Cloudflare Pages Function)
//
// Catch-all that reproduces every route from routes/web.php's
// `Route::prefix('api/nhl')` group, dispatching to the ported NhlApiController
// logic in ./_lib.ts.
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
} from './_lib';

interface Env {}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, request } = context;
  const segments = (Array.isArray(params.path) ? params.path : [params.path]).filter(Boolean) as string[];
  const url = new URL(request.url);
  const q = (key: string, fallback?: string) => url.searchParams.get(key) ?? fallback;

  const [a, b, c] = segments;

  try {
    switch (a) {
      // GET /api/nhl/schedule  (?start&end | ?date | now)
      case 'schedule': {
        const start = q('start');
        const end = q('end');
        const date = q('date');
        if (start && end) return scheduleRange(start, end);
        if (date) return proxyWeb(`schedule/${date}`);
        return proxyWeb('schedule/now');
      }

      // GET /api/nhl/scoreboard  (?date | now)
      case 'scoreboard': {
        const date = q('date');
        return date ? proxyWeb(`score/${date}`) : proxyWeb('score/now');
      }

      // GET /api/nhl/gamecenter/{gameId}/{boxscore|play-by-play|right-rail}
      case 'gamecenter': {
        const gameId = b;
        const kind = c;
        if (!gameId || !kind) break;
        if (kind === 'boxscore') return proxyWeb(`gamecenter/${gameId}/boxscore`);
        if (kind === 'play-by-play') return proxyWeb(`gamecenter/${gameId}/play-by-play`);
        if (kind === 'right-rail') return proxyWeb(`gamecenter/${gameId}/right-rail`);
        break;
      }

      // GET /api/nhl/teams
      case 'teams':
        return teams();

      // GET /api/nhl/standings
      case 'standings':
        return proxyWeb('standings/now');

      // GET /api/nhl/roster/{teamAbbrev}
      case 'roster': {
        if (!b) break;
        const season = q('season', '20242025')!;
        const gameType = q('gameType', '2')!;
        return proxyWeb(`roster/${b}/${season}`, { gameType });
      }

      // GET /api/nhl/roster-season/{teamAbbrev}
      case 'roster-season':
        if (!b) break;
        return proxyWeb(`roster-season/${b}`);

      // GET /api/nhl/club-schedule/{teamAbbrev}
      case 'club-schedule': {
        if (!b) break;
        const season = q('season', '20242025')!;
        return proxyWeb(`club-schedule-season/${b}/${season}`);
      }

      // GET /api/nhl/club-schedule-view/{teamAbbrev}
      case 'club-schedule-view': {
        if (!b) break;
        const view = q('view', 'month')!;
        if (view !== 'month' && view !== 'week') {
          return errorJson('Invalid schedule view.', 400);
        }
        const date = q('date');
        const slug = date || 'now';
        return proxyWeb(`club-schedule/${b}/${view}/${slug}`);
      }

      // GET /api/nhl/club-stats/{teamAbbrev}
      case 'club-stats': {
        if (!b) break;
        const season = q('season', '20242025')!;
        const gameType = q('gameType', '2')!;
        return proxyWeb(`club-stats/${b}/${season}/${gameType}`);
      }

      // GET /api/nhl/club-stats-season/{teamAbbrev}
      case 'club-stats-season':
        if (!b) break;
        return proxyWeb(`club-stats-season/${b}`);

      // GET /api/nhl/prospects/{teamAbbrev}
      case 'prospects':
        if (!b) break;
        return proxyWeb(`prospects/${b}`);

      // GET /api/nhl/team-stats/{teamAbbrev}
      case 'team-stats': {
        if (!b) break;
        const season = q('season', '20242025')!;
        const gameType = q('gameType', '2')!;
        return teamStats(b, season, gameType);
      }

      // GET /api/nhl/player/{playerId}/{landing|game-log}
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

      // GET /api/nhl/goalie-leaders
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

      // GET /api/nhl/skater-leaders
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

      // GET /api/nhl/edge/* — full NHL EDGE surface.
      // Known shorthands take season/group from query; anything else is a
      // generic passthrough so EVERY edge endpoint is reachable:
      //   edge/goalie-landing, edge/skater-comparison/{id},
      //   edge/skater-shot-location-top-10/{pos}/{cat}/{sort},
      //   edge/team-skating-distance-top-10/{pos}/{strength}/{sort},
      //   edge/team-skating-speed-detail/{teamId}, etc.
      case 'edge': {
        const kind = b;
        const season = q('season', '20242025')!;
        const group = q('group', '2')!;
        if (kind === 'skater-landing') {
          return proxyWeb(`edge/skater-landing/${season}/${group}`);
        }
        if (kind === 'goalie-landing') {
          return proxyWeb(`edge/goalie-landing/${season}/${group}`);
        }
        if (kind === 'skater-detail' && c) {
          return proxyWeb(`edge/skater-detail/${c}/${season}/${group}`);
        }
        if (kind === 'goalie-detail' && c) {
          return proxyWeb(`edge/goalie-detail/${c}/${season}/${group}`);
        }
        if (kind === 'skater-comparison' && c) {
          return proxyWeb(`edge/skater-comparison/${c}/${season}/${group}`);
        }
        // generic passthrough: forward the rest of the path verbatim.
        // If it doesn't already end with a season segment, append season/group.
        const rest = segments.slice(1).join('/'); // everything after "edge"
        if (rest) {
          const endsWithSeason = /\/\d{8}(\/\d+)?$/.test(rest) || /\/now$/.test(rest);
          const full = endsWithSeason ? `edge/${rest}` : `edge/${rest}/${season}/${group}`;
          return proxyWeb(full);
        }
        break;
      }
      // GET /api/nhl/spotlight  (featured players)
      case 'spotlight':
        return proxyWeb('player-spotlight');

      // GET /api/nhl/playoff-bracket  (current bracket)
      case 'playoff-bracket':
        return proxyWeb('playoff-bracket/now');

      // GET /api/nhl/playoff-series-carousel/{season}
      case 'playoff-series-carousel': {
        if (!b) break;
        return proxyWeb(`playoff-series/carousel/${b}`);
      }

      // GET /api/nhl/edge/team-skating-speed/{positions}/{sortBy}
      case 'edge-team': {
        const kind = b;
        const season = q('season', '20242025')!;
        const group = q('group', '2')!;
        if (kind === 'skating-speed' && c) {
          return proxyWeb(`edge/team-skating-speed-top-10/${c}/points/${season}/${group}`);
        }
        if (kind === 'shot-location' && c) {
          return proxyWeb(`edge/team-shot-location-top-10/${c}/all/points/${season}/${group}`);
        }
        break;
      }
      // ---- League schedule extras ----
      case 'schedule-calendar':
        return proxyWeb(b ? `schedule-calendar/${b}` : 'schedule-calendar/now');

      // ---- Game extras ----
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

      // ---- Team extras ----
      case 'team-scoreboard':
        if (!b) break;
        return proxyWeb(`scoreboard/${b}/now`);
      case 'standings-season':
        return proxyWeb('standings-season');

      // ---- Season / meta ----
      case 'season':
        return proxyWeb('season');
      case 'meta':
        if (b === 'game' && c) return proxyWeb(`meta/game/${c}`);
        return proxyWeb('meta');

      // ---- Draft ----
      case 'draft': {
        const sub = b;
        if (sub === 'rankings') {
          // /draft/rankings/{season}/{category}  or  /draft/rankings/now
          return proxyWeb(c ? `draft/rankings/${c}/${q('category', '1')}` : 'draft/rankings/now');
        }
        if (sub === 'picks') {
          // /draft/picks/{season}/{round}  or  /draft/picks/now
          return proxyWeb(c ? `draft/picks/${c}/${q('round', 'all')}` : 'draft/picks/now');
        }
        if (sub === 'tracker') {
          return proxyWeb('draft-tracker/picks/now');
        }
        break;
      }

      // ---- Stats API utilities (api.nhle.com/stats/rest) ----
      case 'stats': {
        // generic passthrough to the stats API: /api/nhl/stats/<path>?<query>
        const rest = segments.slice(1).join('/');
        if (!rest) break;
        try {
          const data = await statsRequest(rest, Object.fromEntries(url.searchParams.entries()));
          return json(data);
        } catch {
          return errorJson('Unable to reach the NHL stats API.', 502);
        }
      }

      // ---- Shift charts ----
      case 'shift-charts': {
        if (!b) break;
        try {
          const data = await statsRequest('shiftcharts', { cayenneExp: `gameId=${b}` });
          return json(data);
        } catch {
          return errorJson('Unable to reach the NHL stats API.', 502);
        }
      }

      // ---- replay / wsc / location / misc ----
      case 'ppt-replay': {
        // ppt-replay/goal/{id}/{event}  or  ppt-replay/{id}/{event}
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

      // ---- playoff series schedule ----
      case 'playoff-series-schedule': {
        if (!b || !c) break;
        return proxyWeb(`schedule/playoff-series/${b}/${c}`);
      }

      // ---- records.nhl.com — all-time records / awards / record book ----
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

      // ---- WSC game story / play-by-play (broadcast narrative) ----
      case 'wsc': {
        const kind = b;
        if (kind === 'game-story' && c) return proxyWeb(`wsc/game-story/${c}`);
        if (kind === 'play-by-play' && c) return proxyWeb(`wsc/play-by-play/${c}`);
        break;
      }

      // ---- stats config (self-documents every report + filter) ----
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
};
