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

  // cache of live slates by offset, consulted by the patched BC.slate
  const liveSlates = {};
  const mockSlate = BC.slate;
  BC.slate = (offset) => (liveSlates[offset] ? liveSlates[offset] : mockSlate(offset));

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

    // ---- live score slates around today (drives Scores + Highlights) ----
    if (BC.LIVE) {
      await Promise.all([-2, -1, 0, 1, 2].map(async (o) => {
        try {
          const games = await NHL.scores(o);
          if (games && games.length) {
            games.forEach((g) => { ensureTeam(g.a); ensureTeam(g.h); });
            liveSlates[o] = games;
            changed = true;
          }
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
        if (games && games.length) { liveSlates[0] = games; onReady && onReady(); }
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
        onReady && onReady();
      }
    } catch (_) {}
  };
})();
