// "One pandemic, seen at every level": real COVID-19 curves at four levels on the left, the three
// layers of mixing on the right, all driven by one sweeping time cursor.
//
// Rows (data in js/levels-data.js): United States, New York State, Manhattan (cases per 100k per
// day, 7-day average, each row on its own scale so the SHAPE is comparable), and New York City by
// age group (same scale across the three groups, so their sizes compare). As the cursor sweeps
// March 2020 to November 2021, every curve draws up to it. The Places lens tints the country,
// the state and Manhattan by their current level; the Groups lens fills each age group by its
// current level; the People lens shows contacts flaring with Manhattan's level.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const C = { line: '#2c7fb8', fill: '#c6dbef', young: '#41b6c4', middle: '#2c7fb8', older: '#253494',
              inf: '#e8590c', ink: '#222', soft: '#666', faint: '#d6dce4' };
  function start(container, user) {
    const opt = Object.assign({ sweep: 14000, hold: 2600 }, user || {});
    const D = window.LEVELS, n = D.weeks.length, W = 1150, H = 540;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };

    // ------------------------------------------------------------ left: four rows of curves
    const X0 = 175, X1 = 690, RH = 88, GAP = 30, Y0 = 44;
    const xs = i => X0 + (i / (n - 1)) * (X1 - X0);
    const defs = el('defs', {}), clipR = el('rect', { x: X0, y: 0, width: 0, height: H }, el('clipPath', { id: 'lvclip' }, defs));
    const rows = [
      { name: 'United States', sub: 'cases per 100k', series: [['us', C.line]] },
      { name: 'New York State', sub: 'cases per 100k', series: [['ny', C.line]] },
      { name: 'Manhattan', sub: 'cases per 100k', series: [['mn', C.line]] },
      { name: 'New York City', sub: 'by age group', series: [['young', C.young], ['middle', C.middle], ['older', C.older]], age: true },
    ];
    const ageMax = Math.max(...Object.values(D.age).flat());
    rows.forEach((r, k) => {
      const y0 = Y0 + k * (RH + GAP), yb = y0 + RH;
      txt(0, y0 + 30, r.name, { 'font-size': 23, 'font-weight': 700, fill: C.ink });
      txt(0, y0 + 56, r.sub, { 'font-size': 19, fill: C.soft });
      el('line', { x1: X0, y1: yb, x2: X1, y2: yb, stroke: C.faint, 'stroke-width': 1.5 });
      const g = el('g', { 'clip-path': 'url(#lvclip)' });
      r.series.forEach(([key, col]) => {
        const v = r.age ? D.age[key] : D[key], m = r.age ? ageMax : Math.max(...v);
        const pts = v.map((y, i) => [xs(i), yb - (y / m) * (RH - 6)]);
        if (!r.age) el('path', { d: `M${X0},${yb} ` + pts.map(p => `L${p[0]},${p[1]}`).join(' ') + ` L${X1},${yb} Z`, fill: C.fill, opacity: 0.8 }, g);
        el('polyline', { points: pts.map(p => p.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': r.age ? 3.4 : 3,
                         'stroke-linejoin': 'round' }, g);
      });
      if (r.age) [['18 to 44', C.young], ['45 to 64', C.middle], ['65 and over', C.older]].forEach(([s, col], j) =>
        txt(X0 + 8 + j * 118, y0 - 6, s, { 'font-size': 18, 'font-weight': 700, fill: col }));
    });
    const axY = Y0 + 4 * (RH + GAP) - GAP + 26;
    [['Mar 2020', 0], ['Jan 2021', D.weeks.findIndex(w => w >= '2021-01-01')], ['Nov 2021', n - 1]].forEach(([s, i], j) =>
      txt(xs(i), axY, s, { 'font-size': 18, fill: C.soft, 'text-anchor': j === 0 ? 'start' : j === 2 ? 'end' : 'middle' }));
    const cur = el('line', { y1: Y0 - 18, y2: axY - 22, stroke: '#444', 'stroke-width': 1.6, 'stroke-dasharray': '3 4' });
    const curDate = txt(0, Y0 - 22, '', { 'font-size': 17, 'font-weight': 700, fill: '#444', 'text-anchor': 'middle' });

    // ------------------------------------------------------------ right: the three lenses
    const LX = 830, LR = 76, LY = [92, 282, 462];
    // brackets: rows 1-3 belong to the Places layer, row 4 to the Groups layer
    const bx = X1 + 22, ry = k => Y0 + k * (RH + GAP);
    el('path', { d: `M${bx - 8},${ry(0) + 6} H${bx} V${ry(2) + RH} H${bx - 8} M${bx},${(ry(0) + ry(2) + RH) / 2} L${LX - LR - 6},${LY[0]}`,
                 fill: 'none', stroke: '#b9c3d0', 'stroke-width': 1.8 });
    el('path', { d: `M${bx - 8},${ry(3) + 6} H${bx} V${ry(3) + RH} H${bx - 8} M${bx},${ry(3) + RH / 2} L${LX - LR - 6},${LY[1]}`,
                 fill: 'none', stroke: '#b9c3d0', 'stroke-width': 1.8 });
    const lens = (k, strong) => {
      const c = el('clipPath', { id: 'lv' + k }, defs); el('circle', { cx: LX, cy: LY[k], r: LR - 2 }, c);
      el('circle', { cx: LX, cy: LY[k], r: LR, fill: '#f6f8fa' });
      const g = el('g', { 'clip-path': `url(#lv${k})` });
      return [g, () => el('circle', { cx: LX, cy: LY[k], r: LR, fill: 'none', stroke: strong ? C.older : '#c5cdd8', 'stroke-width': strong ? 4.5 : 2.4 })];
    };
    const LAB = [['Places', 'mixing: travel'], ['Groups', 'mixing: who meets whom'], ['People', 'mixing: contacts']];
    LAB.forEach(([a, b], k) => { txt(LX + LR + 20, LY[k] - 4, a, { 'font-size': 26, 'font-weight': 700, fill: k === 1 ? C.older : C.ink });
                                 txt(LX + LR + 20, LY[k] + 24, b, { 'font-size': 19, fill: C.soft }); });
    // Places: the country, New York State and Manhattan, tinted by their current level
    const [gP, ringP] = lens(0), L = D.lens, sc = (2 * LR) / L.w * 0.98;
    const gm = el('g', { transform: `translate(${LX - L.w * sc / 2},${LY[0] - L.h * sc / 2}) scale(${sc})` }, gP);
    const usP = el('path', { d: L.nation, fill: '#e3e8ee' }, gm), nyP = el('path', { d: L.ny, fill: '#e3e8ee', stroke: '#fff', 'stroke-width': 1.2 }, gm);
    const mnD = el('circle', { cx: L.manhattan[0], cy: L.manhattan[1], r: 4, fill: C.inf, stroke: '#fff', 'stroke-width': 1.2 }, gm);
    ringP();
    // Groups: three age groups, each filling by its current level
    const [gG, ringG] = lens(1, true), GP = [[-30, -22, 'young'], [32, -16, 'middle'], [0, 32, 'older']];
    const bub = GP.map(([dx, dy, age], j) => {
      const b = el('circle', { cx: LX + dx, cy: LY[1] + dy, r: 27, fill: '#fff', stroke: C[age], 'stroke-width': 3.5 }, gG);
      el('image', { x: LX + dx - 17, y: LY[1] + dy - 17, width: 34, height: 34,
        href: 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar({ age, style: j % 2, skin: j, ring: false })) }, gG);
      return b;
    });
    ringG();
    el('rect', { x: LX - 54, y: LY[1] - LR - 20, width: 108, height: 30, rx: 15, fill: C.older });
    txt(LX, LY[1] - LR + 1, 'this talk', { 'font-size': 18, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' });
    // People: a handful of contacts, flaring with Manhattan's level
    const [gQ, ringQ] = lens(2), PP = [[-44, -30], [6, -46], [48, -18], [-50, 22], [-6, 6], [40, 32], [-14, 50]];
    [[0, 1], [1, 2], [0, 4], [1, 4], [2, 5], [3, 4], [4, 5], [3, 6], [4, 6], [5, 6]].forEach(([a, b]) =>
      el('line', { x1: LX + PP[a][0], y1: LY[2] + PP[a][1], x2: LX + PP[b][0], y2: LY[2] + PP[b][1], stroke: C.faint, 'stroke-width': 2 }, gQ));
    const pf = PP.map(([dx, dy], j) => { const o = { age: ['young', 'middle', 'older'][j % 3], style: j % 2, skin: j % 4 };
      return { o, im: el('image', { x: LX + dx - 18, y: LY[2] + dy - 18, width: 36, height: 36 }, gQ), st: '' }; });
    ringQ();
    const href = (o, st) => 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar(Object.assign({ state: st }, o)));
    container.innerHTML = ''; container.appendChild(svg);

    // ------------------------------------------------------------ the sweep
    const mix = (a, t) => { const p = h => [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16)), x = p('#e3e8ee'), y = p(a);
      return `rgb(${x.map((v, k) => Math.round(v + (y[k] - v) * Math.min(1, t))).join(',')})`; };
    const mus = Math.max(...D.us), mny = Math.max(...D.ny), mmn = Math.max(...D.mn);
    let t0 = null, raf = null, lastPeople = 0;
    function frame(t) {
      if (t0 === null) t0 = t;
      const e = (t - t0) % (opt.sweep + opt.hold), u = Math.min(1, e / opt.sweep), i = Math.round(u * (n - 1));
      const x = xs(i);
      clipR.setAttribute('width', x - X0 + 1); cur.setAttribute('x1', x); cur.setAttribute('x2', x);
      curDate.setAttribute('x', x); curDate.textContent = new Date(D.weeks[i]).toLocaleString('en-US', { month: 'short', year: 'numeric' });
      usP.setAttribute('fill', mix('#f3b48f', D.us[i] / mus)); nyP.setAttribute('fill', mix('#e8590c', D.ny[i] / mny));
      mnD.setAttribute('r', 3 + 9 * D.mn[i] / mmn);
      GP.forEach(([, , age], j) => bub[j].setAttribute('fill', mix('#e8590c', D.age[age][i] / ageMax).replace('rgb(227,232,238)', '#fff')));
      if (t - lastPeople > 450) {                            // People: a share of faces infected, tracking Manhattan
        lastPeople = t; const share = 0.85 * D.mn[i] / mmn;
        pf.forEach(f => { const st = Math.random() < share ? 'I' : 'S'; if (st !== f.st) { f.st = st; f.im.setAttribute('href', href(f.o, st)); } });
      }
      raf = requestAnimationFrame(frame);
    }
    return { play() { if (!raf) { t0 = null; raf = requestAnimationFrame(frame); } }, pause() { cancelAnimationFrame(raf); raf = null; } };
  }
  window.startLevels = start;
})();
