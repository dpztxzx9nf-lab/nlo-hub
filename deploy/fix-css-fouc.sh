#!/bin/bash
# Instant FOUC fix: mirror the real stylesheet under any hashed name the HTML asks for.
set -euo pipefail
APP=""
for d in /opt/nlo/app /opt/nlo /root/nlo-hub; do
  if [ -d "$d/.output/public/assets" ]; then APP="$d"; break; fi
done
if [ -z "$APP" ]; then echo "cannot find nlo app dir"; exit 1; fi
cd "$APP"
ASSETS=".output/public/assets"
real=$(ls -1S "$ASSETS"/styles-*.css 2>/dev/null | head -1 || true)
if [ -z "$real" ]; then echo "no styles-*.css found"; exit 1; fi
echo "canonical=$real"
# Known stale hashes that have 404'd in production
for want in styles-DQ7Ck8aS.css styles-BKgiEo2E.css styles-B46k0CM4.css styles-M8raEoX9.css; do
  dest="$ASSETS/$want"
  if [ ! -f "$dest" ]; then
    cp "$real" "$dest"
    echo "created $want"
  else
    echo "exists $want"
  fi
done
# Also copy under any hash still referenced by SSR router bundles
if command -v grep >/dev/null; then
  refs=$(grep -rhoE 'styles-[A-Za-z0-9_-]+\.css' .output/server 2>/dev/null | sort -u || true)
  for name in $refs; do
    dest="$ASSETS/$name"
    if [ ! -f "$dest" ]; then
      cp "$real" "$dest"
      echo "created $name (from SSR ref)"
    fi
  done
fi
echo "FOUC fix applied — hard-refresh https://nlo.gg (no restart needed)"
