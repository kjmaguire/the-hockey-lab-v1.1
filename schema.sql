-- The Hockey Lab — durable L2 cache (Cloudflare D1)
--
-- Backs the per-colo edge cache with a global, durable store for IMMUTABLE NHL
-- endpoints (a specific historical draft year, the records book, league/season
-- meta, completed games). See functions/api/nhl/_lib.ts (d1Get / d1Put) and the
-- commented [[d1_databases]] block in wrangler.toml.
--
-- Apply with:
--   npx wrangler d1 execute the-hockey-lab-cache --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS nhl_cache (
  k       TEXT PRIMARY KEY,   -- fully-qualified upstream URL
  body    TEXT NOT NULL,      -- raw JSON payload
  exp     INTEGER NOT NULL,   -- unix seconds: when this row goes stale
  updated INTEGER NOT NULL    -- unix seconds: when it was last written
);

-- Lets a periodic cleanup prune expired rows cheaply (optional housekeeping):
--   DELETE FROM nhl_cache WHERE exp < strftime('%s','now');
CREATE INDEX IF NOT EXISTS idx_nhl_cache_exp ON nhl_cache (exp);
