// "First results": the behavioural age label against the neighbourhood one (js/behaviour-data.js,
// from figures/behaviour_data.py, which runs 12-14-h's own cells and asserts its numbers).
//
// Left: three five-year age matrices on one log YlGnBu scale, each normalised to sum 1: phones with
// the neighbourhood label, phones with the behaviour label (quota-matched, pre-pool), and the
// survey's work table (the structure the behaviour label recovers is employment-shaped). Under each, its effective rank, read as "how many independent mixing
// patterns". Right: agreement with the survey (log r, reciprocity-corrected) in three settings, the
// neighbourhood label in grey and the behaviour label in blue. Community is shown, and is worse.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const YLGNBU = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'];
  const ramp = u => { const k = Math.max(0, Math.min(1, u)) * (YLGNBU.length - 1), i = Math.min(YLGNBU.length - 2, Math.floor(k)), f = k - i;
    const p = h => [1, 3, 5].map(j => parseInt(h.slice(j, j + 2), 16)), a = p(YLGNBU[i]), b = p(YLGNBU[i + 1]);
    return `rgb(${a.map((x, j) => Math.round(x + (b[j] - x) * f)).join(',')})`; };
  function start(container) {
    const D = window.BEHAV, W = 1150, H = 455;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const face = (x, y, z, o) => el('image', { x: x - z / 2, y: y - z / 2, width: z, height: z, href: 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar(o)) });

    // ------------------------------------------------------------ the three matrices
    const all = ['nbhd', 'behav', 'survey_work'].flatMap(k => D.M[k].flat()).filter(v => v > 0).sort((a, b) => a - b);
    const lo = Math.log(all[Math.floor(0.01 * all.length)]), hi = Math.log(all[all.length - 1]);
    const nr = D.rows.length, nc = D.cols.length, SIDE = 236, z = SIDE / nr, MX = [40, 288, 536], MY = 128;   // centred vertically
    const PAN = [['nbhd', 'Neighbourhood', 'label'], ['behav', 'Behaviour', 'label'], ['survey_work', 'Survey', 'at work']];
    const pg = [];
    PAN.forEach(([k, a, b], j) => { const x0 = MX[j], g = el('g', { opacity: 0 });
      txt(x0 + nc * z / 2, MY - 34, a, { 'font-size': 24, 'font-weight': 700, fill: k === 'behav' ? '#2c7fb8' : '#222', 'text-anchor': 'middle' }, g);
      txt(x0 + nc * z / 2, MY - 10, b, { 'font-size': 20, fill: '#777', 'text-anchor': 'middle' }, g);
      D.M[k].forEach((row, r) => row.forEach((v, c) => el('rect', { x: x0 + c * z, y: MY + (nr - 1 - r) * z, width: z - 0.8, height: z - 0.8,
        fill: v > 0 ? ramp((Math.log(v) - lo) / (hi - lo)) : '#f2f2f2' }, g)));
      pg.push(g); });
    [[1, 'young'], [7, 'middle'], [12, 'older']].forEach(([i, age], k) => face(18, MY + (nr - 1 - i) * z + z / 2, 30, { age, style: k % 2, skin: k }));

    // ------------------------------------------------------------ agreement by setting
    const BX = 860, BW = 230, SET = [['Work', 'at work'], ['Total', 'all contacts'], ['Other', 'community']];
    txt(BX - 70, 22, 'match with the survey', { 'font-size': 24, 'font-weight': 700, fill: '#222' });
    el('rect', { x: BX - 70, y: 36, width: 16, height: 16, rx: 3, fill: '#b9c3d0' }); txt(BX - 48, 50, 'neighbourhood', { 'font-size': 20, fill: '#777' });
    el('rect', { x: BX + 92, y: 36, width: 16, height: 16, rx: 3, fill: '#2c7fb8' }); txt(BX + 114, 50, 'behaviour', { 'font-size': 20, fill: '#777' });
    const bars = [];
    SET.forEach(([k, lab], i) => { const y0 = 92 + i * 118;
      txt(BX - 70, y0 + 6, lab, { 'font-size': 22, 'font-weight': 700, fill: '#333' });
      [['nbhd', '#b9c3d0', 0], ['behav', '#2c7fb8', 1]].forEach(([s, c, r]) => { const y = y0 + 20 + r * 34, v = D.logr[s][k];
        el('rect', { x: BX - 70, y, width: BW + 70, height: 26, rx: 4, fill: '#f1f3f6' });
        const b = el('rect', { x: BX - 70, y, width: 0, height: 26, rx: 4, fill: c });
        const t = txt(BX + BW + 12, y + 20, '', { 'font-size': 22, 'font-weight': s === 'behav' ? 700 : 400, fill: s === 'behav' ? '#2c7fb8' : '#666' });
        bars.push({ b, t, v, i }); }); });
    container.innerHTML = ''; container.appendChild(svg);

    let t0 = null, raf = null;
    function frame(t) {
      if (t0 === null) t0 = container.dataset.static ? t - 1e6 : t;   // data-static: open on the finished picture
      const e = t - t0;
      pg.forEach((g, j) => g.setAttribute('opacity', Math.max(0, Math.min(1, (e - 200 - j * 600) / 500))));
      bars.forEach(o => { const u = Math.max(0, Math.min(1, (e - 2000 - o.i * 450) / 600)), s = 1 - Math.pow(1 - u, 3);
        o.b.setAttribute('width', (BW + 70) * o.v * s); o.t.textContent = u > 0 ? (o.v * s).toFixed(2) : ''; });
      raf = e < 4200 ? requestAnimationFrame(frame) : null;
    }
    return { play() { if (!raf && t0 === null) raf = requestAnimationFrame(frame); }, pause() {} };
  }
  window.startBehaviour = start;
})();
