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

echo "== internal secret =="
python3 - <<'PY'
from pathlib import Path
import secrets
path = Path("/opt/nlo/nlo.env")
path.parent.mkdir(parents=True, exist_ok=True)
text = path.read_text() if path.exists() else ""
lines = text.splitlines()
if not any(line.startswith("NLO_INTERNAL_SECRET=") and line.split("=", 1)[1].strip() and not line.split("=", 1)[1].startswith("replace-") for line in lines):
    secret = secrets.token_hex(32)
    if any(line.startswith("NLO_INTERNAL_SECRET=") for line in lines):
        lines = ["NLO_INTERNAL_SECRET=" + secret if line.startswith("NLO_INTERNAL_SECRET=") else line for line in lines]
    else:
        if lines and lines[-1].strip():
            lines.append("")
        lines.append("NLO_INTERNAL_SECRET=" + secret)
    path.write_text("\n".join(lines) + "\n")
    path.chmod(0o600)
    print("wrote NLO_INTERNAL_SECRET")
else:
    print("NLO_INTERNAL_SECRET present")
PY

echo "== pglite data dir =="
mkdir -p /opt/nlo/pglite
python3 - <<'PY'
from pathlib import Path
path = Path("/opt/nlo/nlo.env")
lines = path.read_text().splitlines() if path.exists() else []
if not any(line.startswith("PGLITE_DATA_DIR=") for line in lines):
    if lines and lines[-1].strip():
        lines.append("")
    lines.append("PGLITE_DATA_DIR=/opt/nlo/pglite")
    path.write_text("\n".join(lines) + "\n")
    path.chmod(0o600)
    print("wrote PGLITE_DATA_DIR")
else:
    print("PGLITE_DATA_DIR present")
PY

echo "== restart =="
systemctl restart nlo 2>/dev/null || systemctl restart nlo.service 2>/dev/null || true
sleep 2
systemctl is-active nlo 2>/dev/null || true

echo "== verify =="
if grep -r "mock list" .output 2>/dev/null | head -3; then
  echo "WARNING: mock list still present in .output"
else
  echo "ok: no mock list in .output"
fi

echo "done — open https://nlo.gg in a Private browser tab"
