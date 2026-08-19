#!/bin/bash
# Full production fix for nlo.gg — no manual steps.
# Run:  bash deploy/fix-all.sh
set -euo pipefail

APP=""
for d in /opt/nlo/app /opt/nlo /root/nlo-hub; do
  if [ -d "$d/.git" ] || [ -f "$d/package.json" ]; then APP="$d"; break; fi
done
if [ -z "$APP" ]; then
  echo "cannot find nlo app dir"
  exit 1
fi
cd "$APP"
echo "app=$APP"

echo "== git =="
if command -v git >/dev/null && [ -d .git ]; then
  git fetch origin main || true
  git reset --hard origin/main || true
fi

echo "== npm install =="
if command -v npm >/dev/null; then
  npm install --no-fund --no-audit
else
  echo "npm not found"; exit 1
fi

echo "== build (node-server) =="
# Preset is set inside the npm script — do not pass env on the CLI (Hetzner console breaks it)
npm run build:box

echo "== css hash sync =="
if [ -f scripts/sync-css-hash.mjs ]; then
  node scripts/sync-css-hash.mjs || true
fi

echo "== strip leftover mock-list text =="
python3 - <<'PY'
from pathlib import Path
root = Path(".output")
if not root.exists():
    print("no .output — skip strip")
    raise SystemExit(0)
needles = [
    " — not a mock list.",
    " - not a mock list.",
    "— not a mock list.",
    "not a mock list.",
    "not a mock list",
]
count = 0
for p in root.rglob("*"):
    if p.suffix not in {".mjs", ".js", ".html"}:
        continue
    try:
        t = p.read_text(encoding="utf-8")
    except Exception:
        continue
    n = t
    for s in needles:
        n = n.replace(s, "")
    if n != t:
        p.write_text(n, encoding="utf-8")
        print("patched", p)
        count += 1
print("strip_files=", count)
PY

echo "== internal secret / stripe webhook / auth secret =="
python3 "$APP/deploy/provision-nlo-env.py"

echo "== pglite data dir =="
mkdir -p /opt/nlo/pglite

echo "== caddy www → apex =="
if [ -f "$APP/deploy/Caddyfile" ] && [ -d /etc/caddy ]; then
  cp "$APP/deploy/Caddyfile" /etc/caddy/Caddyfile
  if command -v systemctl >/dev/null; then
    systemctl reload caddy 2>/dev/null || systemctl reload caddy.service 2>/dev/null || true
  fi
  echo "caddy reloaded"
else
  echo "caddy skip"
fi

echo "== restart =="
systemctl restart nlo 2>/dev/null || systemctl restart nlo.service 2>/dev/null || true
sleep 3
systemctl is-active nlo 2>/dev/null || true
curl -sS --max-time 8 http://127.0.0.1:3000/api/shop/status || true
echo

echo "== verify =="
if grep -r "mock list" .output 2>/dev/null | head -3; then
  echo "WARNING: mock list still present in .output"
else
  echo "ok: no mock list in .output"
fi

echo "done — open https://nlo.gg in a Private browser tab"
