# SnowRain Script Parser Report

## Scope

This pass replaces numeric visual guessing with a cursor-based bytecode parser. The parser now advances by each opcode handler length and logs every command with offset, raw bytes, opcode name, operands, and result state.

## Parser Structure

- `OPCODE_HANDLERS` defines known bytecode commands.
- Each handler owns `name`, `kind`, `length`, `operands`, and `execute`.
- `parseVisualBytecode()` is the single cursor loop.
- `UNKNOWN` advances by one byte and never changes scene, character, face, eye, or state.
- Current decoded script asset scan reports no remaining unknown opcodes; see `docs/opcode-decode-report.md`.
- `SET_BACKGROUND` changes the current scene only when the operand points to an existing background resource.

## Implemented Handlers

| Opcode | Name | Length | Meaning |
|---|---|---:|---|
| `0x00` | `NOOP` | 1 | Padding/control byte. |
| `0x01` | `BLOCK_MARKER` | 1 | Script block marker. |
| `0x02` | `SET_BACKGROUND` | 2 | Operand `bgId`; valid resource required before applying. |
| `0x03` | `SET_EFFECT` | 2 | Effect/state-side visual command. |
| `0x04` | `PLAY_AUDIO` | 2 | Audio id command. |
| `0x05` | `SET_EXPRESSION` | 3 | Operands `characterId`, `faceId`. |
| `0x06` | `SET_CONTEXT_VALUE` | 2 | Becomes `SET_POSITION`, `SET_EYE`, or state value by opcode context. |
| `0x08` | `SET_CHARACTER` | 3 | Operands `characterId`, `bodyId`. |
| `0x0a` | `LINE_FEED` | 1 | Text/control separator. |
| `0x0b` | `SET_SPEAKER` | 2 | Speaker id. |
| `0x0d` | `LINE_BREAK` | 2 for CRLF, otherwise 1 | Text/control separator. |
| `0x0e` | `SET_STATE_VALUE` | 2 | State operand. |
| `0xf9`, `0xfb` | transition prefix | 1-2 | Prefix only; payload is parsed by the following opcode. |
| `0xfa`, `0xfc`, `0xfd` | CG transition prefix | 1-2 | Prefix only; payload is parsed by `0x0f`, `0x10`, `0x11`, or `0x14`. |

## Required Opcode Cases

- `0x02 0x1b` now logs as `SET_BACKGROUND` with `{"bgId":27,"valid":true}` and applies `Bg/27.png`.
- `0x05 0x00 0x02` now logs as `SET_EXPRESSION` with `{"characterId":0,"faceId":2}` and does not affect background.
- `0x02 0x00` and `0x02 0xff` log as `SET_BACKGROUND` with `valid:false`, but result state remains unchanged.
- Unknown bytes log as `UNKNOWN` and never become background ids.

## Capture Comparison

The captures below compare the previous failure mode, where numeric operands could be interpreted as scene ids, against the new opcode/parser result.

| # | Line | After screenshot | Key trace result |
|---|---:|---|---|
| 1 | 1 | `docs/script-parser/after-01-line001.png` | `offset=0x03 raw=0x02 0x1c opcode=SET_BACKGROUND operands={"bgId":28,"valid":true}` |
| 2 | 17 | `docs/script-parser/after-02-line017.png` | `SET_EFFECT` only; no background guess emitted. |
| 3 | 37 | `docs/script-parser/after-03-line037.png` | `SET_BACKGROUND(28)`, `SET_EXPRESSION(0,10)`, then `SET_POSITION(3)`. |
| 4 | 42 | `docs/script-parser/after-04-line042.png` | `raw=0x05 0x00 0x02 opcode=SET_EXPRESSION`; background unchanged. |
| 5 | 46 | `docs/script-parser/after-05-line046.png` | Expression command stays separate from scene state. |
| 6 | 50 | `docs/script-parser/after-06-line050.png` | `0x02 0x00` and `0x02 0xff` are invalid background operands and do not change scene. |
| 7 | 55 | `docs/script-parser/after-07-line055.png` | `raw=0x02 0x1b opcode=SET_BACKGROUND` applies cafe `Bg/27.png`. |
| 8 | 56 | `docs/script-parser/after-08-line056.png` | `0x05 0x00 0x02` changes face only. |
| 9 | 58 | `docs/script-parser/after-09-line058.png` | Repeated expression command uses same opcode semantics. |
| 10 | 70 | `docs/script-parser/after-10-line070.png` | `0x05 0x00 0x01` maps to face id 1 only. |

Full per-line logs are in `docs/script-parser/captures.json`.

## Remaining Issues

- Some non-visual command bytes are still logged as `UNKNOWN`; they are intentionally inert until their original command structure is decoded.
- Transition commands are currently one-byte visual markers. They no longer infer backgrounds; exact transition operands still need native-engine comparison.
- Original APK side-by-side screenshots are not available in this workspace, so the comparison uses bytecode expectation plus the current rendered after-captures.
