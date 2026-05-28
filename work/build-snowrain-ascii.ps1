$ErrorActionPreference = "Stop"

$Workspace = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Dest = "C:\srbuild\snowrain-clean"
$Out = "C:\srbuild\snowrain-rebuild-originalsafe.apk"
$SourceAssets = Join-Path $Workspace "work\snowrain-clean\assets\game"

New-Item -ItemType Directory -Force -Path $Dest | Out-Null

Copy-Item -LiteralPath (Join-Path $Workspace "work\snowrain-clean\AndroidManifest.xml") -Destination $Dest -Force
Copy-Item -LiteralPath (Join-Path $Workspace "work\snowrain-clean\build-clean-apk.ps1") -Destination $Dest -Force

foreach ($Dir in @("assets", "res", "src")) {
  Copy-Item -LiteralPath (Join-Path $Workspace "work\snowrain-clean\$Dir") -Destination $Dest -Recurse -Force
}

& (Join-Path $Dest "build-clean-apk.ps1") -SourceAssets $SourceAssets -OutputApk $Out
Copy-Item -LiteralPath (Join-Path $Dest "assets\player\manifest.json") -Destination (Join-Path $Workspace "work\snowrain-clean\assets\player\manifest.json") -Force
Copy-Item -LiteralPath $Out -Destination (Join-Path $Workspace "snowrain-rebuild-originalsafe.apk") -Force
Get-Item -LiteralPath (Join-Path $Workspace "snowrain-rebuild-originalsafe.apk") | Select-Object FullName, Length
