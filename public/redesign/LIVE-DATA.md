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
| `redesign/editorial-live.js` | **bridge** — `BC.hydrate()` overwrites `BC.STANDINGS` + score slates with live data and re-renders; `BC.startPolling()` re-polls today's scores every 20s |
| `cloudflare/functions/api/nhl/[[path]].ts` | the **proxy** (edge-cached) that makes `window.NHL` resolve in production |

## Flow

```
App mounts
  └─ BC.hydrate(reRender)
       ├─ NHL.standings()      → /api/nhl/standings      → map → BC.STANDINGS
       ├─ NHL.scores(-2..2)    → /api/nhl/scoreboard?date → map → live slates
       └─ on success: BC.LIVE=true, reRender(), startPolling()
  (any fetch throws → silently keep mock; UI never breaks)
```

Detail views (game / player / team) can call `window.NHL.*` directly with a
`try/catch` → mock fallback, so they upgrade to live independently.

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
