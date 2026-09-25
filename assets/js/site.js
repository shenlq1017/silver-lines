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

var AUDIO_ICON_ON_SVG =
  '<svg class="detail-audio-btn__icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<path d="M4 10v4h3.2L12 18.5V5.5L7.2 10H4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
  '<path d="M15.2 9.2c1.1 1.1 1.1 4.5 0 5.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
  '<path d="M17.5 7c2.2 2.1 2.2 7.9 0 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
  "</svg>";

var AUDIO_ICON_OFF_SVG =
  '<svg class="detail-audio-btn__icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<path d="M4 10v4h3.2L12 18.5V5.5L7.2 10H4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
  '<path d="M16 9.5l4 5M20 9.5l-4 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
  "</svg>";

var BGM_STORAGE_KEY = "silver-lines-bgm";
var BGM_SRC = "assets/audio/ambient-loop.mp3";

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
    '<div class="detail-corner-tools">' +
    '<button type="button" class="detail-audio-btn" aria-pressed="false" aria-label="打开背景音乐 Open ambient music" title="打开背景音乐">' +
    AUDIO_ICON_OFF_SVG +
    "</button>" +
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
    "</div>" +
    '<audio id="detail-bgm" class="detail-bgm" src="' +
    escapeAttr(asset(BGM_SRC)) +
    '" loop preload="none"></audio>' +
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

  bindDetailAudio(root);
}


/**
 * 详情氛围乐：默认静音；点击 unmute+play+loop；再点 pause
 * sessionStorage key: silver-lines-bgm = on|off（进页仍默认不自动出声）
 */
function bindDetailAudio(container) {
  const root = container || document.getElementById("detail-root");
  if (!root) return;
  const btn = root.querySelector(".detail-audio-btn");
  const audio = root.querySelector("#detail-bgm") || root.querySelector(".detail-bgm");
  if (!btn || !audio) return;
  if (btn.dataset.bound === "1") return;
  btn.dataset.bound = "1";

  audio.loop = true;
  audio.preload = "none";
  audio.volume = 0.4;

  function setUi(playing) {
    btn.setAttribute("aria-pressed", playing ? "true" : "false");
    btn.setAttribute(
      "aria-label",
      playing
        ? "关闭背景音乐 Mute ambient music"
        : "打开背景音乐 Open ambient music"
    );
    btn.setAttribute("title", playing ? "关闭背景音乐" : "打开背景音乐");
    btn.classList.toggle("is-playing", !!playing);
    btn.innerHTML = playing ? AUDIO_ICON_ON_SVG : AUDIO_ICON_OFF_SVG;
  }

  function pauseBgm() {
    try {
      audio.pause();
    } catch (e) {}
    setUi(false);
  }

  function playBgm() {
    audio.muted = false;
    audio.volume = 0.4;
    const p = audio.play();
    if (p && typeof p.then === "function") {
      return p.then(function () {
        setUi(true);
        try {
          sessionStorage.setItem(BGM_STORAGE_KEY, "on");
        } catch (e) {}
      }).catch(function () {
        setUi(false);
        btn.setAttribute("title", "请再点一次以播放背景音乐");
      });
    }
    setUi(true);
    try {
      sessionStorage.setItem(BGM_STORAGE_KEY, "on");
    } catch (e) {}
  }

  setUi(false);

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (!audio.paused && !audio.ended) {
      pauseBgm();
      try {
        sessionStorage.setItem(BGM_STORAGE_KEY, "off");
      } catch (err) {}
    } else {
      playBgm();
    }
  });

  function onLeave() {
    pauseBgm();
  }
  window.addEventListener("pagehide", onLeave);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      /* keep session preference; pause to avoid background audio */
      if (!audio.paused) audio.pause();
    }
  });
}


window.SilverSite.renderDetail = renderDetail;
window.SilverSite.bindDetailInfoPanel = bindDetailInfoPanel;
window.SilverSite.bindDetailAudio = bindDetailAudio;
window.SilverSite.titleEnOf = titleEnOf;
window.SilverSite.lineEnOf = lineEnOf;
