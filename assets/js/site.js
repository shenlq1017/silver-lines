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

function titleEnOf(q) {
  return q.film_title_en || q.movie_en || "";
}
function lineEnOf(q) {
  return q.line_en || q.quote_en || "";
}

var INFO_ICON_SVG =
  '<svg class="detail-info-btn__icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
  '<circle cx="12" cy="8" r="1.15" fill="currentColor" stroke="none"/>' +
  '<path d="M12 11.2v5.3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
  "</svg>";

/**
 * 详情页：全屏 still(cover) + 金句叠字(C1) + 右上角信息悬浮框
 * 不渲染 curator_note / license_note / poster；元信息默认收起
 */
function renderDetail(q) {
  const R = window.SilverRatings;
  const still = asset(q.still);
  const title = filmTitleOf(q);
  const titleEn = titleEnOf(q);
  const line = lineOf(q);
  const lineEn = lineEnOf(q);
  const stillAlt = q.still_alt || (title + " 氛围示意静帧（非原片截帧）");

  const tags = (q.tags || [])
    .slice(0, 3)
    .map(function (t) {
      return '<span class="tag">' + escapeHtml(t) + "</span>";
    })
    .join("");

  const lineLen = Array.from(line).length;
  let quoteSizeClass = "";
  if (lineLen <= 10) quoteSizeClass = " detail-quote--short";
  else if (lineLen > 22) quoteSizeClass = " detail-quote--long";

  const badges = R.renderRatingBadges(q.ratings, "detail");
  let ratingsHtml = "";
  if (badges) {
    ratingsHtml =
      '<div class="detail-info-panel__ratings">' +
      '<div class="detail-badges">' + badges + "</div>";
    if (q.ratings && q.ratings.as_of) {
      ratingsHtml +=
        '<p class="detail-ratings-asof">评分截至 ' +
        escapeHtml(q.ratings.as_of) +
        " · 策展快照</p>";
    }
    ratingsHtml += "</div>";
  }

  document.title = title + " · 银幕金句";

  return (
    '<section class="detail-stage">' +
    '<div class="detail-stage__still">' +
    '<img src="' + still + '" alt="' + escapeAttr(stillAlt) + '">' +
    '<div class="detail-stage__vignette" aria-hidden="true"></div>' +
    '<div class="detail-stage__bottom-fade" aria-hidden="true"></div>' +
    "</div>" +
    '<div class="detail-stage__quote-block">' +
    '<p class="detail-quote' + quoteSizeClass + '">' + escapeHtml(line) + "</p>" +
    (lineEn
      ? '<p class="detail-quote-en">' + escapeHtml(lineEn) + "</p>"
      : "") +
    "</div>" +
    '<div class="detail-info-anchor">' +
    '<button type="button" class="detail-info-btn" aria-label="影片信息" aria-expanded="false" aria-controls="detail-info-panel">' +
    INFO_ICON_SVG +
    "</button>" +
    '<div id="detail-info-panel" class="detail-info-panel" role="dialog" aria-label="影片信息" hidden>' +
    '<div class="detail-info-panel__head">' +
    '<div class="detail-info-panel__title-row">' +
    '<strong class="detail-info-panel__title">' + escapeHtml(title) + "</strong>" +
    '<span class="detail-info-panel__year">' + q.year + "</span>" +
    "</div>" +
    (titleEn
      ? '<p class="detail-info-panel__title-en">' + escapeHtml(titleEn) + "</p>"
      : "") +
    "</div>" +
    (q.character
      ? '<p class="detail-info-panel__row">角色 · ' + escapeHtml(q.character) + "</p>"
      : "") +
    (q.director
      ? '<p class="detail-info-panel__row">导演 · ' + escapeHtml(q.director) + "</p>"
      : "") +
    (tags
      ? '<div class="detail-info-panel__tags"><span class="tag-list">' + tags + "</span></div>"
      : "") +
    ratingsHtml +
    "</div>" +
    "</div>" +
    "</section>"
  );
}

/**
 * 角落信息：hover / click 切换；Esc / 点空白关闭；移出延迟 180ms
 */
function bindDetailInfoPanel(container) {
  const root = container || document.getElementById("detail-root");
  if (!root) return;
  const anchor = root.querySelector(".detail-info-anchor");
  if (!anchor || anchor.dataset.bound === "1") return;
  anchor.dataset.bound = "1";

  const btn = anchor.querySelector(".detail-info-btn");
  const panel = anchor.querySelector(".detail-info-panel");
  if (!btn || !panel) return;

  let open = false;
  let hideTimer = null;
  let pinned = false; /* click 钉住，直至 Esc / 空白 / 再点 */

  function clearHide() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  function setOpen(next) {
    open = !!next;
    if (open) {
      panel.hidden = false;
      panel.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      btn.classList.add("is-active");
    } else {
      panel.classList.remove("is-open");
      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      btn.classList.remove("is-active");
      pinned = false;
    }
  }

  function scheduleHide() {
    clearHide();
    hideTimer = setTimeout(function () {
      if (!pinned) setOpen(false);
    }, 180);
  }

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    clearHide();
    if (open && pinned) {
      setOpen(false);
    } else {
      pinned = true;
      setOpen(true);
    }
  });

  anchor.addEventListener("mouseenter", function () {
    clearHide();
    if (!pinned) setOpen(true);
  });

  anchor.addEventListener("mouseleave", function () {
    if (!pinned) scheduleHide();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) {
      setOpen(false);
      btn.focus();
    }
  });

  document.addEventListener("click", function (e) {
    if (!open) return;
    if (anchor.contains(e.target)) return;
    setOpen(false);
  });
}

window.SilverSite.renderDetail = renderDetail;
window.SilverSite.bindDetailInfoPanel = bindDetailInfoPanel;
window.SilverSite.titleEnOf = titleEnOf;
window.SilverSite.lineEnOf = lineEnOf;
