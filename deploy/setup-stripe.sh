#!/bin/bash
# Wire Stripe into nlo.gg and restart the hub.
# Usage:
#   STRIPE_SECRET_KEY=sk_live_xxx bash deploy/setup-stripe.sh
# Or edit /opt/nlo/nlo.env first, then:
#   bash deploy/setup-stripe.sh
set -euo pipefail

ENV_FILE=/opt/nlo/nlo.env
UNIT_SRC=""
APP=""
for d in /opt/nlo/app /opt/nlo; do
  if [ -f "$d/deploy/nlo.service" ]; then UNIT_SRC="$d/deploy/nlo.service"; APP="$d"; break; fi
  if [ -f "$d/nlo.service" ]; then UNIT_SRC="$d/nlo.service"; APP="$d"; break; fi
done
if [ -z "$UNIT_SRC" ]; then
  echo "cannot find deploy/nlo.service"
  exit 1
fi

mkdir -p /opt/nlo
touch "$ENV_FILE"
chmod 600 "$ENV_FILE"

# Ensure required keys exist as comments/placeholders
if ! grep -q '^BETTER_AUTH_URL=' "$ENV_FILE" 2>/dev/null; then
  echo 'BETTER_AUTH_URL=https://nlo.gg' >> "$ENV_FILE"
fi

if [ -n "${STRIPE_SECRET_KEY:-}" ]; then
  if grep -q '^STRIPE_SECRET_KEY=' "$ENV_FILE" 2>/dev/null; then
    # replace existing line
    python3 - <<PY
from pathlib import Path
import os
p = Path("$ENV_FILE")
key = os.environ["STRIPE_SECRET_KEY"].strip()
lines = p.read_text().splitlines()
out = []
found = False
for line in lines:
    if line.startswith("STRIPE_SECRET_KEY="):
        out.append("STRIPE_SECRET_KEY=" + key)
        found = True
    else:
        out.append(line)
if not found:
    out.append("STRIPE_SECRET_KEY=" + key)
p.write_text("\n".join(out) + "\n")
print("wrote STRIPE_SECRET_KEY to", p)
PY
  else
    echo "STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}" >> "$ENV_FILE"
    echo "appended STRIPE_SECRET_KEY"
  fi
fi

if ! grep -q '^STRIPE_SECRET_KEY=sk_' "$ENV_FILE" 2>/dev/null; then
  echo ""
  echo "No valid STRIPE_SECRET_KEY in $ENV_FILE yet."
  echo "1) Open https://dashboard.stripe.com/apikeys"
  echo "2) Copy the Secret key (sk_test_… or sk_live_…)"
  echo "3) Re-run:"
  echo "   STRIPE_SECRET_KEY=sk_xxx bash /opt/nlo/app/deploy/setup-stripe.sh"
  exit 2
fi

echo "== provision webhook + auth secret =="
python3 "$(dirname "$0")/provision-nlo-env.py"

# Install unit with EnvironmentFile
cp "$UNIT_SRC" /etc/systemd/system/nlo.service
systemctl daemon-reload
systemctl restart nlo
sleep 2
systemctl is-active nlo

# Quick check that the process sees the key (does not print the key)
python3 - <<'PY'
import subprocess, os
# Cannot easily inspect process env without root /proc; just confirm file
from pathlib import Path
t = Path("/opt/nlo/nlo.env").read_text()
ok = any(l.startswith("STRIPE_SECRET_KEY=sk_") for l in t.splitlines())
print("env_file_has_stripe_key:", ok)
PY

echo "done — open https://nlo.gg/shop while signed in"
echo "Shop should say: Card checkout is live."
echo "Status: https://nlo.gg/api/shop/status"
