#!/usr/bin/env node
/**
 * sync-quote-pages.mjs
 *
 * 根据 data/quotes.json 中 status=published 的 id，
 * 在 quotes/{id}/ 下生成与壳模板一致的 index.html。
 *
 * 幂等：
 * - 目录/文件缺失 → 创建
 * - 已存在且内容与模板相同 → 跳过
 * - 已存在但与模板不同 → 用模板覆盖（模板变更时统一对齐）
 *
 * 不改动：quotes.json 正文、海报/静帧素材、未在 published 列表中的目录。
 *
 * 用法（站点根）：
 *   node scripts/sync-quote-pages.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const QUOTES_JSON = path.join(ROOT, "data", "quotes.json");
const TEMPLATE = path.join(ROOT, "quotes", "_detail-template.html");
const QUOTES_DIR = path.join(ROOT, "quotes");

function loadPublishedIds() {
  const raw = fs.readFileSync(QUOTES_JSON, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error("data/quotes.json 应为数组");
  }
  const ids = [];
  for (const item of data) {
    if (!item || typeof item.id !== "string" || !item.id.trim()) continue;
    if (item.status && item.status !== "published") continue;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(item.id)) {
      throw new Error(`非法 id（仅允许字母数字与连字符）: ${item.id}`);
    }
    ids.push(item.id);
  }
  return [...new Set(ids)];
}

function main() {
  if (!fs.existsSync(TEMPLATE)) {
    console.error(`缺少模板: ${path.relative(ROOT, TEMPLATE)}`);
    process.exit(1);
  }
  const template = fs.readFileSync(TEMPLATE, "utf8");
  if (!template.includes("quoteIdFromPath") || !template.includes("renderDetail")) {
    console.error("模板内容异常：未包含详情页引导脚本标记");
    process.exit(1);
  }

  const ids = loadPublishedIds();
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const id of ids) {
    const dir = path.join(QUOTES_DIR, id);
    const file = path.join(dir, "index.html");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(file)) {
      const existing = fs.readFileSync(file, "utf8");
      if (existing === template) {
        skipped += 1;
        continue;
      }
      fs.writeFileSync(file, template, "utf8");
      updated += 1;
      console.log(`updated  quotes/${id}/index.html`);
    } else {
      fs.writeFileSync(file, template, "utf8");
      created += 1;
      console.log(`created  quotes/${id}/index.html`);
    }
  }

  console.log(
    `\n同步完成：published=${ids.length}  created=${created}  updated=${updated}  skipped=${skipped}`
  );
  console.log(`模板源：quotes/_detail-template.html`);
}

main();
