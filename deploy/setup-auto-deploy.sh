#!/bin/bash
# One-time: allow GitHub Actions to SSH in and deploy.
# Run on the Hetzner box:  bash deploy/setup-auto-deploy.sh
set -euo pipefail

mkdir -p /root/.ssh
chmod 700 /root/.ssh
touch /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

PUB='ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIACuWATTp7ZmxqR9BJ2Znw6Su+TpArryNL6uRaRgtPQD nlo-gg-github-actions-deploy'

if grep -qF "nlo-gg-github-actions-deploy" /root/.ssh/authorized_keys 2>/dev/null; then
  echo "deploy key already installed"
else
  echo "$PUB" >> /root/.ssh/authorized_keys
  echo "deploy key installed"
fi

# Ensure app dir exists and is a git checkout of nlo-hub
APP=/opt/nlo/app
if [ ! -d "$APP/.git" ]; then
  echo "WARNING: $APP is not a git repo — deploys expect it there"
else
  echo "app ok: $APP"
  git -C "$APP" remote -v || true
fi

# Ensure systemd service exists
if systemctl cat nlo >/dev/null 2>&1; then
  echo "nlo.service ok"
else
  echo "WARNING: nlo.service not found"
fi

echo "done — add the private key as GitHub secret DEPLOY_SSH_KEY, then push to main"
