#!/bin/bash
# Copy NLOCoins.jar onto the Paper plugins folder on this box.
# Run after building paper/nlocoins on a machine with JDK + Paper:
#   bash /opt/nlo/app/deploy/install-nlocoins.sh
set -euo pipefail

APP=""
for d in /opt/nlo/app /opt/nlo /root/nlo-hub; do
  if [ -d "$d/paper/nlocoins" ] || [ -f "$d/package.json" ]; then APP="$d"; break; fi
done
if [ -z "$APP" ]; then
  echo "cannot find nlo app dir"
  exit 1
fi

JAR=""
for f in \
  "$APP/paper/nlocoins/build/NLOCoins-1.0.0.jar" \
  "$APP/paper/nlocoins/NLOCoins-1.0.0.jar" \
  /opt/nlo/NLOCoins-1.0.0.jar
do
  if [ -f "$f" ]; then JAR="$f"; break; fi
done
if [ -z "$JAR" ]; then
  echo "NLOCoins-1.0.0.jar not found. Build paper/nlocoins/build.ps1 first and copy the jar here."
  exit 2
fi

PLUGINS=""
for d in \
  /opt/nlo/paper/plugins \
  /opt/paper/plugins \
  /root/nlo-local/plugins \
  /opt/nlo/server/plugins \
  /opt/minecraft/plugins
do
  if [ -d "$d" ]; then PLUGINS="$d"; break; fi
done
if [ -z "$PLUGINS" ]; then
  echo "Paper is not on this VPS."
  echo "Live Paper is the Dell G15: C:\\Projects\\Minecraft\\servers\\nlo-local\\plugins"
  echo "On that machine run: powershell -File deploy/install-nlocoins-dell.ps1"
  echo "Or copy $JAR there and queue: plugman reload NLOCoins"
  exit 3
fi

cp "$JAR" "$PLUGINS/NLOCoins-1.0.0.jar"
echo "installed $PLUGINS/NLOCoins-1.0.0.jar"
echo "restart Paper or run: plugman load NLOCoins"
echo "plugin reads NLO_INTERNAL_SECRET from /opt/nlo/nlo.env"
