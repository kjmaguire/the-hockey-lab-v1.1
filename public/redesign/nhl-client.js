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
  // teamAbbrevs can be "BOS,TOR" for a traded player — take the current (last) club.
  const curTeam = (v) => String(v ?? '').split(',').pop().trim();
  const POS = { L: 'LW', R: 'RW', C: 'C', D: 'D', G: 'G' };
  function mapSkaterLeaders(payload) {
    return (payload?.data ?? []).map((p) => ({
      id: String(p.playerId ?? p.id),
      name: p.skaterFullName ?? p.playerName ?? '',
      team: curTeam(p.teamAbbrevs ?? p.teamAbbrev),
      pos: POS[p.positionCode] ?? p.positionCode ?? 'F',
      num: '', // sweater not in the summary report; rosters render it as optional
      gp: p.gamesPlayed ?? 0, g: p.goals ?? 0, a: p.assists ?? 0, p: p.points ?? 0,
      pm: p.plusMinus ?? 0, sog: p.shots ?? 0,
    }));
  }
  function mapGoalieLeaders(payload) {
    return (payload?.data ?? []).map((g) => ({
      id: String(g.playerId ?? g.id),
      name: g.goalieFullName ?? g.playerName ?? '',
      team: curTeam(g.teamAbbrevs ?? g.teamAbbrev),
      gp: g.gamesPlayed ?? 0, w: g.wins ?? 0, l: g.losses ?? 0,
      svp: (g.savePctg != null ? g.savePctg.toFixed(3).slice(1) : '900'),
      gaa: (g.goalsAgainstAverage != null ? g.goalsAgainstAverage.toFixed(2) : '0.00'),
      so: g.shutouts ?? 0,
    }));
  }

  // ---- player landing -> playerExtras overlay (real career/history/awards) ----
  const MONS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmtSeason = (s) => { const t = String(s || ''); return t.length === 8 ? `${t.slice(0,4)}-${t.slice(6,8)}` : t; };
  const fmtDate = (s) => { if (!s) return ''; const p = String(s).split('-'); return p.length === 3 ? `${MONS[+p[1]-1]} ${+p[2]}` : s; };
  function mapPlayerCard(d) {
    if (!d) return null;
    const isG = (d.position || '') === 'G';
    const ab = dflt(d.currentTeamAbbrev) || '';
    const nhlRows = (d.seasonTotals || []).filter((s) => s.gameTypeId === 2 && s.leagueAbbrev === 'NHL');
    const history = nhlRows.slice().reverse().slice(0, 8).map((s) => {
      const team = s.teamAbbrev ? dflt(s.teamAbbrev) : (dflt(s.teamCommonName) || dflt(s.teamName) || ab);
      return isG
        ? { s: fmtSeason(s.season), team, gp: s.gamesPlayed ?? 0, w: s.wins ?? 0, l: s.losses ?? 0,
            svp: (s.savePctg != null ? s.savePctg.toFixed(3).slice(1) : '—'), gaa: (s.goalsAgainstAvg != null ? s.goalsAgainstAvg.toFixed(2) : '—') }
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
    const sm = landing && landing.summary; if (!sm) return null;
    const a = dflt(landing.awayTeam && landing.awayTeam.abbrev), h = dflt(landing.homeTeam && landing.homeTeam.abbrev);
    if (!a || !h) return null;
    const perLabel = (pd) => (pd && (pd.periodType === 'SO')) ? 'SO' : (pd && pd.number > 3 ? 'OT' : ordinal((pd && pd.number) || 1));
    const lg = sm.linescore && sm.linescore.byPeriod || [], sbp = sm.shotsByPeriod || [];
    const periods = lg.map((p) => perLabel(p.periodDescriptor));
    const line = { periods: periods.length ? periods : ['1st','2nd','3rd'],
      away: { goals: lg.map((p) => p.away ?? 0), shots: sbp.map((p) => p.away ?? 0), total: landing.awayTeam.score ?? 0, sog: landing.awayTeam.sog ?? 0 },
      home: { goals: lg.map((p) => p.home ?? 0), shots: sbp.map((p) => p.home ?? 0), total: landing.homeTeam.score ?? 0, sog: landing.homeTeam.sog ?? 0 } };
    const tg = {}; (sm.teamGameStats || []).forEach((s) => { tg[s.category] = { a: s.awayValue, h: s.homeValue }; });
    const mkTeamSide = (k) => ({ sog: landing[k === 'a' ? 'awayTeam' : 'homeTeam'].sog ?? 0, fo: foStr(tg.faceoffWinningPctg && tg.faceoffWinningPctg[k]),
      hits: (tg.hits && tg.hits[k]) ?? 0, blk: (tg.blockedShots && tg.blockedShots[k]) ?? 0, pim: (tg.pim && tg.pim[k]) ?? 0, pp: ppStr(tg.powerPlay && tg.powerPlay[k]) });
    const teamA = mkTeamSide('a'), teamH = mkTeamSide('h');
    const boxTeam = { [a]: { pp: teamA.pp, pk: null, give: (tg.giveaways && tg.giveaways.a) ?? 0, take: (tg.takeaways && tg.takeaways.a) ?? 0, fo: teamA.fo },
                      [h]: { pp: teamH.pp, pk: null, give: (tg.giveaways && tg.giveaways.h) ?? 0, take: (tg.takeaways && tg.takeaways.h) ?? 0, fo: teamH.fo } };
    const goals = [];
    (sm.scoring || []).forEach((per) => (per.goals || []).forEach((go) => {
      goals.push({ team: dflt(go.teamAbbrev), scorer: dflt(go.name) || `${dflt(go.firstName)} ${dflt(go.lastName)}`.trim(),
        assists: (go.assists || []).map((x) => dflt(x.name)), str: (go.strength || 'ev').toUpperCase(),
        per: perLabel(per.periodDescriptor), time: go.timeInPeriod || '' });
    }));
    const stars = (sm.threeStars || []).slice(0, 3).map((s) => ({ n: s.star, name: dflt(s.name), team: dflt(s.teamAbbrev),
      line: s.position === 'G' ? `${s.savePctg != null ? '.' + String(Math.round(s.savePctg * 1000)).padStart(3, '0') : ''} SV%` : `${s.goals ?? 0}G ${s.assists ?? 0}A` }));
    const bs = box && box.playerByGameStats;
    const sideSkaters = (grp) => grp ? [...(grp.forwards || []), ...(grp.defense || [])].map((p) => ({
      name: dflt(p.name), pos: p.position || '', num: p.sweaterNumber ?? '', g: p.goals ?? 0, a: p.assists ?? 0, p: p.points ?? 0,
      sog: p.shots ?? p.sog ?? 0, pm: p.plusMinus ?? 0, hits: p.hits ?? 0, blk: p.blockedShots ?? 0, toi: p.toi || '' })) : null;
    const sideGoalie = (grp) => { const gg = grp && grp.goalies && grp.goalies[0]; if (!gg) return null;
      const parts = gg.saveShotsAgainst ? String(gg.saveShotsAgainst).split('/') : null;
      const saves = parts ? (+parts[0] || 0) : Math.max(0, (gg.shotsAgainst ?? 0) - (gg.goalsAgainst ?? 0));
      const sa = parts ? (+parts[1] || 0) : (gg.shotsAgainst ?? 0);
      return { name: dflt(gg.name), sa, saves, ga: gg.goalsAgainst ?? (sa - saves), svp: (gg.savePctg != null ? gg.savePctg.toFixed(3).slice(1) : '—'), toi: gg.toi || '', dec: gg.decision || '—' }; };
    const sk = bs ? { [a]: sideSkaters(bs.awayTeam), [h]: sideSkaters(bs.homeTeam) } : null;
    const gb = bs ? { [a]: sideGoalie(bs.awayTeam), [h]: sideGoalie(bs.homeTeam) } : null;
    const box2 = { periods: line.periods, line, team: boxTeam, scratches: { [a]: [], [h]: [] },
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
    const visit = (o, depth) => {
      if (!o || found || typeof o !== 'object' || depth > 6) return;
      for (const k of Object.keys(o)) {
        const child = o[k];
        if (want.some((w) => k.toLowerCase().includes(w)) && child && typeof child === 'object') {
          const val = num(child.value) ?? num(child.val) ?? num(child.amount) ?? num(child.result) ?? num(child.metric);
          if (val != null) {
            found = { val, pct: num(child.percentile) ?? num(child.pct) ?? null,
              avg: num(child.leagueAverage) ?? num(child.leagueAvg) ?? num(child.average) ?? null };
            return;
          }
        }
      }
      for (const k of Object.keys(o)) visit(o[k], depth + 1);
    };
    visit(payload, 0);
    return found;
  }
  function mapEdgeSkater(payload) {
    if (!payload) return null;
    const top = edgeMetric(payload, ['topskat', 'maxskat', 'topspeed', 'skatingspeed']);
    const shot = edgeMetric(payload, ['shotspeed', 'topshot', 'hardestshot']);
    const dist = edgeMetric(payload, ['skatingdistance', 'totaldistance', 'distance']);
    const b20 = edgeMetric(payload, ['burst', 'speedburst', 'over20', 'speedbursts']);
    const oz = edgeMetric(payload, ['offensivezone', 'ozone', 'o-zone', 'zonetimeoff']);
    if (!top && !shot && !dist && !oz) return null; // nothing recognizable → keep mock
    const speed = [];
    const row = (l, m, fmt) => { if (m) speed.push([l, fmt(m.val), m.pct != null ? Math.round(m.pct) : '—', m.avg != null ? fmt(m.avg) : '—']); };
    row('Top shot speed', shot, (v) => `${(+v).toFixed(1)} mph`);
    row('Max skating speed', top, (v) => `${(+v).toFixed(1)} mph`);
    row('Total distance', dist, (v) => `${(+v).toFixed(1)} mi`);
    row('Speed bursts 20+', b20, (v) => `${Math.round(v)}`);
    if (oz) speed.push(['O-zone time', `${(+oz.val).toFixed(0)}%`, oz.pct != null ? Math.round(oz.pct) : '—', oz.avg != null ? `${(+oz.avg).toFixed(0)}%` : '—']);
    const out = {};
    if (speed.length) out.speed = speed;
    if (oz) { const o = +(+oz.val).toFixed(1); const d = +((100 - o) * 0.46).toFixed(1); out.zones = [['Offensive', o], ['Neutral', +(100 - o - d).toFixed(1)], ['Defensive', d]]; }
    return Object.keys(out).length ? out : null; // partial overlay; caller merges over mock
  }
  function mapEdgeGoalie(payload) {
    if (!payload) return null;
    const hd = edgeMetric(payload, ['highdanger', 'high-danger', 'hidanger']);
    const md = edgeMetric(payload, ['middanger', 'mid-danger', 'mediumdanger']);
    const ld = edgeMetric(payload, ['lowdanger', 'low-danger']);
    if (!hd && !md && !ld) return null;
    const pctStr = (v) => (v <= 1 ? v.toFixed(3).slice(1) : (v / 100).toFixed(3).slice(1));
    const saveQ = [];
    const row = (l, m, avg) => { if (m) saveQ.push([l, pctStr(m.val), m.pct != null ? Math.round(m.pct) : '—', avg, m.avg != null ? Math.round(m.avg) : '—']); };
    row('High-danger SV%', hd, '.812'); row('Mid-danger SV%', md, '.910'); row('Low-danger SV%', ld, '.975');
    return saveQ.length ? { saveQ } : null;
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
  window.NHL = {
    BASE, get,
    ymd, ordinal,
    standings: async () => { const d = await get('standings'); if (d && d.currentSeason) window.NHL._season = String(d.currentSeason); return mapStandings(d); },
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
    teamSeasonStats: async () => mapTeamSeasonStats(await window.NHL.statsTeam('summary', ('seasonId='+curSeason()+' and gameTypeId=2'))),
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
    skaterLeaders: async () => mapSkaterLeaders(await get('skater-leaders?season=' + curSeason())),
    goalieLeaders: async () => mapGoalieLeaders(await get('goalie-leaders?season=' + curSeason())),
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

    // ---- LIVE OVERLAYS (mock-fallback handled by each caller) ----
    // Player-detail EDGE tracking (partial overlay; page merges over mock):
    edgeSkaterMapped: async (id) => { try { return mapEdgeSkater(await get(`edge/skater-detail/${id}`)); } catch (_) { return null; } },
    edgeGoalieMapped: async (id) => { try { return mapEdgeGoalie(await get(`edge/goalie-detail/${id}`)); } catch (_) { return null; } },
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
    // Draft board: live prospect rankings + standings-derived order with live names:
    draftFull: async () => {
      try {
        const live = mapDraftRankings(await get('draft/rankings'));
        if (!live) return null;
        const mockPicks = (window.BC && typeof window.BC.draftPicks === 'function') ? window.BC.draftPicks() : [];
        const picks = mockPicks.map((pk, i) => (live[i] ? { ...pk, name: live[i].name, pos: live[i].pos, league: live[i].league } : pk));
        return { rankings: live, picks };
      } catch (_) { return null; }
    },
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
    clubScheduleMapped: async (ab) => { try { return mapClubSchedule(await get(`club-schedule/${ab}`)); } catch (_) { return null; } },
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
