#!/bin/bash
# Pull latest hub, rebuild, sync CSS hashes (prevents FOUC), copy icons, restart nlo.
# Run as a single script — no && needed in the Hetzner console.
set -euo pipefail
APP=""
for d in /opt/nlo/app /opt/nlo /root/nlo-hub; do
  if [ -d "$d/.output" ] || [ -f "$d/package.json" ]; then APP="$d"; break; fi
done
if [ -z "$APP" ]; then
  echo "cannot find nlo app dir"; exit 1
fi
cd "$APP"
echo "app=$APP"

if command -v git >/dev/null && [ -d .git ]; then
  git fetch origin main || true
  git reset --hard origin/main || git pull --ff-only || true
fi

mkdir -p .output/public/__grok public/__grok .output/public/assets
BASE="https://raw.githubusercontent.com/dpztxzx9nf-lab/nlo-hub/main"
for name in icon-180.png icon-192.png icon-512.png nlo-180.png nlo-192.png nlo-512.png; do
  if [ -f "public/__grok/$name" ]; then
    cp "public/__grok/$name" ".output/public/__grok/$name"
  else
    curl -fsSL "$BASE/public/__grok/$name" -o ".output/public/__grok/$name" || true
    cp ".output/public/__grok/$name" "public/__grok/$name" 2>/dev/null || true
  fi
done
if [ -f .output/public/__grok/nlo-180.png ]; then
  cp .output/public/__grok/nlo-180.png .output/public/apple-touch-icon.png
fi

if [ -f package.json ] && command -v npm >/dev/null; then
  echo "rebuilding hub"
  npm run build:box || true
fi

# Always mirror CSS so any stale SSR hash still resolves (FOUC fix)
if [ -f scripts/sync-css-hash.mjs ]; then
  node scripts/sync-css-hash.mjs || true
else
  # fallback: copy the real styles-*.css to every other styles-*.css name the HTML might ask for
  real=$(ls -1 .output/public/assets/styles-*.css 2>/dev/null | head -1 || true)
  if [ -n "$real" ]; then
    for want in styles-DQ7Ck8aS.css styles-BKgiEo2E.css styles-B46k0CM4.css; do
      dest=".output/public/assets/$want"
      if [ ! -f "$dest" ]; then
        cp "$real" "$dest"
        echo "mirrored $(basename "$real") -> $want"
      fi
    done
  fi
fi

systemctl restart nlo || systemctl restart nlo.service || true
sleep 2
systemctl is-active nlo || true
echo done
