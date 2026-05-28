# SnowRain clean rebuild workspace

This repository contains the current clean Android/WebView rebuild workspace for continuing work on another machine.

Important paths:

- `work/snowrain-clean/` - clean Android project, player UI, parser, and extracted game assets.
- `work/build-snowrain-ascii.ps1` - builds the current APK to `snowrain-rebuild-originalsafe.apk`.
- `work/verify-snowrain-ascii.ps1` - verifies package metadata and signing.
- `snowrain-rebuild-originalsafe.apk` - latest built APK, currently version `0.15.0`.
- `스노우레인.apk` and `main.3.com.gameday.SnowRain.obb` - original input files kept for reference.

Large local-only directories such as emulator images and intermediate build folders are ignored.

Build from the repository root on Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File work\build-snowrain-ascii.ps1
```

Verify:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File work\verify-snowrain-ascii.ps1
```
