# 银幕金句 / Silver Lines

电影质感的银幕金句策展站 · **Phase M3（Top25 上架）**。

暗色胶片风、静帧叠字、评分徽章可视化。无播放器、无盗链；图片均为相对路径本地氛围示意 PNG（非原片截帧）。

## 状态 · M3

| 项 | 说明 |
|----|------|
| 数据 | `data/quotes.json` 恰好 **25** 条 `status=published` |
| 片名 | 对齐豆瓣 Top250 意图截取 Top25（冻结日 2026-09-25，见 `data/source.json`） |
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
│   └── {id}/index.html      # 25 条详情
├── data/
│   ├── quotes.json          # 25 条 published
│   └── source.json          # 来源 / 冻结日 / Top25 名单
├── assets/
│   ├── css/style.css
│   ├── js/ratings.js
│   ├── js/site.js
│   ├── posters/*.png
│   └── stills/*.png
└── README.md
```

## 版权

- 金句：公映对白引用，仅策展展示。
- 海报 / 静帧：自绘氛围 PNG 示意，**非原片截帧**；待合规剧照替换。
- 评分：策展快照，非官方合作。详见 `about/`。

## 推仓

确认无密钥、无未授权片宣物料后再自行入库。**不要在本阶段 git push。**
