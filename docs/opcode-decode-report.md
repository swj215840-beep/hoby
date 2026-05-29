# SnowRain Opcode Decode Report

## Scope

This pass compares the parser against the original script byte streams in `Scripttxt`, `datetxt`, `lovetxt`, `stateeventtxt`, and related script folders. No original runtime log file was present in the workspace, so the original APK's extracted binary scripts were used as the source of truth for repeated opcode structure.

## Method

- Added `work/analyze-bytecode-opcodes.js` to scan script prefixes outside the browser.
- Counted unknown opcodes across the original extracted script assets.
- Inspected transition windows around `0xf9`, `0xfa`, `0xfb`, `0xfc`, and `0xfd`.
- Replayed 10 representative scenes in the browser and saved trace captures under `docs/opcode-decode`.

## Results

Before this pass, frequent unknown opcodes were:

| Opcode | Count | Decoded as |
|---|---:|---|
| `0x09` | 1433 | `SET_EYE` / auxiliary eye-expression command |
| `0x25` | 305 | `SET_LOVE_RESULT` |
| `0x07` | 249 | `SET_CHARACTER_SLOT` marker |
| `0x0f` | 182 | `SET_ILLUSTER` payload |
| `0x14` | 131 | `SET_MINI_ILLUSTER` payload |
| `0x35` | 96 | `SET_LOVE_MENU_CLOSE` |
| `0x15` | 87 | `SET_BACKGROUND_GROUP` / scene group marker |
| `0x2b` | 75 | `SET_DATE_END_MARKER` |
| `0x10` | 74 | `SET_CARTOON` payload |
| `0x11` | 47 | `SET_COMIC` payload |

After this pass, `work/analyze-bytecode-opcodes.js` reports:

```json
{ "unknown": [] }
```

## Transition Structure

The transition opcodes are now treated as prefixes, not whole commands that swallow unrelated bytes.

| Pattern | Meaning |
|---|---|
| `fb 00 02 bgId` | Background transition prefix followed by direct `SET_BACKGROUND`. |
| `fb 00 0e group bgId` | Background transition prefix followed by contextual `SET_BACKGROUND_FROM_TRANSITION`. |
| `fd 00 0f assetId variant` | Illuster transition prefix followed by `SET_ILLUSTER`. |
| `fc 00 10 assetId variant` | Cartoon transition prefix followed by `SET_CARTOON`. |
| `fa 00 11 assetId variant` | Comic transition prefix followed by `SET_COMIC`. |
| `f9 00 14 assetId variant` | Scene/mini-illuster transition prefix followed by `SET_MINI_ILLUSTER`. |

This fixes cursor drift such as `fb 00 0e 01 02`, which is now parsed as:

```text
[SCENE] raw=0xfb 0x00 opcode=BACKGROUND_TRANSITION_PREFIX operands={"mode":0}
[SCENE] raw=0x0e 0x01 0x02 opcode=SET_BACKGROUND_FROM_TRANSITION operands={"groupId":1,"bgId":2,"valid":true}
```

## Capture Checks

| # | Line | Capture | Key result |
|---|---:|---|---|
| 1 | 1 | `docs/opcode-decode/after-01-line001.png` | `fb 00` prefix followed by `SET_BACKGROUND(28)`. |
| 2 | 5 | `docs/opcode-decode/after-02-line005.png` | `fb 00 0e 01 02` becomes `SET_BACKGROUND_FROM_TRANSITION(bgId=2)`. |
| 3 | 14 | `docs/opcode-decode/after-03-line014.png` | `0e ff 00` is invalid background and keeps prior scene. |
| 4 | 18 | `docs/opcode-decode/after-04-line018.png` | `fd 00 0f 01 01` becomes illuster payload, not unknown bytes. |
| 5 | 23 | `docs/opcode-decode/after-05-line023.png` | `fd 00 0f 01 02` becomes illuster variant payload. |
| 6 | 37 | `docs/opcode-decode/after-06-line037.png` | `fd 00 0f ff 00` clears illuster, then `SET_BACKGROUND(28)`. |
| 7 | 42 | `docs/opcode-decode/after-07-line042.png` | No transition payload; expression commands remain separate. |
| 8 | 50 | `docs/opcode-decode/after-08-line050.png` | Invalid `0x02 0x00` / `0x02 0xff` do not change background. |
| 9 | 55 | `docs/opcode-decode/after-09-line055.png` | `0x02 0x1b` applies cafe background `Bg/27.png`. |
| 10 | 70 | `docs/opcode-decode/after-10-line070.png` | Later dialogue preserves cafe scene until next valid scene opcode. |

Full traces are in `docs/opcode-decode/captures.json`.

## Remaining Work

- The names for nonvisual route/date/love marker opcodes are inferred from folder usage and repeated byte patterns, not from decompiled native symbols.
- `0x07` is still a conservative character-slot marker. It is no longer unknown, but exact native meaning needs a deeper comparison with the original drawing stack.
- Transition prefix mode is currently logged as `mode`; any visual timing/fade parameters need original runtime instrumentation to reproduce exactly.
