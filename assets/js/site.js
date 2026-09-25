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

/* —— 金句墙：筛选 / 分页 / URL 同步 —— */

var LIST_PAGE_SIZE = 24;

function decadeOf(year) {
  var y = Number(year);
  if (!isFinite(y)) return "";
  return Math.floor(y / 10) * 10 + "s";
}

/** 从 published 列表收集标签，按出现次数降序，最多 max 个（默认 12） */
function collectTags(quotes, max) {
  max = max == null ? 12 : max;
  var counts = {};
  (quotes || []).forEach(function (q) {
    (q.tags || []).forEach(function (t) {
      if (!t) return;
      counts[t] = (counts[t] || 0) + 1;
    });
  });
  return Object.keys(counts)
    .sort(function (a, b) {
      var d = counts[b] - counts[a];
      return d !== 0 ? d : (a < b ? -1 : a > b ? 1 : 0);
    })
    .slice(0, max)
    .map(function (tag) {
      return { tag: tag, count: counts[tag] };
    });
}

/** 按 decade（year//10*10 + "s"）动态生成，升序 */
function collectDecades(quotes) {
  var counts = {};
  (quotes || []).forEach(function (q) {
    var d = decadeOf(q.year);
    if (!d) return;
    counts[d] = (counts[d] || 0) + 1;
  });
  return Object.keys(counts)
    .sort()
    .map(function (decade) {
      return { decade: decade, count: counts[decade] };
    });
}

/**
 * 筛选；保持原数组顺序。
 * opts: { featured?, tag?, decade?, q? }
 */
function filterQuotes(quotes, opts) {
  opts = opts || {};
  var list = quotes || [];
  if (opts.featured) {
    list = list.filter(function (q) {
      return q.featured === true;
    });
  }
  if (opts.tag) {
    var tag = String(opts.tag);
    list = list.filter(function (q) {
      return (q.tags || []).indexOf(tag) !== -1;
    });
  }
  if (opts.decade) {
    var decade = String(opts.decade);
    list = list.filter(function (q) {
      return decadeOf(q.year) === decade;
    });
  }
  var needle = opts.q != null ? String(opts.q).trim().toLowerCase() : "";
  if (needle) {
    list = list.filter(function (q) {
      var title = (filmTitleOf(q) || "").toLowerCase();
      var line = (lineOf(q) || "").toLowerCase();
      return title.indexOf(needle) !== -1 || line.indexOf(needle) !== -1;
    });
  }
  return list;
}

/**
 * 分页。total=0 时 totalPages=1、page=1、items=[]。
 */
function paginate(items, page, pageSize) {
  pageSize = pageSize || LIST_PAGE_SIZE;
  var arr = items || [];
  var total = arr.length;
  var totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  var p = parseInt(page, 10);
  if (!isFinite(p) || p < 1) p = 1;
  if (p > totalPages) p = totalPages;
  var start = (p - 1) * pageSize;
  return {
    page: p,
    pageSize: pageSize,
    total: total,
    totalPages: totalPages,
    items: arr.slice(start, start + pageSize),
  };
}

function parseListQuery(search) {
  var raw =
    search != null
      ? search
      : typeof location !== "undefined"
        ? location.search
        : "";
  if (raw.charAt(0) === "?") raw = raw.slice(1);
  var params = new URLSearchParams(raw);
  var page = parseInt(params.get("page"), 10);
  if (!isFinite(page) || page < 1) page = 1;
  var featuredRaw = params.get("featured");
  return {
    page: page,
    tag: params.get("tag") || "",
    decade: params.get("decade") || "",
    featured: featuredRaw === "1" || featuredRaw === "true",
    q: params.get("q") || "",
  };
}

/** history.replaceState 同步 URL；省略默认值（page=1、空筛选） */
function writeListQuery(state) {
  state = state || {};
  var params = new URLSearchParams();
  var page = parseInt(state.page, 10);
  if (isFinite(page) && page > 1) params.set("page", String(page));
  if (state.tag) params.set("tag", String(state.tag));
  if (state.decade) params.set("decade", String(state.decade));
  if (state.featured) params.set("featured", "1");
  if (state.q) params.set("q", String(state.q));
  var qs = params.toString();
  var path =
    typeof location !== "undefined" && location.pathname
      ? location.pathname
      : "";
  var hash =
    typeof location !== "undefined" && location.hash ? location.hash : "";
  var url = path + (qs ? "?" + qs : "") + hash;
  if (typeof history !== "undefined" && history.replaceState) {
    history.replaceState(null, "", url);
  }
  return url;
}

function buildPageNumbers(current, totalPages) {
  if (totalPages <= 7) {
    var all = [];
    for (var i = 1; i <= totalPages; i++) all.push(i);
    return all;
  }
  var pages = [1];
  var start = Math.max(2, current - 1);
  var end = Math.min(totalPages - 1, current + 1);
  if (start > 2) pages.push("…");
  for (var j = start; j <= end; j++) pages.push(j);
  if (end < totalPages - 1) pages.push("…");
  pages.push(totalPages);
  return pages;
}

/**
 * 挂载金句墙列表：筛选条 + 网格 + 分页。
 * el: 根容器；options.pageSize 默认 24；options.quotes 可注入（测试用）
 */
function mountQuoteList(el, options) {
  if (!el) return null;
  options = options || {};
  var pageSize = options.pageSize || LIST_PAGE_SIZE;

  var toolbarEl = el.querySelector("[data-list-toolbar]") || null;
  var gridEl = el.querySelector("[data-list-grid]") || null;
  var pagerEl = el.querySelector("[data-list-pager]") || null;
  var noteEl =
    (options.noteEl && document.querySelector(options.noteEl)) ||
    document.querySelector("[data-list-note]") ||
    null;

  if (!toolbarEl) {
    toolbarEl = document.createElement("div");
    toolbarEl.setAttribute("data-list-toolbar", "");
    toolbarEl.className = "list-toolbar";
    el.insertBefore(toolbarEl, el.firstChild);
  }
  if (!gridEl) {
    gridEl = document.createElement("div");
    gridEl.setAttribute("data-list-grid", "");
    gridEl.className = "quote-grid";
    gridEl.setAttribute("aria-live", "polite");
    el.appendChild(gridEl);
  }
  if (!pagerEl) {
    pagerEl = document.createElement("div");
    pagerEl.setAttribute("data-list-pager", "");
    pagerEl.className = "list-pager";
    el.appendChild(pagerEl);
  }

  var allPublished = [];
  var state = parseListQuery(
    options.search != null ? options.search : undefined
  );
  var searchTimer = null;

  function applyFilters() {
    return filterQuotes(allPublished, {
      featured: state.featured,
      tag: state.tag,
      decade: state.decade,
      q: state.q,
    });
  }

  function setState(patch, resetPage) {
    Object.keys(patch).forEach(function (k) {
      state[k] = patch[k];
    });
    if (resetPage) state.page = 1;
    writeListQuery(state);
    render();
  }

  function chipClass(active) {
    return "list-chip" + (active ? " is-active" : "");
  }

  function updateChipStates() {
    toolbarEl.querySelectorAll("[data-action]").forEach(function (btn) {
      var action = btn.getAttribute("data-action");
      var value = btn.getAttribute("data-value") || "";
      var on = false;
      if (action === "all") on = !state.featured;
      else if (action === "featured") on = !!state.featured;
      else if (action === "tag") on = state.tag === value;
      else if (action === "decade") on = state.decade === value;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function renderToolbar() {
    var tags = collectTags(allPublished, 12);
    var decades = collectDecades(allPublished);

    var html = "";
    html +=
      '<div class="list-toolbar__row" role="toolbar" aria-label="快捷筛选">';
    html +=
      '<button type="button" class="' +
      chipClass(!state.featured) +
      '" data-action="all" aria-pressed="' +
      (!state.featured ? "true" : "false") +
      '">全部</button>';
    html +=
      '<button type="button" class="' +
      chipClass(!!state.featured) +
      '" data-action="featured" aria-pressed="' +
      (state.featured ? "true" : "false") +
      '">精选</button>';
    html += "</div>";

    html +=
      '<div class="list-toolbar__row list-toolbar__row--scroll" role="toolbar" aria-label="标签筛选">';
    html += '<span class="list-toolbar__label">标签</span>';
    html += '<div class="list-toolbar__chips">';
    tags.forEach(function (t) {
      var on = state.tag === t.tag;
      html +=
        '<button type="button" class="' +
        chipClass(on) +
        '" data-action="tag" data-value="' +
        escapeAttr(t.tag) +
        '" aria-pressed="' +
        (on ? "true" : "false") +
        '">' +
        escapeHtml(t.tag) +
        "</button>";
    });
    html += "</div></div>";

    html +=
      '<div class="list-toolbar__row list-toolbar__row--scroll" role="toolbar" aria-label="年代筛选">';
    html += '<span class="list-toolbar__label">年代</span>';
    html += '<div class="list-toolbar__chips">';
    decades.forEach(function (d) {
      var on = state.decade === d.decade;
      html +=
        '<button type="button" class="' +
        chipClass(on) +
        '" data-action="decade" data-value="' +
        escapeAttr(d.decade) +
        '" aria-pressed="' +
        (on ? "true" : "false") +
        '">' +
        escapeHtml(d.decade) +
        "</button>";
    });
    html += "</div></div>";

    html +=
      '<div class="list-toolbar__search">' +
      '<label class="visually-hidden" for="list-search-q">搜索影片或金句</label>' +
      '<input id="list-search-q" class="list-search" type="search" placeholder="搜索影片 / 金句…" value="' +
      escapeAttr(state.q) +
      '" autocomplete="off">' +
      "</div>";

    toolbarEl.innerHTML = html;

    toolbarEl.querySelectorAll("[data-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.getAttribute("data-action");
        var value = btn.getAttribute("data-value") || "";
        if (action === "all") {
          setState({ featured: false }, true);
        } else if (action === "featured") {
          setState({ featured: true }, true);
        } else if (action === "tag") {
          setState({ tag: state.tag === value ? "" : value }, true);
        } else if (action === "decade") {
          setState({ decade: state.decade === value ? "" : value }, true);
        }
      });
    });

    var input = toolbarEl.querySelector("#list-search-q");
    if (input) {
      input.addEventListener("input", function () {
        var val = input.value;
        if (searchTimer) clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
          setState({ q: val }, true);
        }, 200);
      });
    }
  }

  function renderPager(result) {
    var html =
      '<p class="list-pager__meta">第 ' +
      result.page +
      "/" +
      result.totalPages +
      " 页 · 共 " +
      result.total +
      " 条</p>";
    html += '<div class="list-pager__nav" role="navigation" aria-label="分页">';
    html +=
      '<button type="button" class="list-pager__btn" data-page="' +
      (result.page - 1) +
      '" ' +
      (result.page <= 1 ? "disabled" : "") +
      ">上一页</button>";
    buildPageNumbers(result.page, result.totalPages).forEach(function (n) {
      if (n === "…") {
        html += '<span class="list-pager__ellipsis" aria-hidden="true">…</span>';
        return;
      }
      var cur = n === result.page;
      html +=
        '<button type="button" class="list-pager__btn' +
        (cur ? " is-current" : "") +
        '" data-page="' +
        n +
        '"' +
        (cur ? ' aria-current="page"' : "") +
        ">" +
        n +
        "</button>";
    });
    html +=
      '<button type="button" class="list-pager__btn" data-page="' +
      (result.page + 1) +
      '" ' +
      (result.page >= result.totalPages ? "disabled" : "") +
      ">下一页</button>";
    html += "</div>";
    pagerEl.innerHTML = html;
    pagerEl.querySelectorAll("[data-page]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.disabled) return;
        var p = parseInt(btn.getAttribute("data-page"), 10);
        if (!isFinite(p)) return;
        setState({ page: p }, false);
        try {
          gridEl.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (e) {}
      });
    });
  }

  function render() {
    updateChipStates();
    var filtered = applyFilters();
    var result = paginate(filtered, state.page, pageSize);
    state.page = result.page;
    writeListQuery(state);

    if (!result.total) {
      gridEl.innerHTML =
        '<p class="list-empty">没有符合条件的金句。试试清空筛选或换个关键词。</p>';
    } else {
      gridEl.innerHTML = result.items.map(cardHtml).join("");
    }
    renderPager(result);

    if (noteEl) {
      noteEl.textContent =
        "共 " +
        allPublished.length +
        " 条 · 当前筛选 " +
        result.total +
        " 条 · 每页 " +
        pageSize +
        " · 评分截至见详情 · 静帧示意非原片截帧";
    }
  }

  function boot(quotes) {
    allPublished = publishedQuotes(quotes);
    renderToolbar();
    render();
  }

  if (options.quotes) {
    boot(options.quotes);
    return { state: state, reload: function () { render(); } };
  }

  gridEl.innerHTML = '<p class="error-msg">加载中…</p>';
  loadQuotes()
    .then(function (quotes) {
      boot(quotes);
    })
    .catch(function (e) {
      gridEl.innerHTML =
        '<p class="error-msg">无法加载 quotes.json。请从站点根目录启动 python3 -m http.server。</p>';
      console.error(e);
    });

  return { getState: function () { return state; }, setState: setState };
}

window.SilverSite.LIST_PAGE_SIZE = LIST_PAGE_SIZE;
window.SilverSite.decadeOf = decadeOf;
window.SilverSite.collectTags = collectTags;
window.SilverSite.collectDecades = collectDecades;
window.SilverSite.filterQuotes = filterQuotes;
window.SilverSite.paginate = paginate;
window.SilverSite.parseListQuery = parseListQuery;
window.SilverSite.writeListQuery = writeListQuery;
window.SilverSite.mountQuoteList = mountQuoteList;
