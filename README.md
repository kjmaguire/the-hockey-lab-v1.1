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

## Deploy

**Git integration (recommended):**
- Root directory: `cloudflare`
- Build command: *(none)* — the site is static (runtime Babel, no build step)
- Build output directory: `public`
- Functions auto-detected from `functions/`

**Direct upload:**
```bash
cd cloudflare
npx wrangler pages deploy public
```

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
