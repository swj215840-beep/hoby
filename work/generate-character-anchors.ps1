param(
  [string]$AssetsRoot = "work/snowrain-clean/assets/game",
  [string]$Output = "work/snowrain-clean/assets/player/data/characterAnchors.json",
  [string]$Report = "docs/character-anchor-generation.md",
  [int]$AlphaThreshold = 12
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function Get-OpaqueBounds([string]$Path, [int]$Threshold) {
  $bitmap = [System.Drawing.Bitmap]::FromFile((Resolve-Path -LiteralPath $Path))
  try {
    $minX = $bitmap.Width
    $minY = $bitmap.Height
    $maxX = -1
    $maxY = -1
    $count = 0

    for ($y = 0; $y -lt $bitmap.Height; $y++) {
      for ($x = 0; $x -lt $bitmap.Width; $x++) {
        if ($bitmap.GetPixel($x, $y).A -gt $Threshold) {
          if ($x -lt $minX) { $minX = $x }
          if ($x -gt $maxX) { $maxX = $x }
          if ($y -lt $minY) { $minY = $y }
          if ($y -gt $maxY) { $maxY = $y }
          $count++
        }
      }
    }

    if ($count -eq 0) {
      $minX = 0
      $minY = 0
      $maxX = [Math]::Max(0, $bitmap.Width - 1)
      $maxY = [Math]::Max(0, $bitmap.Height - 1)
    }

    return [ordered]@{
      width = $bitmap.Width
      height = $bitmap.Height
      opaque = [ordered]@{
        minX = $minX
        minY = $minY
        maxX = $maxX
        maxY = $maxY
        width = [Math]::Max(0, $maxX - $minX + 1)
        height = [Math]::Max(0, $maxY - $minY + 1)
        pixels = $count
      }
    }
  } finally {
    $bitmap.Dispose()
  }
}

function Get-NumericStem([string]$Name) {
  $stem = [System.IO.Path]::GetFileNameWithoutExtension($Name)
  $number = 0
  if ([int]::TryParse($stem, [ref]$number)) { return $number }
  return [int]::MaxValue
}

function Get-Point([int]$X, [int]$Y) {
  return [ordered]@{ x = $X; y = $Y }
}

function Get-BodyNeckAttach($Bounds) {
  $opaque = $Bounds.opaque
  $x = [int][Math]::Round(($opaque.minX + $opaque.maxX) / 2)
  $y = [int][Math]::Round($opaque.minY + ($opaque.height * 0.275))
  return Get-Point $x $y
}

function Get-FaceNeckAttach($Bounds) {
  $opaque = $Bounds.opaque
  $x = [int][Math]::Round(($opaque.minX + $opaque.maxX) / 2)
  $y = [int][Math]::Min($Bounds.height, $opaque.maxY + 1)
  return Get-Point $x $y
}

function Get-EyeAttach($Bounds) {
  $opaque = $Bounds.opaque
  $x = [int][Math]::Round($opaque.minX + ($opaque.width * 0.11))
  $y = [int][Math]::Round($opaque.minY + ($opaque.height * 0.36))
  return Get-Point $x $y
}

$characterRoot = Join-Path $AssetsRoot "character"
$faceRoot = Join-Path $characterRoot "face"
$outputObject = [ordered]@{}
$reportRows = New-Object System.Collections.Generic.List[string]
$reportRows.Add("# Character Anchor Generation")
$reportRows.Add("")
$reportRows.Add("- Source: $AssetsRoot")
$reportRows.Add("- Output: $Output")
$reportRows.Add("- Alpha threshold: $AlphaThreshold")
$reportRows.Add("- Body neck candidate: center X of opaque bounds, Y at 27.5% from opaque top.")
$reportRows.Add("- Face neck candidate: center X of opaque bounds, bottom Y of opaque bounds.")
$reportRows.Add("- Eye attach candidate: 11% X and 36% Y inside face opaque bounds.")
$reportRows.Add("")
$reportRows.Add("| Character | Cloth | Body size | Body opaque bounds | Body neck | Face count |")
$reportRows.Add("|---:|---:|---:|---|---:|---:|")

Get-ChildItem -LiteralPath $characterRoot -Directory |
  Where-Object { $_.Name -match '^\d+$' } |
  Sort-Object { [int]$_.Name } |
  ForEach-Object {
    $characterId = $_.Name
    $clothRoot = Join-Path $_.FullName "Cloth"
    if (!(Test-Path -LiteralPath $clothRoot)) { return }

    $characterKey = "character_$characterId"
    $characterObject = [ordered]@{}

    $faceFiles = @()
    $characterFaceRoot = Join-Path $faceRoot $characterId
    if (Test-Path -LiteralPath $characterFaceRoot) {
      $faceFiles = Get-ChildItem -LiteralPath $characterFaceRoot -File -Filter "*.png" |
        Sort-Object { Get-NumericStem $_.Name }, Name
    }

    Get-ChildItem -LiteralPath $clothRoot -File -Filter "*.png" |
      Sort-Object { Get-NumericStem $_.Name }, Name |
      ForEach-Object {
        $clothId = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
        $bodyBounds = Get-OpaqueBounds $_.FullName $AlphaThreshold
        $bodyNeckAttach = Get-BodyNeckAttach $bodyBounds
        $clothObject = [ordered]@{
          body = Get-Point 0 0
          bodyNeckAttach = $bodyNeckAttach
          faces = [ordered]@{}
          drawOrder = @("body", "face", "eye")
        }

        foreach ($faceFile in $faceFiles) {
          $faceId = [System.IO.Path]::GetFileNameWithoutExtension($faceFile.Name)
          $faceBounds = Get-OpaqueBounds $faceFile.FullName $AlphaThreshold
          $faceObject = [ordered]@{
            faceNeckAttach = Get-FaceNeckAttach $faceBounds
            eyeAttach = Get-EyeAttach $faceBounds
          }
          $clothObject.faces["face_$faceId"] = $faceObject
        }

        if ($clothObject.faces.Contains("face_2")) {
          $clothObject.faces["face_default"] = $clothObject.faces["face_2"]
        } elseif ($clothObject.faces.Count -gt 0) {
          $firstFaceKey = @($clothObject.faces.Keys)[0]
          $clothObject.faces["face_default"] = $clothObject.faces[$firstFaceKey]
        }

        $characterObject["cloth_$clothId"] = $clothObject
        $bodyOpaque = $bodyBounds.opaque
        $reportRows.Add("| $characterId | $clothId | $($bodyBounds.width)x$($bodyBounds.height) | ($($bodyOpaque.minX),$($bodyOpaque.minY))-($($bodyOpaque.maxX),$($bodyOpaque.maxY)) | ($($bodyNeckAttach.x),$($bodyNeckAttach.y)) | $($faceFiles.Count) |")
      }

    if ($characterObject.Count -gt 0) {
      $outputObject[$characterKey] = $characterObject
    }
  }

$json = $outputObject | ConvertTo-Json -Depth 20 -Compress
$outputDir = Split-Path -Parent $Output
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$json | Set-Content -LiteralPath $Output -Encoding ASCII
$reportDir = Split-Path -Parent $Report
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
$reportRows | Set-Content -LiteralPath $Report -Encoding UTF8
Write-Host "Generated $Output"
Write-Host "Generated $Report"
