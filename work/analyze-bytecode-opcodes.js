const fs = require("fs");
const path = require("path");

const root = path.join("work", "snowrain-clean", "assets", "game");
const dirs = [
  "Scripttxt",
  "datetxt",
  "lovetxt",
  "stateeventtxt",
  "calldatetxt",
  "dateintro",
  "dateoverlaptxt",
  "normaltxt",
  "badscript",
  "after"
];

const knownLengths = new Map([
  [0x00, 1],
  [0x01, 1],
  [0x02, 2],
  [0x03, 2],
  [0x04, 2],
  [0x05, 3],
  [0x06, 2],
  [0x07, 1],
  [0x08, 3],
  [0x09, 2],
  [0x0a, 1],
  [0x0b, 2],
  [0x0e, 2],
  [0x0f, 3],
  [0x10, 3],
  [0x11, 3],
  [0x12, 2],
  [0x13, 2],
  [0x14, 3],
  [0x15, 2],
  [0x16, 2],
  [0x17, 2],
  [0x18, 2],
  [0x19, 2],
  [0x1a, 2],
  [0x1b, 2],
  [0x1e, 2],
  [0x1f, 2],
  [0x20, 2],
  [0x21, 2],
  [0x22, 2],
  [0x23, 2],
  [0x24, 2],
  [0x25, 2],
  [0x26, 2],
  [0x27, 2],
  [0x28, 2],
  [0x29, 2],
  [0x2a, 2],
  [0x2b, 2],
  [0x2c, 2],
  [0x2d, 2],
  [0x2e, 2],
  [0x2f, 2],
  [0x30, 2],
  [0x31, 2],
  [0x32, 2],
  [0x33, 2],
  [0x34, 2],
  [0x35, 2],
  [0x36, 2],
  [0x37, 2],
  [0x38, 2],
  [0x5f, 2],
  [0xff, 1]
]);

function hex(value) {
  return value.toString(16).padStart(2, "0");
}

function segments(buffer) {
  const output = [];
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
    output.push(prefix);
    segmentStart = end + 1;
    i = end;
  }
  return output;
}

function commandLength(bytes, offset) {
  const opcode = bytes[offset];
  if (opcode === 0x0d) return bytes[offset + 1] === 0x0a ? 2 : 1;
  if ([0xf9, 0xfa, 0xfb, 0xfc, 0xfd].includes(opcode)) return bytes[offset + 1] === 0x00 ? 2 : 1;
  return knownLengths.get(opcode);
}

const unknown = new Map();
const transitionWindows = [];
const opcodeCounts = new Map();

for (const dir of dirs) {
  const dirPath = path.join(root, dir);
  if (!fs.existsSync(dirPath)) continue;
  for (const file of fs.readdirSync(dirPath)) {
    const filePath = path.join(dirPath, file);
    if (!fs.statSync(filePath).isFile()) continue;
    const fileSegments = segments(fs.readFileSync(filePath));
    fileSegments.forEach((bytes, lineIndex) => {
      let transitionOpcode = null;
      for (let offset = 0; offset < bytes.length;) {
        const opcode = bytes[offset];
        opcodeCounts.set(opcode, (opcodeCounts.get(opcode) || 0) + 1);
        let length = commandLength(bytes, offset);
        if (transitionOpcode === 0xfb && opcode === 0x0e && offset + 2 < bytes.length) length = 3;
        if (length === undefined) {
          const key = `0x${hex(opcode)}`;
          const context = bytes
            .slice(Math.max(0, offset - 4), Math.min(bytes.length, offset + 8))
            .map(hex)
            .join(" ");
          const entry = unknown.get(key) || { count: 0, examples: [] };
          entry.count += 1;
          if (entry.examples.length < 8) entry.examples.push(`${dir}/${file}#${lineIndex + 1}@${offset}: ${context}`);
          unknown.set(key, entry);
        }
        if ([0xf9, 0xfa, 0xfb, 0xfc, 0xfd].includes(opcode)) {
          transitionOpcode = opcode;
          transitionWindows.push({
            opcode: `0x${hex(opcode)}`,
            file: `${dir}/${file}`,
            line: lineIndex + 1,
            offset,
            bytes: bytes.slice(offset, Math.min(bytes.length, offset + 12)).map(hex).join(" ")
          });
        } else if (transitionOpcode && [0x02, 0x0e, 0x0f, 0x10, 0x11, 0x14].includes(opcode)) {
          transitionOpcode = null;
        }
        offset += length || 1;
      }
    });
  }
}

const result = {
  unknown: Array.from(unknown.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .map(([opcode, data]) => ({ opcode, ...data })),
  transitions: transitionWindows.slice(0, 120),
  transitionCount: transitionWindows.length,
  opcodeCounts: Array.from(opcodeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([opcode, count]) => ({ opcode: `0x${hex(opcode)}`, count }))
};

console.log(JSON.stringify(result, null, 2));
