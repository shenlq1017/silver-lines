# 片语 / Silver Lines

光影说过的好句子 · **收录 951 句台词**（豆瓣 Top249 + 影史经典 702 部，各 1 条主台词）。

台词是主体，电影只是出处。浅色书卷风摘抄站：全屏静帧叠一句台词、评分徽章为策展快照。无播放器、无盗链；图片均为本地物料（非逐句对白精确截帧）。

> GitHub 仓库：**<https://github.com/shenlq1017/silver-lines>**

## 本站是什么

刷得越多，记住越少。片语以「一句可核对的银幕对白」为最小单位，给台词一份可以停下来的摘抄本——不是观后感，不是主题概括，每句都是电影里真的被说出来的话。

- **今日一句**：每天呈现同一句；**随机来一句**：让光影替你抽签
- **片语集**：按分组、标签、年代筛选，支持搜索与排序
- 下一步：每片多句深挖、台词排行（计划见 [`docs/ROADMAP.md`](docs/ROADMAP.md)）

## 数据驱动（movies/ 文件夹格式）

一部影片一个文件夹，**新增影片 = 放文件夹 + 跑 build**：

```
movies/{id}/
├── meta.json    # 固定格式：film / lines[] / tags / group / ratings
├── cover.jpg    # 封面海报（宽 ≥780）
└── still.jpg    # 静帧（宽边 ≥1920）
```

```bash
node scripts/build.mjs     # 扫描 movies/ → 校验 → 合并生成 data/quotes.json → 同步详情壳
```

- `lines[]` 为多台词预留：现阶段仅上架主台词（featured 或首条），全库 featured 恰好 5
- `group`：暂允许 `top250` / `classics`；存量条目迁移完成后统一补齐（计划见 ROADMAP Part 2）
- meta.json 固定格式与校验规则详见 [`docs/data-driven.md`](docs/data-driven.md)

## 本地预览

必须从**站点根**用本地 HTTP 服务打开（`fetch` 加载 JSON，`file://` 会失败）：

```bash
cd silver-lines
python3 -m http.server 8080
```

| 页面 | URL |
|------|-----|
| 首页 | http://127.0.0.1:8080/ |
| 片语集 | http://127.0.0.1:8080/quotes/ |
| 详情样例 | http://127.0.0.1:8080/quotes/shawshank-hope/ |
| 关于 | http://127.0.0.1:8080/about/ |

## 目录结构

```
silver-lines/
├── index.html / about/ / quotes/
│   └── index.html            # 片语集（摘抄卡 + 筛选）
├── quotes/
│   ├── _detail-template.html  # 详情壳单一模板源（改完跑 sync）
│   └── {id}/index.html        # 由脚本生成（路径兼容旧链接）
├── movies/                    # ★ 唯一数据源：每片一个文件夹（10 部样例已迁移）
├── data/
│   ├── quotes.json            # build 生成物（legacy 存量 + movies/ 合并）
│   ├── source.json / top250.json
├── assets/
│   ├── css/style.css
│   ├── js/ratings.js
│   ├── js/site.js
│   ├── posters/*
│   ├── stills/*
│   └── audio/                 # 背景音乐（见 assets/audio/ATTRIBUTION.md）
├── scripts/
│   ├── build.mjs              # 扫描 movies/ + 生成 quotes.json + 同步详情壳
│   ├── sync-quote-pages.mjs   # 按 published id 生成/对齐详情壳
│   └── check-quotes-only.py   # 对白核对门禁（merge 前必跑）
├── docs/
│   ├── 影片搜集指南.md        # 候选→seed→静帧→金句→并入（含 TMDB_API_KEY 申请，不含真实密钥）
│   ├── data-driven.md         # 扩量步骤
│   └── quotes-policy.md       # 仅可核对对白；禁主题性策展句
├── .env.example               # 仅变量名占位；真实 Key 勿提交
└── README.md
```

## 台词口径（硬规则）

- **可核对的银幕原声对白**（逐字，非概括）；核不到出处不入库。
- 政策说明：[`docs/quotes-policy.md`](docs/quotes-policy.md)；路线图：[`docs/ROADMAP.md`](docs/ROADMAP.md)。

片源搜集与备料全流程见 [`docs/影片搜集指南.md`](docs/影片搜集指南.md)（含 `TMDB_API_KEY` 申请方式；**真实密钥勿提交**）。

扩量步骤 = **写入 `data/quotes.json` + 本地海报/静帧 + 跑同步脚本**。**不用改 `site.js` / CSS**（除非改交互或视觉）。

NEW draft 并入前先跑 quotes-only 门禁（详见 [`docs/quotes-policy.md`](docs/quotes-policy.md)）：

```bash
python3 scripts/check-quotes-only.py data/<batch>-draft-quotes.json
```

```bash
node scripts/sync-quote-pages.mjs
```

详情壳只维护 `quotes/_detail-template.html`；脚本幂等生成 `quotes/{id}/index.html`，旧链接 `quotes/{id}/` 仍可用。完整说明见 [`docs/data-driven.md`](docs/data-driven.md)。

## 版权

- 台词：公映对白引用，仅策展展示。
- 海报 / 静帧：本地缓存物料，出处见各条 `license_note`；待合规剧照替换。
- 评分：策展快照，非官方合作。详见 `about/`。

## 推仓与在线访问

仓库地址：**<https://github.com/shenlq1017/silver-lines>**（默认分支 `main`）。

推仓前先过一道目测门禁：确认无密钥（`.env` / `collect/.tmdb.env` 不入库，仅提交 `.env.example` 占位）、无未授权宣物，再提交：

```bash
git add .
git commit -m "docs: update README"
git push origin main
```

本仓为纯静态站点，可直接用 **GitHub Pages** 发布（供手机直接访问）：仓库 `Settings → Pages` 选 `Deploy from a branch`，分支 `main` / 根目录 `/ (root)`。启用后站点地址为 **<https://shenlq1017.github.io/silver-lines/>**。

> 提示：本站靠 `fetch` 加载 `data/quotes.json`，必须走 HTTP(S) 服务——本地预览用 `python3 -m http.server`（见上），线上用 GitHub Pages；勿以 `file://` 打开。
