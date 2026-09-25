/**
 * 银幕金句 · 评分徽章渲染
 * ratings schema（策展快照，禁止爬取）:
 *   imdb: { score: 0-10 一位小数, votes?, url? }
 *   douban: { score, votes?, url? }
 *   rotten_tomatoes: { tomatometer: 0-100, url? }
 *   metacritic: { score: 0-100, url? }
 *   as_of: YYYY-MM-DD（有任一评分则必填）
 *   source_note?: string
 *
 * 列表：最多豆瓣 + IMDb 两枚
 * 详情：豆瓣 + IMDb 优先，有则追加 RT / MC；全无则不渲染评分区
 */

function formatVotes(n) {
  if (n == null) return "";
  if (n >= 10000) return (n / 10000).toFixed(n >= 100000 ? 0 : 1) + "万";
  return String(n);
}

function badgeHtml(kind, label, scoreText, url) {
  const cls = "badge badge--" + kind;
  const inner =
    '<span class="badge__label">' + label + "</span>" +
    '<span class="badge__score">' + scoreText + "</span>";
  if (url) {
    return (
      '<a class="' + cls + '" href="' + url + '" target="_blank" rel="noopener noreferrer">' +
      inner + "</a>"
    );
  }
  return '<span class="' + cls + '">' + inner + "</span>";
}

/** @param {object|null|undefined} ratings @param {"list"|"detail"} mode */
function renderRatingBadges(ratings, mode) {
  if (!ratings || typeof ratings !== "object") return "";

  const parts = [];
  const db = ratings.douban;
  const im = ratings.imdb;

  if (db && typeof db.score === "number") {
    parts.push(badgeHtml("douban", "豆瓣", db.score.toFixed(1), db.url));
  }
  if (im && typeof im.score === "number") {
    parts.push(badgeHtml("imdb", "IMDb", im.score.toFixed(1), im.url));
  }

  if (mode === "detail") {
    const rt = ratings.rotten_tomatoes;
    const mc = ratings.metacritic;
    if (rt && typeof rt.tomatometer === "number") {
      parts.push(badgeHtml("rt", "RT", rt.tomatometer + "%", rt.url));
    }
    if (mc && typeof mc.score === "number") {
      parts.push(badgeHtml("mc", "MC", String(mc.score), mc.url));
    }
  }

  if (!parts.length) return "";
  return parts.join("");
}

/** 详情页完整评分区（含 as_of）；无评分则返回空字符串 */
function renderDetailRatingsBlock(ratings) {
  const badges = renderRatingBadges(ratings, "detail");
  if (!badges) return "";
  let html = '<div class="detail-badges">' + badges + "</div>";
  if (ratings.as_of) {
    html +=
      '<p class="detail-ratings-asof">评分截至 ' +
      ratings.as_of +
      "</p>";
  }
  return html;
}

window.SilverRatings = {
  renderRatingBadges,
  renderDetailRatingsBlock,
  formatVotes,
};
