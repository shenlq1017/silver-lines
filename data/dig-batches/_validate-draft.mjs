import fs from "node:fs";
const [draftFile, batchFile] = process.argv.slice(2);
const d = JSON.parse(fs.readFileSync(draftFile, "utf8"));
const batch = JSON.parse(fs.readFileSync(batchFile, "utf8"));
let lines = 0, high = 0, med = 0, bad = 0;
const ids = new Set();
for (const it of d.items || []) {
  ids.add(it.id);
  const seen = new Set();
  for (const l of it.lines || []) {
    lines++;
    if (!l.text || !l.character) bad++;
    if (l.confidence === "high") high++; else med++;
    const k = String(l.text).replace(/[\s：，。！？、.'"`\-—…]/g, "");
    if (seen.has(k)) console.log("批内重复:", it.id, String(l.text).slice(0, 15));
    seen.add(k);
  }
}
const skip = new Set((d.skipped || []).map((s) => s.id));
const overlap = [...ids].filter((i) => skip.has(i));
const miss = batch.filter((i) => !ids.has(i) && !skip.has(i));
console.log(JSON.stringify({ movies: ids.size, skipped: skip.size, lines, high, med, bad, overlap, missing: miss }));
