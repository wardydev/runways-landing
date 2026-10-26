#!/usr/bin/env bash
set -euo pipefail

# Run only in the dedicated VPS clone, as the deployment user. Linux/Ubuntu.
RUNWAYS_REPO_DIR="${RUNWAYS_REPO_DIR:-/srv/runways/repository}"
RUNWAYS_WEBROOT="${RUNWAYS_WEBROOT:-/var/www/runways}"
cd "$RUNWAYS_REPO_DIR"
exec 9>"$RUNWAYS_REPO_DIR/.deploy.lock"
flock -n 9 || { echo 'Another release is already running.' >&2; exit 1; }
git pull --ff-only
test -f .env || { echo 'Missing server .env.' >&2; exit 1; }
test -f package-lock.json || { echo 'Generate and commit package-lock.json before VPS deployment.' >&2; exit 1; }
npm ci
npm run check
npm test
npm run build
test -s apps/web/dist/index.html
mkdir -p "$RUNWAYS_WEBROOT/releases"
RUNWAYS_RELEASE_DIR="$(mktemp -d "$RUNWAYS_WEBROOT/releases/$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")"
cp -a apps/web/dist/. "$RUNWAYS_RELEASE_DIR/"
ln -s "$RUNWAYS_RELEASE_DIR" "$RUNWAYS_WEBROOT/.current.$$"
mv -Tf "$RUNWAYS_WEBROOT/.current.$$" "$RUNWAYS_WEBROOT/current"
echo "Release activated: $(basename "$RUNWAYS_RELEASE_DIR")"
