# Character Slot Opcode Analysis

## Scope

This pass checks the exact meaning of the remaining ambiguous character opcodes:

- `0x07`, previously named `SET_CHARACTER_SLOT`
- `0x09`, previously named `SET_EYE`

The comparison uses the extracted original script byte streams and the 31-byte character metadata files under `assets/game/character/<id>/<variant>`.

## Character Metadata

Every non-PNG character metadata file is 31 bytes. The data is strongly structured as signed big-endian 16-bit coordinate pairs plus flags:

- Byte `0..3`: base body draw offset, for example `ff b5 ff 88` = `x=-75`, `y=-120`.
- Byte `4..23`: five coordinate pairs used by face/bust/auxiliary overlays.
- Byte `24..29`: currently zero in all scanned files.
- Byte `30`: small flag, usually `0`, sometimes `1`.

Examples:

| File | Body image | Metadata head |
|---|---|---|
| `character/0/0` | `300x240` | `ff b5 ff 88 00 03 00 37 ...` |
| `character/2/3` | `206x264` | `ff cd ff 7c 00 09 00 37 ...` |
| `character/4/11` | body variant 11 | `ff c7 ff a7 00 03 00 36 ...` |

This confirms the 31-byte files are original placement metadata, but they do not contain a simple `0x09 == eye image id` mapping.

## 0x09 Finding

`0x09` is not the eye layer command.

Evidence:

- Eye assets are only `character/eye/1.png` through `6.png`.
- Script values for `0x09` include `0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11`.
- `0x09 00` appears hundreds of times without an active character.
- When it follows a character command, it behaves like a variant/subpose slot, for example:
  - `08 02 03 09 01`
  - `08 02 02 09 06`
  - `08 04 0b 07`

Conclusion:

- Rename `0x09` to `SET_CHARACTER_VARIANT_SLOT`.
- Do not draw `character/eye/*.png` from `0x09`.
- Preserve the slot in trace/state for later native renderer matching.

## 0x07 Finding

`0x07` is a one-byte character display-slot marker in the current cursor model, not a general eye or background opcode.

Evidence:

- It appears most often immediately after character variant 11:
  - `08 04 0b 07`
  - `08 01 0b 07`
  - `08 02 0b 07`
- Character metadata/body variant `11` exists for several heroine folders.
- Treating `0x08` as a 3-byte character command keeps the full script scan at zero unknown opcodes; treating `0x08` as 2-byte introduces unknown bytes such as `0x1d` and `0x1c` in `Scripttxt/531`.

Conclusion:

- Keep `0x08` as a 3-byte `SET_CHARACTER(characterId, bodyId)` command.
- Rename `0x07` to `SET_CHARACTER_DISPLAY_SLOT_7`.
- Apply it as a display-slot marker only, without changing face, eye, or background.

## Parser Change

- `0x09` no longer sets `eyePath`.
- `0x09` now stores `variantSlot`.
- `0x07` now stores `displaySlot`.
- Actual eye rendering remains reserved for explicitly confirmed eye-layer commands; this avoids duplicate or incorrect eyes because most face PNGs already include eyes.

## Remaining Work

- Map the five 16-bit coordinate pairs in the 31-byte metadata to `body`, `face`, `bface`, `eye`, and auxiliary layer anchors.
- Compare `variantSlot`/`displaySlot` against original native draw calls to determine whether they select z-order, pose sub-slot, or bust-face overlay mode.
