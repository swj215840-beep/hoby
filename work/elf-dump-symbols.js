const fs = require("fs");

const file = process.argv[2];
const pattern = new RegExp(process.argv[3] || ".", "i");
if (!file) {
  console.error("usage: node elf-dump-symbols.js <elf> [pattern]");
  process.exit(1);
}
const b = fs.readFileSync(file);
if (b.toString("ascii", 0, 4) !== "\x7fELF") throw new Error("not ELF");
if (b[4] !== 1 || b[5] !== 1) throw new Error("expected 32-bit little-endian ELF");

const e_shoff = b.readUInt32LE(32);
const e_shentsize = b.readUInt16LE(46);
const e_shnum = b.readUInt16LE(48);
const e_shstrndx = b.readUInt16LE(50);

function cstr(off) {
  let end = off;
  while (end < b.length && b[end] !== 0) end++;
  return b.toString("utf8", off, end);
}

function section(i) {
  const off = e_shoff + i * e_shentsize;
  return {
    nameOff: b.readUInt32LE(off),
    type: b.readUInt32LE(off + 4),
    flags: b.readUInt32LE(off + 8),
    addr: b.readUInt32LE(off + 12),
    offset: b.readUInt32LE(off + 16),
    size: b.readUInt32LE(off + 20),
    link: b.readUInt32LE(off + 24),
    info: b.readUInt32LE(off + 28),
    addralign: b.readUInt32LE(off + 32),
    entsize: b.readUInt32LE(off + 36),
  };
}

const sections = Array.from({ length: e_shnum }, (_, i) => section(i));
const shstr = sections[e_shstrndx];
for (const s of sections) s.name = cstr(shstr.offset + s.nameOff);

function dumpSymbols(secName) {
  const sym = sections.find((s) => s.name === secName);
  if (!sym) return;
  const str = sections[sym.link];
  const rows = [];
  for (let off = sym.offset; off < sym.offset + sym.size; off += sym.entsize || 16) {
    const st_name = b.readUInt32LE(off);
    const st_value = b.readUInt32LE(off + 4);
    const st_size = b.readUInt32LE(off + 8);
    const st_info = b[off + 12];
    const st_shndx = b.readUInt16LE(off + 14);
    const name = cstr(str.offset + st_name);
    if (!name || !pattern.test(name)) continue;
    rows.push({ secName, name, value: st_value, size: st_size, info: st_info, shndx: st_shndx });
  }
  rows.sort((a, b) => a.value - b.value || a.name.localeCompare(b.name));
  for (const r of rows) {
    const sec = sections[r.shndx];
    const fileOff = sec ? sec.offset + (r.value - sec.addr) : 0;
    console.log(`${r.secName} ${r.value.toString(16).padStart(8, "0")} size=${r.size} off=${fileOff.toString(16).padStart(8, "0")} ${r.name}`);
  }
}

dumpSymbols(".symtab");
dumpSymbols(".dynsym");
