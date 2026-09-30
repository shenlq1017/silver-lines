// 生成小红书配图：6 个独立 1080x1440 页面
// 用法：node xhs/build-cards.mjs  →  xhs/out/card-N.html
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'out');
mkdirSync(out, { recursive: true });

const FONT = `<link rel="preconnect" href="https://fonts.loli.net">
<link rel="preconnect" href="https://gstatic.loli.net" crossorigin>
<link href="https://fonts.loli.net/css2?family=Noto+Sans+SC:wght@400;500&family=Noto+Serif+SC:wght@400;500;600&display=swap" rel="stylesheet">`;

const BASE = `
*{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
html,body{width:1080px;height:1440px;overflow:hidden}
body{background:#f6f2ea;color:#26221b;font-family:var(--serif)}
:root{
  --paper:#f6f2ea;--paper-card:#fffdf7;--line:#e3dccb;--line-strong:#d5cdb8;
  --ink:#26221b;--ink-soft:#57503f;--ink-dim:#8d8574;
  --gold:#9c7c2e;--gold-strong:#7d6324;--gold-soft:rgba(156,124,46,.12);
  --serif:"Noto Serif SC","Songti SC","SimSun",Georgia,serif;
  --sans:"Noto Sans SC","PingFang SC","Helvetica Neue",sans-serif;
}
.card{position:relative;width:1080px;height:1440px;overflow:hidden;background:var(--paper)}
.pad{position:absolute;inset:0;padding:100px 92px 0}
.grain{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(1200px 700px at 18% 8%,rgba(255,255,255,.7),transparent 60%),
             radial-gradient(900px 600px at 92% 96%,rgba(156,124,46,.07),transparent 65%)}
.eyebrow{font-family:var(--sans);font-size:25px;letter-spacing:.32em;color:var(--gold)}
.rule{height:1px;background:var(--line-strong)}
.rule--gold{height:2px;width:92px;background:var(--gold);opacity:.6;border:0}
h2{font-size:58px;line-height:1.42;font-weight:600;letter-spacing:.01em}
.foot{position:absolute;left:92px;right:92px;bottom:58px;display:flex;justify-content:space-between;
  align-items:baseline;font-family:var(--sans);font-size:23px;color:var(--ink-dim);letter-spacing:.06em}
.foot b{font-family:var(--serif);font-weight:500;color:var(--ink-soft)}
.mk{color:var(--gold)}
`;

/* ---------- 通用：金句条目 ---------- */
function line({ q, film, year, note, db }) {
  const meta = [`<b>${film}</b>`, `<span>·</span>`, `<span>${year}</span>`]
    .concat(note ? [`<span class="dot"></span>`, `<span>${note}</span>`] : [])
    .concat(db ? [`<span class="db">豆瓣 ${db}</span>`] : [])
    .join('');
  return `<div class="item"><p class="q"><span class="mk">「</span>${q}<span class="mk">」</span></p>
    <p class="m">${meta}</p></div>`;
}

const WALL_CSS = `
.wall .hint{margin-top:18px;font-family:var(--sans);font-size:26px;color:var(--ink-dim)}
.wall .list{margin-top:40px}
.wall .item{padding:52px 0}
.wall .item + .item{border-top:1px solid var(--line)}
.wall .item .q{font-size:47px;line-height:1.62}
.wall .item .m{margin-top:26px;display:flex;align-items:center;gap:17px;font-family:var(--sans);
  font-size:25px;color:var(--ink-dim)}
.wall .item .m b{font-family:var(--serif);font-weight:500;color:var(--ink-soft)}
.wall .item .m .dot{width:5px;height:5px;border-radius:50%;background:var(--line-strong)}
.wall .item .m .db{color:#237a3a;border:1px solid rgba(46,158,79,.3);background:rgba(46,158,79,.08);
  border-radius:6px;padding:4px 13px;font-size:22px}
`;

/* ---------- 卡片定义 ---------- */
const cards = [];

cards.push(`
<section class="card c1"><div class="grain"></div><div class="pad">
  <div class="brand"><div class="logo">片</div>
    <div><div class="bn">片语</div><div class="bs">Silver Lines</div></div></div>
  <div class="rule" style="margin:56px 0 0"></div>
  <h1>电影只是<em>出处</em><br>句子才是<em>主角</em></h1>
  <p class="sub">一个只做电影台词的摘抄站。<br>每一句，都是银幕上真的被说出来的话。</p>
  <div class="nums">
    <div class="num"><i>965</i><span>收录句子</span></div>
    <div class="num"><i>963</i><span>出自影片</span></div>
    <div class="num"><i>1075</i><span>标签</span></div>
  </div>
</div>
<div class="foot"><span>片语 · Silver Lines</span><span><b>01</b> / 06</span></div>
<style>
.c1 .logo{width:66px;height:66px;border:2px solid var(--gold);border-radius:15px;display:flex;
  align-items:center;justify-content:center;color:var(--gold-strong);font-size:34px;font-weight:600}
.c1 .brand{display:flex;align-items:center;gap:22px}
.c1 .bn{font-size:46px;font-weight:600;letter-spacing:.06em}
.c1 .bs{font-family:var(--sans);font-size:21px;letter-spacing:.28em;color:var(--gold);margin-top:6px}
.c1 h1{font-size:112px;line-height:1.36;font-weight:600;margin-top:132px}
.c1 h1 em{font-style:normal;color:var(--gold-strong)}
.c1 .sub{margin-top:52px;font-size:37px;line-height:1.88;color:var(--ink-soft)}
.c1 .nums{position:absolute;left:92px;right:92px;bottom:178px;display:flex}
.c1 .num{flex:1;text-align:center}
.c1 .num+.num{border-left:1px solid var(--line-strong)}
.c1 .num i{display:block;font-style:normal;font-size:74px;font-weight:600;color:var(--gold-strong);line-height:1}
.c1 .num span{display:block;margin-top:20px;font-family:var(--sans);font-size:25px;color:var(--ink-dim);letter-spacing:.1em}
</style></section>`);

cards.push(`
<section class="card c2">
  <img class="still" src="../../movies/shawshank-hope/still.jpg" alt="">
  <div class="veil"></div>
  <div class="top">SILVER LINES · 详情页</div>
  <div class="txt">
    <p class="q"><span class="mk">「</span>希望是美好的，<br>也许是人间至善，<br>而美好的事物永不消逝。<span class="mk">」</span></p>
    <p class="en">Hope is a good thing, maybe the best of things,<br>and no good thing ever dies.</p>
    <div class="meta"><b>肖申克的救赎</b><span>·</span><span>1994</span><span class="badge">豆瓣 9.7</span></div>
  </div>
  <div class="foot f"><span>全屏静帧，只叠一句台词</span><span><b>02</b> / 06</span></div>
<style>
.c2{background:#0d0b09}
.c2 .still{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 32%}
.c2 .veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,8,6,.5) 0%,rgba(10,8,6,.04) 26%,rgba(10,8,6,.74) 62%,rgba(8,6,5,.94) 100%)}
.c2 .top{position:absolute;left:88px;top:82px;font-family:var(--sans);font-size:24px;letter-spacing:.3em;color:rgba(243,239,230,.7)}
.c2 .txt{position:absolute;left:88px;right:88px;bottom:186px;color:#f3efe6}
.c2 .q{font-size:54px;line-height:1.74;font-weight:500;text-shadow:0 2px 26px rgba(0,0,0,.6)}
.c2 .q .mk{color:#d8b64a}
.c2 .en{margin-top:32px;font-family:var(--sans);font-style:italic;font-size:28px;line-height:1.62;color:rgba(243,239,230,.62)}
.c2 .meta{margin-top:34px;display:flex;align-items:center;gap:19px;font-family:var(--sans);font-size:27px;color:rgba(243,239,230,.84)}
.c2 .meta b{font-family:var(--serif);font-weight:500}
.c2 .badge{border:1px solid rgba(216,182,74,.5);color:#d8b64a;border-radius:999px;padding:7px 20px;font-size:23px}
.c2 .foot{color:rgba(243,239,230,.5)}.c2 .foot b{color:rgba(243,239,230,.78)}
</style></section>`);

cards.push(`
<section class="card wall"><div class="grain"></div><div class="pad">
  <p class="eyebrow">SELECTED LINES</p>
  <div class="rule rule--gold" style="margin:26px 0 38px"></div>
  <h2>有些句子，<br>是为了某一刻准备的</h2>
  <p class="hint">摘自片语集 · 共 965 句</p>
  <div class="list">
    ${line({ q: '不疯魔，不成活。', film: '霸王别姬', year: 1993, note: '段小楼', db: 9.6 })}
    ${line({ q: '如果再也见不到你，<br>祝你早安，午安，晚安。', film: '楚门的世界', year: 1998, note: 'Truman', db: 9.4 })}
    ${line({ q: '及时行乐。孩子们，<br>让你们的生命变得非凡。', film: '死亡诗社', year: 1989, note: 'John Keating', db: 9.2 })}
  </div>
</div>
<div class="foot"><span>片语 · Silver Lines</span><span><b>03</b> / 06</span></div>
</section>`);

cards.push(`
<section class="card wall"><div class="grain"></div><div class="pad">
  <p class="eyebrow">VERIFIED LINES</p>
  <div class="rule rule--gold" style="margin:26px 0 38px"></div>
  <h2>核不到出处的句子，<br>我不放进来</h2>
  <p class="hint">逐字对白 · 非主题概括</p>
  <div class="list">
    ${line({ q: '爱是唯一能超越<br>时间与空间的力量。', film: '星际穿越', year: 2014, note: 'Brand', db: 9.4 })}
    ${line({ q: '人生总是这么痛苦吗？<br>还是只有童年如此？', film: '这个杀手不太冷', year: 1994, note: 'Mathilda', db: 9.4 })}
    ${line({ q: '她们穿白衣，<br>可没人把她们当天使。', film: '嘉年华', year: 2017, note: '本站今日一句' })}
  </div>
</div>
<div class="foot"><span>片语 · Silver Lines</span><span><b>04</b> / 06</span></div>
</section>`);

cards.push(`
<section class="card c5"><div class="grain"></div><div class="pad">
  <p class="eyebrow">RULES</p>
  <div class="rule rule--gold" style="margin:26px 0 38px"></div>
  <h2>做这个站，<br>我给自己定了三条规矩</h2>
  <p class="lead">台词截图存了几百张，再也没打开过——<br>刷得越多，记住越少。</p>
  <div class="rows">
    <div class="row"><div class="k">壹</div><div class="v"><strong>只放真正说过的话</strong>
      <p>逐字核对的银幕对白，不做"主题概括句"。核不到出处，就不入库。</p></div></div>
    <div class="row"><div class="k">贰</div><div class="v"><strong>没有播放器，没有盗链</strong>
      <p>这里不提供观影，也不指向任何片源。它只负责让一句话留得住。</p></div></div>
    <div class="row"><div class="k">叁</div><div class="v"><strong>一句一屏，让你停下来</strong>
      <p>全屏静帧叠一句台词，可配背景音乐。不是清单，是摘抄本。</p></div></div>
  </div>
</div>
<div class="foot"><span>片语 · Silver Lines</span><span><b>05</b> / 06</span></div>
<style>
.c5 .lead{margin-top:30px;font-size:31px;line-height:1.86;color:var(--ink-soft)}
.c5 .rows{margin-top:40px}
.c5 .row{display:flex;gap:32px;padding:36px 0;align-items:flex-start}
.c5 .row+.row{border-top:1px solid var(--line)}
.c5 .k{flex:0 0 62px;height:62px;border-radius:50%;background:var(--gold-soft);color:var(--gold-strong);
  font-family:var(--sans);font-size:26px;display:flex;align-items:center;justify-content:center;
  border:1px solid rgba(156,124,46,.22)}
.c5 .v{flex:1;padding-top:5px}
.c5 .v strong{display:block;font-size:37px;font-weight:600;line-height:1.5}
.c5 .v p{margin-top:14px;font-family:var(--sans);font-size:26px;line-height:1.74;color:var(--ink-dim)}
</style></section>`);

cards.push(`
<section class="card c6"><div class="grain"></div><div class="pad">
  <p class="eyebrow">WHAT'S INSIDE</p>
  <div class="rule rule--gold" style="margin:26px 0 38px"></div>
  <h2>站不大，<br>能做的事刚好够用</h2>
  <div class="grid">
    <div class="cell"><i>DAILY</i><strong>今日一句</strong><p>每天固定呈现同一句，不刷屏、不打扰。</p></div>
    <div class="cell"><i>RANDOM</i><strong>随机来一句</strong><p>让光影替你抽签，抽到哪句算哪句。</p></div>
    <div class="cell"><i>COLLECT</i><strong>片语集</strong><p>按分组、标签、年代筛选，支持搜索排序。</p></div>
    <div class="cell"><i>FAVORITE</i><strong>收藏</strong><p>看到对的那句先存下来，慢慢用。</p></div>
    <div class="cell"><i>SOUND</i><strong>背景音乐</strong><p>详情页可开音乐，配全屏静帧，适合发呆。</p></div>
    <div class="cell"><i>NIGHT</i><strong>深色模式</strong><p>暖夜影院风，晚上看比白天更对味。</p></div>
  </div>
  <div class="close">
    <p class="big">豆瓣 Top250 + 影史经典 716 部<br>1920 — 2023，一个人慢慢挖</p>
    <p class="small">纯静态站 · 开源在 GitHub · 手机浏览器直接打开</p>
  </div>
</div>
<div class="foot"><span>片语 · Silver Lines</span><span><b>06</b> / 06</span></div>
<style>
.c6 .grid{margin-top:36px;display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line-strong);
  border:1px solid var(--line-strong)}
.c6 .cell{background:var(--paper-card);padding:30px 32px;min-height:170px}
.c6 .cell strong{display:block;font-size:34px;font-weight:600}
.c6 .cell p{margin-top:13px;font-family:var(--sans);font-size:23px;line-height:1.66;color:var(--ink-dim)}
.c6 .cell i{display:block;font-style:normal;font-family:var(--sans);font-size:20px;letter-spacing:.22em;
  color:var(--gold);margin-bottom:14px}
.c6 .close{margin-top:30px;text-align:center}
.c6 .close .big{font-size:37px;font-weight:500;color:var(--gold-strong);line-height:1.56}
.c6 .close .small{margin-top:14px;font-family:var(--sans);font-size:24px;color:var(--ink-dim)}
</style></section>`);

cards.forEach((body, i) => {
  const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">
<title>card-${i + 1}</title>${FONT}<style>${BASE}${i === 2 || i === 3 ? WALL_CSS : ''}</style>
</head><body>${body}</body></html>`;
  writeFileSync(join(out, `card-${i + 1}.html`), html);
});
console.log('生成 ' + cards.length + ' 页 →', out);
