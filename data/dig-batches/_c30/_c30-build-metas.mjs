#!/usr/bin/env node
/**
 * _c30-build-metas.mjs — C30 批次并入（一次性）
 *
 * 输入：data/dig-batches/_c30/agent{1,2,3}.json（三组核证结论）
 * 动作：
 * 1. 为 14 部影片创建 movies/{slug}/meta.json（group=classics，main 台词置于 lines[0]）
 * 2. 复制素材：assets/posters/classics/{slug}.jpg → cover.jpg；assets/stills/classics/{slug}.jpg → still.jpg
 * 3. 生成 data/c30-draft-quotes.json（扁平结构）供 quotes-only 门禁校验
 * 之后：python scripts/check-quotes-only.py data/c30-draft-quotes.json → node scripts/build.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..", "..");
const DING = JSON.parse(fs.readFileSync(path.join(ROOT, "data/classics-ext/batch-ding.json"), "utf8"));
const bySlug = Object.fromEntries(DING.movies.map((m) => [m.slug, m]));

const AS_OF = "2026-09-30";
const drafts = [];

for (const n of [1, 2, 3]) {
  const agent = JSON.parse(fs.readFileSync(path.join(HERE, `agent${n}.json`), "utf8"));
  for (const mv of agent.movies) {
    const d = bySlug[mv.slug];
    if (!d) throw new Error(`batch-ding 中无 ${mv.slug}`);
    const dir = path.join(ROOT, "movies", mv.slug);
    if (fs.existsSync(dir)) throw new Error(`movies/${mv.slug} 已存在，拒绝覆盖`);
    fs.mkdirSync(dir, { recursive: true });

    /* main 台词置顶（build 取 lines[0] 为主台词） */
    const sorted = [...mv.lines].sort((a, b) => (b.main ? 1 : 0) - (a.main ? 1 : 0));
    const lines = sorted.map((l) => {
      const out = { text: l.text };
      if (l.en) out.en = l.en;
      if (l.original && !l.en) out.original = l.original;
      if (l.character) out.character = l.character;
      out.note = `${l.note || ""}（核证证据：${l.evidence}）`.replace(/^（核证证据：）（核证证据：）/, "（核证证据：");
      return out;
    });

    const meta = {
      id: mv.slug,
      group: "classics",
      film: {
        title: d.title_zh,
        title_en: d.title_en,
        year: Number(d.year),
        director: mv.director,
      },
      lines,
      tags: (d.category || "").split(/\s+/).filter(Boolean),
      ratings: {
        imdb: { score: mv.imdb },
        as_of: AS_OF,
        source_note: "策展快照（IMDb 主页快照，非实时抓取）",
      },
      still_alt: `${d.title_zh} · TMDB 宣传静帧（${d.backdrop_max_width} 宽 original）`,
      license_note: "海报/静帧：TMDB original 缓存物料（batch-ding 备料），仅策展展示。",
    };
    fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2) + "\n", "utf8");

    fs.copyFileSync(
      path.join(ROOT, "assets/posters/classics", `${mv.slug}.jpg`),
      path.join(dir, "cover.jpg")
    );
    fs.copyFileSync(
      path.join(ROOT, "assets/stills/classics", `${mv.slug}.jpg`),
      path.join(dir, "still.jpg")
    );

    drafts.push({
      id: mv.slug,
      line: sorted[0].text,
      character: sorted[0].character || "",
      curator_note: sorted[0].note || "",
      film_title: d.title_zh,
    });
    console.log(`created movies/${mv.slug}（lines=${lines.length}）`);
  }
}

fs.writeFileSync(
  path.join(ROOT, "data/c30-draft-quotes.json"),
  JSON.stringify(drafts, null, 2) + "\n",
  "utf8"
);
console.log(`\nc30-draft-quotes.json：${drafts.length} 条，请跑门禁后 build`);
