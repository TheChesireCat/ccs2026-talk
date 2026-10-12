// Promoted from the appendix (2026-10-02): how mixed every US neighbourhood is, by race and by age.
// js/promote-data.js (figures/promote_data.py, from data/ccs_tract_heterogeneity.csv): the normalised
// Shannon entropy of each of the 84,532 populated tracts, 0 = one group only, 1 = every group in equal
// shares (the axis label carries the formula, H = -sum_g p_g log p_g / log K). One row per dimension on a shared axis, each row on its own height scale so the shapes
// compare; bars rise left to right, race first, then age, then the two means.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  function start(container) {
    const E = window.PROMOTE.entropy, W = 1150, H = 455, X0 = 230, X1 = 930, RH = 132;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const ROWS = [['race', 'race and ethnicity', '#253494', 22], ['age', 'age', '#41b6c4', 194]];
    const bars = [], means = [];
    ROWS.forEach(([k, lab, c, y0], r) => {
      const d = E[k], n = d.counts.length, bw = (X1 - X0) / n, mx = Math.max(...d.counts), base = y0 + RH;
      txt(0, y0 + RH / 2 + 2, lab, { 'font-size': 26, 'font-weight': 700, fill: c });
      el('line', { x1: X0, y1: base, x2: X1, y2: base, stroke: '#c5cdd8', 'stroke-width': 1.5 });
      d.counts.forEach((v, i) => { const h = v / mx * (RH - 8);
        bars.push({ e: el('rect', { x: X0 + i * bw + 1, y: base, width: bw - 2, height: 0, rx: 2, fill: c }), h, base, r, i }); });
      const g = el('g', { opacity: 0 });
      txt(X1 + 40, y0 + 50, 'mean', { 'font-size': 20, fill: '#777' }, g);
      txt(X1 + 40, y0 + 108, d.mean.toFixed(2), { 'font-size': 64, 'font-weight': 700, fill: c }, g);
      means.push(g);
    });
    // the axis, with a glyph at each end: five dots of one colour, five dots of five colours
    const AY = 360, DOT = ['#c7e9b4', '#7fcdbb', '#41b6c4', '#2c7fb8', '#253494'];
    [0, 0.5, 1].forEach(v => txt(X0 + v * (X1 - X0), AY, v.toFixed(v % 1 ? 1 : 0), { 'font-size': 20, fill: '#777', 'text-anchor': 'middle' }));
    // the axis is named for what it is: each tract's normalised Shannon entropy over the groups (K of them)
    { const t = el('text', { x: (X0 + X1) / 2, y: AY + 36, 'text-anchor': 'middle', fill: '#333' });
      const sp = (s, at) => { const e = document.createElementNS(NS, 'tspan'); e.textContent = s; for (const k in at) e.setAttribute(k, at[k]); t.appendChild(e); return e; };
      const M = { 'font-family': 'KaTeX_Main, Times New Roman, serif', 'font-size': 25 }, I = Object.assign({ 'font-style': 'italic' }, M), sub = { 'font-size': 16, 'baseline-shift': 'sub', 'font-style': 'italic', 'font-family': M['font-family'] };
      sp('normalised entropy', { 'font-family': 'PT Sans, Helvetica, sans-serif', 'font-size': 22, 'font-weight': 700 });
      sp('\u2003H', I); sp(' = \u2212\u2009\u03a3', M); sp('g', sub); sp(' p', I); sp('g', sub); sp(' log ', M); sp('p', I); sp('g', sub); sp(' / log ', M); sp('K', I); }
    const glyph = (x, cols, s, anchor) => { cols.forEach((c, i) => el('circle', { cx: x + (anchor === 'end' ? -i * 18 : i * 18), cy: AY + 72, r: 7, fill: c }));
      txt(anchor === 'end' ? x - 5 * 18 - 4 : x + 5 * 18 - 4, AY + 79, s, { 'font-size': 20, fill: '#777', 'text-anchor': anchor === 'end' ? 'end' : 'start' }); };
    glyph(X0 - 4, Array(5).fill('#253494'), 'one group only', 'start');
    glyph(X1 + 4, DOT.slice().reverse(), 'every group equally', 'end');
    container.innerHTML = ''; container.appendChild(svg);

    let t0 = null, raf = null;
    function frame(t) {
      if (t0 === null) t0 = container.dataset.static ? t - 1e6 : t;   // data-static: open on the finished picture
      const e = t - t0;
      bars.forEach(b => { const u = Math.max(0, Math.min(1, (e - 200 - b.r * 1500 - b.i * 22) / 380)), h = b.h * (1 - Math.pow(1 - u, 3));
        b.e.setAttribute('y', b.base - h); b.e.setAttribute('height', h); });
      means.forEach((g, r) => g.setAttribute('opacity', Math.max(0, Math.min(1, (e - 1300 - r * 1500) / 500))));
      raf = e < 3800 ? requestAnimationFrame(frame) : null;
    }
    return { play() { if (!raf && t0 === null) raf = requestAnimationFrame(frame); }, pause() {} };
  }
  window.startEntropy = start;
})();
