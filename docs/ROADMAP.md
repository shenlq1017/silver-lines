# ROADMAP · 片语 Silver Lines

> 2026-09-26 品牌重塑后立。两部分均为**计划文档**：方向、规范、步骤已定义，执行另排期。
> 当前状态：movies/ 新格式已有 10 部样例（见 `movies/`），存量 951 条仍在 `data/quotes.json`。

---

## Part 1 · 台词深挖计划（一部电影，不止一句）

### 目标

好电影往往有多个值得记住的句子。把当前「每片一条主台词」扩展为「每片 N 条台词」，让站点真正围绕**台词**生长——这是每日推荐、随机、未来台词排行的数据基础。

### 数据规范（meta.json 已预留）

```json
{
  "id": "shawshank-hope",
  "group": "top250",
  "film": { "title": "肖申克的救赎", "title_en": "The Shawshank Redemption", "year": 1994, "director": "弗兰克·德拉邦特" },
  "lines": [
    { "text": "希望是美好的……", "en": "…", "character": "Andy Dufresne", "note": "策展注（可选）", "featured": true },
    { "text": "要么忙着活，要么忙着死。", "en": "…", "character": "Andy Dufresne" }
  ],
  "tags": ["剧情", "希望", "自由"],
  "ratings": { "imdb": { "score": 9.3 }, "as_of": "YYYY-MM-DD" }
}
```

- 每片一个 `movies/{id}/` 文件夹：`meta.json` + `cover.jpg`（宽 ≥780）+ `still.jpg`（宽边 ≥1920）。
- `lines[]` 逐条：`text` 必填（**可核对的银幕原声对白**，逐字，非概括）；`en` 原文（外语片尽量）；`character` 说话人；`note` 策展一句话（可选）；`featured` 全库**恰好 5 条**为 true。
- 主台词之外的条目现阶段 `build.mjs` 暂不上架（会提示），待前端"每片多句"展示设计定稿后放开。

### 口径（硬规则，沿用 docs/quotes-policy.md）

1. 只收**可核对**的原声对白；核不到出处的片子/句子不入库。
2. 禁止主题性策展句、"非逐字"改写。
3. 每批入库前跑门禁：`python3 scripts/check-quotes-only.py data/<batch>-draft.json`（多台词批次需扩展脚本支持 `lines[]` 结构，或在 draft 阶段仍用扁平结构、迁移时拆入 lines）。
4. 不编造对白；年代久远的片子以剧本/字幕组版本交叉核证为准。

### 流程（每批建议 25 片）

选片（补齐热门片的多句空间，兼顾不同年代/地区）→ 逐片核证 2～5 句对白 → 写 `movies/{id}/meta.json` → `node scripts/build.mjs` → 本地预览 → 交门禁推送。

### 前端依赖（另行设计，不在本计划执行）

- 详情页：主台词静帧页保留；多台词时片语集卡片可显示"本片还有 N 句"。
- 今日一句 / 随机：句子级而非影片级（同一部影片的不同句子都有机会被抽到）。
- 远期社区化：台词排行（哪句被最多人记住）、用户投稿核证流。

### 里程碑建议

| 阶段 | 内容 | 验收 |
|------|------|------|
| P1 | 前端多句展示定稿 + build 放开 lines 全量上架 | 一片多句可浏览 |
| P2 | 头部 50 部热门片挖至每片 3～5 句 | +150 句左右 |
| P3 | 全库滚动深挖，每片至少 2 句 | 覆盖 80% 影片 |

---

## Part 2 · 存量全量迁移计划（quotes.json → movies/{id}/）

### 目标

把 `data/quotes.json` 中 941 条 legacy 条目全部拆为 `movies/{id}/` 文件夹，quotes.json 变为 **build 纯生成物**（唯一数据源是 movies/）。10 部样例已完成，验证了新格式与 build 链路。

### 步骤

1. **冻结**：迁移窗口内暂停新数据入库；远端 push 保持同步。
2. **group 判定**：以 `data/top250.json` 的 `title_zh + year` 匹配 → `top250`，其余 → `classics`；匹配不上的 Top250 影片人工复核（注意片名别名）。
3. **拆分脚本**（一次性，参考已删除的 `scripts/_bootstrap-movies-samples.mjs` 样例写法）：
   - 读 quotes.json → 逐条生成 `movies/{id}/meta.json`（line → lines[0]，featured 保留）；
   - 图片**移动**到 `movies/{id}/cover.jpg / still.jpg`（路径含 `assets/posters/top250/`、`classics/` 子目录，脚本按原路径取文件）；
   - 空目录清理（迁移后 `assets/posters/`、`assets/stills/` 应只剩 top250/ 名录海报等附属物料，注意 `data/source.json` 引用的 top250 名录物料**不迁**）。
4. **校验**：`node scripts/build.mjs` 后 diff quotes.json（应只有字段顺序/path 变化，无语义变化）；featured=5；总数 951；抽样 20 条人工核对 meta.json。
5. **收口**：quotes.json 顶部加 `"_generated": "by scripts/build.mjs — do not edit"` 注释性字段（或 README 声明）；`docs/data-driven.md` 已按新格式改写。
6. **回滚**：迁移作为一个独立 git commit 提交，回滚 = revert 该 commit（图片移动用 git rename 可完整还原）。

### 验收标准

- `movies/` 下 951 个目录，每个含 meta.json + cover.jpg + still.jpg；
- `node scripts/build.mjs` 幂等（重复运行 quotes.json 无 diff）；
- 站点三页（首页/片语集/详情）抽查无回归，旧链接 `quotes/{id}/` 全部可用；
- 门禁全过：featured=5、素材尺寸、quotes-only 口径。

### 里程碑

| 阶段 | 内容 |
|------|------|
| M1 | 脚本就绪，先迁 100 条验证 + 门禁试跑 |
| M2 | 500 条 |
| M3 | 全部 951 条收口，quotes.json 转纯生成物 |

---

## 附：本次品牌重塑已完成（2026-09-26）

- 更名「片语 Silver Lines」，slogan「光影说过的好句子」；定位改为"台词是主体，电影是出处"
- 全站浅色书卷风；片语集摘抄卡 + 分组/标签展开/排序/活跃筛选；首页今日一句/随机/统计
- `movies/` 格式 + `scripts/build.mjs` + 10 部样例
