# 银幕金句 / Silver Lines

电影质感的银幕金句策展站 · **Phase C2（金句 299 · Top249 + Classics×50）**。

暗色胶片风、静帧叠字、评分徽章可视化。无播放器、无盗链；图片均为相对路径本地氛围示意 PNG（非原片截帧）。

## 状态 · C2

| 项 | 说明 |
|----|------|
| 数据 | `data/quotes.json` **299** 条 `status=published`（Top249 + Classics C1×25 + C2×25） |
| 片名 | Top249 对齐豆瓣 Top250 意图截取（名次 1–250 除 108 茶馆；冻结日 2026-09-25）；另含 Classics C1+C2 batch-jia 影史经典共 50 部（见 `data/source.json` → `c1` / `c2`） |
| 字段 | `id`, `line`, `film_title`, `year`, `tags[]`, `poster`, `still`, `still_alt`, `status`, `ratings`（必有 `imdb` + `as_of`；豆瓣尽量有；RT/MC 有则显） |
| 可选 | `featured`, `curator_note`, `line_en`, `film_title_en`, `license_note`, `character`, `director` |
| 图像 | `assets/posters/{id}.png` · `assets/stills/{id}.png`；`license_note` 标明示意非原片截帧 |
| 首页 | `featured=true` 精选 3～5 条 |

### 字段说明（产品对齐）

- **line**：金句中文正文（主字段）
- **film_title**：中文片名
- **ratings.imdb**：必填；`douban` 强建议；`rotten_tomatoes` / `metacritic` 有则前端详情显示、无则隐藏
- **ratings.as_of**：有评分必填；**source_note**=策展快照（禁止爬虫实时抓）

> M0 曾用 `quote` / `movie`。M1 已改为 `line` / `film_title`；`site.js` 仍对旧键做只读兼容回退，新数据请勿再写旧键。

## 本地预览

必须从**站点根**用本地 HTTP 服务打开（`fetch` 加载 JSON，`file://` 会失败）：

```bash
cd /workspace/silver-lines
python3 -m http.server 8080
```

| 页面 | URL |
|------|-----|
| 首页 | http://127.0.0.1:8080/ |
| 金句列表 | http://127.0.0.1:8080/quotes/ |
| 详情样例 | http://127.0.0.1:8080/quotes/shawshank-hope/ |
| 关于 | http://127.0.0.1:8080/about/ |

## 目录结构

```
silver-lines/
├── index.html
├── about/index.html
├── quotes/
│   ├── index.html
│   ├── _detail-template.html   # 详情壳单一模板源
│   └── {id}/index.html         # 由 sync 脚本生成（路径兼容旧链接）
├── data/
│   ├── quotes.json          # published 金句
│   └── source.json          # 来源 / 冻结日 / Top249 名单 / Classics C1+C2
├── assets/
│   ├── css/style.css
│   ├── js/ratings.js
│   ├── js/site.js
│   ├── posters/*
│   └── stills/*
├── scripts/
│   └── sync-quote-pages.mjs # 按 published id 生成/对齐详情壳
├── docs/
│   └── data-driven.md       # 扩量步骤
└── README.md
```

## 上架新金句（数据驱动）

扩量步骤 = **写入 `data/quotes.json` + 本地海报/静帧 + 跑同步脚本**。**不用改 `site.js` / CSS**（除非改交互或视觉）。

```bash
node scripts/sync-quote-pages.mjs
```

详情壳只维护 `quotes/_detail-template.html`；脚本幂等生成 `quotes/{id}/index.html`，旧链接 `quotes/{id}/` 仍可用。完整说明见 [`docs/data-driven.md`](docs/data-driven.md)。

## 版权

- 金句：公映对白引用，仅策展展示。
- 海报 / 静帧：自绘氛围 PNG 示意，**非原片截帧**；待合规剧照替换。
- 评分：策展快照，非官方合作。详见 `about/`。

## 推仓

确认无密钥、无未授权片宣物料后再自行入库。**不要在本阶段 git push。**
