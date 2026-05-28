param(
  [string]$SourceAssets = "",
  [string]$OutputApk = ""
)

$ErrorActionPreference = "Stop"

function Check-LastExit([string]$Step) {
  if ($LASTEXITCODE -ne 0) {
    throw "$Step failed with exit code $LASTEXITCODE"
  }
}

$Project = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = (Resolve-Path (Join-Path $Project "..\..")).Path
if ([string]::IsNullOrWhiteSpace($OutputApk)) {
  $OutputApk = Join-Path $Root "snowrain-remake-clean.apk"
}
$Build = Join-Path $Project "build"
$Assets = Join-Path $Project "assets"
$GameAssets = Join-Path $Assets "game"
$PlayerAssets = Join-Path $Assets "player"

if ([string]::IsNullOrWhiteSpace($SourceAssets)) {
  $SourceAssets = $GameAssets
}
if (!(Test-Path -LiteralPath $SourceAssets)) {
  throw "Source assets not found: $SourceAssets"
}

if (!(Resolve-Path $Project).Path.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Project path is outside workspace: $Project"
}

if (Test-Path -LiteralPath $Build) {
  Remove-Item -LiteralPath $Build -Recurse -Force
}
$ResolvedSourceAssets = (Resolve-Path -LiteralPath $SourceAssets).Path
$ResolvedGameAssets = if (Test-Path -LiteralPath $GameAssets) { (Resolve-Path -LiteralPath $GameAssets).Path } else { "" }
$RefreshGameAssets = !($ResolvedSourceAssets.Equals($ResolvedGameAssets, [StringComparison]::OrdinalIgnoreCase))

if ($RefreshGameAssets -and (Test-Path -LiteralPath $GameAssets)) {
  Remove-Item -LiteralPath $GameAssets -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $Build, $GameAssets, $PlayerAssets | Out-Null
if ($RefreshGameAssets) {
  Copy-Item -Path (Join-Path $SourceAssets "*") -Destination $GameAssets -Recurse -Force
}

$ApkRoot = Split-Path -Parent $SourceAssets
$iconSource = Join-Path $ApkRoot "res\drawable-hdpi\icon.png"
New-Item -ItemType Directory -Force -Path (Join-Path $Project "res\drawable") | Out-Null
if (Test-Path -LiteralPath $iconSource) {
  Copy-Item -LiteralPath $iconSource -Destination (Join-Path $Project "res\drawable\icon.png") -Force
} elseif (!(Test-Path -LiteralPath (Join-Path $Project "res\drawable\icon.png"))) {
  throw "Icon source not found: $iconSource"
}

function Get-RelativeAssetList([string]$Folder) {
  $base = Join-Path $GameAssets $Folder
  if (!(Test-Path -LiteralPath $base)) { return @() }
  Get-ChildItem -LiteralPath $base -File |
    Sort-Object Name |
    ForEach-Object { "$Folder/$($_.Name)" }
}

function Get-AssetNameList([string]$Folder) {
  $base = Join-Path $GameAssets $Folder
  if (!(Test-Path -LiteralPath $base)) { return @() }
  Get-ChildItem -LiteralPath $base -File |
    Sort-Object { if ($_.Name -match '^\d+$') { [int]$_.Name } else { [int]::MaxValue } }, Name |
    ForEach-Object { $_.Name }
}

function Get-CharacterMap() {
  $base = Join-Path $GameAssets "character"
  $map = [ordered]@{}
  if (!(Test-Path -LiteralPath $base)) { return $map }
  Get-ChildItem -LiteralPath $base -Directory |
    Sort-Object { if ($_.Name -match '^\d+$') { [int]$_.Name } else { [int]::MaxValue } }, Name |
    ForEach-Object {
      $cloth = Join-Path $_.FullName "Cloth"
      if (Test-Path -LiteralPath $cloth) {
        $map[$_.Name] = @(
          Get-ChildItem -LiteralPath $cloth -File |
            Sort-Object { if ($_.BaseName -match '^\d+$') { [int]$_.BaseName } else { [int]::MaxValue } }, Name |
            ForEach-Object { $_.Name }
        )
      }
    }
  return $map
}

function Get-LoveModeTable() {
  $base = Join-Path $GameAssets "lovemode"
  $table = [ordered]@{}
  if (!(Test-Path -LiteralPath $base)) { return $table }
  Get-ChildItem -LiteralPath $base -File |
    Sort-Object { if ($_.Name -match '^\d+$') { [int]$_.Name } else { [int]::MaxValue } }, Name |
    ForEach-Object {
      $bytes = [System.IO.File]::ReadAllBytes($_.FullName) | ForEach-Object { [int]$_ }
      $table[$_.Name] = @($bytes)
    }
  return $table
}

$scripts = Get-ChildItem -LiteralPath (Join-Path $GameAssets "Scripttxt") -File |
  Sort-Object { if ($_.Name -match '^\d+$') { [int]$_.Name } else { [int]::MaxValue } }, Name |
  ForEach-Object { $_.Name }

$manifest = [ordered]@{
  title = [ordered]@{
    background = "title/titlebg.png"
    logo = "title/title.png"
  }
  scripts = @($scripts)
  backgrounds = @(Get-RelativeAssetList "Bg")
  illust = @(Get-RelativeAssetList "Illuster")
  media = [ordered]@{
    Illuster = @(Get-RelativeAssetList "Illuster")
    MiniIlluster = @(Get-RelativeAssetList "MiniIlluster")
    Comic = @(Get-RelativeAssetList "Comic")
    Cartoon = @(Get-RelativeAssetList "Cartoon")
  }
  sounds = @(Get-RelativeAssetList "sound")
  characters = Get-CharacterMap
  lovemode = Get-LoveModeTable
  files = [ordered]@{
    after = @(Get-AssetNameList "after")
    dateintro = @(Get-AssetNameList "dateintro")
    datetxt = @(Get-AssetNameList "datetxt")
    dateoverlaptxt = @(Get-AssetNameList "dateoverlaptxt")
    lovetxt = @(Get-AssetNameList "lovetxt")
    lovemode = @(Get-AssetNameList "lovemode")
    normaltxt = @(Get-AssetNameList "normaltxt")
    badscript = @(Get-AssetNameList "badscript")
    calldatetxt = @(Get-AssetNameList "calldatetxt")
    request = @(Get-AssetNameList "request")
    return = @(Get-AssetNameList "return")
    stateeventtxt = @(Get-AssetNameList "stateeventtxt")
    illustertxt = @(Get-AssetNameList "illustertxt")
    miniillustertxt = @(Get-AssetNameList "miniillustertxt")
    comictxt = @(Get-AssetNameList "comictxt")
    cartoontxt = @(Get-AssetNameList "cartoontxt")
    sound = @(Get-AssetNameList "sound")
  }
}

$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $PlayerAssets "manifest.json") -Encoding UTF8

$AndroidSdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$BuildTools = Join-Path $AndroidSdk "build-tools\37.0.0"
$AndroidJar = Join-Path $AndroidSdk "platforms\android-35\android.jar"
$Aapt2 = Join-Path $BuildTools "aapt2.exe"
$D8 = Join-Path $BuildTools "d8.bat"
$ZipAlign = Join-Path $BuildTools "zipalign.exe"
$ApkSigner = Join-Path $BuildTools "apksigner.bat"
$JbrBin = "C:\Program Files\Android\Android Studio\jbr\bin"
$Javac = Join-Path $JbrBin "javac.exe"
$Jar = Join-Path $JbrBin "jar.exe"
$Keytool = Join-Path $JbrBin "keytool.exe"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

$Compiled = Join-Path $Build "compiled.zip"
$Linked = Join-Path $Build "linked.apk"
$Gen = Join-Path $Build "gen"
$Classes = Join-Path $Build "classes"
$Dex = Join-Path $Build "dex"
$ClassesJar = Join-Path $Build "classes.jar"
$WithDex = Join-Path $Build "with-dex.apk"
$Aligned = Join-Path $Build "aligned.apk"
$Keystore = Join-Path (Split-Path -Parent $Project) "snowrain-clean.keystore"

New-Item -ItemType Directory -Force -Path $Gen, $Classes, $Dex | Out-Null

& $Aapt2 compile --dir (Join-Path $Project "res") -o $Compiled
Check-LastExit "aapt2 compile"
& $Aapt2 link `
  -o $Linked `
  -I $AndroidJar `
  --manifest (Join-Path $Project "AndroidManifest.xml") `
  --java $Gen `
  --min-sdk-version 23 `
  --target-sdk-version 35 `
  $Compiled
Check-LastExit "aapt2 link"

$JavaFiles = @()
$JavaFiles += Get-ChildItem -LiteralPath (Join-Path $Project "src") -Recurse -Filter "*.java" | ForEach-Object FullName
$JavaFiles += Get-ChildItem -LiteralPath $Gen -Recurse -Filter "*.java" | ForEach-Object FullName
$ArgFile = Join-Path $Build "javac-files.txt"
$JavaFiles | Set-Content -LiteralPath $ArgFile -Encoding ASCII

& $Javac -encoding UTF-8 -source 8 -target 8 -classpath $AndroidJar -d $Classes "@$ArgFile"
Check-LastExit "javac"
& $Jar cf $ClassesJar -C $Classes "."
Check-LastExit "jar classes"
& $D8 --lib $AndroidJar --output $Dex $ClassesJar
Check-LastExit "d8"

Copy-Item -LiteralPath $Linked -Destination $WithDex -Force
& $Jar uf $WithDex -C $Project "assets"
Check-LastExit "jar update assets"
& $Jar uf $WithDex -C $Dex "classes.dex"
Check-LastExit "jar update apk"
& $ZipAlign -f -p 4 $WithDex $Aligned
Check-LastExit "zipalign"

if (!(Test-Path -LiteralPath $Keystore)) {
  & $Keytool -genkeypair `
    -keystore $Keystore `
    -storepass snowrainclean123 `
    -keypass snowrainclean123 `
    -alias snowrainclean `
    -keyalg RSA `
    -keysize 2048 `
    -validity 10000 `
    -dname "CN=SnowRain Clean,O=Local,C=KR"
}

& $ApkSigner sign `
  --ks $Keystore `
  --ks-pass pass:snowrainclean123 `
  --key-pass pass:snowrainclean123 `
  --out $OutputApk `
  $Aligned
Check-LastExit "apksigner sign"

& $ApkSigner verify --verbose $OutputApk
Check-LastExit "apksigner verify"
Get-Item -LiteralPath $OutputApk | Select-Object FullName, Length
