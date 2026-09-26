#!/usr/bin/env node
/**
 * merge-dig-draft.mjs — 台词深挖草稿并入 movies/{id}/meta.json
 *
 * 用法（站点根）：
 *   node scripts/merge-dig-draft.mjs data/dig-batches/batch-0.draft.json [batch-1.draft.json ...]
 *
 * 规则：
 * - 草稿格式 {batch, generated, items:[{id, lines:[{text,en,character,note,confidence,source_hint}]}], skipped:[{id,reason}]}
 * - 只追加台词储备：去重（与既有 lines 及本批内规范文本重复者跳过）、**不加 featured**；
 *   不改 group / ratings / tags / 图片路径。
 * - confidence 缺省记 medium；character 缺失或 text 为空的条目拒收并计数。
 * - 幂等：重复运行全部按重复跳过，不产生变更。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MOVIES_DIR = path.join(ROOT, "movies");

const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[\s:：·，,。.\-—'’"“”!！?？()（）\[\]【】…·]/g, "");

const totals = { movies: 0, added: 0, dup: 0, invalid: 0, noMovie: 0 };

for (const arg of process.argv.slice(2)) {
  const file = path.resolve(ROOT, arg);
  if (!fs.existsSync(file)) {
    console.error(`找不到草稿文件：${arg}`);
    process.exit(1);
  }
  const draft = JSON.parse(fs.readFileSync(file, "utf8"));
  const items = Array.isArray(draft.items) ? draft.items : [];
  const perBatch = { touched: 0, added: 0, dup: 0, invalid: 0, noMovie: 0 };
  const report = [];

  for (const item of items) {
    const dir = path.join(MOVIES_DIR, item.id);
    const metaFile = path.join(dir, "meta.json");
    if (!item.id || !fs.existsSync(metaFile)) {
      perBatch.noMovie++;
      report.push(`  ✗ ${item.id || "(无id)"}： movies/ 无此目录`);
      continue;
    }
    const meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
    const seen = new Set((meta.lines || []).map((l) => norm(l.text)).filter(Boolean));
    meta.lines = meta.lines || [];

    const add = [];
    let dup = 0, invalid = 0;
    for (const l of item.lines || []) {
      const text = String(l.text || "").trim();
      const character = String(l.character || "").trim();
      if (!text || !character) { invalid++; continue; }
      const key = norm(text);
      if (!key || seen.has(key)) { dup++; continue; }
      seen.add(key);
      const line = { text, character };
      if (l.en && String(l.en).trim()) line.en = String(l.en).trim();
      if (l.note && String(l.note).trim()) line.note = String(l.note).trim();
      line.confidence = l.confidence === "high" ? "high" : "medium";
      add.push(line);
    }

    if (add.length) {
      meta.lines.push(...add);
      fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2) + "\n", "utf8");
      perBatch.touched++;
      perBatch.added += add.length;
      report.push(`  + ${item.id}：+${add.length}（dup ${dup}，invalid ${invalid}）`);
    } else if (dup || invalid) {
      perBatch.dup += dup;
      perBatch.invalid += invalid;
      report.push(`  = ${item.id}：0 新增（dup ${dup}，invalid ${invalid}）`);
    }
    perBatch.dup += dup;
    perBatch.invalid += invalid;
  }

  totals.movies += perBatch.touched;
  totals.added += perBatch.added;
  totals.dup += perBatch.dup;
  totals.invalid += perBatch.invalid;
  totals.noMovie += perBatch.noMovie;

  console.log(`\n== ${path.basename(file)}：影片 ${items.length}，新增 ${perBatch.added} 句 / 触碰 ${perBatch.touched} 部，重复 ${perBatch.dup}，无效 ${perBatch.invalid}，无目录 ${perBatch.noMovie}`);
  report.forEach((r) => console.log(r));
}

console.log(`\n合计：+${totals.added} 句 → ${totals.movies} 部 meta.json（重复 ${totals.dup}，无效 ${totals.invalid}，无目录 ${totals.noMovie}）`);
console.log("下一步：node scripts/build.mjs（多台词现阶段仅上架主台词，储备不上架）");
