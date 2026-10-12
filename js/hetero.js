// "Neighbourhoods sort us by race, not by age": New York City's tracts, each shaded by how different
// its mix is from the city's (js/hetero-data.js, from figures/hetero_map.py). One shared YlGnBu scale;
// pale means the neighbourhood is the city in miniature, dark means it is nothing like the city. The
// race map lights up first, then the age map, then the two typical-tract numbers. Beside each city
// map, Manhattan enlarged (outlined on the city map), so the borough the talk keeps returning to is
// legible.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const YLGNBU = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'];
  const ramp = u => { const k = Math.max(0, Math.min(1, u)) * (YLGNBU.length - 1), i = Math.min(YLGNBU.length - 2, Math.floor(k)), f = k - i;
    const p = h => [1, 3, 5].map(j => parseInt(h.slice(j, j + 2), 16)), a = p(YLGNBU[i]), b = p(YLGNBU[i + 1]);
    return `rgb(${a.map((x, j) => Math.round(x + (b[j] - x) * f)).join(',')})`; };
  const VMAX = 0.7;
  function start(container) {
    const D = window.HETERO, W = 1150, H = 455;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    // each side: the city map, an outline where Manhattan is, and Manhattan enlarged beside it
    const MAP = 300, scm = MAP / Math.max(D.w, D.h), M = D.mn, IX = MAP + 26, IY = 40;
    const groups = [];
    [['race', 'By race and ethnicity', 0], ['age', 'By age', 570]].forEach(([key, title, x0], m) => {
      txt(x0, 26, title, { 'font-size': 26, 'font-weight': 700, fill: '#222' });
      const g = el('g', { opacity: 0 });
      const city = el('g', { transform: `translate(${x0},${IY}) scale(${scm})` }, g);
      D.tracts.forEach(t => { const v = t[1 + m]; el('path', { d: t[0], fill: v == null ? '#eceff3' : ramp(v / VMAX), stroke: '#fff', 'stroke-width': 0.6 / scm }, city); });
      const [bx, by, bw, bh] = M.box.map(v => v * scm), BX = x0 + bx, BY = IY + by;
      el('rect', { x: BX - 2, y: BY - 2, width: bw + 4, height: bh + 4, fill: 'none', stroke: '#444', 'stroke-width': 1.5, rx: 2 }, g);
      const FX = x0 + IX - 8, FY = IY - 6, FW = M.w + 16, FH = M.h + 12;           // frame around the inset
      el('rect', { x: FX, y: FY, width: FW, height: FH, fill: 'none', stroke: '#9aa4b2', 'stroke-width': 1.2, rx: 4 }, g);
      el('path', { d: `M${BX + bw + 2},${BY - 2} L${FX},${FY} M${BX + bw + 2},${BY + bh + 2} L${FX},${FY + FH}`, stroke: '#9aa4b2', 'stroke-width': 1.2, fill: 'none' }, g);
      const ins = el('g', { transform: `translate(${x0 + IX},${IY})` }, g);
      M.tracts.forEach(t => { const v = t[1 + m]; el('path', { d: t[0], fill: v == null ? '#eceff3' : ramp(v / VMAX), stroke: '#fff', 'stroke-width': 0.8 }, ins); });
      txt(x0 + IX + M.w + 8, IY + M.h + 30, 'Manhattan', { 'font-size': 20, 'font-weight': 700, fill: '#444', 'text-anchor': 'end' }, g);
      const st = el('g', { opacity: 0 });
      txt(x0, 398, Math.round(D.median[key] * 100) + '%', { 'font-size': 52, 'font-weight': 700, fill: '#253494' }, st);
      txt(x0 + 112, 382, 'different from the city,', { 'font-size': 20, fill: '#555' }, st);
      txt(x0 + 112, 404, 'in a typical tract', { 'font-size': 20, fill: '#555' }, st);
      groups.push(g, st);
    });
    // legend
    const defs = el('defs', {}), lg = el('linearGradient', { id: 'hetlg' }, defs);
    YLGNBU.forEach((c, i) => el('stop', { offset: `${i / (YLGNBU.length - 1) * 100}%`, 'stop-color': c }, lg));
    const LY = 446;
    el('rect', { x: 130, y: LY - 15, width: 220, height: 14, fill: 'url(#hetlg)', rx: 3 });
    txt(120, LY - 2, 'like the city', { 'font-size': 20, fill: '#777', 'text-anchor': 'end' });
    txt(360, LY - 2, 'nothing like it', { 'font-size': 20, fill: '#777' });
    container.innerHTML = ''; container.appendChild(svg);

    let t0 = null, raf = null;
    function frame(t) {
      if (t0 === null) t0 = container.dataset.static ? t - 1e6 : t;   // data-static: open on the finished picture
      const e = t - t0, when = [200, 1500, 1300, 1900];   // race map, age map, race number, age number
      groups.forEach((g, i) => g.setAttribute('opacity', Math.max(0, Math.min(1, (e - when[[0, 2, 1, 3][i]]) / 600))));
      raf = e < 2600 ? requestAnimationFrame(frame) : null;
    }
    return { play() { if (!raf && t0 === null) raf = requestAnimationFrame(frame); }, pause() {} };
  }
  window.startHetero = start;
})();
