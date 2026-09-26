import fs from "node:fs";

// 1) site.js：按行剥离 4 处 P1 编辑（幂等）
let lines = fs.readFileSync("assets/js/site.js", "utf8").replace(/\r\n/g, "\n").split("\n");
const has = (needle) => lines.some((l) => l.includes(needle));
if (has("(q.extra_count")) {
  const find = (needle, from = 0) => {
    const i = lines.findIndex((l, idx) => idx >= from && l.includes(needle));
    if (i === -1) throw new Error("line not found: " + needle);
    return i;
  };
  const bi = find("(q.extra_count");
  if (!lines[bi + 1].includes("quote-card__more")) throw new Error("badge structure unexpected");
  if (!lines[bi + 2].includes(': "") +')) throw new Error("badge close unexpected");
  lines.splice(bi, 3);
  const k = find("'<section class=\"detail-lines\"");
  const a = find("* 角落信息");
  if (!lines[k - 2].includes('"</section>"')) throw new Error("section close unexpected");
  if (lines[a - 3] !== "}") throw new Error("block tail unexpected: " + JSON.stringify(lines[a - 3]));
  lines.splice(k - 2, a - 3 - (k - 2) + 1, '    "</section>"', "  );", "}");
  const c1 = find("if (q.extra_count) loadExtraLines(q);");
  lines.splice(c1, 1);
  const c2 = find('document.body.classList.toggle("page-detail--has-lines"');
  lines.splice(c2, 1);
  const src = lines.join("\n");
  new Function(src);
  fs.writeFileSync("assets/js/site.js", src, "utf8");
  console.log("site.js stripped, parse OK");
} else console.log("site.js already stripped");

// 2) style.css（幂等）
let css = fs.readFileSync("assets/css/style.css", "utf8").replace(/\r\n/g, "\n");
const cut = css.indexOf("\n\n/* —— 多台词（方案 A）：卡片徽标 + 详情页台词区块 —— */");
if (cut !== -1) {
  fs.writeFileSync("assets/css/style.css", css.slice(0, cut) + "\n", "utf8");
  console.log("style.css stripped");
} else console.log("style.css already stripped");

// 3) build.mjs（幂等）
let b = fs.readFileSync("scripts/build.mjs", "utf8").replace(/\r\n/g, "\n");
if (b.includes("writeLinesFiles")) {
  const stripOnce = (str, re, label) => {
    const out = str.replace(re, "");
    if (out === str) throw new Error("no match: " + label);
    return out;
  };
  b = stripOnce(b, /const LINES_DIR = path\.join\(ROOT, "data", "lines"\);\n/, "LINES_DIR");
  const ws = b.indexOf("/** 多台词影片生成 data/lines/{id}.json");
  const we = b.indexOf("function main()");
  if (ws === -1 || we === -1 || we < ws) throw new Error("build.mjs markers not found");
  b = b.slice(0, ws) + b.slice(we);
  b = stripOnce(b, /  if \(meta\.lines\.length > 1\) q\.extra_count = meta\.lines\.length - 1;\n/, "extra_count");
  b = stripOnce(b, /  writeLinesFiles\(loaded\);\n\n/, "writeLinesFiles call");
  fs.writeFileSync("scripts/build.mjs", b, "utf8");
  console.log("build.mjs stripped");
} else console.log("build.mjs already stripped");

// 4) data-driven.md（幂等）
let d = fs.readFileSync("docs/data-driven.md", "utf8").replace(/\r\n/g, "\n");
if (d.includes("extra_count")) {
  d = d.replace(
    `2. 展开 lines → 主台词条目（多台词影片追加 \`extra_count\` = 备储句数），\`poster\` / \`still\` 自动指向 \`movies/{id}/cover.jpg\` / \`still.jpg\`
3. 多台词影片（lines > 1）生成 \`data/lines/{id}.json\`（全量台词，去掉 featured/confidence 内部字段；单台词影片不生成，陈旧文件自动清理）
4. 与 legacy \`data/quotes.json\` 中未迁移条目合并，写回 quotes.json
5. 调用 \`sync-quote-pages.mjs\`：缺失的 \`quotes/{id}/\` 生成壳页；模板变更统一对齐（旧链接不断）

前端（方案 A，2026-09-26 定稿）：列表卡片元信息尾部显示「本片还有 N 句」（N = extra_count，为 0 不显示）；详情页静帧下方按需 fetch \`data/lines/{id}.json\` 渲染「本片台词」区块，逐句可复制。今日一句/随机仍为影片级（句子级放 P1.5）。`,
    `2. 展开 lines → 主台词条目，\`poster\` / \`still\` 自动指向 \`movies/{id}/cover.jpg\` / \`still.jpg\`
3. 与 legacy \`data/quotes.json\` 中未迁移条目合并，写回 quotes.json
4. 调用 \`sync-quote-pages.mjs\`：缺失的 \`quotes/{id}/\` 生成壳页；模板变更统一对齐（旧链接不断）`
  );
  if (d.includes("extra_count")) throw new Error("data-driven.md still has P1 text");
  fs.writeFileSync("docs/data-driven.md", d, "utf8");
  console.log("data-driven.md stripped");
} else console.log("data-driven.md already stripped");

// 5) quotes.json：去 extra_count（幂等）
const q = JSON.parse(fs.readFileSync("data/quotes.json", "utf8"));
for (const e of q) delete e.extra_count;
fs.writeFileSync("data/quotes.json", JSON.stringify(q, null, 2) + "\n", "utf8");
console.log("quotes.json stripped");
