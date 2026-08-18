#!/bin/bash
# Apply fiery icons + dual-host player ping on the Hetzner box.
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

mkdir -p .output/public/__grok public/__grok
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

python3 - <<'PY'
from pathlib import Path
import re
roots = [Path('.output/server'), Path('.output')]
patched = 0
for root in roots:
    if not root.exists():
        continue
    for p in root.rglob('*.mjs'):
        t = p.read_text(errors='ignore')
        if 'mcstatus.io' not in t:
            continue
        orig = t
        t = t.replace(
            'https://api.mcstatus.io/v2/status/java/nlo.gg',
            'https://api.mcstatus.io/v2/status/java/5.78.90.11',
        )
        t = t.replace('AbortSignal.timeout(4e3)', 'AbortSignal.timeout(8e3)')
        t = t.replace('AbortSignal.timeout(4000)', 'AbortSignal.timeout(8000)')
        if t != orig:
            p.write_text(t)
            print('patched', p)
            patched += 1
print('files_patched', patched)
PY

systemctl restart nlo || systemctl restart nlo.service || true
sleep 2
systemctl is-active nlo || true
echo done
