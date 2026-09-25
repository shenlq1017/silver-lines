# 数据驱动扩量指南

上架新金句时，**只改数据 + 素材，再跑同步脚本**。不必手改前端逻辑（`site.js` / CSS），除非要改交互或视觉。

## 扩量步骤

1. **写入 `data/quotes.json`**
   - 追加一条对象，`status` 设为 `"published"`。
   - 必填字段见 README：`id`, `line`, `film_title`, `year`, `tags[]`, `poster`, `still`, `still_alt`, `status`, `ratings`（至少含 `imdb` + `as_of`）。
   - `id` 建议 kebab-case（字母数字与连字符），与素材文件名一致。

2. **放入本地海报 / 静帧**
   - `assets/posters/{id}.png`（或 `.jpg`，与 JSON 中路径一致）
   - `assets/stills/{id}.png`（或 `.jpg`）
   - 示意非原片截帧；`license_note` / `still_alt` 保持合规说明。

3. **跑详情页同步脚本**

   ```bash
   cd /workspace/silver-lines   # 或你的站点根
   node scripts/sync-quote-pages.mjs
   ```

   脚本会读取全部 `published` id，对缺失的 `quotes/{id}/` 生成壳页 `index.html`；已存在且与模板一致则跳过；模板变更时会覆盖对齐。

4. **本地预览**（站点根起 HTTP）

   ```bash
   python3 -m http.server 8080
   # 列表 http://127.0.0.1:8080/quotes/
   # 详情 http://127.0.0.1:8080/quotes/{id}/
   ```

## 不必改的文件

| 文件 | 说明 |
|------|------|
| `assets/js/site.js` | 列表/详情渲染已读 `quotes.json`；`quoteDetailUrl` 固定为 `quotes/{id}/` |
| `assets/css/style.css` | 除非改视觉 |
| 已有 `quotes/{id}/index.html` | 由脚本维护；勿手改 25 份（会漂移） |

## 单一模板源

- 壳页内容只维护一处：`quotes/_detail-template.html`
- 各 `quotes/{id}/index.html` 由脚本从该模板生成（内容相同，靠 URL 路径取 id 再 `renderDetail`）
- 改详情壳结构 / 公共脚本引用时：先改模板，再跑 `node scripts/sync-quote-pages.mjs`

## 旧链接兼容

- 路径仍为 `quotes/{id}/`（GitHub Pages、已分享链接不断）
- 列表页继续 `publishedQuotes(loadQuotes())` 数据驱动
- 同步脚本**不修改** published 金句正文、海报/静帧文件内容

## 相关

- 字段与 M3 状态：见根目录 `README.md`
- Top250 入库：见 `docs/top250-ingest.md`
