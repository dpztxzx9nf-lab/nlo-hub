#!/bin/bash
# Switch nlo.gg from Stripe TEST keys to LIVE keys and register the webhook.
# Hetzner-console safe. Do not put the key on the command line.
#
# 1) https://dashboard.stripe.com/apikeys  (toggle to Live)
# 2) Copy the Secret key (sk_live_...)
# 3) On the VPS:
#      nano /opt/nlo/stripe.live
#    paste one line, save
# 4) bash /opt/nlo/app/deploy/go-live-stripe.sh
set -euo pipefail

ENV_FILE=/opt/nlo/nlo.env
KEY_FILE=/opt/nlo/stripe.live
mkdir -p /opt/nlo
touch "$ENV_FILE"
chmod 600 "$ENV_FILE"

python3 - <<'PY'
from pathlib import Path
import json, os, urllib.parse, urllib.request

env_path = Path("/opt/nlo/nlo.env")
key_file = Path("/opt/nlo/stripe.live")
env_key = os.environ.get("STRIPE_SECRET_KEY", "").strip()
file_key = key_file.read_text().strip() if key_file.exists() else ""
key = env_key or file_key
if not key.startswith("sk_live_"):
    raise SystemExit("need sk_live_ in /opt/nlo/stripe.live (one line) or STRIPE_SECRET_KEY")

def stripe(method, path, body=None):
    data = urllib.parse.urlencode(body, doseq=True).encode() if body is not None else None
    req = urllib.request.Request(
        "https://api.stripe.com/v1/" + path,
        data=data,
        method=method,
        headers={"Authorization": "Bearer " + key},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            return json.loads(res.read().decode())
    except urllib.error.HTTPError as err:
        detail = err.read().decode("utf-8", "replace")
        raise SystemExit("Stripe " + path + " failed: " + str(err.code) + " " + detail[:300])

acct = stripe("GET", "account")
print("stripe_account", acct.get("id", ""), "charges_enabled", acct.get("charges_enabled"))
bal = stripe("GET", "balance")
if bal.get("object") != "balance":
    raise SystemExit("live key did not return a Stripe balance")
print("stripe_live_key_ok")

webhook_url = "https://nlo.gg/api/stripe/webhook"
listed = stripe("GET", "webhook_endpoints?limit=100")
existing = None
for row in listed.get("data", []):
    if row.get("url") == webhook_url:
        existing = row
        break
secret = ""
if existing:
    print("webhook_exists", existing.get("id"))
else:
    created = stripe("POST", "webhook_endpoints", {
        "url": webhook_url,
        "enabled_events[]": "checkout.session.completed",
        "description": "NLO shop coin grants",
    })
    secret = str(created.get("secret") or "")
    print("webhook_created", created.get("id"))

lines = env_path.read_text().splitlines() if env_path.exists() else []
def upsert(name, value):
    global lines
    out = []
    found = False
    for line in lines:
        if line.startswith(name + "="):
            out.append(name + "=" + value)
            found = True
        else:
            out.append(line)
    if not found:
        out.append(name + "=" + value)
    lines = out

upsert("STRIPE_SECRET_KEY", key)
if secret:
    upsert("STRIPE_WEBHOOK_SECRET", secret)
env_path.write_text("\n".join(lines) + "\n")
env_path.chmod(0o600)
if key_file.exists():
    key_file.unlink()
print("wrote /opt/nlo/nlo.env (live key" + (", webhook secret" if secret else ", existing webhook") + ")")
PY

echo "== provision remaining secrets =="
python3 /opt/nlo/app/deploy/provision-nlo-env.py

cp /opt/nlo/app/deploy/nlo.service /etc/systemd/system/nlo.service
systemctl daemon-reload
systemctl restart nlo
sleep 2
systemctl is-active nlo
echo done
echo Shop on https://nlo.gg/shop now charges real cards.
echo 4242 test cards will fail.
