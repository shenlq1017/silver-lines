#!/usr/bin/env node
/**
 * _apply-medium-closeout.mjs — 2026-09-30 medium 台词核证收尾（一次性）
 *
 * 依据 data/dig-batches/medium-closeout.report.json 的核证结论落库：
 * - wrong_wording → 替换为逐字核证句（附证据 note）
 * - unverifiable  → 从 lines[] 删除（核不到出处不入库）
 * 运行后需重跑 node scripts/build.mjs。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function metaPath(id) {
  return path.join(ROOT, "movies", id, "meta.json");
}
function loadMeta(id) {
  return JSON.parse(fs.readFileSync(metaPath(id), "utf8"));
}
function saveMeta(id, meta) {
  fs.writeFileSync(metaPath(id), JSON.stringify(meta, null, 2) + "\n", "utf8");
  console.log(`updated movies/${id}/meta.json → lines=${meta.lines.length}`);
}

/* 1. 十三刺客：替换不可核句为松平齐韶路上论道（英字 SRT 逐字） */
{
  const id = "13-assassins-no-happiness";
  const m = loadMeta(id);
  m.lines[1] = {
    text: "为主君而死，是武士之道；为丈夫而死，是妇人之道。",
    en: "Dying for one's master is the way of the samurai. Dying for one's husband is the way of women.",
    character: "松平齐韶",
    note: "松平齐韶赴宴途中论道（英字 SRT 00:19:06 逐字核证）；替换原不可核句。",
  };
  saveMeta(id, m);
}

/* 2. 美丽工作：替换为片尾独白收束（五份独立字幕逐字） */
{
  const id = "beau-travail-freedom-remorse";
  const m = loadMeta(id);
  m.lines[1] = {
    text: "迷失了……迷失了……为崇高的事业效命，然后死去。",
    en: 'Lost... lost... "Serve the good cause and die."',
    character: "加卢",
    note: "片尾迪斯科独白收束（五份独立字幕逐字核证）；替换原不可核句。",
  };
  saveMeta(id, m);
}

/* 3. 血观音：替换为片尾餐桌棠真台词（官方中字逐字） */
{
  const id = "blood-guanyin-family-business";
  const m = loadMeta(id);
  m.lines[2] = {
    text: "千万不要丢下我一个。你一定要长命百岁，万年富贵。",
    character: "棠真",
    note: "片尾餐桌棠真对棠夫人（官方中字 SRT 逐字核证）；替换原不可核句「一家人整整齐齐」。",
  };
  saveMeta(id, m);
}

/* 4. 碧血金沙：替换为逐字原句（三份英字一致） */
{
  const id = "sierra-madre-badges";
  const m = loadMeta(id);
  m.lines[1] = {
    text: "金子这玩意儿，反正是个魔鬼。",
    en: "Gold's a devilish sort of thing, anyway.",
    character: "Howard",
    note: "三份全片英字一致逐字（SDH cue 210）；替换旧译「金子是个魔鬼」（原文核不到）。",
  };
  saveMeta(id, m);
}

/* 5-7. unverifiable → 删除（第三度嫌疑人 / 掮客 / 新龙门客栈） */
const removals = [
  ["daisan-truth", "果然，人是你杀的吧"],
  ["broker-baby-family", "谢谢你选择了我们"],
  ["dragon-inn-man-i-wait", "进来的多，出去的少"],
  ["furnace-unchanged", "认知不足"],
  ["king-masks-pass-on", "爷爷，你别丢下我"],
];
for (const [id, needle] of removals) {
  const m = loadMeta(id);
  const before = m.lines.length;
  m.lines = m.lines.filter((l) => !(l.text || "").includes(needle));
  if (m.lines.length === before) throw new Error(`${id}：未找到待删句「${needle}」`);
  saveMeta(id, m);
}

/* 8. 天空之城：替换为朵拉逐字原句（日文台词集双源） */
{
  const id = "laputa-roots";
  const m = loadMeta(id);
  const i = m.lines.findIndex((l) => (l.text || "").includes("堂堂正正"));
  if (i === -1) throw new Error(`${id}：未找到待换句（堂堂正正）`);
  m.lines[i] = {
    text: "那当然啦！海盗图财宝有什么不对？！奇怪的是他们那帮家伙，为什么要偷偷摸摸地把姑娘掳走呢！",
    original: "あたりまえさね。海賊が財宝をねらってどこが悪い！！おかしなのはあいつらだ。なぜこそこそ娘をさらったりするんだ。",
    character: "朵拉船长",
    note: "Yahoo!知恵袋逐字引用 + 吉卜力全台词集双源核证；替换原意译改写句「海盗就该堂堂正正地偷」。",
  };
  saveMeta(id, m);
}

/* 9. 新世界：替换为丁青临终逐字台词（全片韩字时间轴核对） */
{
  const id = "new-world-door-opens";
  const m = loadMeta(id);
  const i = m.lines.findIndex((l) => (l.text || "").includes("守住咱们的人"));
  if (i === -1) throw new Error(`${id}：未找到待换句（守住咱们的人）`);
  m.lines[i] = {
    text: "要狠，这样才能活下去，明白吗？",
    original: "독하게 굴어. 그래야 네가 살아, 알겠냐?",
    character: "丁青",
    note: "病房最后对话（全片 Netflix 韩字时间轴 1:49:22 逐字）；替换原不可核句「老幺，一定要守住咱们的人」。",
  };
  saveMeta(id, m);
}

console.log("\nmedium closeout 落库完成，请重跑 node scripts/build.mjs");
