# SnowRain Render Fix Report

## Scope

This pass replaces the temporary "center face on body" renderer with a data-driven layer assembly path and separates visual script command parsing by opcode context.

## Files Changed

- `work/snowrain-clean/assets/player/data/characterAnchors.json`
  - New anchor table for `body`, `face`, and `eye` layers.
  - Uses keys such as `character_0`.
- `work/snowrain-clean/assets/player/app.js`
  - Loads `characterAnchors.json` plus local debug overrides.
  - Draws character layers in configured order: `body -> face -> eye`.
  - Adds opcode-context visual parser and trace entries.
  - Adds anchor debug functions and runtime JSON export.
- `work/snowrain-clean/assets/player/index.html`
  - Adds in-game anchor debug overlay.
- `work/snowrain-clean/assets/player/style.css`
  - Adds debug overlay styling.

## Renderer Changes

Before:

- Face layer was placed by centering it on the body canvas.
- A small hard-coded offset table adjusted a few characters.
- Eye assets were not modeled as a separate layer.
- The first anchor pass still stored `face.x` and `eye.x` as final character-space coordinates, so the face could remain visually detached from the neck when the body/cloth changed.

After:

- Layer placement comes from `data/characterAnchors.json`.
- Renderer reads `drawOrder` and draws layers in that order.
- The debug overlay can be toggled with `Shift+D`.
- Overlay controls edit `bodyNeckAttach`, `faceNeckAttach`, and `eyeAttach`.
- Edited anchors persist to `localStorage` and can be copied/downloaded as `characterAnchors.json`.
- Face final placement is now computed only from neck attachment points:
  - `face.x = body.x + bodyNeckAttach.x - faceNeckAttach.x`
  - `face.y = body.y + bodyNeckAttach.y - faceNeckAttach.y`
  - `eye.x = face.x + eyeAttach.x`
  - `eye.y = face.y + eyeAttach.y`
- The renderer keeps the original PNG canvas size and draws full images; no transparent padding trim/crop or auto-resize path is used.
- Runtime compatibility logs now report the concrete body/face pair, for example `character/0/Cloth/1.png` with `character/face/0/10.png`.

## Parser Changes

Before:

- The parser scanned numeric values and sometimes inferred scene IDs from bytes that belonged to character commands.
- `0x05 00 02` could be confused with a background-like value because `2` was read without opcode context.

After:

- Visual parsing is centralized in `visualCommandsFromPrefix`.
- The same byte value is interpreted by opcode context:
  - `0x02 value`: background when not inside character command payload.
  - `0x05 slot expression`: face/expression change for current character.
  - `0x08 character body`: character/body change.
  - `0x06 value`: position when attached to a character command, otherwise state/eye candidate.
- Runtime trace entries are generated for comparison:
  - `[SCENE] line=55 opcode=0x02 setBackground(27)`
  - `[FACE] line=56 opcode=0x05 setExpression(character=0, face=2)`
  - `[POS] line=55 opcode=0x06 setPosition(character=0, pos=3)`

## Capture Comparison

The table below uses the previous issue as the "before" condition and the current rendered screenshot as "after".

| # | Line | Before issue | After screenshot | Result |
|---|---:|---|---|---|
| 1 | 1 | Scene/background parsing relied on numeric fallback. | `docs/render-fix/after-01-line001.png` | Scene trace separates transition and background opcodes. |
| 2 | 17 | No explicit trace for early non-visual dialogue. | `docs/render-fix/after-02-line017.png` | No false background change emitted. |
| 3 | 37 | `05 00 0a` could affect character/body interpretation. | `docs/render-fix/after-03-line037.png` | Logged as face expression, position kept separate. |
| 4 | 42 | `05 00 02` risked being read as a scene value. | `docs/render-fix/after-04-line042.png` | Logged as face expression only. |
| 5 | 46 | Face/body alignment used centered placement. | `docs/render-fix/after-05-line046.png` | Uses `character_0.face` anchor. |
| 6 | 50 | Story transition line could keep stale visual trace. | `docs/render-fix/after-06-line050.png` | Background stays until explicit cafe opcode; trace now reports no visual opcode for this line. |
| 7 | 55 | Cafe background label was treated as shopping district. | `docs/render-fix/after-07-line055.png` | `Bg/27` is now shown as cafe and logged as scene opcode. |
| 8 | 56 | Face appeared detached from body in cafe scene. | `docs/render-fix/after-08-line056.png` | Face uses anchor table, not center placement. |
| 9 | 58 | Repeated expression changes could drift. | `docs/render-fix/after-09-line058.png` | Same character anchor reused across expressions. |
| 10 | 70 | Later cafe dialogue needed same character consistency. | `docs/render-fix/after-10-line070.png` | Same body/face anchor remains consistent. |

## Neck Attach Pass

The second anchor pass removes final face-coordinate editing from the runtime path. `characterAnchors.json` is now keyed by character and cloth/body variant, with face-specific attachment data below each cloth entry.

Example resolved line from the debug overlay:

```text
[ANCHOR] bodyNeck=(146,66) faceNeck=(38,70) eyeAttach=(8,25)
[CHAR_COMPAT] body=character/0/Cloth/1.png face=character/face/0/10.png compatible=true
```

| # | Line | Before issue | After screenshot | Result |
|---|---:|---|---|---|
| 11 | 37 | Face was stored as a direct character-space coordinate, so the neck seam could drift when expression/body data changed. | `docs/render-fix/neck-after-line037.png` | Face is now positioned by body neck attach minus face neck attach; eye attach is relative to the face. |

## Remaining Issues

- The 31-byte original character metadata files appear to contain native coordinate data, but the field mapping still needs to be fully decoded.
- Eye layer assets are present, but many face PNGs already include eyes. Eye drawing is therefore command-gated to avoid duplicate eyes.
- Some narrative lines intentionally keep the previous background until the next explicit scene opcode; this may still feel late compared with prose.
- Debug overlay saves browser-local overrides and can export/download JSON. A static browser preview cannot directly write back to the source file without a local write endpoint.
- Per-cloth native neck coordinates are now structurally supported. Most missing `cloth_N` entries still fall back to the `cloth_1` attach values until the original metadata fields are fully decoded for every body variant.

## Next Work

- Decode character metadata files under `assets/game/character/<id>/<variant>`.
- Map exact native fields into `characterAnchors.json`.
- Compare traces against original APK execution for date/love scripts, not only `Scripttxt/1`.
