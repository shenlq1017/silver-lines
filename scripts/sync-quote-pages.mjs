#!/usr/bin/env node
/**
 * sync-quote-pages.mjs
 *
 * 根据 data/quotes.json 中 status=published 的 id，
 * 在 quotes/{id}/ 下生成与壳模板一致的 index.html。
 *
 * 每页注入该条目专属的 <title> / description / OG / twitter / canonical
 * （模板中以 <!--OG--> 标记注入位置），便于搜索引擎与社交分享抓取。
 *
 * 幂等：
 * - 目录/文件缺失 → 创建
 * - 已存在且内容与该 id 的期望内容相同 → 跳过
 * - 已存在但不同 → 覆盖（模板或台词变更时统一对齐）
 *
 * 不改动：quotes.json 正文、海报/静帧素材、未在 published 列表中的目录。
 *
 * 用法（站点根）：
 *   node scripts/sync-quote-pages.mjs
 *
 * 环境变量：SILVER_SITE_ORIGIN 覆盖站点绝对地址（默认 GitHub Pages 地址）
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const QUOTES_JSON = path.join(ROOT, "data", "quotes.json");
const TEMPLATE = path.join(ROOT, "quotes", "_detail-template.html");
const QUOTES_DIR = path.join(ROOT, "quotes");

const SITE_ORIGIN = (
  process.env.SILVER_SITE_ORIGIN || "https://shenlq1017.github.io/silver-lines"
).replace(/\/+$/, "");

const STATIC_TITLE = "<title>台词详情 · 片语 Silver Lines</title>";
const STATIC_DESC =
  '<meta name="description" content="片语详情：全屏静帧叠一句台词，出处与评分为策展快照">';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadPublished() {
  const raw = fs.readFileSync(QUOTES_JSON, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error("data/quotes.json 应为数组");
  }
  const seen = new Set();
  const items = [];
  for (const item of data) {
    if (!item || typeof item.id !== "string" || !item.id.trim()) continue;
    if (item.status && item.status !== "published") continue;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(item.id)) {
      throw new Error(`非法 id（仅允许字母数字与连字符）: ${item.id}`);
    }
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    items.push(item);
  }
  return items;
}

/** 每个条目期望的 head 注入块：专属 title/description + OG/twitter/canonical */
function headBlockFor(q, eol) {
  const pageUrl = `${SITE_ORIGIN}/quotes/${q.id}/`;
  const img = `${SITE_ORIGIN}/movies/${q.id}/still.jpg`;
  const line = String(q.line || "").trim();
  const shortLine = Array.from(line).length > 42
    ? Array.from(line).slice(0, 42).join("") + "……"
    : line;
  const title = `「${shortLine}」`;
  const desc = `《${q.film_title || ""}》${q.year ? " · " + q.year : ""}｜片语 Silver Lines · 光影说过的好句子`;
  return {
    titleLine: `<title>${escapeHtml(title)} · 片语</title>`,
    descLine: `<meta name="description" content="${escapeHtml(desc)}">`,
    ogTags: [
      `  <link rel="canonical" href="${pageUrl}">`,
      `  <meta property="og:site_name" content="片语 Silver Lines">`,
      `  <meta property="og:type" content="article">`,
      `  <meta property="og:title" content="${escapeHtml(title)}">`,
      `  <meta property="og:description" content="${escapeHtml(desc)}">`,
      `  <meta property="og:url" content="${pageUrl}">`,
      `  <meta property="og:image" content="${img}">`,
      `  <meta name="twitter:card" content="summary_large_image">`,
      `  <meta name="twitter:title" content="${escapeHtml(title)}">`,
      `  <meta name="twitter:description" content="${escapeHtml(desc)}">`,
      `  <meta name="twitter:image" content="${img}">`,
    ].join(eol),
  };
}

function expectedPageFor(template, q, eol) {
  const b = headBlockFor(q, eol);
  return template
    .replace(STATIC_TITLE, b.titleLine)
    .replace(STATIC_DESC, b.descLine)
    .replace(/^[ \t]*<!--OG-->[ \t]*$/m, () => b.ogTags);
}

function main() {
  if (!fs.existsSync(TEMPLATE)) {
    console.error(`缺少模板: ${path.relative(ROOT, TEMPLATE)}`);
    process.exit(1);
  }
  const template = fs.readFileSync(TEMPLATE, "utf8");
  const eol = template.includes("\r\n") ? "\r\n" : "\n";
  const templateLf = template.replace(/\r\n/g, "\n");
  if (!templateLf.includes("quoteIdFromPath") || !templateLf.includes("renderDetail")) {
    console.error("模板内容异常：未包含详情页引导脚本标记");
    process.exit(1);
  }
  if (
    !templateLf.includes(STATIC_TITLE) ||
    !templateLf.includes(STATIC_DESC) ||
    !/^  <!--OG-->$\n/m.test(templateLf)
  ) {
    console.error("模板内容异常：缺少 OG 注入标记（title/description/<!--OG--> 三行）");
    process.exit(1);
  }

  const items = loadPublished();
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const q of items) {
    const dir = path.join(QUOTES_DIR, q.id);
    const file = path.join(dir, "index.html");
    const expected = expectedPageFor(template, q, eol);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(file)) {
      const existing = fs.readFileSync(file, "utf8");
      if (existing === expected) {
        skipped += 1;
        continue;
      }
      fs.writeFileSync(file, expected, "utf8");
      updated += 1;
    } else {
      fs.writeFileSync(file, expected, "utf8");
      created += 1;
    }
  }

  console.log(
    `\n同步完成：published=${items.length}  created=${created}  updated=${updated}  skipped=${skipped}`
  );
  console.log(`模板源：quotes/_detail-template.html · 站点：${SITE_ORIGIN}`);
}

main();
