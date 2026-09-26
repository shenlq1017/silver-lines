/**
 * 片语 Silver Lines · 站点工具
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

/* —— 摘抄卡：台词为主体，海报为小邮票；左上角心形收藏 —— */
function cardHtml(q) {
  const R = window.SilverRatings;
  const badges = R.renderRatingBadges(q.ratings, "list");
  const poster = asset(q.poster);
  const title = filmTitleOf(q);
  const line = lineOf(q);
  const faved = favHas(q.id);
  return (
    '<article class="quote-card">' +
    '<button type="button" class="fav-toggle card-fav' + (faved ? " is-active" : "") +
    '" data-fav-id="' + escapeAttr(q.id) + '" aria-pressed="' + (faved ? "true" : "false") +
    '" aria-label="收藏此句" title="收藏此句">' +
    (faved ? HEART_FILLED_SVG : HEART_SVG) +
    "</button>" +
    '<a href="' + quoteDetailHref(q.id) + '">' +
    '<div class="quote-card__body">' +
    '<p class="quote-card__quote">' + escapeHtml(line) + "</p>" +
    '<p class="quote-card__meta"><strong>' + escapeHtml(title) + "</strong> · " +
    q.year +
    "</p>" +
    (badges ? '<div class="quote-card__badges">' + badges + "</div>" : "") +
    "</div>" +
    '<div class="quote-card__stamp"><img src="' + poster + '" alt="' +
    escapeAttr(title) + ' 海报" loading="lazy"></div>' +
    "</a></article>"
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

/* —— 今日一句：按日期 seed，同日所有访客同一条 —— */
function dailyQuote(quotes) {
  const pub = publishedQuotes(quotes);
  if (!pub.length) return null;
  const d = new Date();
  const key = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return pub[h % pub.length];
}

/* —— 随机来一句 —— */
function randomQuote(quotes) {
  const pub = publishedQuotes(quotes);
  if (!pub.length) return null;
  return pub[Math.floor(Math.random() * pub.length)];
}

/* —— 统计：句子数 / 影片数 / 标签数 —— */
function statsOf(quotes) {
  const pub = publishedQuotes(quotes);
  const films = {};
  const tags = {};
  pub.forEach(function (q) {
    films[filmTitleOf(q)] = true;
    (q.tags || []).forEach(function (t) { if (t) tags[t] = true; });
  });
  return { count: pub.length, films: Object.keys(films).length, tags: Object.keys(tags).length };
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
  dailyQuote,
  randomQuote,
  statsOf,
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

var BGM_STORAGE_KEY = "silver-lines-bgm"; // localStorage：on|off，全站记忆
var FAV_STORAGE_KEY = "silver-lines-favs"; // localStorage：收藏的台词 id 数组（新在前）

/* —— 收藏：localStorage，全站通用 —— */
function favRead() {
  try {
    var raw = JSON.parse(localStorage.getItem(FAV_STORAGE_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(function (x) { return typeof x === "string" || typeof x === "number"; })
      .map(String);
  } catch (e) {
    return [];
  }
}
function favHas(id) {
  return favRead().indexOf(String(id)) !== -1;
}
/** 切换收藏；返回切换后是否为已收藏（新收藏插到最前） */
function favToggle(id) {
  id = String(id);
  var ids = favRead();
  var i = ids.indexOf(id);
  var added = i === -1;
  if (added) ids.unshift(id);
  else ids.splice(i, 1);
  try {
    localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {}
  try {
    document.dispatchEvent(new CustomEvent("silver:favs-change"));
  } catch (e) {}
  return added;
}

var HEART_SVG =
  '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<path d="M12 20.4l-1-0.9C6 15.2 3 12.5 3 9.2 3 6.5 5.1 4.4 7.8 4.4c1.5 0 3 0.7 4.2 2 1.2-1.3 2.7-2 4.2-2 2.7 0 4.8 2.1 4.8 4.8 0 3.3-3 6-8 10.3l-1 0.9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
  "</svg>";
var HEART_FILLED_SVG =
  '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<path d="M12 20.4l-1-0.9C6 15.2 3 12.5 3 9.2 3 6.5 5.1 4.4 7.8 4.4c1.5 0 3 0.7 4.2 2 1.2-1.3 2.7-2 4.2-2 2.7 0 4.8 2.1 4.8 4.8 0 3.3-3 6-8 10.3l-1 0.9z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
  "</svg>";

/**
 * 全局氛围乐：单例 audio + localStorage 记忆，跨页面不重置。
 * 浏览器拦截自动播放时，等首次用户交互再出声。
 */
var SilverBgm = (function () {
  var audio = null;
  var btns = [];
  var gestureArmed = false;

  function readPref() {
    try {
      return localStorage.getItem(BGM_STORAGE_KEY) === "on";
    } catch (e) {
      return false;
    }
  }
  function writePref(on) {
    try {
      localStorage.setItem(BGM_STORAGE_KEY, on ? "on" : "off");
    } catch (e) {}
  }

  function ensureAudio() {
    if (audio) return audio;
    audio = document.createElement("audio");
    audio.id = "site-bgm";
    audio.className = "site-bgm";
    audio.loop = true;
    audio.preload = "metadata";
    audio.volume = 0.45;
    audio.innerHTML =
      '<source src="' + escapeAttr(asset("assets/audio/ambient-loop.mp3")) + '" type="audio/mpeg">' +
      '<source src="' + escapeAttr(asset("assets/audio/ambient-loop.ogg")) + '" type="audio/ogg">';
    document.body.appendChild(audio);
    audio.addEventListener("play", function () { syncUi(true); });
    audio.addEventListener("pause", function () { syncUi(false); });
    return audio;
  }

  function isPlaying() {
    return !!(audio && !audio.paused && !audio.ended);
  }

  function syncUi(playing) {
    btns.forEach(function (b) {
      b.classList.toggle("is-playing", !!playing);
      b.setAttribute("aria-pressed", playing ? "true" : "false");
      var label = playing ? "关闭氛围乐" : "打开氛围乐";
      b.setAttribute("aria-label", label);
      b.setAttribute("title", label);
      b.innerHTML = playing ? AUDIO_ICON_ON_SVG : AUDIO_ICON_OFF_SVG;
    });
  }

  function armFirstGesture() {
    if (gestureArmed) return;
    gestureArmed = true;
    function onGesture() {
      document.removeEventListener("pointerdown", onGesture, true);
      document.removeEventListener("keydown", onGesture, true);
      gestureArmed = false;
      if (readPref() && audio) play();
    }
    document.addEventListener("pointerdown", onGesture, true);
    document.addEventListener("keydown", onGesture, true);
  }

  function play() {
    var a = ensureAudio();
    a.muted = false;
    var p = a.play();
    if (p && typeof p.then === "function") {
      p.catch(function (err) {
        syncUi(false);
        if (err && err.name === "NotAllowedError") {
          armFirstGesture();
          btns.forEach(function (b) {
            b.setAttribute("title", "浏览器已拦截播放，点击页面任意处继续");
          });
        }
      });
    }
  }

  function toggle() {
    if (isPlaying()) {
      writePref(false);
      try { audio.pause(); } catch (e) {}
      syncUi(false);
    } else {
      writePref(true);
      play();
    }
  }

  /** 注册一个开关按钮（详情页角落按钮 / 悬浮按钮），立即同步图标 */
  function registerButton(btn) {
    if (!btn || btn.dataset.bgmBound === "1") return;
    btn.dataset.bgmBound = "1";
    btns.push(btn);
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });
    syncUi(isPlaying() || readPref());
  }

  /** 每页自动初始化：非详情页创建右下角悬浮开关；记忆为开则尝试续播 */
  function boot() {
    if (!document.body.classList.contains("page-detail")) {
      var fab = document.createElement("button");
      fab.type = "button";
      fab.className = "bgm-fab";
      fab.setAttribute("aria-pressed", "false");
      document.body.appendChild(fab);
      registerButton(fab);
    }
    if (readPref()) play();
  }

  return {
    toggle: toggle,
    play: play,
    registerButton: registerButton,
    isPlaying: isPlaying,
    isEnabled: readPref,
    boot: boot,
  };
})();

/**
 * 详情页：全屏 still(cover) + 台词叠字(C1) + 右上角信息悬浮框
 * 不渲染 curator_note / license_note / poster；元信息默认收起
 */
function renderDetail(q) {
  lastDetailQuote = q;
  const R = window.SilverRatings;
  const still = asset(q.still);
  const title = filmTitleOf(q);
  const titleEn = titleEnOf(q);
  const line = lineOf(q);
  const lineEn = lineEnOf(q);
  const stillAlt = q.still_alt || (title + " 剧照氛围示意");

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

  document.title = title + " · 片语";

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
    '<button type="button" class="detail-audio-btn" aria-pressed="false" aria-label="打开氛围乐 Open ambient music" title="打开氛围乐">' +
    AUDIO_ICON_OFF_SVG +
    "</button>" +
    '<button type="button" class="fav-toggle detail-fav-btn' + (favHas(q.id) ? " is-active" : "") +
    '" data-fav-id="' + escapeAttr(q.id) + '" aria-pressed="' + (favHas(q.id) ? "true" : "false") +
    '" aria-label="收藏此句" title="收藏此句">' +
    (favHas(q.id) ? HEART_FILLED_SVG : HEART_SVG) +
    "</button>" +
    '<button type="button" class="detail-copy-btn" aria-label="复制台词" title="复制台词">' +
    COPY_ICON_SVG +
    "</button>" +
    '<button type="button" class="detail-share-btn" aria-label="生成分享图" title="生成分享图">' +
    IMAGE_ICON_SVG +
    "</button>" +
    '<div class="detail-info-anchor">' +
    '<button type="button" class="detail-info-btn" aria-label="出处信息" aria-expanded="false" aria-controls="detail-info-panel">' +
    INFO_ICON_SVG +
    "</button>" +
    '<div id="detail-info-panel" class="detail-info-panel" role="dialog" aria-label="出处信息" hidden>' +
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
    "</section>"
  );
}

/**
 * 角落信息：hover / click 切换；Esc / 点空白关闭；移出延迟 180ms
 */
/* —— 浏览历史 / 复制台词 / 分享图 / 键盘导航 —— */
var HISTORY_STORAGE_KEY = "silver-lines-history";
var lastDetailQuote = null; /* renderDetail 记录当前台词，供绑定函数使用 */

function historyRead() {
  try {
    var raw = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]");
    return Array.isArray(raw) ? raw.map(String) : [];
  } catch (e) {
    return [];
  }
}
/** 记录浏览历史：去重置顶，最多保留 24 条 */
function recordHistory(id) {
  id = String(id);
  var ids = historyRead();
  var i = ids.indexOf(id);
  if (i !== -1) ids.splice(i, 1);
  ids.unshift(id);
  if (ids.length > 24) ids = ids.slice(0, 24);
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {}
}

var COPY_ICON_SVG =
  '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
  '<path d="M5 15V6a2 2 0 0 1 2-2h9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
  "</svg>";
var IMAGE_ICON_SVG =
  '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<rect x="3.5" y="5" width="17" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
  '<circle cx="9" cy="10" r="1.6" fill="currentColor"/>' +
  '<path d="M4.5 17l4.8-4.8 3.2 3.2 3-3 4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
  "</svg>";

function quotePlainText(q) {
  var s = "「" + lineOf(q) + "」";
  var en = lineEnOf(q);
  if (en) s += "\n" + en;
  s += "\n——《" + filmTitleOf(q) + "》" + (q.year ? "· " + q.year : "");
  return s;
}

function copyTextToClipboard(text, feedbackBtn) {
  function ok() {
    showBubble(feedbackBtn, "已复制台词");
  }
  function fallback() {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var okFlag = false;
    try {
      okFlag = document.execCommand("copy");
    } catch (e) {}
    ta.remove();
    showBubble(feedbackBtn, okFlag ? "已复制台词" : "复制失败");
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(ok, fallback);
  } else {
    fallback();
  }
}

function ensureShareModal() {
  var m = document.querySelector(".share-modal");
  if (m) return m;
  m = document.createElement("div");
  m.className = "share-modal";
  m.hidden = true;
  m.innerHTML =
    '<div class="share-modal__backdrop"></div>' +
    '<div class="share-modal__panel" role="dialog" aria-modal="true" aria-label="分享图预览">' +
    '<button type="button" class="share-modal__close" aria-label="关闭">×</button>' +
    '<canvas class="share-modal__canvas" width="1080" height="1560"></canvas>' +
    '<a class="share-modal__download" download>下载图片</a>' +
    "</div>";
  document.body.appendChild(m);
  m.querySelector(".share-modal__close").addEventListener("click", function () {
    m.hidden = true;
  });
  m.querySelector(".share-modal__backdrop").addEventListener("click", function () {
    m.hidden = true;
  });
  return m;
}

/** CJK 逐字换行 */
function wrapCjkText(ctx, text, maxW) {
  var lines = [];
  var cur = "";
  Array.from(text).forEach(function (ch) {
    if (cur && ctx.measureText(cur + ch).width > maxW) {
      lines.push(cur);
      cur = ch;
    } else {
      cur += ch;
    }
  });
  if (cur) lines.push(cur);
  return lines;
}

/** 生成 1080x1560 金句分享卡：剧照暗化做底，台词居中，底部影片信息 */
function drawShareCard(canvas, q, done) {
  var ctx = canvas.getContext("2d");
  var W = canvas.width;
  var H = canvas.height;
  var quote = lineOf(q);
  var en = lineEnOf(q) || "";
  var title = filmTitleOf(q);

  function finish() {
    ctx.strokeStyle = "rgba(216, 182, 74, 0.55)";
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    /* 「」引号角标 */
    ctx.strokeStyle = "#d8b64a";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(160, 210);
    ctx.lineTo(120, 210);
    ctx.quadraticCurveTo(90, 210, 90, 240);
    ctx.lineTo(90, 280);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W - 160, H - 210);
    ctx.lineTo(W - 120, H - 210);
    ctx.quadraticCurveTo(W - 90, H - 210, W - 90, H - 240);
    ctx.lineTo(W - 90, H - 280);
    ctx.stroke();

    /* 台词 + 译文，整体垂直居中 */
    var qSize = Array.from(quote).length > 40 ? 48 : Array.from(quote).length > 22 ? 58 : 68;
    ctx.font = qSize + 'px "Noto Serif SC", "Songti SC", serif';
    var qLines = wrapCjkText(ctx, quote, W - 260);
    var qLh = Math.round(qSize * 1.8);
    var eSize = 30;
    var eLh = 52;
    var eLines = [];
    if (en) {
      ctx.font = eSize + 'px Georgia, "Times New Roman", serif';
      eLines = wrapCjkText(ctx, en, W - 320);
    }
    var blockH = qLines.length * qLh + (eLines.length ? eLines.length * eLh + 50 : 0);
    var y = (H - blockH) / 2 + qSize * 0.8;

    ctx.textAlign = "center";
    ctx.fillStyle = "#f3efe6";
    ctx.font = qSize + 'px "Noto Serif SC", "Songti SC", serif';
    qLines.forEach(function (ln) {
      ctx.fillText(ln, W / 2, y);
      y += qLh;
    });
    if (eLines.length) {
      y += 50 - qLh + eLh * 0.4;
      ctx.fillStyle = "rgba(243, 239, 230, 0.55)";
      ctx.font = eSize + 'px Georgia, "Times New Roman", serif';
      eLines.forEach(function (ln) {
        ctx.fillText(ln, W / 2, y);
        y += eLh;
      });
    }

    /* 底部影片信息与站名 */
    ctx.fillStyle = "#d8b64a";
    ctx.font = '42px "Noto Serif SC", "Songti SC", serif';
    ctx.fillText("《" + title + "》" + (q.year ? " · " + q.year : ""), W / 2, H - 190);
    ctx.fillStyle = "rgba(243, 239, 230, 0.4)";
    ctx.font = '26px "Noto Sans SC", sans-serif';
    ctx.fillText("片语 · Silver Lines", W / 2, H - 128);
    if (done) done();
  }

  function baseBg() {
    ctx.fillStyle = "#121216";
    ctx.fillRect(0, 0, W, H);
  }

  var img = new Image();
  img.onload = function () {
    var s = Math.max(W / img.width, H / img.height);
    ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
    ctx.fillStyle = "rgba(13, 13, 16, 0.9)";
    ctx.fillRect(0, 0, W, H);
    finish();
  };
  img.onerror = function () {
    baseBg();
    finish();
  };
  img.src = asset(q.still || q.poster || "");
}

function openShareModal(q) {
  var m = ensureShareModal();
  m.hidden = false;
  var canvas = m.querySelector("canvas");
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#121216";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  var dl = m.querySelector(".share-modal__download");
  dl.removeAttribute("href");
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      drawShareCard(canvas, q, function () {
        dl.href = canvas.toDataURL("image/png");
        dl.setAttribute("download", "片语-" + q.id + ".png");
      });
    });
  } else {
    drawShareCard(canvas, q, function () {
      dl.href = canvas.toDataURL("image/png");
      dl.setAttribute("download", "片语-" + q.id + ".png");
    });
  }
}

/** 详情页键盘导航：←/→ 上一句下一句，S 收藏，F 静帧全屏 */
function bindDetailKeys(q) {
  if (window.__silverDetailKeysBound) return;
  window.__silverDetailKeysBound = true;
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
    var modal = document.querySelector(".share-modal");
    if (modal && !modal.hidden) {
      if (e.key === "Escape") modal.hidden = true;
      return;
    }
    var k = e.key;
    if (k === "s" || k === "S") {
      var fav = document.querySelector(".fav-toggle");
      if (fav) fav.click();
      return;
    }
    if (k === "f" || k === "F") {
      var stage = document.querySelector(".detail-stage");
      if (!stage) return;
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (stage.requestFullscreen) {
        stage.requestFullscreen();
      }
      return;
    }
    if (k !== "ArrowLeft" && k !== "ArrowRight") return;
    SilverSite.loadQuotes()
      .then(function (data) {
        var list = publishedQuotes(data);
        var i = -1;
        for (var j = 0; j < list.length; j++) {
          if (String(list[j].id) === String(q.id)) { i = j; break; }
        }
        if (i === -1) return;
        var n = k === "ArrowLeft" ? i - 1 : i + 1;
        if (n < 0 || n >= list.length) return;
        location.href = quoteDetailHref(list[n].id);
      })
      .catch(function () {});
  });
}

function bindDetailActions(root) {
  var q = lastDetailQuote;
  if (!q) return;
  recordHistory(q.id);

  var copyBtn = root.querySelector(".detail-copy-btn");
  if (copyBtn && !copyBtn.dataset.bound) {
    copyBtn.dataset.bound = "1";
    copyBtn.addEventListener("click", function () {
      copyTextToClipboard(quotePlainText(q), copyBtn);
    });
  }
  var shareBtn = root.querySelector(".detail-share-btn");
  if (shareBtn && !shareBtn.dataset.bound) {
    shareBtn.dataset.bound = "1";
    shareBtn.addEventListener("click", function () {
      openShareModal(q);
    });
  }
  bindDetailKeys(q);
  renderRelated(q);
}

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
  let pinned = false;

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
  bindDetailActions(root);
}

/**
 * 详情氛围乐：接入全局 SilverBgm（localStorage 记忆，跨页面生效）
 */
function bindDetailAudio(container) {
  const root = container || document.getElementById("detail-root");
  if (!root) return;
  const btn = root.querySelector(".detail-audio-btn");
  if (!btn) return;
  window.SilverBgm.registerButton(btn);
}

window.SilverSite.renderDetail = renderDetail;
window.SilverSite.bindDetailInfoPanel = bindDetailInfoPanel;
window.SilverSite.bindDetailAudio = bindDetailAudio;
window.SilverBgm = SilverBgm;
window.SilverSite.favRead = favRead;
window.SilverSite.favHas = favHas;
window.SilverSite.favToggle = favToggle;
window.SilverSite.historyRead = historyRead;
window.SilverSite.recordHistory = recordHistory;
window.SilverSite.quotePlainText = quotePlainText;
window.SilverSite.titleEnOf = titleEnOf;
window.SilverSite.lineEnOf = lineEnOf;

/* —— 片语集：筛选 / 排序 / 分页 / URL 同步 —— */

var LIST_PAGE_SIZE = 24;

/* 分组：top250 / classics（未来新分组自动出现） */
var GROUP_LABELS = {
  top250: "豆瓣 Top250",
  classics: "影史经典",
};

var SORT_OPTIONS = [
  { value: "default", label: "默认顺序" },
  { value: "imdb", label: "IMDb 评分" },
  { value: "douban", label: "豆瓣评分" },
  { value: "year", label: "年代" },
  { value: "title", label: "片名" },
];

var SEARCH_ICON_SVG =
  '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
  '<path d="M15.8 15.8L20.5 20.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
  "</svg>";

function decadeOf(year) {
  var y = Number(year);
  if (!isFinite(y)) return "";
  return Math.floor(y / 10) * 10 + "s";
}

/** 展示用：1920s → 1920年代 */
function decadeLabel(decade) {
  return String(decade).replace(/^(\d+)0s$/, "$10年代");
}

/** 从 published 列表收集标签，按出现次数降序（全量；截取交给调用方） */
function collectTags(quotes, max) {
  var counts = {};
  (quotes || []).forEach(function (q) {
    (q.tags || []).forEach(function (t) {
      if (!t) return;
      counts[t] = (counts[t] || 0) + 1;
    });
  });
  var all = Object.keys(counts).sort(function (a, b) {
    var d = counts[b] - counts[a];
    return d !== 0 ? d : (a < b ? -1 : a > b ? 1 : 0);
  });
  var keys = max == null ? all : all.slice(0, max);
  return keys.map(function (tag) {
    return { tag: tag, count: counts[tag] };
  });
}

/** 按 decade 动态生成，升序 */
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

/** 收集 group 字段（未设置的不计入），按 count 降序 */
function collectGroups(quotes) {
  var counts = {};
  (quotes || []).forEach(function (q) {
    var g = q.group;
    if (!g) return;
    counts[g] = (counts[g] || 0) + 1;
  });
  return Object.keys(counts)
    .sort(function (a, b) {
      return counts[b] - counts[a];
    })
    .map(function (g) {
      return { group: g, label: GROUP_LABELS[g] || g, count: counts[g] };
    });
}

/**
 * 筛选；保持原数组顺序。
 * opts: { featured?, fav?, favIds?, tag?, decade?, group?, q? }
 */
function filterQuotes(quotes, opts) {
  opts = opts || {};
  var list = quotes || [];
  if (opts.featured) {
    list = list.filter(function (q) {
      return q.featured === true;
    });
  }
  if (opts.fav) {
    var favIds = opts.favIds || [];
    var favSet = favIds instanceof Set ? favIds : new Set(favIds.map(String));
    list = list.filter(function (q) {
      return favSet.has(String(q.id));
    });
  }
  if (opts.group) {
    var group = String(opts.group);
    list = list.filter(function (q) {
      return q.group === group;
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

/** 排序（不改原数组）；sort: default|imdb|douban|year|title */
function sortQuotes(list, sort) {
  var arr = (list || []).slice();
  function num(q, k) {
    var s = q.ratings && q.ratings[k] && q.ratings[k].score;
    return typeof s === "number" ? s : -1;
  }
  if (sort === "imdb") arr.sort(function (a, b) { return num(b, "imdb") - num(a, "imdb"); });
  else if (sort === "douban") arr.sort(function (a, b) { return num(b, "douban") - num(a, "douban"); });
  else if (sort === "year") arr.sort(function (a, b) { return Number(a.year) - Number(b.year); });
  else if (sort === "title") {
    arr.sort(function (a, b) {
      return String(filmTitleOf(a)).localeCompare(String(filmTitleOf(b)), "zh");
    });
  }
  return arr;
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
  var favRaw = params.get("fav");
  var sort = params.get("sort") || "";
  var validSort = SORT_OPTIONS.some(function (o) { return o.value === sort; });
  return {
    page: page,
    tag: params.get("tag") || "",
    decade: params.get("decade") || "",
    group: params.get("group") || "",
    featured: featuredRaw === "1" || featuredRaw === "true",
    fav: favRaw === "1" || favRaw === "true",
    q: params.get("q") || "",
    sort: validSort ? sort : "default",
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
  if (state.group) params.set("group", String(state.group));
  if (state.featured) params.set("featured", "1");
  if (state.fav) params.set("fav", "1");
  if (state.q) params.set("q", String(state.q));
  if (state.sort && state.sort !== "default") params.set("sort", String(state.sort));
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
 * 挂载片语集列表：筛选条 + 摘抄卡 + 分页。
 * el: 根容器；options.pageSize 默认 24；options.quotes 可注入（测试用）
 */
function mountQuoteList(el, options) {
  if (!el) return null;
  options = options || {};
  var pageSize = options.pageSize || LIST_PAGE_SIZE;

  var toolbarEl = el.querySelector("[data-list-toolbar]") || null;
  var filtersEl = el.querySelector("[data-list-filters]") || null;
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
  if (!filtersEl) {
    filtersEl = document.createElement("div");
    filtersEl.setAttribute("data-list-filters", "");
    filtersEl.className = "list-filters";
    toolbarEl.after(filtersEl);
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
  var tagsExpanded = false;
  var searchTimer = null;
  /* 筛选面板默认收起；URL 带面板内筛选项时自动展开 */
  var filtersOpen = !!(state.tag || state.decade || state.group);

  function applyFilters() {
    return filterQuotes(allPublished, {
      featured: state.featured,
      fav: state.fav,
      favIds: favRead(),
      tag: state.tag,
      decade: state.decade,
      group: state.group,
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

  /** 输入时动态增删清空按钮（不重渲染工具栏，避免丢焦点） */
  function syncSearchClear() {
    var wrap = toolbarEl.querySelector(".list-search-wrap");
    if (!wrap) return;
    var btn = wrap.querySelector(".list-search-clear");
    if (state.q && !btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "list-search-clear";
      btn.setAttribute("data-action", "clear-q");
      btn.setAttribute("aria-label", "清空搜索");
      btn.textContent = "×";
      btn.addEventListener("click", function () {
        var inp = toolbarEl.querySelector("#list-search-q");
        if (inp) inp.value = "";
        btn.remove();
        setState({ q: "" }, true);
      });
      wrap.appendChild(btn);
    } else if (!state.q && btn) {
      btn.remove();
    }
  }

  /** 收藏数变化时同步「我的收藏」chip 计数 */
  function updateFavChip() {
    var btn = toolbarEl.querySelector('[data-action="fav"]');
    if (!btn) return;
    var n = favRead().length;
    var span = btn.querySelector(".list-chip__count");
    if (n) {
      if (!span) {
        span = document.createElement("span");
        span.className = "list-chip__count";
        btn.appendChild(span);
      }
      span.textContent = String(n);
    } else if (span) {
      span.remove();
    }
  }
  document.addEventListener("silver:favs-change", updateFavChip);

  function renderToolbar() {
    var tags = collectTags(allPublished, null);
    var topTags = tags.slice(0, 12);
    var decades = collectDecades(allPublished);
    var groups = collectGroups(allPublished);
    var panelCount = (state.group ? 1 : 0) + (state.tag ? 1 : 0) + (state.decade ? 1 : 0);

    var html = "";
    /* 行 0：大搜索框，独占一行置顶 */
    html += '<div class="list-search-wrap">';
    html += '<span class="list-search-wrap__icon" aria-hidden="true">' + SEARCH_ICON_SVG + "</span>";
    html += '<label class="visually-hidden" for="list-search-q">搜索影片或台词</label>';
    html +=
      '<input id="list-search-q" class="list-search" type="search" placeholder="搜索影片 / 台词…" value="' +
      escapeAttr(state.q) + '" autocomplete="off">';
    if (state.q) {
      html += '<button type="button" class="list-search-clear" data-action="clear-q" aria-label="清空搜索">×</button>';
    }
    html += "</div>";

    /* 行 1：筛选开关 + 快捷 + 排序 */
    html += '<div class="list-toolbar__row list-toolbar__row--head" role="toolbar" aria-label="筛选与排序">';
    html +=
      '<button type="button" class="list-chip list-chip--toggle" data-action="toggle-filters" aria-expanded="' +
      (filtersOpen ? "true" : "false") + '">' + FUNNEL_SVG + "筛选" +
      (panelCount ? '<span class="list-chip__badge">' + panelCount + "</span>" : "") +
      '<span class="list-chip__caret" aria-hidden="true">' + (filtersOpen ? "▴" : "▾") + "</span></button>";
    html +=
      '<button type="button" class="' + chipClass(!state.featured && !state.fav) +
      '" data-action="all" aria-pressed="' + (!state.featured && !state.fav ? "true" : "false") + '">全部</button>';
    html +=
      '<button type="button" class="' + chipClass(!!state.featured) +
      '" data-action="featured" aria-pressed="' + (state.featured ? "true" : "false") + '">精选</button>';
    var favCount = favRead().length;
    html +=
      '<button type="button" class="' + chipClass(!!state.fav) +
      '" data-action="fav" aria-pressed="' + (state.fav ? "true" : "false") + '">我的收藏' +
      (favCount ? '<span class="list-chip__count">' + favCount + "</span>" : "") + "</button>";
    html += '<span class="list-toolbar__spacer"></span>';
    html += '<label class="visually-hidden" for="list-sort">排序</label>';
    html += '<select id="list-sort" class="list-sort">';
    SORT_OPTIONS.forEach(function (o) {
      html += '<option value="' + o.value + '"' +
        (state.sort === o.value ? " selected" : "") + ">" + o.label + "</option>";
    });
    html += "</select></div>";

    /* 折叠面板：分组 / 标签 / 年代（默认收起） */
    if (filtersOpen) {
      html += '<div class="list-filters-panel">';
      if (groups.length) {
        html += '<div class="list-toolbar__row list-toolbar__row--scroll" role="toolbar" aria-label="分组筛选">';
        html += '<span class="list-toolbar__label">分组</span>';
        html += '<div class="list-toolbar__chips">';
        groups.forEach(function (g) {
          var on = state.group === g.group;
          html +=
            '<button type="button" class="' + chipClass(on) +
            '" data-action="group" data-value="' + escapeAttr(g.group) +
            '" aria-pressed="' + (on ? "true" : "false") + '">' +
            escapeHtml(g.label) + '<span class="list-chip__count">' + g.count + "</span></button>";
        });
        html += "</div></div>";
      }

      html += '<div class="list-toolbar__row" role="toolbar" aria-label="标签筛选">';
      html += '<span class="list-toolbar__label">标签</span>';
      html += '<div class="list-toolbar__chips">';
      topTags.forEach(function (t) {
        var on = state.tag === t.tag;
        html +=
          '<button type="button" class="' + chipClass(on) +
          '" data-action="tag" data-value="' + escapeAttr(t.tag) +
          '" aria-pressed="' + (on ? "true" : "false") + '">' +
          escapeHtml(t.tag) + '<span class="list-chip__count">' + t.count + "</span></button>";
      });
      if (tags.length > topTags.length) {
        html +=
          '<button type="button" class="list-chip" data-action="toggle-tags" aria-expanded="' +
          (tagsExpanded ? "true" : "false") + '">全部 ' + tags.length + " 个 ▾</button>";
      }
      html += "</div></div>";

      if (tagsExpanded) {
        html += '<div class="list-tags-panel" role="toolbar" aria-label="全部标签">';
        tags.forEach(function (t) {
          var on = state.tag === t.tag;
          html +=
            '<button type="button" class="' + chipClass(on) +
            '" data-action="tag" data-value="' + escapeAttr(t.tag) +
            '" aria-pressed="' + (on ? "true" : "false") + '">' +
            escapeHtml(t.tag) + '<span class="list-chip__count">' + t.count + "</span></button>";
        });
        html += "</div>";
      }

      html += '<div class="list-toolbar__row list-toolbar__row--scroll" role="toolbar" aria-label="年代筛选">';
      html += '<span class="list-toolbar__label">年代</span>';
      html += '<div class="list-toolbar__chips">';
      decades.forEach(function (d) {
        var on = state.decade === d.decade;
        html +=
          '<button type="button" class="' + chipClass(on) +
          '" data-action="decade" data-value="' + escapeAttr(d.decade) +
          '" aria-pressed="' + (on ? "true" : "false") + '">' +
          escapeHtml(decadeLabel(d.decade)) + '<span class="list-chip__count">' + d.count + "</span></button>";
      });
      html += "</div></div>";
      html += "</div>";
    }

    toolbarEl.innerHTML = html;

    toolbarEl.querySelectorAll("[data-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.getAttribute("data-action");
        var value = btn.getAttribute("data-value") || "";
        if (action === "all") setState({ featured: false, fav: false }, true);
        else if (action === "featured") setState({ featured: true, fav: false }, true);
        else if (action === "fav") setState({ fav: true, featured: false }, true);
        else if (action === "group") setState({ group: state.group === value ? "" : value }, true);
        else if (action === "tag") setState({ tag: state.tag === value ? "" : value }, true);
        else if (action === "decade") setState({ decade: state.decade === value ? "" : value }, true);
        else if (action === "toggle-tags") {
          tagsExpanded = !tagsExpanded;
          renderToolbar();
          updateChipStates();
        } else if (action === "toggle-filters") {
          filtersOpen = !filtersOpen;
          renderToolbar();
          updateChipStates();
        } else if (action === "clear-q") {
          var inp = toolbarEl.querySelector("#list-search-q");
          if (inp) inp.value = "";
          btn.remove();
          setState({ q: "" }, true);
        }
      });
    });

    var sortSel = toolbarEl.querySelector("#list-sort");
    if (sortSel) {
      sortSel.addEventListener("change", function () {
        setState({ sort: sortSel.value }, false);
      });
    }

    var input = toolbarEl.querySelector("#list-search-q");
    if (input) {
      input.addEventListener("input", function () {
        var val = input.value;
        if (searchTimer) clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
          setState({ q: val }, true);
          syncSearchClear();
        }, 200);
      });
    }
  }

  /** 活跃筛选摘要：可逐项移除 + 清空 */
  function renderFilters() {
    var items = [];
    if (state.featured) items.push({ key: "featured", label: "精选" });
    if (state.fav) items.push({ key: "fav", label: "我的收藏" });
    if (state.group) {
      var g = collectGroups(allPublished).filter(function (x) { return x.group === state.group; })[0];
      items.push({ key: "group", label: "分组 · " + (g ? g.label : state.group) });
    }
    if (state.tag) items.push({ key: "tag", label: "标签 · " + state.tag });
    if (state.decade) items.push({ key: "decade", label: "年代 · " + decadeLabel(state.decade) });
    if (state.q) items.push({ key: "q", label: "搜索 · " + state.q });

    if (!items.length) {
      filtersEl.hidden = true;
      filtersEl.innerHTML = "";
      return;
    }
    filtersEl.hidden = false;
    var html = '<span class="list-filters__label">已选</span>';
    items.forEach(function (it) {
      html +=
        '<button type="button" class="list-filters__chip" data-clear="' + it.key + '">' +
        escapeHtml(it.label) + '<span class="x" aria-hidden="true">×</span></button>';
    });
    html += '<button type="button" class="list-filters__clear" data-clear="all">清空筛选</button>';
    filtersEl.innerHTML = html;

    filtersEl.querySelectorAll("[data-clear]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-clear");
        if (key === "all") {
          setState({ featured: false, fav: false, group: "", tag: "", decade: "", q: "" }, true);
        } else {
          var patch = {};
          patch[key] = key === "featured" || key === "fav" ? false : "";
          setState(patch, true);
        }
      });
    });
  }

  function updateChipStates() {
    toolbarEl.querySelectorAll("[data-action]").forEach(function (btn) {
      var action = btn.getAttribute("data-action");
      var value = btn.getAttribute("data-value") || "";
      var on = false;
      if (action === "all") on = !state.featured && !state.fav;
      else if (action === "featured") on = !!state.featured;
      else if (action === "fav") on = !!state.fav;
      else if (action === "group") on = state.group === value;
      else if (action === "tag") on = state.tag === value;
      else if (action === "decade") on = state.decade === value;
      if (action !== "toggle-tags" && action !== "toggle-filters" && action !== "clear-q") {
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      }
    });
    var sortSel = toolbarEl.querySelector("#list-sort");
    if (sortSel) sortSel.value = state.sort;
  }

  function renderPager(result) {
    var html =
      '<p class="list-pager__meta">第 ' + result.page + "/" + result.totalPages +
      " 页 · 共 " + result.total + " 条</p>";
    html += '<div class="list-pager__nav" role="navigation" aria-label="分页">';
    html +=
      '<button type="button" class="list-pager__btn" data-page="' + (result.page - 1) +
      '" ' + (result.page <= 1 ? "disabled" : "") + ">" + CHEVRON_LEFT_SVG + "上一页</button>";
    buildPageNumbers(result.page, result.totalPages).forEach(function (n) {
      if (n === "…") {
        html += '<span class="list-pager__ellipsis" aria-hidden="true">…</span>';
        return;
      }
      var cur = n === result.page;
      html +=
        '<button type="button" class="list-pager__btn' + (cur ? " is-current" : "") +
        '" data-page="' + n + '"' + (cur ? ' aria-current="page"' : "") + ">" + n + "</button>";
    });
    html +=
      '<button type="button" class="list-pager__btn" data-page="' + (result.page + 1) +
      '" ' + (result.page >= result.totalPages ? "disabled" : "") + ">下一页" + CHEVRON_RIGHT_SVG + "</button>";
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
    renderFilters();
    var filtered = sortQuotes(applyFilters(), state.sort);
    var result = paginate(filtered, state.page, pageSize);
    state.page = result.page;
    writeListQuery(state);

    if (!result.total) {
      gridEl.innerHTML = state.fav
        ? '<p class="list-empty">还没有收藏的台词。回到片语集，点亮卡片左上角的 ♥，它们就会住进这里。</p>'
        : '<p class="list-empty">没有符合条件的台词。试试移除部分筛选，或换个关键词。</p>';
    } else {
      gridEl.innerHTML = result.items.map(cardHtml).join("");
    }
    renderPager(result);

    if (noteEl) {
      noteEl.textContent =
        "共 " + allPublished.length +
        " 条 · 当前筛选 " + result.total +
        " 条 · 每页 " + pageSize +
        " · 电影只是出处，句子才是主角";
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
        '<p class="error-msg">无法加载数据。请从站点根启动 python3 -m http.server。</p>';
      console.error(e);
    });

  return { getState: function () { return state; }, setState: setState };
}

window.SilverSite.LIST_PAGE_SIZE = LIST_PAGE_SIZE;
window.SilverSite.GROUP_LABELS = GROUP_LABELS;
window.SilverSite.SORT_OPTIONS = SORT_OPTIONS;
window.SilverSite.decadeOf = decadeOf;
window.SilverSite.decadeLabel = decadeLabel;
window.SilverSite.collectTags = collectTags;
window.SilverSite.collectDecades = collectDecades;
window.SilverSite.collectGroups = collectGroups;
window.SilverSite.filterQuotes = filterQuotes;
window.SilverSite.sortQuotes = sortQuotes;
window.SilverSite.paginate = paginate;
window.SilverSite.parseListQuery = parseListQuery;
window.SilverSite.writeListQuery = writeListQuery;
window.SilverSite.mountQuoteList = mountQuoteList;

/* —— 全站初始化：收藏按钮事件委托 + 导航注入 + 氛围乐 —— */

/* 品牌 logo 标记：「」引号圆角方块，呼应台词卡片的引号包裹 */
var LOGO_MARK_SVG =
  '<svg class="logo-mark" width="26" height="26" viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
  '<rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="rgba(156, 124, 46, 0.10)" stroke="currentColor" stroke-width="1.8"/>' +
  '<path d="M13.5 9.5H11.5Q9.5 9.5 9.5 11.5V14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>' +
  '<path d="M18.5 22.5H20.5Q22.5 22.5 22.5 20.5V18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>' +
  '<circle cx="21.5" cy="10.5" r="1.6" fill="var(--stage-gold, #d8b64a)"/>' +
  "</svg>";

var NAV_HEART_SVG =
  '<svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<path d="M12 20.4l-1-0.9C6 15.2 3 12.5 3 9.2 3 6.5 5.1 4.4 7.8 4.4c1.5 0 3 0.7 4.2 2 1.2-1.3 2.7-2 4.2-2 2.7 0 4.8 2.1 4.8 4.8 0 3.3-3 6-8 10.3l-1 0.9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
  "</svg>";

var FUNNEL_SVG =
  '<svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<path d="M4 5.5h16l-6.2 7.2v5.1l-3.6 1.7v-6.8L4 5.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
  "</svg>";

var CHEVRON_LEFT_SVG =
  '<svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<path d="M14.5 5.5L8 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
  "</svg>";

var CHEVRON_RIGHT_SVG =
  '<svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<path d="M9.5 5.5L16 12l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
  "</svg>";

var ARROW_RIGHT_SVG =
  '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<path d="M5 12h13M13 6.5L18.5 12 13 17.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
  "</svg>";

/** 点击反馈：按钮上方飘出提示气泡（fixed，不受 overflow 裁剪） */
function showBubble(btn, text) {
  var r = btn.getBoundingClientRect();
  var b = document.createElement("span");
  b.className = "fav-bubble";
  b.textContent = text;
  b.style.left = Math.round(r.left + r.width / 2) + "px";
  b.style.top = Math.max(8, Math.round(r.top - 10)) + "px";
  document.body.appendChild(b);
  setTimeout(function () { b.remove(); }, 1200);
}
window.SilverSite.showBubble = showBubble;

/* —— 深色模式 —— */
var THEME_STORAGE_KEY = "silver-lines-theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

/** 初始化主题：localStorage 优先，否则跟随系统；返回当前主题 */
function initTheme() {
  var stored = null;
  try {
    stored = localStorage.getItem(THEME_STORAGE_KEY);
  } catch (e) {}
  var theme =
    stored === "dark" || stored === "light"
      ? stored
      : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  applyTheme(theme);
  return theme;
}

var MOON_SVG =
  '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
  "</svg>";
var SUN_SVG =
  '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
  '<path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2L5.6 5.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
  "</svg>";

/* —— 专题合辑：按主题标签聚合 —— */
var COLLECTIONS = [
  { title: "爱与誓言", tags: ["爱情", "婚姻", "誓言", "欲望"], desc: "心动、承诺与欲望的形状" },
  { title: "成长与青春", tags: ["成长", "青春", "记忆", "选择"], desc: "长大是一瞬间的事" },
  { title: "家与羁绊", tags: ["家庭", "亲情", "友谊", "友情"], desc: "血缘内外的相互奔赴" },
  { title: "自由与希望", tags: ["自由", "希望", "尊严", "命运"], desc: "牢笼之外，总有天空" },
  { title: "战争与生存", tags: ["战争", "生存", "历史", "权力"], desc: "极端境遇下的人性底色" },
  { title: "罪与谜", tags: ["犯罪", "悬疑", "惊悚", "复仇"], desc: "深渊里的凝视与回响" },
  { title: "星际与梦境", tags: ["科幻", "奇幻", "冒险"], desc: "想象力尽头的辽阔" },
  { title: "孤独与自我", tags: ["孤独", "身份", "信仰", "女性"], desc: "一个人也要走下去" },
];
window.SilverSite.COLLECTIONS = COLLECTIONS;

/** 详情页底部：相关台词推荐（同标签优先，其次同年代） */
function renderRelated(q) {
  SilverSite.loadQuotes()
    .then(function (data) {
      var list = publishedQuotes(data);
      var qTags = q.tags || [];
      var scored = [];
      list.forEach(function (x) {
        if (String(x.id) === String(q.id)) return;
        var shared = 0;
        (x.tags || []).forEach(function (t) {
          if (qTags.indexOf(t) !== -1) shared++;
        });
        var score =
          shared * 2 +
          (decadeOf(x.year) === decadeOf(q.year) ? 1 : 0) +
          (filmTitleOf(x) === filmTitleOf(q) ? 1 : 0);
        if (score > 0) scored.push({ x: x, score: score, shared: shared });
      });
      scored.sort(function (a, b) { return b.score - a.score; });
      var top = scored.slice(0, 3);
      if (!top.length) return;
      var sec = document.createElement("section");
      sec.className = "related-section";
      sec.innerHTML =
        '<h2 class="related-section__title">相关台词</h2>' +
        '<div class="related-grid">' +
        top.map(function (item) {
          var sharedTag = "";
          if (item.shared) {
            qTags.some(function (t) {
              if ((item.x.tags || []).indexOf(t) !== -1) { sharedTag = t; return true; }
              return false;
            });
          }
          return (
            '<a class="related-card" href="' + quoteDetailHref(item.x.id) + '">' +
            '<p class="related-card__line">「' + escapeHtml(lineOf(item.x)) + "」</p>" +
            '<p class="related-card__meta">' + escapeHtml(filmTitleOf(item.x)) + " · " + (item.x.year || "") +
            (sharedTag ? " · " + escapeHtml(sharedTag) : "") +
            "</p></a>"
          );
        }).join("") +
        "</div>";
      var footer = document.querySelector(".site-footer");
      if (footer && footer.parentNode) footer.parentNode.insertBefore(sec, footer);
    })
    .catch(function () {});
}

(function initSiteChrome() {
  /* 心形收藏：事件委托，卡片 / 详情页通用，一页多处同 id 联动 */
  document.addEventListener("click", function (e) {
    var el = e.target;
    var btn = el && el.closest ? el.closest(".fav-toggle") : null;
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    var id = btn.getAttribute("data-fav-id");
    if (!id) return;
    var active = favToggle(id);
    var sel = '.fav-toggle[data-fav-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]';
    document.querySelectorAll(sel).forEach(function (b) {
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
      b.setAttribute("title", active ? "取消收藏" : "收藏此句");
      b.setAttribute("aria-label", active ? "取消收藏" : "收藏此句");
      b.innerHTML = active ? HEART_FILLED_SVG : HEART_SVG;
      /* 弹跳 + 光环反馈 */
      b.classList.remove("is-popping");
      void b.offsetWidth; /* 重启动画 */
      b.classList.add("is-popping");
      setTimeout(function () { b.classList.remove("is-popping"); }, 650);
    });
    showBubble(btn, active ? "已收藏 ♥" : "已取消收藏");
  });

  /* 导航：无「收藏」入口则注入，置于「关于」之前（惯例：关于放最后） */
  var nav = document.querySelector(".nav");
  if (nav && !nav.querySelector('a[href$="favorites/"]')) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = asset("favorites/");
    a.innerHTML = NAV_HEART_SVG + "收藏";
    try {
      if (location.pathname.replace(/\/+$/, "").endsWith("/favorites")) {
        a.setAttribute("aria-current", "page");
      }
    } catch (e) {}
    li.appendChild(a);
    var aboutLi = nav.querySelector('a[href$="about/"]');
    if (aboutLi && aboutLi.parentElement && aboutLi.parentElement.parentElement === nav) {
      nav.insertBefore(li, aboutLi.parentElement);
    } else {
      nav.appendChild(li);
    }
  }

  /* 导航「合辑」入口（插入收藏之前） */
  if (nav && !nav.querySelector('a[href$="collections/"]')) {
    var cli = document.createElement("li");
    var ca = document.createElement("a");
    ca.href = asset("collections/");
    ca.textContent = "合辑";
    try {
      if (location.pathname.replace(/\/+$/, "").endsWith("/collections")) {
        ca.setAttribute("aria-current", "page");
      }
    } catch (e) {}
    cli.appendChild(ca);
    var favLi = nav.querySelector('a[href$="favorites/"]');
    if (favLi && favLi.parentElement && favLi.parentElement.parentElement === nav) {
      nav.insertBefore(cli, favLi.parentElement);
    } else {
      nav.appendChild(cli);
    }
  }

  /* 深浅色主题切换按钮（导航末尾，状态持久化） */
  if (nav) {
    var currentTheme = initTheme();
    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "theme-toggle";
    function syncThemeBtn() {
      var dark = document.documentElement.getAttribute("data-theme") === "dark";
      toggle.innerHTML = dark ? SUN_SVG : MOON_SVG;
      toggle.setAttribute("aria-label", dark ? "切换浅色模式" : "切换深色模式");
      toggle.setAttribute("title", dark ? "切换浅色模式" : "切换深色模式");
    }
    syncThemeBtn();
    toggle.addEventListener("click", function () {
      var dark = document.documentElement.getAttribute("data-theme") === "dark";
      var next = dark ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch (e) {}
      syncThemeBtn();
    });
    currentTheme = null; /* 仅用于提前初始化 */
    var tli = document.createElement("li");
    tli.appendChild(toggle);
    nav.appendChild(tli);
  }

  /* 品牌 logo 标记 + favicon（全站统一注入，免改各页静态 HTML） */
  document.querySelectorAll(".logo").forEach(function (logo) {
    if (!logo.querySelector(".logo-mark")) {
      logo.insertAdjacentHTML("afterbegin", LOGO_MARK_SVG);
    }
  });
  if (!document.querySelector('link[rel="icon"]')) {
    var favLink = document.createElement("link");
    favLink.rel = "icon";
    favLink.type = "image/svg+xml";
    favLink.href = asset("assets/favicon.svg");
    document.head.appendChild(favLink);
  }

  SilverBgm.boot();
})();
