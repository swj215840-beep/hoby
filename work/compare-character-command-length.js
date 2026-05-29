const fs = require("fs");
const path = require("path");

const root = path.join("work", "snowrain-clean", "assets", "game");
const dirs = ["Scripttxt", "datetxt", "lovetxt", "stateeventtxt", "after"];

function hex(value) {
  return value.toString(16).padStart(2, "0");
}

function segments(buffer) {
  const out = [];
  let segmentStart = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    if (buffer[i] !== 0x0c) continue;
    let end = i + 1;
    while (end < buffer.length && buffer[end] !== 0x00) end += 1;
    const prefix = Array.from(buffer.slice(segmentStart, i));
    for (let nested = end - 1; nested > i + 1; nested -= 1) {
      if (buffer[nested] !== 0x0c) continue;
      prefix.push(...Array.from(buffer.slice(i + 1, nested)));
      break;
    }
    out.push(prefix);
    segmentStart = end + 1;
    i = end;
  }
  return out;
}

function scan(characterCommandLength) {
  const known1 = new Set([0x00, 0x01, 0x07, 0x0a, 0xff]);
  const known2 = new Set([
    0x02, 0x03, 0x04, 0x06, 0x09, 0x0b, 0x0e,
    0x12, 0x13, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1e, 0x1f, 0x20,
    0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29,
    0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x5f
  ]);
  const known3 = new Set([0x05, 0x0f, 0x10, 0x11, 0x14]);
  const counts = new Map();
  const examples = [];
  let unknown = 0;
  let speakerOperand07 = 0;
  let command07 = 0;
  let command09 = 0;

  for (const dir of dirs) {
    const dirPath = path.join(root, dir);
    if (!fs.existsSync(dirPath)) continue;
    for (const file of fs.readdirSync(dirPath)) {
      const filePath = path.join(dirPath, file);
      if (!fs.statSync(filePath).isFile()) continue;
      segments(fs.readFileSync(filePath)).forEach((bytes, line) => {
        let transition = null;
        for (let offset = 0; offset < bytes.length;) {
          const opcode = bytes[offset];
          let length;
          if (opcode === 0x08) length = characterCommandLength;
          else if (opcode === 0x0d) length = bytes[offset + 1] === 0x0a ? 2 : 1;
          else if ([0xf9, 0xfa, 0xfb, 0xfc, 0xfd].includes(opcode)) length = bytes[offset + 1] === 0x00 ? 2 : 1;
          else if (transition === 0xfb && opcode === 0x0e && offset + 2 < bytes.length) length = 3;
          else if (known1.has(opcode)) length = 1;
          else if (known2.has(opcode)) length = 2;
          else if (known3.has(opcode)) length = 3;
          else {
            unknown += 1;
            length = 1;
            if (examples.length < 20) {
              examples.push(`${dir}/${file}#${line + 1}@${offset}: ${bytes.slice(Math.max(0, offset - 5), offset + 8).map(hex).join(" ")}`);
            }
          }

          counts.set(opcode, (counts.get(opcode) || 0) + 1);
          if (opcode === 0x0b && bytes[offset + 1] === 0x07) speakerOperand07 += 1;
          if (opcode === 0x07) command07 += 1;
          if (opcode === 0x09) command09 += 1;

          if ([0xf9, 0xfa, 0xfb, 0xfc, 0xfd].includes(opcode)) transition = opcode;
          else if (transition && [0x02, 0x0e, 0x0f, 0x10, 0x11, 0x14].includes(opcode)) transition = null;
          offset += length;
        }
      });
    }
  }

  return {
    characterCommandLength,
    unknown,
    examples,
    speakerOperand07,
    command07,
    command09,
    top: Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([opcode, count]) => ({ opcode: `0x${hex(opcode)}`, count }))
  };
}

console.log(JSON.stringify([scan(2), scan(3)], null, 2));
