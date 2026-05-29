const fs = require("fs");
const path = require("path");

const root = path.join("work", "snowrain-clean", "assets", "game");
const characterRoot = path.join(root, "character");
const scriptDirs = ["Scripttxt", "datetxt", "lovetxt", "stateeventtxt", "after"];

function hex(value) {
  return value.toString(16).padStart(2, "0");
}

function numericStem(name) {
  const match = String(name).match(/^(\d+)/);
  return match ? Number(match[1]) : null;
}

function pngSize(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  if (buffer.length < 24) return null;
  if (buffer.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function segmentPrefixes(buffer) {
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

function commandLength(bytes, offset, transition = null) {
  const opcode = bytes[offset];
  if (opcode === 0x0d) return bytes[offset + 1] === 0x0a ? 2 : 1;
  if ([0xf9, 0xfa, 0xfb, 0xfc, 0xfd].includes(opcode)) return bytes[offset + 1] === 0x00 ? 2 : 1;
  if (transition === 0xfb && opcode === 0x0e && offset + 2 < bytes.length) return 3;
  if ([0x00, 0x01, 0x07, 0x0a, 0xff].includes(opcode)) return 1;
  if ([0x02, 0x03, 0x04, 0x06, 0x09, 0x0b, 0x0e, 0x12, 0x13, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1e, 0x1f, 0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x5f].includes(opcode)) return 2;
  if ([0x05, 0x08, 0x0f, 0x10, 0x11, 0x14].includes(opcode)) return 3;
  return 1;
}

const metadata = [];
for (const charDir of fs.readdirSync(characterRoot)) {
  const charPath = path.join(characterRoot, charDir);
  if (!fs.statSync(charPath).isDirectory()) continue;
  const id = numericStem(charDir);
  if (id === null) continue;
  for (const file of fs.readdirSync(charPath)) {
    const filePath = path.join(charPath, file);
    if (!fs.statSync(filePath).isFile()) continue;
    if (path.extname(file).toLowerCase() === ".png") continue;
    const bytes = Array.from(fs.readFileSync(filePath));
    if (bytes.length !== 31) continue;
    const bodyId = numericStem(file);
    const cloth = pngSize(path.join(charPath, "Cloth", `${bodyId || 1}.png`));
    metadata.push({
      id,
      bodyId,
      file: `character/${charDir}/${file}`,
      bytes,
      hex: bytes.map(hex).join(" "),
      cloth
    });
  }
}

const slotRefs = [];
for (const dir of scriptDirs) {
  const dirPath = path.join(root, dir);
  if (!fs.existsSync(dirPath)) continue;
  for (const file of fs.readdirSync(dirPath)) {
    const filePath = path.join(dirPath, file);
    if (!fs.statSync(filePath).isFile()) continue;
    segmentPrefixes(fs.readFileSync(filePath)).forEach((bytes, lineIndex) => {
      let currentCharacter = null;
      let transition = null;
      for (let offset = 0; offset < bytes.length;) {
        const opcode = bytes[offset];
        if (opcode === 0x08 && offset + 2 < bytes.length) {
          currentCharacter = { id: bytes[offset + 1], bodyId: bytes[offset + 2] };
        }
        if (opcode === 0x05 && offset + 2 < bytes.length) {
          currentCharacter = { ...(currentCharacter || {}), expression: bytes[offset + 2] };
        }
        if (opcode === 0x07) {
          slotRefs.push({
            opcode: "0x07",
            file: `${dir}/${file}`,
            line: lineIndex + 1,
            offset,
            currentCharacter,
            bytes: bytes.slice(Math.max(0, offset - 6), Math.min(bytes.length, offset + 8)).map(hex).join(" ")
          });
        }
        if (opcode === 0x09 && offset + 1 < bytes.length) {
          slotRefs.push({
            opcode: "0x09",
            value: bytes[offset + 1],
            file: `${dir}/${file}`,
            line: lineIndex + 1,
            offset,
            currentCharacter,
            bytes: bytes.slice(Math.max(0, offset - 6), Math.min(bytes.length, offset + 8)).map(hex).join(" ")
          });
        }
        const length = commandLength(bytes, offset, transition);
        if ([0xf9, 0xfa, 0xfb, 0xfc, 0xfd].includes(opcode)) transition = opcode;
        else if (transition && [0x02, 0x0e, 0x0f, 0x10, 0x11, 0x14].includes(opcode)) transition = null;
        offset += length;
      }
    });
  }
}

function countBy(items, keyFn) {
  const map = new Map();
  items.forEach((item) => {
    const key = keyFn(item);
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(([key, count]) => ({ key, count }));
}

function bytePositionStats() {
  const out = [];
  for (let index = 0; index < 31; index += 1) {
    const values = countBy(metadata, (entry) => entry.bytes[index]);
    out.push({
      index,
      distinct: values.length,
      top: values.slice(0, 8)
    });
  }
  return out;
}

const result = {
  metadataCount: metadata.length,
  metadataSamples: metadata.slice(0, 20).map(({ id, bodyId, file, hex, cloth }) => ({ id, bodyId, file, hex, cloth })),
  bytePositions: bytePositionStats(),
  slotCounts: countBy(slotRefs, (ref) => ref.opcode),
  eyeValues: countBy(slotRefs.filter((ref) => ref.opcode === "0x09"), (ref) => ref.value),
  slotCharacterRefs: countBy(slotRefs, (ref) => {
    const c = ref.currentCharacter || {};
    return `${ref.opcode}:char=${c.id ?? "-"}:body=${c.bodyId ?? "-"}:expr=${c.expression ?? "-"}:value=${ref.value ?? "-"}`;
  }).slice(0, 40),
  examples07: slotRefs.filter((ref) => ref.opcode === "0x07").slice(0, 30),
  examples09: slotRefs.filter((ref) => ref.opcode === "0x09").slice(0, 30)
};

console.log(JSON.stringify(result, null, 2));
