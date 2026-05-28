param(
  [Parameter(Mandatory=$true)][string]$ManifestPath,
  [int]$TargetSdk = 28
)

$ErrorActionPreference = 'Stop'
$data = [IO.File]::ReadAllBytes($ManifestPath)

function U16([int]$o) { [BitConverter]::ToUInt16($data, $o) }
function U32([int]$o) { [BitConverter]::ToUInt32($data, $o) }
function S32([int]$o) { [BitConverter]::ToInt32($data, $o) }

function Read-Len8([ref]$o) {
  $b = $data[$o.Value]
  $o.Value++
  if (($b -band 0x80) -ne 0) {
    $b2 = $data[$o.Value]
    $o.Value++
    return (($b -band 0x7F) -shl 8) -bor $b2
  }
  return $b
}

function Read-Utf8String([int]$off) {
  $p = [ref]$off
  [void](Read-Len8 $p)
  $byteLen = Read-Len8 $p
  return [Text.Encoding]::UTF8.GetString($data, $p.Value, $byteLen)
}

function Read-Utf16String([int]$off) {
  $chars = U16 $off
  return [Text.Encoding]::Unicode.GetString($data, $off + 2, $chars * 2)
}

if ((U16 0) -ne 0x0003) {
  throw "Not an Android binary XML manifest: $ManifestPath"
}

$strings = @()
$off = 8
while ($off -lt $data.Length) {
  $type = U16 $off
  $headerSize = U16 ($off + 2)
  $size = U32 ($off + 4)
  if ($type -eq 0x0001) {
    $stringCount = U32 ($off + 8)
    $flags = U32 ($off + 16)
    $stringsStart = U32 ($off + 20)
    $isUtf8 = (($flags -band 0x100) -ne 0)
    for ($i = 0; $i -lt $stringCount; $i++) {
      $rel = U32 ($off + $headerSize + ($i * 4))
      $stringOff = $off + $stringsStart + $rel
      if ($isUtf8) {
        $strings += Read-Utf8String $stringOff
      } else {
        $strings += Read-Utf16String $stringOff
      }
    }
  }
  $off += $size
}

function Attrs-ForStart([int]$chunkOff) {
  $attrStart = U16 ($chunkOff + 24)
  $attrSize = U16 ($chunkOff + 26)
  $attrCount = U16 ($chunkOff + 28)
  $attrs = @()
  for ($i = 0; $i -lt $attrCount; $i++) {
    $attrOff = $chunkOff + 16 + $attrStart + ($i * $attrSize)
    $nameIndex = S32 ($attrOff + 4)
    $rawIndex = S32 ($attrOff + 8)
    $typeByte = $data[$attrOff + 15]
    $value = U32 ($attrOff + 16)
    $raw = $null
    if ($rawIndex -ge 0 -and $rawIndex -lt $strings.Count) {
      $raw = $strings[$rawIndex]
    }
    $attrs += [pscustomobject]@{
      Offset = $attrOff
      Name = $strings[$nameIndex]
      Raw = $raw
      Type = $typeByte
      Value = $value
    }
  }
  return $attrs
}

function Attr-StringValue($attr) {
  if ($null -ne $attr.Raw) {
    return $attr.Raw
  }
  if ($attr.Type -eq 0x03 -and $attr.Value -lt $strings.Count) {
    return $strings[[int]$attr.Value]
  }
  return [string]$attr.Value
}

$permissionsToRemove = @(
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.RECEIVE_SMS',
  'android.permission.READ_PHONE_STATE',
  'android.permission.RESTART_PACKAGES',
  'android.permission.GET_TASKS',
  'android.permission.INTERNET',
  'android.permission.ACCESS_NETWORK_STATE',
  'android.permission.ACCESS_WIFI_STATE',
  'com.android.vending.BILLING',
  'com.android.vending.CHECK_LICENSE'
)

$componentsToRemove = @(
  'com.feelingk.iap.PwdActivity',
  'com.feelingk.lguiab.manager.gui.InAppLockActivity',
  'com.gameday.InAppBilling',
  'com.gameday.InAppBilling.BillingService',
  'com.gameday.InAppBilling.BillingReceiver',
  'com.feelingk.iap.SmsReceiver',
  'com.kt.olleh.inapp.TimerService'
)

$ranges = New-Object System.Collections.Generic.List[object]
$stack = New-Object System.Collections.Generic.List[object]

$off = 8
while ($off -lt $data.Length) {
  $type = U16 $off
  $size = [int](U32 ($off + 4))

  if ($type -eq 0x0102) {
    $nameIndex = S32 ($off + 20)
    $elemName = $strings[$nameIndex]
    $attrs = Attrs-ForStart $off

    if ($elemName -eq 'uses-sdk') {
      foreach ($attr in $attrs) {
        if ($attr.Name -eq 'targetSdkVersion' -and $attr.Type -eq 0x10) {
          [BitConverter]::GetBytes([UInt32]$TargetSdk).CopyTo($data, $attr.Offset + 16)
        }
      }
    }

    if ($elemName -eq 'application') {
      foreach ($attr in $attrs) {
        if ($attr.Name -eq 'debuggable') {
          $data[$attr.Offset + 15] = 0x12
          [BitConverter]::GetBytes([UInt32]0).CopyTo($data, $attr.Offset + 16)
        }
      }
    }

    $remove = $false
    if ($elemName -eq 'uses-permission') {
      $nameAttr = $attrs | Where-Object { $_.Name -eq 'name' } | Select-Object -First 1
      if ($nameAttr) {
        $permissionName = Attr-StringValue $nameAttr
        $remove = $permissionsToRemove -contains $permissionName
      }
    } elseif ($elemName -in @('activity', 'service', 'receiver')) {
      $nameAttr = $attrs | Where-Object { $_.Name -eq 'name' } | Select-Object -First 1
      if ($nameAttr) {
        $componentName = Attr-StringValue $nameAttr
        $remove = $componentsToRemove -contains $componentName
      }
    }

    $stack.Add([pscustomobject]@{
      Name = $elemName
      Start = $off
      Remove = $remove
    })
  } elseif ($type -eq 0x0103) {
    $nameIndex = S32 ($off + 20)
    $elemName = $strings[$nameIndex]
    for ($i = $stack.Count - 1; $i -ge 0; $i--) {
      if ($stack[$i].Name -eq $elemName) {
        $entry = $stack[$i]
        $stack.RemoveAt($i)
        if ($entry.Remove) {
          $ranges.Add([pscustomobject]@{
            Start = [int]$entry.Start
            End = [int]($off + $size)
          })
        }
        break
      }
    }
  }

  $off += $size
}

$ranges = $ranges | Sort-Object Start -Descending
$trimmed = $data
foreach ($range in $ranges) {
  $before = if ($range.Start -gt 0) { $trimmed[0..($range.Start - 1)] } else { @() }
  $after = if ($range.End -lt $trimmed.Length) { $trimmed[$range.End..($trimmed.Length - 1)] } else { @() }
  $trimmed = [byte[]]($before + $after)
}

[BitConverter]::GetBytes([UInt32]$trimmed.Length).CopyTo($trimmed, 4)
[IO.File]::WriteAllBytes($ManifestPath, $trimmed)

"Removed manifest ranges: $($ranges.Count)"
"Set targetSdkVersion: $TargetSdk"
