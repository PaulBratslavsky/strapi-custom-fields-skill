#!/usr/bin/env bash
#
# Scaffold a REAL Strapi app once and cache it, so integration cases run against
# an actual server rather than a stub. The cache is gitignored; delete it to
# force a fresh scaffold.
#
#   ./make-app.sh            # create if missing, print the path
#   FORCE=1 ./make-app.sh    # recreate
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
APP="${STRAPI_APP_CACHE:-$HERE/.app}"

if [ "${FORCE:-0}" = "1" ]; then rm -rf "$APP"; fi

# A completion marker, not package.json: a create-strapi run that dies partway
# still leaves package.json behind, and reusing that half-built app produces
# confusing failures in every case that depends on it.
# The marker records the Strapi version it was built with, so changing
# STRAPI_VERSION (or the default below) rebuilds instead of silently reusing an
# app scaffolded from an older release.
VERSION="${STRAPI_VERSION:-5.60.0}"
if [ -f "$APP/.scaffold-complete" ] && [ "$(cat "$APP/.scaffold-complete")" = "$VERSION" ]; then
  echo "$APP"
  exit 0
fi

echo "scaffolding a real Strapi app (several minutes, one time)…" >&2
rm -rf "$APP"
mkdir -p "$(dirname "$APP")"

export npm_config_fetch_retries=6
export npm_config_fetch_retry_maxtimeout=180000

# --quickstart uses SQLite, so no database service is needed.
# Pinned rather than @latest: the generated app and CLI flags change between
# releases, and a test suite should not silently start testing a different app.
( cd "$(dirname "$APP")" && npx -y "create-strapi@$VERSION" "$(basename "$APP")" \
    --quickstart --skip-cloud --no-run --use-npm --ts ) >&2

printf '%s' "$VERSION" > "$APP/.scaffold-complete"
echo "$APP"
