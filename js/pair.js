// The two result slides: our matrix beside the survey's, one shared log colour scale (YlGnBu), and
// the agreement as one big number. data-dim="race" or "age" picks the comparison from
// js/results-data.js (written by figures/results_data.py: Other setting, reciprocity-corrected,
// ours rescaled to the survey's total so colour compares shape only).
// Cells sweep in along the diagonal, so the eye lands on where the survey's structure is. Under the
// big number, a three-rung ladder (js/promote-data.js): group sizes alone, the commute outer-product
// null (census geography, no phones), and phones, answering 'is it just geography?'.
// data-bars picks how the ladder appears: "all" (drawn with the slide), "none" (the race opener: the big
// number and the question instead), "step" (the age slide: the ladder arrives on the click).
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const YLGNBU = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'];
  const ramp = u => { const k = Math.max(0, Math.min(1, u)) * (YLGNBU.length - 1), i = Math.min(YLGNBU.length - 2, Math.floor(k)), f = k - i;
    const p = h => [1, 3, 5].map(j => parseInt(h.slice(j, j + 2), 16)), a = p(YLGNBU[i]), b = p(YLGNBU[i + 1]);
    return `rgb(${a.map((x, j) => Math.round(x + (b[j] - x) * f)).join(',')})`; };
  function start(container) {
    const dim = container.dataset.dim, D = window.RESULTS[dim], W = 1150, H = 455;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at)); t.textContent = s; return t; };
    const face = (x, y, z, o) => el('image', { x: x - z / 2, y: y - z / 2, width: z, height: z, href: 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar(o)) });

    // one log scale across both panels: 1st percentile of positive cells to the maximum
    const pos = D.ours.flat().concat(D.survey.flat()).filter(v => v > 0).sort((a, b) => a - b);
    const lo = Math.log(pos[Math.floor(0.01 * pos.length)]), hi = Math.log(pos[pos.length - 1]);
    const nr = D.rows.length, nc = D.cols.length, SIDE = 300, z = SIDE / nr, zx = SIDE / nc;   // one 300 x 300 box on both slides, so nothing moves between them
    const cells = [];
    function panel(M, box, title) {
      const x0 = box;
      txt(box + SIDE / 2, 30, title, { 'font-size': 26, 'font-weight': 700, fill: '#222', 'text-anchor': 'middle' });
      const y0 = 52, rowAt = a => dim === 'age' ? nr - 1 - a : a;      // age: older at the top (deck-wide convention)
      M.forEach((row, a) => row.forEach((v, b) => cells.push({ d: Math.abs(a - b), e: el('rect', { x: x0 + b * zx, y: y0 + rowAt(a) * z, width: zx - 1.2, height: z - 1.2,
        fill: v > 0 ? ramp((Math.log(v) - lo) / (hi - lo)) : '#f2f2f2', opacity: 0 }) })));
      if (dim === 'race') {
        D.rows.forEach((l, i) => { if (box < 200) txt(x0 - 10, y0 + i * z + z / 2 + 7, l.replace(' (NH)', ''), { 'font-size': 20, fill: '#555', 'text-anchor': 'end' }); });
        D.cols.forEach((l, i) => txt(x0 + i * zx + zx / 2, y0 + nr * z + 26, ({ 'White (NH)': 'White', 'Hispanic': 'Hisp.', 'Black (NH)': 'Black', 'Asian (NH)': 'Asian', 'Other (NH)': 'Other' })[l] || l, { 'font-size': 20, fill: '#555', 'text-anchor': 'middle' }));
      } else {
        // ages as faces down the side and along the bottom: young, middle, older
        if (box < 200) [[1, 'young'], [7, 'middle'], [12, 'older']].forEach(([i, age], k) => face(x0 - 28, y0 + rowAt(i) * z + z / 2, 40, { age, style: k % 2, skin: k }));
        [[0, 'young'], [6, 'middle'], [11, 'older']].forEach(([i, age], k) => face(x0 + i * zx + zx / 2, y0 + nr * z + 26, 40, { age, style: (k + 1) % 2, skin: (k + 1) % 4 }));
      }
    }
    const X1 = 130, X2 = X1 + SIDE + 50;
    panel(D.ours, X1, 'Phones'); panel(D.survey, X2, 'Survey');
    // the big number, then the same score for a model with no phones at all (the commute
    // outer-product null: census commuting flows as contact opportunity, same label construction)
    const N = window.PROMOTE.null[dim], BX = X2 + SIDE + 56, BW = W - BX - 70;
    const big = txt(BX, 150, '', { 'font-size': 112, 'font-weight': 700, fill: '#253494' });
    txt(BX, 190, 'match with the survey', { 'font-size': 24, fill: '#444' });
    txt(BX, 216, '(correlation of log cells)', { 'font-size': 20, fill: '#777' });
    const bars = [], mode = container.dataset.bars || 'all';
    if (mode === 'none') {
      txt(BX, 292, 'How much of this', { 'font-size': 30, 'font-weight': 700, fill: '#222' });
      txt(BX, 330, 'is the phones?', { 'font-size': 30, 'font-weight': 700, fill: '#222' });
    }
    // a ladder: no geography at all, then census geography with no phones, then phones
    if (mode !== 'none') [['group sizes alone', N.sizes, '#cdd3db'], ['census commuting, no phones', N.outer, '#9aa4b2'], ['phones', N.phones, '#253494']].forEach(([lab, v, c], i) => {
      const y = 252 + i * 64;
      txt(BX, y, lab, { 'font-size': 20, fill: i === 2 ? '#222' : '#666', 'font-weight': i === 2 ? 700 : 400 });
      el('rect', { x: BX, y: y + 10, width: BW, height: 24, rx: 4, fill: '#eef1f5' });
      const b = el('rect', { x: BX, y: y + 10, width: 0, height: 24, rx: 4, fill: c });
      const t = txt(BX + BW + 10, y + 29, '', { 'font-size': 20, fill: i === 2 ? '#222' : '#666', 'font-weight': i === 2 ? 700 : 400 });
      bars.push({ b, t, v, i }); });
    container.innerHTML = ''; container.appendChild(svg);

    const dmax = Math.max(nr, nc);
    let t0 = null, raf = null, barsAt = null;
    function frame(t) {
      if (t0 === null) t0 = container.dataset.static ? t - 1e6 : t;   // data-static: open on the finished picture
      const e = t - t0;
      cells.forEach(c => c.e.setAttribute('opacity', Math.max(0, Math.min(1, (e - 200 - c.d / dmax * 1400) / 350))));
      const u = Math.max(0, Math.min(1, (e - 1900) / 900));
      big.textContent = (D.logr * (1 - Math.pow(1 - u, 3))).toFixed(2);
      bars.forEach(o => { const w = Math.max(0, Math.min(1, mode === 'step' ? (barsAt === null ? 0 : (t - barsAt - o.i * 450) / 600)
                                                                         : (e - 3000 - o.i * 500) / 600)), s = 1 - Math.pow(1 - w, 3);
        o.b.setAttribute('width', BW * o.v * s); o.t.textContent = w > 0 ? (o.v * s).toFixed(2) : ''; });
      raf = e < 4300 || (barsAt !== null && t - barsAt < 2000) ? requestAnimationFrame(frame) : null;
    }
    let shown = 0;
    return { play() { if (!raf && t0 === null) raf = requestAnimationFrame(frame); }, pause() {},
             step(n) { if (mode !== 'step') return;                         // a jump (coming back) lands finished
               barsAt = n >= 1 ? (n === shown + 1 ? performance.now() : performance.now() - 1e6) : null; shown = n;
               if (!raf) raf = requestAnimationFrame(frame); } };
  }
  window.startPair = start;
})();
