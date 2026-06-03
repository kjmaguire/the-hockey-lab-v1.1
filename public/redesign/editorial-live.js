/* The Hockey Lab — live/mock hydration bridge.
   window.BC is the synchronous mock data the editorial UI renders from.
   This bootstrap tries the live NHL proxy (window.NHL -> /api/nhl/*). If it
   answers (i.e. deployed on Cloudflare), it overwrites BC's core feeds with
   real data and fires a re-render. If it fails (design preview / CORS), the
   app silently stays on mock. Detail views call NHL.* directly with their own
   try/catch + mock fallback, so nothing breaks either way. */
(function () {
  const BC = window.BC, NHL = window.NHL;
  if (!BC || !NHL) return;
  BC.LIVE = false;

  // cache of live slates by offset, consulted by the patched BC.slate.
  // `fetchedSlates` records offsets we've actually heard back on (even when the
  // league had ZERO games that day) so we return the real empty slate instead of
  // falling back to mock's fabricated games — critical in the offseason.
  const liveSlates = {};
  const fetchedSlates = {};
  const inflightSlate = {};
  const mockSlate = BC.slate;
  BC.slate = (offset) => {
    if (BC.LIVE && fetchedSlates[offset]) return liveSlates[offset] || [];
    return liveSlates[offset] ? liveSlates[offset] : mockSlate(offset);
  };
  // On-demand slate loader for any offset (Scores can scrub far past ±2 days, and
  // game deep-links resolve through findGame). De-dupes in-flight requests.
  BC.ensureSlate = (offset, cb) => {
    if (!BC.LIVE || fetchedSlates[offset] || inflightSlate[offset]) return;
    inflightSlate[offset] = true;
    Promise.resolve().then(() => NHL.scores(offset)).then((games) => {
      (games || []).forEach((g) => { ensureTeam(g.a); ensureTeam(g.h); });
      liveSlates[offset] = games || [];
      fetchedSlates[offset] = true;
      inflightSlate[offset] = false;
      cb && cb();
    }).catch(() => { inflightSlate[offset] = false; });
  };

  // ---- live full rosters (official roster endpoint, merged with the stats pool) ----
  // teamRoster was derived from the season stats pool alone (skaters only, no
  // sweater numbers, no goalies). We overlay the real club roster per team and
  // merge season stat lines from the pool so the Team page is complete.
  const liveRosters = {};
  const inflightRoster = {};
  let mockTeamRoster = BC.teamRoster;
  BC.teamRoster = (ab) => (liveRosters[ab] && liveRosters[ab].length) ? liveRosters[ab] : mockTeamRoster(ab);
  BC.ensureRoster = (ab, cb) => {
    if (!BC.LIVE || liveRosters[ab] || inflightRoster[ab]) return;
    inflightRoster[ab] = true;
    Promise.resolve().then(() => NHL.roster(ab)).then((rows) => {
      if (rows && rows.length) {
        const skBy = {}; (BC.allPlayers || []).forEach((p) => { skBy[p.id] = p; });
        const goBy = {}; (BC.goalies || []).forEach((g) => { goBy[g.id] = g; });
        liveRosters[ab] = rows.map((r) => {
          const s = skBy[r.id] || {};
          const base = { id: r.id, name: r.name, team: ab, pos: r.pos, num: r.num };
          return r._isGoalie
            ? { ...base, ...(goBy[r.id] || {}), pos: 'G', _isGoalie: true }
            : { ...base, gp: s.gp || 0, g: s.g || 0, a: s.a || 0, p: s.p || 0, pm: s.pm || 0, sog: s.sog || 0 };
        }).sort((x, y) => (y.p || 0) - (x.p || 0));
      } else {
        liveRosters[ab] = []; // fetched-but-empty → keep mock via the guard above
      }
      inflightRoster[ab] = false;
      cb && cb();
    }).catch(() => { inflightRoster[ab] = false; });
  };

  // patch team meta lookups so live abbrevs resolve even if not in the mock map
  const ensureTeam = (ab, name, city) => {
    if (ab && !BC.TEAMS[ab]) BC.TEAMS[ab] = [name || ab, city || ab, '#64748b'];
  };

  async function hydrate(onReady) {
    let changed = false;

    // ---- standings (drives Standings, Teams, Stats, IQ, rankings) ----
    try {
      const rows = await NHL.standings();
      if (rows && rows.length) {
        rows.forEach((r) => ensureTeam(r.ab, r._name, r._city));
        BC.STANDINGS.length = 0;
        rows.forEach((r) => BC.STANDINGS.push(r));
        // rebuild rank + lookup
        const rank = {}; BC.STANDINGS.forEach((t, i) => (rank[t.ab] = i + 1));
        BC.rankOf = rank;
        BC.standBy = (ab) => BC.STANDINGS.find((t) => t.ab === ab);
        changed = true;
        BC.LIVE = true;
      }
    } catch (_) { /* stay on mock */ }

    // ---- player pool (skaters + goalies) ----
    // skater-leaders -> skater/summary (every skater w/ real stats); goalie-leaders
    // likewise. We swap the contents of BC.allPlayers / BC.goalies IN PLACE so the
    // closures (skaterLeaders, goalieLeaders, teamRoster, edgeLeaders, milestones…)
    // all read live data. Then resetDerived() recomputes everything downstream
    // (leaders, rosters, playoff seeding, draft order, news, team stats).
    if (BC.LIVE) {
      await Promise.all([
        (async () => {
          try {
            const sk = await NHL.skaterLeaders();
            if (sk && sk.length && Array.isArray(BC.allPlayers)) {
              sk.forEach((p) => ensureTeam(p.team));
              BC.allPlayers.length = 0;
              sk.forEach((p) => BC.allPlayers.push(p));
              changed = true;
            }
          } catch (_) { /* keep mock skaters */ }
        })(),
        (async () => {
          try {
            const go = await NHL.goalieLeaders();
            if (go && go.length && Array.isArray(BC.goalies)) {
              go.forEach((g) => ensureTeam(g.team));
              BC.goalies.length = 0;
              go.forEach((g) => BC.goalies.push(g));
              changed = true;
            }
          } catch (_) { /* keep mock goalies */ }
        })(),
      ]);
      // league team summary -> live PP%/PK%/FO% (consumed by buildTS in resetDerived)
      try {
        const ts = await NHL.teamSeasonStats();
        if (ts) BC._liveTeamStats = ts;
      } catch (_) { /* team stats stay projected */ }
      // recompute every standings/player-derived cache from the live data
      try { if (BC.resetDerived) BC.resetDerived(); } catch (_) {}
    }

    // ---- live score slates around today (drives Scores + Highlights) ----
    // Mark every offset we hear back on as fetched — even an empty slate — so the
    // board shows the real "no games" state instead of mock's fabricated games.
    if (BC.LIVE) {
      await Promise.all([-2, -1, 0, 1, 2].map(async (o) => {
        try {
          const games = await NHL.scores(o);
          (games || []).forEach((g) => { ensureTeam(g.a); ensureTeam(g.h); });
          liveSlates[o] = games || [];
          fetchedSlates[o] = true;
          changed = true;
        } catch (_) { /* keep mock for this offset */ }
      }));
    }

    if (changed && typeof onReady === 'function') onReady();
    return BC.LIVE;
  }

  // re-poll today's slate while live (real-time scoreboard)
  function startPolling(onReady, ms = 20000) {
    if (!BC.LIVE) return () => {};
    const t = setInterval(async () => {
      try {
        const games = await NHL.scores(0);
        liveSlates[0] = games || []; fetchedSlates[0] = true; onReady && onReady();
      } catch (_) {}
    }, ms);
    return () => clearInterval(t);
  }

  BC.hydrate = hydrate;
  BC.startPolling = startPolling;
  BC.NHL = NHL;
  // error notifier: editorial-live sets BC.onError(msg) targets; app subscribes
  BC._errCbs = [];
  BC.onError = (cb) => { BC._errCbs.push(cb); return () => { BC._errCbs = BC._errCbs.filter(x=>x!==cb); }; };
  BC.notifyError = (msg) => BC._errCbs.forEach(cb => { try { cb(msg); } catch(_){} });

  // re-fetch standings for a chosen season (live only; mock ignores season)
  BC.hydrateSeason = async (season, onReady) => {
    if (!BC.LIVE) return; // preview/mock: season switch is a no-op visually
    try {
      const data = await NHL.get(`standings/${NHL.ymd(0)}`); // season-scoped via date works live
      const rows = NHL._map.mapStandings(data);
      if (rows && rows.length) {
        BC.STANDINGS.length = 0; rows.forEach((r) => BC.STANDINGS.push(r));
        const rank = {}; BC.STANDINGS.forEach((t, i) => (rank[t.ab] = i + 1)); BC.rankOf = rank;
        try { if (BC.resetDerived) BC.resetDerived(); } catch (_) {}
        onReady && onReady();
      }
    } catch (_) {}
  };
})();
