# The Hockey Lab — live data wiring (Cloudflare)

The editorial app (`The Hockey Lab - App.html`) is **live-first, mock-fallback**.
It renders instantly from bundled mock data, then tries the real NHL proxy and
swaps in live data if the proxy answers. Same code runs in the design preview
(mock — the NHL API blocks browser CORS, and there's no proxy) and on Cloudflare
Pages (live — the proxy exists).

## Pieces

| File | Role |
|---|---|
| `redesign/broadcast-data.js` | mock data (`window.BC`) — instant first paint + fallback |
| `redesign/editorial-ext.js` | mock depth (team stats, edge, prospects, pbp…) |
| `redesign/nhl-client.js` | **live client** `window.NHL` — one fetcher per `/api/nhl/*` endpoint + field mappers to the UI view-models |
| `redesign/editorial-live.js` | **bridge** — `BC.hydrate()` overwrites `BC.STANDINGS`, the league player pool (`BC.allPlayers`/`BC.goalies`) and score slates with live data, then `BC.resetDerived()` recomputes everything downstream; `BC.startPolling()` re-polls today's scores every 20s |
| `cloudflare/functions/api/nhl/[[path]].ts` | the **proxy** (edge-cached) that makes `window.NHL` resolve in production |

## Flow

```
App mounts
  └─ BC.hydrate(reRender)
       ├─ NHL.standings()      → /api/nhl/standings       → map → BC.STANDINGS
       ├─ NHL.skaterLeaders()  → /api/nhl/skater-leaders   → map → BC.allPlayers (in place)
       ├─ NHL.goalieLeaders()  → /api/nhl/goalie-leaders   → map → BC.goalies (in place)
       ├─ BC.resetDerived()    → recompute every standings/player-derived cache
       ├─ NHL.scores(-2..2)    → /api/nhl/scoreboard?date  → map → live slates
       └─ on success: BC.LIVE=true, reRender(), startPolling()
  (any fetch throws → silently keep mock; UI never breaks)
```

### Why the player-pool swap covers so much

Almost the entire app derives from three core structures: `BC.STANDINGS`,
`BC.allPlayers`, `BC.goalies`. `skaterLeaders`, `goalieLeaders`, `teamRoster`,
`edgeLeaders`, `milestoneWatch`, `teamNews`, the playoff **seeding**, the draft
**order**, the news wire and per-team stats are all closures/caches over those.
So swapping the player pool in place + `BC.resetDerived()` (which clears the
derived caches and rebuilds team stats) lights up:

- **Stats, Players, Hockey IQ, Highlights** — real leaders + rosters + compares
- **Playoffs** — bracket seeded from the live standings (top-3/div + 2 WC)
- **Draft** — pick order from the live reverse standings + lottery
- **Records** — live milestone watch; franchise/all-time holders stay projections
- **News wire** — storylines reference the real player pool

What stays an **editorial projection** (no always-on live feed exists): simulated
playoff *series results* / game-by-game box scores, *all-time single-season records*
and *trophy winners*, the franchise wins/cups table, and the *fictional news
articles/X posts*. Player **honors graphics** on the detail page remain projections.

**Now wired live (added this pass — mock-first, live-overlay via `E_useLive`):**

- **Playoffs** — `NHL.playoffFull()` maps the real **series carousel**
  (`playoff-series-carousel/{season}`, fallback `playoff-bracket/now`) into the full
  `{east,west,final,cup}` bracket, seeded to the live standings. Rounds not yet
  played are synthesized from the leaders of the prior round and the advancing team
  is projected as the current series leader, so the bracket is always complete
  (never null → no crash). Bails to the mock bracket if it can't read ≥4 series.
- **Draft** — `NHL.draftFull()` maps live **prospect rankings**
  (`draft/rankings/now`) into the board and overlays those names onto the
  standings-derived pick order (order was already live; names now are too).
- **Player EDGE tracking** — `NHL.edgeSkaterMapped/edgeGoalieMapped(id)`
  (`edge/{skater,goalie}-detail/{id}`) scan the EDGE payload for top skating/shot
  speed, distance, bursts, O-zone time (skaters) and high/mid/low-danger SV%
  (goalies). Returns a **partial** overlay merged over the mock edge view, so any
  field it can't recognize keeps its projection.
- **All-time records** — `NHL.recordsAllTime()` (`records/skater-records`,
  `records/goalie-records`) builds the categorized all-time leader cards. Lowest
  confidence of the set (records.nhl.com shapes are loosely documented); bails to the
  editorial projection if it can't recognize player+value arrays.

⚠️ The EDGE and records mappers are defensive scans against internal/undocumented
feeds — expect to tune field paths against live payloads on deploy (same caveat as
the shot-zone heatmap). Playoffs and draft map well-structured public endpoints and
are higher confidence.

Detail views (game / player / team) can additionally call `window.NHL.*` directly
with a `try/catch` → mock fallback, so they upgrade to live independently. The
per-game shot map and season shot-zone heatmap already do this, and a shared
`window.E_useLive(mock, fetchLive, deps)` hook (mock-first, live-overlay, only
fires when `BC.LIVE`) wires the rest:

- **Game Detail** — `NHL.gameLive(id)` (gamecenter `landing` + `boxscore`) overlays
  the scoring summary, three stars, team game stats, box score by period, and
  skater/goalie lines; `NHL.gamePbp(id)` overlays the play-by-play feed.
- **Player Detail** — `NHL.playerCard(id)` (player `landing`) overlays real season
  history, career totals and awards (identity + current line already come from the
  live player pool; EDGE tracking + honors graphics remain projections).
- **Team stats** — `NHL.teamSeasonStats()` (stats `team/summary`) hydrates real
  PP%/PK%/FO% into `buildTS()` league-wide during `BC.hydrate()`.

## Endpoints the client covers (`window.NHL`)

Web API (`api-web.nhle.com/v1`, via proxy): `standings`, `scores`/`scoreboard`,
`schedule`, `gamecenter/{id}/{boxscore,play-by-play,right-rail}`, `roster`,
`club-stats`, `club-schedule`, `team-stats`, `prospects`, `player/{id}/landing`,
`player/{id}/game-log`, `edge/skater-detail`, `edge/goalie-detail`,
`edge/skater-landing`, **`spotlight`**, **`playoff-bracket`**,
**`playoff-series-carousel`**, **`edge-team/{skating-speed,shot-location}`**.

Stats API (`api.nhle.com/stats/rest`, via proxy): `skater-leaders`,
`goalie-leaders`, `team-stats` aggregation.

The **bold** ones are new endpoints added to the proxy in this pass (beyond the
original `NhlApiController`) so the app can surface player spotlight, the playoff
bracket/series, and team-level EDGE tracking.

## To go fully live on Cloudflare

1. Port the editorial UI (`redesign/*.jsx`) into `cloudflare/src` (or load these
   files as static assets) so the build serves them.
2. Ensure `cloudflare/functions/api/nhl/*` is deployed (it is, in this repo).
3. Deploy. `BC.hydrate()` will reach `/api/nhl/*`, `BC.LIVE` flips true, and the
   scoreboard polls live. No code change needed between preview and prod.

## Tuning & verifying EDGE on deploy

EDGE detail/zone/top-10 feeds are internal and shape-drifting, so the mappers
(`mapEdgeSkater`, `mapEdgeGoalie`, `mapZones`, `edgeBoardLive`) are **name-key
scans**. After deploying behind the proxy, tune them against real payloads:

1. **Inspect a real payload** — in the deployed console:
   `await NHL.edgeDebug('<playerId>','skater')` (or `'goalie'`). It returns
   `{ recognized, topLevelKeys, rows, sample }` — recognized vs. the raw key set.
2. **Map the gaps** — for any metric that shows up in `topLevelKeys`/`sample`
   but not in `recognized`, add that field's lowercased key fragment to the
   corresponding `edgeMetric(payload, [...])` list in `nhl-client.js`.
3. **Verify it lights up** — on a player page confirm `BC.LIVE===true` and the
   EDGE cards show live values (percentile + league avg) rather than projections.
4. **League leaderboard** — `await NHL.edgeBoardLive('top')` should return ~20
   rows; if `null`, correct the `PATHS` map / array-scan in `edgeBoardLive`.
   The Hockey IQ → Skaters board overlays this live via `E_useLive`.
5. **Goalie depth** — the goalie card now carries 6 rows (HD/MD/LD SV% +
   goals-saved-a.e., rebound control, HD shots faced/60); confirm the advanced
   three populate or fall back cleanly.

Surfaced EDGE views: player detail (7 skater tracking cards + zone split + season
heatmap + per-game table), goalie detail (6 save-quality rows), Hockey IQ →
Skaters (live leaderboard + tracking leaders + skater compare), → Goalies (HD
leaders + goalie compare), → Teams (skating distance + top-speed boards).

## Caveat (from the NHL API docs)

The EDGE endpoints are undocumented/internal-broadcast feeds — response shapes
can vary and availability is inconsistent. The mappers in `nhl-client.js` are
defensive (optional chaining + mock fallback), but expect to tune field paths
against live payloads when you deploy.

## Shot maps

Two shot views, both live-first / sample-fallback like the rest of the app:

- **Per-game shot map** (`E_ShotMap`, in `redesign/shot-map.jsx`) — plots real
  rink coordinates from `gamecenter/{id}/play-by-play` (`details.xCoord/yCoord`)
  via `NHL.shotMap(id)`. Normalizes per team+period so it reads away-right /
  home-left; markers for goal / on-net / missed / blocked with hover detail.
- **Season shot zones** (`E_ShotZones`) — zoned half-rink heatmap from the EDGE
  shot-location detail (`NHL.shotZones(scope,id)` → `edge/team-shot-location-detail`,
  `edge/skater-shot-location-detail`, `edge/goalie-detail`). EDGE returns
  shots/goals/shooting% **by zone** (not coordinates), so `mapZones()` is a
  heuristic scan that falls back to sample data if it can't recognize the shape —
  this is the field-path tuning the caveat above refers to.
