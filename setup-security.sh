#!/usr/bin/env bash
# The Hockey Lab — one-shot security setup for the /api/nhl/* proxy.
# Creates the KV namespace the per-IP rate limiter uses, then prints the ids to
# paste into wrangler.toml. Safe to re-run (KV create is idempotent by name).
#
# Usage:  cd cloudflare && bash setup-security.sh
set -euo pipefail
cd "$(dirname "$0")"

echo "→ Logging in to Cloudflare (skips if already authed)…"
npx wrangler login || true

echo "→ Creating KV namespace RATE_LIMIT (production)…"
npx wrangler kv:namespace create RATE_LIMIT

echo "→ Creating KV namespace RATE_LIMIT (preview)…"
npx wrangler kv:namespace create RATE_LIMIT --preview

cat <<'NOTE'

────────────────────────────────────────────────────────────────────────
Done. Paste the two printed ids into cloudflare/wrangler.toml:

  [[kv_namespaces]]
  binding    = "RATE_LIMIT"
  id         = "<id from the production line above>"
  preview_id = "<id from the --preview line above>"

Then ALSO add a WAF rate-limit rule (recommended — atomic, per-IP, no code):
  Cloudflare dashboard → your zone → Security → WAF → Rate limiting rules
    • When incoming requests match:  URI Path  starts with  /api/nhl/
    • Rate:  120 requests per 1 minute per IP
    • Then:  Block (e.g. for 60 seconds)

Finally deploy:  npm run deploy
────────────────────────────────────────────────────────────────────────
NOTE
