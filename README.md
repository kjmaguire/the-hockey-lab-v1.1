# The Hockey Lab — Cloudflare Pages

The Hockey Lab as a deployable Cloudflare Pages site: a static editorial SPA
(landing + app) served from `public/`, with live NHL data proxied through Pages
Functions at `/api/nhl/*`.

## Structure

```
cloudflare/
├── functions/
│   └── api/nhl/
│       ├── [[path]].ts   # router — full NHL surface (api-web + stats + records + wsc + edge)
│       └── _lib.ts       # upstream fetch + edge cache; 3 bases (api-web, stats, records)
├── public/               # the deployable static site (Pages build output)
│   ├── index.html        # editorial LANDING page (front door)
│   ├── app.html          # the editorial APP (all pages)
│   └── redesign/         # app modules
│       ├── broadcast-data.js   # mock data (instant first paint + fallback)
│       ├── editorial-ext.js    # mock depth (team stats, edge, prospects, records, draft…)
│       ├── nhl-client.js       # window.NHL — 90 endpoint fetchers + field mappers
│       ├── editorial-live.js   # live/mock hydration bridge + polling + error notify
│       ├── editorial-pages.jsx # pages (Standings/Teams/Players/Stats/IQ/Draft/Records + detail)
│       └── editorial-app.jsx   # shell, Scores, Game detail, routing, ⌘K, hash deep-links
├── _redirects            # SPA + app.html fallback
├── package.json
└── wrangler.toml
```

## Edge caching (tiered by volatility)

`_lib.ts` caches every upstream response at the edge (`caches.default`), but the
TTL is **not** a flat 5 minutes — it's chosen per resource by how often it
actually changes (see `ttlFor()`):

| Resource | TTL | Why |
|---|---|---|
| Live game (`gameState` LIVE/CRIT) | 20s | needs to stay fresh |
| Today's scoreboard / date slates | 30s | drives the live board + polling |
| Pre-game feed | 2 min | lineups / odds still firming |
| **Final game** (box score, play-by-play, landing) | **24h** | immutable once final — no reason to re-pull |
| Standings, leaders, rosters, club-stats, player landing | 5 min | default |
| Records book, league meta, historical drafts | 24h | reference data, effectively static |

Game feeds are classified by peeking at the payload's `gameState` (a slate is
"final" only when **all** its games are final, "live" if **any** are live), so a
finished game is fetched from the NHL once and then served from the edge for a
day — while a game in progress refreshes every ~20s. Nothing is persisted to a
database; entries simply expire.

**Stale-if-error:** alongside the tiered entry, each successful fetch also writes
a long-lived (~7-day) "last-known-good" copy. If the NHL API is unreachable when
a tiered entry has expired, the proxy serves that copy instead of erroring — so a
brief upstream outage shows slightly-stale **real** data rather than dropping the
client to bundled mock. Only a cold load with *no* cached copy at all falls back
to mock.

## Deploy

This repo deploys as a **Cloudflare Worker with Static Assets** (`worker.ts` +
`./public`). The `wrangler.toml` is what wires it together — `main = worker.ts`
mounts the `/api/nhl/*` proxy, and the `[assets]` block serves `./public` and
binds it as `env.ASSETS`.

```bash
cd cloudflare
npm install        # installs wrangler
npm run deploy     # = wrangler deploy
```

First time, `wrangler` will prompt you to log in (`npx wrangler login`).

> **If you see "demo data" after deploying:** the Worker isn't running the
> proxy. Confirm `wrangler.toml` is present and that `wrangler deploy` reported
> uploading **both** the Worker and the assets. Hit `/api/nhl/standings` on your
> deployed URL — it should return JSON, not your HTML page. If it returns HTML,
> the assets layer is swallowing the route (check `main`/`[assets]` in
> `wrangler.toml`).

### Alternative: Cloudflare Pages

The `functions/api/nhl/[[path]].ts` Pages Function mirrors `worker.ts`, so the
same code also runs on Pages:
- Root directory: `cloudflare`
- Build command: *(none)* — static, runtime Babel
- Build output directory: `public`
- Functions auto-detected from `functions/`

On deploy, `app.html` boots on mock data, then `BC.hydrate()` calls
`/api/nhl/standings` + `/api/nhl/scoreboard`; if the proxy answers, `BC.LIVE`
flips true, real data swaps in, and today's scoreboard polls every 20s. If a
fetch fails it silently keeps mock and shows a dismissible toast.

## Routes & deep-linking

The app uses hash routes — `app.html#standings`, `#team/TOR`, `#player/8478402`
are bookmarkable and back/forward works.

## NHL API coverage (via the proxy)

Three upstream bases, all reachable:
- **api-web.nhle.com/v1** — scores, schedule, standings, gamecenter (boxscore /
  pbp / right-rail / landing / story), roster, club-stats, team-stats,
  prospects, player landing+log, draft, playoff bracket/series, spotlight, wsc,
  **edge/\*** (generic passthrough)
- **api.nhle.com/stats/rest** — skater/goalie/team leaders & reports,
  **config** (self-documents every report), **stats/\*** generic passthrough
- **records.nhl.com/site/api** — all-time records, trophies, franchise history
  (**records/\*** generic passthrough)

## ⚠️ Production notes

1. **Runtime Babel:** `app.html` transpiles JSX in-browser via CDN Babel. It
   works as-is, but for production speed you'd precompile the `.jsx` to JS
   (e.g. esbuild) and drop the Babel script. Not required to ship.
2. **EDGE / records field paths:** these upstream feeds are undocumented and can
   drift. The mappers in `nhl-client.js` are defensive (optional chaining +
   mock fallback) — verify field paths against live payloads on first deploy.
3. The original ported Laravel/Inertia React source has been replaced by this
   static editorial build; the Pages Functions are unchanged from that port
   (plus the added endpoints).
