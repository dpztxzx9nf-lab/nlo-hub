#!/bin/bash
set -e
cd /opt/nlo/app
mkdir -p .output/public/__grok public/__grok
for size in 180 192 512; do
  if [ -f "deploy/icon-${size}.b64" ]; then
    base64 -d "deploy/icon-${size}.b64" > ".output/public/__grok/icon-${size}.png"
    cp ".output/public/__grok/icon-${size}.png" "public/__grok/icon-${size}.png" 2>/dev/null || true
    echo "installed icon-${size}.png"
  fi
done
cp .output/public/__grok/icon-180.png .output/public/apple-touch-icon.png 2>/dev/null || true
cp .output/public/__grok/icon-180.png public/apple-touch-icon.png 2>/dev/null || true
ls -l .output/public/__grok/icon-*.png 2>/dev/null || true
echo done
