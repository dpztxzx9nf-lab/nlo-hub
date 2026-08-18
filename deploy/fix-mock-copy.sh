#!/bin/bash
# Strip "not a mock list" from production bundles. Safe to re-run.
set -euo pipefail
APP=""
for d in /opt/nlo/app /opt/nlo /root/nlo-hub; do
  if [ -d "$d/.output" ]; then APP="$d"; break; fi
done
if [ -z "$APP" ]; then
  echo "cannot find nlo app dir"
  exit 1
fi
cd "$APP"
count=0
while IFS= read -r -d '' f; do
  if grep -q 'not a mock list' "$f" 2>/dev/null; then
    sed -i \
      -e 's/ — not a mock list\.//g' \
      -e 's/ - not a mock list\.//g' \
      -e 's/not a mock list\.//g' \
      -e 's/not a mock list//g' \
      "$f"
    echo "patched $f"
    count=$((count + 1))
  fi
done < <(find .output -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.html' \) -print0)

echo "files_patched=$count"
systemctl restart nlo 2>/dev/null || systemctl restart nlo.service 2>/dev/null || true
sleep 1
systemctl is-active nlo 2>/dev/null || true
echo "done — hard-refresh https://nlo.gg"
