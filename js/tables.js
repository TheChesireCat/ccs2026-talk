// "The tables we want": the survey's contact matrices by age and by race (community setting,
// reciprocity-corrected), drawn large, each on its own log YlGnBu scale so its diagonal shows.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const YLGNBU = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'];
  const ramp = (u) => { const k = Math.max(0, Math.min(1, u)) * (YLGNBU.length - 1), i = Math.min(YLGNBU.length - 2, Math.floor(k)), f = k - i;
    const p = h => [1, 3, 5].map(j => parseInt(h.slice(j, j + 2), 16)), a = p(YLGNBU[i]), b = p(YLGNBU[i + 1]);
    return `rgb(${a.map((x, j) => Math.round(x + (b[j] - x) * f)).join(',')})`; };
  function start(container) {
    const TB = window.TABLES, W = 1150, H = 520;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at)); t.textContent = s; return t; };
    const face = (x, y, z, o) => el('image', { x: x - z / 2, y: y - z / 2, width: z, height: z, href: 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar(o)) });
    function heat(M, x0, y0, side, flip) {                          // flip: the age table, older at the top
      const n = M.length, z = side / n, vals = M.flat().filter(v => v > 0);
      const lo = Math.log(Math.min(...vals) * 1.5), hi = Math.log(Math.max(...vals));
      M.forEach((row, a) => row.forEach((v, b) => el('rect', { x: x0 + b * z, y: y0 + (flip ? n - 1 - a : a) * z, width: z - 1.2, height: z - 1.2,
        fill: ramp((Math.log(Math.max(v, 1e-6)) - lo) / (hi - lo)) })));
      return z;
    }
    // age
    const ax = 120, ay = 64, side = 390, A = TB.age, z = heat(A.M, ax, ay, side, true), nA = A.M.length;
    { const tt = txt(ax, 36, 'By age', { 'font-size': 28, 'font-weight': 700, fill: '#222' }); const sp = document.createElementNS(NS, 'tspan'); sp.setAttribute('font-size', 20); sp.setAttribute('font-weight', 400); sp.setAttribute('fill', '#888'); sp.textContent = '   community setting'; tt.appendChild(sp); }
    const tick = { '20-24': '20', '40-44': '40', '60-64': '60', '80+': '80+' };
    A.labels.forEach((l, i) => { if (!tick[l]) return;
      txt(ax - 10, ay + (nA - 1 - i) * z + z / 2 + 7, tick[l], { 'font-size': 19, fill: '#555', 'text-anchor': 'end' });
      txt(ax + i * z + z / 2, ay + side + 26, tick[l], { 'font-size': 19, fill: '#555', 'text-anchor': 'middle' }); });
    [[0, 'young'], [6, 'middle'], [12, 'older']].forEach(([i, age], k) => face(ax - 70, ay + (nA - 1 - i) * z + z / 2, 44, { age, style: k % 2, skin: (k + 2) % 4 }));
    txt(ax + side / 2, ay + side + 56, 'age of the contact', { 'font-size': 19, fill: '#777', 'text-anchor': 'middle' });
    // race
    const rx = 700, ry = 64, rside = 390, Rr = TB.race, zr = heat(Rr.M, rx, ry, rside);
    { const tt = txt(rx, 36, 'By race and ethnicity', { 'font-size': 28, 'font-weight': 700, fill: '#222' }); const sp = document.createElementNS(NS, 'tspan'); sp.setAttribute('font-size', 20); sp.setAttribute('font-weight', 400); sp.setAttribute('fill', '#888'); sp.textContent = '   community setting'; tt.appendChild(sp); }
    Rr.labels.forEach((l, i) => {
      txt(rx - 12, ry + i * zr + zr / 2 + 7, l, { 'font-size': 20, fill: '#555', 'text-anchor': 'end' });
      txt(rx + i * zr + zr / 2, ry + rside + 26, l, { 'font-size': 20, fill: '#555', 'text-anchor': 'middle' }); });
    txt(rx + rside / 2, ry + rside + 56, 'race and ethnicity of the contact', { 'font-size': 19, fill: '#777', 'text-anchor': 'middle' });
    container.innerHTML = ''; container.appendChild(svg);
    return { play() {}, pause() {} };
  }
  window.startTables = start;
})();
