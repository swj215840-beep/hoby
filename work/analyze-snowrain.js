const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "snowrain-clean", "assets", "game");
const decoder = new TextDecoder("utf-8");

function hex(bytes) {
  return [...bytes].map((v) => v.toString(16).padStart(2, "0")).join(" ");
}

function clean(text) {
  return text
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0009\u000b-\u001f\u007f-\u009f]/g, "")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .trim();
}

function numericName(a, b) {
  const na = Number(String(a).match(/\d+/)?.[0] ?? Number.MAX_SAFE_INTEGER);
  const nb = Number(String(b).match(/\d+/)?.[0] ?? Number.MAX_SAFE_INTEGER);
  return na - nb || String(a).localeCompare(String(b), "ko");
}

function parseTextEvents(file) {
  const bytes = fs.readFileSync(file);
  const events = [];
  let segmentStart = 0;
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] !== 0x0c) continue;
    let end = i + 1;
    while (end < bytes.length && bytes[end] !== 0x00) end++;
    const text = clean(decoder.decode(bytes.subarray(i + 1, end)));
    if (text) {
      const prefixStart = Math.max(segmentStart, i - 18);
      const prefix = bytes.subarray(prefixStart, i);
      const fullPrefix = bytes.subarray(segmentStart, i);
      events.push({
        offset: i,
        text,
        prefix,
        fullPrefix,
      });
    }
    segmentStart = end + 1;
    i = end;
  }
  return events;
}

function inspectScripts(names) {
  const dir = path.join(root, "Scripttxt");
  for (const name of names) {
    const file = path.join(dir, String(name));
    const events = parseTextEvents(file);
    console.log(`\nSCRIPT ${name} bytes=${fs.statSync(file).size} events=${events.length}`);
    events.slice(0, 12).forEach((event, idx) => {
      console.log(
        `${idx + 1}. @${event.offset} prefix=[${hex(event.prefix)}] text=${event.text.slice(0, 120)}`,
      );
    });
    if (events.length > 16) {
      console.log("...");
      events.slice(-4).forEach((event, idx) => {
        console.log(
          `${events.length - 3 + idx}. @${event.offset} prefix=[${hex(event.prefix)}] text=${event.text.slice(0, 120)}`,
        );
      });
    }
  }
}

function summarizeDir(dirName, take = 6) {
  const dir = path.join(root, dirName);
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).sort(numericName);
  console.log(`\nDIR ${dirName} files=${files.length}`);
  for (const name of files.slice(0, take)) {
    const file = path.join(dir, name);
    if (!fs.statSync(file).isFile()) continue;
    const events = parseTextEvents(file);
    const first = events[0]?.text.slice(0, 90) || "";
    console.log(`${name} bytes=${fs.statSync(file).size} events=${events.length} first=${first}`);
  }
}

function prefixStats() {
  const dir = path.join(root, "Scripttxt");
  const files = fs.readdirSync(dir).sort(numericName);
  const stat = new Map();
  const speakerCodes = new Map();
  for (const name of files) {
    const events = parseTextEvents(path.join(dir, name));
    for (const event of events) {
      const p = event.fullPrefix;
      const tail = hex(p.subarray(Math.max(0, p.length - 8)));
      stat.set(tail, (stat.get(tail) || 0) + 1);
      const pos = p.lastIndexOf(0x0b);
      if (pos >= 0 && pos + 1 < p.length) {
        const code = p[pos + 1];
        if (!speakerCodes.has(code)) speakerCodes.set(code, []);
        const examples = speakerCodes.get(code);
        if (examples.length < 4) examples.push(`${name}:${event.text.slice(0, 40)}`);
      }
    }
  }
  console.log("\nSPEAKER-LIKE CODES");
  [...speakerCodes.entries()]
    .sort((a, b) => a[0] - b[0])
    .forEach(([code, examples]) => console.log(`${code}: ${examples.join(" | ")}`));
  console.log("\nPREFIX TAILS TOP");
  [...stat.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .forEach(([tail, count]) => console.log(`${count} ${tail}`));
}

function byteStatsByScript() {
  const dir = path.join(root, "Scripttxt");
  const names = fs.readdirSync(dir).sort(numericName);
  console.log("\nSCRIPT RANGES");
  const ranges = new Map();
  for (const name of names) {
    const n = Number(name);
    const key = Number.isFinite(n) ? Math.floor(n / 100) * 100 : "other";
    const events = parseTextEvents(path.join(dir, name)).length;
    if (!ranges.has(key)) ranges.set(key, { files: 0, events: 0, min: name, max: name });
    const row = ranges.get(key);
    row.files += 1;
    row.events += events;
    row.max = name;
  }
  [...ranges.entries()].sort((a, b) => a[0] - b[0]).forEach(([key, row]) => {
    console.log(`${key}: files=${row.files} events=${row.events} min=${row.min} max=${row.max}`);
  });
}

inspectScripts([1, 2, 3, 30, 72, 73, 97, 100, 143, 200, 243, 300, 343, 400, 431, 500, 531]);
["request", "return", "lovetxt", "datetxt", "dateintro", "dateoverlaptxt", "calldatetxt", "stateeventtxt", "normaltxt", "badscript", "after", "mobiletxt", "BgTxt", "illustertxt", "miniillustertxt", "cartoontxt", "comictxt"].forEach((dir) => summarizeDir(dir));
byteStatsByScript();
prefixStats();
