// "A model, built layer by layer": the multilayer (lasagna) picture of a metapopulation model.
//
// It opens on the familiar SIR boxes, flat and full size (js/sir.js, running live). The SIR then tilts
// into the bottom plane of a stack. A second plane drops in above it: the metapopulation network, one
// node per city, each node a small S / I / R pie, nodes linked by travel; dashed lines run from one
// node down to the SIR plane ("each node is one of these"). A third plane drops in on top: the real
// US map with its flight links (js/usmap-data.js, the 14 metros of the early slides), joined to the
// nodes below by dashed lines, as in a multilayer-network figure. Then one outbreak, seeded in New
// York, spreads through the top two layers together while the SIR keeps running underneath.
//
// Planes are drawn with an affine (oblique) projection: plane point (x, y) at height z goes to
// (X0 + A x + C y, Y0 + D y - z). Animating the six matrix entries turns the flat SIR into a plane,
// and inter-layer lines are projected with the same map, so they stay attached exactly.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const LINKS = [['New York','Boston'],['New York','Washington'],['New York','Chicago'],['New York','Miami'],
    ['New York','Los Angeles'],['New York','Atlanta'],['Chicago','Minneapolis'],['Chicago','Denver'],
    ['Chicago','Atlanta'],['Chicago','Dallas'],['Los Angeles','San Francisco'],['Los Angeles','Phoenix'],
    ['San Francisco','Seattle'],['Seattle','Denver'],['Denver','Dallas'],['Dallas','Houston'],
    ['Dallas','Atlanta'],['Atlanta','Miami'],['Washington','Atlanta'],['Houston','Phoenix'],['San Francisco','Denver']];
  const PW = 1150, PH = 565;                                   // every plane's own coordinates
  const A = 0.60, C = 0.30, D = 0.29, X0 = 30, Y0 = 368, GAP = 172;
  const SIR_Y = 132, SIR_H = 300;                              // the SIR content's place inside its plane
  function start(container, user) {
    const opt = Object.assign({ flat: 2600, tilt: 1700, drop: 1300, gap2: 700, gap3: 700, zooDelay: 1600, tick: 120, beta: 0.45, gamma: 0.15, travel: 0.06, pause: 2400 }, user || {});
    const M = window.USMAP, W = 1150, H = 545;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const proj = (x, y, z) => [X0 + A * x + C * y, Y0 + D * y - z];
    const mat = (z) => `matrix(${A},0,${C},${D},${X0},${Y0 - z})`;
    const plane = (p, fill, stroke) => el('rect', { x: 0, y: 0, width: PW, height: PH, rx: 40, fill, stroke, 'stroke-width': 4 }, p);
    const ease = u => u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2, cl = u => Math.max(0, Math.min(1, u));

    // ------------------------------------------------------------ layer 1: the SIR, starting flat
    const L1 = el('g', {}), L1bg = plane(L1, '#eef3f8', '#c9d6e3');
    const sirHost = el('g', {}, L1);
    const sir = window.startSIR(sirHost, { H: SIR_H });
    const sirSvg = sirHost.querySelector('svg');
    ['x', 'y', 'width', 'height'].forEach((k, i) => sirSvg.setAttribute(k, [0, SIR_Y, PW, SIR_H][i]));

    // ------------------------------------------------------------ layer 1, later: the compartmental zoo
    // Once the stack is built the people fade out and the floor cycles through models drawn the usual
    // way, boxes and arrows: SIR, SEIR, SEIRS, and one with a latent stage, asymptomatic and
    // hospitalised branches and a vaccinated stratum (after Ankit's sketch of a full model).
    const BOXC = { S: ['#e7f0f8', '#2c7fb8'], E: ['#fdf0e2', '#e39a5a'], I: ['#fde4d6', '#e8590c'], H: ['#f6d2c0', '#b9470a'],
                   R: ['#eeeeee', '#8a8a8a'] };
    const box = (g, x, y, w, h, kind, label, sub) => {
      const [f, s] = BOXC[kind]; el('rect', { x, y, width: w, height: h, rx: 18, fill: f, stroke: s, 'stroke-width': 7 }, g);
      const t = txt(x + w / 2, y + h / 2 + 34, label, { 'font-size': 100, 'font-weight': 700, fill: s, 'text-anchor': 'middle' }, g);
      if (sub) { const ts = document.createElementNS(NS, 'tspan'); ts.setAttribute('font-size', 56); ts.setAttribute('dy', 18); ts.textContent = sub; t.appendChild(ts); }
      return [x, y, w, h]; };
    const arrow = (g, d, dashed) => { el('path', { d, fill: 'none', stroke: '#555', 'stroke-width': 7, 'stroke-dasharray': dashed ? '22 16' : 'none',
      'marker-end': 'url(#lzArrow)' }, g); };
    const defs = el('defs', {}), mk = el('marker', { id: 'lzArrow', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 4, markerHeight: 4, orient: 'auto' }, defs);
    el('path', { d: 'M0,0 L10,5 L0,10 Z', fill: '#555' }, mk);
    const chain = (g, kinds, labels, y, h, x0, w, gap) => kinds.map((k, i) => { const x = x0 + i * (w + gap); box(g, x, y, w, h, k, labels[i]);
      if (i) arrow(g, `M${x - gap + 8},${y + h / 2} H${x - 10}`); return x; });
    const zoo = [];
    { const g = el('g', { opacity: 0 }, L1); chain(g, ['S', 'I', 'R'], ['S', 'I', 'R'], 190, 190, 110, 230, 150); zoo.push([g, 'SIR', 'susceptible, infected, recovered']); }
    { const g = el('g', { opacity: 0 }, L1); chain(g, ['S', 'E', 'I', 'R'], ['S', 'E', 'I', 'R'], 190, 190, 60, 190, 115); zoo.push([g, 'SEIR', 'plus an exposed stage']); }
    { const g = el('g', { opacity: 0 }, L1); const xs = chain(g, ['S', 'E', 'I', 'R'], ['S', 'E', 'I', 'R'], 130, 190, 60, 190, 115);
      arrow(g, `M${xs[3] + 95},${130 + 190 + 10} C${xs[3] + 95},${520} ${xs[0] + 95},${520} ${xs[0] + 95},${130 + 190 + 16}`, true);
      zoo.push([g, 'SEIRS', 'immunity wanes']); }
    { const g = el('g', { opacity: 0 }, L1);
      [[24, ''], [300, 'v']].forEach(([y, v]) => {
        const S = box(g, 40, y + 40, 150, 140, 'S', 'S', v), Lb = box(g, 270, y + 40, 150, 140, 'E', 'L', v);
        const Is = box(g, 500, y, 150, 110, 'I', 'I', 's' + v), Ia = box(g, 500, y + 120, 150, 110, 'I', 'I', 'a' + v);
        const Hb = box(g, 730, y, 150, 110, 'H', 'H', v), Rb = box(g, 960, y + 40, 150, 140, 'R', 'R', v);
        arrow(g, `M${190 + 8},${y + 110} H${270 - 10}`);
        arrow(g, `M${420 + 8},${y + 90} L${500 - 10},${y + 55}`); arrow(g, `M${420 + 8},${y + 130} L${500 - 10},${y + 175}`);
        arrow(g, `M${650 + 8},${y + 55} H${730 - 10}`); arrow(g, `M${880 + 8},${y + 60} L${960 - 10},${y + 90}`);
        arrow(g, `M${650 + 8},${y + 175} L${960 - 10},${y + 140}`); });
      arrow(g, `M115,${24 + 180 + 10} V${300 + 40 - 14}`, true);
      zoo.push([g, 'richer models', 'hospital, vaccination, ...']); }

    // ------------------------------------------------------------ layer 2: the metapopulation network
    const city = M.cities.map(c => Object.assign({}, c));
    const idx = Object.fromEntries(city.map((c, i) => [c.name, i]));
    const links = LINKS.map(([a, b]) => [idx[a], idx[b]]);
    const L2 = el('g', { opacity: 0 }); plane(L2, '#eef6f3', '#c4ddd3');
    links.forEach(([i, j]) => el('line', { x1: city[i].x, y1: city[i].y, x2: city[j].x, y2: city[j].y, stroke: '#7fa9a0', 'stroke-width': 5 }, L2));
    const pie = city.map(c => { const g = el('g', {}, L2), r = 20 + 3 * Math.sqrt(c.pop);
      el('circle', { cx: c.x, cy: c.y, r: r + 4, fill: '#fff' }, g);
      return { g, r, x: c.x, y: c.y, parts: ['#2c7fb8', '#e8590c', '#9a9a9a'].map(f => el('path', { fill: f }, g)) }; });
    const drawPie = (k, s, i, r) => { const P = pie[k], fr = [s, i, r]; let a0 = -Math.PI / 2;
      P.parts.forEach((p, q) => { const a1 = a0 + 2 * Math.PI * fr[q];
        if (fr[q] >= 0.999) p.setAttribute('d', `M${P.x - P.r},${P.y} a${P.r},${P.r} 0 1,0 ${2 * P.r},0 a${P.r},${P.r} 0 1,0 ${-2 * P.r},0`);
        else if (fr[q] <= 0.001) p.setAttribute('d', '');
        else p.setAttribute('d', `M${P.x},${P.y} L${P.x + P.r * Math.cos(a0)},${P.y + P.r * Math.sin(a0)} A${P.r},${P.r} 0 ${a1 - a0 > Math.PI ? 1 : 0},1 ${P.x + P.r * Math.cos(a1)},${P.y + P.r * Math.sin(a1)} Z`);
        a0 = a1; }); };

    // ------------------------------------------------------------ layer 3: the US map with flights
    const L3 = el('g', { opacity: 0 }); plane(L3, '#f6f7f9', '#d6dbe2');
    el('path', { d: M.nation, fill: '#dfe5ec', stroke: '#c9d1db', 'stroke-width': 2 }, L3);
    el('path', { d: M.states, fill: 'none', stroke: '#fff', 'stroke-width': 2 }, L3);
    links.forEach(([i, j]) => { const a = city[i], b = city[j], mx = (a.x + b.x) / 2 - (b.y - a.y) * 0.14, my = (a.y + b.y) / 2 + (b.x - a.x) * 0.14;
      el('path', { d: `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`, fill: 'none', stroke: '#9fb3c8', 'stroke-width': 3 }, L3); });
    const dot = city.map(c => el('circle', { cx: c.x, cy: c.y, r: 12 + 3 * Math.sqrt(c.pop), fill: '#fff', stroke: '#253494', 'stroke-width': 5 }, L3));

    // ------------------------------------------------------------ inter-layer links and labels
    const gLinks = el('g', {});
    const cone = el('g', { opacity: 0 }, gLinks), vert = el('g', { opacity: 0 }, gLinks);
    const ny = idx['New York'];
    [[20, SIR_Y + 30], [PW - 20, SIR_Y + 30], [PW - 20, SIR_Y + SIR_H - 10], [20, SIR_Y + SIR_H - 10]].forEach(([x, y]) => {
      const [x1, y1] = proj(city[ny].x, city[ny].y, GAP), [x2, y2] = proj(x, y, 0);
      el('line', { x1, y1, x2, y2, stroke: '#444', 'stroke-width': 1.5, 'stroke-dasharray': '5 5', opacity: 0.6 }, cone); });
    city.forEach(c => { const [x1, y1] = proj(c.x, c.y, 2 * GAP), [x2, y2] = proj(c.x, c.y, GAP);
      el('line', { x1, y1, x2, y2, stroke: '#555', 'stroke-width': 1.3, 'stroke-dasharray': '4 5', opacity: 0.55 }, vert); });
    const LX = 935, lab = (z, a, b) => { const g = el('g', { opacity: 0 }), y = Y0 + D * PH / 2 - z;
      g.t1 = txt(LX, y - 4, a, { 'font-size': 24, 'font-weight': 700, fill: '#222' }, g); g.t2 = txt(LX, y + 22, b, { 'font-size': 20, fill: '#777' }, g); return g; };
    const lab1 = lab(0, 'people', 'susceptible, infected, recovered');
    const lab2 = lab(GAP, 'cities', 'each runs the model below');
    const lab3 = lab(2 * GAP, 'the real network', 'flights between US metros');
    svg.insertBefore(L3, gLinks); svg.insertBefore(L2, L3);   // paint order: L1, L2, L3, then the links on top
    container.innerHTML = ''; container.appendChild(svg);
    // every model diagram is scaled and centred to fit its plane with an even margin (measured once
    // drawn, in the plane's own coordinates), so a richer model never runs off the floor
    zoo.forEach(([g]) => { const b = g.getBBox(), M = 46, w = PW - 2 * M, h = PH - 2 * M, s = Math.min(w / b.width, h / b.height);
      g.setAttribute('transform', `translate(${M + (w - b.width * s) / 2 - b.x * s},${M + (h - b.height * s) / 2 - b.y * s}) scale(${s})`); });

    // ------------------------------------------------------------ the metapopulation outbreak (layers 2 and 3)
    let S, I, R, timer = null, done = false;
    function reset() { S = city.map(() => 1); I = city.map(() => 0); R = city.map(() => 0); I[ny] = 0.02; S[ny] = 0.98; done = false; paint(); }
    function paint() { city.forEach((c, k) => { drawPie(k, S[k], I[k], R[k]);
      const g = Math.min(1, I[k] / 0.2), rec = R[k] > 0.5 && I[k] < 0.02;
      dot[k].setAttribute('fill', rec ? '#d4d4d4' : `rgb(${Math.round(255 - 23 * g)},${Math.round(255 - 166 * g)},${Math.round(255 - 243 * g)})`);
      dot[k].setAttribute('stroke', I[k] > 0.01 ? '#e8590c' : (rec ? '#9a9a9a' : '#253494')); }); }
    function step() {
      if (done) return;
      const nI = I.slice();
      city.forEach((c, k) => { const inf = opt.beta * S[k] * I[k], rec = opt.gamma * I[k];
        S[k] -= inf; nI[k] = I[k] + inf - rec; R[k] += rec; if (nI[k] < 1e-3 && I[k] > 0) { R[k] += nI[k]; nI[k] = 0; } });
      links.forEach(([i, j]) => [[i, j], [j, i]].forEach(([a, b]) => { if (I[a] > 0.01 && S[b] > 0.99 && Math.random() < opt.travel * I[a] * 8) { nI[b] = 0.01; S[b] -= 0.01; } }));
      I = nI; paint();
      if (!I.some(v => v > 0)) { done = true; setTimeout(() => { reset(); }, opt.pause); }
    }
    reset();

    // ------------------------------------------------------------ the build
    // T1 tilt starts, T2 cities drop, T4 the map drops, T6 the outbreak starts, T6 + zooDelay the models cycle
    const T1 = opt.flat, T2 = T1 + opt.tilt, T3 = T2 + opt.drop, T4 = T3 + opt.gap2, T5 = T4 + opt.drop, T6 = T5 + opt.gap3;
    let t0 = null, raf = null;
    function frame(t) {
      if (t0 === null) t0 = t;
      const e = t - t0;
      // flat SIR (identity, content centred) easing into the bottom plane's oblique matrix
      const u = ease(cl((e - T1) / opt.tilt)), lerp = (p, q) => p + (q - p) * u;
      L1.setAttribute('transform', `matrix(${lerp(1, A)},0,${lerp(0, C)},${lerp(1, D)},${lerp(0, X0)},${lerp(-2, Y0)})`);
      L1bg.setAttribute('opacity', u);
      lab1.setAttribute('opacity', cl((e - T2 + 300) / 500));
      const d2 = ease(cl((e - T2) / opt.drop)), d3 = ease(cl((e - T4) / opt.drop));
      L2.setAttribute('opacity', d2); L2.setAttribute('transform', mat(GAP + 90 * (1 - d2)));
      lab2.setAttribute('opacity', d2); cone.setAttribute('opacity', cl((e - T3) / 600));
      L3.setAttribute('opacity', d3); L3.setAttribute('transform', mat(2 * GAP + 90 * (1 - d3)));
      lab3.setAttribute('opacity', d3); vert.setAttribute('opacity', cl((e - T5) / 600));
      if (e >= T6 && !timer) timer = setInterval(step, opt.tick);
      const z = e - T6 - opt.zooDelay, ZOO = 3300, XF = 600;
      sirSvg.setAttribute('opacity', 1 - cl(z / XF));
      if (z < 0) { zoo.forEach(([g]) => g.setAttribute('opacity', 0)); lab1.t1.textContent = 'people'; lab1.t2.textContent = 'susceptible, infected, recovered'; }
      else { const k = Math.floor(z / ZOO) % zoo.length, f = z % ZOO, H2 = XF / 2;   // out, then in: never two diagrams at once
        zoo.forEach(([g], i) => g.setAttribute('opacity', i === k ? cl((f - H2) / H2) : (i === (k + zoo.length - 1) % zoo.length && z >= ZOO ? 1 - cl(f / H2) : 0)));
        lab1.t1.textContent = zoo[k][1]; lab1.t2.textContent = zoo[k][2]; }
      raf = requestAnimationFrame(frame);
    }
    // the build replays from the flat SIR every time the slide is entered
    return { play() { sir.play(); clearInterval(timer); timer = null; reset(); t0 = null; if (!raf) raf = requestAnimationFrame(frame); },
             pause() { sir.pause(); cancelAnimationFrame(raf); raf = null; clearInterval(timer); timer = null; } };
  }
  window.startLasagna = start;
})();
