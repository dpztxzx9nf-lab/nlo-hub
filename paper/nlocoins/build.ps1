Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MinecraftRoots = @(
    (Join-Path $ProjectDir '..\..\..'),
    (Join-Path $ProjectDir '..\..\..\Minecraft'),
    'C:\Projects\Minecraft'
)
$ServerDir = ''
foreach ($root in $MinecraftRoots) {
    $candidateRoot = $null
    try { $candidateRoot = (Resolve-Path $root -ErrorAction Stop).Path } catch { continue }
    $maybeServer = Join-Path $candidateRoot 'servers\nlo-local'
    if (Test-Path -LiteralPath $maybeServer) {
        $ServerDir = $maybeServer
        break
    }
}
$VersionJar = ''
if ($ServerDir) {
    foreach ($candidate in @(
            (Join-Path $ServerDir 'versions\26.2\paper-26.2.jar'),
            (Join-Path $ServerDir 'versions\26.1.2\paper-26.1.2.jar')
        )) {
        if (Test-Path -LiteralPath $candidate) {
            $VersionJar = $candidate
            break
        }
    }
}
if (-not $VersionJar) {
    throw "Paper version jar not found. Build on the machine that has nlo-local."
}

$BuildDir = Join-Path $ProjectDir 'build'
$ClassesDir = Join-Path $BuildDir 'classes'
$JarPath = Join-Path $BuildDir 'NLOCoins-1.0.0.jar'
$JdkBin = 'C:\Program Files\Java\jdk-25\bin'
$Javac = if (Test-Path (Join-Path $JdkBin 'javac.exe')) { Join-Path $JdkBin 'javac.exe' } else { 'javac' }
$JarTool = if (Test-Path (Join-Path $JdkBin 'jar.exe')) { Join-Path $JdkBin 'jar.exe' } else { 'jar' }

if (Test-Path -LiteralPath $BuildDir) {
    Remove-Item -LiteralPath $BuildDir -Recurse -Force
}
New-Item -ItemType Directory -Path $ClassesDir | Out-Null

$JavaSources = @(Get-ChildItem -Path (Join-Path $ProjectDir 'src\main\java') -Recurse -Filter '*.java' |
    Sort-Object FullName |
    ForEach-Object { $_.FullName })
if ($JavaSources.Count -eq 0) {
    throw 'No Java source files found.'
}

$JavaSourcesFile = Join-Path $BuildDir 'java-sources.args'
[IO.File]::WriteAllLines(
    $JavaSourcesFile,
    @($JavaSources | ForEach-Object { '"' + $_.Replace('\', '/') + '"' }),
    [Text.UTF8Encoding]::new($false)
)
$LibrariesDir = Join-Path $ServerDir 'libraries'
$ClasspathJars = @($VersionJar)
if (Test-Path -LiteralPath $LibrariesDir) {
    $ClasspathJars += @(Get-ChildItem -Path $LibrariesDir -Recurse -Filter '*.jar' | ForEach-Object { $_.FullName })
}
$Classpath = $ClasspathJars -join [IO.Path]::PathSeparator
& $Javac -encoding UTF-8 --release 21 -classpath $Classpath -d $ClassesDir "@$JavaSourcesFile"
if ($LASTEXITCODE -ne 0) {
    throw "javac failed with exit code $LASTEXITCODE"
}

$ResourcesDir = Join-Path $ProjectDir 'src\main\resources'
Copy-Item -Path (Join-Path $ResourcesDir '*') -Destination $ClassesDir -Recurse

Push-Location $ClassesDir
try {
    & $JarTool cf $JarPath .
    if ($LASTEXITCODE -ne 0) {
        throw "jar failed with exit code $LASTEXITCODE"
    }
} finally {
    Pop-Location
}

$TestDir = Join-Path $BuildDir 'test-classes'
New-Item -ItemType Directory -Path $TestDir | Out-Null
$TestSources = @(Get-ChildItem -Path (Join-Path $ProjectDir 'src\test\java') -Recurse -Filter '*.java' |
    Sort-Object FullName |
    ForEach-Object { $_.FullName })
$TestSourcesFile = Join-Path $BuildDir 'java-test-sources.args'
[IO.File]::WriteAllLines(
    $TestSourcesFile,
    @($TestSources | ForEach-Object { '"' + $_.Replace('\', '/') + '"' }),
    [Text.UTF8Encoding]::new($false)
)
& $Javac -encoding UTF-8 --release 21 -classpath ($Classpath + [IO.Path]::PathSeparator + $ClassesDir) -d $TestDir "@$TestSourcesFile"
if ($LASTEXITCODE -ne 0) {
    throw "test javac failed with exit code $LASTEXITCODE"
}
$Java = if (Test-Path (Join-Path $JdkBin 'java.exe')) { Join-Path $JdkBin 'java.exe' } else { 'java' }
foreach ($testClass in @('io.nlo.coins.IgnNamesTest', 'io.nlo.coins.GrantModelsTest', 'io.nlo.coins.EconomyDepositTest')) {
    & $Java -classpath ($Classpath + [IO.Path]::PathSeparator + $ClassesDir + [IO.Path]::PathSeparator + $TestDir) $testClass
    if ($LASTEXITCODE -ne 0) {
        throw "$testClass failed"
    }
}

$PluginsDir = Join-Path $ServerDir 'plugins'
if (Test-Path -LiteralPath $PluginsDir) {
    Copy-Item -LiteralPath $JarPath -Destination (Join-Path $PluginsDir 'NLOCoins-1.0.0.jar') -Force
    Write-Output "Installed $(Join-Path $PluginsDir 'NLOCoins-1.0.0.jar')"
}

Write-Output "Built $JarPath"
