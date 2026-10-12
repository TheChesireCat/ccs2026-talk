// Slide 5, "Every setting has its own matrix" (flipped per Matteo): the Epistorm-Mix adult matrix for
// all contacts on top, and below it the four settings it is the sum of (js/settings-data.js: raw
// survey, contacts per day, 18-49 / 50-64 / 65+, rows the respondent, older at the top). One shared log YlGnBu scale.
// The slide cycles through the cells: a cell lights up on top and in each setting, and a stacked bar
// shows how much of that cell each setting contributes.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const AGES = ['young', 'middle', 'older'];
  const YLGNBU = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'];
  const col = v => { const lo = Math.log(0.05), hi = Math.log(4.2), u = Math.max(0, Math.min(1, (Math.log(Math.max(v, 0.05)) - lo) / (hi - lo)));
    const k = u * (YLGNBU.length - 1), i = Math.min(YLGNBU.length - 2, Math.floor(k)), f = k - i;
    const p = h => [1, 3, 5].map(j => parseInt(h.slice(j, j + 2), 16)), a = p(YLGNBU[i]), b = p(YLGNBU[i + 1]);
    return `rgb(${a.map((x, j) => Math.round(x + (b[j] - x) * f)).join(',')})`; };
  const SET = [['Household', 'house', 'home', '#253494'], ['School', 'school', 'school', '#7fcdbb'], ['Work', 'briefcase', 'work', '#2c7fb8'], ['Other', 'users', 'community', '#41b6c4']];
  function start(container) {
    const S = window.SETTINGS, W = 1150, H = 480;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const face = (x, y, z, o) => el('image', { x: x - z / 2, y: y - z / 2, width: z, height: z, href: 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar(o)) });
    const icon = (x, y, z, name, c) => { const fo = el('foreignObject', { x: x - z / 2, y: y - z / 2, width: z, height: z });
      fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${z}px;height:${z}px;background:${c};-webkit-mask:url(icons/${name}.svg) center/contain no-repeat;mask:url(icons/${name}.svg) center/contain no-repeat"></div>`; };
    const mat = (M, x0, y0, z) => M.map((row, a) => row.map((v, b) => el('rect', { x: x0 + b * z, y: y0 + (2 - a) * z, width: z - 2, height: z - 2, rx: 4, fill: col(v) })));
    const ring = (z) => el('rect', { width: z + 4, height: z + 4, rx: 6, fill: 'none', stroke: '#222', 'stroke-width': 3.5, opacity: 0 });

    // top: all contacts
    const TZ = 58, TX = 430, TY = 42;          // right of the standalone arc panel
    txt(TX + 1.5 * TZ, 22, 'all contacts', { 'font-size': 24, 'font-weight': 700, fill: '#222', 'text-anchor': 'middle' });
    mat(S.Total, TX, TY, TZ);
    AGES.forEach((age, r) => face(TX - 30, TY + (2 - r) * TZ + TZ / 2, 40, { age, style: r % 2, skin: (r + 1) % 4 }));
    // the arc diagram, standalone on the left and spanning both rows (as on the earlier mixing slide):
    // one face per age group, joined by arcs whose thickness is how often the two groups meet (the
    // symmetrised all-contacts cell); loops are within-group contact
    const FX = 200, RYS = [86, 240, 394], RYf = r => RYS[2 - r], T = S.Total, sym = (a, b) => (T[a][b] + T[b][a]) / 2;
    const tmax = Math.max(...[0, 1, 2].flatMap(a => [0, 1, 2].map(b => sym(a, b))));
    const gArc = el('g', {}), arcs = {};
    for (let a = 0; a < 3; a++) for (let b = a; b < 3; b++) {
      const d = a === b ? `M${FX - 30},${RYf(a) - 14} C${FX - 112},${RYf(a) - 60} ${FX - 112},${RYf(a) + 60} ${FX - 30},${RYf(a) + 14}`
                        : `M${FX - 32},${RYf(a)} C${FX - 72 - 64 * (b - a)},${RYf(a)} ${FX - 72 - 64 * (b - a)},${RYf(b)} ${FX - 32},${RYf(b)}`;
      arcs[a + ',' + b] = el('path', { d, fill: 'none', stroke: '#9cc3dd', 'stroke-width': 2 + 15 * sym(a, b) / tmax, 'stroke-linecap': 'round', opacity: 0.6 }, gArc);
    }
    ['18 to 49', '50 to 64', '65 and over'].forEach((g, r) => { face(FX, RYf(r), 60, { age: AGES[r], style: r % 2, skin: (r + 1) % 4 });
      txt(FX, RYf(r) + 50, g, { 'font-size': 18, fill: '#555', 'text-anchor': 'middle' }); });
    const gPulse = el('g', {});
    let pulses = [], lastPulse = 0;
    AGES.forEach((age, r) => face(TX + r * TZ + TZ / 2, TY + 3 * TZ + 22, 36, { age, style: (r + 1) % 2, skin: (r + 2) % 4 }));
    txt(TX + 1.5 * TZ, TY + 3 * TZ + 56, 'who they meet', { 'font-size': 18, fill: '#777', 'text-anchor': 'middle' });
    const topRing = ring(TZ);

    // the readout: this cell, split by setting
    const RX = TX + 3 * TZ + 70, RW = 300;
    const rTitle = txt(RX, 92, '', { 'font-size': 22, 'font-weight': 700, fill: '#222' });
    const rSub = txt(RX, 118, '', { 'font-size': 20, fill: '#777' });
    const segs = SET.map(([, , , c]) => el('rect', { x: RX, y: 136, width: 0, height: 34, fill: c }));
    SET.forEach(([, ic, name, c], k) => { const x = RX + (k % 2) * 150, y = 204 + Math.floor(k / 2) * 34;
      el('rect', { x, y: y - 15, width: 16, height: 16, rx: 3, fill: c }); txt(x + 24, y, name, { 'font-size': 20, fill: '#555' }); });

    // bottom: the four settings, which add up to the top
    const SZ = 40, SY = 344, SX0 = 380, SG = 200;   // bottom row, right of the arc panel
    txt(SX0 - 50, SY + 1.5 * SZ + 13, '=', { 'font-size': 40, 'font-weight': 700, fill: '#888', 'text-anchor': 'middle' });
    const rings = SET.map(([key, ic, name, c], k) => { const x0 = SX0 + k * SG;
      icon(x0 + 1.5 * SZ - 40, SY - 22, 28, ic, c); txt(x0 + 1.5 * SZ - 20, SY - 14, name, { 'font-size': 20, fill: '#444' });
      mat(S[key], x0, SY, SZ);
      if (k < 3) txt(x0 + 3 * SZ + (SG - 3 * SZ) / 2, SY + 1.5 * SZ + 12, '+', { 'font-size': 34, 'font-weight': 700, fill: '#888', 'text-anchor': 'middle' });
      return { x0, r: ring(SZ) }; });
    container.innerHTML = ''; container.appendChild(svg);

    const GROUP = ['18 to 49', '50 to 64', '65 and over'];
    const ORDER = [[0, 0], [0, 1], [1, 1], [2, 2], [2, 0], [1, 0], [0, 2], [1, 2], [2, 1]];
    let raf = null, t0 = null, k = -1;
    function show(i) {
      const [a, b] = ORDER[i], tot = S.Total[a][b];
      Object.entries(arcs).forEach(([k, p]) => { const on = k === Math.min(a, b) + ',' + Math.max(a, b);
        p.setAttribute('stroke', on ? '#2c7fb8' : '#9cc3dd'); p.setAttribute('opacity', on ? 0.95 : 0.5); });
      pulses.push({ p: arcs[Math.min(a, b) + ',' + Math.max(a, b)], t0: performance.now(), rev: a > b });
      topRing.setAttribute('x', TX + b * TZ - 3); topRing.setAttribute('y', TY + (2 - a) * TZ - 3); topRing.setAttribute('opacity', 1);
      rings.forEach((o, s) => { o.r.setAttribute('x', o.x0 + b * SZ - 3); o.r.setAttribute('y', SY + (2 - a) * SZ - 3); o.r.setAttribute('opacity', 1); });
      rTitle.textContent = `${GROUP[a]} meeting ${GROUP[b]}`;
      rSub.textContent = `${tot.toFixed(1)} contacts a day, by setting`;
      let x = RX; SET.forEach(([key], s) => { const w = RW * S[key][a][b] / tot; segs[s].setAttribute('x', x); segs[s].setAttribute('width', Math.max(0, w)); x += w; });
    }
    function frame(t) {
      if (t0 === null) t0 = t;
      const i = Math.floor((t - t0) / 2600) % ORDER.length;
      if (i !== k) { k = i; show(i); }
      if (t - lastPulse > 1100) { lastPulse = t; const keys = Object.keys(arcs), w = keys.map(q => { const [a, b] = q.split(',').map(Number); return sym(a, b); });
        let u = Math.random() * w.reduce((s, x) => s + x, 0), pick = keys[0]; for (let q = 0; q < keys.length; q++) { u -= w[q]; if (u <= 0) { pick = keys[q]; break; } }
        pulses.push({ p: arcs[pick], t0: t, rev: Math.random() < 0.5 }); }
      gPulse.innerHTML = '';
      pulses = pulses.filter(v => { const f = (t - v.t0) / 1100; if (f >= 1 || f < 0) return f < 0;
        const L = v.p.getTotalLength(), q = v.p.getPointAtLength((v.rev ? 1 - f : f) * L);
        el('circle', { cx: q.x, cy: q.y, r: 6, fill: '#e8590c' }, gPulse); return true; });
      raf = requestAnimationFrame(frame);
    }
    return { play() { if (!raf) raf = requestAnimationFrame(frame); }, pause() { cancelAnimationFrame(raf); raf = null; } };
  }
  window.startSettings = start;
})();
