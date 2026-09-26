# 数据驱动指南（movies/ 文件夹格式）

上架或修改台词时，**只动 `movies/{id}/` 文件夹 + 素材，再跑 build**。不用改 `site.js` / CSS。

## 一部影片一个文件夹

```
movies/
└── {id}/                  # id：kebab-case（字母数字与连字符），与目录名一致
    ├── meta.json          # 固定格式（见下）
    ├── cover.jpg          # 封面海报（宽 ≥780）
    └── still.jpg          # 静帧（宽边 ≥1920）
```

> 存量 951 条仍在 `data/quotes.json`（legacy），全量迁移到 movies/ 的计划见 [`ROADMAP.md`](./ROADMAP.md) Part 2。当前 10 部样例已用新格式，可直接参考 `movies/`。

## meta.json 固定格式

```json
{
  "id": "shawshank-hope",
  "group": "top250",
  "film": {
    "title": "肖申克的救赎",
    "title_en": "The Shawshank Redemption",
    "year": 1994,
    "director": "弗兰克·德拉邦特"
  },
  "lines": [
    {
      "text": "希望是美好的，也许是人间至善，而美好的事物永不消逝。",
      "en": "Hope is a good thing, maybe the best of things, and no good thing ever dies.",
      "character": "Andy Dufresne",
      "note": "策展一句话（可选）",
      "featured": true
    }
  ],
  "tags": ["剧情", "希望", "自由"],
  "ratings": {
    "douban": { "score": 9.7 },
    "imdb": { "score": 9.3 },
    "rotten_tomatoes": { "tomatometer": 89 },
    "metacritic": { "score": 82 },
    "as_of": "2026-09-25",
    "source_note": "策展快照"
  },
  "still_alt": "剧照氛围示意（可选）",
  "license_note": "素材出处与授权说明（可选）"
}
```

| 字段 | 规则 |
|------|------|
| `id` | 必填，与目录名一致 |
| `group` | `top250` / `classics`（未来新分组需同步 `site.js` 的 `GROUP_LABELS`） |
| `film.title` / `film.year` | 必填 |
| `lines[].text` | 必填，**可核对的原声对白**（见 quotes-policy.md） |
| `lines[].featured` | 全库恰好 5 条为 true |
| `ratings.imdb.score` + `ratings.as_of` | 必填；豆瓣尽量有；RT/MC 有则显示 |
| `lines[]` 多句 | 已预留；现阶段 build 只上架主台词（featured 或首条），多句规划见 ROADMAP Part 1 |

## 构建

```bash
node scripts/build.mjs
```

1. 扫描全部 `movies/*/meta.json`，校验固定格式（缺字段 / id 不一致 / 缺图会报错或警告）
2. 展开 lines → 主台词条目（多台词影片追加 `extra_count` = 备储句数），`poster` / `still` 自动指向 `movies/{id}/cover.jpg` / `still.jpg`
3. 多台词影片（lines > 1）生成 `data/lines/{id}.json`（全量台词，去掉 featured/confidence 内部字段；单台词影片不生成，陈旧文件自动清理）
4. 与 legacy `data/quotes.json` 中未迁移条目合并，写回 quotes.json
5. 调用 `sync-quote-pages.mjs`：缺失的 `quotes/{id}/` 生成壳页；模板变更统一对齐（旧链接不断）

前端（方案 A，2026-09-26 定稿）：列表卡片元信息尾部显示「本片还有 N 句」（N = extra_count，为 0 不显示）；详情页静帧下方按需 fetch `data/lines/{id}.json` 渲染「本片台词」区块，逐句可复制。今日一句/随机仍为影片级（句子级放 P1.5）。

## 新增一部影片的完整步骤

1. 新建 `movies/{id}/`，放入 `meta.json` + `cover.jpg` + `still.jpg`
2. `node scripts/build.mjs`
3. 本地预览：`python3 -m http.server 8080` → http://127.0.0.1:8080/quotes/ 可见新条目

## 相关

- 字段与口径：根目录 `README.md`、`docs/quotes-policy.md`
- 多台词深挖 / 存量迁移：`docs/ROADMAP.md`
