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

  // Normalize a team code from ANY live feed to the canonical tricode used by the
  // color/name maps. Live feeds aren't perfectly consistent (case, stray spaces,
  // period codes like "L.A"/"T.B", 2-letter codes, or legacy abbreviations), and a
  // code that doesn't match drops the team to a gray fallback — which is why some
  // teams lost their colors when live. Uppercasing + de-punctuating + an alias table
  // maps every known variant back to the canonical code (ANA, VGK, …).
  const TEAM_ALIAS = {
    LA: 'LAK', NJ: 'NJD', SJ: 'SJS', TB: 'TBL', CBS: 'CBJ', CLB: 'CBJ', CJ: 'CBJ',
    VEG: 'VGK', LV: 'VGK', WIN: 'WPG', WPJ: 'WPG', MON: 'MTL', MTI: 'MTL',
    NAS: 'NSH', NA: 'NSH', CAL: 'CGY', ARI: 'UTA', PHX: 'UTA', UTAH: 'UTA',
    ANH: 'ANA', VGS: 'VGK', SEA: 'SEA',
  };
  const normTeam = (c) => {
    let s = String(dflt(c) ?? '').toUpperCase().replace(/[^A-Z]/g, '').trim();
    return TEAM_ALIAS[s] || s;
  };
  // Resolve a team NAME ("Edmonton Oilers", "Oilers", "Edmonton") to its tricode using
  // the loaded team table. Player-landing season rows often carry a full name and no
  // abbrev, which left the season-history badge gray.
  const teamByName = (v) => {
    const s = String(dflt(v) ?? '').toLowerCase().trim(); if (!s) return '';
    const B = window.BC; if (!B || !B.ABBR) return '';
    for (const ab of B.ABBR) {
      if (s === ab.toLowerCase()) return ab;
      const nk = String(B.nick(ab) || '').toLowerCase(), ct = String(B.city(ab) || '').toLowerCase();
      if (s === (ct + ' ' + nk) || (nk && s.endsWith(nk)) || (ct && s.startsWith(ct))) return ab;
    }
    return '';
  };

  // Request layer: in-flight de-dup (concurrent identical GETs share one fetch),
  // a short TTL cache for non-live endpoints (instant revisits, less proxy load),
  // and a hard timeout so a hung request falls back to mock instead of spinning.
  const _inflight = new Map();
  const _cache = new Map();
  const TTL = 12000;
  // Immutable / historical data (a SPECIFIC past draft year, the records book) never
  // changes, so cache it for the whole session client-side. This is what makes
  // flipping back and forth between draft YEARS instant + reliable: once a year has
  // been pulled it is never re-fetched (so a cold edge / slow upstream can't drop
  // that year back to mock on the next switch).
  const LONG_TTL = 6 * 3600 * 1000;
  // Immutable historical endpoints: a specific past draft year, the records book, and
  // standings AS OF a specific past date (a completed season's final table). These never
  // change, so they're cached permanently — in memory for the session AND in localStorage
  // so they survive reloads and repeat visits with ZERO refetch. (Caching immutable
  // responses is standard good-citizen practice; it reduces NHL API load.)
  const IMMUTABLE = /draft\/(picks|rankings)\/\d{4}|^records\/|standings\/\d{4}-\d{2}-\d{2}/;
  const ALWAYS_FRESH = /scoreboard|^score\b|\/now|gamecenter\/.*\/(boxscore|play-by-play)/;
  // ---- durable browser cache for immutable historical data (localStorage) ----
  const LS_PREFIX = 'thl:imm:';
  function lsGet(path) {
    try { const v = localStorage.getItem(LS_PREFIX + path); return v == null ? undefined : JSON.parse(v); } catch (_) { return undefined; }
  }
  function lsPut(path, data) {
    let s; try { s = JSON.stringify(data); } catch (_) { return; }
    if (s.length > 1500000) return; // don't persist huge payloads to localStorage
    try { localStorage.setItem(LS_PREFIX + path, s); }
    catch (_) { // quota hit: drop our oldest immutable entries and retry once
      try { Object.keys(localStorage).filter((k) => k.indexOf(LS_PREFIX) === 0).slice(0, 24).forEach((k) => localStorage.removeItem(k)); localStorage.setItem(LS_PREFIX + path, s); } catch (__) {}
    }
  }
  async function rawGet(path) {
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 9000);
    try {
      const r = await fetch(`${BASE}/${path}`, { headers: { accept: 'application/json' }, signal: ac.signal });
      if (!r.ok) throw new Error(`nhl ${path} -> ${r.status}`);
      return await r.json();
    } finally { clearTimeout(to); }
  }
  async function get(path) {
    const fresh = ALWAYS_FRESH.test(path);
    const immutable = !fresh && IMMUTABLE.test(path);
    if (!fresh) {
      const c = _cache.get(path);
      const ttl = immutable ? LONG_TTL : TTL;
      if (c && Date.now() - c.t < ttl) return c.data;
      // durable browser copy of immutable historical data — survives reloads/visits
      if (immutable) { const ls = lsGet(path); if (ls !== undefined) { _cache.set(path, { t: Date.now(), data: ls }); return ls; } }
    }
    const existing = _inflight.get(path);
    if (existing) return existing;            // join a concurrent identical request
    const p = rawGet(path);
    _inflight.set(path, p);
    p.then((d) => { if (!fresh) _cache.set(path, { t: Date.now(), data: d }); if (immutable && d !== undefined) lsPut(path, d); })
      .catch(() => {})
      .finally(() => { _inflight.delete(path); });
    return p;
  }

  // ---- standings -> BC.STANDINGS row shape ----
  const DIV_SHORT = { Atlantic: 'Atlantic', Metropolitan: 'Metro', Central: 'Central', Pacific: 'Pacific' };
  function mapStandings(payload) {
    const rows = (payload?.standings ?? []).map((t) => {
      const ab = normTeam(t.teamAbbrev);
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
      a: normTeam(g.awayTeam?.abbrev), h: normTeam(g.homeTeam?.abbrev),
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
        team: normTeam(payload.teamAbbrev),
        pos: p.positionCode || (grp === 'goalies' ? 'G' : grp === 'defensemen' ? 'D' : 'C'),
        num: p.sweaterNumber ?? '',
        _isGoalie: grp === 'goalies',
      });
    }));
    return out;
  }

  // ---- skater/goalie leaders (stats api passthrough) ----
  // teamAbbrevs can be "BOS,TOR" for a traded player — take the current (last) club.
  const curTeam = (v) => normTeam(String(v ?? '').split(',').pop());
  const POS = { L: 'LW', R: 'RW', C: 'C', D: 'D', G: 'G' };
  // The stats `summary` report is requested UN-aggregated (isAggregate:false) so each
  // row carries its team (aggregating server-side drops teamAbbrevs → every leader went
  // gray). We sum a traded player's stints back into one season line here, and take the
  // club where they played the most games as their CURRENT team for the badge/color.
  function aggByPlayer(rows, sumKeys) {
    const by = {};
    (rows || []).forEach((r) => {
      const id = String(r.playerId ?? r.id); if (!id || id === 'undefined') return;
      const gp = +(r.gamesPlayed || 0);
      const tm = r.teamAbbrevs ?? r.teamAbbrev;
      let o = by[id];
      if (!o) { o = by[id] = { r: { ...r }, team: tm, teamGp: gp }; }
      else {
        sumKeys.forEach((k) => { o.r[k] = (+o.r[k] || 0) + (+r[k] || 0); });
        if (gp >= o.teamGp) { o.teamGp = gp; o.team = tm; } // current = most-played club
      }
    });
    return Object.values(by).map((o) => { o.r._team = o.team; return o.r; });
  }
  function mapSkaterLeaders(payload) {
    const rows = aggByPlayer(payload?.data, ['gamesPlayed','goals','assists','points','plusMinus','shots']);
    return rows.map((p) => ({
      id: String(p.playerId ?? p.id),
      name: p.skaterFullName ?? p.playerName ?? '',
      team: curTeam(p._team ?? p.teamAbbrevs ?? p.teamAbbrev),
      pos: POS[p.positionCode] ?? p.positionCode ?? 'F',
      num: '', // sweater not in the summary report; rosters render it as optional
      gp: p.gamesPlayed ?? 0, g: p.goals ?? 0, a: p.assists ?? 0, p: p.points ?? 0,
      pm: p.plusMinus ?? 0, sog: p.shots ?? 0,
    })).sort((a, b) => b.p - a.p || b.g - a.g);
  }
  function mapGoalieLeaders(payload) {
    const rows = aggByPlayer(payload?.data, ['gamesPlayed','wins','losses','shutouts','saves','shotsAgainst','goalsAgainst','timeOnIce']);
    return rows.map((g) => {
      // Recompute rate stats from the SUMMED counting stats (you can't average averages).
      const sa = g.shotsAgainst, sv = g.saves ?? (sa != null && g.goalsAgainst != null ? sa - g.goalsAgainst : null);
      const svRaw = sa ? (sv != null ? sv / sa : null) : (g.savePct ?? g.savePctg ?? null);
      const toi = +(g.timeOnIce || 0); // seconds
      const gaaRaw = toi > 0 ? (g.goalsAgainst * 3600 / toi) : (g.gamesPlayed ? g.goalsAgainst / g.gamesPlayed : (g.goalsAgainstAverage ?? g.goalsAgainstAvg));
      return {
        id: String(g.playerId ?? g.id),
        name: g.goalieFullName ?? g.playerName ?? '',
        team: curTeam(g._team ?? g.teamAbbrevs ?? g.teamAbbrev),
        gp: g.gamesPlayed ?? 0, w: g.wins ?? 0, l: g.losses ?? 0,
        svp: (svRaw != null ? (+svRaw).toFixed(3).slice(1) : '—'),
        gaa: (gaaRaw != null ? (+gaaRaw).toFixed(2) : '—'),
        so: g.shutouts ?? 0,
      };
    }).sort((a, b) => b.w - a.w);
  }

  // ---- player landing -> playerExtras overlay (real career/history/awards) ----
  const MONS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmtSeason = (s) => { const t = String(s || ''); return t.length === 8 ? `${t.slice(0,4)}-${t.slice(6,8)}` : t; };
  const fmtDate = (s) => { if (!s) return ''; const p = String(s).split('-'); return p.length === 3 ? `${MONS[+p[1]-1]} ${+p[2]}` : s; };
  function mapPlayerCard(d) {
    if (!d) return null;
    const isG = (d.position || '') === 'G';
    const ab = normTeam(d.currentTeamAbbrev);
    const nhlRows = (d.seasonTotals || []).filter((s) => s.gameTypeId === 2 && s.leagueAbbrev === 'NHL');
    const history = nhlRows.slice().reverse().slice(0, 8).map((s) => {
      const team = normTeam(s.teamAbbrev) || teamByName(dflt(s.teamCommonName) || dflt(s.teamName) || dflt(s.teamPlaceName)) || ab;
      return isG
        ? { s: fmtSeason(s.season), team, gp: s.gamesPlayed ?? 0, w: s.wins ?? 0, l: s.losses ?? 0,
            svp: ((s.savePctg ?? s.savePct) != null ? (+(s.savePctg ?? s.savePct)).toFixed(3).slice(1) : '—'), gaa: ((s.goalsAgainstAvg ?? s.goalsAgainstAverage) != null ? (+(s.goalsAgainstAvg ?? s.goalsAgainstAverage)).toFixed(2) : '—') }
        : { s: fmtSeason(s.season), team, gp: s.gamesPlayed ?? 0, g: s.goals ?? 0, a: s.assists ?? 0, p: s.points ?? 0, pm: s.plusMinus ?? 0 };
    });
    const c = (d.careerTotals && d.careerTotals.regularSeason) || {};
    const career = isG
      ? { gp: c.gamesPlayed ?? 0, w: c.wins ?? 0, l: c.losses ?? 0 }
      : { gp: c.gamesPlayed ?? 0, g: c.goals ?? 0, a: c.assists ?? 0, p: c.points ?? 0 };
    const awards = (d.awards || []).flatMap((a) => (a.seasons || []).map((se) => ({ name: dflt(a.trophy), yr: fmtSeason(se.seasonId).split('-')[0] }))).slice(0, 8);
    if (!history.length && !awards.length) return null;
    return { history, career, awards };
  }

  // ---- game landing + boxscore -> box score / scoring / three stars / team stats / lineups ----
  const foStr = (v) => (v == null ? null : (v <= 1 ? (v * 100).toFixed(1) : (+v).toFixed(1)) + '%');
  const ppStr = (v) => (v == null ? null : String(v));
  function mapGameLive(landing, box) {
    const L = landing || {};
    const sm = L.summary || {};
    const bs = box && box.playerByGameStats;
    // identity/score/sog: prefer the boxscore (always present for a played game), else landing
    const aT = (box && box.awayTeam) || L.awayTeam || {}, hT = (box && box.homeTeam) || L.homeTeam || {};
    const a = dflt(aT.abbrev), h = dflt(hT.abbrev);
    if (!a || !h) return null;
    if (!bs && !(sm.linescore)) return null; // nothing usable → keep mock
    const aScore = aT.score ?? 0, hScore = hT.score ?? 0, aSog = aT.sog ?? 0, hSog = hT.sog ?? 0;
    const perLabel = (pd) => (pd && (pd.periodType === 'SO')) ? 'SO' : (pd && pd.number > 3 ? 'OT' : ordinal((pd && pd.number) || 1));

    // ---- skaters & goalies from the boxscore (the reliable source) ----
    const sideSkaters = (grp) => grp ? [...(grp.forwards || []), ...(grp.defense || [])].map((p) => ({
      name: dflt(p.name), pos: p.position || '', num: p.sweaterNumber ?? '', g: p.goals ?? 0, a: p.assists ?? 0, p: p.points ?? 0,
      sog: p.sog ?? p.shots ?? 0, pm: p.plusMinus ?? 0, hits: p.hits ?? 0, blk: p.blockedShots ?? 0, toi: p.toi || '' })) : null;
    const toiSec = (v) => { if (!v) return 0; const p = String(v).split(':'); return p.length === 2 ? (+p[0] * 60 + (+p[1] || 0)) : 0; };
    // starter: explicit flag first, then W/L/O decision, then most shots faced / TOI
    const pickStarter = (gs) => { if (!gs || !gs.length) return null;
      return gs.find((x) => x.starter) || gs.find((x) => x.decision && /^[WLO]/i.test(String(x.decision)))
        || gs.slice().sort((x, y) => ((y.shotsAgainst || 0) - (x.shotsAgainst || 0)) || (toiSec(y.toi) - toiSec(x.toi)))[0]; };
    const sideGoalie = (grp) => { const gg = pickStarter(grp && grp.goalies); if (!gg) return null;
      const parts = gg.saveShotsAgainst ? String(gg.saveShotsAgainst).split('/') : null;
      const saves = (gg.saves != null) ? gg.saves : (parts ? (+parts[0] || 0) : Math.max(0, (gg.shotsAgainst ?? 0) - (gg.goalsAgainst ?? 0)));
      const sa = (gg.shotsAgainst != null) ? gg.shotsAgainst : (parts ? (+parts[1] || 0) : 0);
      const svRaw = gg.savePctg ?? gg.savePct ?? (sa ? saves / sa : null);
      return { name: dflt(gg.name), sa, saves, ga: gg.goalsAgainst ?? (sa - saves), svp: (svRaw != null ? (+svRaw).toFixed(3).slice(1) : '—'), toi: gg.toi || '', dec: gg.decision || '—' }; };
    const sk = bs ? { [a]: sideSkaters(bs.awayTeam), [h]: sideSkaters(bs.homeTeam) } : null;
    const gb = bs ? { [a]: sideGoalie(bs.awayTeam), [h]: sideGoalie(bs.homeTeam) } : null;

    // ---- team totals: SUM the boxscore players (robust); let landing override where it has values ----
    const tg = {}; (sm.teamGameStats || []).forEach((s) => { tg[s.category] = { a: s.awayValue, h: s.homeValue }; });
    const sumSide = (grp) => { const all = grp ? [...(grp.forwards || []), ...(grp.defense || [])] : []; const s = (k) => all.reduce((n, p) => n + (p[k] || 0), 0);
      return { hits: s('hits'), blk: s('blockedShots'), pim: s('pim'), give: s('giveaways'), take: s('takeaways'), sog: s('sog') }; };
    const aSum = sumSide(bs && bs.awayTeam), hSum = sumSide(bs && bs.homeTeam);
    const tgv = (cat, k, fb) => (tg[cat] && tg[cat][k] != null) ? tg[cat][k] : fb;
    const foA = tg.faceoffWinningPctg ? foStr(tg.faceoffWinningPctg.a) : null, foH = tg.faceoffWinningPctg ? foStr(tg.faceoffWinningPctg.h) : null;
    const ppA = tg.powerPlay ? ppStr(tg.powerPlay.a) : null, ppH = tg.powerPlay ? ppStr(tg.powerPlay.h) : null;
    const teamA = { sog: aSog || aSum.sog, fo: foA, hits: tgv('hits','a',aSum.hits), blk: tgv('blockedShots','a',aSum.blk), pim: tgv('pim','a',aSum.pim), pp: ppA };
    const teamH = { sog: hSog || hSum.sog, fo: foH, hits: tgv('hits','h',hSum.hits), blk: tgv('blockedShots','h',hSum.blk), pim: tgv('pim','h',hSum.pim), pp: ppH };
    const boxTeam = { [a]: { pp: ppA, pk: null, give: tgv('giveaways','a',aSum.give), take: tgv('takeaways','a',aSum.take), fo: foA },
                      [h]: { pp: ppH, pk: null, give: tgv('giveaways','h',hSum.give), take: tgv('takeaways','h',hSum.take), fo: foH } };

    // ---- scoring-by-period line (landing only); null when absent so the table hides instead of showing zeros ----
    const lg = (sm.linescore && sm.linescore.byPeriod) || [], sbp = sm.shotsByPeriod || [];
    const line = lg.length ? {
      periods: lg.map((p) => perLabel(p.periodDescriptor)),
      away: { goals: lg.map((p) => p.away ?? 0), shots: sbp.map((p) => p.away ?? 0), total: aScore, sog: aSog },
      home: { goals: lg.map((p) => p.home ?? 0), shots: sbp.map((p) => p.home ?? 0), total: hScore, sog: hSog },
    } : null;

    // ---- scoring plays + three stars (landing only) ----
    const goals = [];
    (sm.scoring || []).forEach((per) => (per.goals || []).forEach((go) => {
      goals.push({ team: dflt(go.teamAbbrev), scorer: dflt(go.name) || `${dflt(go.firstName)} ${dflt(go.lastName)}`.trim(),
        assists: (go.assists || []).map((x) => dflt(x.name)), str: (go.strength || 'ev').toUpperCase(),
        per: perLabel(per.periodDescriptor), time: go.timeInPeriod || '' }); }));
    const stars = (sm.threeStars || []).slice(0, 3).map((s) => ({ n: s.star, name: dflt(s.name), team: dflt(s.teamAbbrev),
      line: s.position === 'G' ? `${(s.savePctg ?? s.savePct) != null ? '.' + String(Math.round((s.savePctg ?? s.savePct) * 1000)).padStart(3, '0') : ''} SV%` : `${s.goals ?? 0}G ${s.assists ?? 0}A` }));

    const box2 = { periods: line ? line.periods : ['1st','2nd','3rd'], line, team: boxTeam, scratches: { [a]: [], [h]: [] },
      skaters: (sk && sk[a] && sk[h]) ? sk : undefined, goalies: (gb && gb[a] && gb[h]) ? gb : undefined };
    return { goals, stars, teamA, teamH, box: box2, away: a, home: h };
  }

  // ---- play-by-play -> event feed (Goal/Shot/Penalty/Hit/…) ----
  const PBP_TYPE = { 'goal': 'Goal', 'shot-on-goal': 'Shot', 'missed-shot': 'Shot', 'blocked-shot': 'Block', 'hit': 'Hit', 'penalty': 'Penalty', 'faceoff': 'Faceoff', 'giveaway': 'Giveaway', 'takeaway': 'Takeaway' };
  function pbpDesc(type, n, tm, dd) {
    switch (type) {
      case 'Goal': return `GOAL — ${n} (${tm})`;
      case 'Shot': return `${n || tm} shot on goal`;
      case 'Penalty': return `${n || tm} — ${dd.duration || 2} min${dd.descKey ? ', ' + String(dd.descKey).replace(/-/g, ' ') : ''}`;
      case 'Hit': return `${n} hit`;
      case 'Faceoff': return `Faceoff won by ${tm}`;
      case 'Giveaway': return `Giveaway by ${n || tm}`;
      case 'Takeaway': return `Takeaway by ${n || tm}`;
      default: return `Blocked shot — ${n || tm}`;
    }
  }
  function mapGamePbp(d) {
    const name = {}; (d && d.rosterSpots || []).forEach((s) => { name[s.playerId] = `${dflt(s.firstName)} ${dflt(s.lastName)}`.trim(); });
    const teamAb = {}; if (d && d.awayTeam) teamAb[d.awayTeam.id] = dflt(d.awayTeam.abbrev); if (d && d.homeTeam) teamAb[d.homeTeam.id] = dflt(d.homeTeam.abbrev);
    const out = [];
    (d && d.plays || []).forEach((p) => {
      const type = PBP_TYPE[p.typeDescKey]; if (!type) return;
      const dd = p.details || {}; const team = teamAb[dd.eventOwnerTeamId] || '';
      const per = (p.periodDescriptor && p.periodDescriptor.number > 3) ? 'OT' : ordinal((p.periodDescriptor && p.periodDescriptor.number) || 1);
      const who = name[dd.scoringPlayerId ?? dd.shootingPlayerId ?? dd.hittingPlayerId ?? dd.winningPlayerId ?? dd.committedByPlayerId ?? dd.playerId] || '';
      out.push({ per, time: p.timeInPeriod || '', team, type, desc: pbpDesc(type, who, team, dd) });
    });
    return out.length ? out : null;
  }

  // ---- league team summary -> per-team PP%/PK%/FO% (fills team stats) ----
  const ID_TEAM = Object.fromEntries(Object.entries(TEAM_ID).map(([ab, id]) => [id, ab]));
  function mapTeamSeasonStats(payload) {
    const out = {};
    (payload && payload.data || []).forEach((t) => { const ab = ID_TEAM[t.teamId]; if (!ab) return;
      out[ab] = { pp: t.powerPlayPct != null ? +(t.powerPlayPct * 100).toFixed(1) : null,
                  pk: t.penaltyKillPct != null ? +(t.penaltyKillPct * 100).toFixed(1) : null,
                  fo: t.faceoffWinPct != null ? +(t.faceoffWinPct * 100).toFixed(1) : null }; });
    return Object.keys(out).length ? out : null;
  }

  // =====================================================================
  // LIVE OVERLAYS — player EDGE tracking, playoff bracket, draft board,
  // all-time records. Each maps a real NHL payload into the exact view-model
  // window.BC produces, or returns null so the caller keeps its mock. The EDGE
  // and records endpoints are internal/undocumented (shapes vary), so those
  // mappers are deliberately defensive: they scan for recognizable fields and
  // bail to null rather than render a broken view.
  // =====================================================================

  // ---- EDGE skater/goalie detail -> player-detail "edge" overlay ----
  // Walks the payload for an object keyed like one of `nameKeys` that carries a
  // numeric value (+ optional percentile / league average). EDGE nests these
  // under category objects whose names differ by season/build, hence the scan.
  function edgeMetric(payload, nameKeys) {
    const want = nameKeys.map((s) => s.toLowerCase());
    let found = null;
    // Pull a {val,pct,avg} triple from a node OR its descendants. EDGE often nests
    // the actual number one level below the category key (e.g. skatingSpeed.maxSpeed
    // .value), so a matched category is searched in-depth, not just at its surface.
    const valueIn = (node, depth) => {
      if (!node || typeof node !== 'object' || depth > 5) return null;
      const v = num(node.value) ?? num(node.val) ?? num(node.amount) ?? num(node.result)
        ?? num(node.metric) ?? num(node.miles) ?? num(node.mph) ?? num(node.seconds) ?? num(node.percentage);
      if (v != null) {
        return { val: v, pct: num(node.percentile) ?? num(node.pct) ?? null,
          avg: num(node.leagueAverage) ?? num(node.leagueAvg) ?? num(node.average) ?? null };
      }
      for (const k of Object.keys(node)) { const r = valueIn(node[k], depth + 1); if (r) return r; }
      return null;
    };
    const visit = (o, depth) => {
      if (!o || found || typeof o !== 'object' || depth > 6) return;
      for (const k of Object.keys(o)) {
        if (want.some((w) => k.toLowerCase().includes(w))) {
          const r = valueIn(o[k], 0);
          if (r) { found = r; return; }
        }
      }
      for (const k of Object.keys(o)) visit(o[k], depth + 1);
    };
    visit(payload, 0);
    return found;
  }
  function mapEdgeSkaterGeneric(payload) {
    if (!payload) return null;
    // name-key scans broadened — EDGE category labels drift by season/build (see edgeDebug)
    const top = edgeMetric(payload, ['skatingspeed', 'topskat', 'maxskat', 'topspeed', 'maxskatingspeed', 'topskatingspeed', 'maxspeed', 'skatspeed']);
    const shot = edgeMetric(payload, ['topshotspeed', 'shotspeed', 'topshot', 'hardestshot', 'maxshotspeed', 'hardestshotspeed', 'fastestshot']);
    const avgshot = edgeMetric(payload, ['avgshotspeed', 'averageshotspeed', 'meanshotspeed', 'avgshot', 'averageshot']);
    const dist = edgeMetric(payload, ['totaldistanceskated', 'skatingdistance', 'totaldistance', 'distance', 'milesskated', 'skatdist', 'distskated']);
    const b20 = edgeMetric(payload, ['burstsover20', 'over20', 'burst', 'speedburst', 'speedbursts', 'bursts20', 'numbursts']);
    const b22 = edgeMetric(payload, ['burstsover22', 'over22', 'burst22', 'speedbursts22', 'bursts22']);
    const oz = edgeMetric(payload, ['zonetimedetails', 'offensivezone', 'ozone', 'o-zone', 'zonetimeoff', 'offzone', 'ozonetime', 'offensivezonetime']);
    if (!top && !shot && !dist && !oz) return null; // nothing recognizable → keep mock
    const speed = [];
    const row = (l, m, fmt) => { if (m) speed.push([l, fmt(m.val), m.pct != null ? Math.round(m.pct) : '—', m.avg != null ? fmt(m.avg) : '—']); };
    row('Top shot speed', shot, (v) => `${(+v).toFixed(1)} mph`);
    row('Avg shot speed', avgshot, (v) => `${(+v).toFixed(1)} mph`);
    row('Max skating speed', top, (v) => `${(+v).toFixed(1)} mph`);
    row('Total distance', dist, (v) => `${(+v).toFixed(1)} mi`);
    row('Speed bursts 20+', b20, (v) => `${Math.round(v)}`);
    row('Speed bursts 22+', b22, (v) => `${Math.round(v)}`);
    if (oz) speed.push(['O-zone time', `${(+oz.val).toFixed(0)}%`, oz.pct != null ? Math.round(oz.pct) : '—', oz.avg != null ? `${(+oz.avg).toFixed(0)}%` : '—']);
    const out = {};
    if (speed.length) out.speed = speed;
    if (oz) { const o = +(+oz.val).toFixed(1); const d = +((100 - o) * 0.46).toFixed(1); out.zones = [['Offensive', o], ['Neutral', +(100 - o - d).toFixed(1)], ['Defensive', d]]; }
    return Object.keys(out).length ? out : null; // partial overlay; caller merges over mock
  }
  function mapEdgeGoalieGeneric(payload) {
    if (!payload) return null;
    // Real goalie EDGE nests save quality inside `stats` / `shotLocationSummary` /
    // `shotLocationDetails`, so these scans dig into those category nodes.
    const hd = edgeMetric(payload, ['highdanger', 'high-danger', 'hidanger', 'hdsavepct', 'highdangersave']);
    const md = edgeMetric(payload, ['middanger', 'mid-danger', 'mediumdanger', 'mdsavepct', 'middangersave', 'mediumdangersave']);
    const ld = edgeMetric(payload, ['lowdanger', 'low-danger', 'ldsavepct', 'lowdangersave']);
    // richer goalie EDGE — goals saved above expected, rebound control, HD shots faced
    const gsax = edgeMetric(payload, ['goalssavedabove', 'gsax', 'gsaa', 'savedaboveexpected', 'goalssavedaboveexpected']);
    const reb = edgeMetric(payload, ['reboundcontrol', 'reboundrate', 'rebound', 'freeze', 'freezerate']);
    const hf = edgeMetric(payload, ['highdangershotsfaced', 'hdshotsfaced', 'hdshotsagainst', 'highdangeragainst']);
    if (!hd && !md && !ld && !gsax && !reb && !hf) return null;
    const pctStr = (v) => (v <= 1 ? v.toFixed(3).slice(1) : (v / 100).toFixed(3).slice(1));
    const saveQ = [];
    const row = (l, m, avg) => { if (m) saveQ.push([l, pctStr(m.val), m.pct != null ? Math.round(m.pct) : '—', avg, m.avg != null ? Math.round(m.avg) : '—']); };
    row('High-danger SV%', hd, '.812'); row('Mid-danger SV%', md, '.910'); row('Low-danger SV%', ld, '.975');
    if (gsax) saveQ.push(['Goals saved a.e.', ((+gsax.val) >= 0 ? '+' : '') + (+gsax.val).toFixed(1), gsax.pct != null ? Math.round(gsax.pct) : '—', '+2.4', '—']);
    if (reb) saveQ.push(['Rebound control', `${(+reb.val).toFixed(0)}%`, reb.pct != null ? Math.round(reb.pct) : '—', '78%', '—']);
    if (hf) saveQ.push(['HD shots faced/60', `${(+hf.val).toFixed(1)}`, hf.pct != null ? Math.round(hf.pct) : '—', '11.2', '—']);
    return saveQ.length ? { saveQ } : null;
  }
  // Precise mapper for the REAL edge/skater-detail shape (confirmed via edgeDebug):
  // numbers live under .imperial/.metric, percentiles are 0..1 fractions, leagueAvg is
  // an {imperial,metric} object, and zoneTimeDetails uses flat *ZonePctg keys.
  function mapEdgeSkaterReal(p) {
    if (!p || typeof p !== 'object') return null;
    const imp = (n) => (n ? (num(n.imperial) ?? num(n.value) ?? num(n.metric)) : null);
    const pc = (n) => { const v = n ? num(n.percentile) : null; return v == null ? '\u2014' : (v <= 1 ? Math.round(v * 100) : Math.round(v)); };
    const avg = (n) => { if (!n) return null; const la = n.leagueAvg ?? n.leagueAverage; return la == null ? null : (num(la.imperial) ?? num(la)); };
    const speed = [];
    const add = (label, node, unit, dp) => { if (!node) return; const v = imp(node); if (v == null) return; const a = avg(node); speed.push([label, v.toFixed(dp) + unit, pc(node), a != null ? a.toFixed(dp) + unit : '\u2014']); };
    add('Top shot speed', p.topShotSpeed, ' mph', 1);
    add('Max skating speed', p.skatingSpeed && p.skatingSpeed.speedMax, ' mph', 1);
    const b = p.skatingSpeed && p.skatingSpeed.burstsOver20;
    if (b && num(b.value) != null) speed.push(['Speed bursts 20+', String(Math.round(num(b.value))), pc(b), num(b.leagueAvg) != null ? String(Math.round(num(b.leagueAvg))) : '\u2014']);
    add('Total distance', p.totalDistanceSkated, ' mi', 1);
    add('Max game distance', p.distanceMaxGame, ' mi', 2);
    const out = {};
    if (speed.length) out.speed = speed;
    const z = p.zoneTimeDetails;
    if (z && num(z.offensiveZonePctg) != null) {
      const o = +(num(z.offensiveZonePctg) * 100).toFixed(1);
      let n = num(z.neutralZonePctg), d = num(z.defensiveZonePctg);
      n = n != null ? +(n * 100).toFixed(1) : null;
      d = d != null ? +(d * 100).toFixed(1) : null;
      if (n == null && d != null) n = +(100 - o - d).toFixed(1);
      if (d == null && n != null) d = +(100 - o - n).toFixed(1);
      if (n == null && d == null) { n = +((100 - o) * 0.37).toFixed(1); d = +(100 - o - n).toFixed(1); }
      out.zones = [['Offensive', o], ['Neutral', n], ['Defensive', d]];
    }
    return Object.keys(out).length ? out : null;
  }
  function mapEdgeSkater(payload) {
    if (!payload) return null;
    return mapEdgeSkaterReal(payload) || mapEdgeSkaterGeneric(payload);
  }
  // Precise mapper for the REAL edge/goalie-detail shape: stats.* carry {value,
  // percentile,leagueAvg}; shotLocationSummary[] carries save% by danger zone.
  function mapEdgeGoalieReal(p) {
    if (!p || typeof p !== 'object') return null;
    const pc = (v) => (v == null ? '\u2014' : (v <= 1 ? Math.round(v * 100) : Math.round(v)));
    const sv = (v) => (v == null ? null : (v <= 1 ? v.toFixed(3).slice(1) : (v / 100).toFixed(3).slice(1)));
    const saveQ = [];
    const LBL = { highDanger: 'High-danger', mediumDanger: 'Mid-danger', mediumHighDanger: 'Mid-high danger', mediumLowDanger: 'Mid-low danger', lowDanger: 'Low-danger', eliteDanger: 'Elite-danger', high: 'High-danger', medium: 'Mid-danger', low: 'Low-danger' };
    (Array.isArray(p.shotLocationSummary) ? p.shotLocationSummary : []).forEach((r) => {
      const spct = num(r.savePctg); if (spct == null) return;
      const code = String(r.locationCode || '').trim();
      const label = (LBL[code] || (code ? code.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim() : 'Zone')) + ' SV%';
      saveQ.push([label, sv(spct), pc(num(r.savePctgPercentile)), num(r.savePctgLeagueAvg) != null ? sv(num(r.savePctgLeagueAvg)) : '\u2014', '\u2014']);
    });
    const st = p.stats || {};
    const statRow = (key, label, fmt) => { const n = st[key]; const v = n ? num(n.value) : null; if (v == null) return; saveQ.push([label, fmt(v), pc(num(n.percentile)), num(n.leagueAvg) != null ? fmt(num(n.leagueAvg)) : '\u2014', '\u2014']); };
    statRow('goalsAgainstAvg', 'GAA', (v) => v.toFixed(2));
    statRow('gamesAbove900', 'Games .900+ SV%', (v) => String(Math.round(v)));
    statRow('goalDifferentialPer60', 'Goal diff/60', (v) => (v >= 0 ? '+' : '') + v.toFixed(2));
    statRow('goalSupportAvg', 'Goal support/gm', (v) => v.toFixed(2));
    return saveQ.length ? { saveQ } : null;
  }
  function mapEdgeGoalie(payload) {
    if (!payload) return null;
    return mapEdgeGoalieReal(payload) || mapEdgeGoalieGeneric(payload);
  }

  // ---- playoff series carousel -> full bracket {east,west,final,cup} ----
  // The page assumes a COMPLETE bracket (champ/cup always present). For rounds
  // not yet played we synthesize matchups from the leaders of the prior round and
  // project the advancing team as the current series leader, so nothing is null.
  function mapPlayoffBracket(carousel, standings) {
    if (!carousel) return null;
    const rounds = carousel.rounds || (carousel.series ? [{ round: 1, series: carousel.series }] : []);
    if (!rounds.length) return null;
    const byAb = {}; (standings || []).forEach((t) => { byAb[t.ab] = t; });
    const teamOf = (seed) => {
      const ab = dflt(seed && (seed.abbrev || seed.teamAbbrev || seed.teamAbbrevDefault)) || (seed && dflt(seed.commonName)) || '';
      return byAb[ab] || { ab, pts: 0, conf: '', div: '' };
    };
    const mkSeries = (s) => {
      const top = s.topSeed || s.topSeedTeam || s.team1 || {}, bot = s.bottomSeed || s.bottomSeedTeam || s.team2 || {};
      const hi = teamOf(top), lo = teamOf(bot);
      const hiW = num(top.wins) ?? num(s.topSeedWins) ?? 0, loW = num(bot.wins) ?? num(s.bottomSeedWins) ?? 0;
      return { hi, lo, hiW, loW, done: Math.max(hiW, loW) >= 4, label: dflt(s.seriesLetter) || '' };
    };
    const all = [];
    rounds.forEach((rd) => (rd.series || []).forEach((s) => {
      const ms = mkSeries(s);
      if (ms.hi.ab && ms.lo.ab) all.push({ round: num(rd.roundNumber) ?? num(rd.round) ?? 1, ...ms });
    }));
    if (all.length < 4) return null; // not enough of a bracket to trust → keep mock
    const byRound = {}; all.forEach((s) => { (byRound[s.round] = byRound[s.round] || []).push(s); });
    const confOf = (s) => s.hi.conf || s.lo.conf || '';
    const adv = (s) => (s.loW > s.hiW ? s.lo : s.hi); // current leader; tie favors higher seed
    const next = (prev) => { const out = []; for (let i = 0; i < prev.length; i += 2) { const a = prev[i], b = prev[i + 1]; if (!a || !b) break; out.push({ hi: adv(a), lo: adv(b), hiW: 0, loW: 0, done: false, label: '' }); } return out; };
    const roundFor = (n, prev) => { const live = (byRound[n] || []); return live.length ? live : next(prev); };
    const buildConf = (conf) => {
      const r1 = (byRound[1] || []).filter((s) => confOf(s) === conf);
      if (r1.length < 2) return null;
      const r2live = (byRound[2] || []).filter((s) => confOf(s) === conf);
      const r2 = r2live.length ? r2live : next(r1);
      const cfLive = (byRound[3] || []).filter((s) => confOf(s) === conf);
      const cf = cfLive.length ? cfLive : next(r2);
      const champ = cf[0] ? adv(cf[0]) : (r2[0] ? adv(r2[0]) : adv(r1[0]));
      return { r1, r2, cf, champ };
    };
    const east = buildConf('East'), west = buildConf('West');
    if (!east || !west) return null;
    const finalLive = (byRound[4] || [])[0];
    const final = finalLive || { hi: east.champ, lo: west.champ, hiW: 0, loW: 0, done: false, label: '' };
    const cup = final.done ? adv(final) : adv(final); // leader of the final (projected if not done)
    return { east, west, final, cup, source: 'live' };
  }

  // ---- draft rankings -> prospect board [{rank,name,pos,league,...}] ----
  function mapDraftRankings(payload) {
    const arr = payload?.rankings || payload?.players || [];
    if (!arr.length) return null;
    const out = arr.map((p, i) => {
      const mid = num(p.midtermRank), fin = num(p.finalRank);
      const rank = fin ?? mid ?? (i + 1);
      const hin = num(p.heightInInches);
      return {
        rank,
        name: `${dflt(p.firstName)} ${dflt(p.lastName)}`.trim() || dflt(p.playerName) || '',
        pos: p.positionCode || dflt(p.position) || '',
        league: dflt(p.lastAmateurLeague) || dflt(p.leagueAbbrev) || dflt(p.lastAmateurClubName) || '',
        gp: num(p.gamesPlayed) ?? 0, pts: num(p.points) ?? 0,
        ht: hin != null ? `${Math.floor(hin / 12)}'${hin % 12}"` : (dflt(p.height) || ''),
        wt: num(p.weightInPounds) ?? num(p.weight) ?? 0,
        trend: (mid != null && fin != null) ? (fin < mid ? '\u25B2' : fin > mid ? '\u25BC' : '\u25AC') : '\u25AC',
      };
    }).filter((p) => p.name).sort((a, b) => a.rank - b.rank).slice(0, 32);
    return out.length ? out : null;
  }

  // ---- all-time records (records.nhl.com) -> {skaters,goalies,season,trophies} ----
  // records.nhl.com is loosely documented; this recognizes player+value arrays and
  // bails to null (→ editorial projection) if it can't build the categorized shape.
  function recArr(payload) { return payload && (payload.data || payload.records || (Array.isArray(payload) ? payload : null)); }
  function recName(r) { return dflt(r.player) || dflt(r.playerName) || `${dflt(r.firstName) || ''} ${dflt(r.lastName) || ''}`.trim() || dflt(r.fullName) || ''; }
  function mapRecordLeaders(payload, cats) {
    const rows = recArr(payload); if (!rows || !rows.length) return null;
    const out = [];
    cats.forEach(([cat, field]) => {
      const ranked = rows.filter((r) => num(r[field]) != null).sort((a, b) => num(b[field]) - num(a[field])).slice(0, 5)
        .map((r) => ({ name: recName(r), v: num(r[field]) })).filter((x) => x.name);
      if (ranked.length) out.push({ cat, rows: ranked });
    });
    return out.length ? out : null;
  }

  // ---- club prospects -> team Prospects tab {forwards,defensemen,goalies} ----
  function mapProspects(payload) {
    if (!payload) return null;
    const yr = new Date().getFullYear();
    const age = (bd) => { if (!bd) return '—'; const d = new Date(bd); if (isNaN(d)) return '—'; let a = yr - d.getFullYear(); return a > 10 && a < 40 ? a : '—'; };
    const one = (p) => ({
      name: `${dflt(p.firstName)} ${dflt(p.lastName)}`.trim(),
      pos: p.positionCode || dflt(p.position) || '',
      league: dflt(p.lastAmateurLeague) || dflt(p.leagueAbbrev) || dflt(p.lastAmateurClubName) || dflt(p.teamName) || '—',
      age: age(p.birthDate),
      draftYr: num(p.draftYear) ?? '—', round: num(p.draftRound) ?? '—',
      gp: num(p.gamesPlayed) ?? 0, pts: num(p.points) ?? 0,
    });
    const grp = (arr) => (arr || []).map(one).filter((p) => p.name);
    const f = grp(payload.forwards), d = grp(payload.defensemen), g = grp(payload.goalies);
    if (!f.length && !d.length && !g.length) return null;
    return { forwards: f, defensemen: d, goalies: g };
  }

  // ---- club schedule -> per-team game list (slate shape + _date) ----
  function mapClubSchedule(payload) {
    const games = (payload && (payload.games || (payload.gameWeek || []).flatMap((d) => d.games))) || [];
    if (!games.length) return null;
    const out = games.map((g) => { const m = mapGame(g); m._date = String(g.gameDate || g.startTimeUTC || '').slice(0, 10); return m; }).filter((m) => m._date);
    return out.length ? out : null;
  }

  // Current NHL season id. Prefer the season the API itself reports as current
  // (captured from the standings payload on hydrate); fall back to a date calc
  // (season starts in October; Sept+ = new season).
  function curSeason(){ if(window.NHL&&window.NHL._season) return String(window.NHL._season); var d=new Date(); var y=d.getFullYear(); return d.getMonth()>=8 ? String(y)+String(y+1) : String(y-1)+String(y); }
  // ---- draft picks for a given year (real results) -> board by round ----
  // draft/picks/{year}/all returns every pick; for completed drafts each pick
  // carries the actual player selected. Shapes vary (picks[] or rounds[].picks[]).
  function mapDraftYear(payload, year) {
    let arr = payload && (payload.picks || (payload.rounds ? payload.rounds.flatMap((r) => r.picks || []) : null));
    if (!arr || !arr.length) return null;
    const hin = (v, p) => { const n = num(v) ?? (p && num(p.heightInInches)); return n != null ? `${Math.floor(n / 12)}'${n % 12}"` : (dflt(v) || ''); };
    const picks = arr.map((p) => {
      const round = num(p.round) ?? num(p.roundNumber) ?? 1;
      const pir = num(p.pickInRound) ?? num(p.pickInRoundNumber);
      // overall pick number; for an UNDRAFTED upcoming draft the API may omit it,
      // so derive it from round + pick-in-round so the ORDER is still stable+correct.
      const overall = num(p.overallPick) ?? num(p.pickOverall) ?? num(p.pickNumber)
        ?? (pir != null ? (round - 1) * 32 + pir : undefined);
      const first = dflt(p.firstName), last = dflt(p.lastName);
      const name = `${first || ''} ${last || ''}`.trim() || dflt(p.playerName) || dflt(p.name) || '';
      // team that HOLDS the pick (reflects the lottery + any trades). Shapes vary:
      // string, {default}, or a nested team object — cover them all.
      const team = dflt(p.teamAbbrev) || dflt(p.triCode) || (p.teamAbbrevs && dflt(p.teamAbbrevs))
        || (p.team && (dflt(p.team.abbrev) || dflt(p.team.triCode) || dflt(p.team.teamAbbrev))) || '';
      return {
        pick: overall ?? 0, round, pir: pir ?? null,
        team,
        name, pos: p.positionCode || dflt(p.position) || '',
        league: dflt(p.amateurLeague) || dflt(p.lastAmateurLeague) || dflt(p.leagueAbbrev) || '',
        club: dflt(p.amateurClubName) || dflt(p.lastAmateurClubName) || '',
        ht: hin(p.height, p), wt: num(p.weightInPounds) ?? num(p.weight) ?? 0,
        country: dflt(p.countryCode) || dflt(p.birthCountry) || '',
      };
    }).filter((p) => p.team).sort((a, b) => a.pick - b.pick);
    if (!picks.length) return null;
    const rounds = [...new Set(picks.map((p) => p.round))].sort((a, b) => a - b);
    return { year, picks, rounds };
  }

  // ---- live draft tracker (during the draft) -> actual picks made so far ----
  function mapDraftTracker(payload) {
    const arr = payload && (payload.picks || payload.draftTracker || (Array.isArray(payload) ? payload : null));
    if (!arr || !arr.length) return null;
    const made = arr.map((p) => {
      const first = dflt(p.firstName), last = dflt(p.lastName);
      const name = `${first || ''} ${last || ''}`.trim() || dflt(p.playerName) || '';
      return {
        pick: num(p.overallPick) ?? num(p.pickOverall) ?? num(p.pickNumber) ?? 0,
        team: dflt(p.teamAbbrev) || dflt(p.triCode) || '',
        name, pos: p.positionCode || dflt(p.position) || '',
        league: dflt(p.amateurLeague) || dflt(p.lastAmateurLeague) || '',
        onClock: !!(p.onClock || p.isOnClock), made: !!name,
      };
    }).filter((p) => p.team);
    return made.length ? made : null;
  }

  // ---- REAL post-lottery draft ORDER -> the lottery-result picks the UI shows ----
  // `draft/picks/now` (and a year's /all) return the actual first-round ORDER once
  // the lottery has been held — real teams, players null until draft night. We
  // decorate each pick with its pre-lottery slot (reverse standings) so the
  // projected/landed/▲▼ view reflects the REAL lottery, not a simulated one.
  function buildLotteryPicks(payload, standings, rankings) {
    const mapped = mapDraftYear(payload, null);
    const all = mapped && mapped.picks ? mapped.picks : [];
    const r1 = all.filter((p) => (p.round || 1) === 1).sort((a, b) => a.pick - b.pick);
    if (r1.length < 8 || !standings || !standings.length) return null; // not enough real order yet
    // pre-lottery projection: worst record picks 1st. standings is best-first, so
    // reverse = worst-first; a team's index there is its pre-lottery slot.
    const reverse = [...standings].slice().reverse();
    const slotOf = {}; reverse.forEach((t, i) => { slotOf[t.ab] = i + 1; });
    return r1.map((p, i) => {
      const pick = p.pick || (i + 1);
      const proj = slotOf[p.team];
      // Only treat it as lottery movement for a genuine lottery participant (a
      // non-playoff team, slot ≤ 16, capped at the NHL's 10-spot climb). Traded
      // picks held by playoff teams otherwise look like impossible 20-spot jumps.
      const eligible = proj != null && proj <= 16 && Math.abs(proj - pick) <= 11;
      const slot = eligible ? proj : pick;
      const moved = eligible ? slot - pick : 0;
      const rk = rankings && rankings[i];
      return {
        pick, team: p.team, slot, moved, lotteryWin: moved > 0,
        name: p.name || (rk && rk.name) || 'TBD',
        pos: p.pos || (rk && rk.pos) || '',
        league: p.league || (rk && rk.league) || '',
      };
    });
  }

  // The season the UI is currently VIEWING (set by the season switcher via
  // BC._seasonId); defaults to the league's current season.
  function activeSeason(){ return (window.BC && window.BC._seasonId) ? String(window.BC._seasonId) : curSeason(); }
  // EDGE puck/player tracking is only fetchable for the current season (and only
  // exists league-wide from 2021-22), so live EDGE overlays gate on this.
  function liveEdgeOK(){ return activeSeason() === curSeason(); }

  window.NHL = {
    BASE, get,
    ymd, ordinal,
    activeSeason, liveEdgeOK,
    standings: async () => { const d = await get('standings'); if (d && d.currentSeason) window.NHL._season = String(d.currentSeason); return mapStandings(d); },
    // Standings for a SPECIFIC season WITHOUT mutating any global state — lets the
    // Standings page switch years on its own without changing data for the rest of the app.
    standingsForSeason: async (s) => {
      const cur = (window.NHL && window.NHL._season) ? String(window.NHL._season) : null;
      if (!s || String(s) === cur) return mapStandings(await get('standings/now'));
      // Past season: standings/{date} is EMPTY for off-season dates, so we ask as of a
      // late-but-in-season date, then fall back earlier if the season ended sooner.
      const endYr = String(s).slice(4, 8);
      for (const md of ['-04-10', '-03-25', '-03-01', '-02-01']) {
        try {
          const rows = mapStandings(await get(`standings/${endYr}${md}`));
          if (rows && rows.length) return rows;
        } catch (_) { /* try the next date */ }
      }
      return [];
    },
    scores: scoreSlate,
    schedule: async (offset) => (await get(`schedule?date=${ymd(offset)}`)),
    boxscore: (id) => get(`gamecenter/${id}/boxscore`),
    playByPlay: (id) => get(`gamecenter/${id}/play-by-play`),
    // UI-shaped live overlays (mock-fallback handled by the caller):
    playerCard: async (id) => mapPlayerCard(await get(`player/${id}/landing`)),
    gameLive: async (id) => {
      const [l, b] = await Promise.all([
        get(`gamecenter-landing/${id}`),
        get(`gamecenter/${id}/boxscore`).catch(() => null),
      ]);
      return mapGameLive(l, b);
    },
    gamePbp: async (id) => mapGamePbp(await get(`gamecenter/${id}/play-by-play`)),
    teamSeasonStats: async (season) => mapTeamSeasonStats(await window.NHL.statsTeam('summary', ('seasonId='+(season||activeSeason())+' and gameTypeId=2'))),
    shotMap: async (id) => mapShots(await get(`gamecenter/${id}/play-by-play`)),
    shotZones: (scope, id) => liveEdgeOK() ? fetchZones(scope, id) : Promise.resolve(null),
    rightRail: (id) => get(`gamecenter/${id}/right-rail`),
    roster: async (team, season) => mapRoster(await get('roster/' + team + (season ? '/' + season : ''))),
    rosterRaw: (team) => get(`roster/${team}`),
    clubStats: (team) => get(`club-stats/${team}`),
    clubSchedule: (team) => get(`club-schedule-view/${team}?view=month`),
    teamStats: (team) => get(`team-stats/${team}`),
    prospects: (team) => get(`prospects/${team}`),
    playerLanding: (id) => get(`player/${id}/landing`),
    playerGameLog: (id) => get(`player/${id}/game-log`),
    // per-game EDGE: real game identity (date/opponent) from the game-log + any live
    // per-game tracking it exposes; the player page overlays this on the projection.
    edgeGameLog: async (id) => { if (!liveEdgeOK()) return null; try {
      const d = await get(`player/${id}/game-log`);
      const games = (d && (d.gameLog || d.games)) || [];
      if (!games.length) return null;
      const numF = (g, keys) => { for (const k of Object.keys(g)) { if (keys.some((w) => k.toLowerCase().includes(w))) { const v = num(g[k]); if (v != null) return v; } } return null; };
      return games.slice(0, 6).map((g) => ({
        date: fmtDate(g.gameDate), opp: dflt(g.opponentAbbrev) || dflt(g.opponentCommonName) || '', home: (g.homeRoadFlag || g.homeRoad) === 'H',
        topSpd: numF(g, ['topskat', 'maxspeed', 'topspeed', 'maxskatingspeed', 'skatingspeed']), topShot: numF(g, ['shotspeed', 'topshot', 'maxshotspeed', 'hardestshot']),
        dist: numF(g, ['distance', 'skatingdistance', 'milesskated']), b20: numF(g, ['burst', 'over20', 'speedburst', 'bursts20']),
      }));
    } catch (_) { return null; } },
    skaterLeaders: async (season) => mapSkaterLeaders(await get('skater-leaders?season=' + (season || activeSeason()))),
    goalieLeaders: async (season) => mapGoalieLeaders(await get('goalie-leaders?season=' + (season || activeSeason()))),
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
    // DIAGNOSTIC — dump recognized vs raw EDGE keys for one player so the scans above
    // can be tuned against real payloads on deploy: await NHL.edgeDebug(id,'skater'|'goalie')
    edgeDebug: async (id, type) => { try {
      const isG = type === 'goalie';
      const p = await get(`edge/${isG ? 'goalie' : 'skater'}-detail/${id}`);
      const mapped = isG ? mapEdgeGoalie(p) : mapEdgeSkater(p);
      const topLevelKeys = p && typeof p === 'object' ? Object.keys(p) : [];
      // Nested shape (2 levels deep, sample scalars) — paste this to tune the key
      // scans precisely against the real payload. Arrays summarized by length+keys.
      const shapeOf = (o, depth) => {
        if (o == null || typeof o !== 'object') return o;
        if (Array.isArray(o)) return o.length ? `[${o.length}] ` + (typeof o[0] === 'object' && o[0] ? `{${Object.keys(o[0]).slice(0, 10).join(',')}}` : typeof o[0]) : '[]';
        if (depth >= 2) return `{${Object.keys(o).slice(0, 14).join(',')}}`;
        const out = {}; for (const k of Object.keys(o)) out[k] = shapeOf(o[k], depth + 1); return out;
      };
      return { ok: !!p, recognized: mapped ? Object.keys(mapped) : [], rows: mapped, topLevelKeys, shape: shapeOf(p, 0), sample: p };
    } catch (e) { return { ok: false, error: String(e) }; } },
    // LIVE league EDGE leaderboard from the real top-10 endpoints (defensive scan → null keeps mock):
    // LIVE league EDGE boards — ONE pass over the top scorers' per-player tracking
    // (the only EDGE feed that resolves), building every metric board at once and
    // memoizing per season (10 min). edgeBoardLive() reads a single metric from it;
    // editorial-live overlays the whole thing onto D.edgeLeaders/D.edgeBoard.
    edgeBoardAll: (() => {
      let cache = null;
      const EX = {
        top:  (p) => (p && p.skatingSpeed && p.skatingSpeed.speedMax) ? num(p.skatingSpeed.speedMax.imperial) : null,
        shot: (p) => (p && p.topShotSpeed) ? num(p.topShotSpeed.imperial) : null,
        dist: (p) => (p && p.totalDistanceSkated) ? num(p.totalDistanceSkated.imperial) : null,
        b20:  (p) => (p && p.skatingSpeed && p.skatingSpeed.burstsOver20) ? num(p.skatingSpeed.burstsOver20.value) : null,
        oz:   (p) => (p && p.zoneTimeDetails && num(p.zoneTimeDetails.offensiveZonePctg) != null) ? num(p.zoneTimeDetails.offensiveZonePctg) * 100 : null,
      };
      const DP = { top: 1, shot: 1, dist: 1, b20: 0, oz: 1 };
      const mapLimit = async (items, limit, fn) => {
        const out = new Array(items.length); let i = 0;
        const worker = async () => { while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]); } };
        await Promise.all(Array.from({ length: Math.min(limit, items.length || 1) }, worker));
        return out;
      };
      return async () => {
        if (!liveEdgeOK()) return null;
        const ssn = activeSeason();
        if (cache && cache.ssn === ssn && Date.now() - cache.t < 600000) return cache.boards;
        const pool = ((window.BC && window.BC.allPlayers) || []).filter((p) => p && p.id && p.pos !== 'G').slice(0, 50);
        if (pool.length < 8) return null;
        const got = await mapLimit(pool, 6, async (pl) => {
          try { const d = await get(`edge/skater-detail/${pl.id}`); return d ? { pl, d } : null; } catch (_) { return null; }
        });
        const valid = got.filter(Boolean);
        if (valid.length < 5) return null;
        const boards = {};
        Object.keys(EX).forEach((m) => {
          const rows = valid.map((x) => { const v = EX[m](x.d); return v != null ? { pl: x.pl, v } : null; })
            .filter(Boolean).sort((a, b) => b.v - a.v).slice(0, 20)
            .map((x) => ({ ...x.pl, _v: +(+x.v).toFixed(DP[m]) }));
          if (rows.length >= 5) boards[m] = rows;
        });
        if (!Object.keys(boards).length) return null;
        cache = { ssn, t: Date.now(), boards };
        return boards;
      };
    })(),
    edgeBoardLive: async (metric) => {
      try { const all = await window.NHL.edgeBoardAll(); return (all && all[metric]) || null; } catch (_) { return null; }
    },

    // ---- LIVE OVERLAYS (mock-fallback handled by each caller) ----
    // Player-detail EDGE tracking (partial overlay; page merges over mock):
    edgeSkaterMapped: async (id) => { if (!liveEdgeOK()) return null; try { return mapEdgeSkater(await get(`edge/skater-detail/${id}`)); } catch (_) { return null; } },
    edgeGoalieMapped: async (id) => { if (!liveEdgeOK()) return null; try { return mapEdgeGoalie(await get(`edge/goalie-detail/${id}`)); } catch (_) { return null; } },
    // Full playoff bracket from the series carousel, seeded against live standings:
    playoffFull: async () => {
      const season = (window.BC && window.BC._seasonId) || curSeason();
      const standings = (window.BC && window.BC.STANDINGS) || [];
      try {
        const car = await get(`playoff-series-carousel/${season}`);
        return mapPlayoffBracket(car, standings);
      } catch (_) {
        try { return mapPlayoffBracket(await get('playoff-bracket'), standings); } catch (__) { return null; }
      }
    },
    // Draft board: live prospect rankings + the REAL post-lottery first-round order
    // (correct teams + lottery winners). Falls back to the editorial projection only
    // when the real order isn't published yet.
    draftFull: async (year) => {
      try {
        const live = mapDraftRankings(await get('draft/rankings'));
        const standings = (window.BC && window.BC.STANDINGS) || [];
        let picks = null;
        // Pull the REAL order for THIS draft year explicitly. `now` can still point at
        // the last COMPLETED draft until this year's draft day, which showed the wrong
        // teams on the upcoming-draft page. An explicit year always gets this year's
        // post-lottery + traded order.
        const orderPath = year ? `draft/picks/${year}/all` : 'draft/picks/now';
        try { picks = buildLotteryPicks(await get(orderPath), standings, live); } catch (_) { picks = null; }
        if (!picks) {
          // real order not available yet → editorial projection, prospect names overlaid
          const mockPicks = (window.BC && typeof window.BC.draftPicks === 'function') ? window.BC.draftPicks() : [];
          picks = mockPicks.map((pk, i) => (live && live[i] ? { ...pk, name: live[i].name, pos: live[i].pos, league: live[i].league } : pk));
        }
        if (!live && !picks.length) return null;
        const rankings = live || ((window.BC && window.BC.draftRankings) ? window.BC.draftRankings() : []);
        return { rankings, picks };
      } catch (_) { return null; }
    },
    // Draft board for any year (real results for completed drafts):
    draftYear: async (year) => { try { return mapDraftYear(await get(`draft/picks/${year}/all`), year); } catch (_) { return null; } },
    // Live draft tracker (actual picks as they're made during the draft):
    draftLiveTracker: async () => { try { return mapDraftTracker(await get('draft/tracker')); } catch (_) { return null; } },
    // Club prospects (team Prospects tab):
    prospectsMapped: async (team) => { try { return mapProspects(await get(`prospects/${team}`)); } catch (_) { return null; } },
    // Game officials (refs + linesmen) from the game landing summary:
    gameOfficials: async (id) => {
      try {
        const l = await get(`gamecenter-landing/${id}`);
        const gi = l && l.summary && l.summary.gameInfo; if (!gi) return null;
        const nm = (r) => (typeof r === 'string' ? r : dflt(r));
        const refs = (gi.referees || []).map(nm).filter(Boolean);
        const linesmen = (gi.linesmen || []).map(nm).filter(Boolean);
        return (refs.length || linesmen.length) ? { refs, linesmen } : null;
      } catch (_) { return null; }
    },
    // Game broadcasts — real TV networks from the landing (enriches the scoreboard list):
    gameBroadcasts: async (id) => {
      try {
        const l = await get(`gamecenter-landing/${id}`);
        const tv = (l.tvBroadcasts || []).map((b) => dflt(b.network)).filter(Boolean);
        return tv.length ? { tv } : null;
      } catch (_) { return null; }
    },
    // Full-season team schedule -> live calendar + Last/Next game:
    clubScheduleMapped: async (ab) => { try { const s = activeSeason(); const qy = (s && s !== curSeason()) ? `?season=${s}` : ''; return mapClubSchedule(await get(`club-schedule/${ab}${qy}`)); } catch (_) { return null; } },
    teamRecUp: async (ab) => {
      try {
        const all = await window.NHL.clubScheduleMapped(ab); if (!all) return null;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const withOff = all.map((g) => ({ g, off: Math.round((new Date(g._date) - today) / 86400000) }));
        const rec = withOff.filter((x) => x.g.st.startsWith('final')).sort((a, b) => b.off - a.off).map((x) => x.g);
        const up = withOff.filter((x) => !x.g.st.startsWith('final') && x.off >= 0).sort((a, b) => a.off - b.off).map((x) => x.g);
        return { rec, up };
      } catch (_) { return null; }
    },
    // All-time records (best-effort; keeps editorial projection if unrecognized):
    recordsAllTime: async () => {      try {
        const [sk, go] = await Promise.all([
          get('records/skater-records?cayenneExp=1=1').catch(() => null),
          get('records/goalie-records?cayenneExp=1=1').catch(() => null),
        ]);
        const skaters = mapRecordLeaders(sk, [['Goals', 'goals'], ['Assists', 'assists'], ['Points', 'points'], ['Games', 'gamesPlayed'], ['Power-play goals', 'powerPlayGoals'], ['Game-winning goals', 'gameWinningGoals']]);
        const goalies = mapRecordLeaders(go, [['Wins', 'wins'], ['Shutouts', 'shutouts'], ['Saves', 'saves'], ['Games', 'gamesPlayed']]);
        if (!skaters && !goalies) return null;
        const out = {};
        if (skaters) out.skaters = skaters;
        if (goalies) out.goalies = goalies;
        return Object.keys(out).length ? out : null; // page merges over mock (season/trophies stay projected)
      } catch (_) { return null; }
    },
    // cat/edge variants (different prefix): use generic stats-free passthrough
    catEdgeSkater: (id) => get(`edge/cat/skater-detail/${id}`),
    catEdgeGoalie: (id) => get(`edge/cat/goalie-detail/${id}`),

    // ---- league schedule extras ----
    scheduleCalendar: (date) => get(date ? `schedule-calendar/${date}` : 'schedule-calendar'),

    // ---- game extras ----
    gameLanding: (id) => get(`gamecenter-landing/${id}`),
    gameStory: (id) => get(`game-story/${id}`),
    whereToWatch: () => get('where-to-watch'),
    // Team "Buzz" social feed (free server-side sources via /api/social/*; null → mock).
    teamSocial: async (ab) => { try {
      const r = await fetch('/api/social/team/' + ab, { headers: { accept: 'application/json' } });
      if (!r.ok) return null;
      const d = await r.json();
      const posts = (d && d.posts) || [];
      return posts.length ? posts : null;
    } catch (_) { return null; } },
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
    // ---- #1 milestone watch (stats API milestones → progress rows) ----
    milestonesMapped: async () => { try {
      const [sk, go] = await Promise.all([window.NHL.statsMilestonesSkater().catch(() => null), window.NHL.statsMilestonesGoalie().catch(() => null)]);
      const rows = [];
      const eat = (d, defStat, defPos) => { const arr = (d && (d.data || d.milestones || (Array.isArray(d) ? d : null))) || null; if (!arr) return;
        arr.forEach((m) => { const name = dflt(m.skaterFullName) || dflt(m.goalieFullName) || dflt(m.playerName) || [dflt(m.firstName), dflt(m.lastName)].filter(Boolean).join(' '); if (!name) return;
          const career = num(m.currentValue) != null ? num(m.currentValue) : (num(m.value) != null ? num(m.value) : num(m.career));
          const target = num(m.milestone) != null ? num(m.milestone) : (num(m.target) != null ? num(m.target) : num(m.nextMilestone));
          if (career == null || target == null || target <= 0 || career > target) return;
          const stat = (dflt(m.milestoneType) || dflt(m.statName) || defStat || 'points').toLowerCase();
          rows.push({ id: dflt(m.playerId) || name, name, team: normTeam(m.teamAbbrev || m.teamAbbrevs), pos: dflt(m.positionCode) || dflt(m.position) || defPos || '', num: num(m.sweaterNumber) || null, stat, target, career, remaining: Math.max(0, target - career), pct: Math.min(100, Math.round(career / target * 100)) }); }); };
      eat(sk, 'points', ''); eat(go, 'wins', 'G');
      rows.sort((a, b) => a.remaining - b.remaining);
      return rows.length ? rows.slice(0, 8) : null;
    } catch (_) { return null; } },
    // ---- #6 awards / trophies (records.nhl.com award winners → trophy cards) ----
    awardsMapped: async () => { try {
      const d = await get('records/award-details?include=trophy.name');
      const arr = (d && (d.data || (Array.isArray(d) ? d : null))) || null; if (!arr || !arr.length) return null;
      const by = {}; arr.forEach((a) => { const tn = dflt(a.trophyName) || (a.trophy && dflt(a.trophy.name)) || dflt(a.award); if (!tn) return;
        const yr = num(a.seasonId) ? String(num(a.seasonId)).slice(0, 4) : (dflt(a.season) || '');
        const win = dflt(a.playerName) || [dflt(a.firstName), dflt(a.lastName)].filter(Boolean).join(' ') || dflt(a.fullName); if (!win) return;
        (by[tn] = by[tn] || []).push({ yr: +yr || yr, name: win }); });
      const names = Object.keys(by); if (!names.length) return null;
      return names.slice(0, 12).map((tn) => { const hist = by[tn].sort((a, b) => (b.yr || 0) - (a.yr || 0)).slice(0, 5);
        return { name: tn, desc: '', winner: hist[0] ? hist[0].name : '', year: hist[0] ? String(hist[0].yr) : '', history: hist }; });
    } catch (_) { return null; } },
    // ---- #3 shift charts (per-player TOI aggregation) ----
    shiftChartMapped: async (gameId, awayAb, homeAb) => { try {
      const d = await get(`shift-charts/${gameId}`);
      const arr = (d && (d.data || (Array.isArray(d) ? d : null))) || null; if (!arr || !arr.length) return null;
      const agg = {};
      arr.forEach((s) => { const team = dflt(s.teamAbbrev); const name = [dflt(s.firstName), dflt(s.lastName)].filter(Boolean).join(' ') || dflt(s.playerName); if (!name) return;
        const dur = (() => { const t = s.duration; if (!t) return 0; const p = String(t).split(':'); return p.length === 2 ? (+p[0] * 60 + +p[1]) : (+t || 0); })();
        const k = team + '|' + name; (agg[k] = agg[k] || { team, name, sec: 0, shifts: 0, pos: dflt(s.position) || '' }); if (dur > 0) { agg[k].sec += dur; agg[k].shifts++; } });
      const all = Object.values(agg); if (!all.length) return null;
      const maxSec = Math.max.apply(null, all.map((p) => p.sec).concat(1));
      const side = (ab) => all.filter((p) => p.team === ab).sort((a, b) => b.sec - a.sec).slice(0, 6).map((p) => ({ name: p.name, pos: p.pos, toi: `${Math.floor(p.sec / 60)}:${String(p.sec % 60).padStart(2, '0')}`, shifts: p.shifts, pct: Math.round(p.sec / maxSec * 100) }));
      const away = side(awayAb), home = side(homeAb); if (!away.length && !home.length) return null;
      return { away, home };
    } catch (_) { return null; } },
    // ---- #2 game recap (WSC narrative game story) ----
    gameRecapMapped: async (id) => { try {
      const d = await get(`wsc/game-story/${id}`);
      const t = d && (d.summary || d.story || d.recap || (d.gameStory && d.gameStory.summary) || (d.gameVideo && dflt(d.gameVideo.threeMinRecap)));
      return (typeof t === 'string' && t.length > 20) ? t : null;
    } catch (_) { return null; } },
    // ---- #8 playoff series schedule (game-by-game within a series) ----
    playoffSeriesScheduleMapped: async (season, letter) => { try {
      const d = await get(`schedule/playoff-series/${season || activeSeason()}/${letter}`);
      const games = (d && (d.games || (d.gameWeek && d.gameWeek.reduce((a, w) => a.concat(w.games || []), [])))) || null; if (!games || !games.length) return null;
      return games.map((g) => ({ date: fmtDate(g.gameDate || g.startTimeUTC), away: dflt(g.awayTeam && g.awayTeam.abbrev), home: dflt(g.homeTeam && g.homeTeam.abbrev), as: num(g.awayTeam && g.awayTeam.score), hs: num(g.homeTeam && g.homeTeam.score), st: dflt(g.gameState) || '' }));
    } catch (_) { return null; } },
    // ---- #9 live player search ----
    playerSearchMapped: async (term) => { if (!term || term.length < 2) return null; try {
      const d = await get(`search/player?q=${encodeURIComponent(term)}&limit=8&active=true&culture=en-us`);
      const arr = Array.isArray(d) ? d : ((d && d.data) || null); if (!arr || !arr.length) return null;
      return arr.map((p) => ({ id: dflt(p.playerId) || dflt(p.id), name: dflt(p.name) || [dflt(p.firstName), dflt(p.lastName)].filter(Boolean).join(' '), team: dflt(p.teamAbbrev) || dflt(p.lastTeamAbbrev) || '', pos: dflt(p.positionCode) || dflt(p.position) || '' })).filter((p) => p.name && p.id);
    } catch (_) { return null; } },
    // ---- #7 national TV schedule ----
    tvScheduleMapped: async (date) => { try {
      const d = await get(date ? `network/tv-schedule/${date}` : 'network/tv-schedule');
      const arr = (d && (d.games || d.broadcasts)) || (Array.isArray(d) ? d : null); if (!arr || !arr.length) return null;
      return arr.map((g) => ({ time: dflt(g.startTime) || dflt(g.gameTime) || '', away: dflt(g.awayTeam && g.awayTeam.abbrev) || dflt(g.away), home: dflt(g.homeTeam && g.homeTeam.abbrev) || dflt(g.home), networks: (g.tvBroadcasts || g.networks || []).map((b) => dflt(b.network) || dflt(b)).filter(Boolean) })).filter((g) => g.away && g.home);
    } catch (_) { return null; } },
    // ---- #5 team EDGE detail (best-effort scan; null keeps mock) ----
    edgeTeamDetailMapped: async (teamId) => { try {
      const d = await get(`edge/team-detail/${teamId}`); if (!d || typeof d !== 'object') return null;
      const find = (keys) => { for (const k of Object.keys(d)) { if (keys.some((w) => k.toLowerCase().includes(w))) { const v = num(d[k]); if (v != null) return v; } } return null; };
      const rows = [['Top skating speed', find(['topskat', 'maxspeed']), 'mph'], ['Skating distance', find(['distance', 'milesskated']), 'mi/gm'], ['20+ mph bursts', find(['burst', 'over20']), '/gm'], ['Max shot speed', find(['shotspeed', 'hardest']), 'mph'], ['O-zone time', find(['ozone', 'offensivezone']), '%']].filter((r) => r[1] != null);
      return rows.length ? rows : null;
    } catch (_) { return null; } },
    _map: { mapStandings, mapGame, mapRoster, mapSkaterLeaders, mapGoalieLeaders, mapShots, mapZones, mapEdgeSkater, mapEdgeGoalie },
  };
})();
