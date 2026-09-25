# 银幕金句 · 暂停交接（2026-09-25）

> 用户要求：**工作全部暂停**。本文记录当前进度、沙箱未推状态、剩余工作，以及恢复时可复制提示词。  
> 仓库：`https://github.com/shenlq1017/silver-lines`  
> 线上 Pages：`https://shenlq1017.github.io/silver-lines/`  
> 沙箱根：`/workspace/silver-lines/`

## 硬规则（恢复时仍有效）

- 只在沙箱开发；**禁止 Cursor 云端编码代理**
- **禁止擅自 `git push`**；上架扩量由「小记·项目经理」终验后推 main/Pages
- 素材高清：TMDB `original`；海报宽边 ≥780；静帧优先宽边 ≥2560，源站最大不足可标 soft/`actual`，**&lt;1920 不上**
- 上架粒度：建议 +25 / +50 一批；无句或无合规静帧不上架
- 扩量页面：改 `data/quotes.json` + 本地海报/静帧 → `node scripts/sync-quote-pages.mjs`（见 `docs/data-driven.md`）

## 一、已上线（origin/main）

| 项 | 状态 | 备注 |
|----|------|------|
| 金句 published | **75**（Pages） | 最近上架提交 `52dd01c`（M5 Top75） |
| 详情模板化 | 已推 | `0a91170`：`quotes/_detail-template.html` + `scripts/sync-quote-pages.mjs` |
| Top250 海报 | 250 齐 | `assets/posters/top250/` |
| Top250 静帧 11–250 | 索引 237 | 缺 108/141/142（源站 &lt;1920 已剔除）；提交含 `e0d2226` |
| 扩展片库甲 | **已推** 150 | `c9574ba` · `data/classics-ext/batch-jia.json` |
| 扩展片库乙 | **已推** 150 | `02f8e34` · `data/classics-ext/batch-yi.json` |
| 背景乐 / 全屏详情 | 已上线 | 默认静音 |

远程 `main` 最新备料相关 tip 约在 `02f8e34`（以 `git log` 为准）。

## 二、沙箱已完成但未推（暂停时快照）

| 项 | 沙箱状态 | 说明 |
|----|----------|------|
| **M6 Top76–100** | `published=100`，100 详情壳齐，`m6-draft` meta.merged=true | 冒烟曾通过；**未 commit / 未 push**；恢复后应交项目经理**终验推 Pages** |
| **batch-jia2**（751–900） | JSON 150 + 海报多在 `assets/posters/classics/` | **未交验、未推**；暂停时 ingest 已杀 |
| **batch-yi2**（901–1000） | 仅约 5 条，未齐 | **未交验**；暂停时 ingest 已杀 |
| **batch-bing**（551–750） | **文件缺失** | 丙被停时可能未落盘；需重做或找回 tmp |
| classics 海报目录 | 约 512 张 | 含甲/乙已推 + 甲续/丙尝试等，交验时按 batch JSON 对齐 |

工作区另有未跟踪：`data/m3-draft-quotes.json`、`data/m6-draft-quotes.json`、部分 docs、大量 `quotes/{新id}/`（M6）等。

## 三、机器人与职责（暂停）

| 角色 | id | 暂停前任务 |
|------|-----|------------|
| 统筹 New Bot | （本对话） | 统筹；已 Stop 所有相关后台 |
| 小记·项目经理 | `1a5c57df-79a2-4c79-b2dc-4a9d0c250770` | 门禁验收 / 推 main |
| 银幕·扩展片库甲 | `b265b37c-001a-43a4-b349-162ef8c8a39a` | jia2 751–900（已齐套待验，未推） |
| 银幕·扩展片库乙 | `691b9e1d-10f4-4bb1-94f6-d40c014dd3fc` | yi2 901–1000（未齐） |
| 银幕·扩展片库丙 | `9150638a-0163-4b9b-b38a-c5068ad82977` | bing 551–750（batch 缺失） |

> 暂停操作用了 StopSubagent(all)，可能打断项目经理等其它回合；恢复银幕金句时请重新 @ 项目经理，勿假设其上下文仍在。

## 四、剩余工作清单（优先级建议）

1. **【上架】M6 终验推 Pages**  
   沙箱已 published=100 → 项目经理终验 → 推 main → Pages 到 Top100。

2. **【备料验收】jia2 150**  
   抽检门禁 → 交 PM → 推仓（勿动 quotes）。

3. **【备料】丙 batch-bing 551–750**  
   重做约 200 部华语/非英语互补 + 高清海报。

4. **【备料】乙 yi2 901–1000**  
   凑近「1000 部经典」海报库（约 100 部）。

5. **【上架】Top101–250 金句**  
   静帧已大部分齐；按 +25/+50：M7=101–125 … 直至 250；每批 draft→PM 验→并入→终验→推。

6. **【缺口】静帧 108/141/142**  
   茶馆 / 阳光灿烂的日子 / 哪吒闹海：源站 &lt;1920，需换源或长期不上架。

7. **【扩展静帧】**  
   classics 仅有海报的片子，按批次补 TMDB backdrop 高清静帧（仍只备料）。

8. **【产品】金句策展至 ~1000**  
   片库海报齐后，按质量而非凑数上架语录。

## 五、恢复用提示词（复制即用）

### 5.1 用户 → 统筹（恢复总控）

```
恢复银幕金句。先读 docs/PAUSE-进度与剩余工作.md。
硬规则：沙箱、禁云端、禁擅自 push；上架由项目经理终验后推。
请按文档「剩余工作清单」从第 1 项继续；先把沙箱 M6（published=100）交项目经理终验推 Pages。
```

### 5.2 统筹 → 项目经理（M6 终验）

```
【M6 终验请】用户曾点名上到 Top100。沙箱已并入：published=100；sync 详情壳齐；文案应为 Top100·M6；m6-draft merged=true。
请终验后推 main/Pages。禁我擅自 push。路径 /workspace/silver-lines/。
参考 docs/PAUSE-进度与剩余工作.md。
```

### 5.3 用户点名下一批上架（例句）

```
继续上架 Top101–125（+25），更新 GitHub Pages。
```

### 5.4 策展草稿（executor / 机器人）

```
你是银幕金句策展。根 /workspace/silver-lines/。禁云端；不要 git push；不要并入 quotes.json。
为豆瓣 Top250 rank {LO}–{HI} 各写 1 条主金句 → data/m{N}-draft-quotes.json，status=draft。
海报/静帧用 assets/{posters,stills}/top250/{slug}.jpg（须存在）。
字段对齐 quotes.json；id 勿冲突；边界写 curator_note。报告写 /workspace/tmp/m{N}-draft/report.md。
```

### 5.5 并入上架（executor）

```
M{N} 并入：禁云端、不要 push。根 /workspace/silver-lines/。
将 data/m{N}-draft-quotes.json 并入 quotes.json → published={目标}；去 rank；保留 curator_note；featured≈5。
跑 node scripts/sync-quote-pages.mjs；文案改 Top{目标}·M{N}；冒烟后交项目经理终验。
```

### 5.6 扩展海报备料（甲/乙/丙）

```
你是扩展片库备料。根 /workspace/silver-lines/。禁云端/push/改 quotes。
槽位 {RANGE} → data/classics-ext/batch-{name}.json + assets/posters/classics/{slug}.jpg。
TMDB original，宽边≥780；去重 top250 + 已有 batch-*.json + classics。
报告 /workspace/tmp/mat-{name}/report.json。齐套向统筹汇报。禁止 StopSubagent(all)。
```

### 5.7 静帧备料（Top250 段）

```
素材组：Top250 rank {LO}–{HI} 高清静帧。参考 /workspace/tmp/stills-51-100/ingest.py。
只写 JPEG 到 assets/stills/top250/ + fragment 到 /workspace/tmp/.../index-fragment.json；
不要直接改 stills-index（由统筹合并）。宽边≥2560=ok；1920–2559=actual；&lt;1920 不上。
禁 push / 改 published。
```

## 六、关键路径速查

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
| `docs/data-driven.md` | 数据驱动说明 |
| `docs/goal-1000-material-plan.md` | 1000 部素材计划 |

---

**暂停标记**：2026-09-25（Asia/Shanghai）· 用户指令「工作先全部暂停，并留下工作进度和剩余工作」。
