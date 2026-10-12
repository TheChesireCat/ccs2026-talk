// Slide 3, "People do not mix at random": the compartments split by age group and coupled by who
// meets whom, and what that changes.
//
// Left (from the mixing slide): the three people start as the generic figures of the SIR slide and turn
// over to reveal their age group, then the arcs draw in. One row of S / I / R per age group; arcs between the groups' faces
// with thickness set by how often they meet (Epistorm-Mix, all settings, symmetrised); infection
// pulses travel the arcs in proportion to contact.
// Right: share of the first infections in each group if everyone met everyone (grey, the population
// shares) against the real contact matrix (group colours), from js/notrandom-data.js
// (figures/notrandom_data.py: dominant eigenvector of the next-generation matrix).
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const AGES = ['young', 'middle', 'older'], COL = { young: '#41b6c4', middle: '#2c7fb8', older: '#253494' };
  function start(container) {
    const S = window.SETTINGS, D = window.NOTRANDOM, W = 1150, H = 480;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const face = (x, y, z, o, p) => el('image', { x: x - z / 2, y: y - z / 2, width: z, height: z, href: 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar(o)) }, p);

    // ------------------------------------------------------------ left: compartments by age, coupled
    const RY = [100, 250, 400], FX = 150, CHX = { S: 262, I: 362, R: 462 }, CW = 80, CHH = 56;
    const CC = { S: '#2c7fb8', I: '#e8590c', R: '#8a8a8a' };
    const T = S.Total, sym = (a, b) => (T[a][b] + T[b][a]) / 2, tmax = Math.max(...[0, 1, 2].flatMap(a => [0, 1, 2].map(b => sym(a, b))));
    const gL = el('g', {}), gP = el('g', {}), gC = el('g', {});
    const curves = [];
    for (let a = 0; a < 3; a++) for (let b = a; b < 3; b++) {
      const w = 2 + 15 * (sym(a, b) / tmax);
      const d = a === b
        ? `M${FX - 30},${RY[a] - 14} C${FX - 110},${RY[a] - 58} ${FX - 110},${RY[a] + 58} ${FX - 30},${RY[a] + 14}`
        : `M${FX - 32},${RY[a]} C${FX - 70 - 62 * (b - a)},${RY[a]} ${FX - 70 - 62 * (b - a)},${RY[b]} ${FX - 32},${RY[b]}`;
      const p = el('path', { d, fill: 'none', stroke: '#9cc3dd', 'stroke-width': w, 'stroke-linecap': 'round', opacity: 0.6 }, gL);
      curves.push({ p, w: T[a][b], rev: false }); if (a !== b) curves.push({ p, w: T[b][a], rev: true });
    }
    // the three people start generic, as on the SIR slide, and turn over to reveal their age group
    const flips = AGES.map((age, r) => ({ im: face(FX, RY[r], 62, { generic: true }, gC), cy: RY[r],
      to: 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar({ age, style: r % 2, skin: (r + 1) % 4 })), done: false }));
    AGES.forEach((age, r) => {
      txt(FX, RY[r] + 52, D.groups[r], { 'font-size': 18, fill: '#555', 'text-anchor': 'middle' }, gC);
      ['S', 'I', 'R'].forEach(k => {
        el('rect', { x: CHX[k] - CW / 2, y: RY[r] - CHH / 2, width: CW, height: CHH, rx: 12, fill: '#fff', stroke: CC[k], 'stroke-width': 3 }, gC);
        txt(CHX[k], RY[r] + 10, k, { 'font-size': 28, 'font-weight': 700, fill: CC[k], 'text-anchor': 'middle' }, gC);
      });
    });
    txt(FX - 110, 30, 'who meets whom', { 'font-size': 20, fill: '#777' });

    // ------------------------------------------------------------ right: who gets infected first
    const BX = 690, BW = 330;
    txt(BX - 50, 30, 'share of the first infections', { 'font-size': 24, 'font-weight': 700, fill: '#222' });
    el('rect', { x: BX - 50, y: 46, width: 16, height: 16, rx: 3, fill: '#c5cdd8' }); txt(BX - 28, 60, 'if everyone met everyone', { 'font-size': 20, fill: '#777' });
    ['#41b6c4', '#2c7fb8', '#253494'].forEach((c, i) => el('rect', { x: BX + 210 + i * 7, y: 46, width: 7, height: 16, fill: c })); txt(BX + 236, 60, 'real contacts', { 'font-size': 20, fill: '#777' });
    const bars = [];
    AGES.forEach((age, r) => { const y0 = RY[r] - 26;
      face(BX - 28, y0 + 27, 40, { age, style: r % 2, skin: (r + 1) % 4 });
      [[D.pop[r], '#c5cdd8', 0], [D.real[r], COL[age], 1]].forEach(([v, c, k]) => { const y = y0 + k * 30;
        el('rect', { x: BX, y, width: BW, height: 24, rx: 4, fill: '#f1f3f6' });
        const b = el('rect', { x: BX, y, width: 0, height: 24, rx: 4, fill: c });
        const t = txt(BX + BW + 10, y + 19, '', { 'font-size': 20, fill: k ? '#222' : '#777', 'font-weight': k ? 700 : 400 });
        bars.push({ b, t, v, r }); }); });
    container.innerHTML = ''; container.appendChild(svg);

    const tot = curves.reduce((s, c) => s + c.w, 0);
    let raf = null, last = 0, live = [], t0 = null;
    const e0 = () => performance.now() - (t0 === null ? performance.now() : t0);
    function frame(t) {
      if (t0 === null) t0 = t;
      if (e0() > 2400 && t - last > 900) { last = t; let u = Math.random() * tot, c = curves[0];
        for (const k of curves) { u -= k.w; if (u <= 0) { c = k; break; } } live.push({ c, t0: t }); }
      gP.innerHTML = '';
      live = live.filter(v => { const f = (t - v.t0) / 1100; if (f >= 1) return false;
        const L = v.c.p.getTotalLength(), q = v.c.p.getPointAtLength((v.c.rev ? 1 - f : f) * L);
        el('circle', { cx: q.x, cy: q.y, r: 7, fill: '#e8590c' }, gP); return true; });
      const e = t - t0;
      flips.forEach((f, r) => { const u = Math.max(0, Math.min(1, (e - 300 - r * 350) / 600)), sx = Math.abs(Math.cos(Math.PI * u));
        if (u >= 0.5 && !f.done) { f.im.setAttribute('href', f.to); f.done = true; }
        f.im.setAttribute('transform', `translate(${FX},${f.cy}) scale(${Math.max(sx, 0.02)},1) translate(${-FX},${-f.cy})`); });
      const arcsOn = Math.max(0, Math.min(1, (e - 1700) / 700)); gL.setAttribute('opacity', arcsOn);
      bars.forEach(o => { const u = Math.max(0, Math.min(1, (e - 2600 - o.r * 300) / 700)), s = 1 - Math.pow(1 - u, 3);
        o.b.setAttribute('width', BW * o.v / 0.7 * s); o.t.textContent = u > 0 ? Math.round(o.v * 100 * s) + '%' : ''; });
      raf = requestAnimationFrame(frame);
    }
    return { play() { t0 = null; live = []; flips.forEach(f => { f.done = false; f.im.setAttribute('href', 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar({ generic: true }))); });
                     if (!raf) raf = requestAnimationFrame(frame); }, pause() { cancelAnimationFrame(raf); raf = null; } };
  }
  window.startNotrandom = start;
})();
