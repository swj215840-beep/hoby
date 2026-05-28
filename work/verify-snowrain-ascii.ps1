$ErrorActionPreference = "Stop"

$Apk = "C:\srbuild\snowrain-rebuild-originalsafe.apk"
$BuildTools = Join-Path $env:LOCALAPPDATA "Android\Sdk\build-tools\37.0.0"
$Aapt = Join-Path $BuildTools "aapt.exe"
$ApkSigner = Join-Path $BuildTools "apksigner.bat"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

& $Aapt dump badging $Apk
& $ApkSigner verify --verbose $Apk
Get-FileHash -Algorithm SHA256 $Apk
