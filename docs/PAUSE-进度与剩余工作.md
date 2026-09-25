# 银幕金句 · 暂停交接（2026-09-25）

> 用户要求：**工作全部暂停**。本文记录当前线上进度、已上线批次、唯一 Top250 缺口、架构评审状态、剩余工作，以及恢复时可复制提示词。
> 仓库：`https://github.com/shenlq1017/silver-lines`
> 线上 Pages：`https://shenlq1017.github.io/silver-lines/`
> 沙箱根：`/workspace/silver-lines/`

## 硬规则（恢复时仍有效）

- 只在沙箱开发；**禁止 Cursor 云端编码代理；禁止云端操作**
- **禁止擅自 `git push`**；如需上架或推送，由 PM 终验并明确执行
- 素材高清：TMDB `original`；海报宽边 ≥780；静帧优先宽边 ≥2560，源站最大不足可标 soft/`actual`，**<1920 不上**
- 上架粒度：建议 +25 / +50 一批；无句或无合规静帧不上架
- 扩量页面：改 `data/quotes.json` + 本地海报/静帧 → `node scripts/sync-quote-pages.mjs`（见 `docs/data-driven.md`）

## 一、已上线（origin/main @ `fb34638`）

| 项 | 状态 | 备注 |
|----|------|------|
| 金句 published | **249**（Pages live） | 站点为 **Top249**；Pages：`https://shenlq1017.github.io/silver-lines/` |
| Top250 主批次 | **M6–M12 全部 live** | M7/M8 历史上曾跳过缺口，后续已 gap-fill；不要再把这些批次视为待推 |
| Gap fill 141/142 | **已上线** | `heat-sun-always-summer`（rank 141）、`nezha-one-deed-alone`（rank 142） |
| Top250 唯一发布缺口 | **rank 108 茶馆** | TMDB 最大 backdrop 仍仅 `1280×720`，低于 `<1920` 门禁；当前不发布 |
| Top250 海报 | 250 齐 | `assets/posters/top250/` |
| classics-ext 海报批次 | **已上线** | `batch-jia`、`batch-jia2`、`batch-yi`、`batch-bing`、`batch-yi2` 均已 live（海报/批次） |
| 架构评审 | **条件 YES：data-driven** | 模板 + `sync-quote-pages.mjs` 路线成立；P0/P1 尚未实现，`scripts/check-ingest.mjs` 与 runbook 仍待补 |
| 背景乐 / 全屏详情 | 已上线 | 默认静音 |

`main` 当前锚点为 `origin/main @ fb34638`；线上为 `published=249`、站点 Top249。Top250 现只剩 rank 108 茶馆这一条发布缺口，141/142 已由上述 gap-fill 补齐。

## 二、当前沙箱与未跟踪项

| 项 | 状态 | 说明 |
|----|------|------|
| Top250 M6–M12 | **均已 live** | 历史 M7/M8 的跳过记录不改变当前状态；后续 gap-fill 已完成 141/142 |
| classics-ext | **均已 live** | `batch-jia` / `jia2` / `yi` / `bing` / `yi2` 的海报批次已在主线 |
| classics 海报目录 | 有遗留未跟踪文件 | 当前仍有 `assets/posters/classics/` 下的未跟踪海报；是否提交或清理见剩余工作第 2 项 |
| 架构 P0/P1 | **未实现** | 评审结论为条件 YES（data-driven），`check-ingest` 与 runbook 还没有落地 |

以 `git status` 为准，勿把遗留素材或临时文件误并入后续上架批次。

## 三、剩余工作清单（优先级建议）

1. **【唯一 Top250 缺口】rank 108 茶馆**
   需要从非 TMDB 找到宽边 ≥1920 的合规 backdrop；否则接受永久跳过。TMDB 当前最大 `1280×720`，不能突破 `<1920` 门禁。

2. **【可选】清理 classics 海报遗留**
   若 `assets/posters/classics/` 下的未跟踪海报仍需要保留，可单独提交；否则清理。先逐项核对 batch JSON，不要顺手混入无关文件。

3. **【可选 P0】补齐 ingest 门禁**
   实现 `scripts/check-ingest.mjs`，并补一份 runbook；这是架构评审提出的 P0/P1 后续，当前尚未实现。

4. **【产品】Top250 之外继续策展至约 1000**
   以已备好的 classics-ext material 加新金句为基础，按质量分批策展，不把片库素材自动等同于 published。

5. **【产品】Featured 维持约 5 条**
   当前继续维持约 5 条精选，除非产品明确要求改变。

## 四、恢复用提示词（复制即用）

### 4.1 用户 → 统筹（恢复总控）

```
恢复银幕金句。先读 docs/PAUSE-进度与剩余工作.md。
硬规则：只在沙箱、禁云端、禁擅自 push；上架由项目经理终验并明确执行。
当前 origin/main @ fb34638，Pages live 为 published=249 / Top249；M6–M12 均已上线。
先处理 rank 108 茶馆（需非 TMDB 且宽边≥1920 的 backdrop，否则接受永久跳过），再按剩余工作推进。
```

### 4.2 统筹 → 项目经理（终验口径）

```
【银幕金句当前状态】origin/main @ fb34638，Pages live published=249 / Top249；M6–M12 全部 live，141/142 gap-fill 已上线。
Top250 唯一缺口是 rank 108 茶馆：TMDB 最大 backdrop 仅 1280×720，低于 <1920 门禁。
请对茶馆替代静帧或永久跳过做终验；其余扩展工作按 docs/PAUSE-进度与剩余工作.md 执行。统筹禁擅自 push。
```

### 4.3 茶馆静帧备料

```
只在沙箱处理 rank 108 茶馆。禁云端、不要 git push。
目标：非 TMDB 来源的本地 backdrop，宽边≥1920；若找不到合规来源，保留永久跳过结论。
报告写 /workspace/tmp/tea-house-still/report.md；不要擅自改 published。
```

### 4.4 策展草稿（executor / 机器人）

```
你是银幕金句策展。根 /workspace/silver-lines/。禁云端；不要 git push；不要并入 quotes.json。
为豆瓣 Top250 rank {LO}–{HI} 各写 1 条主金句 → data/m{N}-draft-quotes.json，status=draft。
海报/静帧用 assets/{posters,stills}/top250/{slug}.jpg（须存在）。
字段对齐 quotes.json；id 勿冲突；边界写 curator_note。报告写 /workspace/tmp/m{N}-draft/report.md。
```

### 4.5 并入上架（executor）

```
M{N} 并入：禁云端、不要 push。根 /workspace/silver-lines/。
将 data/m{N}-draft-quotes.json 并入 quotes.json → published={目标}；去 rank；保留 curator_note；featured≈5。
跑 node scripts/sync-quote-pages.mjs；文案改 Top{目标}·M{N}；冒烟后交项目经理终验。
```

### 4.6 扩展海报备料（甲/乙/丙）

```
你是扩展片库备料。根 /workspace/silver-lines/。禁云端/push/改 quotes。
槽位 {RANGE} → data/classics-ext/batch-{name}.json + assets/posters/classics/{slug}.jpg。
TMDB original，宽边≥780；去重 top250 + 已有 batch-*.json + classics。
报告 /workspace/tmp/mat-{name}/report.json。齐套向统筹汇报。禁止 StopSubagent(all)。
```

### 4.7 静帧备料（Top250 段）

```
素材组：Top250 rank {LO}–{HI} 高清静帧。参考 /workspace/tmp/stills-51-100/ingest.py。
只写 JPEG 到 assets/stills/top250/ + fragment 到 /workspace/tmp/.../index-fragment.json；
不要直接改 stills-index（由统筹合并）。宽边≥2560=ok；1920–2559=actual；<1920 不上。
禁 push / 改 published。
```

## 五、关键路径速查

| 路径 | 用途 |
|------|------|
| `data/quotes.json` | 已上架金句 |
| `data/top250.json` | 豆瓣 Top250 冻结 |
| `data/stills-index.json` | 静帧索引 |
| `data/classics-ext/batch-*.json` | 扩展片库批次 |
| `data/m*-draft-quotes.json` | 策展草稿 |
| `assets/posters/top250/` | Top250 海报 |
| `assets/stills/top250/` | Top250 静帧 |
| `assets/posters/classics/` | 扩展海报 |
| `scripts/sync-quote-pages.mjs` | 详情壳同步 |
| `scripts/check-ingest.mjs` | 待实现的素材门禁脚本 |
| `docs/data-driven.md` | 数据驱动说明 |
| `docs/goal-1000-material-plan.md` | 1000 部素材计划 |

---

**暂停/更新标记**：2026-09-25（Asia/Shanghai）· `origin/main @ fb34638` · Pages live `published=249`（Top249）；141/142 gap-fill 已上线；唯一 Top250 发布缺口为 rank 108 茶馆（TMDB 最大 backdrop `1280×720`，低于 `<1920` 门禁）。
