# Install NLOCoins on the live Dell Paper box (not the Hetzner hub).
# Does not restart PM2/Paper. Reloads via the existing stdin queue.
# Run from the Dell:
#   powershell -NoProfile -ExecutionPolicy Bypass -File C:\Projects\Minecraft\nlo-hub\deploy\install-nlocoins-dell.ps1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$HubRepo = 'C:\Projects\Minecraft\nlo-hub'
$Plugins = 'C:\Projects\Minecraft\servers\nlo-local\plugins'
$Queue = 'C:\Projects\Minecraft\servers\nlo-local\logs\pm2\paper-stdin.queue'
$SshKey = 'C:\Users\Golf\.ssh\nlo_hetzner_ed25519'
$Jar = Join-Path $HubRepo 'paper\nlocoins\NLOCoins-1.0.0.jar'
if (-not (Test-Path -LiteralPath $Jar)) {
    $Jar = Join-Path $HubRepo 'paper\nlocoins\build\NLOCoins-1.0.0.jar'
}
if (-not (Test-Path -LiteralPath $Jar)) {
    throw "NLOCoins jar not found under $HubRepo\paper\nlocoins"
}

$nloDir = Join-Path $Plugins 'NLOCoins'
New-Item -ItemType Directory -Force -Path $nloDir | Out-Null
Copy-Item -Force $Jar (Join-Path $Plugins 'NLOCoins-1.0.0.jar')

$line = ssh -i $SshKey -o BatchMode=yes -o ConnectTimeout=10 root@5.78.90.11 "grep ^NLO_INTERNAL_SECRET= /opt/nlo/nlo.env"
if (-not $line -or $line -notmatch '^NLO_INTERNAL_SECRET=([0-9a-fA-F]{32,})$') {
    throw 'Could not read NLO_INTERNAL_SECRET from the hub box.'
}
$secret = $Matches[1]
Set-Content -LiteralPath (Join-Path $nloDir 'nlo.env') -Value "NLO_INTERNAL_SECRET=$secret" -Encoding ascii
@"
hub-url: https://nlo.gg
internal-secret: $secret
secret-file: plugins/NLOCoins/nlo.env
poll-seconds: 15
join-delay-ticks: 40
gameplay-db: plugins/NLOP/gameplay.db
"@ | Set-Content -LiteralPath (Join-Path $nloDir 'config.yml') -Encoding ascii

New-Item -ItemType Directory -Force -Path (Split-Path $Queue) | Out-Null
Add-Content -LiteralPath $Queue -Value 'plugman reload NLOCoins' -Encoding ascii
Write-Output "installed $(Join-Path $Plugins 'NLOCoins-1.0.0.jar')"
Write-Output 'queued plugman reload NLOCoins (no Paper restart)'
