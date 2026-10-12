// Null 1, "group sizes alone", for race, built in front of the audience from our phone race table
// (js/results-data.js, the 'Phones' table of the previous slide, already on the survey's scale).
// On entry the phone table glides from where it sat on the previous slide to here. Then, clicked through:
//   1  each row sums into r_a, contacts per person (bars on the left, counting up)
//   2  each column sums into c_b, shown as its share of all contact c_b / T (the bar on top)
//   3  the phone table gives way to the null, every cell S[a, b] = r_a * c_b / T
//   4  the score: the rank-one table scores 0.717 against the survey (figures/nulls_data.py asserts it)
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const YLGNBU = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'];
  const ramp = u => { const k = Math.max(0, Math.min(1, u)) * (YLGNBU.length - 1), i = Math.min(YLGNBU.length - 2, Math.floor(k)), f = k - i;
    const p = h => [1, 3, 5].map(j => parseInt(h.slice(j, j + 2), 16)), a = p(YLGNBU[i]), b = p(YLGNBU[i + 1]);
    return `rgb(${a.map((x, j) => Math.round(x + (b[j] - x) * f)).join(',')})`; };
  const SHORT = { 'White (NH)': 'White', 'Hispanic': 'Hispanic', 'Black (NH)': 'Black', 'Asian (NH)': 'Asian', 'Other (NH)': 'Other' };
  function start(container) {
    const D = window.RESULTS.race, O = D.ours, W = 1150, H = 455, n = O.length;
    const r = O.map(row => row.reduce((s, v) => s + v, 0)), c = D.cols.map((_, b) => O.reduce((s, row) => s + row[b], 0));
    const T = r.reduce((s, v) => s + v, 0), sh = c.map(v => v / T), S = r.map(ra => sh.map(q => ra * q)), rmax = Math.max(...r), smax = Math.max(...sh);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const kx = (x, y, w, h, tex, size, color, p) => { const fo = el('foreignObject', { x, y, width: w, height: h, overflow: 'visible' }, p);
      const d = document.createElement('div'); d.setAttribute('style', `height:${h}px;display:flex;align-items:center;font-size:${size}px;color:${color};white-space:nowrap`);
      fo.appendChild(d); window.katex.render(tex, d, { throwOnError: false }); return d; };
    // one log scale with the phone and survey tables (as js/pair.js)
    const pos = O.flat().concat(D.survey.flat()).filter(v => v > 0).sort((a, b) => a - b);
    const lo = Math.log(pos[Math.floor(0.01 * pos.length)]), hi = Math.log(pos[pos.length - 1]), u = v => (Math.log(v) - lo) / (hi - lo);

    // the previous slide drew the phone table at (130, 52) with 60-unit cells (js/pair.js); this one sits at (MX, MY)
    const MX = 372, Z = 60, BY = 62, MY = 140, BARW = 96, PREV = [130 - 372, 52 - 140];
    const gL = el('g', { opacity: 0 });                                   // labels arrive once the table has landed
    D.cols.forEach((l, b) => txt(MX + b * Z + Z / 2 - 1, BY - 10, SHORT[l] || l, { 'font-size': 17, fill: '#555', 'text-anchor': 'middle' }, gL));
    D.rows.forEach((l, a) => txt(MX - BARW - 64, MY + a * Z + Z / 2 + 6, SHORT[l] || l, { 'font-size': 19, fill: '#444', 'text-anchor': 'end' }, gL));
    const cellAt = (M, a, b, p) => { const g = el('g', {}, p), v = M[a][b];
      el('rect', { x: MX + b * Z, y: MY + a * Z, width: Z - 3, height: Z - 3, rx: 5, fill: ramp(u(v)) }, g);
      txt(MX + b * Z + Z / 2 - 1, MY + a * Z + Z / 2 + 6, v.toFixed(2), { 'font-size': 16, 'font-weight': 700, fill: u(v) > 0.55 ? '#fff' : '#222', 'text-anchor': 'middle' }, g);
      return g; };
    // the phone table, and the outline that sweeps it as rows, then columns, are summed
    const gPh = el('g', {}), phone = O.map((row, a) => row.map((_, b) => cellAt(O, a, b, gPh)));
    const sweep = el('rect', { fill: 'none', stroke: '#222', 'stroke-width': 3, rx: 7, opacity: 0 });
    // 1: row totals, r
    const gR = el('g', { opacity: 0 });
    txt(MX - 14, MY - 8, 'contacts per person, r', { 'font-size': 16, 'font-weight': 700, fill: '#333', 'text-anchor': 'end' }, gR);
    const rBars = r.map((v, a) => ({ b: el('rect', { x: MX - 12, y: MY + a * Z + 15, width: 0, height: Z - 33, rx: 4, fill: '#2c7fb8' }, gR),
      t: txt(MX - 18, MY + a * Z + Z / 2 + 6, '', { 'font-size': 17, fill: '#333', 'text-anchor': 'end' }, gR), v }));
    // 2: column shares, c / T
    const gC = el('g', { opacity: 0 });
    txt(MX - 14, BY + 20, 'share of all', { 'font-size': 17, 'font-weight': 700, fill: '#333', 'text-anchor': 'end' }, gC);
    txt(MX - 14, BY + 40, 'contact, c / T', { 'font-size': 17, 'font-weight': 700, fill: '#333', 'text-anchor': 'end' }, gC);
    const cCells = sh.map((v, b) => { const g = el('g', { opacity: 0 }, gC);
      el('rect', { x: MX + b * Z, y: BY, width: Z - 3, height: 46, rx: 6, fill: ramp(v / smax) }, g);
      txt(MX + b * Z + Z / 2 - 1, BY + 30, Math.round(v * 100) + '%', { 'font-size': 19, 'font-weight': 700, fill: v / smax > 0.6 ? '#fff' : '#222', 'text-anchor': 'middle' }, g);
      return g; });
    // 3: the null, cell by cell
    const gS = el('g', {}), nul = S.map((row, a) => row.map((_, b) => { const g = cellAt(S, a, b, gS); g.setAttribute('opacity', 0); return g; }));
    const RX = 730;
    const gN = el('g', { opacity: 0 }), big = txt(RX, 300, '', { 'font-size': 104, 'font-weight': 700, fill: '#9aa4b2' }, gN);
    txt(RX, 338, 'match with the survey', { 'font-size': 24, fill: '#444' }, gN);
    txt(RX, 366, 'no geography at all', { 'font-size': 20, fill: '#777' }, gN);
    container.innerHTML = ''; container.appendChild(svg);

    // ---- the entry glide, then the steps; a jump (coming back from the next slide) lands finished
    let k = 0, at = [0, 0, 0, 0, 0], t0 = null, raf = null;
    const cl = q => Math.max(0, Math.min(1, q)), ease = q => q * q * (3 - 2 * q), ROW = 420;
    function frame(t) {
      if (t0 === null) t0 = k ? t - 1e6 : t;
      const since = q => t - at[q], g = ease(cl((t - t0 - 150) / 900));
      gPh.setAttribute('transform', `translate(${PREV[0] * (1 - g)},${PREV[1] * (1 - g)})`); gL.setAttribute('opacity', cl((t - t0 - 900) / 400));
      // 1: rows sum, one after another, each outlined while its bar grows
      const s1 = k >= 1 ? since(1) : -1;
      gR.setAttribute('opacity', k >= 1 ? 1 : 0);
      rBars.forEach((o, a) => { const q = k >= 1 ? ease(cl((s1 - a * ROW) / ROW)) : 0, w = BARW * o.v / rmax * q;
        o.b.setAttribute('x', MX - 12 - w); o.b.setAttribute('width', w); o.b.setAttribute('x', MX - 12 - w);
        o.t.setAttribute('x', MX - 18 - w); o.t.textContent = q > 0 ? (o.v * q).toFixed(2) : ''; });
      // 2: columns sum, each outlined while its share appears on top
      const s2 = k >= 2 ? since(2) : -1;
      gC.setAttribute('opacity', k >= 2 ? 1 : 0);
      cCells.forEach((e, b) => e.setAttribute('opacity', k >= 2 ? cl((s2 - b * ROW - ROW * 0.5) / 250) : 0));
      let sw = null;
      if (k === 1 && s1 < n * ROW) { const a = Math.floor(s1 / ROW); if (a >= 0 && a < n) sw = [MX, MY + a * Z, n * Z - 3, Z - 3]; }
      if (k === 2 && s2 < n * ROW) { const b = Math.floor(s2 / ROW); if (b >= 0 && b < n) sw = [MX + b * Z, MY, Z - 3, n * Z - 3]; }
      if (sw) { sweep.setAttribute('x', sw[0] - 3); sweep.setAttribute('y', sw[1] - 3); sweep.setAttribute('width', sw[2] + 6); sweep.setAttribute('height', sw[3] + 6); }
      sweep.setAttribute('opacity', sw ? 1 : 0);
      // 3: the null replaces the phone table, row by row
      const s3 = k >= 3 ? since(3) : -1;
      nul.forEach((row, a) => row.forEach((e, b) => e.setAttribute('opacity', k >= 3 ? cl((s3 - a * 320 - b * 70) / 250) : 0)));
      gPh.setAttribute('opacity', k >= 3 ? 1 - cl((s3 - 1700) / 400) : 1);
      // 4: the score
      const sc = k >= 4 ? cl(since(4) / 900) : 0; gN.setAttribute('opacity', k >= 4 ? cl(since(4) / 300) : 0);
      big.textContent = (window.NULLS.logr.sizes * (1 - Math.pow(1 - sc, 3))).toFixed(2);
      raf = requestAnimationFrame(frame);
    }
    return { play() { if (!raf) raf = requestAnimationFrame(frame); }, pause() { cancelAnimationFrame(raf); raf = null; },
             step(q) { const now = performance.now();
               if (q === k + 1) at[q] = now; else for (let i = 0; i <= 4; i++) at[i] = now - 1e6;
               k = q; } };
  }
  window.startSizesNull = start;
})();
