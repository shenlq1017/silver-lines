#!/usr/bin/env node
/**
 * gen-sitemap.mjs — 生成站点根 sitemap.xml
 *
 * 覆盖：静态页（首页/片语集/关于/合辑/收藏）+ 全部 published 详情页。
 * lastmod 取 data/quotes.json 的修改时间（mtime）。
 *
 * 用法（站点根）：node scripts/gen-sitemap.mjs
 * 环境变量：SILVER_SITE_ORIGIN 覆盖站点绝对地址（默认 GitHub Pages 地址）
 *
 * 由 build.mjs 在同步详情壳后自动调用。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const QUOTES_JSON = path.join(ROOT, "data", "quotes.json");
const SITEMAP = path.join(ROOT, "sitemap.xml");

const SITE_ORIGIN = (
  process.env.SILVER_SITE_ORIGIN || "https://shenlq1017.github.io/silver-lines"
).replace(/\/+$/, "");

const STATIC_PATHS = ["/", "/quotes/", "/about/", "/collections/", "/favorites/"];

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function main() {
  const raw = fs.readFileSync(QUOTES_JSON, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("data/quotes.json 应为数组");

  const lastmod = fs.statSync(QUOTES_JSON).mtime.toISOString().slice(0, 10);

  const urls = [];
  for (const p of STATIC_PATHS) {
    urls.push(
      `  <url>\n    <loc>${escapeXml(SITE_ORIGIN + p)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
    );
  }
  for (const item of data) {
    if (!item || typeof item.id !== "string" || !item.id.trim()) continue;
    if (item.status && item.status !== "published") continue;
    urls.push(
      `  <url>\n    <loc>${escapeXml(`${SITE_ORIGIN}/quotes/${item.id}/`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
    );
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.join("\n") +
    `\n</urlset>\n`;

  fs.writeFileSync(SITEMAP, xml, "utf8");
  console.log(`sitemap.xml：${urls.length} 个 URL（静态 ${STATIC_PATHS.length} + 详情 ${urls.length - STATIC_PATHS.length}）`);
}

main();
