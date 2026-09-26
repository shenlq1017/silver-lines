#!/usr/bin/env node
/**
 * build.mjs — 数据构建统一入口
 *
 * 流程：
 * 1. 扫描 movies/{id}/meta.json（固定格式），校验并展开为主台词条目
 * 2. 与 legacy data/quotes.json 中未迁移条目合并，写回 quotes.json
 * 3. 调用 scripts/sync-quote-pages.mjs 同步详情壳
 *
 * movies/{id}/ 固定格式见 docs/data-driven.md。
 * lines[] 为多台词预留：现阶段仅上架 featured（无则首条）主台词。
 *
 * 用法（站点根）：node scripts/build.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MOVIES_DIR = path.join(ROOT, "movies");
const QUOTES_JSON = path.join(ROOT, "data", "quotes.json");
const SYNC_SCRIPT = path.join(ROOT, "scripts", "sync-quote-pages.mjs");

const ALLOWED_GROUPS = ["top250", "classics"];

function* walkMovieMeta(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const metaFile = path.join(dir, ent.name, "meta.json");
    if (fs.existsSync(metaFile)) yield [ent.name, metaFile];
  }
}

function loadMovie(dirname, metaFile) {
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
  } catch (e) {
    throw new Error(`${path.relative(ROOT, metaFile)} JSON 解析失败: ${e.message}`);
  }

  const errs = [];
  if (meta.id !== dirname) errs.push(`id（${meta.id}）与目录名（${dirname}）不一致`);
  if (!meta.film || typeof meta.film.title !== "string" || !meta.film.title.trim())
    errs.push("film.title 必填");
  if (!Number.isFinite(Number(meta.film && meta.film.year))) errs.push("film.year 必填");
  if (!Array.isArray(meta.lines) || !meta.lines.length || typeof meta.lines[0].text !== "string")
    errs.push("lines 至少一条且含 text");
  if (!meta.ratings || !meta.ratings.imdb || typeof meta.ratings.imdb.score !== "number")
    errs.push("ratings.imdb.score 必填");
  if (!meta.ratings || typeof meta.ratings.as_of !== "string" || !meta.ratings.as_of)
    errs.push("ratings.as_of 必填");
  if (meta.group && !ALLOWED_GROUPS.includes(meta.group))
    errs.push(`group 仅允许 ${ALLOWED_GROUPS.join(" / ")}`);
  if (errs.length) throw new Error(`${path.relative(ROOT, metaFile)}：${errs.join("；")}`);

  const warnings = [];
  if (!fs.existsSync(path.join(MOVIES_DIR, dirname, "cover.jpg")))
    warnings.push("缺 cover.jpg");
  if (!fs.existsSync(path.join(MOVIES_DIR, dirname, "still.jpg")))
    warnings.push("缺 still.jpg");

  return { meta, warnings };
}

/** meta → quotes.json 条目（现阶段仅主台词） */
function expand(meta) {
  const primary = meta.lines.find((l) => l.featured === true) || meta.lines[0];
  const q = {};
  q.id = meta.id;
  q.line = primary.text || "";
  if (primary.en) q.line_en = primary.en;
  q.film_title = meta.film.title;
  if (meta.film.title_en) q.film_title_en = meta.film.title_en;
  q.year = Number(meta.film.year);
  if (meta.film.director) q.director = meta.film.director;
  if (primary.character) q.character = primary.character;
  if (primary.note) q.curator_note = primary.note;
  q.tags = Array.isArray(meta.tags) ? meta.tags : [];
  if (meta.group) q.group = meta.group;
  q.ratings = meta.ratings;
  q.poster = `movies/${meta.id}/cover.jpg`;
  q.still = `movies/${meta.id}/still.jpg`;
  if (meta.still_alt) q.still_alt = meta.still_alt;
  q.status = "published";
  if (primary.featured === true) q.featured = true;
  if (meta.license_note) q.license_note = meta.license_note;
  return q;
}

function main() {
  const loaded = [];
  for (const [dirname, metaFile] of walkMovieMeta(MOVIES_DIR)) {
    const { meta, warnings } = loadMovie(dirname, metaFile);
    warnings.forEach((w) => console.warn(`警告 movies/${dirname}：${w}`));
    if (meta.lines.length > 1) {
      console.warn(
        `提示 movies/${dirname}：共 ${meta.lines.length} 条台词，现阶段仅上架主台词（多台词规划见 docs/ROADMAP.md）`
      );
    }
    loaded.push(meta);
  }

  const movieQuotes = loaded.map(expand);
  const movieIds = new Set(movieQuotes.map((m) => m.id));

  const legacyRaw = fs.readFileSync(QUOTES_JSON, "utf8");
  const legacy = JSON.parse(legacyRaw);
  if (!Array.isArray(legacy)) throw new Error("data/quotes.json 应为数组");

  const legacyIds = new Set(legacy.map((e) => e.id));
  const merged = legacy
    .map((e) => (movieIds.has(e.id) ? movieQuotes.find((m) => m.id === e.id) : e))
    .concat(movieQuotes.filter((m) => !legacyIds.has(m.id)));

  fs.writeFileSync(QUOTES_JSON, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(
    `quotes.json：${legacy.length} → ${merged.length} 条` +
      `（movies/ 覆盖 ${movieQuotes.length} 条，新增 ${movieQuotes.filter((m) => !legacyIds.has(m.id)).length} 条）`
  );

  execFileSync(process.execPath, [SYNC_SCRIPT], { stdio: "inherit" });
  console.log("\nbuild 完成。");
}

main();
