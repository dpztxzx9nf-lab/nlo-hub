#!/usr/bin/env python3
"""Idempotent /opt/nlo/nlo.env + Stripe webhook for nlo.gg.

Never prints secret values. Safe to run on every deploy.
"""
from __future__ import annotations

import base64
import json
import os
import secrets
import ssl
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ENV_PATH = Path(os.environ.get("NLO_ENV_FILE", "/opt/nlo/nlo.env"))
WEBHOOK_URL = "https://nlo.gg/api/stripe/webhook"
CTX = ssl.create_default_context()


def parse_lines(text: str) -> list[str]:
    return text.splitlines()


def get_key(lines: list[str], name: str) -> str:
    prefix = name + "="
    for line in lines:
        if line.startswith(prefix):
            return line[len(prefix) :].strip()
    return ""


def is_placeholder(value: str) -> bool:
    lowered = value.lower()
    return (not value) or lowered.startswith("replace") or "replace_me" in lowered or "replace-me" in lowered


def set_key(lines: list[str], name: str, value: str, *, overwrite: bool = False) -> list[str]:
    prefix = name + "="
    out: list[str] = []
    found = False
    for line in lines:
        if line.startswith(prefix):
            current = line[len(prefix) :].strip()
            if overwrite or is_placeholder(current):
                out.append(f"{name}={value}")
            else:
                out.append(line)
            found = True
        else:
            out.append(line)
    if not found:
        if out and out[-1].strip():
            out.append("")
        out.append(f"{name}={value}")
    return out


def valid_stripe_secret(key: str) -> bool:
    return (key.startswith("sk_live_") or key.startswith("sk_test_")) and not is_placeholder(key)


def stripe(method: str, path: str, secret: str, data: dict[str, str] | None = None) -> dict:
    url = "https://api.stripe.com/v1/" + path.lstrip("/")
    body = urllib.parse.urlencode(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=body, method=method)
    token = base64.b64encode(f"{secret}:".encode()).decode()
    req.add_header("Authorization", f"Basic {token}")
    if data is not None:
        req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urllib.request.urlopen(req, timeout=25, context=CTX) as res:
            raw = res.read().decode()
    except urllib.error.HTTPError as err:
        raw = err.read().decode(errors="replace")
        raise SystemExit(f"stripe {method} {path} HTTP {err.code}") from None
    parsed = json.loads(raw) if raw else {}
    if not isinstance(parsed, dict):
        raise SystemExit(f"stripe {method} {path} returned a non-object")
    return parsed


def list_webhooks(secret: str) -> list[dict]:
    data = stripe("GET", "webhook_endpoints?limit=100", secret)
    items = data.get("data")
    if not isinstance(items, list):
        return []
    return [item for item in items if isinstance(item, dict)]


def ensure_webhook(lines: list[str], secret: str) -> list[str]:
    existing_secret = get_key(lines, "STRIPE_WEBHOOK_SECRET")
    have_secret = existing_secret.startswith("whsec_") and not is_placeholder(existing_secret)
    endpoints = [
        item
        for item in list_webhooks(secret)
        if str(item.get("url") or "") == WEBHOOK_URL
    ]
    live = [item for item in endpoints if not item.get("disabled")]
    if have_secret and live:
        print("stripe_webhook present")
        return lines
    for item in endpoints:
        endpoint_id = str(item.get("id") or "")
        if endpoint_id.startswith("we_"):
            stripe("DELETE", f"webhook_endpoints/{endpoint_id}", secret)
            print("stripe_webhook replaced")
    created = stripe(
        "POST",
        "webhook_endpoints",
        secret,
        {
            "url": WEBHOOK_URL,
            "enabled_events[0]": "checkout.session.completed",
            "description": "nlo.gg coin shop",
        },
    )
    signing = str(created.get("secret") or "")
    if not signing.startswith("whsec_"):
        raise SystemExit("stripe webhook create did not return a signing secret")
    print("stripe_webhook created")
    return set_key(lines, "STRIPE_WEBHOOK_SECRET", signing, overwrite=True)


def main() -> None:
    ENV_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not ENV_PATH.exists():
        ENV_PATH.write_text("")
        ENV_PATH.chmod(0o600)
    lines = parse_lines(ENV_PATH.read_text() if ENV_PATH.exists() else "")

    lines = set_key(lines, "BETTER_AUTH_URL", "https://nlo.gg")
    if is_placeholder(get_key(lines, "BETTER_AUTH_SECRET")):
        lines = set_key(lines, "BETTER_AUTH_SECRET", secrets.token_hex(32), overwrite=True)
        print("wrote BETTER_AUTH_SECRET")
    else:
        print("BETTER_AUTH_SECRET present")

    if is_placeholder(get_key(lines, "NLO_INTERNAL_SECRET")):
        lines = set_key(lines, "NLO_INTERNAL_SECRET", secrets.token_hex(32), overwrite=True)
        print("wrote NLO_INTERNAL_SECRET")
    else:
        print("NLO_INTERNAL_SECRET present")

    lines = set_key(lines, "PGLITE_DATA_DIR", "/opt/nlo/pglite")

    stripe_key = get_key(lines, "STRIPE_SECRET_KEY")
    if valid_stripe_secret(stripe_key):
        try:
            lines = ensure_webhook(lines, stripe_key)
        except SystemExit as err:
            print("stripe_webhook skip:", err)
    else:
        print("stripe_webhook skip: no Stripe secret key")

    ENV_PATH.write_text("\n".join(lines) + "\n")
    ENV_PATH.chmod(0o600)
    print("env_file", ENV_PATH)
    print("has_stripe", valid_stripe_secret(get_key(lines, "STRIPE_SECRET_KEY")))
    print("has_webhook", get_key(lines, "STRIPE_WEBHOOK_SECRET").startswith("whsec_"))
    print("has_grok_auth", bool(get_key(lines, "GROK_AUTH_CLIENT_ID") and get_key(lines, "GROK_AUTH_CLIENT_SECRET")) and not is_placeholder(get_key(lines, "GROK_AUTH_CLIENT_ID")))


if __name__ == "__main__":
    main()
