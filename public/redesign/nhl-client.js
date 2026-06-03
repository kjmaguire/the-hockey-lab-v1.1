/* The Hockey Lab — live NHL client (browser side).
   Calls the Cloudflare Pages Functions at /api/nhl/* and maps the real NHL
   response shapes into the view-models the editorial UI already consumes
   (the same shapes window.BC produces from mock data).

   In the design preview there is no proxy + the NHL API blocks CORS, so every
   call rejects and the app falls back to window.BC mock. On Cloudflare Pages
   the proxy exists, so these resolve with real data. Same code, both places. */
(function () {
  const BASE = '/api/nhl';
  const dflt = (v) => (v && v.default !== undefined ? v.default : v);

  async function get(path) {
    const r = await fetch(`${BASE}/${path}`, { headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error(`nhl ${path} -> ${r.status}`);
    return r.json();
  }

  // ---- standings -> BC.STANDINGS row shape ----
  const DIV_SHORT = { Atlantic: 'Atlantic', Metropolitan: 'Metro', Central: 'Central', Pacific: 'Pacific' };
  function mapStandings(payload) {
    const rows = (payload?.standings ?? []).map((t) => {
      const ab = dflt(t.teamAbbrev);
      const div = DIV_SHORT[dflt(t.divisionName)] || dflt(t.divisionName) || '';
      const conf = (dflt(t.conferenceName) || '').startsWith('East') ? 'East' : 'West';
      const gp = t.gamesPlayed ?? 0;
      return {
        ab, div, conf,
        gp, w: t.wins ?? 0, l: t.losses ?? 0, otl: t.otLosses ?? 0,
        pts: t.points ?? 0, gf: t.goalFor ?? 0, ga: t.goalAgainst ?? 0,
        diff: (t.goalFor ?? 0) - (t.goalAgainst ?? 0),
        last10: `${t.l10Wins ?? 0}-${t.l10Losses ?? 0}-${t.l10OtLosses ?? 0}`,
        strk: `${t.streakCode ?? 'W'}${t.streakCount ?? 0}`,
        ppg: t.gamesPlayed ? +((t.goalFor ?? 0) / t.gamesPlayed).toFixed(2) : 0,
        trend: [], // EDGE/derived; UI tolerates empty
        _name: dflt(t.teamName), _city: dflt(t.placeName),
      };
    }).sort((a, b) => b.pts - a.pts || b.diff - a.diff);
    return rows;
  }

  // ---- schedule/score -> BC.slate(offset) game shape ----
  function ymd(offsetDays) {
    const d = new Date(); d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  }
  function mapGame(g) {
    const st = (s) => {
      const v = (s || '').toUpperCase();
      if (v === 'LIVE' || v === 'CRIT') return 'live';
      if (v === 'FINAL' || v === 'OFF') return 'final';
      return 'pre';
    };
    const status = st(g.gameState);
    const as_ = g.awayTeam?.score ?? 0, hs = g.homeTeam?.score ?? 0;
    const ot = status === 'final' && (g.gameOutcome?.lastPeriodType && g.gameOutcome.lastPeriodType !== 'REG');
    const startLocal = g.startTimeUTC
      ? new Date(g.startTimeUTC).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : '';
    return {
      id: String(g.id),
      a: dflt(g.awayTeam?.abbrev), h: dflt(g.homeTeam?.abbrev),
      as: as_, hs,
      st: status, ot,
      per: g.periodDescriptor?.number ? `${ordinal(g.periodDescriptor.number)}` : '',
      clk: g.clock?.timeRemaining ?? '',
      sa: g.awayTeam?.sog ?? 0, sh: g.homeTeam?.sog ?? 0,
      start: startLocal,
      mom: [], // derived later from pbp if needed
      _venue: dflt(g.venue), _tv: (g.tvBroadcasts ?? []).map((b) => b.network),
    };
  }
  function ordinal(n) { return n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`; }

  // ---- play-by-play -> shot map (real rink coordinates) ----
  // NHL coords: x -100..100 (center ice = 0), y -42.5..42.5. Each team switches
  // ends every period, so we normalize per team+period to "attack +x", then mirror
  // the home team to the left so the full-rink map reads away-right / home-left.
  const SHOT_KIND = { 'goal': 'goal', 'shot-on-goal': 'on', 'missed-shot': 'miss', 'blocked-shot': 'block' };
  function mapShots(d) {
    const awayId = d?.awayTeam?.id, homeId = d?.homeTeam?.id;
    const away = dflt(d?.awayTeam?.abbrev) || '', home = dflt(d?.homeTeam?.abbrev) || '';
    const name = {};
    (d?.rosterSpots ?? []).forEach((s) => { name[s.playerId] = `${dflt(s.firstName)} ${dflt(s.lastName)}`; });
    const raw = (d?.plays ?? []).filter((p) =>
      SHOT_KIND[p.typeDescKey] && p.details && p.details.xCoord != null && p.details.yCoord != null);
    // attack direction per team+period (sum of x; negative => team attacks -x that period)
    const grp = {};
    raw.forEach((p) => {
      const k = `${p.details.eventOwnerTeamId}|${p.periodDescriptor?.number ?? 1}`;
      (grp[k] = grp[k] || { s: 0 }).s += p.details.xCoord;
    });
    const shots = raw.map((p) => {
      const dd = p.details, tid = dd.eventOwnerTeamId, per = p.periodDescriptor?.number ?? 1;
      const dir = (grp[`${tid}|${per}`] && grp[`${tid}|${per}`].s < 0) ? -1 : 1;
      const xn = dd.xCoord * dir, yn = dd.yCoord * dir;   // normalized: team attacks +x
      const dist = Math.round(Math.hypot(89 - xn, yn));    // ft to the net it's attacking
      const isAway = tid === awayId;
      const x = isAway ? xn : -xn, y = isAway ? yn : -yn;  // home mirrored to the left
      const pd = p.periodDescriptor || {};
      const perLabel = pd.periodType === 'SO' ? 'SO' : (pd.number > 3 ? 'OT' : ordinal(pd.number || per));
      return {
        team: isAway ? away : home,
        x: +(x + 100).toFixed(1), y: +(y + 42.5).toFixed(1),
        goal: p.typeDescKey === 'goal', type: SHOT_KIND[p.typeDescKey],
        shooter: name[dd.scoringPlayerId ?? dd.shootingPlayerId] || '',
        shotType: dd.shotType ? dd.shotType.replace(/(^|-)([a-z])/g, (_, s, c) => (s ? ' ' : '') + c.toUpperCase()) : '',
        per: perLabel, time: p.timeInPeriod || '', dist,
      };
    });
    return { shots, away, home, source: 'live' };
  }

  // ---- season aggregate shot zones (NHL Edge shot-location detail) ----
  // Stable NHL team ids for the edge team endpoint.
  const TEAM_ID = { ANA:24,BOS:6,BUF:7,CGY:20,CAR:12,CHI:16,COL:21,CBJ:29,DAL:25,DET:17,EDM:22,FLA:13,LAK:26,MIN:30,MTL:8,NSH:18,NJD:1,NYI:2,NYR:3,OTT:9,PHI:4,PIT:5,SJS:28,SEA:55,STL:19,TBL:14,TOR:10,UTA:59,VAN:23,VGK:54,WSH:15,WPG:52 };
  const ZKEYS = ['net','slot','highslot','lcircle','rcircle','lpoint','rpoint','behind'];
  const num = (v) => (typeof v === 'number' ? v : (v && v.value !== undefined ? v.value : (v != null && !isNaN(+v) ? +v : null)));
  // Heuristic mapper: EDGE shot-location shapes are internal/undocumented and vary.
  // We scan for an array of zone-like objects carrying shot + goal/save counts and
  // a label/zone key. If nothing recognizable is found we return null so the UI keeps
  // its sample data (rather than render a broken/empty map).
  function mapZones(payload, scope) {
    if (!payload) return null;
    let arr = null;
    const visit = (o) => {
      if (!o || arr) return;
      if (Array.isArray(o)) {
        if (o.length >= 5 && o.every((x) => x && typeof x === 'object'
          && (x.shots != null || x.shotAttempts != null || x.sog != null)
          && (x.zone != null || x.location != null || x.label != null || x.name != null))) { arr = o; return; }
        o.forEach(visit); return;
      }
      if (typeof o === 'object') Object.values(o).forEach(visit);
    };
    visit(payload);
    if (!arr) return null;
    const goalie = scope === 'goalie';
    const zones = arr.slice(0, 8).map((z, i) => {
      const shots = num(z.shots) ?? num(z.shotAttempts) ?? num(z.sog) ?? 0;
      const made = goalie ? (num(z.goalsAgainst) ?? num(z.goals) ?? 0) : (num(z.goals) ?? 0);
      const pct = num(z.shootingPct) ?? num(z.savePct) ?? (shots ? (goalie ? (1 - made / shots) : made / shots) * 100 : 0);
      const lg = num(z.leagueShootingPct) ?? num(z.leagueSavePct) ?? num(z.leagueAvg) ?? pct;
      return { key: ZKEYS[i] || `z${i}`, label: dflt(z.zone) || dflt(z.location) || dflt(z.label) || dflt(z.name) || `Zone ${i + 1}`,
        shots, made, pct: +(+pct).toFixed(1), lg: +(+lg).toFixed(1), share: 0 };
    });
    const tShots = zones.reduce((s, z) => s + z.shots, 0) || 1;
    zones.forEach((z) => { z.share = +(z.shots / tShots).toFixed(4); });
    const tMade = zones.reduce((s, z) => s + z.made, 0);
    return { scope, source: 'live', shots: tShots, made: tMade,
      pct: +((goalie ? (1 - tMade / tShots) : (tMade / tShots)) * 100).toFixed(1), zones };
  }
  async function fetchZones(scope, id) {
    let path;
    if (scope === 'team') path = `edge/team-shot-location-detail/${TEAM_ID[id] || id}`;
    else if (scope === 'goalie') path = `edge/goalie-detail/${id}`;
    else path = `edge/skater-shot-location-detail/${id}`;
    return mapZones(await get(path), scope);
  }

  async function scoreSlate(offset) {
    // /score/{date} carries live scores + state; richer than /schedule for the board
    const data = await get(`scoreboard?date=${ymd(offset)}`);
    const games = data?.games ?? data?.gameWeek?.flatMap((d) => d.games) ?? [];
    return games.map(mapGame);
  }

  // ---- rosters / club stats -> BC.teamRoster shape ----
  function mapRoster(payload) {
    const out = [];
    const groups = ['forwards', 'defensemen', 'goalies'];
    groups.forEach((grp) => (payload?.[grp] ?? []).forEach((p) => {
      out.push({
        id: String(p.id),
        name: `${dflt(p.firstName)} ${dflt(p.lastName)}`,
        team: dflt(payload.teamAbbrev) || '',
        pos: p.positionCode || (grp === 'goalies' ? 'G' : grp === 'defensemen' ? 'D' : 'C'),
        num: p.sweaterNumber ?? '',
        _isGoalie: grp === 'goalies',
      });
    }));
    return out;
  }

  // ---- skater/goalie leaders (stats api passthrough) ----
  function mapSkaterLeaders(payload) {
    return (payload?.data ?? []).map((p) => ({
      id: String(p.playerId ?? p.id),
      name: p.skaterFullName ?? p.playerName ?? '',
      team: p.teamAbbrevs ?? p.teamAbbrev ?? '',
      pos: p.positionCode ?? 'F',
      gp: p.gamesPlayed ?? 0, g: p.goals ?? 0, a: p.assists ?? 0, p: p.points ?? 0,
      pm: p.plusMinus ?? 0, sog: p.shots ?? 0,
    }));
  }
  function mapGoalieLeaders(payload) {
    return (payload?.data ?? []).map((g) => ({
      id: String(g.playerId ?? g.id),
      name: g.goalieFullName ?? g.playerName ?? '',
      team: g.teamAbbrevs ?? g.teamAbbrev ?? '',
      gp: g.gamesPlayed ?? 0, w: g.wins ?? 0, l: g.losses ?? 0,
      svp: (g.savePctg != null ? g.savePctg.toFixed(3).slice(1) : '900'),
      gaa: (g.goalsAgainstAverage != null ? g.goalsAgainstAverage.toFixed(2) : '0.00'),
      so: g.shutouts ?? 0,
    }));
  }

  window.NHL = {
    BASE, get,
    ymd, ordinal,
    standings: async () => mapStandings(await get('standings')),
    scores: scoreSlate,
    schedule: async (offset) => (await get(`schedule?date=${ymd(offset)}`)),
    boxscore: (id) => get(`gamecenter/${id}/boxscore`),
    playByPlay: (id) => get(`gamecenter/${id}/play-by-play`),
    shotMap: async (id) => mapShots(await get(`gamecenter/${id}/play-by-play`)),
    shotZones: (scope, id) => fetchZones(scope, id),
    rightRail: (id) => get(`gamecenter/${id}/right-rail`),
    roster: async (team) => mapRoster(await get(`roster/${team}`)),
    rosterRaw: (team) => get(`roster/${team}`),
    clubStats: (team) => get(`club-stats/${team}`),
    clubSchedule: (team) => get(`club-schedule-view/${team}?view=month`),
    teamStats: (team) => get(`team-stats/${team}`),
    prospects: (team) => get(`prospects/${team}`),
    playerLanding: (id) => get(`player/${id}/landing`),
    playerGameLog: (id) => get(`player/${id}/game-log`),
    skaterLeaders: async () => mapSkaterLeaders(await get('skater-leaders')),
    goalieLeaders: async () => mapGoalieLeaders(await get('goalie-leaders')),
    edgeSkater: (id) => get(`edge/skater-detail/${id}`),
    edgeGoalie: (id) => get(`edge/goalie-detail/${id}`),
    edgeSkaterLanding: () => get('edge/skater-landing'),
    edgeGoalieLanding: () => get('edge/goalie-landing'),
    edgeSkaterComparison: (id) => get(`edge/skater-comparison/${id}`),
    edgeSkaterShotLocTop: (pos, cat, sort) => get(`edge/skater-shot-location-top-10/${pos}/${cat}/${sort}`),
    edgeSkaterShotLoc: (id) => get(`edge/skater-shot-location-detail/${id}`),
    edgeTeamSkatingSpeedTop: (pos, sort) => get(`edge/team-skating-speed-top-10/${pos}/${sort}`),
    edgeTeamSkatingSpeed: (teamId) => get(`edge/team-skating-speed-detail/${teamId}`),
    edgeTeamSkatingDistTop: (pos, strength, sort) => get(`edge/team-skating-distance-top-10/${pos}/${strength}/${sort}`),
    edgeTeamSkatingDist: (teamId) => get(`edge/team-skating-distance-detail/${teamId}`),
    edgeTeamShotLocTop: (pos, cat, sort) => get(`edge/team-shot-location-top-10/${pos}/${cat}/${sort}`),
    edgeTeamShotLoc: (teamId) => get(`edge/team-shot-location-detail/${teamId}`),
    // any edge endpoint at all (generic escape hatch):
    edge: (path) => get(`edge/${path}`),
    // cat/edge variants (different prefix): use generic stats-free passthrough
    catEdgeSkater: (id) => get(`edge/cat/skater-detail/${id}`),
    catEdgeGoalie: (id) => get(`edge/cat/goalie-detail/${id}`),

    // ---- league schedule extras ----
    scheduleCalendar: (date) => get(date ? `schedule-calendar/${date}` : 'schedule-calendar'),

    // ---- game extras ----
    gameLanding: (id) => get(`gamecenter-landing/${id}`),
    gameStory: (id) => get(`game-story/${id}`),
    whereToWatch: () => get('where-to-watch'),
    tvSchedule: (date) => get(date ? `tv-schedule/${date}` : 'tv-schedule'),
    partnerOdds: (country) => get(`partner-odds/${country || 'US'}`),
    shiftCharts: (gameId) => get(`shift-charts/${gameId}`),

    // ---- team extras ----
    teamScoreboard: (team) => get(`team-scoreboard/${team}`),
    standingsSeason: () => get('standings-season'),

    // ---- season / meta ----
    seasons: () => get('season'),
    meta: () => get('meta'),
    gameMeta: (id) => get(`meta/game/${id}`),

    // ---- draft ----
    draftRankings: (season, category) => get(season ? `draft/rankings/${season}?category=${category || 1}` : 'draft/rankings'),
    draftPicks: (season, round) => get(season ? `draft/picks/${season}?round=${round || 'all'}` : 'draft/picks'),
    draftTracker: () => get('draft/tracker'),

    // ---- stats API utilities (generic passthrough) ----
    stats: (path, query) => {
      const qs = query ? '?' + new URLSearchParams(query).toString() : '';
      return get(`stats/${path}${qs}`);
    },
    // extras the proxy now also exposes (see cloudflare functions):
    spotlight: () => get('spotlight'),
    playoffBracket: () => get('playoff-bracket'),
    playoffSeries: (season) => get(`playoff-series-carousel/${season}`),
    playoffSeriesSchedule: (season, letter) => get(`schedule/playoff-series/${season}/${letter}`),

    // ---- replay / location / misc ----
    goalReplay: (gameId, eventId) => get(`ppt-replay/goal/${gameId}/${eventId}`),
    playReplay: (gameId, eventId) => get(`ppt-replay/${gameId}/${eventId}`),
    wscPlayByPlay: (id) => get(`wsc-pbp/${id}`),
    location: () => get('location'),
    postalLookup: (postal) => get(`postal-lookup/${postal}`),

    // ---- EDGE team landing/detail/comparison (named) ----
    edgeTeamLanding: () => get('edge/team-landing'),
    edgeTeamDetail: (teamId) => get(`edge/team-detail/${teamId}`),
    edgeTeamComparison: (teamId) => get(`edge/team-comparison/${teamId}`),
    // EDGE per-category top-10 / detail (skater + goalie + team), via generic edge():
    edgeTop: (scope, metric, args = '') => get(`edge/${scope}-${metric}-top-10/${args}`),     // e.g. edgeTop('skater','zone-time','F/all/points')
    edgeDetail: (scope, metric, id) => get(`edge/${scope}-${metric}-detail/${id}`),

    // ---- Stats API convenience report helpers ----
    statsSkater: (report, cayenneExp, extra = {}) => window.NHL.stats(`skater/${report}`, { isAggregate: 'false', isGame: 'false', start: 0, limit: 100, cayenneExp, ...extra }),
    statsGoalie: (report, cayenneExp, extra = {}) => window.NHL.stats(`goalie/${report}`, { isAggregate: 'false', isGame: 'false', start: 0, limit: 100, cayenneExp, ...extra }),
    statsTeam: (report, cayenneExp, extra = {}) => window.NHL.stats(`team/${report}`, { isAggregate: 'false', isGame: 'false', start: 0, limit: 50, cayenneExp, ...extra }),
    statsLeadersSkater: (attr, extra = {}) => window.NHL.stats(`leaders/skaters/${attr}`, extra),
    statsLeadersGoalie: (attr, extra = {}) => window.NHL.stats(`leaders/goalies/${attr}`, extra),
    statsMilestonesSkater: () => window.NHL.stats('milestones/skaters'),
    statsMilestonesGoalie: () => window.NHL.stats('milestones/goalies'),
    statsConfig: () => window.NHL.stats('config'),       // self-documents every report + filter field
    statsFranchise: () => window.NHL.stats('franchise'),
    statsCountry: () => window.NHL.stats('country'),
    statsGlossary: () => window.NHL.stats('glossary'),
    statsPing: () => window.NHL.stats('ping'),
    statsDraft: (cayenneExp) => window.NHL.stats('draft', cayenneExp ? { cayenneExp } : undefined),
    statsPlayerSearch: (cayenneExp) => window.NHL.stats('players', { cayenneExp }),

    // ---- records.nhl.com — all-time records / awards ----
    records: (path, query) => { const qs = query ? '?' + new URLSearchParams(query).toString() : ''; return get(`records/${path}${qs}`); },
    recordFranchise: () => get('records/franchise'),
    recordAllTimeLeaders: (cat) => get(`records/franchise-season-records?cayenneExp=1=1`),
    recordTrophies: () => get('records/trophy'),
    recordAwardWinners: () => get('records/award-details?include=trophy.name'),
    recordSkaterAllTime: (cat) => get(`records/skater-records?cayenneExp=1=1&sort=${cat || 'points'}`),
    recordGoalieAllTime: () => get('records/goalie-records?cayenneExp=1=1'),
    recordMilestones: () => get('records/milestones'),

    // ---- WSC (broadcast narrative) ----
    wscGameStory: (id) => get(`wsc/game-story/${id}`),
    wscPlayByPlay2: (id) => get(`wsc/play-by-play/${id}`),

    // ---- stats config (self-documents every report + filter field) ----
    config: () => get('config'),
    _map: { mapStandings, mapGame, mapRoster, mapSkaterLeaders, mapGoalieLeaders, mapShots, mapZones },
  };
})();
