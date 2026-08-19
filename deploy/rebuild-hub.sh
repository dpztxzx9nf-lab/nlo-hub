#!/bin/bash
# Clean rebuild of nlo.gg so API routes actually land in .output.
# Hetzner console safe: bash /opt/nlo/app/deploy/rebuild-hub.sh
set -euo pipefail
cd /opt/nlo/app
echo mem
free -m | head -2
echo stopping nlo for RAM
systemctl stop nlo || true
mkdir -p /opt/nlo/pglite
python3 - <<'PY'
from pathlib import Path
p = Path("/opt/nlo/nlo.env")
p.parent.mkdir(parents=True, exist_ok=True)
lines = p.read_text().splitlines() if p.exists() else []
if not any(line.startswith("PGLITE_DATA_DIR=") for line in lines):
    if lines and lines[-1].strip():
        lines.append("")
    lines.append("PGLITE_DATA_DIR=/opt/nlo/pglite")
    p.write_text("\n".join(lines) + "\n")
    p.chmod(0o600)
    print("wrote PGLITE_DATA_DIR")
else:
    print("PGLITE_DATA_DIR present")
PY
rm -rf .output
export NODE_OPTIONS=--max-old-space-size=1536
npm run build:box
python3 -c "from pathlib import Path; t=Path('.output/nitro.json').read_text(); print('nitro_date', t[10:30] if len(t)>30 else t)"
systemctl start nlo
sleep 3
systemctl is-active nlo
curl --max-time 8 -sS -o /tmp/pending.body -w 'pending=%{http_code}\n' http://127.0.0.1:3000/api/internal/coin-grants/pending || echo pending_fail
python3 -c "print(open('/tmp/pending.body','r',encoding='utf-8',errors='ignore').read()[:160])"
echo done
