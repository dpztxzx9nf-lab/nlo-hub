#!/bin/bash
# Fix nlo.gg showing 0 players when people are online.
# Run on the Hetzner box as root:
#   bash /opt/nlo/app/deploy/fix-player-count.sh
set -e
cd /opt/nlo/app
FILE=".output/server/_ssr/server-DWl-BcdL.mjs"
if [ ! -f "$FILE" ]; then
  echo "missing $FILE"
  exit 1
fi
cp "$FILE" "$FILE.bak.$(date +%s)"

python3 - "$FILE" <<'PY'
import sys
from pathlib import Path
p = Path(sys.argv[1])
t = p.read_text()
if "5.78.90.11" in t and "pingOne" in t:
    print("already patched")
    raise SystemExit(0)

old = (
    'async function pingJava() {\n'
    '\tconst res = await fetch("https://api.mcstatus.io/v2/status/java/nlo.gg", { signal: AbortSignal.timeout(4e3) });\n'
    '\tif (!res.ok) throw new Error("status");\n'
    '\tconst data = await res.json();\n'
    '\tconst sample = (data.players?.list ?? []).map((p) => {\n'
    '\t\tconst ign = (p.name_clean || p.name_raw || "").trim();\n'
    '\t\tif (!ign) return null;\n'
    '\t\treturn {\n'
    '\t\t\tign,\n'
    '\t\t\tuuid: p.uuid ?? null\n'
    '\t\t};\n'
    '\t}).filter((p) => Boolean(p));\n'
    '\treturn {\n'
    '\t\tstatus: {\n'
    '\t\t\tonline: Boolean(data.online),\n'
    '\t\t\tplayers: data.players?.online ?? sample.length,\n'
    '\t\t\tmax: data.players?.max ?? 16,\n'
    '\t\t\tversion: data.version?.name_clean ?? "26.2",\n'
    '\t\t\tmotd: data.motd?.clean?.replace(/\\s+/g, " ").trim() ?? null,\n'
    '\t\t\tchecked: true\n'
    '\t\t},\n'
    '\t\tsample\n'
    '\t};\n'
    '}'
)

new = (
    'async function pingOne(host) {\n'
    '\tconst res = await fetch(`https://api.mcstatus.io/v2/status/java/${host}`, {\n'
    '\t\tsignal: AbortSignal.timeout(8e3),\n'
    '\t\theaders: { Accept: "application/json" }\n'
    '\t});\n'
    '\tif (!res.ok) throw new Error("status " + res.status);\n'
    '\tconst data = await res.json();\n'
    '\tconst sample = (data.players?.list ?? []).map((p) => {\n'
    '\t\tconst ign = (p.name_clean || p.name_raw || "").trim();\n'
    '\t\tif (!ign) return null;\n'
    '\t\treturn {\n'
    '\t\t\tign,\n'
    '\t\t\tuuid: p.uuid ?? null\n'
    '\t\t};\n'
    '\t}).filter((p) => Boolean(p));\n'
    '\treturn {\n'
    '\t\tstatus: {\n'
    '\t\t\tonline: Boolean(data.online),\n'
    '\t\t\tplayers: data.players?.online ?? sample.length,\n'
    '\t\t\tmax: data.players?.max ?? 16,\n'
    '\t\t\tversion: data.version?.name_clean ?? "26.2",\n'
    '\t\t\tmotd: data.motd?.clean?.replace(/\\s+/g, " ").trim() ?? null,\n'
    '\t\t\tchecked: true\n'
    '\t\t},\n'
    '\t\tsample\n'
    '\t};\n'
    '}\n'
    'async function pingJava() {\n'
    '\tlet lastErr;\n'
    '\tfor (const host of ["nlo.gg", "5.78.90.11"]) {\n'
    '\t\ttry {\n'
    '\t\t\treturn await pingOne(host);\n'
    '\t\t} catch (e) {\n'
    '\t\t\tlastErr = e;\n'
    '\t\t}\n'
    '\t}\n'
    '\tthrow lastErr instanceof Error ? lastErr : new Error("status");\n'
    '}'
)

if old not in t:
    raise SystemExit("pingJava pattern not found — file may already differ")
p.write_text(t.replace(old, new, 1))
print("patched pingJava with dual-host fallback")
PY

systemctl restart nlo
sleep 2
systemctl is-active nlo
echo "Done. Hard-refresh https://nlo.gg — should show live player count."
