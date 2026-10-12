// Slide 16, "So the age table is just group sizes, multiplied" (simplified per Matteo: no spectrum).
// Two rows, js/promote-data.js (figures/promote_data.py, make_figs.py's rank_one_r):
//   phones: our five-year age table beside the table its own group sizes predict (the outer product of
//           its margins): they match at 0.99, so the phone table carries nothing beyond group sizes;
//   survey: the survey's table beside its own group-sizes prediction: only 0.51, because real people
//           prefer their own age (the control).
// Each row on its own linear YlGnBu scale (1st to 99th percentile of its two tables), as in the appendix.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const YLGNBU = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'];
  const ramp = u => { const k = Math.max(0, Math.min(1, u)) * (YLGNBU.length - 1), i = Math.min(YLGNBU.length - 2, Math.floor(k)), f = k - i;
    const p = h => [1, 3, 5].map(j => parseInt(h.slice(j, j + 2), 16)), a = p(YLGNBU[i]), b = p(YLGNBU[i + 1]);
    return `rgb(${a.map((x, j) => Math.round(x + (b[j] - x) * f)).join(',')})`; };
  function start(container) {
    const R = window.PROMOTE.rankone, W = 1150, H = 480;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const icon = (x, y, z, name, c) => { const fo = el('foreignObject', { x: x - z / 2, y: y - z / 2, width: z, height: z });
      fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${z}px;height:${z}px;background:${c};-webkit-mask:url(icons/${name}.svg) center/contain no-repeat;mask:url(icons/${name}.svg) center/contain no-repeat"></div>`; };
    const nr = R.rows.length, nc = R.cols.length, SIDE = 182, zy = SIDE / nr, zx = SIDE / nc;
    const AX = 190, BX = 450;
    txt(AX + SIDE / 2, 22, 'the age table', { 'font-size': 22, 'font-weight': 700, fill: '#222', 'text-anchor': 'middle' });
    txt(BX + SIDE / 2, 22, 'its own group sizes', { 'font-size': 22, 'font-weight': 700, fill: '#222', 'text-anchor': 'middle' });
    const draw = (M, x0, y0, lo, hi) => M.forEach((row, a) => row.forEach((v, b) =>
      el('rect', { x: x0 + b * zx, y: y0 + (nr - 1 - a) * zy, width: zx - 0.8, height: zy - 0.8, fill: ramp((v - lo) / (hi - lo)) })));
    const pct = (A, B, q) => { const v = A.flat().concat(B.flat()).filter(x => x > 0).sort((a, b) => a - b); return v[Math.floor(q * (v.length - 1))]; };
    [['phones', 'mobile-screen-button', '#2c7fb8', R.ours, R.pred, '≈', R.r_ours, 'nothing but group sizes', '#41b6c4'],
     ['survey', 'clipboard-list', '#253494', R.survey, R.survey_pred, '≠', R.r_survey, 'people prefer their own age', '#253494']].forEach(([name, ic, c, A, B, sign, r, why, nc2], k) => {
      const y0 = 40 + k * 230, lo = pct(A, B, 0.01), hi = pct(A, B, 0.99);
      icon(36, y0 + SIDE / 2 - 14, 40, ic, c); txt(36, y0 + SIDE / 2 + 30, name, { 'font-size': 22, 'font-weight': 700, fill: '#333', 'text-anchor': 'middle' });
      draw(A, AX, y0, lo, hi); draw(B, BX, y0, lo, hi);
      txt((AX + SIDE + BX) / 2, y0 + SIDE / 2 + 16, sign, { 'font-size': 48, fill: '#888', 'text-anchor': 'middle' });
      txt(720, y0 + SIDE / 2 + 12, r.toFixed(2), { 'font-size': 84, 'font-weight': 700, fill: nc2 });
      txt(720, y0 + SIDE / 2 + 48, `match: ${why}`, { 'font-size': 22, fill: '#555' });
    });
    container.innerHTML = ''; container.appendChild(svg);
    return { play() {}, pause() {} };
  }
  window.startRankone = start;
})();
