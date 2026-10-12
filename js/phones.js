// Slide 8, "But almost everyone carries a phone": scale, as a unit chart.
// Left: the whole Epistorm-Mix survey, 1,930 people, as one square; then 91% of US adults own a
// smartphone (Pew Research Center, Mobile Fact Sheet, surveys of February to June 2025). Right: one
// panel of the Epistorm mobility panel, about 1 million people (the dashboard documentation gives
// 700,000 to 1.2 million per 8-week panel), as squares of 1,930: 518 of them, streaming in column by
// column while the counter runs up.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const SURVEY = 1930, PANEL = 1e6, NSQ = Math.round(PANEL / SURVEY);   // 518
  function start(container) {
    const W = 1150, H = 455, FILL = 3600, DELAY = 400;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const icon = (x, y, z, name, c, p) => { const fo = el('foreignObject', { x, y, width: z, height: z }, p);
      fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${z}px;height:${z}px;background:${c};-webkit-mask:url(icons/${name}.svg) center/contain no-repeat;mask:url(icons/${name}.svg) center/contain no-repeat"></div>`; };
    const GX = 400, GY = 196, COLS = 37, ROWS = Math.ceil(NSQ / COLS), P = Math.min((W - GX) / COLS, (H - GY - 6) / ROWS), S = P * 0.82;

    // left: the survey, one square
    icon(0, 14, 56, 'clipboard-list', '#253494');
    txt(72, 56, 'Epistorm-Mix', { 'font-size': 30, 'font-weight': 700, fill: '#222' });
    txt(0, 140, '1,930', { 'font-size': 84, 'font-weight': 700, fill: '#253494' });
    txt(0, 176, 'people, the whole survey', { 'font-size': 22, fill: '#555' });
    el('rect', { x: 0, y: 200, width: S, height: S, rx: 1.5, fill: '#253494' });
    txt(S + 12, 200 + S - 1, '= one square', { 'font-size': 20, fill: '#777' });
    // left, after the fill: how many people carry one
    const own = el('g', { opacity: 0 });
    el('line', { x1: 0, y1: 262, x2: 340, y2: 262, stroke: '#c5cdd8', 'stroke-width': 1.5 }, own);
    txt(0, 346, '91%', { 'font-size': 84, 'font-weight': 700, fill: '#2c7fb8' }, own);
    txt(0, 380, 'of US adults own a smartphone', { 'font-size': 22, fill: '#555' }, own);
    txt(0, 408, 'Pew Research Center, 2025', { 'font-size': 18, fill: '#888' }, own);

    // right: one phone panel
    icon(GX, 14, 56, 'mobile-screen-button', '#2c7fb8');
    txt(GX + 64, 56, 'Phones', { 'font-size': 30, 'font-weight': 700, fill: '#222' });
    const count = txt(GX, 140, '', { 'font-size': 84, 'font-weight': 700, fill: '#2c7fb8' });
    txt(GX + 400, 108, 'people in every 8-week panel', { 'font-size': 22, fill: '#555' });
    txt(GX + 400, 136, '700,000 to 1.2 million', { 'font-size': 20, fill: '#777' });
    txt(GX + 400, 164, 'mobility.epistorm.org', { 'font-size': 20, 'font-weight': 700, fill: '#2c7fb8' });
    const sq = [];
    for (let k = 0; k < NSQ; k++) { const c = Math.floor(k / ROWS), r = k % ROWS;
      sq.push(el('rect', { x: GX + c * P, y: GY + r * P, width: S, height: S, rx: 1.5, fill: '#2c7fb8', opacity: 0 })); }
    container.innerHTML = ''; container.appendChild(svg);

    let t0 = null, raf = null, shown = 0;
    function frame(t) {
      if (t0 === null) t0 = t;
      const u = Math.max(0, Math.min(1, (t - t0 - DELAY) / FILL)), e = 1 - Math.pow(1 - u, 2.2), n = Math.round(e * NSQ);
      for (; shown < n; shown++) sq[shown].setAttribute('opacity', 1);
      count.textContent = u >= 1 ? '~1 million' : (e * PANEL / 1e6).toFixed(1) + ' million';
      const c = Math.max(0, Math.min(1, (t - t0 - DELAY - FILL - 400) / 600)); own.setAttribute('opacity', c);
      raf = c < 1 ? requestAnimationFrame(frame) : null;
    }
    return { play() { if (!raf && own.getAttribute('opacity') !== '1') raf = requestAnimationFrame(frame); }, pause() { cancelAnimationFrame(raf); raf = null; t0 = null; } };
  }
  window.startPhones = start;
})();
