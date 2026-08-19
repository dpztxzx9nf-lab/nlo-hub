#!/bin/bash
# Wire NLO_INTERNAL_SECRET, keep Stripe, restart hub.
# Safe for the Hetzner console: no pipes in the command line, no VAR=value prefix required.
# Run:  bash /opt/nlo/app/deploy/setup-coin-bridge.sh
set -euo pipefail

ENV_FILE=/opt/nlo/nlo.env
mkdir -p /opt/nlo
touch "$ENV_FILE"
chmod 600 "$ENV_FILE"

python3 - <<'PY'
from pathlib import Path
import os
import secrets

path = Path("/opt/nlo/nlo.env")
lines = path.read_text().splitlines() if path.exists() else []
keys = {}
order = []
for line in lines:
    if not line.strip() or line.lstrip().startswith("#") or "=" not in line:
        order.append(("raw", line))
        continue
    name, value = line.split("=", 1)
    keys[name] = value
    order.append(("kv", name))

def set_key(name, value, replace_placeholders=False):
    current = keys.get(name, "")
    if name in keys and current and not (
        replace_placeholders and current.startswith("replace-")
    ):
        return
    keys[name] = value
    if name not in {item[1] for item in order if item[0] == "kv"}:
        order.append(("kv", name))

set_key("BETTER_AUTH_URL", "https://nlo.gg")
if "NLO_INTERNAL_SECRET" not in keys or not keys["NLO_INTERNAL_SECRET"].strip() or keys["NLO_INTERNAL_SECRET"].startswith("replace-"):
    set_key("NLO_INTERNAL_SECRET", secrets.token_hex(32), replace_placeholders=True)

out = []
seen = set()
for kind, value in order:
    if kind == "raw":
        out.append(value)
        continue
    if value in seen:
        continue
    seen.add(value)
    out.append(value + "=" + keys[value])
for name, value in keys.items():
    if name not in seen:
        out.append(name + "=" + value)
path.write_text("\n".join(out) + "\n")
secret = keys.get("NLO_INTERNAL_SECRET", "")
print("env_file", path)
print("has_stripe", any(l.startswith("STRIPE_SECRET_KEY=sk_") for l in path.read_text().splitlines()))
print("has_internal_secret", bool(secret) and not secret.startswith("replace-"))
PY

UNIT_SRC=""
for d in /opt/nlo/app /opt/nlo; do
  if [ -f "$d/deploy/nlo.service" ]; then UNIT_SRC="$d/deploy/nlo.service"; break; fi
  if [ -f "$d/nlo.service" ]; then UNIT_SRC="$d/nlo.service"; break; fi
done
if [ -n "$UNIT_SRC" ]; then
  cp "$UNIT_SRC" /etc/systemd/system/nlo.service
  systemctl daemon-reload
fi
systemctl restart nlo
sleep 2
systemctl is-active nlo

echo done
echo open https://nlo.gg/shop
echo then install the Paper plugin with bash deploy/install-nlocoins.sh
