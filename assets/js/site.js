/**
 * 银幕金句 · 站点工具
 * 页面根路径：body[data-base] 如 "" / "../" / "../../"
 * 产品字段：line / film_title（M1）；旧键 quote / movie 仅作兼容回退
 */

function siteBase() {
  const b = document.body && document.body.getAttribute("data-base");
  return b != null ? b : "";
}

function asset(path) {
  return siteBase() + path.replace(/^\//, "");
}

async function loadQuotes() {
  const url = asset("data/quotes.json");
  const res = await fetch(url);
  if (!res.ok) throw new Error("无法加载 quotes.json (" + res.status + ")");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/** 仅 published；无 status 字段时视为已发布（兼容） */
function publishedQuotes(quotes) {
  return (quotes || []).filter(function (q) {
    return !q.status || q.status === "published";
  });
}

function lineOf(q) {
  return q.line || q.quote || "";
}
function filmTitleOf(q) {
  return q.film_title || q.movie || "";
}

function quoteDetailHref(id) {
  return asset("quotes/" + id + "/");
}

function quoteListHref() {
  return asset("quotes/");
}

function cardHtml(q) {
  const R = window.SilverRatings;
  const badges = R.renderRatingBadges(q.ratings, "list");
  const poster = asset(q.poster);
  const title = filmTitleOf(q);
  const line = lineOf(q);
  return (
    '<article class="quote-card">' +
    '<a href="' + quoteDetailHref(q.id) + '">' +
    '<div class="quote-card__poster"><img src="' + poster + '" alt="' +
    escapeAttr(title) + ' 海报示意（占位）" loading="lazy"></div>' +
    '<div class="quote-card__body">' +
    '<p class="quote-card__quote">' + escapeHtml(line) + "</p>" +
    '<p class="quote-card__meta"><strong>' + escapeHtml(title) + "</strong> · " +
    q.year + "</p>" +
    (badges ? '<div class="quote-card__badges">' + badges + "</div>" : "") +
    "</div></a></article>"
  );
}

/** 首页精选：优先 featured=true，否则取前 limit 条 published */
function featuredQuotes(quotes, limit) {
  limit = limit || 5;
  const pub = publishedQuotes(quotes);
  const feat = pub.filter(function (q) { return q.featured === true; });
  const list = feat.length ? feat : pub;
  return list.slice(0, Math.min(5, Math.max(3, limit === 5 ? Math.min(5, list.length) : limit)));
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

window.SilverSite = {
  siteBase,
  asset,
  loadQuotes,
  publishedQuotes,
  featuredQuotes,
  lineOf,
  filmTitleOf,
  quoteDetailHref,
  quoteListHref,
  cardHtml,
  escapeHtml,
  escapeAttr,
};
