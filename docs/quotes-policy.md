# Quotes-only 金句政策（门禁）

> 拍板：用户 2026-09-25 · 自 Classics C27 起对 **NEW** draft 强制执行。  
> 门禁脚本：`scripts/check-quotes-only.py`

## 政策

| 项 | 要求 |
|----|------|
| 正文 | 仅收录 **可核对银幕对白**（片中角色说出的逐字／通行译法）。 |
| 禁止 | **主题性策展句**、非逐字 paraphrases、概括题旨句——**不得**作为 NEW 条目入库。 |
| 不可核证片名 | **不摄入**（drop；资产 orphan 可留，不删）。 |
| `curator_note` | 必须写明 **核证依据**（通行译法／字幕／剧本／Wikiquote／影评引文等）；**禁止**出现「策展句」「非逐字」「主题性」「概括题旨」。 |
| `character` | 必须是 **说话角色**（非「主题／旁白概括」占位）；不可缺。 |
| `line` | 不可空。 |

历史批次（C24–C26 等）若已含主题性策展句，**不回改** `data/quotes.json`；门禁只挡住未来 draft。

## 怎么跑

在站点根：

```bash
cd /workspace/silver-lines
python3 scripts/check-quotes-only.py data/cXX-draft-quotes.json
# 可一次多个：
python3 scripts/check-quotes-only.py data/c27-draft-quotes.json
```

- **exit 0** = PASS  
- **exit 1** = FAIL（stderr/stdout 列出每条违规）

脚本 **只读**，不改 draft / `quotes.json` / 素材。

## 并入（merge）必须先跑门禁

仓库内 **没有** 常驻 merge 脚本（各批 merge 在 `/workspace/tmp/cN-merge/merge-cN.mjs` 一次性生成）。  
**硬规则：** 任何把 `data/*-draft-quotes.json` 并入 `data/quotes.json` 的步骤，**必须先**通过：

```bash
python3 scripts/check-quotes-only.py data/<batch>-draft-quotes.json
```

未过门禁 → **禁止 merge**。合并冒烟清单建议顺序：

1. `python3 scripts/check-quotes-only.py data/<batch>-draft-quotes.json` ← **本门禁**
2. 素材宽高／去重／featured≈5 等既有 gate（见该批 `tmp/cN-merge/`）
3. 写入 `quotes.json` + `node scripts/sync-quote-pages.mjs`
4. 文案边界与本地 HTTP 冒烟  
5. **禁止** 本阶段 `git push` / 云端代理

## 合格 / 不合格示例

### PASS（可入库）

```json
{
  "id": "jinzhi-disguise",
  "line": "男也好，女也好，我只知道我中意你。",
  "character": "顾家明 / Koo Ka-ming",
  "curator_note": "片中告白对白（张国荣饰顾家明）；华语通行引述／影评常引，粤语原声意近「男也好女也好，我只知道我中意你」。"
}
```

```json
{
  "id": "pickpocket-hand",
  "line": "哦，让娜，为了走到你身边，我竟走了怎样一条奇怪的路。",
  "character": "米歇尔",
  "curator_note": "片末米歇尔画外音；法语原句可核；Wikipedia／IMDb quotes 通行译法。"
}
```

### FAIL（门禁拒绝）

缺说话角色：

```json
{
  "id": "example-no-char",
  "line": "……",
  "character": "",
  "curator_note": "通行字幕可核。"
}
```

主题性策展句（`curator_note` 含禁止词）：

```json
{
  "id": "example-thematic",
  "line": "沙穴里的人逃不出去。",
  "character": "鸟饲／女",
  "curator_note": "主题性策展句：概括《砂之女》存在主义题旨，非逐字引文。"
}
```

空 `line`：

```json
{
  "id": "example-empty-line",
  "line": "   ",
  "character": "某人",
  "curator_note": "通行译法。"
}
```

不可核证片名 → **整条不写进 draft**（见 C27 `tmp/c27-draft/dropped-unverifiable.json`），而不是用策展句顶替。

## 相关

- 扩量步骤：[`data-driven.md`](./data-driven.md)
- 素材门禁（海报／静帧）：[`M4-1000经典-备料与门禁.md`](./M4-1000经典-备料与门禁.md)
- 详情壳同步：`scripts/sync-quote-pages.mjs`（**不**替代本门禁）
